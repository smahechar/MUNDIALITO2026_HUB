# Handoff — Backend Mundialito 2026 Hub

## Stack
- **Flask** (Python) — servidor HTTP
- **PyJWT** + **Werkzeug** — autenticación JWT y hashing de contraseñas
- **Base de datos**: pendiente (PostgreSQL + SQLAlchemy) — ver sección "Tu trabajo"

---

## Estructura del proyecto

```
backend/
├── app.py              # Entry point — Flask app, CORS, registro de blueprints
├── requirements.txt
├── .env.example        # Copiar a .env y completar
│
├── core/
│   ├── config.py       # Lee SECRET_KEY y otros vars de .env
│   ├── security.py     # hash_password, verify_password, create_access_token, decode_token
│   └── middleware.py   # Decorador @require_auth para rutas protegidas
│
├── routers/
│   └── auth.py         # Endpoints de autenticación (Blueprint /api/v1/auth)
│
└── db/
    └── memory.py       # ← AQUÍ ESTÁ TU TRABAJO (ver abajo)
```

---

## Cómo correr (sin BD, modo temporal)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env       # ajustar SECRET_KEY
python app.py
# → http://localhost:8000
```

O doble clic en `instalar.bat` y luego `iniciar.bat`.

---

## Tu trabajo — Conectar PostgreSQL

Todo lo que necesitas tocar está en **`db/memory.py`**.

El archivo actual usa un dict en memoria (`_users = {}`). Cuando la BD esté lista, reemplaza cada función con la query SQLAlchemy equivalente. Los comentarios `# TODO (DB):` indican exactamente qué query va en cada función.

### Paso 1 — Instalar dependencias adicionales

Agrega al `requirements.txt`:
```
sqlalchemy==2.0.36
psycopg2-binary==2.9.10
```

### Paso 2 — Crear la conexión en `db/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/mundialito")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass
```

Agrega `DATABASE_URL` a `.env`.

### Paso 3 — Crear el modelo `User` en `db/models.py`

```python
from sqlalchemy import Column, String, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name           = Column(String, nullable=False)
    handle         = Column(String, nullable=False)
    email          = Column(String, unique=True, nullable=False, index=True)
    role           = Column(String, default="user")
    timezone       = Column(String, default="UTC-5")
    city           = Column(String, default="")
    favorite_teams = Column(ARRAY(String), default=[])
    avatar         = Column(String, nullable=True)
    created_at     = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    hashed_password = Column(String, nullable=False)
```

### Paso 4 — Reemplazar funciones en `db/memory.py`

Cada función tiene su query equivalente documentada. Ejemplo de cómo quedaría:

```python
from db.database import SessionLocal
from db.models import User

def get_user_by_email(email: str) -> dict | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        return _model_to_dict(user)

def create_user(user: dict) -> dict:
    with SessionLocal() as db:
        db_user = User(
            id=user["id"],
            name=user["name"],
            handle=user["handle"],
            email=user["email"],
            role=user["role"],
            timezone=user["timezone"],
            city=user["city"],
            favorite_teams=user["favoriteTeams"],
            avatar=user["avatar"],
            hashed_password=user["hashed_password"],
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return _model_to_dict(db_user)

def update_user(email: str, patch: dict) -> dict | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        for key, value in patch.items():
            # mapear camelCase → snake_case si aplica
            attr = "favorite_teams" if key == "favoriteTeams" else key
            setattr(user, attr, value)
        db.commit()
        db.refresh(user)
        return _model_to_dict(user)

def _model_to_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "handle": user.handle,
        "email": user.email,
        "role": user.role,
        "timezone": user.timezone,
        "city": user.city,
        "favoriteTeams": user.favorite_teams or [],
        "avatar": user.avatar,
        "createdAt": user.created_at.isoformat(),
        "hashed_password": user.hashed_password,
    }
