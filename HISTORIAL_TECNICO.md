# Historial Técnico — Mundialito 2026 Hub

Registro diario de decisiones, configuraciones, acciones y cambios del proyecto.
Claude Code lee este archivo para entender el contexto sin necesidad de revisar todos los archivos del repo.

---

## Convenciones de este archivo

- Las entradas van en orden **descendente** (lo más nuevo arriba).
- Cada entrada tiene: fecha, descripción corta, archivos tocados, decisiones tomadas y razón.
- Usar `[NUEVO]`, `[MOD]`, `[CONFIG]`, `[FIX]`, `[DECISIÓN]` como etiquetas rápidas.

---

## 2026-05-24 — Sesión 9

### Paso 1 Backend: estructura Flask + autenticación

#### [NUEVO] `backend/` — carpeta raíz del backend
- Stack: Flask 3.0, PyJWT, Werkzeug (hashing), python-dotenv.
- Corre en `http://localhost:8000` con `python app.py` desde `backend/`.

#### [NUEVO] `backend/app.py`
- Entry point Flask. CORS habilitado para `localhost:5173` y `localhost:3000`.
- Registra blueprints con prefix `/api/v1/*`.

#### [NUEVO] `backend/core/config.py`
- Lee `SECRET_KEY` y `ACCESS_TOKEN_EXPIRE_MINUTES` desde `.env`.

#### [NUEVO] `backend/core/security.py`
- `hash_password` / `verify_password` con Werkzeug bcrypt.
- `create_access_token` / `decode_token` con PyJWT (HS256, exp 24h).

#### [NUEVO] `backend/core/middleware.py`
- Decorador `@require_auth`: extrae Bearer token, valida JWT, pone usuario en `flask.g`.

#### [NUEVO] `backend/db/memory.py`
- Store en memoria (dict) con funciones `get_user_by_email`, `create_user`, `update_user`.
- Cada función tiene `# TODO (DB):` con la query PostgreSQL equivalente.
- El amigo de BD reemplaza este archivo con SQLAlchemy cuando tenga la BD lista.

#### [NUEVO] `backend/routers/auth.py`
- Blueprint `/api/v1/auth` con 4 endpoints:
  - `POST /login` → `{ access_token, user }`
  - `POST /register` → `{ access_token, user }` (201)
  - `POST /forgot-password` → `{ sent: true }` (stub)
  - `PATCH /me` (protegido) → user actualizado

#### [NUEVO] `backend/HANDOFF_BACKEND.md`
- Documento completo para el compañero de BD: estructura, pasos SQLAlchemy, modelos, queries.

#### [FIX] `src/services/api.js`
- Bug: `apiFetch` buscaba el token como `'access_token'` pero `auth.service.js` lo guarda
  como `'mundialito_token'`. Corregido a `'mundialito_token'`.
- Sin este fix ningún endpoint autenticado funcionaría en modo real.

#### [NUEVO] `backend/db/matches_data.py`
- Datos de 12 partidos, momentos, goleadores y detalles (eventos, stats, alineaciones, H2H).
- Funciones: `get_all_matches(status)`, `get_match_by_id`, `get_live_matches`, `get_match_detail`, `get_moments`, `get_scorers`.
- Cada función tiene `# TODO (DB):` con la query SQL equivalente.

#### [NUEVO] `backend/routers/matches.py`
- Blueprint `/api/v1/matches` con 6 endpoints:
  - `GET /` (con `?status=` opcional) → lista de partidos
  - `GET /live` → live + halftime
  - `GET /moments` → highlights textuales
  - `GET /scorers` → tabla de goleadores
  - `GET /:id` → partido por ID (404 si no existe)
  - `GET /:id/detail` → eventos, stats, alineaciones, H2H, clima
- Nota técnica: `strict_slashes=False` en la ruta raíz y el blueprint gestiona su propio `url_prefix` para evitar el redirect 308 de Flask.

#### [MOD] `backend/app.py`
- Registrado `matches_bp` y `nations_bp`.

#### [NUEVO] `backend/db/nations_data.py`
- 24 selecciones con code, name, group, colors (3 colores) y layout (bandera CSS).
- `get_all_nations()`, `get_nation_by_code(code)`.
- `get_group_standings()` — computa W/D/L/GF/GA/GD/PTS desde los partidos finalizados
  de `MATCHES` (no fórmula hardcoded). Cuando la BD esté lista, solo cambia la fuente de datos.
