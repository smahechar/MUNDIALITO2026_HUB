from flask import Blueprint, jsonify, request, g
from core.middleware import require_auth
from db.predictions_data import (
    get_user_predictions, get_timeline, get_special_picks, save_prediction,
)

predictions_bp = Blueprint("predictions", __name__, url_prefix="/api/v1/predictions")


# GET /api/v1/predictions/me  (requiere token)
@predictions_bp.get("/me")
@require_auth
def my_predictions():
    return jsonify(get_user_predictions(g.current_user["email"]))


# GET /api/v1/predictions/timeline  (requiere token)
@predictions_bp.get("/timeline")
@require_auth
def timeline():
    return jsonify(get_timeline(g.current_user["email"]))


# GET /api/v1/predictions/special  (requiere token)
@predictions_bp.get("/special")
@require_auth
def special_picks():
    return jsonify(get_special_picks(g.current_user["email"]))


# PUT /api/v1/predictions/<match_id>  (requiere token)
@predictions_bp.put("/<match_id>")
@require_auth
def save(match_id):
    body = request.get_json() or {}
    prediction, error = save_prediction(g.current_user["email"], match_id, body)
    if error:
        status = 423 if "ya inicio" in error else 400
        return jsonify({"detail": error}), status
    return jsonify(prediction)
