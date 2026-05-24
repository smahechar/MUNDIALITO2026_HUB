from flask import Blueprint, jsonify, request, g
from core.middleware import require_auth
from db.tickets_data import (
    get_sectors, get_user_tickets, get_ticket, get_available,
    get_history, reserve_ticket, confirm_ticket, transfer_ticket, refund_ticket,
)

tickets_bp = Blueprint("tickets", __name__, url_prefix="/api/v1/tickets")


# GET /api/v1/tickets  (requiere token)
@tickets_bp.get("", strict_slashes=False)
@require_auth
def my_tickets():
    return jsonify(get_user_tickets(g.current_user["email"]))


# GET /api/v1/tickets/available  (público)
@tickets_bp.get("/available")
def available():
    return jsonify(get_available())


# GET /api/v1/tickets/sectors  (público)
@tickets_bp.get("/sectors")
def sectors():
    return jsonify(get_sectors())


# GET /api/v1/tickets/:id  (requiere token)
@tickets_bp.get("/<ticket_id>")
@require_auth
def ticket_detail(ticket_id):
    ticket = get_ticket(ticket_id, g.current_user["email"])
    if not ticket:
        return jsonify({"detail": "Ticket no encontrado"}), 404
    return jsonify(ticket)


# GET /api/v1/tickets/:id/history  (requiere token)
@tickets_bp.get("/<ticket_id>/history")
@require_auth
def ticket_history(ticket_id):
    history, error = get_history(ticket_id, g.current_user["email"])
    if error:
        status = 403 if "autorizado" in error.lower() else 404
        return jsonify({"detail": error}), status
    return jsonify(history)


# POST /api/v1/tickets/reserve  (requiere token)
@tickets_bp.post("/reserve")
@require_auth
def reserve():
    body   = request.get_json() or {}
    ticket, error = reserve_ticket(g.current_user["email"], body)
    if error:
        return jsonify({"detail": error}), 400
    return jsonify(ticket), 201


# POST /api/v1/tickets/:id/confirm  (requiere token)
@tickets_bp.post("/<ticket_id>/confirm")
@require_auth
def confirm(ticket_id):
    ticket, error = confirm_ticket(ticket_id, g.current_user["email"])
    if error:
        status = 404 if "no encontrado" in error.lower() else \
                 403 if "autorizado" in error.lower() else \
                 410 if "expiró" in error.lower() else 409
        return jsonify({"detail": error}), status
    return jsonify(ticket)


# POST /api/v1/tickets/:id/transfer  (requiere token)
@tickets_bp.post("/<ticket_id>/transfer")
@require_auth
def transfer(ticket_id):
    body   = request.get_json() or {}
    handle = body.get("handle", "").strip()
    if not handle:
        return jsonify({"detail": "El handle del destinatario es requerido"}), 400
    ticket, error = transfer_ticket(ticket_id, g.current_user["email"], handle)
    if error:
        status = 404 if "no encontrado" in error.lower() else \
                 403 if "autorizado" in error.lower() else 409
        return jsonify({"detail": error}), status
    return jsonify(ticket)


# POST /api/v1/tickets/:id/refund  (requiere token)
@tickets_bp.post("/<ticket_id>/refund")
@require_auth
def refund(ticket_id):
    ticket, error = refund_ticket(ticket_id, g.current_user["email"])
    if error:
        status = 404 if "no encontrado" in error.lower() else \
                 403 if "autorizado" in error.lower() else 409
        return jsonify({"detail": error}), status
    return jsonify(ticket)
