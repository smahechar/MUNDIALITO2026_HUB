import { apiFetch } from './api'

function qs(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.set(key, value)
    }
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

export const adminService = {
  getUsers(params = {}) {
    return apiFetch(`/admin/users${qs(params)}`)
  },

  updateUserStatus(userId, status) {
    return apiFetch(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  getMatches(params = {}) {
    return apiFetch(`/admin/matches${qs(params)}`)
  },

  updateMatch(matchId, patch) {
    return apiFetch(`/admin/matches/${matchId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  },

  getAlerts(params = {}) {
    return apiFetch(`/admin/alerts${qs(params)}`)
  },

  updateAlert(alertId, action) {
    return apiFetch(`/admin/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    })
  },
}
