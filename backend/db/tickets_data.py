"""
Capa de acceso a tickets — PostgreSQL via SQLAlchemy.
Ciclo de vida: available → reserved → confirmed → transferred | refunded | expired
Cada transición queda en ticket_events (trazabilidad auditada).
"""

import random
import uuid
from datetime import datetime, timezone, timedelta

from db.database import SessionLocal
from db.models import Ticket, TicketEvent, Match, User, PaymentRecord, Nation
from db.notifications_data import notify_user, notify_handle
from db.antifraud import (
    enforce_reservation_limit, enforce_transfer_limit, enforce_refund_limit,
)
from integrations.payments import get_payment_provider

# ─── Sectores del estadio (estáticos) ─────────────────────────────────────────

SECTORS = [
    {"id": "norte-bajo",  "name": "Norte · Bajo",   "priceUSD": 145, "color": "var(--green)", "desc": "Tribuna lateral, vista cercana al campo"},
    {"id": "norte-alto",  "name": "Norte · Alto",   "priceUSD":  98, "color": "var(--ink)",   "desc": "Lateral elevado, vista panorámica"},
    {"id": "sur-bajo",    "name": "Sur · Bajo",     "priceUSD": 145, "color": "var(--green)", "desc": "Tribuna lateral opuesta, primera fila"},
    {"id": "este-curva",  "name": "Este · Curva",   "priceUSD":  72, "color": "var(--gold)",  "desc": "Curva detrás del arco — sector hinchada"},
    {"id": "oeste-curva", "name": "Oeste · Curva",  "priceUSD":  72, "color": "var(--gold)",  "desc": "Curva opuesta — sector hinchada visitante"},
    {"id": "platea-vip",  "name": "Platea VIP",     "priceUSD": 380, "color": "var(--red)",   "desc": "Asientos premium, acceso lounge"},
]
_SECTOR_BY_ID = {s["id"]: s for s in SECTORS}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime | None) -> datetime | None:
    """
    SQLite no preserva tzinfo en columnas DateTime, lo que rompe comparaciones
    contra valores UTC-aware como los que devuelve _now(). Normalizamos
    asumiendo UTC al leer.
    """
    if dt is None or dt.tzinfo is not None:
        return dt
    return dt.replace(tzinfo=timezone.utc)


def _ticket_to_dict(t: Ticket, db=None) -> dict:
    sector = _SECTOR_BY_ID.get(t.sector_id, {})

    return {
        "id":            t.id,
        "userEmail":     t.user.email if t.user else None,
        "matchId":       t.match_id,
        "match":         _match_to_dict(db, t.match) if db else None,
        "status":        t.status,
        "sector":        t.sector_id,
        "sectorName":    sector.get("name", t.sector_id),
        "seatRow":       t.seat_row,
        "seatNum":       t.seat_num,
        "reservedAt":    t.reserved_at.isoformat()  if t.reserved_at  else None,
        "confirmedAt":   t.confirmed_at.isoformat() if t.confirmed_at else None,
        "expiresAt":     t.expires_at.isoformat()   if t.expires_at   else None,
        "refundedAt":    t.refunded_at.isoformat()  if t.refunded_at  else None,
        "transferredTo": t.transferred_to,
        "priceUSD":      t.price_usd,
        "correlationId": t.correlation_id,
    }


def _event_to_dict(e: TicketEvent) -> dict:
    return {
        "type": e.type,
        "at":   e.at.isoformat() if e.at else None,
        "by":   e.by,
        "note": e.note,
    }


def _add_event(db, ticket_id: str, etype: str, note: str, by: str = "Sistema") -> None:
    db.add(TicketEvent(
        ticket_id=ticket_id,
        type=etype,
        at=_now(),
        by=by,
        note=note,
    ))


def _gen_ticket_id(db) -> str:
    for _ in range(20):
        tid = f"T-{random.randint(1000, 9999)}"
        if not db.query(Ticket).filter(Ticket.id == tid).first():
            return tid
    return f"T-{uuid.uuid4().hex[:8].upper()}"