```

### Paso 5 — Crear la tabla

```python
# correr una vez para crear las tablas
from db.database import engine, Base
from db.models import User
Base.metadata.create_all(bind=engine)
```

O con Alembic si prefieren migraciones.

---

## Tabla `matches` — modelo y seed

### Por qué la BD es responsable de los partidos

El fixture del Mundial 2026 se carga **una sola vez** al crear la BD (seed).
Los resultados (score, status, minute) los actualiza el operador/admin desde el panel
vía `PATCH /api/v1/admin/matches/:id` (implementado en Paso 9).
El backend solo lee de la tabla — no hay integración con API externa.

### Modelo SQLAlchemy

```python
# db/models.py  (agregar junto al modelo User)
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Match(Base):
    __tablename__ = "matches"

    id         = Column(String, primary_key=True)          # "m1", "m2", ...
    home       = Column(String(3), nullable=False)         # código 3 letras: "ESP"
    away       = Column(String(3), nullable=False)
    group      = Column(String(2), nullable=True)          # "A"-"H", None en eliminatoria
    stadium    = Column(String, nullable=False)
    city       = Column(String, nullable=False)
    phase      = Column(String, nullable=False)            # "Group A · MD1"
    status     = Column(String, default="upcoming")        # upcoming|live|halftime|final
    minute     = Column(String, nullable=True)             # "67'", "HT", "FT", null
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    kickoff    = Column(DateTime(timezone=True), nullable=False)
```

### Función `_match_to_dict` para el helper

```python
def _match_to_dict(m: Match) -> dict:
    return {
        "id":        m.id,
        "home":      m.home,
        "away":      m.away,
        "group":     m.group,
        "stadium":   m.stadium,
        "city":      m.city,
        "phase":     m.phase,
        "status":    m.status,
        "minute":    m.minute,
        "homeScore": m.home_score,
        "awayScore": m.away_score,
        "kickoff":   m.kickoff.isoformat(),
    }
```

### Reemplazar funciones en `db/matches_data.py`

```python
def get_all_matches(status=None):
    with SessionLocal() as db:
        q = db.query(Match)
        if status:
            q = q.filter(Match.status == status)
        return [_match_to_dict(m) for m in q.order_by(Match.kickoff).all()]

def get_match_by_id(match_id):
    with SessionLocal() as db:
        m = db.query(Match).filter(Match.id == match_id).first()
        return _match_to_dict(m) if m else None

def get_live_matches():
    with SessionLocal() as db:
        rows = db.query(Match).filter(Match.status.in_(["live","halftime"])).all()
        return [_match_to_dict(m) for m in rows]
```

---

## Tabla `nations` — modelo y seed

Las naciones son datos **estáticos** (no cambian durante el torneo). Se seedean una vez.
Las standings **no** tienen tabla propia — se calculan con un `SELECT` sobre `matches`.

### Modelo SQLAlchemy

```python
# db/models.py  (agregar junto a User y Match)
from sqlalchemy import Column, String, ARRAY

class Nation(Base):
    __tablename__ = "nations"

    code   = Column(String(3), primary_key=True)  # "ESP", "BOR", ...
    name   = Column(String, nullable=False)
    group  = Column(String(1), nullable=False)     # "A"-"F"
    colors = Column(ARRAY(String), nullable=False) # ["#hex1","#hex2","#hex3"]
    layout = Column(String, nullable=False)        # "h"|"v"|"diag"|"cross"
```

### Reemplazar funciones en `db/nations_data.py`

```python
def get_all_nations():
    with SessionLocal() as db:
        return [_nation_to_dict(n) for n in db.query(Nation).order_by(Nation.group, Nation.name).all()]

def get_nation_by_code(code):
    with SessionLocal() as db:
        n = db.query(Nation).filter(Nation.code == code.upper()).first()
        return _nation_to_dict(n) if n else None

def get_group_standings():
    # Las standings se siguen computando desde Match (igual que ahora),
    # solo cambia el origen de los datos:
    with SessionLocal() as db:
        finished = db.query(Match).filter(
            Match.status == "final",
            Match.group != None
        ).all()
    # ... mismo algoritmo de acumulación W/D/L/GF/GA
