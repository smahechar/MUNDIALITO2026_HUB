from flask import Blueprint, jsonify, request, g
from core.middleware import require_auth
from db.album_data import get_album, open_pack, get_offers, create_trade

album_bp = Blueprint("album", __name__, url_prefix="/api/v1/album")


# GET /api/v1/album  (requiere token)
@album_bp.get("", strict_slashes=False)
@require_auth
def album():
    return jsonify(get_album(g.current_user["email"]))


# POST /api/v1/album/open-pack  (requiere token)
@album_bp.post("/open-pack")
@require_auth
def open_pack_route():
    return jsonify(open_pack(g.current_user["email"]))


# GET /api/v1/album/offers  (requiere token)
@album_bp.get("/offers")
@require_auth
def offers():
    return jsonify(get_offers(g.current_user["email"]))


# POST /api/v1/album/trade  (requiere token)
@album_bp.post("/trade")
@require_auth
def trade():
    body = request.get_json() or {}
    result, error = create_trade(g.current_user["email"], body)
    if error:
        return jsonify({"detail": error}), 400
    return jsonify(result), 201
