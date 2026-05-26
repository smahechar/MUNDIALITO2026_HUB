"""
Capa de acceso a notificaciones — PostgreSQL via SQLAlchemy.

Modelo de eje del producto: el sistema debe poder demostrar
"qué se envió, a quién, cuándo y por qué medio".
Toda notificación queda persistida con correlation_id.

Reglas de suscripción (por preferencia del usuario):
  - goal           → goals_live
  - match_change   → reminders
  - ticket | transfer | refund → tickets
  - pool           → my_predictions
  - album          → my_predictions  (cae en pollas/predicciones por ahora)
  - broadcast      → siempre se entrega (mensaje operativo del admin)
  - system         → siempre se entrega
"""

import uuid
from datetime import datetime, timezone

from db.database import SessionLocal
from db.models   import Notification, NotificationPreference, User, AuditLog
from core.logger import log


_DEFAULT_PREFS = {
    "goalsLive":      True,
    "myPredictions":  True,
    "groups":         True,
    "tickets":        True,
    "reminders":      True,
    "marketing":      False,
}

_CATEGORY_TO_PREF = {
    "goal":         "goals_live",
    "match_change": "reminders",
    "ticket":       "tickets",
    "transfer":     "tickets",
    "refund":       "tickets",
    "pool":         "my_predictions",
    "album":        "my_predictions",
    # broadcast y system no chequean preferencia
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _to_dict(n: Notification) -> dict:
    return {
        "id":            n.id,
        "category":      n.category,
        "channel":       n.channel,
        "title":         n.title,
        "body":          n.body,
        "link":          n.link,
        "status":        n.status,
        "read":          n.read,
        "createdAt":     n.created_at.isoformat() if n.created_at else None,
        "readAt":        n.read_at.isoformat()    if n.read_at    else None,
        "correlationId": n.correlation_id,
        "meta":          n.meta or {},
    }


def _prefs_to_dict(p: NotificationPreference | None) -> dict:
    if not p:
        return dict(_DEFAULT_PREFS)
    return {
        "goalsLive":     p.goals_live,
        "myPredictions": p.my_predictions,
        "groups":        p.groups,
        "tickets":       p.tickets,
        "reminders":     p.reminders,
        "marketing":     p.marketing,
    }


def _should_send(db, user_id: str, category: str) -> bool:
    """Consulta las preferencias del usuario. Si no existe registro, usa defaults."""
    pref_field = _CATEGORY_TO_PREF.get(category)
    if not pref_field:
        return True  # broadcast / system siempre se entregan
    p = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == user_id
    ).first()
    if not p:
        # default: todos True excepto marketing
        return True
    return bool(getattr(p, pref_field, True))


# ─── API pública ──────────────────────────────────────────────────────────────

def get_user_notifications(email: str, only_unread: bool = False) -> list:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return []
        q = db.query(Notification).filter(Notification.user_id == user.id)
        if only_unread:
            q = q.filter(Notification.read == False)  # noqa: E712
        rows = q.order_by(Notification.created_at.desc()).limit(200).all()
        return [_to_dict(n) for n in rows]


def count_unread(email: str) -> int:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return 0
        return (
            db.query(Notification)
            .filter(Notification.user_id == user.id, Notification.read == False)  # noqa: E712
            .count()
        )


def mark_read(email: str, notification_id: str) -> dict | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        n = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        ).first()
        if not n:
            return None
        if not n.read:
            n.read = True
            n.read_at = _now()
            db.commit()
            db.refresh(n)
        return _to_dict(n)


def mark_all_read(email: str) -> int:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return 0
        now = _now()
        rows = (
            db.query(Notification)
            .filter(Notification.user_id == user.id, Notification.read == False)  # noqa: E712
            .all()
        )
        for n in rows:
            n.read = True
            n.read_at = now
        db.commit()
        return len(rows)


# ─── Preferencias ─────────────────────────────────────────────────────────────

