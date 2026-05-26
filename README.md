# Mundialito2026 Hub / Global Cup 2026 Hub

Mundialito2026 Hub es una aplicación web desarrollada como MVP académico para gestionar una experiencia digital alrededor de un torneo internacional de fútbol tipo Mundial 2026.

El sistema integra módulos de partidos, fixture, selecciones, grupos, pollas, álbum digital, intercambio de láminas, entradas, notificaciones, autenticación, pruebas automatizadas, pipeline CI/CD y análisis estático de calidad con SonarCloud.

---

## Tabla de contenido

1. [Descripción general](#1-descripción-general)
2. [Tecnologías utilizadas](#2-tecnologías-utilizadas)
3. [Arquitectura general](#3-arquitectura-general)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Requisitos previos](#5-requisitos-previos)
6. [Configuración de la base de datos MySQL](#6-configuración-de-la-base-de-datos-mysql)
7. [Configuración de la máquina virtual Ubuntu](#7-configuración-de-la-máquina-virtual-ubuntu)
8. [Configuración del backend Flask](#8-configuración-del-backend-flask)
9. [Configuración del frontend React/Vite](#9-configuración-del-frontend-reactvite)
10. [Variables de entorno](#10-variables-de-entorno)
11. [Ejecución local del proyecto](#11-ejecución-local-del-proyecto)
12. [Módulos principales](#12-módulos-principales)
13. [Endpoints principales](#13-endpoints-principales)
14. [Pruebas unitarias e integración](#14-pruebas-unitarias-e-integración)
15. [Pipeline CI/CD con GitHub Actions](#15-pipeline-cicd-con-github-actions)
16. [Análisis estático con SonarCloud](#16-análisis-estático-con-sonarcloud)
17. [Comandos Git](#17-comandos-git)
18. [Problemas comunes](#18-problemas-comunes)
19. [Estado esperado del MVP](#19-estado-esperado-del-mvp)
20. [Autor](#20-autor)

---

# 1. Descripción general

El proyecto **Mundialito2026 Hub** permite a los usuarios interactuar con diferentes funcionalidades relacionadas con un torneo de fútbol:

- Consulta de partidos reales desde base de datos.
- Fixture por fechas disponibles.
- Consulta de selecciones y grupos.
- Gestión de grupos de usuarios.
- Sistema de pollas y predicciones.
- Álbum digital de láminas.
- Intercambio de láminas tipo casa de subastas.
- Reserva y confirmación de entradas.
- Simulación de pagos mediante proveedor mock.
- Notificaciones internas.
- Validaciones antifraude.
- Pruebas automatizadas.
- Pipeline CI/CD.
- Análisis de calidad con SonarCloud.

El objetivo principal es que la aplicación funcione conectada a un backend y una base de datos real, evitando depender de datos quemados o mocks en el frontend.

---

# 2. Tecnologías utilizadas

## Frontend

- React 18
- Vite
- JavaScript
- React Router DOM
- CSS personalizado
- Vitest
- Testing Library
- jsdom

## Backend

- Python
- Flask
- SQLAlchemy
- PyMySQL
- Flask-CORS
- python-dotenv
- pytest
- pytest-cov

## Base de datos

- MySQL Server
- MySQL Workbench

## DevOps y calidad

- Git
- GitHub
- GitHub Actions
- SonarCloud
- Pipeline CI/CD
- Máquina virtual Ubuntu

---

# 3. Arquitectura general

La aplicación se divide en tres capas principales:

```txt
Frontend React/Vite
        ↓
Backend Flask API REST
        ↓
Base de datos MySQL
```

## Flujo general

```txt
Usuario
  ↓
Interfaz React
  ↓
Servicios frontend
  ↓
API Flask
  ↓
SQLAlchemy / PyMySQL
  ↓
MySQL
```

---

# 4. Estructura del proyecto

```txt
mundialito2026_hub/
│
├── backend/
│   ├── app.py
│   ├── core/
│   ├── db/
│   ├── integrations/
│   ├── routers/
│   ├── tests/
│   ├── requirements.txt
│   └── .env
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── test/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── package.json
├── package-lock.json
├── vite.config.js
├── sonar-project.properties
├── README.md
└── .env.local
```

---

# 5. Requisitos previos

## En Windows / equipo local

- Node.js
- npm
- Python 3.11 o superior
- Git
- Visual Studio Code
- MySQL Workbench
- Navegador web

## En la máquina virtual Ubuntu

- Ubuntu Server o Ubuntu Desktop
- MySQL Server
- Python 3
- pip
- Git
- OpenSSH Server

---

# 6. Configuración de la base de datos MySQL

## Crear base de datos

```sql
CREATE DATABASE mundialito2026 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
```

## Crear usuario para la aplicación

No se recomienda usar `root` para la aplicación. Se recomienda crear un usuario propio:

```sql
CREATE USER 'mundialito_user'@'%' IDENTIFIED BY 'TuPasswordSeguro123';
GRANT ALL PRIVILEGES ON mundialito2026.* TO 'mundialito_user'@'%';
FLUSH PRIVILEGES;
SELECT user, host FROM mysql.user;
```

---

# 7. Configuración de la máquina virtual Ubuntu

La máquina virtual puede usarse para alojar MySQL y, opcionalmente, el backend.

## Configurar red de la VM

En VirtualBox o VMware se recomienda usar:

```txt
Adaptador puente / Bridged Adapter
```

Esto permite que la VM tenga una IP visible desde el equipo host.

Verificar IP:

```bash
hostname -I
```

Ejemplo:

```txt
192.168.1.50
```

Esa IP será usada en el archivo `.env` del backend:

```env
DB_HOST=192.168.1.50
```

## Actualizar Ubuntu

```bash
sudo apt update
sudo apt upgrade -y
```

## Instalar MySQL Server

```bash
sudo apt install mysql-server -y
sudo systemctl status mysql
```

Si no está activo:

```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

## Permitir conexiones remotas

Editar configuración de MySQL:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Buscar:

```txt
bind-address = 127.0.0.1
```

Cambiar por:

```txt
bind-address = 0.0.0.0
```

Reiniciar MySQL:

```bash
sudo systemctl restart mysql
```

## Abrir puerto 3306

```bash
sudo ufw allow 3306
sudo ufw reload
sudo ufw status
```

## Probar conexión desde Windows

Desde MySQL Workbench:

```txt
Hostname: IP_DE_LA_VM
Port: 3306
Username: mundialito_user
Password: TuPasswordSeguro123
Default Schema: mundialito2026
```

---

# 8. Configuración del backend Flask

## Entrar al backend

```powershell
cd backend
```

## Crear entorno virtual

```powershell
python -m venv venv
```

## Activar entorno virtual

```powershell
venv\Scripts\activate
```

Debe verse algo así:

```txt
(venv) PS C:\...\mundialito2026_hub\backend>
```

## Instalar dependencias

```powershell
pip install -r requirements.txt
```

Si `pip` falla:

```powershell
python -m pip install -r requirements.txt
```

---

# 9. Configuración del frontend React/Vite

Desde la raíz del proyecto:

```powershell
npm install
```

Ejecutar frontend:

```powershell
npm run dev -- --force
```

El frontend se ejecuta en:

```txt
http://localhost:5173
```

---

# 10. Variables de entorno

## Backend

Crear archivo:

```txt
backend/.env
```

Ejemplo:

```env
FLASK_ENV=development
FLASK_DEBUG=true

DB_HOST=localhost
DB_PORT=3306
DB_USER=mundialito_user
DB_PASSWORD=TuPasswordSeguro123
DB_NAME=mundialito2026

JWT_SECRET=dev_secret_change_me

CORS_ORIGINS=http://localhost:5173

PAYMENT_PROVIDER=mock
NOTIFICATIONS_ENABLED=true

PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF=30
PREDICTION_REMINDER_MINUTES_BEFORE_KICKOFF=120
AGENDA_REMINDER_MINUTES_BEFORE_KICKOFF=60

MAX_TICKET_RESERVATIONS_PER_DAY=20
MAX_TICKET_TRANSFERS_PER_DAY=3
MAX_TICKET_REFUNDS_PER_DAY=3

ANTIFRAUD_WINDOW_HOURS=24
FRAUD_AUTO_SUSPEND_THRESHOLD=10
```

Si MySQL está en la máquina virtual:

```env
DB_HOST=192.168.1.50
```

## Frontend

Crear archivo en la raíz:

```txt
.env.local
```

Ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_USE_MOCKS=false
```

La variable importante es:

```env
VITE_USE_MOCKS=false
```

Esto permite que el frontend consuma datos reales desde el backend.

---

# 11. Ejecución local del proyecto

## Terminal 1: backend

```powershell
cd backend
venv\Scripts\activate
python app.py
```

El backend debe iniciar en:

```txt
http://localhost:8000
```

API base:

```txt
http://localhost:8000/api/v1
```

## Terminal 2: frontend

Desde la raíz del proyecto:

```powershell
npm run dev -- --force
```

Frontend:

```txt
http://localhost:5173
```

---

# 12. Módulos principales

## Autenticación

Permite iniciar sesión, registrar usuarios y proteger rutas privadas.

## Partidos / Fixture

Permite consultar partidos desde la base de datos, filtrar por fecha, grupo, estado o selección.

## Naciones

Muestra las selecciones clasificadas y sus grupos.

## Grupos

Permite crear grupos, unirse con código, consultar grupos propios y descubrir grupos públicos.

## Pollas

Permite gestionar predicciones, puntajes, reglas y rankings.

## Álbum

Permite consultar el progreso del álbum, abrir sobres y ver láminas obtenidas.

## Mercado de intercambio

Permite publicar una lámina repetida, recibir ofertas, aceptar una oferta y confirmar el intercambio.

## Entradas

Permite reservar entradas, confirmar pagos simulados, transferir y reembolsar.

## Notificaciones

Permite ver notificaciones internas, conteo de no leídas y marcar notificaciones como leídas.

## Antifraude

Incluye reglas para limitar reservas, transferencias y acciones repetitivas.

---

# 13. Endpoints principales

## Autenticación

```txt
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me
```

## Partidos

```txt
GET /api/v1/matches
GET /api/v1/matches/<id>
GET /api/v1/matches/<id>/detail
```

## Naciones

```txt
GET /api/v1/nations
GET /api/v1/nations/groups
```

## Grupos

```txt
GET  /api/v1/groups/me
GET  /api/v1/groups/discover
POST /api/v1/groups
POST /api/v1/groups/join
GET  /api/v1/groups/<group_id>/activity
```

## Pollas

```txt
GET  /api/v1/pools/me
GET  /api/v1/pools/discover
GET  /api/v1/pools/rules
POST /api/v1/pools
POST /api/v1/pools/join
GET  /api/v1/pools/<pool_id>
GET  /api/v1/pools/<pool_id>/members
```

## Álbum

```txt
GET  /api/v1/album
POST /api/v1/album/open-pack
```

## Mercado de intercambio de álbum

```txt
GET  /api/v1/album/market
GET  /api/v1/album/market/me
POST /api/v1/album/market/listings
POST /api/v1/album/market/listings/<listing_id>/offers
POST /api/v1/album/market/offers/<offer_id>/accept
POST /api/v1/album/market/offers/<offer_id>/confirm
POST /api/v1/album/market/listings/<listing_id>/cancel
```

## Entradas

```txt
GET  /api/v1/tickets
GET  /api/v1/tickets/available
GET  /api/v1/tickets/sectors
POST /api/v1/tickets/reserve
POST /api/v1/tickets/<ticket_id>/confirm
POST /api/v1/tickets/<ticket_id>/transfer
POST /api/v1/tickets/<ticket_id>/refund
```

## Notificaciones

```txt
GET  /api/v1/notifications/me
GET  /api/v1/notifications/me/unread-count
POST /api/v1/notifications/<notification_id>/read
```

---

# 14. Pruebas unitarias e integración

El proyecto incluye pruebas en backend y frontend.

## Backend

Framework usado:

```txt
pytest
pytest-cov
```

Ejecutar pruebas:

```powershell
cd backend
venv\Scripts\activate
pytest
```

Ejecutar pruebas con cobertura:

```powershell
pytest --cov=. --cov-report=xml
```

Esto genera:

```txt
backend/coverage.xml
```

Estado validado durante el desarrollo:

```txt
13 passed
```

## Frontend

Framework usado:

```txt
Vitest
Testing Library
jsdom
```

Ejecutar pruebas:

```powershell
npm run test:run
```

Ejecutar pruebas con cobertura:

```powershell
npm run test:coverage
```

Estado validado durante el desarrollo:

```txt
2 test files passed
5 tests passed
```

## Build frontend

```powershell
npm run build
```

---

# 15. Pipeline CI/CD con GitHub Actions

El proyecto tiene pipeline configurado en:

```txt
.github/workflows/ci-cd.yml
```

El pipeline se ejecuta automáticamente en:

```txt
push a main
pull_request a main
workflow_dispatch manual
```

## Flujo del pipeline

```txt
Push / Pull Request
        ↓
Instalar dependencias frontend
        ↓
Ejecutar pruebas frontend
        ↓
Compilar frontend
        ↓
Instalar dependencias backend
        ↓
Validar sintaxis backend
        ↓
Ejecutar pruebas backend
        ↓
Generar cobertura
        ↓
Ejecutar análisis SonarCloud
```

## Ver ejecución del pipeline

En GitHub:

```txt
Repositorio → Actions
```

Estados posibles:

```txt
Queued       = en cola
In progress  = ejecutándose
Success      = finalizó correctamente
Failed       = falló
```

---

# 16. Análisis estático con SonarCloud

El proyecto utiliza SonarCloud para análisis estático de calidad del código.

Archivo de configuración:

```txt
sonar-project.properties
```

Ejemplo:

```properties
sonar.projectKey=smahechar_MUNDIALITO2026_HUB
sonar.organization=smahechar

sonar.projectName=Mundialito2026 Hub
sonar.projectVersion=1.0

sonar.sourceEncoding=UTF-8

sonar.sources=src,backend
sonar.tests=src,backend/tests

sonar.test.inclusions=backend/tests/**/*.py,src/**/*.test.js,src/**/*.test.jsx,src/**/*.spec.js,src/**/*.spec.jsx

sonar.exclusions=**/node_modules/**,**/dist/**,**/venv/**,**/.venv/**,**/__pycache__/**,**/*.pyc,backend/manual_api_check.py,backend/test_api.py,backend/seeds/**,backend/venv/**

sonar.coverage.exclusions=backend/tests/**,src/**/*.test.js,src/**/*.test.jsx,src/**/*.spec.js,src/**/*.spec.jsx,backend/seeds/**,backend/manual_api_check.py,backend/test_api.py

sonar.python.version=3.11

sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.python.coverage.reportPaths=backend/coverage.xml
```

## Configuración del token

El token real no debe subirse al repositorio.

Debe guardarse en GitHub:

```txt
Settings → Secrets and variables → Actions → New repository secret
```

Nombre:

```txt
SONAR_TOKEN
```

Valor:

```txt
Token real generado en SonarCloud
```

En el workflow se usa así:

```yaml
SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

# 17. Comandos Git

## Ver estado

```powershell
git status
```

## Agregar cambios

```powershell
git add .
```

## Crear commit

```powershell
git commit -m "Actualiza aplicación con backend real, pruebas y pipeline CI CD"
```

## Subir cambios

```powershell
git push origin main
```

## Comando completo recomendado

```powershell
git status
npm install
npm run test:run
npm run build
cd backend
venv\Scripts\activate
pytest
cd ..
git add .
git commit -m "Actualiza aplicación con backend real, pruebas y pipeline CI CD"
git push origin main
```

---

# 18. Problemas comunes

## npm ci falla en GitHub Actions

Error típico:

```txt
npm ci can only install packages when your package.json and package-lock.json are in sync
```

Solución:

```powershell
npm install
git add package.json package-lock.json
git commit -m "Sincroniza dependencias frontend para CI"
git push origin main
```

## El frontend no muestra datos reales

Verificar `.env.local`:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Reiniciar frontend:

```powershell
npm run dev -- --force
```

## Error de conexión a MySQL

Verificar:

```env
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

Probar conexión desde MySQL Workbench.

## Error Unknown column

Significa que la tabla en MySQL no coincide con el modelo SQLAlchemy.

Solución:

```sql
DESCRIBE nombre_tabla;
```

Comparar contra:

```txt
backend/db/models.py
```

## Error Data truncated

Suele ocurrir cuando el backend envía un UUID o string largo a una columna demasiado pequeña.

Solución: revisar el tipo de columna y cambiar a `VARCHAR(36)`, `VARCHAR(64)` o superior según corresponda.

## GitHub Actions no aparece

Verificar que exista:

```txt
.github/workflows/ci-cd.yml
```

Luego hacer:

```powershell
git add .
git commit -m "Agrega pipeline CI CD"
git push origin main
```

Ir a:

```txt
GitHub → Actions
```

---

# 19. Estado esperado del MVP

Al finalizar la configuración, el sistema debe permitir:

- Iniciar sesión.
- Consultar partidos reales.
- Ver fixture por fechas reales.
- Ver grupos y selecciones desde MySQL.
- Crear grupos.
- Unirse a grupos con código.
- Consultar pollas.
- Crear predicciones.
- Ver álbum digital desde MySQL.
- Abrir sobres.
- Publicar láminas repetidas para intercambio.
- Ofertar láminas.
- Confirmar intercambios.
- Reservar entradas.
- Confirmar entradas con pago mock.
- Ver notificaciones.
- Ejecutar pruebas automatizadas.
- Ejecutar pipeline CI/CD.
- Analizar calidad del código con SonarCloud.

---

# 20. Autor

Proyecto desarrollado como MVP académico para la gestión de un torneo tipo Mundial 2026.

```txt
Mundialito2026 Hub / Global Cup 2026 Hub
Desarrollado por: Sergio Mahecha Rodríguez
Año: 2026
```

---

# 21. Licencia

Este proyecto fue desarrollado con fines académicos y demostrativos.
