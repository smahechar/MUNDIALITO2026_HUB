"""
Capa de acceso a predicciones — PostgreSQL via SQLAlchemy.
Incluye el cálculo automático de puntos cuando un partido finaliza.
"""

from datetime import datetime, timezone, timedelta
from db.database import SessionLocal
from db.models import Prediction, PoolMember, Match, User
from db.notifications_data import notify_user
from core.config import (
    PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF,
    PREDICTION_REMINDER_MINUTES_BEFORE_KICKOFF,
)

# ─── Reglas de puntuación ─────────────────────────────────────────────────────
PTS_EXACT  = 30   # marcador exacto
PTS_DIFF   = 15   # diferencia de goles exacta
PTS_WINNER = 10   # ganador o empate correcto
PTS_MISS   = 0


def _calc_kind_and_pts(pred_home: int, pred_away: int,
                       real_home: int, real_away: int,
                       double_down: bool = False) -> tuple[str, int]:
    """
    Retorna (kind, pts) para una predicción contra el resultado real.
    kind: "exact" | "diff" | "winner" | "miss"
    """
    if pred_home == real_home and pred_away == real_away:
        kind, base_pts = "exact", PTS_EXACT
    elif (pred_home - pred_away) == (real_home - real_away):
        kind, base_pts = "diff", PTS_DIFF
    elif _winner(pred_home, pred_away) == _winner(real_home, real_away):
        kind, base_pts = "winner", PTS_WINNER
    else:
        kind, base_pts = "miss", PTS_MISS

    pts = base_pts * 2 if double_down and base_pts > 0 else base_pts
    return kind, pts


def _winner(h: int, a: int) -> str:
    """'home' | 'away' | 'draw'"""
    if h > a:
        return "home"
    if a > h:
        return "away"
    return "draw"


def compute_locks_at(kickoff: datetime | None) -> datetime | None:
    """
    Momento en que se cierran ediciones del pronóstico para un partido.
    None si el partido no tiene kickoff definido.
    """
    if not kickoff:
        return None
    return kickoff - timedelta(minutes=PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF)


def is_locked(match: Match) -> bool:
    """True si el match ya no acepta cambios de pronóstico."""
    if not match:
        return True
    if match.status in ("live", "halftime", "final"):
        return True
    locks_at = compute_locks_at(match.kickoff)
    if locks_at and datetime.now(timezone.utc) >= locks_at:
        return True
    return False


# ─── Conversión ───────────────────────────────────────────────────────────────

def _to_dict(p: Prediction, locks_at: datetime | None = None) -> dict:
    return {
        "id":         p.id,
        "matchId":    p.match_id,
        "home":       p.home,
        "away":       p.away,
        "doubleDown": p.double_down,
        "pts":        p.pts,
        "kind":       p.kind,
        "status":     p.status,
        "currentPts": p.pts or 0,
        "locksAt":    locks_at.isoformat() if locks_at else None,
    }


# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_user_predictions(email: str) -> list:
    """SELECT * FROM predictions JOIN matches ON ... WHERE users.email = :email"""
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return []
        rows = (
            db.query(Prediction, Match)
            .join(Match, Prediction.match_id == Match.id)
            .filter(Prediction.user_id == user.id)
            .order_by(Match.kickoff)
            .all()
        )
        return [_to_dict(p, compute_locks_at(m.kickoff)) for p, m in rows]


def get_prediction(email: str, match_id: str) -> dict | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        row = (
            db.query(Prediction, Match)
            .join(Match, Prediction.match_id == Match.id)
            .filter(Prediction.user_id == user.id, Prediction.match_id == match_id)
            .first()
        )
        if not row:
            return None
        p, m = row
        return _to_dict(p, compute_locks_at(m.kickoff))


