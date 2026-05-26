"""
Agenda personal — Mundialito 2026 Hub.

El PDF exige:
  - "se construye una agenda personal y un 'feed' que prioriza lo relevante".
  - "Si el usuario viaja, el sistema lo acompaña con recordatorios contextuales
     (zona horaria, ventanas de acceso y alertas antes del partido)".

Este módulo:
  - Calcula la agenda para un usuario dado (filtro por favoriteTeams y city).
  - Provee el job APScheduler que envía recordatorios pre-partido.
"""

from datetime import datetime, timezone, timedelta

from db.database import SessionLocal
from db.models   import Match, User, AuditLog
from db.matches_data       import _to_dict as match_to_dict
from db.notifications_data import notify_user
from core.config import AGENDA_REMINDER_MINUTES_BEFORE_KICKOFF
from core.logger import log


# ─── Helpers de relevancia ───────────────────────────────────────────────────

def _build_reasons(match: Match, fav_set: set[str], city: str) -> list[dict]:
    """Devuelve la lista de razones por las que este partido aparece en la agenda."""
    reasons: list[dict] = []
    if match.home in fav_set:
        reasons.append({"kind": "favorite_home", "label": f"Tu favorito: {match.home}"})
    if match.away in fav_set:
        reasons.append({"kind": "favorite_away", "label": f"Tu favorito: {match.away}"})
    if city and match.city and city.lower().strip() == match.city.lower().strip():
        reasons.append({"kind": "same_city", "label": f"En tu ciudad ({match.city})"})
    return reasons


def _priority(reasons: list[dict]) -> int:
    """Mayor prioridad = aparece primero. Favoritos pesan más que ciudad."""
    score = 0
    for r in reasons:
        if r["kind"].startswith("favorite_"):
            score += 100
        elif r["kind"] == "same_city":
            score += 30
    return score


# ─── Agenda del usuario ──────────────────────────────────────────────────────

def get_agenda(email: str, include_finished: bool = False) -> list[dict]:
    """
    Devuelve los partidos relevantes para el usuario, ordenados por:
      1) Próximos primero (kickoff ascendente).
      2) Status `live` siempre arriba.
    Sólo incluye matches con al menos una razón de relevancia.

    Cada item incluye:
      - todos los campos del DTO de match (incluye locksAt, dataFreshness).
      - `reasons`: list[dict]
      - `priority`: int
    """
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return []

        fav_set = {(t or "").upper() for t in (user.favorite_teams or []) if t}
        city    = user.city or ""

        if not fav_set and not city:
            # Sin preferencias: fallback a los próximos 6 matches global
            q = db.query(Match)
            if not include_finished:
                q = q.filter(Match.status != "final")
            return [
                {**match_to_dict(m), "reasons": [], "priority": 0}
                for m in q.order_by(Match.kickoff).limit(6).all()
            ]

        q = db.query(Match)
        if not include_finished:
            q = q.filter(Match.status != "final")
        all_matches = q.order_by(Match.kickoff).all()

        items: list[dict] = []
        for m in all_matches:
            reasons = _build_reasons(m, fav_set, city)
            if not reasons:
                continue
            items.append({
                **match_to_dict(m),
                "reasons":  reasons,
                "priority": _priority(reasons),
            })

        # Live arriba del todo
        items.sort(key=lambda it: (
            0 if it["status"] in ("live", "halftime") else 1,
            -it["priority"],
            it.get("kickoff") or "",
        ))
        return items


# ─── Job: recordatorio pre-partido ───────────────────────────────────────────

def send_agenda_reminders() -> int:
    """
    Para cada partido `upcoming` cuyo kickoff cae dentro de la próxima ventana
    [now, now + AGENDA_REMINDER_MINUTES_BEFORE_KICKOFF] y aún no se notificó:
      - Notifica a usuarios con alguno de los equipos en favoriteTeams,
        o con la ciudad del match en su perfil.
    Idempotente vía `AuditLog.correlation_id = "agenda_<match_id>"`.
    """
    now    = datetime.now(timezone.utc)
    window = timedelta(minutes=AGENDA_REMINDER_MINUTES_BEFORE_KICKOFF)
    sent   = 0

    with SessionLocal() as db:
        candidates = (
            db.query(Match)
            .filter(
                Match.status == "upcoming",
                Match.kickoff > now,
                Match.kickoff <= now + window,
            )
            .all()
        )

        for m in candidates:
            cid = f"agenda_{m.id}"
            already = db.query(AuditLog).filter(AuditLog.correlation_id == cid).first()
            if already:
                continue

            # Usuarios con alguno de los dos equipos como favorito,
            # o con la misma ciudad. Filtro client-side por simplicidad.
            users = db.query(User).filter(User.status == "active").all()
            recipients: list[User] = []
            for u in users:
                favs = {(t or "").upper() for t in (u.favorite_teams or []) if t}
                same_city = bool(u.city and m.city and
                                 u.city.lower().strip() == m.city.lower().strip())
                if m.home in favs or m.away in favs or same_city:
                    recipients.append(u)

            mins_left = max(1, int((m.kickoff - now).total_seconds() // 60))
            for u in recipients:
                favs = {(t or "").upper() for t in (u.favorite_teams or []) if t}
                if m.home in favs:
                    team = m.home
                elif m.away in favs:
                    team = m.away
                else:
                    team = None

                if team:
                    title = f"{team} juega en ~{mins_left} min"
                    body  = (
                        f"{m.home} vs {m.away} · {m.phase} · {m.stadium}, {m.city}. "
                        f"No te lo pierdas."
                    )
                else:
                    title = f"Partido en {m.city} en ~{mins_left} min"
                    body  = f"{m.home} vs {m.away} · {m.stadium}."

                notify_user(
                    user_id=u.id,
                    category="match_change",  # mapea a preferencia 'reminders'
                    title=title,
                    body=body,
                    link=f"/match/{m.id}",
                    correlation_id=cid,
                    meta={
                        "matchId":  m.id,
                        "kickoff":  m.kickoff.isoformat(),
                        "minsLeft": mins_left,
                        "team":     team,
                    },
                )
                sent += 1

            # Marcar partido como ya notificado (idempotencia)
            db.add(AuditLog(
                action="agenda.reminder_dispatched",
                level="INFO",
                correlation_id=cid,
                details={"matchId": m.id, "recipients": len(recipients)},
            ))
            db.commit()

    if sent:
        log.info("agenda.reminders_sent", count=sent)
    return sent