- Criterio de ordenamiento: pts → GD → GF (estándar FIFA).

#### [NUEVO] `backend/routers/nations.py`
- Blueprint `/api/v1/nations` con 3 endpoints:
  - `GET /` → 24 selecciones
  - `GET /groups` → standings de 6 grupos (computadas desde resultados reales)
  - `GET /:code` → selección por código (404 si no existe)

#### [NUEVO] `backend/db/pools_data.py`
- Pollas base (p1, p2, p3), miembros por polla, discover pools, reglas de puntuacion.
- Store `_user_pools` (email → [pool_ids]) — por defecto todos tienen p1/p2/p3.
- Store `_code_index` (code → pool_id) para lookup rapido en join.
- `create_pool`: genera UUID y code (prefijo nombre + 3 digitos), registra en stores.
- `join_pool`: valida codigo, evita duplicados, incrementa counter de miembros.

#### [NUEVO] `backend/routers/pools.py`
- Blueprint `/api/v1/pools` con 7 endpoints:
  - `GET /me` (auth) → pollas del usuario
  - `GET /discover` → pollas publicas
  - `GET /rules` → reglas de puntuacion
  - `POST /` (auth, 201) → crear polla con code generado
  - `POST /join` (auth) → unirse por codigo
  - `GET /:id` (auth) → detalle de polla
  - `GET /:id/members` (auth) → leaderboard

#### Decisiones sesión 9
- Flask elegido sobre FastAPI (decisión del equipo).
- Store en memoria con interfaz clara para facilitar el swap a PostgreSQL por el compañero de BD.
- Errores siempre con `{ "detail": "..." }` para ser consistente con lo que espera el frontend.
- `forgot-password` siempre retorna éxito para no revelar existencia de emails (RNF-06).

---

## 2026-05-23 — Sesión 8

### Sistema de auth + features de prioridad alta/media (todos los RF pendientes de sesión 7)

#### [NUEVO] `src/services/auth.service.js`
- Mock: `login` acepta cualquier email (user) o `admin@mundialitohub.com` (admin), genera token fake, guarda en localStorage.
- Real: llama a `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/me` (PATCH).
- Alternado por `ENV.USE_MOCKS`.

#### [NUEVO] `src/context/AuthContext.jsx`
- `AuthProvider` + `useAuth()` hook.
- State: `user`, `isAuthenticated`, `isAdmin`.
- Persiste sesión en `localStorage` (`mundialito_user`, `mundialito_token`).
- Métodos: `login`, `register`, `logout`, `updateUser`.

#### [NUEVO] `src/components/shared/PrivateRoute.jsx`
- `<PrivateRoute>` — Outlet o redirect a /login si no autenticado.
- `<AdminRoute>` — Outlet o redirect según rol.

#### [MOD] `src/config/routes.js`
- Añadida constante `FORGOT_PASSWORD: '/forgot-password'`.

#### [MOD] `src/App.jsx`
- Envuelto en `<AuthProvider>`.
- `UserLayout` routes → dentro de `<PrivateRoute>`.
- `AdminLayout` routes → dentro de `<AdminRoute>`.
- `/pools/new` → `<NewPoolPage />` (antes Placeholder).
- `/nations` → `<NationsPage />` (antes Placeholder).
- `/admin/*` → páginas reales (antes Placeholder).
- `/forgot-password` → `<ForgotPassword />` (nueva ruta en PublicLayout).

#### [MOD] `src/pages/Auth/Login.jsx`
- Usa `useAuth().login()` — navega a /fixture (user) o /admin (admin) post login.
- "¿Olvidaste?" → `<Link to={ROUTES.FORGOT_PASSWORD}>`.

#### [MOD] `src/pages/Auth/Register.jsx`
- 2 pasos: datos básicos → favoritos (RF-01).
- Paso 2: selección de hasta 3 selecciones favoritas de las 24 naciones.
- Usa `useAuth().register()` con `{ name, email, password, favoriteTeams }`.

#### [NUEVO] `src/pages/Auth/ForgotPassword.jsx`
- Formulario email → loading → estado "Correo enviado" (RF-10).
- Usa `authService.forgotPassword()` directamente (no necesita auth context).

