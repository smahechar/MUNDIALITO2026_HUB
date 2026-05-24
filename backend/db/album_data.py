"""
Capa de acceso al álbum digital — PostgreSQL via SQLAlchemy.
"""

import random
import uuid
from datetime import datetime, timezone

from db.database import SessionLocal
from db.models import Sticker, UserSticker, Trade, User

# ─── Catálogo estático de plantilla de láminas ────────────────────────────────
_TEMPLATE = [
    (1,  "Escudo",        "badge",   "C"),
    (2,  "Portero",       "player",  "C"),
    (3,  "Defensa #1",    "player",  "C"),
    (4,  "Defensa #2",    "player",  "C"),
    (5,  "Mediocampista", "player",  "R"),
    (6,  "Capitan",       "player",  "E"),
    (7,  "Delantero #1",  "player",  "R"),
    (8,  "Delantero #2",  "player",  "C"),
    (9,  "Estadio",       "stadium", "R"),
    (10, "Kit local",     "kit",     "C"),
    (11, "Kit visitante", "kit",     "C"),
    (12, "MOMENTO",       "moment",  "L"),
]

_RARITY_WEIGHT = {"C": 60, "R": 25, "E": 12, "L": 3}
ALBUM_TOTAL = 288  # 24 naciones × 12 slots


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _sticker_to_dict(s: Sticker, count: int = 0) -> dict:
    return {
        "id":        s.id,
        "num":       s.num,
        "nation":    s.nation,
        "slot":      s.slot,
        "name":      s.name,
        "shortName": s.short_name,
        "type":      s.type,
        "rarity":    s.rarity,
        "owned":     count > 0,
        "count":     count,
    }


def _compute_stats(collection: dict[str, int], nations_codes: list[str]) -> dict:
    owned  = sum(1 for c in collection.values() if c > 0)
    dupes  = sum(1 for c in collection.values() if c > 1)
    sets   = sum(
        1 for code in nations_codes
        if all(collection.get(f"{code}-{str(s).zfill(2)}", 0) > 0 for s, *_ in _TEMPLATE)
    )
    return {
        "total":        ALBUM_TOTAL,
        "owned":        owned,
        "duplicates":   dupes,
        "missing":      ALBUM_TOTAL - owned,
        "pct":          round(owned / ALBUM_TOTAL * 100) if ALBUM_TOTAL else 0,
        "setsComplete": sets,
    }


def _get_collection(db, user_id: str) -> dict[str, int]:
    """Devuelve {sticker_id: count} para un usuario."""
    rows = db.query(UserSticker).filter(UserSticker.user_id == user_id).all()
    return {r.sticker_id: r.count for r in rows}


def _get_nations_codes(db) -> list[str]:
    from db.models import Nation
    return [n.code for n in db.query(Nation).order_by(Nation.code).all()]


# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_album(email: str) -> dict:
    """SELECT stickers + user_stickers JOIN WHERE user.email = :email"""
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return {"stickers": [], "stats": {}}

        col    = _get_collection(db, user.id)
        all_s  = db.query(Sticker).order_by(Sticker.num).all()
        codes  = _get_nations_codes(db)

        stickers = [_sticker_to_dict(s, col.get(s.id, 0)) for s in all_s]
        return {"stickers": stickers, "stats": _compute_stats(col, codes)}


