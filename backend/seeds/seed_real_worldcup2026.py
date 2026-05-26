from datetime import datetime, timezone
from db.database import SessionLocal
from db.models import Nation, Match, Sticker

# Si tienes modelo Stadium, impórtalo.
# Si no lo tienes, usamos SQL directo para stadiums.
from sqlalchemy import text


STADIUMS = [
    {
        "id": "mexico-city",
        "name": "Mexico City Stadium",
        "city": "Mexico City",
        "country": "Mexico",
        "capacity": None,
        "matches_count": 5,
    },
    {
        "id": "guadalajara",
        "name": "Guadalajara Stadium",
        "city": "Guadalajara",
        "country": "Mexico",
        "capacity": None,
        "matches_count": 4,
    },
    {
        "id": "monterrey",
        "name": "Monterrey Stadium",
        "city": "Monterrey",
        "country": "Mexico",
        "capacity": None,
        "matches_count": 4,
    },
    {
        "id": "toronto",
        "name": "Toronto Stadium",
        "city": "Toronto",
        "country": "Canada",
        "capacity": None,
        "matches_count": 6,
    },
    {
        "id": "vancouver",
        "name": "BC Place Vancouver",
        "city": "Vancouver",
        "country": "Canada",
        "capacity": None,
        "matches_count": 7,
    },
    {
        "id": "los-angeles",
        "name": "Los Angeles Stadium",
        "city": "Los Angeles",
        "country": "United States",
        "capacity": None,
        "matches_count": 8,
    },
    {
        "id": "new-york-new-jersey",
        "name": "New York New Jersey Stadium",
        "city": "New York/New Jersey",
        "country": "United States",
        "capacity": None,
        "matches_count": 8,
    },
    {
        "id": "dallas",
        "name": "Dallas Stadium",
        "city": "Dallas",
        "country": "United States",
        "capacity": None,
        "matches_count": 9,
    },
    {
        "id": "miami",
        "name": "Miami Stadium",
        "city": "Miami",
        "country": "United States",
        "capacity": None,
        "matches_count": 7,
    },
    {
        "id": "atlanta",
        "name": "Atlanta Stadium",
        "city": "Atlanta",
        "country": "United States",
        "capacity": None,
        "matches_count": 8,
    },
    {
        "id": "houston",
        "name": "Houston Stadium",
        "city": "Houston",
        "country": "United States",
        "capacity": None,
        "matches_count": 7,
    },
    {
        "id": "kansas-city",
        "name": "Kansas City Stadium",
        "city": "Kansas City",
        "country": "United States",
        "capacity": None,
        "matches_count": 6,
    },
    {
        "id": "philadelphia",
        "name": "Philadelphia Stadium",
        "city": "Philadelphia",
        "country": "United States",
        "capacity": None,
        "matches_count": 6,
    },
    {
        "id": "boston",
        "name": "Boston Stadium",
        "city": "Boston",
        "country": "United States",
        "capacity": None,
        "matches_count": 7,
    },
    {
        "id": "san-francisco-bay-area",
        "name": "San Francisco Bay Area Stadium",
        "city": "San Francisco Bay Area",
        "country": "United States",
        "capacity": None,
        "matches_count": 6,
    },
    {
        "id": "seattle",
        "name": "Seattle Stadium",
        "city": "Seattle",
        "country": "United States",
        "capacity": None,
        "matches_count": 6,
    },
]