def get_timeline(email: str) -> list:
    """
    SELECT phase_group, SUM(pts), SUM(pts) running_total
    FROM predictions JOIN matches ON ...
    WHERE users.email = :email AND predictions.status = 'scored'
    GROUP BY phase_group ORDER BY ...
    """
    _PHASES = ["MD1", "MD2", "MD3", "MD4", "MD5", "R16", "QF", "SF", "F"]

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return [{"md": ph, "pts": 0, "total": 0, "pending": False, "future": True} for ph in _PHASES]

        preds = (
            db.query(Prediction, Match)
            .join(Match, Prediction.match_id == Match.id)
            .filter(Prediction.user_id == user.id, Prediction.status == "scored")
            .all()
        )

    # Agrupar por MD (extraer de phase, e.g. "Group A · MD2" → "MD2")
    phase_pts: dict[str, int] = {ph: 0 for ph in _PHASES}
    for pred, match in preds:
        for ph in _PHASES:
            if ph in (match.phase or ""):
                phase_pts[ph] += (pred.pts or 0)
                break

    result = []
    running = 0
    for ph in _PHASES:
        pts = phase_pts.get(ph, 0)
        running += pts
        result.append({
            "md":      ph,
            "pts":     pts,
            "total":   running,
            "pending": False,
            "future":  pts == 0 and running == 0,
        })
    return result


def get_special_picks(email: str) -> dict:
    return {
        "champion": None,
        "runnerUp": None,
        "topScorer": None,
        "darkHorse": None,
    }

def save_prediction(email: str, match_id: str, pick: dict) -> tuple[dict | None, str | None]:
    """
    INSERT INTO predictions (...) ON CONFLICT (user_id, match_id) DO UPDATE SET ...
    Bloquea si el partido ya inicio.
    """
    with SessionLocal() as db:
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            return None, "Partido no encontrado"
        if match.status in ("live", "halftime", "final"):
            return None, "El partido ya inicio, no se pueden registrar predicciones"

        locks_at = compute_locks_at(match.kickoff)
        if locks_at and datetime.now(timezone.utc) >= locks_at:
            return None, (
                f"Pronosticos cerrados — el cierre fue "
                f"{PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF} min antes del kickoff"
            )

        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "Usuario no encontrado"

        home = pick.get("home")
        away = pick.get("away")
        if home is None or away is None:
            return None, "El pronostico debe incluir marcador (home y away)"
        if not isinstance(home, int) or not isinstance(away, int):
            return None, "El marcador debe ser un numero entero"
        if home < 0 or away < 0:
            return None, "El marcador no puede ser negativo"

        pred = db.query(Prediction).filter(
            Prediction.user_id == user.id,
            Prediction.match_id == match_id,
        ).first()

        if pred:
            pred.home        = home
            pred.away        = away
            pred.double_down = bool(pick.get("doubleDown", False))
            pred.updated_at  = datetime.now(timezone.utc)
        else:
            pred = Prediction(
                user_id=user.id,
                match_id=match_id,
                home=home,
                away=away,
                double_down=bool(pick.get("doubleDown", False)),
                status="open",
            )
            db.add(pred)

        db.commit()
        db.refresh(pred)
        return _to_dict(pred, locks_at), None


# ─── Recordatorio antes del cierre ────────────────────────────────────────────