def open_pack(email: str) -> dict:
    """
    Abre un sobre de 5 láminas únicas.
    - Garantiza ≥1 lámina R/E/L.
    - Prioriza láminas faltantes (70% del tiempo).
    Actualiza user_stickers en BD.
    """
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return {"stickers": [], "stats": {}}

        col    = _get_collection(db, user.id)
        all_s  = db.query(Sticker).all()
        missing = [s for s in all_s if col.get(s.id, 0) == 0]
        pack:   list[Sticker] = []
        used:   set[str]      = set()

        # Lámina 1: rareza garantizada, preferir faltantes
        rare_missing = [s for s in missing if s.rarity != "C"]
        rare_pool    = rare_missing if rare_missing else [s for s in all_s if s.rarity != "C"]
        first = random.choice(rare_pool)
        pack.append(first)
        used.add(first.id)

        # Láminas 2-5
        for _ in range(4):
            avail_missing = [s for s in missing if s.id not in used]
            if avail_missing and random.random() < 0.7:
                pick = random.choices(
                    avail_missing,
                    weights=[_RARITY_WEIGHT[s.rarity] for s in avail_missing], k=1
                )[0]
            else:
                avail_all = [s for s in all_s if s.id not in used]
                pick = random.choices(
                    avail_all,
                    weights=[_RARITY_WEIGHT[s.rarity] for s in avail_all], k=1
                )[0]
            pack.append(pick)
            used.add(pick.id)

        # Persistir en user_stickers
        for s in pack:
            row = db.query(UserSticker).filter(
                UserSticker.user_id == user.id,
                UserSticker.sticker_id == s.id,
            ).first()
            if row:
                row.count      += 1
                row.updated_at  = datetime.now(timezone.utc)
            else:
                db.add(UserSticker(user_id=user.id, sticker_id=s.id, count=1))

        db.commit()

        # Recargar colección para stats actualizadas
        col_updated = _get_collection(db, user.id)
        codes       = _get_nations_codes(db)

        return {
            "stickers": [_sticker_to_dict(s, col_updated.get(s.id, 0)) for s in pack],
            "stats":    _compute_stats(col_updated, codes),
        }


def get_offers(email: str) -> list:
    """SELECT * FROM trades WHERE proposer_id = :uid OR receiver_id = :uid"""
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return []
        trades = db.query(Trade).filter(
            (Trade.proposer_id == user.id) | (Trade.receiver_id == user.id)
        ).order_by(Trade.created_at.desc()).all()
        return [_trade_to_dict(t, user.id) for t in trades]


def _trade_to_dict(t: Trade, viewer_id: str | None = None) -> dict:
    return {
        "id":           t.id,
        "proposerId":   t.proposer_id,
        "proposerName": t.proposer.name if t.proposer else "—",
        "receiverId":   t.receiver_id,
        "offered":      t.offered or [],
        "requested":    t.requested or [],
        "status":       t.status,
        "isYours":      t.proposer_id == viewer_id,
        "createdAt":    t.created_at.isoformat() if t.created_at else None,
    }


def create_trade(email: str, body: dict) -> tuple[dict | None, str | None]:
    """INSERT INTO trades ..."""
    offered   = body.get("offered", [])
    requested = body.get("requested", [])

    if not offered or not requested:
        return None, "El intercambio debe incluir láminas ofrecidas y solicitadas"

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "Usuario no encontrado"

        # Validar que las láminas existen
        all_ids = set(s.id for s in db.query(Sticker.id).all())
        invalid = [sid for sid in offered + requested if sid not in all_ids]
        if invalid:
            return None, f"Láminas no encontradas: {', '.join(invalid)}"

        # Verificar que el usuario tiene las láminas que ofrece
        col          = _get_collection(db, user.id)
        missing_own  = [sid for sid in offered if col.get(sid, 0) == 0]
        if missing_own:
            return None, "No tenés las láminas que querés ofrecer"

        # Resolver receiver por handle si viene en el body
        receiver_id = None
        receiver_handle = body.get("receiverHandle")
        if receiver_handle:
            h     = receiver_handle if receiver_handle.startswith("@") else f"@{receiver_handle}"
            other = db.query(User).filter(User.handle == h).first()
            if not other:
                return None, f"Usuario {receiver_handle} no encontrado"
            receiver_id = other.id

        trade = Trade(
            id=str(uuid.uuid4()),
            proposer_id=user.id,
            receiver_id=receiver_id,
            offered=offered,
            requested=requested,
            status="pending",
        )
        db.add(trade)
        db.commit()
        db.refresh(trade)
        return _trade_to_dict(trade, user.id), None