#### [MOD] `src/pages/Profile/index.jsx`
- Reemplazado `MOCK_USER` con `useAuth().user` (authUser).
- Logout llama `auth.logout()` + navega a /login.
- Save llama `auth.updateUser()`.
- Nuevo card "Zona horaria" con selector usando `TZ_OPTIONS` de `src/utils/tz.js` (RNF-18).
- `MOCK_STATS` — stats que vendrán del backend, hardcodeadas como mock.

#### [NUEVO] `src/utils/tz.js`
- `TZ_OPTIONS` — array de 25 zonas horarias UTC-12 a UTC+12.
- `toUserTz(isoString, userTz)` — convierte ISO UTC a Date local.
- `formatInTz(isoString, userTz)` — formatea hora en TZ del usuario (RNF-18).
- `formatDateInTz(isoString, userTz)` — formatea fecha.

#### [NUEVO] `src/pages/Nations/index.jsx`
- Vista "Grupos" — 6 tablas GroupTable (PJ/G/E/P/GF/GA/PTS) con indicador de clasificación.
- Vista "Selecciones" — grid de NationCard con MiniFlag (CSS stripes h/v/cross/diag) y stats.
- Filtros: búsqueda por nombre/código, filtro por grupo.

#### [NUEVO] `src/pages/Admin/Dashboard.jsx`
- StatCards (partidos live/próximos/finalizados, usuarios estimados, pollas activas).
- RecentRow — últimos partidos con estado y marcador.
- Quick actions — accesos directos a Users, Matches, Alerts.
- Usa `useAuth().user` para saludo personalizado.

#### [NUEVO] `src/pages/Admin/Users.jsx`
- Tabla de 8 usuarios mock con nombre/email/rol/estado/pts/entradas.
- Filtros: búsqueda texto + selector rol + selector estado.
- Acción "Suspender/Reactivar" por fila (toggle local).

#### [NUEVO] `src/pages/Admin/Matches.jsx`
- Lista de partidos con MatchRow editable.
- Edición inline: score home/away + selector de estado (upcoming/live/final).
- Guardar actualiza el estado local — listo para wiring a backend.
- Fix: `match.home` y `match.away` son strings (codes), no objetos; `homeScore`/`awayScore` separados.

#### [NUEVO] `src/pages/Admin/Alerts.jsx`
- Alertas de seguridad/fraude/sistema (RF-07) con severity/type/correlationId.
- 3 alertas mock abiertas + 2 resueltas.
- Acciones: Resolver (cambia status) / Descartar (elimina).
- Filtros: Abiertas / Resueltas / Todas.

#### [MOD] `src/layouts/AdminLayout.jsx`
- Logout llama `auth.logout()` + navega a /login.
- `AdminUserChip` — muestra inicial y nombre del usuario admin actual.

#### [MOD] `src/pages/Pools/PoolDetail.jsx`
- Añadido `<InviteModal>` — muestra el código de la polla con botón "Copiar" (RF-24).
- Botón "Compartir" renombrado a "Invitar →" y abre el modal.
- Usa `<ModalOverlay>` del componente compartido (Portal, z-9999).

#### [NUEVO] `src/pages/Pools/NewPoolPage.jsx`
- Wizard 3 pasos: (1) nombre + premio + tipo, (2) visibilidad + max miembros, (3) éxito + código generado (RF-23).
- Código generado con `generateCode(name)` — prefijo del nombre + 3 dígitos aleatorios.
- Botón "Copiar código" usa `navigator.clipboard`.

#### [MOD] `src/pages/Matches/index.jsx`
- Nuevos filtros: selector "Selección" (todas las teams del fixture) + selector "Estadio" (RF-15).
- Lógica: `m.home !== team && m.away !== team` para el filtro de equipo.
- Botón "Limpiar filtros" aparece cuando algún filtro está activo.
- Contador "X de Y partidos" en tiempo real.

#### Decisiones técnicas sesión 8
- Auth mock: cualquier email/password funciona (rol user). Admin email: `admin@mundialitohub.com`.
- `MiniFlag` en Nations: renderiza con CSS puro (sin imágenes) — stripes horizontales/verticales/diagonales/cruz.
- `AdminMatches` y `AdminDashboard` usan directamente el mock de matches (sin service) — correcto para admin que no pasa por `useMatches`.
- Register paso 2 (favoritos) es opcional — se puede omitir con "Omitir y crear cuenta".
- TZ selector en Profile guarda inmediatamente al cambiar (sin botón "Guardar" separado) — UX más ágil.

