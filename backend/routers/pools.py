from flask import Blueprint, jsonify, request, g
from core.middleware import require_auth
from db.pools_data import (
    get_user_pools, get_pool_by_id, get_pool_by_code,
    get_pool_members, get_discover_pools, get_scoring_rules,
    create_pool, join_pool,
)

pools_bp = Blueprint("pools", __name__, url_prefix="/api/v1/pools")


# GET /api/v1/pools/me  (requiere token)
@pools_bp.get("/me")
@require_auth
def my_pools():
    return jsonify(get_user_pools(g.current_user["email"]))


# GET /api/v1/pools/discover
@pools_bp.get("/discover")
def discover():
    return jsonify(get_discover_pools())


# GET /api/v1/pools/rules
@pools_bp.get("/rules")
def scoring_rules():
    return jsonify(get_scoring_rules())


# POST /api/v1/pools  (requiere token)
@pools_bp.post("", strict_slashes=False)
@require_auth
def create():
    body = request.get_json() or {}
    if not body.get("name", "").strip():
        return jsonify({"detail": "El nombre de la polla es requerido"}), 400
    pool = create_pool(body, g.current_user["email"])
    return jsonify(pool), 201


# POST /api/v1/pools/join  (requiere token)
@pools_bp.post("/join")
@require_auth
def join():
    body = request.get_json() or {}
    code = body.get("code", "").strip().upper()
    if not code:
        return jsonify({"detail": "El codigo es requerido"}), 400
    pool = join_pool(code, g.current_user["email"])
    if not pool:
        return jsonify({"detail": "Codigo de polla no encontrado"}), 404
    return jsonify({"success": True, "pool": pool})


# GET /api/v1/pools/:id  (requiere token)
@pools_bp.get("/<pool_id>")
@require_auth
def pool_detail(pool_id):
    pool = get_pool_by_id(pool_id)
    if not pool:
        return jsonify({"detail": "Polla no encontrada"}), 404
    return jsonify(pool)


# GET /api/v1/pools/:id/members  (requiere token)
@pools_bp.get("/<pool_id>/members")
@require_auth
def pool_members(pool_id):
    if not get_pool_by_id(pool_id):
        return jsonify({"detail": "Polla no encontrada"}), 404
    return jsonify(get_pool_members(pool_id))
