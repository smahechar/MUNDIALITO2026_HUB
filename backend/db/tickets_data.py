"""
Capa de acceso a tickets — PostgreSQL via SQLAlchemy.
Ciclo de vida: available → reserved → confirmed → transferred | refunded | expired
Cada transición queda en ticket_events (trazabilidad auditada).
"""

import random
import uuid
from datetime import datetime, timezone, timedelta

from db.database import SessionLocal
from db.models import Ticket, TicketEvent, Match, User

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


def _ticket_to_dict(t: Ticket) -> dict:
    return {
        "id":            t.id,
        "userEmail":     t.user.email if t.user else None,
        "matchId":       t.match_id,
        "status":        t.status,
        "sector":        t.sector_id,
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
        return [_ticket_to_dict(t) for t in tickets]


def get_ticket(ticket_id: str, email: str) -> dict | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        t = db.query(Ticket).filter(
            Ticket.id == ticket_id,
            Ticket.user_id == user.id,
        ).first()
        return _ticket_to_dict(t) if t else None


def get_available() -> list:
    with SessionLocal() as db:
        upcoming = (
            db.query(Match)
            .filter(Match.status == "upcoming")
            .order_by(Match.kickoff)
            .all()
        )
        prices       = [72, 98, 145, 145, 380]
        demand_opts  = ["high", "medium", "low"]
        remain_opts  = [820, 412, 1240, 64, 2810, 198]
        return [
            {
                "matchId":   m.id,
                "fromUSD":   prices[i % len(prices)],
                "remaining": remain_opts[i % len(remain_opts)],
                "demand":    demand_opts[i % len(demand_opts)],
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
        return _ticket_to_dict(ticket), None


def confirm_ticket(ticket_id: str, email: str) -> tuple[dict | None, str | None]:
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
        if t.expires_at and now > t.expires_at:
            t.status = "expired"
            _add_event(db, ticket_id, "expired", "Reserva expirada · Pago no completado en 15 minutos")
            db.commit()
            return None, "La reserva expiró"

        t.status       = "confirmed"
        t.confirmed_at = now
        t.expires_at   = None
        sector_name = _SECTOR_BY_ID.get(t.sector_id, {}).get("name", t.sector_id)
        _add_event(db, ticket_id, "paid",      f"Pago aprobado · USD {t.price_usd:.2f}", by="Pago")
        _add_event(db, ticket_id, "confirmed", "Entrada confirmada · QR generado")
        db.commit()
        db.refresh(t)
        return _ticket_to_dict(t), None


def transfer_ticket(ticket_id: str, email: str, handle: str) -> tuple[dict | None, str | None]:
    if not handle or not handle.startswith("@"):
        return None, "El handle debe comenzar con @"

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "No autorizado"

        t = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.user_id == user.id).first()
        if not t:
            return None, "Ticket no encontrado"
        if t.status != "confirmed":
            return None, "Solo se pueden transferir tickets confirmados"

        now = _now()
        t.status         = "transferred"
        t.transferred_to = {"handle": handle, "at": now.isoformat()}
        _add_event(db, ticket_id, "transferred", f"Transferida a {handle}", by="Tu")
        db.commit()
        db.refresh(t)
        return _ticket_to_dict(t), None


def refund_ticket(ticket_id: str, email: str) -> tuple[dict | None, str | None]:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "No autorizado"

        t = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.user_id == user.id).first()
        if not t:
            return None, "Ticket no encontrado"
        if t.status != "confirmed":
            return None, "Solo se pueden reembolsar tickets confirmados"

        match = db.query(Match).filter(Match.id == t.match_id).first()
        if match and match.kickoff:
            deadline = match.kickoff - timedelta(hours=72)
            if _now() > deadline:
                return None, "El reembolso solo es válido hasta 72 horas antes del partido"

        now = _now()
        t.status      = "refunded"
        t.refunded_at = now
        _add_event(db, ticket_id, "refunded", f"Reembolso aprobado · USD {t.price_usd:.2f} acreditados")
        db.commit()
        db.refresh(t)
        return _ticket_to_dict(t), None


# ─── Scheduler: expiración global de reservas ─────────────────────────────────

def expire_all_pending() -> int:
    """
    Marca como expiradas TODAS las reservas cuyo expires_at ya venció.
    Llamado cada 60 seg por APScheduler en app.py.
    Retorna el número de tickets expirados.
    """
    now = _now()
    with SessionLocal() as db:
        expired_tickets = (
            db.query(Ticket)
            .filter(Ticket.status == "reserved", Ticket.expires_at < now)
            .all()
        )
        count = len(expired_tickets)
        for t in expired_tickets:
            t.status = "expired"
            _add_event(db, t.id, "expired", "Reserva expirada · Pago no completado en 15 minutos")
        db.commit()
    return count


def _expire_pending_for_user(db, user_id: str) -> None:
    """Expira reservas vencidas de un usuario específico (usado en get_user_tickets)."""
    now = _now()
    pending = (
        db.query(Ticket)
        .filter(Ticket.user_id == user_id, Ticket.status == "reserved", Ticket.expires_at < now)
        .all()
    )
    for t in pending:
        t.status = "expired"
        _add_event(db, t.id, "expired", "Reserva expirada · Pago no completado en 15 minutos")