---

## 2026-05-23 — Sesión 7

### Fix modal de reserva + Análisis de requerimientos

#### [FIX] `src/components/shared/Modal.jsx`
- **Problema:** El modal de reserva (`ReserveModal`) no aparecía al hacer clic en "Reservar →".
- **Causa raíz:** `ModalOverlay` usaba `position: fixed, z-index: 100` pero estaba dentro de elementos con `isolation: isolate` (clase `.gc-grain`) que crean nuevos stacking contexts anidados. El z-index del modal quedaba confinado dentro del stacking context de `PageShell`, que pintaba DESPUÉS del `TopNav` (z-index: 10 flex child), haciendo el modal invisible.
- **Solución:** Convertido a React Portal (`createPortal(..., document.body)`) — el modal ahora se renderiza directamente en `document.body`, escapando cualquier stacking context de ancestro. z-index subido a 9999.
- **Afecta a:** `ReserveModal`, `TransferModal`, `RefundModal` (todos usan `ModalOverlay`).

#### [DECISIÓN] No se quitó `PageShell` de `TicketsPage`
- `TicketsPage` usa `<PageShell>` (que incluye NavBar + LiveTicker) dentro de `UserLayout` — doble navegación visual.
- La corrección es separada del fix del modal. Pendiente refactor si el equipo lo decide.

#### Análisis de requerimientos (ver reporte en esta sesión)
- RF-07, RF-08, RF-30 → Panel Admin sin implementar (placeholders)
- RF-10 → Recuperación de contraseña: solo link, sin flujo
- RF-23 → Crear nueva polla (/pools/new): placeholder
- RF-15 → Filtro fixture por selección/estadio: no implementado
- RNF-18 → Ajuste de zona horaria: no implementado
- /nations → Placeholder
- Auth guards → UserLayout/AdminLayout sin PrivateRoute

---

## 2026-05-23 — Sesión 6

### Módulo Entradas (Tickets) completo

#### Nuevos archivos

**[NUEVO] `src/mocks/data/tickets.js`**
- 7 tickets con todos los estados posibles: confirmed, reserved (×2 con expiresAt dinámica), transferred, expired, refunded
- `stadiumSectors` — 6 sectores por estadio con precio USD y color
- `availableForReservation` — computed a partir de `matches` upstream, filtrando `status === 'upcoming'`
- `ticketHistory` — audit log completo de transiciones estado por ticket
- Helpers exportados: `getTicket(id)`, `getSector(id)`, `getTicketHistory(id)`
- Comentario RF-03 con diagrama de transiciones de estado para el backend

**[NUEVO] `src/services/tickets.service.js`**
- Métodos: `getAll`, `getById`, `getAvailable`, `getSectors`, `getHistory`, `reserve`, `confirmPayment`, `transfer`, `refund`
- Todos con `ENV.USE_MOCKS` → mock | `apiFetch(...)` para backend
- Comentarios inline marcando los endpoints HTTP esperados y contratos de respuesta

**[NUEVO] `src/hooks/useTickets.js`**
- `useTickets()` — lista completa del usuario
- `useTicket(id)` — detalle + historial en paralelo
- `useAvailableTickets()` — partidos disponibles + sectores en paralelo

**[NUEVO] `src/components/tickets/index.jsx`**
- `TicketStatusBadge` — badge color por estado (confirmed/reserved/expired/transferred/refunded)
- `ReserveCountdown` — timer live, modo big (para detail) y modo small (para lista); rojo en <1min
- `QRPlaceholder` — SVG 14×14 determinístico por seed (ticket id), con 3 corner marks
- `BoardingPassRow` — tarjeta horizontal con stripe de color + info compacta + stub "Detalle →"
- `BoardingPassHero` — boarding pass completo: left (flags, título, grid venue), dashed divider, right stub (QR, asiento, puerta, correlationId)
- `TicketTimeline` — audit log con iconos por tipo de evento y connector lines
- `AvailableMatchCard` — card de partido con bandera, demanda, precio desde, botón Reservar
- `ReserveModal` — 3 pasos: sector + qty → payment review (sandbox Visa) → processing → confirmado
- `TransferModal` — 3 pasos: handle input → procesando → éxito
- `RefundModal` — 3 pasos: términos + checkbox → procesando → reembolso confirmado

