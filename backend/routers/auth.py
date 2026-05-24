"""
Router de autenticación — /api/v1/auth
Endpoints: login, register, forgot-password, GET /me, PATCH /me
"""

import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, g

from core.security   import hash_password, verify_password, create_access_token
from core.middleware import require_auth
from core.logger     import log
from db.memory       import get_user_by_email, create_user, update_user

auth_bp = Blueprint("auth", __name__)

ALLOWED_PROFILE_FIELDS = {"name", "timezone", "city", "favoriteTeams", "avatar"}


def _user_to_dict(u: dict) -> dict:
    return {
        "id":            u["id"],
        "name":          u["name"],
        "handle":        u["handle"],
        "email":         u["email"],
        "role":          u["role"],
        "timezone":      u.get("timezone", "UTC-5"),
        "city":          u.get("city", ""),
        "favoriteTeams": u.get("favoriteTeams", []),
        "avatar":        u.get("avatar"),
        "createdAt":     u.get("createdAt"),
    }


# ─── POST /login ──────────────────────────────────────────────────────────────

@auth_bp.post("/login")
def login():
    body     = request.get_json() or {}
    email    = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        log.auth("login_failed", email=email, success=False, reason="missing_fields")
        return jsonify({"detail": "Credenciales requeridas"}), 400

    user = get_user_by_email(email)
    if not user or not verify_password(password, user["hashed_password"]):
        log.auth("login_failed", email=email, success=False, reason="wrong_credentials")
        return jsonify({"detail": "Credenciales incorrectas"}), 401

    if user.get("status") == "suspended":
        log.auth("login_blocked", email=email, success=False, reason="suspended")
        return jsonify({"detail": "Tu cuenta está suspendida. Contacta soporte."}), 403

    token = create_access_token({"sub": user["email"]})
    log.auth("login", email=email, success=True, user_id=user["id"])
    return jsonify({"access_token": token, "user": _user_to_dict(user)})


# ─── POST /register ───────────────────────────────────────────────────────────

@auth_bp.post("/register")
def register():
    body           = request.get_json() or {}
    name           = body.get("name", "").strip()
    email          = body.get("email", "").strip().lower()
    password       = body.get("password", "")
    favorite_teams = body.get("favorite_teams", [])

    if not name or not email or not password:
        return jsonify({"detail": "Todos los campos son requeridos"}), 400

    if len(password) < 8:
        return jsonify({"detail": "La contraseña debe tener al menos 8 caracteres"}), 400

    if get_user_by_email(email):
        return jsonify({"detail": "El email ya está registrado"}), 409

    user_id = str(uuid.uuid4())
    handle  = f"@{name.lower().replace(' ', '')}{user_id[:4]}"

    user = create_user({
        "id":              user_id,
        "name":            name,
        "handle":          handle,
        "email":           email,
        "role":            "user",
        "status":          "active",
        "timezone":        "UTC-5",
        "city":            "",
        "favoriteTeams":   favorite_teams,
        "avatar":          None,
        "createdAt":       datetime.now(timezone.utc).isoformat(),
        "hashed_password": hash_password(password),
    })

    token = create_access_token({"sub": user["email"]})
    log.auth("register", email=email, success=True, user_id=user["id"])
    return jsonify({"access_token": token, "user": _user_to_dict(user)}), 201


# ─── POST /forgot-password ────────────────────────────────────────────────────

@auth_bp.post("/forgot-password")
def forgot_password():
    body  = request.get_json() or {}
    email = body.get("email", "").strip()

    if not email:
        return jsonify({"detail": "Email requerido"}), 400

    # Siempre retorna éxito para no revelar si el email existe (seguridad)
    # TODO (v2): generar token de reset, enviar email via SendGrid
    log.info("auth.forgot_password_requested", user_email=email)
    return jsonify({"sent": True})


# ─── GET /me ─────────────────────────────────────────────────────────────────

@auth_bp.get("/me")
@require_auth
def get_me():
    """
    Verifica que el token sea válido y devuelve el perfil actualizado.
    Usado por el frontend al recargar la página para rehidratar el AuthContext.
    """
    return jsonify(_user_to_dict(g.current_user))


# ─── PATCH /me ────────────────────────────────────────────────────────────────

@auth_bp.patch("/me")
@require_auth
def update_me():
    body  = request.get_json() or {}
    patch = {k: v for k, v in body.items() if k in ALLOWED_PROFILE_FIELDS}

    if not patch:
        return jsonify({"detail": "No se enviaron campos válidos"}), 400

    updated = update_user(g.current_user["email"], patch)
    if not updated:
        return jsonify({"detail": "Usuario no encontrado"}), 404

    log.info("auth.profile_updated", user_email=g.current_user["email"], fields=list(patch.keys()))
    return jsonify(_user_to_dict(updated))
