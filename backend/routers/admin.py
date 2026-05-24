"""
Router de administración — /api/v1/admin
Requiere rol 'admin' en todos los endpoints.
Al marcar un partido como 'final', dispara el cálculo automático de puntos.
"""

from flask import Blueprint, jsonify, request, g

from core.middleware     import require_admin
from core.logger         import log
from db.memory           import get_all_users, update_user_status
from db.matches_data     import get_all_matches, update_match
from db.admin_data       import get_alerts, patch_alert, broadcast_alert
from db.predictions_data import score_predictions_for_match

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")

_VALID_USER_STATUSES  = {"active", "suspended"}
_VALID_MATCH_KEYS     = {"homeScore", "awayScore", "status", "minute"}
_VALID_MATCH_STATUSES = {"upcoming", "live", "halftime", "final"}


def _safe_user(u: dict) -> dict:
    return {
        "id":            u.get("id"),
        "name":          u.get("name"),
        "handle":        u.get("handle"),
        "email":         u.get("email"),
        "role":          u.get("role", "user"),
        "status":        u.get("status", "active"),
        "timezone":      u.get("timezone", "UTC-5"),
        "city":          u.get("city", ""),
        "favoriteTeams": u.get("favoriteTeams", []),
        "createdAt":     u.get("createdAt"),
    }


# ─── Usuarios ─────────────────────────────────────────────────────────────────

@admin_bp.get("/users")
@require_admin
def list_users():
    role   = request.args.get("role")
    status = request.args.get("status")
    users  = get_all_users()
    if role:
        users = [u for u in users if u.get("role") == role]
    if status:
        users = [u for u in users if u.get("status", "active") == status]
    return jsonify([_safe_user(u) for u in users])


@admin_bp.patch("/users/<user_id>/status")
@require_admin
def set_user_status(user_id):
    body   = request.get_json() or {}
    status = body.get("status", "").strip()

    if status not in _VALID_USER_STATUSES:
        return jsonify({"detail": f"Status inválido. Opciones: {', '.join(_VALID_USER_STATUSES)}"}), 400

    if g.current_user.get("id") == user_id:
        return jsonify({"detail": "No puedes cambiar tu propio status"}), 409

    user = update_user_status(user_id, status)
    if not user:
        return jsonify({"detail": "Usuario no encontrado"}), 404

    log.admin(
        "user_status_changed",
        admin_email=g.current_user["email"],
        target_user_id=user_id,
        new_status=status,
    )
    return jsonify(_safe_user(user))


# ─── Partidos ─────────────────────────────────────────────────────────────────

@admin_bp.get("/matches")
@require_admin
def list_matches():
    status = request.args.get("status")
    return jsonify(get_all_matches(status=status))


@admin_bp.patch("/matches/<match_id>")
@require_admin
def update_match_route(match_id):
    body = request.get_json() or {}

    new_status = body.get("status")
    if new_status and new_status not in _VALID_MATCH_STATUSES:
        return jsonify({"detail": f"Status inválido. Opciones: {', '.join(_VALID_MATCH_STATUSES)}"}), 400

    for key in ("homeScore", "awayScore"):
        if key in body and body[key] is not None:
            if not isinstance(body[key], int) or body[key] < 0:
                return jsonify({"detail": f"{key} debe ser un entero no negativo"}), 400

    patch = {k: v for k, v in body.items() if k in _VALID_MATCH_KEYS}
    if not patch:
        return jsonify({"detail": "No se enviaron campos válidos para actualizar"}), 400

    match = update_match(match_id, patch)
    if not match:
        return jsonify({"detail": "Partido no encontrado"}), 404

    log.admin(
        "match_updated",
        admin_email=g.current_user["email"],
        match_id=match_id,
        patch=patch,
    )

    # ── Cálculo automático de puntos al finalizar ──────────────────────────
    if new_status == "final":
        scored = score_predictions_for_match(match_id)
        log.info(
            "predictions.auto_scored",
            match_id=match_id,
            predictions_scored=scored,
        )
        match["predictionsScoredCount"] = scored  # info extra para el admin

    return jsonify(match)


# ─── Alertas ──────────────────────────────────────────────────────────────────

@admin_bp.get("/alerts")
@require_admin
def list_alerts():
    status = request.args.get("status")
    return jsonify(get_alerts(status=status))


@admin_bp.patch("/alerts/<alert_id>")
@require_admin
def update_alert(alert_id):
    body   = request.get_json() or {}
    action = body.get("action", "").strip()
    if action not in ("resolve", "dismiss"):
        return jsonify({"detail": "Acción requerida: resolve | dismiss"}), 400

    result, error = patch_alert(alert_id, action)
    if error:
        code = 404 if "no encontrada" in error.lower() else 409
        return jsonify({"detail": error}), code

    log.admin("alert_updated", admin_email=g.current_user["email"], alert_id=alert_id, action=action)
    return jsonify(result)


@admin_bp.post("/alerts/broadcast")
@require_admin
def broadcast():
    body        = request.get_json() or {}
    alert, error = broadcast_alert(body)
    if error:
        return jsonify({"detail": error}), 400

    log.admin("alert_broadcast", admin_email=g.current_user["email"], title=body.get("title"))
    return jsonify(alert), 201
