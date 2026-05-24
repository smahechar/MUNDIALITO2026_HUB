"""
Capa de acceso a datos de naciones y standings — PostgreSQL via SQLAlchemy.
"""

from db.database import SessionLocal
from db.models import Nation, Match


def _nation_to_dict(n: Nation) -> dict:
    return {
        "code":   n.code,
        "name":   n.name,
        "group":  n.group,
        "colors": n.colors or [],
        "layout": n.layout,
    }


def get_all_nations() -> list:
    """SELECT * FROM nations ORDER BY group, name"""
    with SessionLocal() as db:
        nations = db.query(Nation).order_by(Nation.group, Nation.name).all()
        return [_nation_to_dict(n) for n in nations]


def get_nation_by_code(code: str) -> dict | None:
    """SELECT * FROM nations WHERE code = :code"""
    with SessionLocal() as db:
        n = db.query(Nation).filter(Nation.code == code.upper()).first()
        return _nation_to_dict(n) if n else None


def get_group_standings() -> list:
    """
    Computa standings desde partidos finalizados.
    SELECT home, away, home_score, away_score FROM matches
    WHERE status = 'final' AND group_name IS NOT NULL
    """
    with SessionLocal() as db:
        nations = db.query(Nation).order_by(Nation.group, Nation.name).all()
        finished = (
            db.query(Match)
            .filter(Match.status == "final", Match.group_name.isnot(None))
            .all()
        )

    # Inicializar acumuladores
    stats: dict[str, dict] = {}
    for n in nations:
        stats[n.code] = {
            "code": n.code, "name": n.name, "group": n.group,
            "pj": 0, "g": 0, "e": 0, "p": 0,
            "gf": 0, "ga": 0, "gd": 0, "pts": 0,
        }

    # Acumular resultados
    for m in finished:
        home, away = m.home, m.away
        hs, as_ = m.home_score or 0, m.away_score or 0

        for code in (home, away):
            if code not in stats:
                continue
            stats[code]["pj"] += 1
            if code == home:
                stats[code]["gf"] += hs
                stats[code]["ga"] += as_
                if hs > as_:
                    stats[code]["g"] += 1; stats[code]["pts"] += 3
                elif hs == as_:
                    stats[code]["e"] += 1; stats[code]["pts"] += 1
                else:
                    stats[code]["p"] += 1
            else:
                stats[code]["gf"] += as_
                stats[code]["ga"] += hs
                if as_ > hs:
                    stats[code]["g"] += 1; stats[code]["pts"] += 3
                elif as_ == hs:
                    stats[code]["e"] += 1; stats[code]["pts"] += 1
                else:
                    stats[code]["p"] += 1
            stats[code]["gd"] = stats[code]["gf"] - stats[code]["ga"]

    # Agrupar por grupo y ordenar: pts → GD → GF (criterio FIFA)
    groups: dict[str, list] = {}
    for s in stats.values():
        groups.setdefault(s["group"], []).append(s)

    result = []
    for gname in sorted(groups):
        teams = sorted(
            groups[gname],
            key=lambda t: (-t["pts"], -t["gd"], -t["gf"])
        )
        for rank, team in enumerate(teams, 1):
            team["rank"] = rank
        result.append({"group": gname, "teams": teams})

    return result
