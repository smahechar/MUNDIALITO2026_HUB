"""
Capa de acceso a datos de partidos — PostgreSQL via SQLAlchemy.
Reemplaza los dicts hardcodeados del archivo original.
"""

from datetime import datetime, timezone
from db.database import SessionLocal
from db.models import Match

# ─── Datos estáticos que no viven en BD ───────────────────────────────────────
# Momentos y goleadores se mantienen aquí hasta tener tablas dedicadas.
# TODO (v2): mover a tablas `moments` y `scorers` en PostgreSQL.

MOMENTS = [
    {"time": "MIN 67", "title": "Olabode brace",      "body": "Half-volley from 22 yards. xG 0.09 — outside the box, inside the post.", "match": "Atlantica 2–1 Durango",  "tag": "GOAL"},
    {"time": "MIN 32", "title": "Wall save",           "body": "Akinola pushes the bender onto the bar. Velocity 102 km/h, swerve 2.4 m.", "match": "Joriba 0–0 Lumeria", "tag": "SAVE"},
    {"time": "MIN 24", "title": "Pressing trap",       "body": "Esperanza recover possession 38 m from goal — 7 sequences ending in shots.", "match": "Esperanza × Galicia", "tag": "STAT"},
    {"time": "FT",     "title": "Polar Bowl thriller", "body": "Five goals, two woodwork, one disallowed. Borealis steal it at 89'.", "match": "Borealis 3–2 Carpathia", "tag": "RECAP"},
]

SCORERS = [
    {"rank": 1, "name": "K. Olabode",    "nation": "JOR", "goals": 5, "assists": 2, "mins": 270, "role": "Striker"},
    {"rank": 2, "name": "M. Costa",      "nation": "ESP", "goals": 4, "assists": 3, "mins": 270, "role": "Forward"},
    {"rank": 3, "name": "L. Tannenbaum", "nation": "BOR", "goals": 4, "assists": 1, "mins": 195, "role": "Striker"},
    {"rank": 4, "name": "S. Vidal",      "nation": "PAR", "goals": 3, "assists": 2, "mins": 270, "role": "Winger"},
    {"rank": 5, "name": "A. Petrović",   "nation": "CAR", "goals": 3, "assists": 0, "mins": 240, "role": "Forward"},
    {"rank": 6, "name": "R. Akhtar",     "nation": "INK", "goals": 2, "assists": 4, "mins": 270, "role": "Midfield"},
]

# Detalles ricos de partidos (eventos, stats, alineaciones, H2H)
# TODO (v2): mover a columnas JSONB en la tabla matches (ya existen en el modelo).
_MATCH_DETAILS_STATIC: dict = {
    "m1": {
        "events": [
            {"minute": "14'", "type": "goal",    "team": "home", "player": "L. Marín",           "detail": "Penalty · won by Vidal"},
            {"minute": "23'", "type": "yellow",  "team": "away", "player": "A. Costa",           "detail": "Tactical foul · 32m"},
            {"minute": "38'", "type": "goal",    "team": "away", "player": "M. Silva",           "detail": "Header · Costa corner"},
            {"minute": "46'", "type": "kickoff", "team": "-",    "player": "—",                  "detail": "Second half"},
            {"minute": "56'", "type": "goal",    "team": "home", "player": "K. Bilic",           "detail": "Long range · 24m"},
            {"minute": "61'", "type": "sub",     "team": "home", "player": "Vidal ↔ Tannenbaum", "detail": ""},
            {"minute": "64'", "type": "yellow",  "team": "home", "player": "Bilic",              "detail": "Late challenge"},
        ],
        "stats": {
            "possession": [54, 46], "shots": [12, 8], "shotsOnTarget": [6, 3],
            "passes": [421, 358],   "passAccuracy": [87, 82],
            "corners": [5, 3],      "fouls": [8, 11], "offsides": [2, 1],
        },
        "lineupHome": {
            "formation": "4-2-3-1",
            "players": [
                {"num": 1,  "pos": "GK", "name": "R. Morales"},
                {"num": 2,  "pos": "RB", "name": "D. Vetter"},
                {"num": 5,  "pos": "CB", "name": "P. Saar"},
                {"num": 6,  "pos": "CB", "name": "F. Nkemba"},
                {"num": 3,  "pos": "LB", "name": "T. Özkan"},
                {"num": 8,  "pos": "CM", "name": "H. Lund"},
                {"num": 4,  "pos": "CM", "name": "K. Bilic"},
                {"num": 10, "pos": "AM", "name": "L. Marín"},
                {"num": 7,  "pos": "RW", "name": "S. Vidal"},
                {"num": 11, "pos": "LW", "name": "O. Ferreira"},
                {"num": 9,  "pos": "ST", "name": "E. Danso"},
            ],
        },
        "lineupAway": {
            "formation": "4-3-3",
            "players": [
                {"num": 1,  "pos": "GK", "name": "A. Kovic"},
                {"num": 2,  "pos": "RB", "name": "J. Brandt"},
                {"num": 5,  "pos": "CB", "name": "Y. Kamara"},
                {"num": 6,  "pos": "CB", "name": "N. Hadzic"},
                {"num": 3,  "pos": "LB", "name": "D. Ruiz"},
                {"num": 8,  "pos": "CM", "name": "A. Costa"},
                {"num": 4,  "pos": "CM", "name": "C. Ibarra"},
                {"num": 10, "pos": "CM", "name": "T. Vargas"},
                {"num": 7,  "pos": "RW", "name": "M. Endo"},
                {"num": 11, "pos": "LW", "name": "R. Patel"},
                {"num": 9,  "pos": "ST", "name": "M. Silva"},
            ],
        },
        "h2h": [
            {"date": "2022-11-20", "home": "ATL", "away": "DUR", "score": "2-0", "comp": "World Cup"},
            {"date": "2021-06-15", "home": "DUR", "away": "ATL", "score": "1-1", "comp": "Friendly"},
            {"date": "2019-03-22", "home": "ATL", "away": "DUR", "score": "3-1", "comp": "Qualifier"},
        ],
    },
}


