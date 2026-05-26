"""
Sincronización de partidos con el proveedor externo.

Llama al adaptador y aplica los updates a la BD. Si el proveedor falla,
los datos en BD quedan intactos (el último valor confirmado se sigue
sirviendo a los usuarios). El frontend marca freshness via `lastSyncedAt`.

Idempotente: aplicar el mismo update dos veces no genera efectos colaterales.
Detecta transiciones de status (live → final) y dispara
`score_predictions_for_match` para mantener compatibilidad con el flujo admin.
"""

from datetime import datetime, timezone

from db.database import SessionLocal
from db.models   import Match
from core.logger import log


def _now() -> datetime:
    return datetime.now(timezone.utc)


def sync_from_provider() -> dict:
    """
    Trae updates del provider y los aplica.
    Retorna stats: applied, scored, unchanged, unknown, errors.
    """
    from integrations.matches_provider import get_matches_provider
    from db.predictions_data import score_predictions_for_match

    provider = get_matches_provider()
    started  = _now()

    try:
        updates = provider.fetch_matches()
    except Exception as e:
        log.error("matches.sync_failed", provider=provider.name, error=str(e))
        return {"applied": 0, "scored": 0, "unchanged": 0, "unknown": 0,
                "errors": 1, "provider": provider.name}

    stats = {"applied": 0, "scored": 0, "unchanged": 0, "unknown": 0, "errors": 0,
             "provider": provider.name}
    matches_to_score: list[str] = []

    with SessionLocal() as db:
        for u in updates:
            m = db.query(Match).filter(Match.id == u.id).first()
            if not m:
                stats["unknown"] += 1
                continue

            changed = False

            # Heurística: solo aplicar campos cuyo valor es distinto.
            if u.home_score is not None and m.home_score != u.home_score:
                m.home_score = u.home_score
                changed = True
            if u.away_score is not None and m.away_score != u.away_score:
                m.away_score = u.away_score
                changed = True
            if u.minute is not None and m.minute != u.minute:
                m.minute = u.minute
                changed = True
            if u.kickoff is not None and m.kickoff != u.kickoff:
                m.kickoff = u.kickoff
                changed = True

            # Cambio de status: detectar transición a final para puntuar.
            prev_status = m.status
            if u.status and u.status != m.status:
                m.status = u.status
                changed = True
                if u.status == "final" and prev_status != "final":
                    matches_to_score.append(m.id)

            # Eventos opcionales (lista enriquecida del proveedor)
            if u.events is not None:
                m.events = u.events
                changed = True

            # Siempre actualizar metadatos de sync (aunque no cambien datos)
            m.last_synced_at = started
            m.data_source    = u.source

            if changed:
                stats["applied"] += 1
            else:
                stats["unchanged"] += 1

        db.commit()

    # Cálculo de puntos fuera del lock de la sesión
    for match_id in matches_to_score:
        try:
            n = score_predictions_for_match(match_id)
            stats["scored"] += n
            log.info("matches.auto_scored_via_sync", match_id=match_id, predictions=n)
        except Exception as e:
            log.error("matches.score_failed", match_id=match_id, error=str(e))
            stats["errors"] += 1

    log.info("matches.sync_done", **stats, duration_ms=int((_now() - started).total_seconds() * 1000))
    return stats


def freshness_of(last_synced_at: datetime | None, status: str) -> str:
    """
    Política de freshness:
      - 'fresh'        : sincronizado en los últimos 2 min
      - 'stale'        : sincronizado entre 2 y 10 min
      - 'provisional'  : nunca sincronizado o >10 min, o status incierto
    """
    if not last_synced_at:
        return "provisional"

    age_sec = (_now() - last_synced_at).total_seconds()

    # En vivo: ventana más estricta (frescos 60s)
    if status == "live":
        if age_sec <= 60:   return "fresh"
        if age_sec <= 300:  return "stale"
        return "provisional"

    # Otros estados: ventana laxa
    if age_sec <= 120:  return "fresh"
    if age_sec <= 600:  return "stale"
    return "provisional"
