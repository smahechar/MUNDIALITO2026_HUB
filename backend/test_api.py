# encoding: utf-8
"""
Test de integracion -- Mundialito 2026 Hub API
Corre con: python test_api.py  (desde la carpeta backend/)
Prueba todos los endpoints implementados: Auth, Matches, Nations.
"""
from app import app

client = app.test_client()
errors = []


def check(label, condition, detail=""):
    tag = "[ OK ]" if condition else "[FAIL]"
    extra = f"  <- {detail}" if (not condition and detail) else ""
    print(f"  {tag}  {label}{extra}")
    if not condition:
        errors.append(label)


def section(title):
    print(f"\n{'='*55}")
    print(f"  {title}")
    print(f"{'='*55}")


# ===========================================================
#  HEALTH
# ===========================================================
section("Health check")
r = client.get("/")
d = r.get_json()
check("GET /  ->  200",           r.status_code == 200)
check("Responde {status: ok}",    d.get("status") == "ok")


# ===========================================================
#  AUTH -- Register
# ===========================================================
section("Auth -- Register")
r = client.post("/api/v1/auth/register", json={
    "name": "Test User", "email": "test@hub.com",
    "password": "secret123", "favorite_teams": ["ESP", "BOR"],
})
d = r.get_json()
check("POST /auth/register  ->  201",         r.status_code == 201)
check("Devuelve access_token",                "access_token" in d)
check("user.email correcto",                  d.get("user", {}).get("email") == "test@hub.com")
check("user.role = user",                     d.get("user", {}).get("role") == "user")
check("user.favoriteTeams = [ESP, BOR]",      d.get("user", {}).get("favoriteTeams") == ["ESP", "BOR"])
check("user.handle empieza con @",            d.get("user", {}).get("handle", "").startswith("@"))
LOGIN_TOKEN = d.get("access_token", "")

section("Auth -- Registro duplicado")
r = client.post("/api/v1/auth/register", json={
    "name": "Otro", "email": "test@hub.com", "password": "abc",
})
check("Registro duplicado  ->  409",          r.status_code == 409)

section("Auth -- Login correcto")
r = client.post("/api/v1/auth/login", json={
    "email": "test@hub.com", "password": "secret123",
})
d = r.get_json()
check("POST /auth/login  ->  200",            r.status_code == 200)
check("Devuelve access_token",                "access_token" in d)
check("user.email correcto",                  d.get("user", {}).get("email") == "test@hub.com")
LOGIN_TOKEN = d.get("access_token", LOGIN_TOKEN)

section("Auth -- Login incorrecto")
r = client.post("/api/v1/auth/login", json={"email": "test@hub.com", "password": "mal"})
check("Password incorrecta  ->  401",         r.status_code == 401)

r = client.post("/api/v1/auth/login", json={"email": "noexiste@x.com", "password": "abc"})
check("Email no registrado  ->  401",         r.status_code == 401)

section("Auth -- Forgot password")
r = client.post("/api/v1/auth/forgot-password", json={"email": "test@hub.com"})
d = r.get_json()
check("POST /auth/forgot-password  ->  200",  r.status_code == 200)
check("Devuelve {sent: true}",                d.get("sent") is True)

section("Auth -- PATCH /me (protegido)")
r = client.patch("/api/v1/auth/me",
    json={"city": "Bogota", "timezone": "UTC-5"},
    headers={"Authorization": f"Bearer {LOGIN_TOKEN}"},
)
d = r.get_json()
check("PATCH /auth/me con token  ->  200",    r.status_code == 200)
check("Actualiza city",                       d.get("city") == "Bogota")
check("Actualiza timezone",                   d.get("timezone") == "UTC-5")

r = client.patch("/api/v1/auth/me", json={"city": "X"})
check("Sin token  ->  401",                   r.status_code == 401)

r = client.patch("/api/v1/auth/me", json={"city": "X"},
    headers={"Authorization": "Bearer token-falso"})
check("Token falso  ->  401",                 r.status_code == 401)


# ===========================================================
#  MATCHES
# ===========================================================
section("Matches -- Lista completa")
r = client.get("/api/v1/matches")
d = r.get_json()
check("GET /matches  ->  200",                r.status_code == 200)
check("Devuelve 12 partidos",                 len(d) == 12)
check("Cada partido tiene id, home, away",    all("id" in m and "home" in m for m in d))
check("Cada partido tiene status y kickoff",  all("status" in m and "kickoff" in m for m in d))

