import { ENV } from '@/config/env'

const ADMIN_EMAIL = 'admin@mundialitohub.com'
const TOKEN_KEY   = 'mundialito_token'
const USER_KEY    = 'mundialito_user'

function fakeToken() {
  return `mock_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

function buildUser(fields) {
  return {
    id:             fields.id   ?? `u_${Date.now()}`,
    name:           fields.name ?? fields.email.split('@')[0],
    handle:         `@${(fields.name ?? fields.email.split('@')[0]).toLowerCase().replace(/\s+/g, '')}`,
    email:          fields.email,
    role:           fields.role ?? 'user',
    timezone:       fields.timezone ?? 'UTC-5',
    city:           fields.city ?? '',
    favoriteTeams:  fields.favoriteTeams ?? [],
    avatar:         fields.avatar ?? null,
    createdAt:      fields.createdAt ?? new Date().toISOString(),
  }
}

// ─── Mock implementation ───────────────────────────────────────────────────────
const mockAuth = {
  async login({ email, password }) {
    await new Promise(r => setTimeout(r, 700))
    if (!email || !password) throw new Error('Credenciales requeridas')

    const role  = email === ADMIN_EMAIL ? 'admin' : 'user'
    const user  = buildUser({ email, role,
      name: role === 'admin' ? 'Admin' : 'Martín Delgadillo',
      id:   role === 'admin' ? 'admin_1' : 'you',
      favoriteTeams: role === 'user' ? ['ESP', 'BOR'] : [],
      city: role === 'user' ? 'Bogotá' : '',
      timezone: 'UTC-5',
    })
    const token = fakeToken()
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY,  JSON.stringify(user))
    return { user, token }
  },

  async register({ name, email, password, favoriteTeams = [] }) {
    await new Promise(r => setTimeout(r, 700))
    if (!name || !email || !password) throw new Error('Todos los campos son requeridos')

    const user  = buildUser({ name, email, favoriteTeams })
    const token = fakeToken()
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY,  JSON.stringify(user))
    return { user, token }
  },

  async forgotPassword({ email }) {
    await new Promise(r => setTimeout(r, 600))
    if (!email) throw new Error('Email requerido')
    return { sent: true }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getSession() {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const user  = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
      if (token && user) return { user, token }
    } catch {}
    return null
  },

  async updateProfile(patch) {
    await new Promise(r => setTimeout(r, 400))
    const session = mockAuth.getSession()
    if (!session) throw new Error('No autenticado')
    const updated = { ...session.user, ...patch }
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
    return updated
  },
}

// ─── Real API implementation ───────────────────────────────────────────────────
const realAuth = {
  async login({ email, password }) {
    const res  = await fetch(`${ENV.API_BASE_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error((await res.json()).detail ?? 'Error de autenticación')
    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(USER_KEY,  JSON.stringify(data.user))
    return { user: data.user, token: data.access_token }
  },

  async register({ name, email, password, favoriteTeams }) {
    const res  = await fetch(`${ENV.API_BASE_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, favorite_teams: favoriteTeams }),
    })
    if (!res.ok) throw new Error((await res.json()).detail ?? 'Error al registrar')
    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(USER_KEY,  JSON.stringify(data.user))
    return { user: data.user, token: data.access_token }
  },

  async forgotPassword({ email }) {
    const res = await fetch(`${ENV.API_BASE_URL}/auth/forgot-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error((await res.json()).detail ?? 'Error al enviar')
    return res.json()
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getSession() {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const user  = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
      if (token && user) return { user, token }
    } catch {}
    return null
  },

  async updateProfile(patch) {
    const token = localStorage.getItem(TOKEN_KEY)
    const res = await fetch(`${ENV.API_BASE_URL}/auth/me`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error((await res.json()).detail ?? 'Error al actualizar')
    const updated = await res.json()
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
    return updated
  },
}

export const authService = ENV.USE_MOCKS ? mockAuth : realAuth
