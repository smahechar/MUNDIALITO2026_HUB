import os
import sys
from pathlib import Path

import pytest


# Agrega backend/ al PYTHONPATH para que pytest encuentre:
# db, core, routers, integrations, etc.
BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


os.environ.setdefault("FLASK_ENV", "testing")
os.environ.setdefault("FLASK_DEBUG", "false")
os.environ.setdefault("PAYMENT_PROVIDER", "mock")
os.environ.setdefault("NOTIFICATIONS_ENABLED", "false")
os.environ.setdefault("JWT_SECRET", "test_secret")

# Variables fake para que config.py no falle durante importación.
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "3306")
os.environ.setdefault("DB_USER", "root")
os.environ.setdefault("DB_PASSWORD", "root")
os.environ.setdefault("DB_NAME", "mundialito2026")


@pytest.fixture
def app():
    from app import app as flask_app

    flask_app.config.update({
        "TESTING": True,
    })

    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()