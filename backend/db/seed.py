"""
Script de seed — carga datos iniciales en PostgreSQL.
Ejecutar UNA SOLA VEZ después de crear las tablas:

    cd backend
    python -m db.seed

Idempotente: no duplica datos si ya existen.
"""

import sys
import os

# Asegura que el directorio backend esté en el path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone, timedelta
from db.database import engine, Base, SessionLocal
from db.models import (
    User, Nation, Match, Sticker,
    Pool, PoolMember,
)
from core.security import hash_password

# ─── Crear tablas ─────────────────────────────────────────────────────────────

def create_tables():
    print("📦 Creando tablas…")
    Base.metadata.create_all(bind=engine)
    print("   ✅ Tablas OK")


# ─── Naciones ─────────────────────────────────────────────────────────────────

NATIONS_DATA = [
    {"code": "ATL", "name": "Atlantica",  "group": "A", "colors": ["#1a4ed1", "#ffffff", "#d6362a"], "layout": "v"},
    {"code": "BOR", "name": "Borealis",   "group": "A", "colors": ["#0e3b2a", "#f4b500", "#0e3b2a"], "layout": "h"},
    {"code": "CAR", "name": "Carpathia",  "group": "A", "colors": ["#d6362a", "#0c0c0d", "#f4b500"], "layout": "v"},
    {"code": "DUR", "name": "Durango",    "group": "A", "colors": ["#0c0c0d", "#d6362a", "#ffffff"], "layout": "h"},
    {"code": "ESP", "name": "Esperanza",  "group": "B", "colors": ["#0e3b2a", "#ffffff", "#d6362a"], "layout": "diag"},
    {"code": "FRJ", "name": "Fjordland",  "group": "B", "colors": ["#1a6ee0", "#ffffff", "#1a6ee0"], "layout": "h"},
    {"code": "GAL", "name": "Galicia",    "group": "B", "colors": ["#f4b500", "#0c0c0d", "#f4b500"], "layout": "v"},
    {"code": "HEL", "name": "Helvetia",   "group": "B", "colors": ["#d6362a", "#ffffff", "#d6362a"], "layout": "cross"},
    {"code": "INK", "name": "Inkala",     "group": "C", "colors": ["#7c3aff", "#f4b500", "#0c0c0d"], "layout": "v"},
    {"code": "JOR", "name": "Joriba",     "group": "C", "colors": ["#0e3b2a", "#f4b500", "#d6362a"], "layout": "h"},
    {"code": "KAL", "name": "Kalandra",   "group": "C", "colors": ["#1a6ee0", "#ffffff", "#f4b500"], "layout": "diag"},
    {"code": "LUM", "name": "Lumeria",    "group": "C", "colors": ["#ffffff", "#1a6ee0", "#d6362a"], "layout": "h"},
    {"code": "MER", "name": "Meridian",   "group": "D", "colors": ["#0c0c0d", "#f4b500", "#0c0c0d"], "layout": "v"},
    {"code": "NOV", "name": "Novara",     "group": "D", "colors": ["#d6362a", "#f4b500", "#0e3b2a"], "layout": "v"},
    {"code": "ORY", "name": "Oryana",     "group": "D", "colors": ["#1a6ee0", "#d6362a", "#ffffff"], "layout": "h"},
    {"code": "PAR", "name": "Parana",     "group": "D", "colors": ["#0e3b2a", "#ffffff", "#f4b500"], "layout": "diag"},
    {"code": "QUI", "name": "Quintara",   "group": "E", "colors": ["#7c3aff", "#ffffff", "#0c0c0d"], "layout": "h"},
    {"code": "RHO", "name": "Rhodian",    "group": "E", "colors": ["#d6362a", "#ffffff", "#1a6ee0"], "layout": "v"},
    {"code": "SAB", "name": "Sabinia",    "group": "E", "colors": ["#f4b500", "#d6362a", "#0c0c0d"], "layout": "diag"},
    {"code": "TER", "name": "Terramar",   "group": "E", "colors": ["#0e3b2a", "#1a6ee0", "#0e3b2a"], "layout": "h"},
    {"code": "URS", "name": "Ursalia",    "group": "F", "colors": ["#0c0c0d", "#d6362a", "#ffffff"], "layout": "diag"},
    {"code": "VAL", "name": "Valdoria",   "group": "F", "colors": ["#ffffff", "#0e3b2a", "#d6362a"], "layout": "v"},
    {"code": "WIN", "name": "Windhelm",   "group": "F", "colors": ["#1a6ee0", "#f4b500", "#ffffff"], "layout": "h"},
    {"code": "XAN", "name": "Xandar",     "group": "F", "colors": ["#7c3aff", "#0c0c0d", "#f4b500"], "layout": "v"},
]


