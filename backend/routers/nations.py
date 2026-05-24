from flask import Blueprint, jsonify
from db.nations_data import get_all_nations, get_nation_by_code, get_group_standings

nations_bp = Blueprint("nations", __name__, url_prefix="/api/v1/nations")


# GET /api/v1/nations
@nations_bp.get("", strict_slashes=False)
def list_nations():
    return jsonify(get_all_nations())


# GET /api/v1/nations/groups
@nations_bp.get("/groups")
def group_standings():
    return jsonify(get_group_standings())


# GET /api/v1/nations/:code
@nations_bp.get("/<code>")
def nation_by_code(code):
    nation = get_nation_by_code(code)
    if not nation:
        return jsonify({"detail": "Selección no encontrada"}), 404
    return jsonify(nation)
