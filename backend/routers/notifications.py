"""
Router de notificaciones — /api/v1/notifications
Endpoints para el usuario final:
  GET    /me                → lista de notificaciones (200 más recientes)
  GET    /me?onlyUnread=1   → solo no leídas
  GET    /me/unread-count   → contador para badge
  POST   /:id/read          → marcar una como leída
  POST   /read-all          → marcar todas como leídas
  GET    /preferences       → preferencias actuales
  PATCH  /preferences       → actualizar toggles
"""

from flask import Blueprint, jsonify, request, g

from core.middleware       import require_auth
from db.notifications_data import (
    get_user_notifications, count_unread, mark_read, mark_all_read,
    get_preferences, update_preferences,
)

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/v1/notifications")


@notifications_bp.get("/me")
@require_auth
def my_notifications():
    only_unread = request.args.get("onlyUnread") in ("1", "true", "yes")
    return jsonify(get_user_notifications(g.current_user["email"], only_unread=only_unread))


@notifications_bp.get("/me/unread-count")
@require_auth
def unread_count():
    return jsonify({"count": count_unread(g.current_user["email"])})


@notifications_bp.post("/<notification_id>/read")
@require_auth
def read_one(notification_id):
    n = mark_read(g.current_user["email"], notification_id)
    if not n:
        return jsonify({"detail": "Notificación no encontrada"}), 404
    return jsonify(n)


@notifications_bp.post("/read-all")
@require_auth
def read_all():
    updated = mark_all_read(g.current_user["email"])
    return jsonify({"updated": updated})


@notifications_bp.get("/preferences")
@require_auth
def get_prefs():
    return jsonify(get_preferences(g.current_user["email"]))


@notifications_bp.patch("/preferences")
@require_auth
def patch_prefs():
    body = request.get_json() or {}
    if not isinstance(body, dict) or not body:
        return jsonify({"detail": "Cuerpo vacío"}), 400
    return jsonify(update_preferences(g.current_user["email"], body))