NATIONS = [
    {"code": "MEX", "name": "Mexico", "group": "A", "colors": ["#006847", "#ffffff", "#ce1126"], "layout": "v"},
    {"code": "RSA", "name": "South Africa", "group": "A", "colors": ["#007749", "#ffb81c", "#000000"], "layout": "diag"},
    {"code": "KOR", "name": "Korea Republic", "group": "B", "colors": ["#ffffff", "#cd2e3a", "#0047a0"], "layout": "h"},
    {"code": "CZE", "name": "Czechia", "group": "B", "colors": ["#ffffff", "#d7141a", "#11457e"], "layout": "h"},
    {"code": "CAN", "name": "Canada", "group": "B", "colors": ["#ff0000", "#ffffff"], "layout": "v"},
    {"code": "BIH", "name": "Bosnia and Herzegovina", "group": "B", "colors": ["#002395", "#fecb00", "#ffffff"], "layout": "diag"},
    {"code": "USA", "name": "United States", "group": "D", "colors": ["#3c3b6e", "#ffffff", "#b22234"], "layout": "h"},
    {"code": "PAR", "name": "Paraguay", "group": "D", "colors": ["#d52b1e", "#ffffff", "#0038a8"], "layout": "h"},
    {"code": "BRA", "name": "Brazil", "group": "C", "colors": ["#009b3a", "#ffdf00", "#002776"], "layout": "diag"},
    {"code": "MAR", "name": "Morocco", "group": "C", "colors": ["#c1272d", "#006233"], "layout": "h"},
    {"code": "QAT", "name": "Qatar", "group": "B", "colors": ["#8a1538", "#ffffff"], "layout": "v"},
    {"code": "SUI", "name": "Switzerland", "group": "B", "colors": ["#d52b1e", "#ffffff"], "layout": "cross"},
    {"code": "ARG", "name": "Argentina", "group": "C", "colors": ["#75aadb", "#ffffff", "#f6b40e"], "layout": "h"},
    {"code": "COL", "name": "Colombia", "group": "C", "colors": ["#fcd116", "#003893", "#ce1126"], "layout": "h"},
    {"code": "ESP", "name": "Spain", "group": "E", "colors": ["#aa151b", "#f1bf00"], "layout": "h"},
    {"code": "FRA", "name": "France", "group": "E", "colors": ["#0055a4", "#ffffff", "#ef4135"], "layout": "v"},
    {"code": "ENG", "name": "England", "group": "F", "colors": ["#ffffff", "#cf081f"], "layout": "cross"},
    {"code": "GER", "name": "Germany", "group": "F", "colors": ["#000000", "#dd0000", "#ffce00"], "layout": "h"},
]

MATCHES = [
    {
        "id": "m1",
        "home": "MEX",
        "away": "RSA",
        "group_name": "A",
        "stadium": "Mexico City Stadium",
        "city": "Mexico City",
        "phase": "Group A · MD1",
        "status": "upcoming",
        "minute": None,
        "home_score": None,
        "away_score": None,
        "kickoff": "2026-06-11T20:00:00Z",
    },
    {
        "id": "m2",
        "home": "KOR",
        "away": "CZE",
        "group_name": "B",
        "stadium": "TBD",
        "city": "TBD",
        "phase": "Group B · MD1",
        "status": "upcoming",
        "minute": None,
        "home_score": None,
        "away_score": None,
        "kickoff": "2026-06-11T23:00:00Z",
    },
    {
        "id": "m3",
        "home": "CAN",
        "away": "BIH",
        "group_name": "B",
        "stadium": "Toronto Stadium",
        "city": "Toronto",
        "phase": "Group B · MD1",
        "status": "upcoming",
        "minute": None,
        "home_score": None,
        "away_score": None,
        "kickoff": "2026-06-12T19:00:00Z",
    },
    {
        "id": "m4",
        "home": "USA",
        "away": "PAR",
        "group_name": "D",
        "stadium": "Los Angeles Stadium",
        "city": "Los Angeles",
        "phase": "Group D · MD1",
        "status": "upcoming",
        "minute": None,
        "home_score": None,
        "away_score": None,
        "kickoff": "2026-06-12T22:00:00Z",
    },
    {
        "id": "m7",
        "home": "BRA",
        "away": "MAR",
        "group_name": "C",
        "stadium": "New York New Jersey Stadium",
        "city": "New York/New Jersey",
        "phase": "Group C · MD1",
        "status": "upcoming",
        "minute": None,
        "home_score": None,
        "away_score": None,
        "kickoff": "2026-06-13T21:00:00Z",
    },
    {
        "id": "m8",
        "home": "QAT",
        "away": "SUI",
        "group_name": "B",
        "stadium": "San Francisco Bay Area Stadium",
        "city": "San Francisco Bay Area",
        "phase": "Group B · MD1",
        "status": "upcoming",
        "minute": None,
        "home_score": None,
        "away_score": None,
        "kickoff": "2026-06-13T23:00:00Z",
    },
]

