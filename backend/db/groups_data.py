"""
Capa de acceso a grupos sociales — PostgreSQL via SQLAlchemy.
"""

import random
import string
import uuid
from datetime import datetime, timezone

from db.database import SessionLocal
from db.models import Group, GroupMember, GroupActivity, User

_COLOR_OPTIONS = ["var(--green)", "var(--gold)", "var(--red)", "var(--ink)"]

_DISCOVER_STATIC = [
    {"id": "dg1", "name": "Colombia Supporters",  "code": "COLSUP", "type": "Hinchada",    "members": 1284, "city": "Multi-sede",      "open": True},
    {"id": "dg2", "name": "Bienestar El Bosque",  "code": "BIENES", "type": "Universidad", "members": 412,  "city": "Miami",           "open": True},
    {"id": "dg3", "name": "Nómadas 2026",          "code": "NOMAD6", "type": "Viajeros",    "members": 238,  "city": "Multi-sede",      "open": False},
    {"id": "dg4", "name": "Bar Fútbol Chapinero",  "code": "CHAPI4", "type": "Fan Zone",    "members": 67,   "city": "Bogotá (remoto)", "open": True},
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _gen_code(name: str, db) -> str:
    prefix = "".join(c for c in name.upper() if c.isalpha())[:6].ljust(3, "X")
    for _ in range(20):
        code = prefix + "".join(random.choices(string.digits, k=3))
        if not db.query(Group).filter(Group.code == code).first():
            return code
    return prefix + uuid.uuid4().hex[:4].upper()


def _group_to_dict(g: Group, viewer_email: str | None = None) -> dict:
    members = g.members or []
    your_role = None

    if viewer_email:
        your_member = next(
            (m for m in members if m.user and m.user.email == viewer_email), None
        )
        your_role = your_member.role if your_member else None

    member_list = [
        {
            "id":     m.user_id,
            "name":   m.user.name if m.user else "—",
            "avatar": (m.user.name[0].upper() if m.user and m.user.name else "?"),
            "pts":    m.pts,
            "isYou":  (m.user.email == viewer_email) if m.user and viewer_email else False,
        }
        for m in members
    ]

    return {
        "id":          g.id,
        "name":        g.name,
        "code":        g.code,
        "type":        g.type,
        "city":        g.city,
        "color":       g.color,
        "description": g.description,
        "isOpen":      g.is_open,
        "members":     len(members),
        "memberList":  member_list,
        "yourRole":    your_role,
        "createdAt":   g.created_at.isoformat() if g.created_at else None,
    }


def _activity_to_dict(a: GroupActivity) -> dict:
    return {
        "id":        a.id,
        "type":      a.type,
        "text":      a.text,
        "createdAt": a.created_at.isoformat() if a.created_at else None,
    }


def _add_activity(db, group_id: str, atype: str, user_name: str, text: str) -> None:
    db.add(GroupActivity(
        group_id=group_id,
        type=atype,
        text=f"{user_name} {text}",
    ))


# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_user_groups(email: str) -> list:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return []
        memberships = db.query(GroupMember).filter(GroupMember.user_id == user.id).all()
        group_ids = [m.group_id for m in memberships]
        groups = db.query(Group).filter(Group.id.in_(group_ids)).all()
        return [_group_to_dict(g, email) for g in groups]


def get_group_by_id(group_id: str, email: str | None = None) -> dict | None:
    with SessionLocal() as db:
        g = db.query(Group).filter(Group.id == group_id).first()
        return _group_to_dict(g, email) if g else None


def get_discover_groups() -> list:
    with SessionLocal() as db:
        public = db.query(Group).filter(Group.is_open == True).all()
        db_groups = [_group_to_dict(g) for g in public]

    db_codes = {g["code"] for g in db_groups}
    extras   = [d for d in _DISCOVER_STATIC if d["code"] not in db_codes]
    return db_groups + extras


def get_group_activity(group_id: str) -> list:
    with SessionLocal() as db:
        acts = (
            db.query(GroupActivity)
            .filter(GroupActivity.group_id == group_id)
            .order_by(GroupActivity.created_at.desc())
            .limit(50)
            .all()
        )
        return [_activity_to_dict(a) for a in acts]






def get_my_groups(user_email_or_id: str):
    """
    Devuelve los grupos a los que pertenece un usuario.
    Acepta email o id.
    """
    from db.database import SessionLocal
    from db.models import Group, GroupMember

    db = SessionLocal()
    try:
        user = _get_user_by_email_or_id(db, user_email_or_id)
        if not user:
            return []

        groups = (
            db.query(Group)
            .join(GroupMember, GroupMember.group_id == Group.id)
            .filter(GroupMember.user_id == user.id)
            .all()
        )

        return [
            {
                "id": group.id,
                "name": group.name,
                "code": group.code,
                "type": group.type,
                "city": group.city,
                "color": group.color,
                "description": group.description,
                "is_open": group.is_open,
                "created_at": group.created_at.isoformat() if group.created_at else None,
            }
            for group in groups
        ]

    finally:
        db.close()

def get_discover(user_email_or_id=None):
    """
    Devuelve grupos públicos/abiertos para la sección descubrir.
    Acepta opcionalmente email/id del usuario porque routers/groups.py llama get_discover(email).
    """
    from db.database import SessionLocal
    from db.models import Group, GroupMember

    db = SessionLocal()
    try:
        user = None
        joined_group_ids = set()

        if user_email_or_id:
            user = _get_user_by_email_or_id(db, user_email_or_id)

        if user:
            memberships = (
                db.query(GroupMember)
                .filter(GroupMember.user_id == user.id)
                .all()
            )
            joined_group_ids = {m.group_id for m in memberships}

        groups = (
            db.query(Group)
            .filter(Group.is_open == True)
            .all()
        )

        result = []

        for group in groups:
            members_count = (
                db.query(GroupMember)
                .filter(GroupMember.group_id == group.id)
                .count()
            )

            result.append({
                "id": group.id,
                "name": group.name,
                "code": group.code,
                "type": group.type,
                "city": group.city,
                "color": group.color,
                "description": group.description,
                "is_open": group.is_open,
                "members": members_count,
                "joined": group.id in joined_group_ids,
                "created_at": group.created_at.isoformat() if group.created_at else None,
            })

        return result

    finally:
        db.close()


def get_group(group_id: str):
    """
    Devuelve el detalle de un grupo por ID.
    Función requerida por routers/groups.py.
    """
    from db.database import SessionLocal
    from db.models import Group, GroupMember, User, GroupActivity

    db = SessionLocal()
    try:
        group = (
            db.query(Group)
            .filter(Group.id == group_id)
            .first()
        )

        if not group:
            return None

        members = (
            db.query(GroupMember, User)
            .join(User, User.id == GroupMember.user_id)
            .filter(GroupMember.group_id == group.id)
            .all()
        )

        activities = (
            db.query(GroupActivity)
            .filter(GroupActivity.group_id == group.id)
            .order_by(GroupActivity.created_at.desc())
            .limit(20)
            .all()
        )

        return {
            "id": group.id,
            "name": group.name,
            "code": group.code,
            "type": group.type,
            "city": group.city,
            "color": group.color,
            "description": group.description,
            "is_open": group.is_open,
            "created_at": group.created_at.isoformat() if group.created_at else None,
            "members": [
                {
                    "id": user.id,
                    "name": user.name,
                    "handle": user.handle,
                    "email": user.email,
                    "role": member.role,
                    "pts": member.pts,
                    "joined_at": member.joined_at.isoformat() if member.joined_at else None,
                }
                for member, user in members
            ],
            "activities": [
                {
                    "id": activity.id,
                    "type": activity.type,
                    "text": activity.text,
                    "user_id": activity.user_id,
                    "created_at": activity.created_at.isoformat() if activity.created_at else None,
                }
                for activity in activities
            ],
        }

    finally:
        db.close()


def _get_user_by_email_or_id(db, email_or_id: str):
    """
    Busca un usuario por email o por id.
    Sirve porque algunos routers envían g.current_user["email"].
    """
    from db.models import User

    return (
        db.query(User)
        .filter((User.email == email_or_id) | (User.id == email_or_id))
        .first()
    )







def get_activity(group_id: str):
    """
    Devuelve la actividad reciente de un grupo.
    Función requerida por routers/groups.py.
    """
    from db.database import SessionLocal
    from db.models import GroupActivity, User

    db = SessionLocal()
    try:
        rows = (
            db.query(GroupActivity, User)
            .outerjoin(User, User.id == GroupActivity.user_id)
            .filter(GroupActivity.group_id == group_id)
            .order_by(GroupActivity.created_at.desc())
            .limit(50)
            .all()
        )

        return [
            {
                "id": activity.id,
                "group_id": activity.group_id,
                "user_id": activity.user_id,
                "user_name": user.name if user else None,
                "user_handle": user.handle if user else None,
                "type": activity.type,
                "text": activity.text,
                "created_at": activity.created_at.isoformat() if activity.created_at else None,
            }
            for activity, user in rows
        ]

    finally:
        db.close()

def create_group(user_email_or_id: str, current_user=None, payload=None):
    """
    Crea un grupo y agrega al usuario creador como admin.
    Compatible con:
    create_group(g.current_user["email"], g.current_user, body)
    """
    from db.database import SessionLocal
    from db.models import Group, GroupMember, GroupActivity
    import uuid

    if payload is None:
        payload = {}

    db = SessionLocal()
    try:
        user = _get_user_by_email_or_id(db, user_email_or_id)
        if not user:
            return None, "Usuario no encontrado"

        name = payload.get("name", "").strip()
        if not name:
            return None, "El nombre del grupo es obligatorio"

        code = payload.get("code")
        if not code:
            code = str(uuid.uuid4())[:8].upper()

        exists = db.query(Group).filter(Group.code == code).first()
        if exists:
            return None, "Ya existe un grupo con ese código"

        group = Group(
            name=name,
            code=code,
            type=payload.get("type", "Privado"),
            city=payload.get("city", ""),
            color=payload.get("color", "var(--ink)"),
            description=payload.get("description", ""),
            is_open=bool(payload.get("is_open", payload.get("isOpen", False))),
            created_by=user.id,
        )

        db.add(group)
        db.flush()

        db.add(GroupMember(
            group_id=group.id,
            user_id=user.id,
            role="admin",
            pts=0,
        ))

        db.add(GroupActivity(
            group_id=group.id,
            user_id=user.id,
            type="join",
            text=f"{user.name} creó el grupo {group.name}.",
        ))

        db.commit()

        return _group_to_dict(group, user.email), None

    except Exception as e:
        db.rollback()
        return None, str(e)

    finally:
        db.close()


def join_group(code_or_group_id: str, user_email_or_id: str):
    """
    Une un usuario a un grupo por código o por ID.
    Compatible con routers/groups.py.
    """
    from db.database import SessionLocal
    from db.models import Group, GroupMember, GroupActivity

    db = SessionLocal()
    try:
        user = _get_user_by_email_or_id(db, user_email_or_id)
        if not user:
            return None, "Usuario no encontrado"

        group = (
            db.query(Group)
            .filter((Group.code == code_or_group_id.upper()) | (Group.id == code_or_group_id))
            .first()
        )

        if not group:
            return None, "Grupo no encontrado"

        existing = (
            db.query(GroupMember)
            .filter(
                GroupMember.group_id == group.id,
                GroupMember.user_id == user.id,
            )
            .first()
        )

        if existing:
            return _group_to_dict(group, user.email), None

        db.add(GroupMember(
            group_id=group.id,
            user_id=user.id,
            role="member",
            pts=0,
        ))

        db.add(GroupActivity(
            group_id=group.id,
            user_id=user.id,
            type="join",
            text=f"{user.name} se unió al grupo.",
        ))

        db.commit()

        return _group_to_dict(group, user.email), None

    except Exception as e:
        db.rollback()
        return None, str(e)

    finally:
        db.close()


def leave_group(group_id: str, user_email_or_id: str):
    """
    Retira al usuario autenticado de un grupo.
    Compatible con routers/groups.py.
    """
    from db.database import SessionLocal
    from db.models import Group, GroupMember, GroupActivity

    db = SessionLocal()
    try:
        user = _get_user_by_email_or_id(db, user_email_or_id)
        if not user:
            return False, "Usuario no encontrado"

        group = db.query(Group).filter(Group.id == group_id).first()
        if not group:
            return False, "Grupo no encontrado"

        member = (
            db.query(GroupMember)
            .filter(
                GroupMember.group_id == group.id,
                GroupMember.user_id == user.id,
            )
            .first()
        )

        if not member:
            return False, "No eres miembro de este grupo"

        db.delete(member)

        db.add(GroupActivity(
            group_id=group.id,
            user_id=user.id,
            type="leave",
            text=f"{user.name} abandonó el grupo.",
        ))

        db.commit()

        return True, None

    except Exception as e:
        db.rollback()
        return False, str(e)

    finally:
        db.close()