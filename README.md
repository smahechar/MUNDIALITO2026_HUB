# Global Cup 2026 · Hub — Frontend

> React 18 · Vite 5 · React Router 6

## Setup

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Para el equipo de backend

1. Copia `.env.example` a `.env.local`
2. Cambia `VITE_USE_MOCKS=false` cuando el API esté lista
3. Actualiza `VITE_API_BASE_URL` con la URL real
4. Los contratos de API están en `src/services/*.service.js`

## Estructura

```
src/
├── pages/          # Páginas (una carpeta por módulo)
├── components/     # Componentes reutilizables por dominio
├── hooks/          # Hooks de datos (usan services)
├── services/       # Llamadas al API (swap mock↔real aquí)
├── mocks/data/     # Datos ficticios mientras no hay backend
├── config/         # env.js + routes.js
└── styles/         # globals.css (sistema de diseño completo)
```

## Páginas implementadas
- `/`         → Home (Landing)
- `/fixture`  → Partidos con filtros
- `/pools`    → Pollas futboleras

## Páginas pendientes (placeholder listo)
- `/match/:id`   → Detalle de partido
- `/pools/:id`   → Detalle de polla + leaderboard
- `/predict/:id` → Formulario de predicción
- `/album`       → Álbum digital
- `/tickets`     → Entradas
- `/groups`      → Grupos y tabla
- `/nations`     → 32 naciones