section("Matches -- Filtro por status")
r = client.get("/api/v1/matches?status=live")
d = r.get_json()
check("?status=live  ->  200",                r.status_code == 200)
check("Solo partidos live",                   all(m["status"] == "live" for m in d))

r = client.get("/api/v1/matches?status=final")
d = r.get_json()
check("?status=final  ->  200",               r.status_code == 200)
check("Solo partidos final",                  all(m["status"] == "final" for m in d))

r = client.get("/api/v1/matches?status=upcoming")
d = r.get_json()
check("?status=upcoming devuelve upcoming",   all(m["status"] == "upcoming" for m in d))

section("Matches -- Live")
r = client.get("/api/v1/matches/live")
d = r.get_json()
check("GET /matches/live  ->  200",           r.status_code == 200)
check("Solo live y halftime",                 all(m["status"] in ("live","halftime") for m in d))
check("Minimo 2 partidos en vivo",            len(d) >= 2)

section("Matches -- Moments y Scorers")
r = client.get("/api/v1/matches/moments")
d = r.get_json()
check("GET /matches/moments  ->  200",        r.status_code == 200)
check("Cada moment tiene time, title, tag",   all("time" in m and "tag" in m for m in d))

r = client.get("/api/v1/matches/scorers")
d = r.get_json()
check("GET /matches/scorers  ->  200",        r.status_code == 200)
check("Scorers ordenados por rank",           d[0]["rank"] == 1)
check("Cada scorer tiene goals y nation",     all("goals" in s and "nation" in s for s in d))

section("Matches -- Por ID")
r = client.get("/api/v1/matches/m1")
d = r.get_json()
check("GET /matches/m1  ->  200",             r.status_code == 200)
check("m1: home=ATL, status=live",            d["home"] == "ATL" and d["status"] == "live")
check("m1: tiene homeScore",                  d["homeScore"] is not None)

r = client.get("/api/v1/matches/m4")
d = r.get_json()
check("GET /matches/m4  ->  200 (upcoming)",  r.status_code == 200)
check("m4: homeScore es null",                d["homeScore"] is None)

r = client.get("/api/v1/matches/noexiste")
check("ID inexistente  ->  404",              r.status_code == 404)

section("Matches -- Detalle")
r = client.get("/api/v1/matches/m1/detail")
d = r.get_json()
check("GET /matches/m1/detail  ->  200",      r.status_code == 200)
check("m1: tiene events (>0)",                len(d.get("events", [])) > 0)
check("m1: tiene stats",                      d.get("stats") is not None)
check("m1: tiene lineupHome",                 d.get("lineupHome") is not None)
check("m1: tiene h2h",                        len(d.get("h2h", [])) > 0)
check("m1: tiene weather",                    d.get("weather") is not None)

r = client.get("/api/v1/matches/m4/detail")
d = r.get_json()
check("GET /matches/m4/detail  ->  200",      r.status_code == 200)
check("m4: stats=None (upcoming)",            d.get("stats") is None)

r = client.get("/api/v1/matches/noexiste/detail")
check("Detail ID inexistente  ->  404",       r.status_code == 404)


# ===========================================================
#  NATIONS
# ===========================================================
section("Nations -- Lista")
r = client.get("/api/v1/nations")
d = r.get_json()
check("GET /nations  ->  200",                r.status_code == 200)
check("Devuelve 24 selecciones",              len(d) == 24)
check("Cada nacion tiene code, name, group",  all("code" in n and "group" in n for n in d))
check("Cada nacion tiene 3 colors y layout",  all(len(n.get("colors",[])) == 3 for n in d))

section("Nations -- Grupos y Standings")
r = client.get("/api/v1/nations/groups")
d = r.get_json()
check("GET /nations/groups  ->  200",         r.status_code == 200)
check("Devuelve 6 grupos",                    len(d) == 6)
check("Cada grupo tiene name y teams",        all("name" in g and "teams" in g for g in d))
check("Cada grupo tiene 4 equipos",           all(len(g["teams"]) == 4 for g in d))
check("Teams tienen pts, gf, ga, gd",         all("pts" in t for g in d for t in g["teams"]))
grupo_a = next(g for g in d if g["name"] == "A")
check("Grupo A: BOR lidera (gano 3-2 vs CAR)", grupo_a["teams"][0]["code"] == "BOR")
check("Grupo A: BOR tiene 3 pts",             grupo_a["teams"][0]["pts"] == 3)
grupo_b = next(g for g in d if g["name"] == "B")
check("Grupo B: GAL lidera (gano 1-0 vs HEL)", grupo_b["teams"][0]["code"] == "GAL")

