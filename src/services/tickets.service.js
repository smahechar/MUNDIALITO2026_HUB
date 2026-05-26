// Tickets service — swap mock imports for apiFetch calls when backend is ready
import { ENV } from '@/config/env'
import { apiFetch } from './api'
import {
  userTickets, availableForReservation, stadiumSectors,
  getTicket, getSector, getTicketHistory,
} from '@/mocks/data/tickets'

export const ticketsService = {
  getAll: () => ENV.USE_MOCKS
    ? Promise.resolve(userTickets)
    : apiFetch('/tickets'),

  getById: (id) => ENV.USE_MOCKS
    ? Promise.resolve(getTicket(id) ?? null)
    : apiFetch(`/tickets/${id}`),

  getAvailable: () => ENV.USE_MOCKS
    ? Promise.resolve(availableForReservation)
    : apiFetch('/tickets/available'),

  getSectors: () => ENV.USE_MOCKS
    ? Promise.resolve(stadiumSectors)
    : apiFetch('/tickets/sectors'),

  getHistory: (id) => ENV.USE_MOCKS
    ? Promise.resolve(getTicketHistory(id))
    : apiFetch(`/tickets/${id}/history`),

  // Backend: POST /tickets/reserve { matchId, sectorId, qty }
  // Returns { id, status: 'reserved', expiresAt } — 15-min payment window
  reserve: (matchId, sectorId, qty) => ENV.USE_MOCKS
    ? Promise.resolve({ id: `T-${Math.floor(7000 + Math.random() * 1999)}`, status: 'reserved' })
    : apiFetch('/tickets/reserve', { method: 'POST', body: JSON.stringify({ matchId, sectorId, qty }) }),

  // Backend: POST /tickets/:id/confirm { card: { number, expMonth, expYear, cvc } }
  // 200 OK → ticket confirmed. 402 → pago rechazado. 410 → reserva expirada.
  confirmPayment: (ticketId, card) => ENV.USE_MOCKS
    ? Promise.resolve({ id: ticketId, status: 'confirmed' })
    : apiFetch(`/tickets/${ticketId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ card }),
      }),

  // Backend: POST /tickets/:id/transfer { handle } — invalidates original QR
  transfer: (ticketId, handle) => ENV.USE_MOCKS
    ? Promise.resolve({ id: ticketId, status: 'transferred', transferredTo: handle })
    : apiFetch(`/tickets/${ticketId}/transfer`, { method: 'POST', body: JSON.stringify({ handle }) }),

  // Backend: POST /tickets/:id/refund — only valid ≥72h before kickoff
  refund: (ticketId) => ENV.USE_MOCKS
    ? Promise.resolve({ id: ticketId, status: 'refunded' })
    : apiFetch(`/tickets/${ticketId}/refund`, { method: 'POST' }),

  getSector,
}
