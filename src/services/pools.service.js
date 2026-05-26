import { ENV } from '@/config/env'
import { apiFetch } from './api'
import {
  pools,
  userPredictions,
  pointsTimeline,
  specialPicks,
  discoverPools,
  scoringRules,
  poolMembers,
} from '@/mocks/data/pools'

function safeArray(data) {
  return Array.isArray(data) ? data : []
}

export const poolsService = {
  async getMyPools() {
    if (ENV.USE_MOCKS) return pools

    const data = await apiFetch('/pools/me')
    return safeArray(data)
  },

  async getMembers(id) {
    if (ENV.USE_MOCKS) return poolMembers[id] ?? []

    const data = await apiFetch(`/pools/${id}/members`)
    return safeArray(data)
  },

  async getById(id) {
    if (ENV.USE_MOCKS) return pools.find(p => p.id === id) ?? null

    return apiFetch(`/pools/${id}`)
  },

  async getMyPredictions() {
    if (ENV.USE_MOCKS) return userPredictions

    const data = await apiFetch('/predictions/me')
    return safeArray(data)
  },

  async getTimeline() {
    if (ENV.USE_MOCKS) return pointsTimeline

    const data = await apiFetch('/predictions/timeline')
    return safeArray(data)
  },

  async getSpecialPicks() {
    if (ENV.USE_MOCKS) return specialPicks

    try {
      return await apiFetch('/predictions/special')
    } catch (err) {
      console.warn('No se pudieron cargar picks especiales:', err)
      return {}
    }
  },

  async getDiscoverPools() {
    if (ENV.USE_MOCKS) return discoverPools

    const data = await apiFetch('/pools/discover')
    return safeArray(data)
  },

  async getScoringRules() {
    if (ENV.USE_MOCKS) return scoringRules

    const data = await apiFetch('/pools/rules')
    return safeArray(data)
  },

  createPool(data) {
    if (ENV.USE_MOCKS) {
      return Promise.resolve({
        id: 'p-new',
        members: 1,
        yourPts: 0,
        you: 1,
        ...data,
      })
    }

    return apiFetch('/pools', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  joinPool(code) {
    if (ENV.USE_MOCKS) return Promise.resolve({ success: true })

    return apiFetch('/pools/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },

  savePrediction(matchId, pick) {
    if (ENV.USE_MOCKS) return Promise.resolve({ success: true })

    return apiFetch(`/predictions/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify(pick),
    })
  },
}