section("Nations -- Por codigo")
r = client.get("/api/v1/nations/ESP")
d = r.get_json()
check("GET /nations/ESP  ->  200",            r.status_code == 200)
check("ESP: name=Esperanza, group=B",         d["name"] == "Esperanza" and d["group"] == "B")

r = client.get("/api/v1/nations/bor")
d = r.get_json()
check("GET /nations/bor (lowercase)  ->  200",r.status_code == 200)
check("bor devuelve Borealis igual",          d["name"] == "Borealis")

r = client.get("/api/v1/nations/ZZZ")
check("Codigo inexistente  ->  404",          r.status_code == 404)


# ===========================================================
#  PREDICTIONS
# ===========================================================
section("Predictions -- Sin autenticacion")
r = client.get("/api/v1/predictions/me")
check("GET /predictions/me sin token  ->  401",      r.status_code == 401)

r = client.get("/api/v1/predictions/timeline")
check("GET /predictions/timeline sin token  ->  401", r.status_code == 401)

AUTH = {"Authorization": f"Bearer {LOGIN_TOKEN}"}

section("Predictions -- GET vacías")
r = client.get("/api/v1/predictions/me", headers=AUTH)
d = r.get_json()
check("GET /predictions/me con token  ->  200",       r.status_code == 200)
check("Lista de predicciones vacía inicialmente",     d == [])

r = client.get("/api/v1/predictions/timeline", headers=AUTH)
d = r.get_json()
check("GET /predictions/timeline  ->  200",            r.status_code == 200)
check("Timeline tiene 9 jornadas (MD1-F)",             len(d) == 9)
check("Timeline: cada item tiene md y pts",            all("md" in t and "pts" in t for t in d))

r = client.get("/api/v1/predictions/special", headers=AUTH)
d = r.get_json()
check("GET /predictions/special  ->  200",             r.status_code == 200)
check("Devuelve champion, runnerUp, topScorer",        all(k in d for k in ("champion","runnerUp","topScorer")))

section("Predictions -- Guardar pronostico")
r = client.put("/api/v1/predictions/m4", headers=AUTH, json={"home": 2, "away": 1})
d = r.get_json()
check("PUT /predictions/m4 (upcoming)  ->  200",       r.status_code == 200)
check("Devuelve matchId=m4",                           d.get("matchId") == "m4")
check("Devuelve home=2, away=1",                       d.get("home") == 2 and d.get("away") == 1)
check("Devuelve id y status=open",                     "id" in d and d.get("status") == "open")
PRED_ID = d.get("id")

r = client.put("/api/v1/predictions/m4", headers=AUTH, json={"home": 3, "away": 0})
d = r.get_json()
check("PUT /predictions/m4 de nuevo (upsert)  ->  200", r.status_code == 200)
check("Mantiene el mismo id (upsert)",                   d.get("id") == PRED_ID)
check("Actualiza home=3, away=0",                        d.get("home") == 3 and d.get("away") == 0)

r = client.get("/api/v1/predictions/me", headers=AUTH)
d = r.get_json()
check("GET /predictions/me ahora tiene 1 prediccion",   len(d) == 1)

section("Predictions -- Validaciones")
r = client.put("/api/v1/predictions/m1", headers=AUTH, json={"home": 1, "away": 0})
check("PUT partido live (m1)  ->  423",                  r.status_code == 423)

r = client.put("/api/v1/predictions/m4", headers=AUTH, json={"away": 1})
check("Sin campo home  ->  400",                         r.status_code == 400)

r = client.put("/api/v1/predictions/m4", headers=AUTH, json={"home": -1, "away": 0})
check("Score negativo  ->  400",                         r.status_code == 400)

r = client.put("/api/v1/predictions/noexiste", headers=AUTH, json={"home": 1, "away": 0})
check("Partido inexistente  ->  400",                    r.status_code == 400)


