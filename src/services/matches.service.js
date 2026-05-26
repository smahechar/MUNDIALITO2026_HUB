import { apiFetch } from './api'

const EMPTY_DETAIL = {
  events: [],
  stats: null,
  lineupHome: null,
  lineupAway: null,
  h2h: [],
  predictions: null,
  attendance: null,
}

export const matchesService = {
  getAll() {
    return apiFetch('/matches')
  },

  getById(id) {
    return apiFetch(`/matches/${id}`)
  },

  async getDetail(id) {
    try {
      return await apiFetch(`/matches/${id}/detail`)
    } catch (err) {
      console.warn('No se pudo cargar detalle real del partido:', err)
      return EMPTY_DETAIL
    }
  },
}