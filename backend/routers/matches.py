from flask import Blueprint, jsonify, request
from db.matches_data import (
    get_all_matches,
    get_match_by_id,
    get_live_matches,
    get_match_detail,
    get_moments,
    get_scorers,
)

matches_bp = Blueprint("matches", __name__, url_prefix="/api/v1/matches")


# GET /api/v1/matches?status=live
@matches_bp.get("", strict_slashes=False)
def list_matches():
    status = request.args.get("status")
    return jsonify(get_all_matches(status))


# GET /api/v1/matches/live
@matches_bp.get("/live")
def live_matches():
    return jsonify(get_live_matches())


# GET /api/v1/matches/moments
@matches_bp.get("/moments")
def match_moments():
    return jsonify(get_moments())


# GET /api/v1/matches/scorers
@matches_bp.get("/scorers")
def top_scorers():
    return jsonify(get_scorers())


# GET /api/v1/matches/:id
@matches_bp.get("/<match_id>")
def match_by_id(match_id):
    match = get_match_by_id(match_id)
    if not match:
        return jsonify({"detail": "Partido no encontrado"}), 404
    return jsonify(match)


# GET /api/v1/matches/:id/detail
@matches_bp.get("/<match_id>/detail")
def match_detail(match_id):
    if not get_match_by_id(match_id):
        return jsonify({"detail": "Partido no encontrado"}), 404
    return jsonify(get_match_detail(match_id))