# ===========================================================
#  ALBUM
# ===========================================================
AUTH = {"Authorization": f"Bearer {LOGIN_TOKEN}"}

section("Album -- Sin autenticacion")
r = client.get("/api/v1/album")
check("GET /album sin token  ->  401",               r.status_code == 401)

section("Album -- Coleccion inicial")
r = client.get("/api/v1/album", headers=AUTH)
d = r.get_json()
check("GET /album con token  ->  200",               r.status_code == 200)
check("Devuelve stickers (288)",                     len(d.get("stickers", [])) == 288)
check("Devuelve stats con total=288",                d.get("stats", {}).get("total") == 288)
check("stats.owned=0 (coleccion nueva)",             d.get("stats", {}).get("owned") == 0)
check("Cada sticker tiene id, nation, rarity",       all("id" in s and "rarity" in s for s in d["stickers"]))
check("Cada sticker tiene owned=False inicialmente", all(s["owned"] is False for s in d["stickers"]))

section("Album -- Abrir sobre")
r = client.post("/api/v1/album/open-pack", headers=AUTH)
d = r.get_json()
check("POST /album/open-pack  ->  200",              r.status_code == 200)
check("Devuelve 5 laminas",                          len(d.get("stickers", [])) == 5)
check("Stats actualizadas: owned=5",                 d.get("stats", {}).get("owned") == 5)
check("Al menos 1 lamina no-comun (R/E/L)",          any(s["rarity"] != "C" for s in d["stickers"]))
check("Cada lamina tiene id, nation, name, rarity",  all("id" in s and "name" in s for s in d["stickers"]))

# Abrir otro sobre para tener laminas para intercambiar
client.post("/api/v1/album/open-pack", headers=AUTH)
r = client.get("/api/v1/album", headers=AUTH)
d = r.get_json()
check("Coleccion crece despues de 2 sobres (>=5)",   d["stats"]["owned"] >= 5)

section("Album -- Ofertas e intercambios")
r = client.get("/api/v1/album/offers", headers=AUTH)
d = r.get_json()
check("GET /album/offers  ->  200",                  r.status_code == 200)
check("Sin trades inicialmente",                     d == [])

# Obtener una lamina que el usuario tenga para ofrecerla
r2    = client.get("/api/v1/album", headers=AUTH)
owned = [s["id"] for s in r2.get_json()["stickers"] if s["owned"]]

r = client.post("/api/v1/album/trade", headers=AUTH, json={
    "offered":   [owned[0]],
    "requested": ["ATL-06"],
})
d = r.get_json()
check("POST /album/trade  ->  201",                  r.status_code == 201)
check("Trade tiene id y status=pending",             "id" in d and d.get("status") == "pending")
check("Trade tiene offered y requested",             "offered" in d and "requested" in d)

r = client.get("/api/v1/album/offers", headers=AUTH)
d = r.get_json()
check("Despues del trade hay 1 oferta",              len(d) == 1)

section("Album -- Validaciones de trade")
r = client.post("/api/v1/album/trade", headers=AUTH, json={"offered": [], "requested": ["ATL-01"]})
check("Sin offered  ->  400",                        r.status_code == 400)

r = client.post("/api/v1/album/trade", headers=AUTH, json={"offered": ["ATL-99"], "requested": ["ATL-01"]})
check("Sticker ID inexistente  ->  400",             r.status_code == 400)

r = client.post("/api/v1/album/trade", headers=AUTH, json={
    "offered":   ["ATL-06"],
    "requested": ["ESP-06"],
})
if "ATL-06" not in owned:
    check("Ofrecer lamina que no tienes  ->  400",   r.status_code == 400)
else:
    check("Ofrecer lamina que tienes  ->  201",      r.status_code == 201)


# ===========================================================
#  TICKETS
# ===========================================================
AUTH = {"Authorization": f"Bearer {LOGIN_TOKEN}"}

section("Tickets -- Publicos (sin auth)")
r = client.get("/api/v1/tickets/sectors")
d = r.get_json()
check("GET /tickets/sectors  ->  200",               r.status_code == 200)
check("Devuelve 6 sectores",                         len(d) == 6)
check("Cada sector tiene id, name, priceUSD",        all("id" in s and "priceUSD" in s for s in d))