def get_preferences(email: str) -> dict:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return dict(_DEFAULT_PREFS)
        p = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user.id
        ).first()
        return _prefs_to_dict(p)


def update_preferences(email: str, patch: dict) -> dict:
    field_map = {
        "goalsLive":     "goals_live",
        "myPredictions": "my_predictions",
        "groups":        "groups",
        "tickets":       "tickets",
        "reminders":     "reminders",
        "marketing":     "marketing",
    }
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return dict(_DEFAULT_PREFS)
        p = db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user.id
        ).first()
        if not p:
            p = NotificationPreference(user_id=user.id)
            db.add(p)
        for camel, snake in field_map.items():
            if camel in patch:
                setattr(p, snake, bool(patch[camel]))
        db.commit()
        db.refresh(p)
        return _prefs_to_dict(p)


# ─── Generación de notificaciones ─────────────────────────────────────────────

def notify_user(
    user_id: str,
    category: str,
    title: str,
    body: str = "",
    link: str | None = None,
    channel: str = "in_app",
    correlation_id: str | None = None,
    meta: dict | None = None,
) -> dict | None:
    """
    Crea una notificación si la preferencia del usuario lo permite.
    Persiste evidencia en `notifications` + log estructurado.
    Devuelve dict si se generó, None si fue suprimida por preferencia.
    """
    with SessionLocal() as db:
        if not _should_send(db, user_id, category):
            log.info(
                "notification.suppressed",
                user_id=user_id,
                category=category,
                title=title,
            )
            return None

        n = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            category=category,
            channel=channel,
            title=title,
            body=body,
            link=link,
            status="sent",
            read=False,
            correlation_id=correlation_id or f"ntf_{uuid.uuid4().hex[:10]}",
            meta=meta or {},
        )
        db.add(n)
        # Persistir también en audit_logs para trazabilidad cross-sistema
        db.add(AuditLog(
            action=f"notification.{category}",
            level="INFO",
            user_id=user_id,
            correlation_id=n.correlation_id,
            details={
                "title":   title,
                "channel": channel,
                "link":    link,
            },
        ))
        db.commit()
        db.refresh(n)

        log.info(
            "notification.sent",
            user_id=user_id,
            category=category,
            channel=channel,
            correlation_id=n.correlation_id,
        )
        return _to_dict(n)


def notify_by_email(email: str, **kwargs) -> dict | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        return notify_user(user.id, **kwargs)


def notify_handle(handle: str, **kwargs) -> dict | None:
    """Envía a un usuario identificado por handle (con o sin @)."""
    h = handle if handle.startswith("@") else f"@{handle}"
    with SessionLocal() as db:
        user = db.query(User).filter(User.handle == h).first()
        if not user:
            return None
        return notify_user(user.id, **kwargs)


def broadcast_to_all(
    title: str,
    body: str,
    link: str | None = None,
    category: str = "broadcast",
    correlation_id: str | None = None,
    only_role: str | None = None,
) -> int:
    """Envía a todos los usuarios (o filtrados por rol). Retorna # entregadas."""
    cid = correlation_id or f"bcast_{uuid.uuid4().hex[:10]}"
    count = 0
    with SessionLocal() as db:
        q = db.query(User)
        if only_role:
            q = q.filter(User.role == only_role)
        users = q.all()

        for u in users:
            db.add(Notification(
                id=str(uuid.uuid4()),
                user_id=u.id,
                category=category,
                channel="in_app",
                title=title,
                body=body,
                link=link,
                status="sent",
                read=False,
                correlation_id=cid,
                meta={"broadcast": True},
            ))
            count += 1
        if count:
            db.add(AuditLog(
                action="notification.broadcast",
                level="INFO",
                correlation_id=cid,
                details={"title": title, "recipients": count, "filter": only_role},
            ))
        db.commit()

    log.info("notification.broadcast", recipients=count, correlation_id=cid, title=title)
    return count