```

### Seed del fixture

Los partidos del fixture real del Mundial 2026 se ingresan con un script de seed
(o con Alembic data migrations). La estructura de cada fila es exactamente la del
modelo de arriba. El archivo `backend/db/matches_data.py` tiene los datos ficticios
actuales que sirven de referencia para el formato esperado.

---

## Endpoints implementados

| Paso | Método | Ruta | Auth | Descripción |
|------|--------|------|------|-------------|
| 1 | GET    | `/` | No | Health check |
| 1 | POST   | `/api/v1/auth/login` | No | Login → `{ access_token, user }` |
| 1 | POST   | `/api/v1/auth/register` | No | Registro → `{ access_token, user }` |
| 1 | POST   | `/api/v1/auth/forgot-password` | No | Envío de email de reset (stub) |
| 1 | PATCH  | `/api/v1/auth/me` | Sí | Actualiza perfil del usuario |
| 2 | GET    | `/api/v1/matches` | No | Lista de partidos (`?status=` opcional) |
| 2 | GET    | `/api/v1/matches/live` | No | Partidos live + halftime |
| 2 | GET    | `/api/v1/matches/moments` | No | Highlights textuales |
| 2 | GET    | `/api/v1/matches/scorers` | No | Tabla de goleadores |
| 2 | GET    | `/api/v1/matches/:id` | No | Partido por ID |
| 2 | GET    | `/api/v1/matches/:id/detail` | No | Eventos, stats, alineaciones, H2H |
| 3 | GET    | `/api/v1/nations` | No | Lista de 24 selecciones |
| 3 | GET    | `/api/v1/nations/groups` | No | Standings de 6 grupos (computadas desde resultados) |
| 3 | GET    | `/api/v1/nations/:code` | No | Selección por código de 3 letras |
| 4 | GET    | `/api/v1/pools/me` | Sí | Pollas del usuario autenticado |
| 4 | GET    | `/api/v1/pools/discover` | No | Pollas públicas para unirse |
| 4 | GET    | `/api/v1/pools/rules` | No | Reglas de puntuación |
| 4 | POST   | `/api/v1/pools` | Sí | Crear nueva polla → `{ id, code, name, ... }` |
| 4 | POST   | `/api/v1/pools/join` | Sí | Unirse por código → `{ success, pool }` |
| 4 | GET    | `/api/v1/pools/:id` | Sí | Detalle de una polla |
| 4 | GET    | `/api/v1/pools/:id/members` | Sí | Leaderboard de la polla |

### Formato del objeto `user` en todas las respuestas

```json
{
  "id": "uuid",
  "name": "string",
  "handle": "@string",
  "email": "string",
  "role": "user | admin",
  "timezone": "UTC-5",
  "city": "string",
  "favoriteTeams": ["ESP", "COL"],
  "avatar": null,
  "createdAt": "2026-05-24T00:00:00+00:00"
}
```

### Errores — formato estándar

Todos los errores retornan JSON con el campo `detail`:
```json
{ "detail": "Mensaje de error" }
```

---

## Próximos endpoints a implementar (Pasos 3–9)

| Blueprint | Prefix | Endpoints principales |
|-----------|--------|-----------------------|
| `routers/nations.py` | `/api/v1/nations` | GET /, GET /:code, GET /groups |
| `routers/pools.py` | `/api/v1/pools` | GET /me, POST /, GET /:id, GET /:id/members, POST /join |
| `routers/predictions.py` | `/api/v1/predictions` | GET /me, PUT /:matchId, GET /timeline |
| `routers/album.py` | `/api/v1/album` | GET /, POST /open-pack, GET /offers, POST /trade |
| `routers/tickets.py` | `/api/v1/tickets` | GET /, GET /:id, POST /reserve, POST /:id/confirm, POST /:id/transfer |
| `routers/groups.py` | `/api/v1/groups` | GET /me, POST /, POST /join, POST /:id/leave |
| `routers/admin.py` | `/api/v1/admin` | GET /users, PATCH /matches/:id, GET /alerts, POST /alerts/broadcast |

---

## Variables de entorno (`.env`)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Clave para firmar JWT | `dev-secret-change-in-prod` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token | `1440` (24h) |
| `DATABASE_URL` | Conexión PostgreSQL | *(sin default, agregar cuando esté la BD)* |
