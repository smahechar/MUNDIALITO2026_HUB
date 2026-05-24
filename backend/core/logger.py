"""
Logger estructurado — Mundialito 2026 Hub
Emite JSON por stdout → compatible con Splunk, ElasticSearch, Loki.

Uso:
    from core.logger import log

    log.info("user.login",  user_email="test@x.com", ip="1.2.3.4")
    log.warn("ticket.expire", ticket_id="T-1234", correlation_id="tx_abc")
    log.error("db.query_failed", error=str(e), resource="/api/v1/tickets")

Campos siempre presentes en cada línea JSON:
    timestamp, level, service, action, correlation_id
"""

import json
import logging
import sys
import uuid
from datetime import datetime, timezone
from functools import wraps
from typing import Any

from flask import g, request

SERVICE_NAME = "mundialito-api"


# ─── Formatter JSON ──────────────────────────────────────────────────────────

class JSONFormatter(logging.Formatter):
    """Convierte cada LogRecord en una línea JSON plana."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp":      datetime.now(timezone.utc).isoformat(),
            "level":          record.levelname,
            "service":        SERVICE_NAME,
            "action":         record.getMessage(),
        }

        # Copiar todos los campos extra que se pasen con log.info("action", campo=valor)
        for key, val in record.__dict__.items():
            if key not in (
                "name", "msg", "args", "created", "filename", "funcName",
                "levelname", "levelno", "lineno", "module", "msecs",
                "message", "pathname", "process", "processName",
                "relativeCreated", "stack_info", "thread", "threadName",
                "exc_info", "exc_text",
            ):
                payload[key] = val

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str, ensure_ascii=False)


# ─── Logger singleton ─────────────────────────────────────────────────────────

def _build_logger() -> logging.Logger:
    logger = logging.getLogger("mundialito")
    logger.setLevel(logging.DEBUG)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)

    logger.propagate = False
    return logger


_logger = _build_logger()


# ─── API pública ──────────────────────────────────────────────────────────────

class _Log:
    """
    Wrapper con helpers contextuales.
    Siempre intenta extraer user_id y correlation_id del contexto Flask (g).
    """

    def _enrich(self, extra: dict) -> dict:
        """Agrega campos del contexto HTTP si están disponibles."""
        try:
            extra.setdefault("correlation_id", getattr(g, "correlation_id", None))
            extra.setdefault("user_id",         getattr(g, "current_user", {}).get("id"))
            extra.setdefault("user_email",       getattr(g, "current_user", {}).get("email"))
            extra.setdefault("ip",               request.remote_addr)
            extra.setdefault("method",           request.method)
            extra.setdefault("path",             request.path)
        except RuntimeError:
            # Fuera de contexto Flask (tests, seed, scheduler)
            pass
        return extra

    def info(self, action: str, **kwargs):
        _logger.info(action, extra=self._enrich(kwargs))

    def warn(self, action: str, **kwargs):
        _logger.warning(action, extra=self._enrich(kwargs))

    def error(self, action: str, **kwargs):
        _logger.error(action, extra=self._enrich(kwargs), exc_info=kwargs.pop("exc_info", False))

    def debug(self, action: str, **kwargs):
        _logger.debug(action, extra=self._enrich(kwargs))

    # ── Eventos de auditoría con semántica específica ──────────────────────────

    def auth(self, action: str, email: str, success: bool, **kwargs):
        level = self.info if success else self.warn
        level(f"auth.{action}", user_email=email, success=success, **kwargs)

    def ticket(self, action: str, ticket_id: str, email: str, **kwargs):
        self.info(f"ticket.{action}", ticket_id=ticket_id, user_email=email, **kwargs)

    def album(self, action: str, email: str, **kwargs):
        self.info(f"album.{action}", user_email=email, **kwargs)

    def pool(self, action: str, pool_id: str, email: str, **kwargs):
        self.info(f"pool.{action}", pool_id=pool_id, user_email=email, **kwargs)

    def prediction(self, action: str, match_id: str, email: str, **kwargs):
        self.info(f"prediction.{action}", match_id=match_id, user_email=email, **kwargs)

    def admin(self, action: str, admin_email: str, **kwargs):
        self.info(f"admin.{action}", admin_email=admin_email, **kwargs)


log = _Log()


# ─── Middleware de request logging ────────────────────────────────────────────

def init_request_logging(app):
    """
    Registra before/after request para loguear cada llamada HTTP.
    Asigna un correlation_id único por request.
    """
    import time

    @app.before_request
    def before():
        g.correlation_id = request.headers.get("X-Correlation-ID") or f"req_{uuid.uuid4().hex[:12]}"
        g._start_time = time.monotonic()

    @app.after_request
    def after(response):
        duration_ms = round((time.monotonic() - getattr(g, "_start_time", 0)) * 1000, 2)

        # No loguear health check para no saturar
        if request.path == "/":
            return response

        level = log.warn if response.status_code >= 400 else log.info
        level(
            "http.request",
            status_code=response.status_code,
            duration_ms=duration_ms,
            correlation_id=getattr(g, "correlation_id", None),
        )
        return response

    @app.errorhandler(Exception)
    def unhandled(err):
        log.error("http.unhandled_exception", error=str(err), exc_info=True)
        return {"detail": "Error interno del servidor"}, 500