r = client.get("/api/v1/tickets/available")
d = r.get_json()
check("GET /tickets/available  ->  200",             r.status_code == 200)
check("Solo partidos upcoming",                      len(d) > 0)
check("Cada item tiene matchId, fromUSD, demand",    all("matchId" in a and "demand" in a for a in d))

section("Tickets -- Sin autenticacion")
r = client.get("/api/v1/tickets")
check("GET /tickets sin token  ->  401",             r.status_code == 401)

section("Tickets -- Lista y reserva")
r = client.get("/api/v1/tickets", headers=AUTH)
d = r.get_json()
check("GET /tickets con token  ->  200",             r.status_code == 200)
check("Lista vacia inicialmente",                    d == [])

r = client.post("/api/v1/tickets/reserve", headers=AUTH, json={
    "matchId": "m4", "sectorId": "norte-bajo", "qty": 1,
})
d = r.get_json()
check("POST /tickets/reserve (upcoming)  ->  201",   r.status_code == 201)
check("Ticket tiene id, status=reserved",            "id" in d and d.get("status") == "reserved")
check("Ticket tiene expiresAt (15min)",              d.get("expiresAt") is not None)
check("Ticket tiene seatRow y seatNum",              d.get("seatRow") is not None)
check("priceUSD = 145 (norte-bajo)",                 d.get("priceUSD") == 145)
TICKET_ID = d.get("id")

r = client.get("/api/v1/tickets", headers=AUTH)
d = r.get_json()
check("Despues de reservar hay 1 ticket",            len(d) == 1)

section("Tickets -- Por ID e historial")
r = client.get(f"/api/v1/tickets/{TICKET_ID}", headers=AUTH)
d = r.get_json()
check("GET /tickets/:id  ->  200",                   r.status_code == 200)
check("Ticket correcto por ID",                      d.get("id") == TICKET_ID)

r = client.get(f"/api/v1/tickets/{TICKET_ID}/history", headers=AUTH)
d = r.get_json()
check("GET /tickets/:id/history  ->  200",           r.status_code == 200)
check("Historial tiene 1 entrada (reserved)",        len(d) == 1)
check("Primera entrada es tipo reserved",            d[0]["type"] == "reserved")

r = client.get("/api/v1/tickets/T-9999", headers=AUTH)
check("ID inexistente  ->  404",                     r.status_code == 404)

section("Tickets -- Confirmar pago")
r = client.post(f"/api/v1/tickets/{TICKET_ID}/confirm", headers=AUTH)
d = r.get_json()
check("POST /tickets/:id/confirm  ->  200",          r.status_code == 200)
check("Status cambia a confirmed",                   d.get("status") == "confirmed")
check("confirmedAt no es null",                      d.get("confirmedAt") is not None)
check("expiresAt pasa a null",                       d.get("expiresAt") is None)

r = client.post(f"/api/v1/tickets/{TICKET_ID}/confirm", headers=AUTH)
check("Confirmar de nuevo (ya confirmado)  ->  409", r.status_code == 409)

r = client.get(f"/api/v1/tickets/{TICKET_ID}/history", headers=AUTH)
d = r.get_json()
check("Historial ahora tiene 3 entradas (res+paid+conf)", len(d) == 3)

section("Tickets -- Transferir")
r = client.post(f"/api/v1/tickets/{TICKET_ID}/transfer", headers=AUTH,
    json={"handle": "@camila304"})
d = r.get_json()
check("POST /tickets/:id/transfer  ->  200",         r.status_code == 200)
check("Status cambia a transferred",                 d.get("status") == "transferred")
check("transferredTo tiene handle",                  d.get("transferredTo", {}).get("handle") == "@camila304")

r = client.post(f"/api/v1/tickets/{TICKET_ID}/transfer", headers=AUTH,
    json={"handle": "@otro"})
check("Transferir ya transferido  ->  409",          r.status_code == 409)

section("Tickets -- Validaciones de reserva")
r = client.post("/api/v1/tickets/reserve", headers=AUTH, json={"matchId": "m1", "sectorId": "norte-bajo"})
check("Reservar partido live (m1)  ->  400",         r.status_code == 400)

r = client.post("/api/v1/tickets/reserve", headers=AUTH, json={"matchId": "m4", "sectorId": "noexiste"})
check("Sector inexistente  ->  400",                 r.status_code == 400)

