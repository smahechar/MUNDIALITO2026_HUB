"""
Capa de acceso a predicciones — PostgreSQL via SQLAlchemy.
Incluye el cálculo automático de puntos cuando un partido finaliza.
"""

from datetime import datetime, timezone
from db.database import SessionLocal
from db.models import Prediction, PoolMember, Match, User

# ─── Reglas de puntuación ─────────────────────────────────────────────────────
PTS_EXACT  = 30   # marcador exacto
PTS_DIFF   = 15   # diferencia de goles exacta
PTS_WINNER = 10   # ganador o empate correcto
PTS_MISS   = 0


def _calc_kind_and_pts(pred_home: int, pred_away: int,
                       real_home: int, real_away: int,
                       double_down: bool = False) -> tuple[str, int]:
    """
    Retorna (kind, pts) para una predicción contra el resultado real.
    kind: "exact" | "diff" | "winner" | "miss"
    """
    if pred_home == real_home and pred_away == real_away:
        kind, base_pts = "exact", PTS_EXACT
    elif (pred_home - pred_away) == (real_home - real_away):
        kind, base_pts = "diff", PTS_DIFF
    elif _winner(pred_home, pred_away) == _winner(real_home, real_away):
        kind, base_pts = "winner", PTS_WINNER
    else:
        kind, base_pts = "miss", PTS_MISS

    pts = base_pts * 2 if double_down and base_pts > 0 else base_pts
    return kind, pts


def _winner(h: int, a: int) -> str:
    """'home' | 'away' | 'draw'"""
    if h > a:
        return "home"
    if a > h:
        return "away"
    return "draw"


# ─── Conversión ───────────────────────────────────────────────────────────────

def _to_dict(p: Prediction) -> dict:
    return {
        "id":         p.id,
        "matchId":    p.match_id,
        "home":       p.home,
        "away":       p.away,
        "doubleDown": p.double_down,
        "pts":        p.pts,
        "kind":       p.kind,
        "status":     p.status,
        "currentPts": p.pts or 0,
        "locksAt":    None,
    }


# ─── Funciones de acceso ──────────────────────────────────────────────────────

def get_user_predictions(email: str) -> list:
    """SELECT * FROM predictions JOIN matches ON ... WHERE users.email = :email"""
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return []
        preds = (
            db.query(Prediction)
            .filter(Prediction.user_id == user.id)
            .join(Match, Prediction.match_id == Match.id)
            .order_by(Match.kickoff)
            .all()
        )
        return [_to_dict(p) for p in preds]


def get_prediction(email: str, match_id: str) -> dict | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        p = db.query(Prediction).filter(
            Prediction.user_id == user.id,
            Prediction.match_id == match_id,
        ).first()
        return _to_dict(p) if p else None


def get_timeline(email: str) -> list:
    """
    SELECT phase_group, SUM(pts), SUM(pts) running_total
    FROM predictions JOIN matches ON ...
    WHERE users.email = :email AND predictions.status = 'scored'
    GROUP BY phase_group ORDER BY ...
    """
    _PHASES = ["MD1", "MD2", "MD3", "MD4", "MD5", "R16", "QF", "SF", "F"]

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return [{"md": ph, "pts": 0, "total": 0, "pending": False, "future": True} for ph in _PHASES]

        preds = (
            db.query(Prediction, Match)
            .join(Match, Prediction.match_id == Match.id)
            .filter(Prediction.user_id == user.id, Prediction.status == "scored")
            .all()
        )

    # Agrupar por MD (extraer de phase, e.g. "Group A · MD2" → "MD2")
    phase_pts: dict[str, int] = {ph: 0 for ph in _PHASES}
    for pred, match in preds:
        for ph in _PHASES:
            if ph in (match.phase or ""):
                phase_pts[ph] += (pred.pts or 0)
                break

    result = []
    running = 0
    for ph in _PHASES:
        pts = phase_pts.get(ph, 0)
        running += pts
        result.append({
            "md":      ph,
            "pts":     pts,
            "total":   running,
            "pending": False,
            "future":  pts == 0 and running == 0,
        })
    return result


def get_special_picks(email: str) -> dict:
    _DEFAULT = {
        "champion":  {"nation": "ATL", "reward": 100, "status": "alive",   "note": "Si gana el torneo"},
        "runnerUp":  {"nation": "BOR", "reward": 40,  "status": "alive",   "note": "Si llega a la final"},
        "topScorer": {"player": "K. Olabode", "nation": "JOR", "goalsNow": 5, "reward": 50, "status": "leading", "note": "Liderando el botin"},
        "darkHorse": {"nation": "JOR", "reward": 60,  "status": "alive",   "note": "Si llega a semifinal"},
    }
    return _DEFAULT


def save_prediction(email: str, match_id: str, pick: dict) -> tuple[dict | None, str | None]:
    """
    INSERT INTO predictions (...) ON CONFLICT (user_id, match_id) DO UPDATE SET ...
    Bloquea si el partido ya inicio.
    """
    with SessionLocal() as db:
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            return None, "Partido no encontrado"
        if match.status in ("live", "halftime", "final"):
            return None, "El partido ya inicio, no se pueden registrar predicciones"

        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None, "Usuario no encontrado"

        home = pick.get("home")
        away = pick.get("away")
        if home is None or away is None:
            return None, "El pronostico debe incluir marcador (home y away)"
        if not isinstance(home, int) or not isinstance(away, int):
            return None, "El marcador debe ser un numero entero"
        if home < 0 or away < 0:
            return None, "El marcador no puede ser negativo"

        pred = db.query(Prediction).filter(
            Prediction.user_id == user.id,
            Prediction.match_id == match_id,
        ).first()

        if pred:
            pred.home        = home
            pred.away        = away
            pred.double_down = bool(pick.get("doubleDown", False))
            pred.updated_at  = datetime.now(timezone.utc)
        else:
            pred = Prediction(
                user_id=user.id,
                match_id=match_id,
                home=home,
                away=away,
                double_down=bool(pick.get("doubleDown", False)),
                status="open",
            )
            db.add(pred)

        db.commit()
        db.refresh(pred)
        return _to_dict(pred), None


# ─── Cálculo automático al finalizar partido ──────────────────────────────────

def score_predictions_for_match(match_id: str) -> int:
    """
    Calcula y persiste los puntos de TODAS las predicciones de un partido.
    Llamar desde admin router cuando status cambia a 'final'.
    Retorna el número de predicciones procesadas.
    """
    with SessionLocal() as db:
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match or match.status != "final":
            return 0
        if match.home_score is None or match.away_score is None:
            return 0

        preds = db.query(Prediction).filter(
            Prediction.match_id == match_id,
            Prediction.status != "scored",
        ).all()

        for pred in preds:
            kind, pts = _calc_kind_and_pts(
                pred.home, pred.away,
                match.home_score, match.away_score,
                pred.double_down,
            )
            pred.pts    = pts
            pred.kind   = kind
            pred.status = "scored"

            # Actualizar puntos del miembro en todas las pollas
            # que tengan al usuario
            pool_memberships = db.query(PoolMember).filter(
                PoolMember.user_id == pred.user_id
            ).all()

            for pm in pool_memberships:
                pm.pts += pts
                if kind == "exact":
                    pm.exact  += 1
                    pm.winner += 1
                elif kind in ("diff", "winner"):
                    pm.winner += 1

        db.commit()
        return len(preds)
