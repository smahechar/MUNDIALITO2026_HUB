"""
Adaptador de datos de partidos — Mundialito 2026 Hub.

El PDF exige que el sistema:
  - Consuma datos de proveedores externos (football-data.org, API-FOOTBALL,
    TheSportsDB, o Wiremock con contrato).
  - Degradar con gracia cuando la fuente falle: mostrar el último dato
    confirmado y etiquetar "actualización pendiente".
  - Pueda cambiar de proveedor sin reescribir la lógica.

Patrón Adapter + factory por env.

──────────────────────────────────────────────────────────────────────────────
                       CONTRATO DEL PROVIDER (v1)
──────────────────────────────────────────────────────────────────────────────

`MatchesProvider.fetch_matches()` devuelve una lista de `MatchUpdate`:

  MatchUpdate {
    id:         str                  # match id local (o mapeado desde el proveedor)
    home_score: int | None
    away_score: int | None
    status:     "upcoming" | "live" | "halftime" | "final"
    minute:     str | None           # "67'", "HT", "FT", None
    kickoff:    datetime | None      # override de horario (raro)
    events:     list[dict] | None    # eventos ricos opcionales
    source:     str                  # nombre del proveedor
  }

El orquestador (`db/matches_sync.py`) decide si aplicar cada update.
──────────────────────────────────────────────────────────────────────────────

Variables de entorno relevantes:
  MATCHES_PROVIDER             "mock" (default) | "football-data" | "wiremock"
  FOOTBALL_DATA_API_KEY        token de football-data.org (free tier OK)
  FOOTBALL_DATA_COMPETITION    código de competencia (default: "WC")
  MATCHES_WIREMOCK_URL         base URL del mock (ej "http://localhost:9000")
"""

import os
import random
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Protocol

from core.logger import log


# ─── Estructura del update ───────────────────────────────────────────────────

@dataclass
class MatchUpdate:
    id: str
    source: str
    home_score: int | None = None
    away_score: int | None = None
    status: str | None = None
    minute: str | None = None
    kickoff: datetime | None = None
    events: list[dict] | None = None


# ─── Interfaz ────────────────────────────────────────────────────────────────

class MatchesProvider(Protocol):
    name: str

    def fetch_matches(self) -> list[MatchUpdate]: ...


# ─── Mock provider (default — sin red) ───────────────────────────────────────

class MockMatchesProvider:
    """
    Genera updates determinísticos para los matches existentes en BD.
    Para QA y demo: avanza el reloj de los partidos en vivo, deja los
    upcoming sin cambios.
    """
    name = "mock"

    def fetch_matches(self) -> list[MatchUpdate]:
        from db.database import SessionLocal
        from db.models import Match

        updates: list[MatchUpdate] = []
        with SessionLocal() as db:
            matches = db.query(Match).all()
            for m in matches:
                if m.status == "live":
                    # Avanza un minuto al random (a veces gol del local)
                    try:
                        current = int((m.minute or "0").replace("'", "")) if m.minute and m.minute[0].isdigit() else 0
                    except ValueError:
                        current = 0
                    new_minute = f"{min(90, current + 1)}'"
                    new_home = m.home_score or 0
                    new_away = m.away_score or 0
                    if random.random() < 0.02:  # 2% chance de gol por tick
                        if random.random() < 0.5:
                            new_home += 1
                        else:
                            new_away += 1
                    updates.append(MatchUpdate(
                        id=m.id, source=self.name,
                        home_score=new_home, away_score=new_away,
                        status="live", minute=new_minute,
                    ))
                elif m.status in ("upcoming", "halftime", "final"):
                    # Reportar status confirmado (sirve como heartbeat)
                    updates.append(MatchUpdate(
                        id=m.id, source=self.name,
                        home_score=m.home_score, away_score=m.away_score,
                        status=m.status, minute=m.minute,
                    ))
        return updates


# ─── Football-Data.org provider (stub real) ──────────────────────────────────