**[NUEVO] `src/pages/Tickets/index.jsx`**
- `TicketsPage`: hero con PageHeader, 4 stat tiles animados (confirmed/pending/transferred/refunded), tabla filtrable por estado con `StatusChips` local, grilla de partidos disponibles, CTA band verde

**[NUEVO] `src/pages/Tickets/TicketDetail.jsx`**
- `TicketDetailPage`: breadcrumb + link al match centre, `BoardingPassHero`, sección acciones (varía por estado), `TicketTimeline`, card contexto del partido

#### Rutas actualizadas

**[MOD] `src/App.jsx`**
- `/tickets` → `<TicketsPage />` (era `<PlaceholderPage>`)
- `/tickets/:id` → `<TicketDetailPage />` (nueva ruta)

#### Decisiones de diseño

- `[DECISIÓN]` `availableForReservation` se computa a partir de los `matches` importados, no es data estática — así queda reactivo a los datos de fixture
- `[DECISIÓN]` `var(--paper-edge)` del diseño original → `var(--rule)` (compatible con el design system Vite)
- `[DECISIÓN]` `Pill` con demand "high" usa `style=` inline (rojo) en vez de modificar atoms.jsx
- `[DECISIÓN]` Modales de pago/transfer/refund tienen comentarios para el backend team sobre qué endpoint reemplaza cada `setTimeout`
- `[DECISIÓN]` `gc-spin` animation ya existía en `globals.css` — Spinner la usa directamente

---

## 2026-05-23 — Sesión 5

### Módulo Pollas completo + Login como primera pantalla

#### Cambios de routing

**[MOD] `src/App.jsx`**
- `/` ahora redirige a `/login` con `<Navigate to="/login" replace />` — el login es la primera pantalla al abrir la app
- `HomePage` movida a `/home`
- `/pools/:id` conectado a `<PoolDetailPage />` (antes era un Placeholder)
- `/predict/:id` conectado a `<PredictPage />` (antes era un Placeholder)
- Ruta `/pools/new` colocada antes de `/pools/:id` para evitar que "new" sea tratado como un ID de pool

#### Auth pages rediseñadas

**[MOD] `src/pages/Auth/Login.jsx`** — Reescritura completa
- Titular Anton con línea de color rojo: "Ingresar / al Hub." (estilo editorial)
- Formulario: email, contraseña, botón submit con estado loading (900 ms simulado)
- Manejo de errores con mensaje visible bajo el form
- Floodlight dorado decorativo en la esquina del card
- Botón ghost para ir a `/register`; link "¿Olvidaste?" para recuperar contraseña
- Tras submit exitoso: navega a `/fixture`

**[MOD] `src/pages/Auth/Register.jsx`** — Reescritura completa
- Titular con acento verde: "Únete / al Hub."
- Campos: username, email, password, confirmar contraseña (side by side), checkbox de términos
- Validación completa: todos los campos requeridos, contraseñas que coincidan, mínimo 8 chars, términos aceptados
- LIVE pill + eyebrow branding; floodlight verde
- Tras submit exitoso: navega a `/fixture`

#### Datos mock ampliados

**[MOD] `src/mocks/data/pools.js`**
- Añadida exportación `poolMembers` — leaderboards completos para p1 (21 miembros, Aula 304), p2 (9 miembros, Familia Buitrago), p3 (12 filas entorno al jugador en rank 612, pool Global)
- Cada entrada tiene: id, name, pts, exact, winner, lastChange, hot, isYou (solo el usuario), rank (solo p3)

**[MOD] `src/services/pools.service.js`**
- Añadido `poolMembers` a los imports del mock
- Añadido método `getMembers(id)` → mock devuelve `poolMembers[id] ?? []`; real llama `apiFetch('/pools/${id}/members')`

**[MOD] `src/hooks/usePools.js`**
- Añadido hook `usePoolDetail(poolId)` — carga en paralelo `getById(poolId)` y `getMembers(poolId)`, devuelve `{ pool, members, isLoading }`

#### Nuevas páginas