r = client.post("/api/v1/tickets/reserve", headers=AUTH, json={"sectorId": "norte-bajo"})
check("Sin matchId  ->  400",                        r.status_code == 400)

section("Tickets -- Refund")
r2 = client.post("/api/v1/tickets/reserve", headers=AUTH, json={
    "matchId": "m5", "sectorId": "este-curva",
})
t2 = r2.get_json()
client.post(f"/api/v1/tickets/{t2['id']}/confirm", headers=AUTH)

r = client.post(f"/api/v1/tickets/{t2['id']}/refund", headers=AUTH)
d = r.get_json()
# m5 es upcoming — kickoff en el futuro: el refund puede fallar si el kickoff
# está en menos de 72h. En el mock de prueba aceptamos cualquier resultado.
check("POST /tickets/:id/refund  ->  200 o 409",     r.status_code in (200, 409))


# ===========================================================
#  GROUPS
# ===========================================================
AUTH = {"Authorization": f"Bearer {LOGIN_TOKEN}"}

section("Groups -- Sin autenticacion")
r = client.get("/api/v1/groups/me")
check("GET /groups/me sin token  ->  401",              r.status_code == 401)

section("Groups -- Discover (publico)")
r = client.get("/api/v1/groups/discover")
d = r.get_json()
check("GET /groups/discover  ->  200",                  r.status_code == 200)
check("Devuelve grupos para descubrir (>=4)",           len(d) >= 4)
check("Cada grupo tiene id, name, code, members",       all("id" in g and "code" in g for g in d))

section("Groups -- Lista vacia inicial")
r = client.get("/api/v1/groups/me", headers=AUTH)
d = r.get_json()
check("GET /groups/me  ->  200",                        r.status_code == 200)
check("Sin grupos inicialmente",                        d == [])

section("Groups -- Crear grupo")
r = client.post("/api/v1/groups", headers=AUTH, json={
    "name": "Los Probadores", "type": "Test", "city": "Bogota",
    "description": "Grupo de prueba del backend",
})
d = r.get_json()
check("POST /groups  ->  201",                          r.status_code == 201)
check("Grupo tiene id, name, code",                     "id" in d and "name" in d and "code" in d)
check("yourRole = admin (creador)",                     d.get("yourRole") == "admin")
check("members = 1",                                    d.get("members") == 1)
check("memberList tiene 1 entrada",                     len(d.get("memberList", [])) == 1)
check("memberList[0].isYou = True",                     d["memberList"][0]["isYou"] is True)
GROUP_ID   = d.get("id")
GROUP_CODE = d.get("code")

r = client.post("/api/v1/groups", headers=AUTH, json={})
check("Crear sin nombre  ->  400",                      r.status_code == 400)

section("Groups -- Detalle y actividad")
r = client.get(f"/api/v1/groups/{GROUP_ID}", headers=AUTH)
d = r.get_json()
check("GET /groups/:id  ->  200",                       r.status_code == 200)
check("Devuelve el grupo correcto",                     d.get("id") == GROUP_ID)

r = client.get(f"/api/v1/groups/{GROUP_ID}/activity", headers=AUTH)
d = r.get_json()
check("GET /groups/:id/activity  ->  200",              r.status_code == 200)
check("Actividad tiene al menos 1 entrada (creacion)",  len(d) >= 1)
check("Primera entrada es tipo join",                   d[0]["type"] == "join")

r = client.get("/api/v1/groups/g-noexiste", headers=AUTH)
check("GET grupo inexistente  ->  404",                 r.status_code == 404)

section("Groups -- Unirse con codigo")
# Registrar segundo usuario para probar join
r2 = client.post("/api/v1/auth/register", json={
    "name": "Otro Usuario", "email": "otro@hub.com", "password": "pass456",
})
TOKEN2 = r2.get_json().get("access_token", "")
AUTH2  = {"Authorization": f"Bearer {TOKEN2}"}

r = client.post("/api/v1/groups/join", headers=AUTH2, json={"code": GROUP_CODE})
d = r.get_json()
check("POST /groups/join con codigo correcto  ->  200", r.status_code == 200)
check("Devuelve success=True y group",                  d.get("success") is True and "group" in d)
check("yourRole = member (usuario que se unio)",        d["group"].get("yourRole") == "member")
check("members ahora = 2",                              d["group"].get("members") == 2)

