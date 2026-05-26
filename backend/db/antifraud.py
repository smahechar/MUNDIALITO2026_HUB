"""
Antifraude — Mundialito 2026 Hub.

Centraliza:
  - Conteo de operaciones recientes por usuario (ventana 24 h rolling).
  - Aplicación de límites parametrizables.
  - Emisión de alertas dinámicas (compatible con `/api/v1/admin/alerts`).
  - Auto-suspensión cuando el usuario acumula N alertas en la ventana.

El PDF del proyecto exige:
  - "límites parametrizables por usuario (compras/transferencias por día)"
  - "Si se detectan patrones anómalos, se limita temporalmente la cuenta
     y se genera un caso para revisión."
"""

import uuid
from datetime import datetime, timezone, timedelta

from db.models import Ticket, TicketEvent, AuditLog, User
from db.notifications_data import notify_user
from core.config import (
    MAX_TICKET_RESERVATIONS_PER_DAY,
    MAX_TICKET_TRANSFERS_PER_DAY,
    MAX_TICKET_REFUNDS_PER_DAY,
    FRAUD_AUTO_SUSPEND_THRESHOLD,
)
from core.logger import log


# Prefijo de acción para que las alertas aparezcan en /admin/alerts
_ALERT_ACTION_PREFIX = "alert."


# ─── Conteo de operaciones por usuario (24 h rolling) ─────────────────────────

def _window_start() -> datetime:
    return datetime.now(timezone.utc) - timedelta(hours=24)


def count_reservations_24h(db, user_id: str) -> int:
    """Tickets reservados por este usuario en las últimas 24 h."""
    return (
        db.query(Ticket)
        .filter(
            Ticket.user_id == user_id,
            Ticket.reserved_at >= _window_start(),
        )
        .count()
    )


def count_transfers_24h(db, user_id: str) -> int:
    """Transferencias emitidas (eventos `transferred`) por este usuario en 24 h."""
    return (
        db.query(TicketEvent)
        .join(Ticket, TicketEvent.ticket_id == Ticket.id)
        .filter(
            Ticket.user_id == user_id,
            TicketEvent.type == "transferred",
            TicketEvent.at >= _window_start(),
        )
        .count()
    )


def count_refunds_24h(db, user_id: str) -> int:
    """Reembolsos solicitados por este usuario en 24 h."""
    return (
        db.query(TicketEvent)
        .join(Ticket, TicketEvent.ticket_id == Ticket.id)
        .filter(
            Ticket.user_id == user_id,
            TicketEvent.type == "refunded",
            TicketEvent.at >= _window_start(),
        )
        .count()
    )


def count_recent_fraud_alerts(db, user_id: str) -> int:
    """Alertas de antifraude emitidas para este usuario en las últimas 24 h."""
    return (
        db.query(AuditLog)
        .filter(
            AuditLog.user_id == user_id,
            AuditLog.action.like(f"{_ALERT_ACTION_PREFIX}fraud_%"),
            AuditLog.timestamp >= _window_start(),
        )
        .count()
    )


# ─── Emisión de alerta dinámica ───────────────────────────────────────────────

def raise_fraud_alert(
    db,
    user: User,
    kind: str,
    title: str,
    desc: str,
    severity: str = "high",
) -> AuditLog:
    """
    Inserta una alerta consumible por `/api/v1/admin/alerts`.
    Reusa el formato de `admin_data._log_to_alert_dict`.
    No hace commit — el caller decide.
    """
    cid = f"fraud_{uuid.uuid4().hex[:10]}"
    alert = AuditLog(
        id=str(uuid.uuid4()),
        action=f"{_ALERT_ACTION_PREFIX}fraud_{kind}",
        level="WARN" if severity != "low" else "INFO",
        user_id=user.id,
        user_email=user.email,
        correlation_id=cid,
        details={
            "type":     "fraud",
            "severity": severity,
            "status":   "open",
            "title":    title,
            "desc":     desc,
            "kind":     kind,
            "userHandle": user.handle,
        },
    )
    db.add(alert)
    log.warn(
        f"antifraud.{kind}",
        user_id=user.id,
        user_email=user.email,
        correlation_id=cid,
        severity=severity,
    )
    return alert


# ─── Auto-suspensión por acumulación ──────────────────────────────────────────