def _match_to_dict(db, m: Match | None) -> dict | None:
    if not m:
        return None

    nations = {
        n.code: n.name
        for n in db.query(Nation).filter(Nation.code.in_([m.home, m.away])).all()
    }

    return {
        "id": m.id,
        "home": m.home,
        "away": m.away,
        "homeName": nations.get(m.home, m.home),
        "awayName": nations.get(m.away, m.away),
        "group": m.group_name,
        "stadium": m.stadium,
        "city": m.city,
        "phase": m.phase,
        "status": m.status,
        "kickoff": m.kickoff.isoformat() if m.kickoff else None,
    }

# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_sectors() -> list:
    return SECTORS


def get_user_tickets(email: str) -> list:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return []

        # Expirar reservas vencidas antes de devolver
        _expire_pending_for_user(db, user.id)
        db.commit()

        tickets = (
            db.query(Ticket)
            .filter(Ticket.user_id == user.id)
            .order_by(Ticket.reserved_at.desc())
            .all()
        )
        return [_ticket_to_dict(t, db) for t in tickets]


def get_ticket(ticket_id: str, email: str) -> dict | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        t = db.query(Ticket).filter(
            Ticket.id == ticket_id,
            Ticket.user_id == user.id,
        ).first()
        return _ticket_to_dict(t, db) if t else None


def get_available() -> list:
    with SessionLocal() as db:
        upcoming = (
            db.query(Match)
            .filter(Match.status == "upcoming")
            .order_by(Match.kickoff)
            .all()
        )

        prices = [72, 98, 145, 145, 380]
        demand_opts = ["high", "medium", "low"]
        remain_opts = [820, 412, 1240, 64, 2810, 198]

        return [
            {
                "matchId": m.id,
                "match": _match_to_dict(db, m),
                "fromUSD": prices[i % len(prices)],
                "remaining": remain_opts[i % len(remain_opts)],
                "demand": demand_opts[i % len(demand_opts)],
            }
            for i, m in enumerate(upcoming)
        ]


def get_history(ticket_id: str, email: str) -> tuple[list | None, str | None]:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "No autorizado"
        t = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not t:
            return None, "Ticket no encontrado"
        if t.user_id != user.id:
            return None, "No autorizado"
        events = (
            db.query(TicketEvent)
            .filter(TicketEvent.ticket_id == ticket_id)
            .order_by(TicketEvent.at)
            .all()
        )
        return [_event_to_dict(e) for e in events], None


def reserve_ticket(email: str, body: dict) -> tuple[dict | None, str | None]:
    match_id  = body.get("matchId")
    sector_id = body.get("sectorId")

    if not match_id or not sector_id:
        return None, "matchId y sectorId son requeridos"

    sector = _SECTOR_BY_ID.get(sector_id)
    if not sector:
        return None, "Sector no encontrado"

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "Usuario no encontrado"

        if user.status == "suspended":
            return None, "Cuenta suspendida. Contacta soporte."

        # Antifraude: límite diario
        err = enforce_reservation_limit(db, user)
        if err:
            db.commit()  # persistir alerta + posible suspensión
            return None, err

        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            return None, "Partido no encontrado"
        if match.status != "upcoming":
            return None, "Solo se pueden reservar entradas para partidos próximos"

        now       = _now()
        ticket_id = _gen_ticket_id(db)
        ticket    = Ticket(
            id=ticket_id,
            user_id=user.id,
            match_id=match_id,
            sector_id=sector_id,
            seat_row=random.randint(1, 40),
            seat_num=random.randint(1, 30),
            status="reserved",
            price_usd=sector["priceUSD"],
            reserved_at=now,
            expires_at=now + timedelta(minutes=15),
            correlation_id=f"tx_2026_{uuid.uuid4().hex[:12]}",
        )
        db.add(ticket)
        db.flush()
        _add_event(
            db, ticket_id, "reserved",
            f"Reserva creada · Sector {sector['name']} · 1 entrada · 15 min para pagar",
            by="Tu",
        )
        db.commit()
        db.refresh(ticket)
        return _ticket_to_dict(ticket, db), None