class FootballDataOrgProvider:
    """
    Cliente HTTP para https://api.football-data.org/v4 (plan gratuito).
    Stub: si la lib `requests` o la key no están, cae al mock con flag visible.

    Para activar en producción/demo real:
      1. Registrarse en football-data.org y obtener API token gratuito.
      2. `FOOTBALL_DATA_API_KEY=<token>` en .env
      3. Mapear los IDs de match externos a los IDs locales (TODO v2).
    """
    name = "football-data.org"

    def __init__(self, api_key: str, competition: str = "WC"):
        self.api_key     = api_key
        self.competition = competition

    def fetch_matches(self) -> list[MatchUpdate]:
        try:
            import requests
        except ImportError:
            log.warn("matches.provider_unavailable", reason="requests_not_installed",
                     provider=self.name)
            return []

        url = f"https://api.football-data.org/v4/competitions/{self.competition}/matches"
        try:
            r = requests.get(url, headers={"X-Auth-Token": self.api_key}, timeout=8)
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            log.error("matches.fetch_failed", provider=self.name, error=str(e))
            return []

        updates: list[MatchUpdate] = []
        for m in data.get("matches", []):
            # TODO (v2): construir mapeo externo → local. Por ahora,
            # asumimos que el id local es "fd_<id externo>".
            local_id = f"fd_{m.get('id')}"
            score    = m.get("score", {}).get("fullTime", {})
            updates.append(MatchUpdate(
                id=local_id, source=self.name,
                home_score=score.get("home"),
                away_score=score.get("away"),
                status=_map_fd_status(m.get("status")),
                minute=str(m.get("minute")) + "'" if m.get("minute") else None,
            ))
        return updates


def _map_fd_status(s: str | None) -> str | None:
    return {
        "SCHEDULED":    "upcoming",
        "TIMED":        "upcoming",
        "IN_PLAY":      "live",
        "PAUSED":       "halftime",
        "FINISHED":     "final",
        "POSTPONED":    "upcoming",
        "SUSPENDED":    "upcoming",
        "CANCELLED":    "upcoming",
    }.get(s or "")


# ─── Wiremock provider (contrato local documentado) ──────────────────────────

class WiremockMatchesProvider:
    """
    Cliente HTTP para un mock declarativo (Wiremock Cloud / OpenAPI mock).

    Contrato esperado:
      GET <base>/v1/matches
      → 200 application/json
      → [ { "id": "m1", "home_score": 1, "away_score": 0,
            "status": "live", "minute": "67'", "events": [...] }, ... ]

      Headers opcionales:
        X-Source: <nombre>     (default "wiremock")
        X-Last-Modified: <ISO> (info de freshness — no se usa por ahora)

    Si la respuesta es 5xx o timeout, devuelve [] → degradación silenciosa.
    """
    name = "wiremock"

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def fetch_matches(self) -> list[MatchUpdate]:
        try:
            import requests
        except ImportError:
            return []

        try:
            r = requests.get(f"{self.base_url}/v1/matches", timeout=5)
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            log.error("matches.fetch_failed", provider=self.name, error=str(e))
            return []

        if not isinstance(data, list):
            log.warn("matches.bad_payload", provider=self.name)
            return []

        source = r.headers.get("X-Source", self.name)
        return [
            MatchUpdate(
                id=str(m.get("id")),
                source=source,
                home_score=m.get("home_score"),
                away_score=m.get("away_score"),
                status=m.get("status"),
                minute=m.get("minute"),
                events=m.get("events"),
            )
            for m in data
            if m.get("id")
        ]


# ─── Factory ─────────────────────────────────────────────────────────────────

def get_matches_provider() -> MatchesProvider:
    choice = os.getenv("MATCHES_PROVIDER", "mock").strip().lower()

    if choice == "football-data":
        key = os.getenv("FOOTBALL_DATA_API_KEY", "").strip()
        if key:
            return FootballDataOrgProvider(
                api_key=key,
                competition=os.getenv("FOOTBALL_DATA_COMPETITION", "WC"),
            )
        log.warn("matches.provider_fallback", reason="no_api_key", attempted="football-data")

    if choice == "wiremock":
        url = os.getenv("MATCHES_WIREMOCK_URL", "").strip()
        if url:
            return WiremockMatchesProvider(base_url=url)
        log.warn("matches.provider_fallback", reason="no_base_url", attempted="wiremock")

    return MockMatchesProvider()
