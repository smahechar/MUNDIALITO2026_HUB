"""
Modelos ORM — Mundialito 2026 Hub
Cada clase mapea 1:1 con una tabla de MySQL.
Ejecutar `python -c "from db.models import *; from db.database import engine, Base; Base.metadata.create_all(bind=engine)"`
para crear todas las tablas por primera vez.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, UniqueConstraint, JSON,
)
from sqlalchemy.orm import relationship

from db.database import Base


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _uuid():
    return str(uuid.uuid4())


def _now():
    return datetime.now(timezone.utc)


# ─── Users ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_uuid)
    name            = Column(String(120), nullable=False)
    handle          = Column(String(80), nullable=False)
    email           = Column(String(200), unique=True, nullable=False, index=True)
    role            = Column(String(20), default="user", nullable=False)
    status          = Column(String(20), default="active", nullable=False)
    timezone        = Column(String(20), default="UTC-5")
    city            = Column(String(100), default="")
    favorite_teams  = Column(JSON, default=list)
    avatar          = Column(String(500), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at      = Column(DateTime(timezone=True), default=_now, nullable=False)

    # Relaciones
    predictions    = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    tickets        = relationship("Ticket", back_populates="user", cascade="all, delete-orphan")
    pool_members   = relationship("PoolMember", back_populates="user", cascade="all, delete-orphan")
    group_members  = relationship("GroupMember", back_populates="user", cascade="all, delete-orphan")
    user_stickers  = relationship("UserSticker", back_populates="user", cascade="all, delete-orphan")
    trades_sent    = relationship("Trade", foreign_keys="Trade.proposer_id", back_populates="proposer", cascade="all, delete-orphan")
    trades_recv    = relationship("Trade", foreign_keys="Trade.receiver_id", back_populates="receiver")


# ─── Nations ──────────────────────────────────────────────────────────────────

class Nation(Base):
    __tablename__ = "nations"

    code    = Column(String(3), primary_key=True)       # "ESP", "BOR"
    name    = Column(String(100), nullable=False)
    group   = Column(String(1), nullable=False)          # "A"–"F"
    colors  = Column(JSON, nullable=False)      # ["#hex1","#hex2","#hex3"]
    layout  = Column(String(10), nullable=False)         # "h"|"v"|"diag"|"cross"


# ─── Matches ──────────────────────────────────────────────────────────────────

class Match(Base):
    __tablename__ = "matches"

    id          = Column(String(10), primary_key=True)   # "m1", "m2" …
    home        = Column(String(3), ForeignKey("nations.code"), nullable=False)
    away        = Column(String(3), ForeignKey("nations.code"), nullable=False)
    group_name  = Column(String(2), nullable=True)        # "A"–"F", None en eliminatoria
    stadium     = Column(String(120), nullable=False)
    city        = Column(String(100), nullable=False)
    phase       = Column(String(60), nullable=False)      # "Group A · MD1"
    status      = Column(String(20), default="upcoming", nullable=False)
    minute      = Column(String(10), nullable=True)       # "67'", "HT", "FT", None
    home_score  = Column(Integer, nullable=True)
    away_score  = Column(Integer, nullable=True)
    kickoff     = Column(DateTime(timezone=True), nullable=False)

    # Detalles ricos (JSON — eventos, stats, alineaciones, H2H)
    events      = Column(JSON, default=list)
    stats       = Column(JSON, default=dict)
    lineup_home = Column(JSON, default=dict)
    lineup_away = Column(JSON, default=dict)
    h2h         = Column(JSON, default=dict)

    # Ingesta externa — última sincronización con el proveedor
    last_synced_at  = Column(DateTime(timezone=True), nullable=True)
    data_source     = Column(String(40), default="seed", nullable=False)
    # "seed" | "mock" | "football-data.org" | "api-football" | "wiremock" | "admin"

    # Relaciones
    predictions = relationship("Prediction", back_populates="match", cascade="all, delete-orphan")
    tickets     = relationship("Ticket", back_populates="match")


# ─── Pools ────────────────────────────────────────────────────────────────────

class Pool(Base):
    __tablename__ = "pools"

    id          = Column(String(36), primary_key=True, default=_uuid)
    name        = Column(String(120), nullable=False)
    code        = Column(String(20), unique=True, nullable=False, index=True)
    host_type   = Column(String(40), default="Privada")
    prize       = Column(String(200), default="")
    is_public   = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), default=_now)
    created_by  = Column(String(36), ForeignKey("users.id"), nullable=True)

    members = relationship("PoolMember", back_populates="pool", cascade="all, delete-orphan")


class PoolMember(Base):
    __tablename__ = "pool_members"
    __table_args__ = (UniqueConstraint("pool_id", "user_id", name="uq_pool_user"),)

    id          = Column(String(36), primary_key=True, default=_uuid)
    pool_id     = Column(String(36), ForeignKey("pools.id", ondelete="CASCADE"), nullable=False)
    user_id     = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pts         = Column(Integer, default=0)
    exact       = Column(Integer, default=0)   # marcadores exactos acertados
    winner      = Column(Integer, default=0)   # ganadores acertados
    last_change = Column(Integer, default=0)   # delta de posición última jornada
    hot         = Column(Boolean, default=False)
    joined_at   = Column(DateTime(timezone=True), default=_now)

    pool = relationship("Pool", back_populates="members")
    user = relationship("User", back_populates="pool_members")


# ─── Predictions ──────────────────────────────────────────────────────────────

class Prediction(Base):
    __tablename__ = "predictions"
    __table_args__ = (UniqueConstraint("user_id", "match_id", name="uq_pred_user_match"),)

    id          = Column(String(36), primary_key=True, default=_uuid)
    user_id     = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id    = Column(String(10), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    home        = Column(Integer, nullable=False)   # goles pronosticados local
    away        = Column(Integer, nullable=False)   # goles pronosticados visitante
    double_down = Column(Boolean, default=False)    # bonus ×2 pts
    pts         = Column(Integer, nullable=True)    # puntos obtenidos (null hasta que el partido termine)
    kind        = Column(String(20), nullable=True) # "exact"|"diff"|"winner"|"miss"|null
    status      = Column(String(20), default="open")# "open"|"locked"|"scored"
    created_at  = Column(DateTime(timezone=True), default=_now)
    updated_at  = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    user  = relationship("User", back_populates="predictions")
    match = relationship("Match", back_populates="predictions")


class SpecialPick(Base):
    __tablename__ = "special_picks"
    __table_args__ = (UniqueConstraint("user_id", "pick_type", name="uq_special_user_type"),)

    id        = Column(String(36), primary_key=True, default=_uuid)
    user_id   = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pick_type = Column(String(30), nullable=False)  # "champion"|"runnerUp"|"topScorer"|"darkHorse"
    value     = Column(JSON, nullable=False)        # {"nation":"ESP"} o {"player":"...","nation":"..."}
    reward    = Column(Integer, default=0)
    status    = Column(String(20), default="alive")  # "alive"|"won"|"lost"
    created_at = Column(DateTime(timezone=True), default=_now)

    user = relationship("User")


# ─── Album / Stickers ─────────────────────────────────────────────────────────

class Sticker(Base):
    """Catálogo de láminas — 24 naciones × 12 slots = 288 láminas. Seed estático."""
    __tablename__ = "stickers"

    id         = Column(String(10), primary_key=True)  # "ESP-01"
    num        = Column(Integer, nullable=False)
    nation     = Column(String(3), ForeignKey("nations.code"), nullable=False)
    slot       = Column(Integer, nullable=False)
    name       = Column(String(100), nullable=False)
    short_name = Column(String(60), nullable=False)
    type       = Column(String(20), nullable=False)    # "badge"|"player"|"stadium"|"kit"|"moment"
    rarity     = Column(String(1), nullable=False)     # "C"|"R"|"E"|"L"


class UserSticker(Base):
    """Colección de cada usuario: cuántos ejemplares tiene de cada lámina."""
    __tablename__ = "user_stickers"
    __table_args__ = (UniqueConstraint("user_id", "sticker_id", name="uq_user_sticker"),)

    id         = Column(String(36), primary_key=True, default=_uuid)
    user_id    = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sticker_id = Column(String(10), ForeignKey("stickers.id", ondelete="CASCADE"), nullable=False)
    count      = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    user    = relationship("User", back_populates="user_stickers")
    sticker = relationship("Sticker")


class Trade(Base):
    """Intercambio de láminas entre dos usuarios."""
    __tablename__ = "trades"

    id           = Column(String(36), primary_key=True, default=_uuid)
    proposer_id  = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id  = Column(String(36), ForeignKey("users.id"), nullable=True)  # None = oferta abierta
    offered      = Column(JSON, nullable=False)    # [sticker_id, ...]
    requested    = Column(JSON, nullable=False)    # [sticker_id, ...]
    status       = Column(String(20), default="pending")    # "pending"|"accepted"|"rejected"|"cancelled"
    created_at   = Column(DateTime(timezone=True), default=_now)
    updated_at   = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    proposer = relationship("User", foreign_keys=[proposer_id], back_populates="trades_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="trades_recv")

class AlbumTradeListing(Base):
    __tablename__ = "album_trade_listings"

    id = Column(String(36), primary_key=True, default=_uuid)
    owner_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offered_sticker_id = Column(String(10), ForeignKey("stickers.id"), nullable=False)
    requested_sticker_id = Column(String(10), ForeignKey("stickers.id"), nullable=True)

    title = Column(String(160), nullable=True)
    note = Column(Text, nullable=True)

    status = Column(String(30), default="open", nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    owner = relationship("User", foreign_keys=[owner_id])
    offered_sticker = relationship("Sticker", foreign_keys=[offered_sticker_id])
    requested_sticker = relationship("Sticker", foreign_keys=[requested_sticker_id])


class AlbumTradeOffer(Base):
    __tablename__ = "album_trade_offers"

    id = Column(String(36), primary_key=True, default=_uuid)
    listing_id = Column(String(36), ForeignKey("album_trade_listings.id", ondelete="CASCADE"), nullable=False)
    bidder_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offered_sticker_id = Column(String(10), ForeignKey("stickers.id"), nullable=False)

    message = Column(Text, nullable=True)
    status = Column(String(30), default="pending", nullable=False)

    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    listing = relationship("AlbumTradeListing")
    bidder = relationship("User", foreign_keys=[bidder_id])
    offered_sticker = relationship("Sticker", foreign_keys=[offered_sticker_id])
# ─── Tickets ──────────────────────────────────────────────────────────────────

class Ticket(Base):
    __tablename__ = "tickets"

    id              = Column(String(20), primary_key=True)   # "T-1234"
    user_id         = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id        = Column(String(10), ForeignKey("matches.id"), nullable=False)
    sector_id       = Column(String(40), nullable=False)
    seat_row        = Column(Integer, nullable=True)
    seat_num        = Column(Integer, nullable=True)
    status          = Column(String(20), default="reserved")
    price_usd       = Column(Float, nullable=False)
    reserved_at     = Column(DateTime(timezone=True), default=_now)
    confirmed_at    = Column(DateTime(timezone=True), nullable=True)
    expires_at      = Column(DateTime(timezone=True), nullable=True)
    refunded_at     = Column(DateTime(timezone=True), nullable=True)
    transferred_to  = Column(JSON, nullable=True)   # {"handle": "@user", "at": "ISO"}
    correlation_id  = Column(String(60), nullable=True, index=True)

    user  = relationship("User", back_populates="tickets")
    match = relationship("Match", back_populates="tickets")

    history = relationship("TicketEvent", back_populates="ticket", cascade="all, delete-orphan",
                           order_by="TicketEvent.at")


class PaymentRecord(Base):
    """
    Cada intento de pago contra el adaptador (mock o Stripe test) queda registrado.
    Sirve para evidencia operativa: qué tarjeta (solo last4), monto, status, código de error.
    Un ticket puede tener N PaymentRecord (varios intentos antes de éxito).
    """
    __tablename__ = "payment_records"

    id              = Column(String(40), primary_key=True)   # "pay_<hex>"
    ticket_id       = Column(String(20), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id         = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider        = Column(String(20), default="mock", nullable=False)   # "mock" | "stripe"
    status          = Column(String(20), default="pending", nullable=False)  # "pending" | "succeeded" | "failed"
    code            = Column(String(40), nullable=True)   # "card_declined" | "expired_card" | "insufficient_funds" | "ok"
    amount_usd      = Column(Float, nullable=False)
    currency        = Column(String(3), default="USD")
    card_last4      = Column(String(4), nullable=True)
    card_brand      = Column(String(20), nullable=True)
    created_at      = Column(DateTime(timezone=True), default=_now, nullable=False)
    correlation_id  = Column(String(60), nullable=True, index=True)
    provider_ref    = Column(String(80), nullable=True)   # id externo (Stripe pi_…)
    failure_reason  = Column(Text, nullable=True)

    ticket = relationship("Ticket")
    user   = relationship("User")


class TicketEvent(Base):
    """Log de auditoría por ticket — trazabilidad de cada transición de estado."""
    __tablename__ = "ticket_events"

    id        = Column(String(36), primary_key=True, default=_uuid)
    ticket_id = Column(String(20), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    type      = Column(String(30), nullable=False)   # "reserved"|"paid"|"confirmed"|"expired"|"transferred"|"refunded"
    at        = Column(DateTime(timezone=True), default=_now)
    by        = Column(String(80), default="Sistema")
    note      = Column(Text, default="")

    ticket = relationship("Ticket", back_populates="history")


# ─── Groups ───────────────────────────────────────────────────────────────────

class Group(Base):
    __tablename__ = "groups"

    id          = Column(String(36), primary_key=True, default=_uuid)
    name        = Column(String(120), nullable=False)
    code        = Column(String(20), unique=True, nullable=False, index=True)
    type        = Column(String(40), default="Privado")
    city        = Column(String(100), default="")
    color       = Column(String(30), default="var(--ink)")
    description = Column(Text, default="")
    is_open     = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), default=_now)
    created_by  = Column(String(36), ForeignKey("users.id"), nullable=True)

    members    = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    activities = relationship("GroupActivity", back_populates="group", cascade="all, delete-orphan",
                              order_by="GroupActivity.created_at.desc()")


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (UniqueConstraint("group_id", "user_id", name="uq_group_user"),)

    id        = Column(String(36), primary_key=True, default=_uuid)
    group_id  = Column(String(36), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    user_id   = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role      = Column(String(20), default="member")   # "admin"|"member"
    pts       = Column(Integer, default=0)
    joined_at = Column(DateTime(timezone=True), default=_now)

    group = relationship("Group", back_populates="members")
    user  = relationship("User", back_populates="group_members")


class GroupActivity(Base):
    __tablename__ = "group_activity"

    id         = Column(String(36), primary_key=True, default=_uuid)
    group_id   = Column(String(36), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    user_id    = Column(String(36), ForeignKey("users.id"), nullable=True)
    type       = Column(String(30), nullable=False)   # "prediction"|"match"|"join"|"trade"|"badge"
    text       = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now)

    group = relationship("Group", back_populates="activities")


# ─── Notifications ────────────────────────────────────────────────────────────

class Notification(Base):
    """
    Notificación dirigida a un usuario.
    Cada notificación queda persistida para evidencia operativa:
    qué se envió, a quién, cuándo, por qué medio y bajo qué evento.
    """
    __tablename__ = "notifications"

    id             = Column(String(36), primary_key=True, default=_uuid)
    user_id        = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category       = Column(String(30), nullable=False, index=True)
    # "goal" | "match_change" | "ticket" | "transfer" | "refund" | "pool" | "album" | "broadcast" | "system"
    channel        = Column(String(20), default="in_app", nullable=False)
    # "in_app" | "email" | "push" — registro de medio elegido
    title          = Column(String(200), nullable=False)
    body           = Column(Text, default="")
    link           = Column(String(300), nullable=True)
    status         = Column(String(20), default="sent", nullable=False)
    # "queued" | "sent" | "delivered" | "failed"
    read           = Column(Boolean, default=False, nullable=False)
    created_at     = Column(DateTime(timezone=True), default=_now, nullable=False, index=True)
    read_at        = Column(DateTime(timezone=True), nullable=True)
    correlation_id = Column(String(60), nullable=True, index=True)
    meta           = Column(JSON, default=dict)

    user = relationship("User")


class NotificationPreference(Base):
    """
    Preferencias por usuario — espejo del toggle de la pantalla Perfil.
    Si no existe registro, se asumen todos los toggles en True excepto marketing.
    """
    __tablename__ = "notification_preferences"

    user_id          = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    goals_live       = Column(Boolean, default=True,  nullable=False)
    my_predictions   = Column(Boolean, default=True,  nullable=False)
    groups           = Column(Boolean, default=True,  nullable=False)
    tickets          = Column(Boolean, default=True,  nullable=False)
    reminders        = Column(Boolean, default=True,  nullable=False)
    marketing        = Column(Boolean, default=False, nullable=False)
    updated_at       = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    user = relationship("User")


# ─── Audit Logs ───────────────────────────────────────────────────────────────

class AuditLog(Base):
    """
    Log de auditoría de eventos del sistema.
    Consumido por Splunk/ElasticSearch mediante JSON stdout.
    También persiste los eventos críticos en BD para compliance.
    """
    __tablename__ = "audit_logs"

    id             = Column(String(36), primary_key=True, default=_uuid)
    timestamp      = Column(DateTime(timezone=True), default=_now, index=True)
    level          = Column(String(10), default="INFO")       # "INFO"|"WARN"|"ERROR"
    service        = Column(String(40), default="api")
    user_id        = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email     = Column(String(200), nullable=True)
    action         = Column(String(80), nullable=False, index=True)
    resource       = Column(String(200), nullable=True)
    status_code    = Column(Integer, nullable=True)
    correlation_id = Column(String(60), nullable=True, index=True)
    ip_address     = Column(String(60), nullable=True)
    details        = Column(JSON, default=dict)