def send_lock_reminders() -> int:
    """
    Job periódico (APScheduler): para cada partido cuyo `locks_at` cae en la
    ventana [now, now + REMINDER_WINDOW_MIN] y aún no envió recordatorio,
    notifica a los usuarios que NO tienen pronóstico (categoria 'reminders').

    Idempotente: usa una columna ad-hoc en `match.h2h` JSON o, más simple,
    consulta `audit_logs` por correlation_id `lockrem_<match_id>`.
    """
    from db.models import AuditLog

    now    = datetime.now(timezone.utc)
    window = timedelta(minutes=PREDICTION_REMINDER_MINUTES_BEFORE_KICKOFF)
    lock_d = timedelta(minutes=PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF)

    sent = 0
    with SessionLocal() as db:
        # Matches que aún no inician y cuyo lock cae en la ventana próxima.
        upcoming = (
            db.query(Match)
            .filter(
                Match.status == "upcoming",
                Match.kickoff > now,
                Match.kickoff - lock_d <= now + window,
            )
            .all()
        )

        for m in upcoming:
            cid = f"lockrem_{m.id}"
            already = db.query(AuditLog).filter(AuditLog.correlation_id == cid).first()
            if already:
                continue  # ya enviado para este match

            # Usuarios miembros de cualquier polla que NO han pronosticado este match
            members = db.query(PoolMember).all()
            user_ids = {pm.user_id for pm in members}
            predicted = {
                p.user_id for p in db.query(Prediction)
                .filter(Prediction.match_id == m.id)
                .all()
            }
            targets = user_ids - predicted

            locks_at = compute_locks_at(m.kickoff)
            mins_left = max(1, int((locks_at - now).total_seconds() // 60))

            for uid in targets:
                notify_user(
                    user_id=uid,
                    category="pool",  # mapea a preferencia 'my_predictions'
                    title=f"Cierra pronostico {m.home} vs {m.away}",
                    body=(
                        f"Quedan ~{mins_left} min para registrar tu pronostico. "
                        f"Cierre {PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF} min antes del kickoff."
                    ),
                    link=f"/predict/{m.id}",
                    correlation_id=cid,
                    meta={"matchId": m.id, "kickoff": m.kickoff.isoformat(), "minsLeft": mins_left},
                )
                sent += 1

            # Marca el match como ya notificado (idempotencia)
            db.add(AuditLog(
                action="prediction.lock_reminder_dispatched",
                level="INFO",
                correlation_id=cid,
                details={"matchId": m.id, "recipients": len(targets)},
            ))
            db.commit()

    return sent


# ─── Cálculo automático al finalizar partido ──────────────────────────────────

def score_predictions_for_match(match_id: str) -> int:
    """
    Calcula y persiste los puntos de TODAS las predicciones de un partido.
    Llamar desde admin router cuando status cambia a 'final'.
    Retorna el número de predicciones procesadas.
    """
    with SessionLocal() as db:
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match or match.status != "final":
            return 0
        if match.home_score is None or match.away_score is None:
            return 0

        preds = db.query(Prediction).filter(
            Prediction.match_id == match_id,
            Prediction.status != "scored",
        ).all()

        notifs = []
        for pred in preds:
            kind, pts = _calc_kind_and_pts(
                pred.home, pred.away,
                match.home_score, match.away_score,
                pred.double_down,
            )
            pred.pts    = pts
            pred.kind   = kind
            pred.status = "scored"

            # Actualizar puntos del miembro en todas las pollas
            # que tengan al usuario
            pool_memberships = db.query(PoolMember).filter(
                PoolMember.user_id == pred.user_id
            ).all()

            for pm in pool_memberships:
                pm.pts += pts
                if kind == "exact":
                    pm.exact  += 1
                    pm.winner += 1
                elif kind in ("diff", "winner"):
                    pm.winner += 1

            notifs.append((pred.user_id, kind, pts, pred.match_id))

        db.commit()

    # Notificar resultado por predicción (fuera de la sesión)
    _LABEL = {
        "exact":  "¡Marcador exacto!",
        "diff":   "Diferencia acertada",
        "winner": "Ganador acertado",
        "miss":   "Predicción fallida",
    }
    for user_id, kind, pts, match_id in notifs:
        notify_user(
            user_id=user_id,
            category="pool",
            title=_LABEL.get(kind, "Resultado"),
            body=f"{_LABEL.get(kind, 'Resultado')} en el partido {match_id} · +{pts} pts",
            link=f"/match/{match_id}",
            meta={"matchId": match_id, "kind": kind, "pts": pts},
        )
    return len(preds) if 'preds' in locals() else len(notifs)
