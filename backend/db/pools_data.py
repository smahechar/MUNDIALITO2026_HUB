"""
Capa de acceso a pollas — PostgreSQL via SQLAlchemy.
"""

import random
import string
import uuid
from datetime import datetime, timezone

from db.database import SessionLocal
from db.models import Pool, PoolMember, User

# ─── Descubrir pollas (semi-estático por ahora) ───────────────────────────────
_DISCOVER_STATIC = [
    {"id": "d1", "code": "BIENESTAR", "name": "Bienestar Universitario",  "members": 412,   "prize": "Camiseta oficial",          "host": "Univ. El Bosque"},
    {"id": "d2", "code": "INGSYS",    "name": "Ingenieros de Sistemas",   "members": 1184,  "prize": "Suscripcion premium",       "host": "Facultad"},
    {"id": "d3", "code": "ALUMNI",    "name": "Alumni 2024-2025",         "members": 238,   "prize": "Cena de exalumnos",         "host": "Asociacion"},
    {"id": "d4", "code": "LATAM",     "name": "Latam — Casuales",         "members": 8920,  "prize": "Bragging rights",           "host": "Comunidad"},
    {"id": "d5", "code": "WORKMATES", "name": "Equipo de Marketing",      "members": 42,    "prize": "Dia libre",                 "host": "Privada"},
    {"id": "d6", "code": "GLOBAL",    "name": "Global · Hub Oficial",     "members": 18420, "prize": "Top 100 → camiseta firmada","host": "Oficial"},
]

_SCORING_RULES = [
    {"id": "exact",   "label": "Marcador exacto",     "pts": 30, "desc": "Aciertas el resultado completo"},
    {"id": "diff",    "label": "Diferencia de goles", "pts": 15, "desc": "Aciertas la diferencia exacta"},
    {"id": "winner",  "label": "Ganador",             "pts": 10, "desc": "Aciertas quien gana o empate, sin marcador"},
    {"id": "bonus_2x","label": "Double Down ×2",       "pts": 0,  "desc": "Duplica tus puntos si aciertas (una vez por jornada)"},
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _gen_code(name: str, db) -> str:
    prefix = "".join(c for c in name.upper() if c.isalpha())[:6].ljust(3, "X")
    for _ in range(20):
        code = prefix + "".join(random.choices(string.digits, k=3))
        if not db.query(Pool).filter(Pool.code == code).first():
            return code
    return prefix + str(uuid.uuid4().hex[:4]).upper()


def _pool_to_dict(pool: Pool, user_id: str | None = None) -> dict:
    members = pool.members or []
    total   = len(members)
    you_rank = None
    your_pts = 0
    top_member = max(members, key=lambda m: m.pts, default=None)

    if user_id:
        you = next((m for m in members if m.user_id == user_id), None)
        if you:
            sorted_members = sorted(members, key=lambda m: -m.pts)
            you_rank = next((i + 1 for i, m in enumerate(sorted_members) if m.user_id == user_id), None)
            your_pts = you.pts

    return {
        "id":       pool.id,
        "name":     pool.name,
        "code":     pool.code,
        "hostType": pool.host_type,
        "prize":    pool.prize,
        "members":  total,
        "you":      you_rank,
        "yourPts":  your_pts,
        "top":      top_member.user.name if top_member and top_member.user else "—",
        "topPts":   top_member.pts if top_member else 0,
        "isPublic": pool.is_public,
    }


def _member_to_dict(pm: PoolMember, rank: int) -> dict:
    return {
        "id":         pm.user_id,
        "name":       pm.user.name if pm.user else "—",
        "pts":        pm.pts,
        "exact":      pm.exact,
        "winner":     pm.winner,
        "lastChange": pm.last_change,
        "hot":        pm.hot,
        "rank":       rank,
        "isYou":      False,  # el router sobreescribe este campo si hace falta
    }


# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_user_pools(email: str) -> list:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return []
        memberships = (
            db.query(PoolMember)
            .filter(PoolMember.user_id == user.id)
            .all()
        )
        pool_ids = [m.pool_id for m in memberships]
        pools = db.query(Pool).filter(Pool.id.in_(pool_ids)).all()
        return [_pool_to_dict(p, user.id) for p in pools]


def get_pool_by_id(pool_id: str) -> dict | None:
    with SessionLocal() as db:
        p = db.query(Pool).filter(Pool.id == pool_id).first()
        return _pool_to_dict(p) if p else None


def get_pool_by_code(code: str) -> dict | None:
    with SessionLocal() as db:
        p = db.query(Pool).filter(Pool.code == code.upper()).first()
        return _pool_to_dict(p) if p else None


def get_pool_members(pool_id: str) -> list:
    with SessionLocal() as db:
        members = (
            db.query(PoolMember)
            .filter(PoolMember.pool_id == pool_id)
            .order_by(PoolMember.pts.desc())
            .all()
        )
        return [_member_to_dict(pm, rank + 1) for rank, pm in enumerate(members)]


def get_discover_pools() -> list:
    with SessionLocal() as db:
        public_pools = (
            db.query(Pool)
            .filter(Pool.is_public == True)
            .all()
        )

        return [_pool_to_dict(p) for p in public_pools]


def get_scoring_rules() -> list:
    return _SCORING_RULES


def create_pool(body: dict, email: str) -> dict:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            raise ValueError("Usuario no encontrado")

        code = _gen_code(body.get("name", "POOL"), db)
        pool = Pool(
            id=str(uuid.uuid4()),
            name=body["name"].strip(),
            code=code,
            host_type=body.get("hostType", "Privada"),
            prize=body.get("prize", ""),
            is_public=bool(body.get("isPublic", False)),
            created_by=user.id,
        )
        db.add(pool)
        db.flush()

        # El creador es miembro automáticamente
        db.add(PoolMember(pool_id=pool.id, user_id=user.id))
        db.commit()
        db.refresh(pool)
        return _pool_to_dict(pool, user.id)


def join_pool(code: str, email: str) -> dict | None:
    with SessionLocal() as db:
        pool = db.query(Pool).filter(Pool.code == code.upper()).first()
        if not pool:
            return None

        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None

        existing = db.query(PoolMember).filter(
            PoolMember.pool_id == pool.id,
            PoolMember.user_id == user.id,
        ).first()
        if not existing:
            db.add(PoolMember(pool_id=pool.id, user_id=user.id))
            db.commit()

        db.refresh(pool)
        return _pool_to_dict(pool, user.id)