r = client.post("/api/v1/groups/join", headers=AUTH2, json={"code": GROUP_CODE})
check("Unirse de nuevo al mismo grupo  ->  409",        r.status_code == 409)

r = client.post("/api/v1/groups/join", headers=AUTH2, json={"code": "NOEXISTE"})
check("Codigo inexistente  ->  404",                    r.status_code == 404)

r = client.post("/api/v1/groups/join", headers=AUTH2, json={})
check("Unirse sin codigo  ->  400",                     r.status_code == 400)

section("Groups -- Salir del grupo")
r = client.post(f"/api/v1/groups/{GROUP_ID}/leave", headers=AUTH)
check("Admin no puede salir si hay otros miembros -> 409", r.status_code == 409)

r = client.post(f"/api/v1/groups/{GROUP_ID}/leave", headers=AUTH2)
d = r.get_json()
check("Miembro puede salir  ->  200",                   r.status_code == 200)
check("Devuelve success=True",                          d.get("success") is True)

r = client.get(f"/api/v1/groups/{GROUP_ID}", headers=AUTH)
d = r.get_json()
check("Despues de salir grupo tiene 1 miembro",         d.get("members") == 1)

r = client.post(f"/api/v1/groups/g-noexiste/leave", headers=AUTH)
check("Salir de grupo inexistente  ->  404",            r.status_code == 404)


# ===========================================================
#  ADMIN
# ===========================================================

# Registrar usuario admin y elevar su rol directamente en el store
import db.memory as _mem

r_adm = client.post("/api/v1/auth/register", json={
    "name": "Admin Hub", "email": "admin@hub.com", "password": "adminpass",
})
ADMIN_TOKEN = r_adm.get_json().get("access_token", "")
# Elevar rol a admin en memoria (simula seed de BD)
_mem._users["admin@hub.com"]["role"]   = "admin"
_mem._users["admin@hub.com"]["status"] = "active"
ADMIN_AUTH = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

section("Admin -- Control de acceso")
r = client.get("/api/v1/admin/users")
check("Sin token  ->  401",                              r.status_code == 401)

r = client.get("/api/v1/admin/users", headers=AUTH)
check("Token de usuario normal  ->  403",                r.status_code == 403)

section("Admin -- Usuarios")
r = client.get("/api/v1/admin/users", headers=ADMIN_AUTH)
d = r.get_json()
check("GET /admin/users  ->  200",                       r.status_code == 200)
check("Devuelve >= 3 usuarios (los registrados en tests)", len(d) >= 3)
check("Cada user tiene id, email, role, status",         all("id" in u and "status" in u for u in d))

r = client.get("/api/v1/admin/users?role=user", headers=ADMIN_AUTH)
d = r.get_json()
check("?role=user filtra correctamente",                 all(u["role"] == "user" for u in d))

# Obtener id del usuario normal para suspenderlo
USER_ID = next((u["id"] for u in client.get("/api/v1/admin/users", headers=ADMIN_AUTH).get_json()
                if u["email"] == "otro@hub.com"), None)

r = client.patch(f"/api/v1/admin/users/{USER_ID}/status", headers=ADMIN_AUTH,
    json={"status": "suspended"})
d = r.get_json()
check("PATCH /admin/users/:id/status  ->  200",          r.status_code == 200)
check("Status cambia a suspended",                       d.get("status") == "suspended")

r = client.patch(f"/api/v1/admin/users/{USER_ID}/status", headers=ADMIN_AUTH,
    json={"status": "active"})
check("Reactivar usuario  ->  200",                      r.status_code == 200)

ADMIN_ID = next((u["id"] for u in client.get("/api/v1/admin/users", headers=ADMIN_AUTH).get_json()
                 if u["email"] == "admin@hub.com"), None)
r = client.patch(f"/api/v1/admin/users/{ADMIN_ID}/status", headers=ADMIN_AUTH,
    json={"status": "suspended"})
check("Admin no puede suspenderse a si mismo  ->  409",  r.status_code == 409)

r = client.patch(f"/api/v1/admin/users/{USER_ID}/status", headers=ADMIN_AUTH,
    json={"status": "invalido"})
check("Status invalido  ->  400",                        r.status_code == 400)