def confirm_ticket(
    ticket_id: str,
    email: str,
    card: dict | None = None,
) -> tuple[dict | None, str | None]:
    """
    Confirma una reserva ejecutando un cobro contra el provider de pagos.
    Requiere `card = { number, expMonth, expYear, cvc }` (contrato en
    `integrations/payments.py`). Si el pago falla, el ticket queda en
    `reserved` y se persiste un PaymentRecord con status='failed'.
    """
    if not card:
        return None, "Datos de tarjeta requeridos para confirmar el pago"

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "No autorizado"
        t = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.user_id == user.id).first()
        if not t:
            return None, "Ticket no encontrado"
        if t.status != "reserved":
            return None, f"Solo se pueden confirmar tickets reservados (estado actual: {t.status})"

        now = _now()
        expires_at = _aware(t.expires_at)
        if expires_at and now > expires_at:
            t.status = "expired"
            _add_event(db, ticket_id, "expired", "Reserva expirada · Pago no completado en 15 minutos")
            db.commit()
            return None, "La reserva expiró"

        # ── Cobro contra el provider (mock o Stripe test) ────────────────
        provider = get_payment_provider()
        result = provider.charge(
            amount_usd=t.price_usd,
            currency="USD",
            card=card,
            correlation_id=t.correlation_id,
        )

        # Registro inmutable del intento (éxito o fracaso)
        payment = PaymentRecord(
            id=f"pay_{uuid.uuid4().hex[:14]}",
            ticket_id=t.id,
            user_id=user.id,
            provider=result.provider,
            status=result.status,
            code=result.code,
            amount_usd=result.amount_usd,
            currency=result.currency,
            card_last4=result.last4,
            card_brand=result.brand,
            correlation_id=t.correlation_id,
            provider_ref=result.provider_ref,
            failure_reason=result.failure_reason,
        )
        db.add(payment)

        if result.status != "succeeded":
            _add_event(
                db, ticket_id, "payment_failed",
                f"Pago rechazado ({result.code}) · {result.failure_reason or 'sin detalle'}",
                by="Pago",
            )
            db.commit()
            notify_user(
                user_id=t.user_id,
                category="ticket",
                title="Pago rechazado",
                body=(
                    f"No pudimos cobrar tu entrada {t.id}: {result.failure_reason or result.code}. "
                    f"Probá con otra tarjeta antes de que expire la reserva."
                ),
                link=f"/tickets/{t.id}",
                correlation_id=t.correlation_id,
                meta={"ticketId": t.id, "paymentCode": result.code, "last4": result.last4},
            )
            return None, f"Pago rechazado: {result.failure_reason or result.code}"

        # ── Éxito: confirmar el ticket ──────────────────────────────────
        t.status       = "confirmed"
        t.confirmed_at = now
        t.expires_at   = None
        _add_event(
            db, ticket_id, "paid",
            f"Pago aprobado · USD {t.price_usd:.2f} · {result.brand} ****{result.last4} · {result.provider_ref}",
            by="Pago",
        )
        _add_event(db, ticket_id, "confirmed", "Entrada confirmada · QR generado")
        db.commit()
        db.refresh(t)

        notify_user(
            user_id=t.user_id,
            category="ticket",
            title="Entrada confirmada",
            body=f"Tu entrada {t.id} ha sido confirmada. QR disponible en tu cuenta.",
            link=f"/tickets/{t.id}",
            correlation_id=t.correlation_id,
            meta={
                "ticketId":   t.id,
                "matchId":    t.match_id,
                "priceUSD":   t.price_usd,
                "paymentRef": result.provider_ref,
                "last4":      result.last4,
            },
        )
        return _ticket_to_dict(t, db), None


def transfer_ticket(ticket_id: str, email: str, handle: str) -> tuple[dict | None, str | None]:
    if not handle or not handle.startswith("@"):
        return None, "El handle debe comenzar con @"

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "No autorizado"

        if user.status == "suspended":
            return None, "Cuenta suspendida. Contacta soporte."

        # Antifraude: validar destinatario
        if handle.lower() == (user.handle or "").lower():
            return None, "No podes transferirte una entrada a vos mismo"

        receiver = db.query(User).filter(User.handle == handle).first()
        if not receiver:
            return None, f"El destinatario {handle} no existe"
        if receiver.status == "suspended":
            return None, "El destinatario tiene la cuenta suspendida"

        # Antifraude: límite diario
        err = enforce_transfer_limit(db, user)
        if err:
            db.commit()
            return None, err

        t = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.user_id == user.id).first()
        if not t:
            return None, "Ticket no encontrado"
        if t.status != "confirmed":
            return None, "Solo se pueden transferir tickets confirmados"

        now = _now()
        t.status         = "transferred"
        t.transferred_to = {
            "handle":  handle,
            "userId":  receiver.id,
            "userEmail": receiver.email,
            "at":      now.isoformat(),
        }
        _add_event(db, ticket_id, "transferred", f"Transferida a {handle}", by="Tu")
        db.commit()
        db.refresh(t)

        # Notificar al cedente (yo) y al receptor (si existe en BD)
        notify_user(
            user_id=t.user_id,
            category="transfer",
            title="Transferencia completada",
            body=f"Entregaste la entrada {t.id} a {handle}.",
            link=f"/tickets/{t.id}",
            correlation_id=t.correlation_id,
            meta={"ticketId": t.id, "to": handle},
        )
        notify_handle(
            handle=handle,
            category="transfer",
            title="Recibiste una entrada",
            body=f"{user.handle} te transfirió la entrada {t.id}.",
            link=f"/tickets/{t.id}",
            correlation_id=t.correlation_id,
            meta={"ticketId": t.id, "from": user.handle},
        )
        return _ticket_to_dict(t, db)