# ─── Conversión modelo → dict ─────────────────────────────────────────────────

def _to_dict(m: Match) -> dict:
    return {
        "id":        m.id,
        "home":      m.home,
        "away":      m.away,
        "group":     m.group_name,
        "stadium":   m.stadium,
        "city":      m.city,
        "phase":     m.phase,
        "status":    m.status,
        "minute":    m.minute,
        "homeScore": m.home_score,
        "awayScore": m.away_score,
        "kickoff":   m.kickoff.isoformat() if m.kickoff else None,
    }


# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_all_matches(status: str | None = None) -> list:
    """SELECT * FROM matches [WHERE status = :status] ORDER BY kickoff"""
    with SessionLocal() as db:
        q = db.query(Match)
        if status:
            q = q.filter(Match.status == status)
        return [_to_dict(m) for m in q.order_by(Match.kickoff).all()]


def get_match_by_id(match_id: str) -> dict | None:
    """SELECT * FROM matches WHERE id = :match_id"""
    with SessionLocal() as db:
        m = db.query(Match).filter(Match.id == match_id).first()
        return _to_dict(m) if m else None


def get_live_matches() -> list:
    """SELECT * FROM matches WHERE status IN ('live','halftime')"""
    with SessionLocal() as db:
        rows = db.query(Match).filter(Match.status.in_(["live", "halftime"])).all()
        return [_to_dict(m) for m in rows]


def get_match_detail(match_id: str) -> dict | None:
    """
    Devuelve el partido con eventos, stats y alineaciones.
    Prioriza datos en columnas JSONB de la BD; fallback a estático.
    """
    with SessionLocal() as db:
        m = db.query(Match).filter(Match.id == match_id).first()
        if not m:
            return None
        base = _to_dict(m)

        # Usar datos JSONB de la BD si existen, sino fallback al dict estático
        static = _MATCH_DETAILS_STATIC.get(match_id, {})
        base["events"]      = m.events      if m.events      else static.get("events", [])
        base["stats"]       = m.stats       if m.stats       else static.get("stats", {})
        base["lineupHome"]  = m.lineup_home if m.lineup_home else static.get("lineupHome", {})
        base["lineupAway"]  = m.lineup_away if m.lineup_away else static.get("lineupAway", {})
        base["h2h"]         = m.h2h         if m.h2h         else static.get("h2h", [])

        return base


def update_match(match_id: str, patch: dict) -> dict | None:
    """
    UPDATE matches SET ... WHERE id = :match_id
    Usado por el panel admin para actualizar marcador/estado.
    """
    with SessionLocal() as db:
        m = db.query(Match).filter(Match.id == match_id).first()
        if not m:
            return None

        field_map = {
            "homeScore": "home_score",
            "awayScore": "away_score",
            "status":    "status",
            "minute":    "minute",
        }
        for camel, snake in field_map.items():
            if camel in patch:
                setattr(m, snake, patch[camel])

        db.commit()
        db.refresh(m)
        return _to_dict(m)


def get_moments() -> list:
    return MOMENTS


def get_scorers() -> list:
    return SCORERS
