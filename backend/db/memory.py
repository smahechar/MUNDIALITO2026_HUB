"""
Capa de acceso a datos de usuarios — PostgreSQL via SQLAlchemy.
Reemplaza el dict en memoria del archivo original.

Contrato de retorno: las funciones devuelven dicts (no modelos ORM)
para no acoplar los routers al ORM.
"""

from db.database import SessionLocal
from db.models import User


# ─── Conversión modelo → dict ─────────────────────────────────────────────────

def _to_dict(user: User) -> dict:
    return {
        "id":              user.id,
        "name":            user.name,
        "handle":          user.handle,
        "email":           user.email,
        "role":            user.role,
        "status":          user.status,
        "timezone":        user.timezone or "UTC-5",
        "city":            user.city or "",
        "favoriteTeams":   user.favorite_teams or [],
        "avatar":          user.avatar,
        "createdAt":       user.created_at.isoformat() if user.created_at else None,
        "hashed_password": user.hashed_password,
    }


# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_user_by_email(email: str) -> dict | None:
    """SELECT * FROM users WHERE email = :email"""
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        return _to_dict(user) if user else None


def get_user_by_id(user_id: str) -> dict | None:
    """SELECT * FROM users WHERE id = :user_id"""
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        return _to_dict(user) if user else None


def get_user_by_handle(handle: str) -> dict | None:
    """SELECT * FROM users WHERE handle = :handle"""
    with SessionLocal() as db:
        h = handle if handle.startswith("@") else f"@{handle}"
        user = db.query(User).filter(User.handle == h).first()
        return _to_dict(user) if user else None


def create_user(user: dict) -> dict:
    """INSERT INTO users (...) VALUES (...)"""
    with SessionLocal() as db:
        db_user = User(
            id=user["id"],
            name=user["name"],
            handle=user["handle"],
            email=user["email"].lower(),
            role=user.get("role", "user"),
            status=user.get("status", "active"),
            timezone=user.get("timezone", "UTC-5"),
            city=user.get("city", ""),
            favorite_teams=user.get("favoriteTeams", []),
            avatar=user.get("avatar"),
            hashed_password=user["hashed_password"],
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return _to_dict(db_user)


def update_user(email: str, patch: dict) -> dict | None:
    """UPDATE users SET ... WHERE email = :email"""
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        # camelCase → snake_case mapping
        field_map = {
            "name":          "name",
            "timezone":      "timezone",
            "city":          "city",
            "favoriteTeams": "favorite_teams",
            "avatar":        "avatar",
        }
        for camel, snake in field_map.items():
            if camel in patch:
                setattr(user, snake, patch[camel])
        db.commit()
        db.refresh(user)
        return _to_dict(user)


def get_all_users() -> list:
    """SELECT * FROM users ORDER BY created_at DESC"""
    with SessionLocal() as db:
        users = db.query(User).order_by(User.created_at.desc()).all()
        return [_to_dict(u) for u in users]


def update_user_status(user_id: str, status: str) -> dict | None:
    """UPDATE users SET status = :status WHERE id = :user_id"""
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        user.status = status
        db.commit()
        db.refresh(user)
        return _to_dict(user)
