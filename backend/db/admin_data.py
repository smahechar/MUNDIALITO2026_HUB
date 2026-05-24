"""
Capa de acceso a datos de administración — PostgreSQL via SQLAlchemy.
Alertas y broadcast persisten en la tabla audit_logs / alerts.
"""

import uuid
from datetime import datetime, timezone

from db.database import SessionLocal
from db.models import AuditLog, User

# ─── Alertas en BD (usando AuditLog con action='alert.*') ─────────────────────
# Las alertas del admin se almacenan como AuditLog con action iniciado en "alert."
# Esto las hace buscables en Splunk/ElasticSearch igual que los demás eventos.

_ALERT_ACTION_PREFIX = "alert."


def _log_to_alert_dict(log: AuditLog) -> dict:
    details = log.details or {}
    return {
        "id":            log.id,
        "type":          details.get("type", "info"),
        "severity":      details.get("severity", "low"),
        "status":        details.get("status", "open"),
        "title":         details.get("title", ""),
        "desc":          details.get("desc", ""),
        "ts":            log.timestamp.isoformat() if log.timestamp else None,
        "userId":        log.user_id,
        "correlationId": log.correlation_id,
    }


# ─── Seed de alertas iniciales (se insertan solo si no existen) ───────────────

_SEED_ALERTS = [
    {
        "id": "seed-a1",
        "type": "security", "severity": "high", "status": "open",
        "title": "Múltiples intentos de login fallidos",
        "desc": "El usuario @andres registró 8 intentos fallidos en los últimos 5 minutos.",
    },
    {
        "id": "seed-a2",
        "type": "fraud", "severity": "high", "status": "open",
        "title": "Transacción sospechosa de entrada",
        "desc": "La reserva RES-4412 fue procesada desde dos IPs distintas en 90 segundos.",
    },
    {
        "id": "seed-a3",
        "type": "system", "severity": "medium", "status": "open",
        "title": "Latencia elevada en servicio de tickets",
        "desc": "El servicio de tickets supera 2s de respuesta promedio. P99 = 4.8s.",
    },
    {
        "id": "seed-a4",
        "type": "info", "severity": "low", "status": "resolved",
        "title": "Nuevo usuario admin registrado",
        "desc": "Se creó la cuenta admin@hub.co con rol ADMIN durante el setup inicial.",
    },
]


def seed_alerts(db) -> None:
    """Insertado desde seed.py — no llames directamente."""
    for a in _SEED_ALERTS:
        existing = db.query(AuditLog).filter(AuditLog.id == a["id"]).first()
        if not existing:
            db.add(AuditLog(
                id=a["id"],
                action=f"{_ALERT_ACTION_PREFIX}created",
                level="WARN" if a["severity"] in ("high", "medium") else "INFO",
                correlation_id=f"evt_{uuid.uuid4().hex[:8]}",
                details={
                    "type":     a["type"],
                    "severity": a["severity"],
                    "status":   a["status"],
                    "title":    a["title"],
                    "desc":     a["desc"],
                },
            ))
    db.flush()


# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_alerts(status: str | None = None) -> list:
    with SessionLocal() as db:
        q = db.query(AuditLog).filter(
            AuditLog.action.like(f"{_ALERT_ACTION_PREFIX}%")
        ).order_by(AuditLog.timestamp.desc())
        rows = q.all()

    alerts = [_log_to_alert_dict(r) for r in rows]
    if status:
        alerts = [a for a in alerts if a["status"] == status]
    return alerts


def patch_alert(alert_id: str, action: str) -> tuple[dict | None, str | None]:
    """action: 'resolve' | 'dismiss'"""
    with SessionLocal() as db:
        log = db.query(AuditLog).filter(AuditLog.id == alert_id).first()
        if not log:
            return None, "Alerta no encontrada"

        details = dict(log.details or {})
        if details.get("status") != "open":
            return None, "La alerta ya está cerrada"

        if action == "resolve":
            details["status"] = "resolved"
            log.details = details
            db.commit()
            return _log_to_alert_dict(log), None
        elif action == "dismiss":
            db.delete(log)
            db.commit()
            return {"success": True}, None
        else:
            return None, "Acción no válida (resolve | dismiss)"


def broadcast_alert(body: dict) -> tuple[dict | None, str | None]:
    title = body.get("title", "").strip()
    desc  = body.get("desc",  "").strip()
    if not title or not desc:
        return None, "title y desc son requeridos"

    with SessionLocal() as db:
        log = AuditLog(
            id=str(uuid.uuid4()),
            action=f"{_ALERT_ACTION_PREFIX}broadcast",
            level="INFO",
            correlation_id=f"evt_{uuid.uuid4().hex[:8]}",
            details={
                "type":     "broadcast",
                "severity": body.get("severity", "low"),
                "status":   "open",
                "title":    title,
                "desc":     desc,
            },
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return _log_to_alert_dict(log), None