**[NUEVO] `src/pages/Pools/PoolDetail.jsx`**
- Componentes internos: `RankBadge` (color por posición), `MovementIndicator` (▲▼ con verde/rojo), `PoolStandings` (tabla completa), `PodiumStep`, `PoolTabs`, `PoolHeaderBlock` (hero con 4 stat tiles)
- Tabs: Tabla (podium + hot streak strip + standings completo), Tus picks (live/open/recent), Historial (stats + lista), Reglas (scoring rules + premio)
- Usa `usePoolDetail(poolId)` de `usePools.js`; breadcrumb con navegación; CTA band para ir a predecir

**[NUEVO] `src/pages/Pools/PredictPage.jsx`**
- Flujo de 3 pasos: Marcador → Confianza → Confirmación
- Step 1: `ScoreStepper` (±1 con min 0 / max 15) + 5 quick-picks de sugerencia
- Step 2: recap del pick + toggle double-down (×2, gold) + grid de primer goleador por partido
- Step 3: confirmación con pick grande + 3 action tiles (match centre / editar / pools)
- Hero: flags + h1 `HOME × AWAY` + step indicator
- Detecta partido bloqueado (`match.status !== 'upcoming'`) y muestra estado cerrado

**[FIX] `src/pages/Pools/PredictPage.jsx`**
- Removidos imports sin usar: `Band` (de Layout) y `poolsService`
- Simplificado h1 del hero: de spans con `display:flex` dentro de un h1 (HTML inválido) a `<div gc-row>` con flags + h1 lineal `HOME × AWAY`

---

## 2026-05-23 — Sesión 4

### Habilitación del app Vite (src/) para correr en el dev server

**Problema raíz:** el app en `src/` nunca había podido correr porque:
1. `vite.config.js` no tenía `@vitejs/plugin-react` — el JSX de `src/` no se compilaba
2. El middleware Babel servía también archivos de `src/` como texto plano, bloqueando la transformación
3. No había alias `@/` → `src/` (todos los imports `@/hooks/...` fallaban)
4. `index.html` apuntaba al app Babel legacy, no a `src/main.jsx`
5. `@tailwind utilities` estaba antes del `@import url()` de Google Fonts — inválido en CSS

**[MOD] `vite.config.js`**
- Añadido `@vitejs/plugin-react` (ya estaba en devDependencies, solo faltaba configurarlo)
- Middleware Babel restringido: ahora solo sirve `.jsx` que NO estén en `/src/` (`!url.startsWith('/src/')`)
- Añadido `resolve.alias: { '@': path.resolve(cwd, 'src') }` para que funcionen los imports `@/...`

**[MOD] `index.html`**
- Reemplazado el bloque de scripts Babel/CDN por `<script type="module" src="/src/main.jsx">`
- Scripts legacy preservados como comentario para referencia

**[FIX] `src/styles/globals.css`**
- `@tailwind utilities` movido a después del `@import url(...)` de Google Fonts
- CSS requiere que `@import` preceda cualquier otra regla

**Resultado:** `npm run dev` → `http://localhost:5173` — app Vite corriendo.

---

## 2026-05-23 — Sesión 3

### AdminLayout + Refactor de rutas

**[NUEVO] `src/layouts/AdminLayout.jsx`**
- Layout oscuro tipo dashboard para panel de administración
- Sidebar: `#0a0a0b`, 224px, border-right sutil `rgba(246,239,217,0.07)`
- Nav items: Dashboard, Users, Matches, Alerts — íconos SVG inline, activo con borde izquierdo dorado + fondo sutil
- Badge rojo numérico en "Alerts" (3 alertas pendientes, hardcoded por ahora)
- TopBar: `rgba(10,10,11,0.92)` con blur, breadcrumb dinámico via `useLocation`, campana con punto rojo, avatar dorado "A"
- Botón Sign out (navega a `/login` de momento — sin auth real)
- Mobile: hamburger + overlay oscuro, mismo patrón que `UserLayout`
- Routing: usa `end` prop en el NavLink del Dashboard para que `/admin` no quede activo en sub-rutas

**[MOD] `src/config/routes.js`**
- Añadidas constantes: `ADMIN`, `ADMIN_USERS`, `ADMIN_MATCHES`, `ADMIN_ALERTS`
- Rutas reorganizadas en tres secciones comentadas: Public, User, Admin