PRELIMINARY_PLAYERS = {
    "ARG": [
        ("Lionel Messi", "Delantero", "L"),
        ("Emiliano Martínez", "Portero", "E"),
        ("Julián Álvarez", "Delantero", "E"),
        ("Alexis Mac Allister", "Mediocampista", "R"),
    ],
    "BRA": [
        ("Vinícius Júnior", "Delantero", "L"),
        ("Rodrygo", "Delantero", "E"),
        ("Alisson", "Portero", "E"),
        ("Bruno Guimarães", "Mediocampista", "R"),
    ],
    "COL": [
        ("Luis Díaz", "Delantero", "L"),
        ("James Rodríguez", "Mediocampista", "E"),
        ("Davinson Sánchez", "Defensa", "R"),
        ("Camilo Vargas", "Portero", "R"),
    ],
    "FRA": [
        ("Kylian Mbappé", "Delantero", "L"),
        ("Antoine Griezmann", "Mediocampista", "E"),
        ("Aurélien Tchouaméni", "Mediocampista", "R"),
        ("Mike Maignan", "Portero", "E"),
    ],
    "ESP": [
        ("Lamine Yamal", "Delantero", "L"),
        ("Pedri", "Mediocampista", "E"),
        ("Rodri", "Mediocampista", "L"),
        ("Unai Simón", "Portero", "R"),
    ],
    "MEX": [
        ("Santiago Giménez", "Delantero", "E"),
        ("Edson Álvarez", "Mediocampista", "E"),
        ("Guillermo Ochoa", "Portero", "R"),
        ("Hirving Lozano", "Delantero", "R"),
    ],
    "USA": [
        ("Christian Pulisic", "Delantero", "L"),
        ("Weston McKennie", "Mediocampista", "E"),
        ("Tyler Adams", "Mediocampista", "R"),
        ("Matt Turner", "Portero", "R"),
    ],
}

