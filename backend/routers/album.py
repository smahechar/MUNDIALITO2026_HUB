from flask import Blueprint, jsonify, g, request
from core.middleware import require_auth

from db.album_data import get_album, open_pack, get_offers, create_trade
from db.album_market_data import (
    get_market_listings,
    get_my_market,
    create_listing,
    make_offer,
    accept_offer,
    confirm_offer,
    cancel_listing,
)

album_bp = Blueprint("album", __name__, url_prefix="/api/v1/album")


@album_bp.get("")
@require_auth
def album():
    return jsonify(get_album(g.current_user["email"]))


@album_bp.post("/open-pack")
@require_auth
def pack():
    return jsonify(open_pack(g.current_user["email"]))


# Rutas viejas de trade simple. Las dejamos para no romper nada.
@album_bp.get("/offers")
@require_auth
def offers():
    return jsonify(get_offers(g.current_user["email"]))


@album_bp.post("/trade")
@require_auth
def trade():
    body = request.get_json() or {}
    return jsonify(create_trade(g.current_user["email"], body))


# ─── Mercado / casa de subastas de láminas ───────────────────────────────────

@album_bp.get("/market")
@require_auth
def market_listings():
    return jsonify(get_market_listings(g.current_user["email"]))


@album_bp.get("/market/me")
@require_auth
def my_market():
    return jsonify(get_my_market(g.current_user["email"]))


@album_bp.post("/market/listings")
@require_auth
def new_listing():
    body = request.get_json() or {}
    data, error = create_listing(g.current_user["email"], body)

    if error:
        return jsonify({"detail": error}), 400

    return jsonify(data), 201


@album_bp.post("/market/listings/<listing_id>/offers")
@require_auth
def new_offer(listing_id):
    body = request.get_json() or {}
    data, error = make_offer(g.current_user["email"], listing_id, body)

    if error:
        return jsonify({"detail": error}), 400

    return jsonify(data), 201


@album_bp.post("/market/offers/<offer_id>/accept")
@require_auth
def accept_market_offer(offer_id):
    data, error = accept_offer(g.current_user["email"], offer_id)

    if error:
        return jsonify({"detail": error}), 400

    return jsonify(data)


@album_bp.post("/market/offers/<offer_id>/confirm")
@require_auth
def confirm_market_offer(offer_id):
    data, error = confirm_offer(g.current_user["email"], offer_id)

    if error:
        return jsonify({"detail": error}), 400

    return jsonify(data)


@album_bp.post("/market/listings/<listing_id>/cancel")
@require_auth
def cancel_market_listing(listing_id):
    data, error = cancel_listing(g.current_user["email"], listing_id)

    if error:
        return jsonify({"detail": error}), 400

    return jsonify(data)