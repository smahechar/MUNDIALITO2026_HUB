import { apiFetch } from './api'
import { ENV } from '@/config/env'

const DEFAULT_PREFS = {
  goalsLive:     true,
  myPredictions: true,
  groups:        true,
  tickets:       true,
  reminders:     true,
  marketing:     false,
}

// ─── Mock (sin backend) ───────────────────────────────────────────────────────
const mockNotifications = {
  async list({ onlyUnread = false } = {}) {
    const data = [
      { id: 'mock-1', category: 'ticket',    title: 'Entrada confirmada',  body: 'Tu entrada T-1234 fue confirmada.', read: false, createdAt: new Date().toISOString(), link: '/tickets' },
      { id: 'mock-2', category: 'pool',      title: 'Marcador exacto!',    body: 'Ganaste +30 pts en m1.',            read: false, createdAt: new Date().toISOString(), link: '/pools'   },
      { id: 'mock-3', category: 'broadcast', title: 'Mantenimiento 02:00', body: 'El sistema entra en mantenimiento.',read: true,  createdAt: new Date().toISOString(), link: null       },
    ]
    return onlyUnread ? data.filter(n => !n.read) : data
  },
  async unreadCount() { return { count: 2 } },
  async markRead(id) { return { id, read: true } },
  async markAllRead() { return { updated: 2 } },
  async getPreferences() { return { ...DEFAULT_PREFS } },
  async updatePreferences(patch) { return { ...DEFAULT_PREFS, ...patch } },
}

// ─── Real API ─────────────────────────────────────────────────────────────────
const realNotifications = {
  list({ onlyUnread = false } = {}) {
    const qs = onlyUnread ? '?onlyUnread=1' : ''
    return apiFetch(`/notifications/me${qs}`)
  },
  unreadCount()        { return apiFetch('/notifications/me/unread-count') },
  markRead(id)         { return apiFetch(`/notifications/${id}/read`, { method: 'POST' }) },
  markAllRead()        { return apiFetch('/notifications/read-all',   { method: 'POST' }) },
  getPreferences()     { return apiFetch('/notifications/preferences') },
  updatePreferences(p) { return apiFetch('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(p) }) },
}

export const notificationsService = ENV.USE_MOCKS ? mockNotifications : realNotifications