def maybe_auto_suspend(db, user: User) -> bool:
    """
    Si el usuario ya superó FRAUD_AUTO_SUSPEND_THRESHOLD alertas en 24 h
    y aún está activo, lo suspende. Retorna True si suspendió ahora.
    """
    if user.status != "active":
        return False

    # Hacer visible el AuditLog recién agregado pero aún no committeado por
    # raise_fraud_alert — con autoflush=False, sin este flush la query no
    # cuenta la alerta que acabamos de añadir.
    db.flush()

    n = count_recent_fraud_alerts(db, user.id)
    if n < FRAUD_AUTO_SUSPEND_THRESHOLD:
        return False

    user.status = "suspended"

    db.add(AuditLog(
        action=f"{_ALERT_ACTION_PREFIX}auto_suspend",
        level="WARN",
        user_id=user.id,
        user_email=user.email,
        correlation_id=f"suspend_{uuid.uuid4().hex[:10]}",
        details={
            "type":     "security",
            "severity": "high",
            "status":   "open",
            "title":    f"Cuenta {user.handle} auto-suspendida",
            "desc":     (
                f"El usuario acumulo {n} alertas de antifraude en 24h. "
                f"Cuenta suspendida automaticamente. Soporte debe revisar."
            ),
            "fraudAlertCount24h": n,
        },
    ))
    log.warn(
        "antifraud.auto_suspended",
        user_id=user.id,
        user_email=user.email,
        recent_alerts=n,
    )

    # Notificar al usuario afectado
    notify_user(
        user_id=user.id,
        category="system",
        title="Cuenta suspendida temporalmente",
        body=(
            "Detectamos patrones inusuales en tu cuenta y se suspendio "
            "preventivamente. Contacta soporte para revisar."
        ),
        link="/profile",
        meta={"reason": "fraud_auto_suspend", "alerts24h": n},
    )
    return True


# ─── Enforcement helpers (lo que llaman los routers / data layer) ─────────────

def enforce_reservation_limit(db, user: User) -> str | None:
    """Devuelve None si OK; mensaje de error si excede límite."""
    n = count_reservations_24h(db, user.id)
    if n >= MAX_TICKET_RESERVATIONS_PER_DAY:
        raise_fraud_alert(
            db, user,
            kind="reservation_limit",
            title=f"Limite de reservas excedido por {user.handle}",
            desc=(
                f"El usuario intento reservar mas de "
                f"{MAX_TICKET_RESERVATIONS_PER_DAY} entradas en 24h "
                f"(intento numero {n + 1})."
            ),
            severity="medium",
        )
        notify_user(
            user_id=user.id,
            category="ticket",
            title="Limite diario de reservas",
            body=(
                f"Solo podes reservar hasta {MAX_TICKET_RESERVATIONS_PER_DAY} "
                f"entradas cada 24h. Volve a intentar mas tarde."
            ),
            meta={"limit": MAX_TICKET_RESERVATIONS_PER_DAY, "kind": "reservation"},
        )
        maybe_auto_suspend(db, user)
        return (
            f"Limite diario excedido: maximo {MAX_TICKET_RESERVATIONS_PER_DAY} "
            f"reservas cada 24h."
        )
    return None


def enforce_transfer_limit(db, user: User) -> str | None:
    n = count_transfers_24h(db, user.id)
    if n >= MAX_TICKET_TRANSFERS_PER_DAY:
        raise_fraud_alert(
            db, user,
            kind="transfer_limit",
            title=f"Limite de transferencias excedido por {user.handle}",
            desc=(
                f"El usuario intento transferir mas de "
                f"{MAX_TICKET_TRANSFERS_PER_DAY} entradas en 24h."
            ),
            severity="high",
        )
        notify_user(
            user_id=user.id,
            category="transfer",
            title="Limite diario de transferencias",
            body=(
                f"Solo podes transferir hasta {MAX_TICKET_TRANSFERS_PER_DAY} "
                f"entradas cada 24h."
            ),
            meta={"limit": MAX_TICKET_TRANSFERS_PER_DAY, "kind": "transfer"},
        )
        maybe_auto_suspend(db, user)
        return (
            f"Limite diario excedido: maximo {MAX_TICKET_TRANSFERS_PER_DAY} "
            f"transferencias cada 24h."
        )
    return None


def enforce_refund_limit(db, user: User) -> str | None:
    n = count_refunds_24h(db, user.id)
    if n >= MAX_TICKET_REFUNDS_PER_DAY:
        raise_fraud_alert(
            db, user,
            kind="refund_limit",
            title=f"Limite de reembolsos excedido por {user.handle}",
            desc=(
                f"El usuario intento reembolsar mas de "
                f"{MAX_TICKET_REFUNDS_PER_DAY} entradas en 24h."
            ),
            severity="medium",
        )
        notify_user(
            user_id=user.id,
            category="refund",
            title="Limite diario de reembolsos",
            body=(
                f"Solo podes pedir hasta {MAX_TICKET_REFUNDS_PER_DAY} "
                f"reembolsos cada 24h."
            ),
            meta={"limit": MAX_TICKET_REFUNDS_PER_DAY, "kind": "refund"},
        )
        maybe_auto_suspend(db, user)
        return (
            f"Limite diario excedido: maximo {MAX_TICKET_REFUNDS_PER_DAY} "
            f"reembolsos cada 24h."
        )
    return None
