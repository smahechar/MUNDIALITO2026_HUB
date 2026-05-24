from flask import Blueprint, jsonify, request, g
from core.middleware import require_auth
from db.groups_data import (
    get_my_groups, get_discover, get_group, get_activity,
    create_group, join_group, leave_group,
)

groups_bp = Blueprint("groups", __name__, url_prefix="/api/v1/groups")


# GET /api/v1/groups/me  (requiere token)
@groups_bp.get("/me")
@require_auth
def my_groups():
    return jsonify(get_my_groups(g.current_user["email"]))


# GET /api/v1/groups/discover  (público, pero si hay token filtra los ya unidos)
@groups_bp.get("/discover")
def discover():
    email = getattr(g, "current_user", {}).get("email") if hasattr(g, "current_user") else None
    return jsonify(get_discover(email))


# POST /api/v1/groups  (requiere token)
@groups_bp.post("", strict_slashes=False)
@require_auth
def create():
    body = request.get_json() or {}
    group, error = create_group(g.current_user["email"], g.current_user, body)
    if error:
        return jsonify({"detail": error}), 400
    return jsonify(group), 201


# POST /api/v1/groups/join  (requiere token)
@groups_bp.post("/join")
@require_auth
def join():
    body = request.get_json() or {}
    code = body.get("code", "").strip().upper()
    if not code:
        return jsonify({"detail": "El codigo es requerido"}), 400
    group, error = join_group(g.current_user["email"], g.current_user, code)
    if error:
        status = 404 if "no encontrado" in error.lower() else 409
        return jsonify({"detail": error}), status
    return jsonify({"success": True, "group": group})


# GET /api/v1/groups/:id  (requiere token)
@groups_bp.get("/<group_id>")
@require_auth
def group_detail(group_id):
    group = get_group(group_id, g.current_user["email"])
    if not group:
        return jsonify({"detail": "Grupo no encontrado o no eres miembro"}), 404
    return jsonify(group)


# GET /api/v1/groups/:id/activity  (requiere token)
@groups_bp.get("/<group_id>/activity")
@require_auth
def activity(group_id):
    entries, error = get_activity(group_id, g.current_user["email"])
    if error:
        status = 403 if "miembro" in error.lower() else 404
        return jsonify({"detail": error}), status
    return jsonify(entries)


# POST /api/v1/groups/:id/leave  (requiere token)
@groups_bp.post("/<group_id>/leave")
@require_auth
def leave(group_id):
    ok, error = leave_group(g.current_user["email"], group_id)
    if error:
        status = 404 if "no encontrado" in error.lower() else \
                 403 if "miembro" in error.lower() else 409
        return jsonify({"detail": error}), status
    return jsonify({"success": True})
