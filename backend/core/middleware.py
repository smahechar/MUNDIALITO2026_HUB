from functools import wraps
from flask import request, jsonify, g
from core.security import decode_token
from db.memory import get_user_by_email


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"detail": "Token requerido"}), 401
        token = auth_header[7:]
        try:
            payload = decode_token(token)
            user = get_user_by_email(payload.get("sub", ""))
            if not user:
                return jsonify({"detail": "Usuario no encontrado"}), 401
            g.current_user = user
        except Exception:
            return jsonify({"detail": "Token inválido o expirado"}), 401
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    @wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        if g.current_user.get("role") != "admin":
            return jsonify({"detail": "Se requiere rol de administrador"}), 403
        return f(*args, **kwargs)
    return decorated
