// Matches service — swap mock import for apiFetch when backend is ready
import { ENV } from '@/config/env'
import { apiFetch } from './api'
import { matches, moments, scorers, nextKickoff } from '@/mocks/data/matches'
import { getMatchDetail } from '@/mocks/data/matchDetail'

export const matchesService = {
  getAll:      (filters = {}) => ENV.USE_MOCKS
    ? Promise.resolve(filters.status ? matches.filter(m => m.status === filters.status) : matches)
    : apiFetch('/matches', { method: 'GET' }),

  getById:     (id) => ENV.USE_MOCKS
    ? Promise.resolve(matches.find(m => m.id === id) ?? null)
    : apiFetch(`/matches/${id}`),

  getLive:     () => ENV.USE_MOCKS
    ? Promise.resolve(matches.filter(m => m.status === 'live' || m.status === 'halftime'))
    : apiFetch('/matches/live'),

  getDetail:   (id) => ENV.USE_MOCKS
    ? Promise.resolve(getMatchDetail(id))
    : apiFetch(`/matches/${id}/detail`),

  getMoments:  () => ENV.USE_MOCKS ? Promise.resolve(moments)  : apiFetch('/matches/moments'),
  getScorers:  () => ENV.USE_MOCKS ? Promise.resolve(scorers)  : apiFetch('/matches/scorers'),
  nextKickoff: () => nextKickoff(),
}