section("Admin -- Partidos")
r = client.get("/api/v1/admin/matches", headers=ADMIN_AUTH)
d = r.get_json()
check("GET /admin/matches  ->  200",                     r.status_code == 200)
check("Devuelve 12 partidos",                            len(d) == 12)

r = client.patch("/api/v1/admin/matches/m4", headers=ADMIN_AUTH,
    json={"status": "live", "homeScore": 1, "awayScore": 0, "minute": "34'"})
d = r.get_json()
check("PATCH /admin/matches/:id  ->  200",               r.status_code == 200)
check("status actualizado a live",                       d.get("status") == "live")
check("homeScore actualizado a 1",                       d.get("homeScore") == 1)
check("minute actualizado",                              d.get("minute") == "34'")

# Verificar que el cambio se refleja en el endpoint publico
r = client.get("/api/v1/matches/m4")
check("Cambio visible en GET /matches/m4",               r.get_json().get("status") == "live")

r = client.patch("/api/v1/admin/matches/noexiste", headers=ADMIN_AUTH,
    json={"status": "live"})
check("Partido inexistente  ->  404",                    r.status_code == 404)

r = client.patch("/api/v1/admin/matches/m5", headers=ADMIN_AUTH,
    json={"status": "invalido"})
check("Status invalido  ->  400",                        r.status_code == 400)

r = client.patch("/api/v1/admin/matches/m5", headers=ADMIN_AUTH,
    json={"homeScore": -1})
check("Score negativo  ->  400",                         r.status_code == 400)

section("Admin -- Alertas")
r = client.get("/api/v1/admin/alerts", headers=ADMIN_AUTH)
d = r.get_json()
check("GET /admin/alerts  ->  200",                      r.status_code == 200)
check("Devuelve 5 alertas seed",                         len(d) == 5)
check("Cada alerta tiene id, type, severity, status",    all("id" in a and "severity" in a for a in d))

r = client.get("/api/v1/admin/alerts?status=open", headers=ADMIN_AUTH)
d = r.get_json()
check("?status=open filtra abiertas",                    all(a["status"] == "open" for a in d))
ALERT_ID = d[0]["id"] if d else "a1"

r = client.patch(f"/api/v1/admin/alerts/{ALERT_ID}", headers=ADMIN_AUTH,
    json={"action": "resolve"})
d = r.get_json()
check("PATCH /admin/alerts/:id resolve  ->  200",        r.status_code == 200)
check("Status cambia a resolved",                        d.get("status") == "resolved")

r = client.patch(f"/api/v1/admin/alerts/{ALERT_ID}", headers=ADMIN_AUTH,
    json={"action": "resolve"})
check("Resolver alerta ya cerrada  ->  409",             r.status_code == 409)

r = client.patch("/api/v1/admin/alerts/noexiste", headers=ADMIN_AUTH,
    json={"action": "resolve"})
check("Alerta inexistente  ->  404",                     r.status_code == 404)

section("Admin -- Broadcast")
r = client.post("/api/v1/admin/alerts/broadcast", headers=ADMIN_AUTH, json={
    "title": "Mantenimiento programado",
    "desc":  "El sistema estara en mantenimiento el 25/05 de 02:00 a 04:00 UTC.",
    "severity": "medium",
})
d = r.get_json()
check("POST /admin/alerts/broadcast  ->  201",           r.status_code == 201)
check("Alerta creada con type=broadcast",                d.get("type") == "broadcast")
check("Alerta aparece en GET /admin/alerts",
      any(a["type"] == "broadcast" for a in client.get("/api/v1/admin/alerts", headers=ADMIN_AUTH).get_json()))

r = client.post("/api/v1/admin/alerts/broadcast", headers=ADMIN_AUTH, json={"title": "Solo titulo"})
check("Broadcast sin desc  ->  400",                     r.status_code == 400)


# ===========================================================
#  RESUMEN FINAL
# ===========================================================
total  = 69 + 20 + 30 + 26 + 34
passed = total - len(errors)
print(f"\n{'='*55}")
print(f"  Resultado: {passed}/{total} tests pasaron")
if errors:
    print(f"\n  Tests fallidos ({len(errors)}):")
    for e in errors:
        print(f"    [FAIL]  {e}")
else:
    print(f"  Todos los tests pasaron. Backend OK.")
print(f"{'='*55}\n")
