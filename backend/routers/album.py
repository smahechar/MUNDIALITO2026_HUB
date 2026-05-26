from flask import Blueprint, jsonify, g, request
from core.middleware import require_auth
from db.album_data import get_album, open_pack, get_offers, create_trade

album_bp = Blueprint("album", __name__, url_prefix="/api/v1/album")


@album_bp.get("")
@require_auth
def album():
    return jsonify(get_album(g.current_user["email"]))


@album_bp.post("/open-pack")
@require_auth
def pack():
    return jsonify(open_pack(g.current_user["email"]))


@album_bp.get("/offers")
@require_auth
def offers():
    return jsonify(get_offers(g.current_user["email"]))


@album_bp.post("/trade")
@require_auth
def trade():
    body = request.get_json() or {}
    return jsonify(create_trade(g.current_user["email"], body))