def seed_nations(db):
    print("🌍 Sembrando naciones…")
    count = 0
    for n in NATIONS_DATA:
        existing = db.query(Nation).filter(Nation.code == n["code"]).first()
        if not existing:
            db.add(Nation(**n))
            count += 1
    db.flush()
    print(f"   ✅ {count} naciones nuevas / {len(NATIONS_DATA) - count} ya existían")


# ─── Partidos ─────────────────────────────────────────────────────────────────

def _dt(iso: str) -> datetime:
    return datetime.fromisoformat(iso.replace("Z", "+00:00"))


MATCHES_DATA = [
    {
        "id": "m1",  "home": "ATL", "away": "DUR", "group_name": "A",
        "stadium": "Arena Aurora",   "city": "Norden",     "phase": "Group A · MD2",
        "status": "live",     "minute": "67'", "home_score": 2,  "away_score": 1,
        "kickoff": _dt("2026-06-12T20:00:00Z"),
    },
    {
        "id": "m2",  "home": "JOR", "away": "LUM", "group_name": "C",
        "stadium": "Estadio Sol",    "city": "Sereno",     "phase": "Group C · MD2",
        "status": "live",     "minute": "32'", "home_score": 0,  "away_score": 0,
        "kickoff": _dt("2026-06-12T20:30:00Z"),
    },
    {
        "id": "m3",  "home": "INK", "away": "KAL", "group_name": "C",
        "stadium": "Coliseu Mare",   "city": "Porto Mare", "phase": "Group C · MD2",
        "status": "halftime", "minute": "HT",  "home_score": 1,  "away_score": 1,
        "kickoff": _dt("2026-06-12T18:00:00Z"),
    },
    {
        "id": "m4",  "home": "ESP", "away": "GAL", "group_name": "B",
        "stadium": "Estadio Alma",   "city": "Brava",      "phase": "Group B · MD3",
        "status": "upcoming", "minute": None,  "home_score": None, "away_score": None,
        "kickoff": _dt("2026-06-13T17:00:00Z"),
    },
    {
        "id": "m5",  "home": "MER", "away": "PAR", "group_name": "D",
        "stadium": "Velódromo Cima", "city": "Cima",       "phase": "Group D · MD3",
        "status": "upcoming", "minute": None,  "home_score": None, "away_score": None,
        "kickoff": _dt("2026-06-13T20:00:00Z"),
    },
    {
        "id": "m6",  "home": "BOR", "away": "CAR", "group_name": "A",
        "stadium": "Polar Bowl",     "city": "Bjarki",     "phase": "Group A · MD2",
        "status": "final",    "minute": "FT",  "home_score": 3,  "away_score": 2,
        "kickoff": _dt("2026-06-12T16:00:00Z"),
    },
    {
        "id": "m7",  "home": "QUI", "away": "TER", "group_name": "E",
        "stadium": "Estadio Norte",  "city": "Vesna",      "phase": "Group E · MD2",
        "status": "final",    "minute": "FT",  "home_score": 0,  "away_score": 0,
        "kickoff": _dt("2026-06-12T13:00:00Z"),
    },
    {
        "id": "m8",  "home": "URS", "away": "WIN", "group_name": "F",
        "stadium": "Stadtarena",     "city": "Stahlfeld",  "phase": "Group F · MD2",
        "status": "upcoming", "minute": None,  "home_score": None, "away_score": None,
        "kickoff": _dt("2026-06-13T13:00:00Z"),
    },
    {
        "id": "m9",  "home": "DUR", "away": "BOR", "group_name": "A",
        "stadium": "Arena Aurora",   "city": "Norden",     "phase": "Group A · MD3",
        "status": "upcoming", "minute": None,  "home_score": None, "away_score": None,
        "kickoff": _dt("2026-06-15T20:00:00Z"),
    },
    {
        "id": "m10", "home": "CAR", "away": "ATL", "group_name": "A",
        "stadium": "Polar Bowl",     "city": "Bjarki",     "phase": "Group A · MD3",
        "status": "upcoming", "minute": None,  "home_score": None, "away_score": None,
        "kickoff": _dt("2026-06-15T20:00:00Z"),
    },
    {
        "id": "m11", "home": "HEL", "away": "FRJ", "group_name": "B",
        "stadium": "Estadio Alma",   "city": "Brava",      "phase": "Group B · MD3",
        "status": "upcoming", "minute": None,  "home_score": None, "away_score": None,
        "kickoff": _dt("2026-06-15T17:00:00Z"),
    },
    {
        "id": "m12", "home": "GAL", "away": "HEL", "group_name": "B",
        "stadium": "Coliseu Mare",   "city": "Porto Mare", "phase": "Group B · MD2",
        "status": "final",    "minute": "FT",  "home_score": 1,  "away_score": 0,
        "kickoff": _dt("2026-06-11T16:00:00Z"),
    },
]