**[FIX] `src/pages/Placeholder.jsx`**
- **Problema**: usaba `<PageShell>` que renderiza su propio `NavBar` + `LiveTicker`, lo que causaría doble header dentro de cualquier layout
- **Solución**: eliminado `PageShell` completamente; ahora el componente solo renderiza contenido (kicker, título display, regla roja, descripción, botón volver)
- Botón "Volver" cambiado a `navigate(-1)` (más versátil que `navigate("/")`)

**[MOD] `src/App.jsx`** — Refactor completo de rutas
```
PublicLayout  → /login, /register
(sin layout)  → /          ← HomePage tiene PageShell propio
UserLayout    → /fixture, /pools, /match/:id, /pools/:id, /pools/new,
                /predict/:id, /album, /tickets, /groups, /nations, /profile
AdminLayout   → /admin, /admin/users, /admin/matches, /admin/alerts
(sin layout)  → * (404)
```
- `HomePage` se dejó fuera de layouts porque usa `PageShell` internamente (tiene su propio NavBar + LiveTicker)
- La ruta `*` (404) también queda sin layout para no contaminar con un shell en un estado de error

**[DECISIÓN]** Ruta `/` fuera de layouts
- La `HomePage` fue construida con `PageShell` integrado antes de existir los layouts en `src/`
- En lugar de refactorizar `HomePage` ahora, se dejó fuera de layouts hasta que se decida rediseñarla como página Vite
- Al migrar `HomePage`, deberá extraerse el `PageShell` y envolverse en un `LandingLayout` o `PublicLayout` con NavBar

**[PENDIENTE]** Guards de autenticación
- `UserLayout` y `AdminLayout` aún no verifican auth/rol — cualquiera puede acceder
- Próximo paso: crear `PrivateRoute` y `AdminRoute` wrapper components

---

## 2026-05-23 — Sesión 2

### PublicLayout para páginas de autenticación

**[MOD] `src/layouts/PublicLayout.jsx`** — Rediseño completo
- Antes: renderizaba `<LiveTicker>` + `<NavBar>` (pensado para páginas públicas generales, no para auth)
- Ahora: layout minimalista específico para auth (Login / Register)
- Estructura: top brand bar → `<main flex-1 items-center justify-center>` → footer
- Fondo: dos `gc-floodlight` (verde top-left, dorado bottom-right) + watermark "2026" decorativo + grain texture (`gc-grain`)
- Brand bar: logo pequeño "Mundial·Hub 2026" + pill "Global Cup 2026" — sin navbar completa
- Footer: línea de crédito `© 2026 · Universidad El Bosque`
- El layout provee el centrado; los auth pages solo renderizan su card

**[MOD] `src/pages/Auth/Login.jsx`**
- Eliminado el wrapper `div` con `minHeight:100vh + flex + alignItems:center` (el layout ya centra)
- Ahora retorna directamente el `gc-card` con `maxWidth:400` y `w-full`

**[MOD] `src/pages/Auth/Register.jsx`**
- Misma corrección que Login — removido el wrapper de centrado redundante

**[DECISIÓN]** Separar `PublicLayout` (auth) de un eventual `LandingLayout` (home/marketing)
- El `App.jsx` actual agrupa `/`, `/login`, `/register` en `<PublicLayout>`, lo que funciona por ahora
- A futuro, `/` debería tener su propio layout con `LiveTicker` + `NavBar` completa
- Dejar ese split para cuando se construya la Home page en `src/pages/Home`

---

## 2026-05-23 — Sesión 1

### Sesión: Setup inicial del proyecto Vite + creación de UserLayout

#### Contexto del proyecto
El proyecto tiene **dos capas paralelas**:

1. **App legacy (Babel en browser)** — archivos en la raíz (`app.jsx`, `router.jsx`, `components/`, `pages/`). Se ejecuta cargando React desde CDN y compilando JSX en el cliente con `@babel/standalone`. El `index.html` carga estos archivos con `<script type="text/babel">`. **Esta capa está funcional y es la que el usuario ve hoy.**

