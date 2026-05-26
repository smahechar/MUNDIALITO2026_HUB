"""
Mundialito 2026 Hub — Backend Principal
Flask app con:
  - Registro de blueprints (todos los routers)
  - Logger estructurado JSON (compatible con Splunk/ElasticSearch)
  - APScheduler: expira reservas de tickets cada 60 s
  - Health check con estado de BD
  - CORS configurado para dev y prod
"""

from flask import Flask, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from flask import redirect

# ─── Routers ──────────────────────────────────────────────────────────────────
from routers.auth        import auth_bp
from routers.matches     import matches_bp
from routers.nations     import nations_bp
from routers.pools       import pools_bp
from routers.predictions import predictions_bp
from routers.album       import album_bp
from routers.tickets     import tickets_bp
from routers.groups      import groups_bp
from routers.admin       import admin_bp
from routers.notifications import notifications_bp

# ─── Core ─────────────────────────────────────────────────────────────────────
from core.logger import log, init_request_logging
from db.database import check_connection

# ─── Tareas periódicas ────────────────────────────────────────────────────────
from db.tickets_data import expire_all_pending


def _expire_job():
    """Job del scheduler: expira reservas de tickets cada 60 segundos."""
    try:
        count = expire_all_pending()
        if count > 0:
            log.info("scheduler.tickets_expired", count=count)
    except Exception as e:
        log.error("scheduler.expire_failed", error=str(e))


# ─── Factory ──────────────────────────────────────────────────────────────────

def create_app() -> Flask:
    app = Flask(__name__)

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS(app, origins=[
        "http://localhost:5173",   # Vite dev
        "http://localhost:3000",   # alternativa
    ])

    # ── Logging estructurado ──────────────────────────────────────────────────
    init_request_logging(app)

    # ── Blueprints ────────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp,        url_prefix="/api/v1/auth")
    app.register_blueprint(matches_bp)
    app.register_blueprint(nations_bp)
    app.register_blueprint(pools_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(album_bp)
    app.register_blueprint(tickets_bp)
    app.register_blueprint(groups_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notifications_bp)

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/")
    def root():
        return redirect("http://localhost:5173/login")

    # ── Scheduler de expiración de tickets ────────────────────────────────────
    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(
        _expire_job,
        trigger="interval",
        seconds=60,
        id="expire_tickets",
        replace_existing=True,
    )
    scheduler.start()
    log.info("scheduler.started", job="expire_tickets", interval_seconds=60)

    log.info("app.started", service="mundialito-api")
    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=8000)