def parse_dt(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def upsert_stadiums(db):
    print("Estadios a insertar:", len(STADIUMS))

    db.execute(text("""
        CREATE TABLE IF NOT EXISTS stadiums (
            id VARCHAR(40) PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            city VARCHAR(100) NOT NULL,
            country VARCHAR(80) NOT NULL,
            capacity INT NULL,
            matches_count INT DEFAULT 0
        )
    """))

    for s in STADIUMS:
        print(f"Insertando estadio: {s['id']} - {s['name']}")

        db.execute(
            text("""
                INSERT INTO stadiums 
                    (id, name, city, country, capacity, matches_count)
                VALUES 
                    (:id, :name, :city, :country, :capacity, :matches_count)
                ON DUPLICATE KEY UPDATE
                    name = :name,
                    city = :city,
                    country = :country,
                    capacity = :capacity,
                    matches_count = :matches_count
            """),
            {
                "id": s["id"],
                "name": s["name"],
                "city": s["city"],
                "country": s["country"],
                "capacity": s.get("capacity"),
                "matches_count": s.get("matches_count", 0),
            }
        )

    count = db.execute(text("SELECT COUNT(*) FROM stadiums")).scalar()
    print("Estadios en BD después del insert:", count)


def upsert_nations(db):
    for n in NATIONS:
        obj = db.query(Nation).filter(Nation.code == n["code"]).first()

        if not obj:
            obj = Nation(code=n["code"])
            db.add(obj)

        obj.name = n["name"]
        obj.group = n["group"]
        obj.colors = n["colors"]
        obj.layout = n["layout"]


def upsert_matches(db):
    for m in MATCHES:
        obj = db.query(Match).filter(Match.id == m["id"]).first()

        if not obj:
            obj = Match(id=m["id"])
            db.add(obj)

        obj.home = m["home"]
        obj.away = m["away"]
        obj.group_name = m["group_name"]
        obj.stadium = m["stadium"]
        obj.city = m["city"]
        obj.phase = m["phase"]
        obj.status = m["status"]
        obj.minute = m["minute"]
        obj.home_score = m["home_score"]
        obj.away_score = m["away_score"]
        obj.kickoff = parse_dt(m["kickoff"])
        obj.events = []
        obj.stats = {
            "possession": [0, 0],
            "shotsOnTarget": [0, 0],
            "passes": [0, 0],
        }
        obj.lineup_home = []
        obj.lineup_away = []
        obj.h2h = []


def generate_stickers(db):
    """
    Reemplaza stickers ficticios por stickers reales/preliminares.
    No toca user_stickers.
    """
    db.query(Sticker).delete()

    num = 1

    for n in NATIONS:
        code = n["code"]

        # Escudo
        db.add(Sticker(
            id=f"{code}-001",
            num=num,
            nation=code,
            slot=1,
            name=f"{n['name']} - Escudo",
            short_name="Escudo",
            type="escudo",
            rarity="C",
        ))
        num += 1

        # Estadio / sede asociada genérica
        db.add(Sticker(
            id=f"{code}-002",
            num=num,
            nation=code,
            slot=2,
            name=f"{n['name']} - Sede mundialista",
            short_name="Estadio",
            type="estadio",
            rarity="R",
        ))
        num += 1

        players = PRELIMINARY_PLAYERS.get(code, [])

        slot = 3
        for player_name, position, rarity in players:
            db.add(Sticker(
                id=f"{code}-{slot:03d}",
                num=num,
                nation=code,
                slot=slot,
                name=player_name,
                short_name=player_name,
                type=position.lower(),
                rarity=rarity,
            ))
            num += 1
            slot += 1

        # Completar hasta 12 stickers por selección
        while slot <= 12:
            db.add(Sticker(
                id=f"{code}-{slot:03d}",
                num=num,
                nation=code,
                slot=slot,
                name=f"{n['name']} - Sticker #{slot}",
                short_name=f"Sticker #{slot}",
                type="plantilla_preliminar",
                rarity="C",
            ))
            num += 1
            slot += 1


def main():
    db = SessionLocal()

    try:
        print("FASE 1: insertando estadios...")
        upsert_stadiums(db)
        db.commit()

        stadiums_count = db.execute(text("SELECT COUNT(*) FROM stadiums")).scalar()
        print(f"Estadios cargados: {stadiums_count}")

        print("FASE 2: insertando selecciones...")
        upsert_nations(db)
        db.commit()

        nations_count = db.execute(text("SELECT COUNT(*) FROM nations")).scalar()
        print(f"Selecciones en BD: {nations_count}")

        print("FASE 3: insertando partidos...")
        upsert_matches(db)
        db.commit()

        matches_count = db.execute(text("SELECT COUNT(*) FROM matches")).scalar()
        print(f"Partidos en BD: {matches_count}")

        print("FASE 4: regenerando stickers...")
        generate_stickers(db)
        db.commit()

        stickers_count = db.execute(text("SELECT COUNT(*) FROM stickers")).scalar()
        print(f"Stickers en BD: {stickers_count}")

        print("Seed real Mundialito 2026 ejecutado correctamente.")
        print(f"Estadios cargados: {stadiums_count}")
        print(f"Selecciones cargadas: {len(NATIONS)}")
        print(f"Partidos cargados: {len(MATCHES)}")
        print("Stickers regenerados según selecciones cargadas.")

    except Exception as e:
        db.rollback()
        print("Error ejecutando seed real:", e)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()