2. **App Vite/React (en construcción)** — archivos en `src/`. Tiene su propio sistema de rutas, hooks, servicios y mocks. El `vite.config.js` tiene un middleware que sirve archivos `.jsx` de la raíz como texto plano para Babel, lo que **actualmente bloquea** la compilación de los archivos `src/` (no tiene `@vitejs/plugin-react` configurado). **Esta capa está en desarrollo y aún no es la entry point principal.**

#### Sistema de diseño
El proyecto tiene un design system propio llamado **"Festival Editorial / Global Cup"** definido en `src/styles/globals.css` y `styles.css` (raíz). Usa:
- Variables CSS (`--green`, `--gold`, `--ink`, `--paper`, etc.)
- Clases utilitarias propias (`gc-*`, `bc-*`, `st-*`)
- Tipografía: Anton (display), Barlow Condensed (sub), DM Sans (body), JetBrains Mono (mono)
- Paleta principal: verde bosque `#0e3b2a`, dorado `#f0b400`, rojo `#d6362a`, papel `#f7f1df`

#### Acciones realizadas hoy

**[CONFIG] Instalación de Tailwind CSS v3**
- Paquetes: `tailwindcss@3`, `postcss`, `autoprefixer` (devDependencies)
- `preflight` desactivado en la config para no resetear los estilos base del design system existente
- Solo se importa `@tailwind utilities;` en `globals.css` (no base ni components)
- Archivos creados: `tailwind.config.js`, `postcss.config.js`

**[CONFIG] tailwind.config.js**
- `content`: escanea `./src/**/*.{jsx,tsx,js,ts}`
- Los colores de Tailwind apuntan a las variables CSS del proyecto (`var(--green)`, `var(--gold)`, etc.) para mantener sincronía con el tema
- `corePlugins.preflight: false`

**[NUEVO] `src/layouts/UserLayout.jsx`**
- Layout principal para usuarios autenticados
- Estructura: `Sidebar (izq, 256px) | TopNav (arriba) | <Outlet /> (contenido)`
- Sidebar: fondo `--green`, ítems de nav con estado activo en `--gold`, colapsa en mobile con animación slide
- TopNav: glassmorphism (`backdrop-filter: blur`), breadcrumb dinámico, pill LIVE, botón "Mi Cuenta"
- Nav items: Matches (`/fixture`), Pools (`/pools`), Album (`/album`), Profile (`/profile`)
- Mobile: hamburger button abre sidebar con backdrop oscuro; clic fuera cierra
- Usa `NavLink` de React Router con render prop para estado activo
- Íconos: SVG inline (no dependencia externa)

**[NUEVO] `src/layouts/PublicLayout.jsx`**
- Layout para rutas públicas (Home, Login, Register)
- Usa `LiveTicker` + `NavBar` del design system existente + `<Outlet />`

**[MOD] `src/App.jsx`**
- Rutas reorganizadas en dos grupos:
  - `<PublicLayout>`: `/`, `/login`, `/register`
  - `<UserLayout>`: `/fixture`, `/pools`, `/album`, `/profile` y todas las rutas de detalle
- Import de `UserLayout` y `PublicLayout` añadidos

**[MOD] `src/styles/globals.css`**
- Añadido `@tailwind utilities;` al inicio del archivo

#### Decisiones técnicas

| Decisión | Razón |
|---|---|
| Tailwind preflight OFF | El design system propio define resets y base; activar preflight rompería las clases `gc-*` y `bc-*` |
| Solo `@tailwind utilities` | Evitar conflictos con estilos base y de componentes ya definidos |
| Íconos SVG inline en UserLayout | No hay dependencia de librerías de íconos instaladas; mantiene el bundle limpio |
| `NavLink` con doble API (className + style) | `className` maneja las clases Tailwind; `style` maneja las CSS variables del tema |
| Sidebar como componente interno | No se necesita en ningún otro lugar; co-locación evita sobre-abstracción |

#### Pendiente / Próximos pasos

- [ ] Agregar `@vitejs/plugin-react` al `vite.config.js` para que `src/` sea funcional como app Vite
- [ ] Conectar autenticación real al `UserLayout` (actualmente cualquiera accede a rutas protegidas)
- [ ] Implementar páginas reales en `src/pages/Matches`, `src/pages/Pools`, etc.
- [ ] Conectar el ticker del `TopNav` a datos reales de partidos en vivo

---

> *Este archivo debe actualizarse al inicio o al final de cada sesión de trabajo.*