def seed_matches(db):
    print("⚽ Sembrando partidos…")
    count = 0
    for m in MATCHES_DATA:
        existing = db.query(Match).filter(Match.id == m["id"]).first()
        if not existing:
            db.add(Match(**m))
            count += 1
    db.flush()
    print(f"   ✅ {count} partidos nuevos / {len(MATCHES_DATA) - count} ya existían")


# ─── Catálogo de láminas ──────────────────────────────────────────────────────

_STICKER_TEMPLATE = [
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


def seed_stickers(db):
    print("🃏 Sembrando catálogo de láminas…")
    num = 1
    count = 0
    for nation in NATIONS_DATA:
        for (slot, name, stype, rarity) in _STICKER_TEMPLATE:
            sticker_id = f"{nation['code']}-{str(slot).zfill(2)}"
            existing = db.query(Sticker).filter(Sticker.id == sticker_id).first()
            if not existing:
                db.add(Sticker(
                    id=sticker_id,
                    num=num,
                    nation=nation["code"],
                    slot=slot,
                    name=f"{nation['code']} · {name}",
                    short_name=name,
                    type=stype,
                    rarity=rarity,
                ))
                count += 1
            num += 1
    db.flush()
    print(f"   ✅ {count} láminas nuevas / {288 - count} ya existían (total esperado: 288)")


# ─── Usuario admin por defecto ────────────────────────────────────────────────

def seed_admin(db):
    print("👤 Verificando usuario admin…")
    admin_email = "admin@mundialitohub.com"
    existing = db.query(User).filter(User.email == admin_email).first()
    if not existing:
        db.add(User(
            id="admin_1",
            name="Admin",
            handle="@admin",
            email=admin_email,
            role="admin",
            status="active",
            timezone="UTC-5",
            city="",
            favorite_teams=[],
            avatar=None,
            hashed_password=hash_password("Admin2026!"),  # cambiar en producción
        ))
        db.flush()
        print("   ✅ Admin creado — email: admin@mundialitohub.com / password: Admin2026!")
        print("   ⚠️  CAMBIAR LA CONTRASEÑA DEL ADMIN EN PRODUCCIÓN")
    else:
        print("   ℹ️  Admin ya existe")


# ─── Pool global de muestra ───────────────────────────────────────────────────

def seed_global_pool(db):
    print("🏆 Verificando polla global…")
    existing = db.query(Pool).filter(Pool.id == "pool_global").first()
    if not existing:
        db.add(Pool(
            id="pool_global",
            name="Global · Hub Oficial",
            code="GLOBAL",
            host_type="Global",
            prize="Top 100 → camiseta firmada",
            is_public=True,
        ))
        db.flush()
        print("   ✅ Polla global creada (código: GLOBAL)")
    else:
        print("   ℹ️  Polla global ya existe")


# ─── Main ─────────────────────────────────────────────────────────────────────

def run():
    print("\n🌐 Mundialito 2026 Hub — Seed de base de datos")
    print("=" * 50)
    create_tables()

    with SessionLocal() as db:
        seed_nations(db)
        seed_matches(db)
        seed_stickers(db)
        seed_admin(db)
        seed_global_pool(db)
        db.commit()

    print("=" * 50)
    print("✅ Seed completado exitosamente\n")


if __name__ == "__main__":
    run()