def refund_ticket(ticket_id: str, email: str) -> tuple[dict | None, str | None]:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "No autorizado"

        if user.status == "suspended":
            return None, "Cuenta suspendida. Contacta soporte."

        # Antifraude: límite diario
        err = enforce_refund_limit(db, user)
        if err:
            db.commit()
            return None, err

        t = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.user_id == user.id).first()
        if not t:
            return None, "Ticket no encontrado"
        if t.status != "confirmed":
            return None, "Solo se pueden reembolsar tickets confirmados"

        match = db.query(Match).filter(Match.id == t.match_id).first()
        if match and match.kickoff:
            kickoff = _aware(match.kickoff)
            deadline = kickoff - timedelta(hours=72)
            if _now() > deadline:
                return None, "El reembolso solo es válido hasta 72 horas antes del partido"

        now = _now()
        t.status      = "refunded"
        t.refunded_at = now
        _add_event(db, ticket_id, "refunded", f"Reembolso aprobado · USD {t.price_usd:.2f} acreditados")
        db.commit()
        db.refresh(t)

        notify_user(
            user_id=t.user_id,
            category="refund",
            title="Reembolso aprobado",
            body=f"Se acreditaron USD {t.price_usd:.2f} por la entrada {t.id}.",
            link=f"/tickets/{t.id}",
            correlation_id=t.correlation_id,
            meta={"ticketId": t.id, "amountUSD": t.price_usd},
        )
        return _ticket_to_dict(t, db)


# ─── Scheduler: expiración global de reservas ─────────────────────────────────

def expire_all_pending() -> int:
    """
    Marca como expiradas TODAS las reservas cuyo expires_at ya venció.
    Llamado cada 60 seg por APScheduler en app.py.
    Retorna el número de tickets expirados.
    """
    now = _now()
    with SessionLocal() as db:
        candidates = (
            db.query(Ticket)
            .filter(Ticket.status == "reserved", Ticket.expires_at.isnot(None))
            .all()
        )
        expired_tickets = [t for t in candidates if _aware(t.expires_at) < now]
        count = len(expired_tickets)
        notifs = []
        for t in expired_tickets:
            t.status = "expired"
            _add_event(db, t.id, "expired", "Reserva expirada · Pago no completado en 15 minutos")
            notifs.append((t.user_id, t.id, t.correlation_id))
        db.commit()

    # Generar notificaciones fuera de la sesión para evitar locks largos
    for user_id, ticket_id, cid in notifs:
        notify_user(
            user_id=user_id,
            category="ticket",
            title="Reserva expirada",
            body=f"Tu reserva {ticket_id} expiró porque no se completó el pago en 15 minutos.",
            link=f"/tickets/{ticket_id}",
            correlation_id=cid,
            meta={"ticketId": ticket_id, "reason": "ttl_expired"},
        )
    return count


def _expire_pending_for_user(db, user_id: str) -> None:
    """Expira reservas vencidas de un usuario específico (usado en get_user_tickets)."""
    now = _now()
    candidates = (
        db.query(Ticket)
        .filter(
            Ticket.user_id == user_id,
            Ticket.status == "reserved",
            Ticket.expires_at.isnot(None),
        )
        .all()
    )
    for t in candidates:
        if _aware(t.expires_at) < now:
            t.status = "expired"
            _add_event(db, t.id, "expired", "Reserva expirada · Pago no completado en 15 minutos")
