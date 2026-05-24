import { matches } from './matches'

const minAgo  = (m) => new Date(Date.now() - m * 60_000).toISOString()
const minAhead = (m) => new Date(Date.now() + m * 60_000).toISOString()

// Ticket status transitions (RF-03):
//   reserved → confirmed | expired | cancelled
//   confirmed → transferred | refunded
export const stadiumSectors = [
  { id: 'norte-bajo',  name: 'Norte · Bajo',   priceUSD: 145, color: 'var(--green)', desc: 'Tribuna lateral, vista cercana al campo' },
  { id: 'norte-alto',  name: 'Norte · Alto',   priceUSD:  98, color: 'var(--ink)',   desc: 'Lateral elevado, vista panorámica' },
  { id: 'sur-bajo',    name: 'Sur · Bajo',     priceUSD: 145, color: 'var(--green)', desc: 'Tribuna lateral opuesta, primera fila' },
  { id: 'este-curva',  name: 'Este · Curva',   priceUSD:  72, color: 'var(--gold)',  desc: 'Curva detrás del arco — sector hinchada' },
  { id: 'oeste-curva', name: 'Oeste · Curva',  priceUSD:  72, color: 'var(--gold)',  desc: 'Curva opuesta — sector hinchada visitante' },
  { id: 'platea-vip',  name: 'Platea VIP',     priceUSD: 380, color: 'var(--red)',   desc: 'Asientos premium, acceso lounge' },
]

export const userTickets = [
  {
    id: 'T-7821',
    matchId: 'm1',
    status: 'confirmed',
    sector: 'norte-bajo',
    seatRow: 12, seatNum: 7,
    reservedAt:  '2026-05-04T18:22:00Z',
    confirmedAt: '2026-05-04T18:23:14Z',
    expiresAt: null, refundedAt: null, transferredTo: null,
    priceUSD: 145,
    correlationId: 'tx_2026_5a91f0c2a04e',
  },
  {
    id: 'T-7822',
    matchId: 'm4',
    status: 'confirmed',
    sector: 'sur-bajo',
    seatRow: 4, seatNum: 22,
    reservedAt:  '2026-05-09T22:10:00Z',
    confirmedAt: '2026-05-09T22:11:42Z',
    expiresAt: null, refundedAt: null, transferredTo: null,
    priceUSD: 145,
    correlationId: 'tx_2026_88e2d31f50ad',
  },
  {
    id: 'T-7901',
    matchId: 'm5',
    status: 'reserved',
    sector: 'este-curva',
    seatRow: 18, seatNum: 4,
    reservedAt:  minAgo(11),
    confirmedAt: null,
    expiresAt:   minAhead(4),
    refundedAt: null, transferredTo: null,
    priceUSD: 72,
    correlationId: 'tx_2026_7c14e09b8133',
  },
  {
    id: 'T-7902',
    matchId: 'm11',
    status: 'reserved',
    sector: 'norte-alto',
    seatRow: 26, seatNum: 15,
    reservedAt:  minAgo(2),
    confirmedAt: null,
    expiresAt:   minAhead(13),
    refundedAt: null, transferredTo: null,
    priceUSD: 98,
    correlationId: 'tx_2026_4e22f99c8071',
  },
  {
    id: 'T-7619',
    matchId: 'm6',
    status: 'transferred',
    sector: 'oeste-curva',
    seatRow: 19, seatNum: 3,
    reservedAt:  '2026-05-01T12:00:00Z',
    confirmedAt: '2026-05-01T12:01:18Z',
    expiresAt: null, refundedAt: null,
    transferredTo: { name: 'Camila R.', handle: '@camila304', at: '2026-06-11T18:30:00Z' },
    priceUSD: 72,
    correlationId: 'tx_2026_3d72088b1a90',
  },
  {
    id: 'T-7488',
    matchId: 'm7',
    status: 'expired',
    sector: 'norte-alto',
    seatRow: 9, seatNum: 12,
    reservedAt:  '2026-06-10T22:45:00Z',
    confirmedAt: null,
    expiresAt:   '2026-06-10T23:00:00Z',
    refundedAt: null, transferredTo: null,
    priceUSD: 98,
    correlationId: 'tx_2026_91ac4ff0c623',
  },
  {
    id: 'T-7322',
    matchId: 'm8',
    status: 'refunded',
    sector: 'platea-vip',
    seatRow: 2, seatNum: 8,
    reservedAt:  '2026-04-20T09:00:00Z',
    confirmedAt: '2026-04-20T09:01:08Z',
    expiresAt: null,
    refundedAt: '2026-06-08T16:42:00Z',
    transferredTo: null,
    priceUSD: 380,
    correlationId: 'tx_2026_a7e21b06fd11',
  },
]

// Upcoming matches available for reservation — price and availability seed
export const availableForReservation = matches
  .filter(m => m.status === 'upcoming')
  .map((m, i) => ({
    matchId: m.id,
    fromUSD: [72, 98, 145, 145, 380][i % 5],
    remaining: [820, 412, 1240, 64, 2810, 198][i % 6],
    demand: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
  }))

// Complete state-transition audit log per ticket
export const ticketHistory = {
  'T-7821': [
    { type: 'reserved',  at: '2026-05-04T18:22:00Z', by: 'Tú',      note: 'Reserva creada · Sector Norte Bajo · 1 entrada' },
    { type: 'paid',      at: '2026-05-04T18:23:09Z', by: 'Pago',    note: 'Visa •••• 4242 · USD 145.00 aprobado' },
    { type: 'confirmed', at: '2026-05-04T18:23:14Z', by: 'Sistema', note: 'Entrada confirmada · QR generado' },
  ],
  'T-7822': [
    { type: 'reserved',  at: '2026-05-09T22:10:00Z', by: 'Tú',      note: 'Reserva creada · Sector Sur Bajo · 1 entrada' },
    { type: 'paid',      at: '2026-05-09T22:11:38Z', by: 'Pago',    note: 'Visa •••• 4242 · USD 145.00 aprobado' },
    { type: 'confirmed', at: '2026-05-09T22:11:42Z', by: 'Sistema', note: 'Entrada confirmada · QR generado' },
  ],
  'T-7901': [
    { type: 'reserved', at: minAgo(11), by: 'Tú', note: 'Reserva creada · Sector Este Curva · 1 entrada · 15min para pagar' },
  ],
  'T-7902': [
    { type: 'reserved', at: minAgo(2), by: 'Tú', note: 'Reserva creada · Sector Norte Alto · 1 entrada · 15min para pagar' },
  ],
  'T-7619': [
    { type: 'reserved',    at: '2026-05-01T12:00:00Z', by: 'Tú',      note: 'Reserva creada · Sector Oeste Curva · 1 entrada' },
    { type: 'paid',        at: '2026-05-01T12:01:15Z', by: 'Pago',    note: 'Visa •••• 4242 · USD 72.00 aprobado' },
    { type: 'confirmed',   at: '2026-05-01T12:01:18Z', by: 'Sistema', note: 'Entrada confirmada' },
    { type: 'transferred', at: '2026-06-11T18:30:00Z', by: 'Tú',      note: 'Transferida a Camila R. (@camila304)' },
  ],
  'T-7488': [
    { type: 'reserved', at: '2026-06-10T22:45:00Z', by: 'Tú',      note: 'Reserva creada · Sector Norte Alto · 1 entrada' },
    { type: 'expired',  at: '2026-06-10T23:00:00Z', by: 'Sistema', note: 'Reserva expirada · Pago no completado en 15 minutos' },
  ],
  'T-7322': [
    { type: 'reserved',  at: '2026-04-20T09:00:00Z', by: 'Tú',      note: 'Reserva creada · Platea VIP · 1 entrada' },
    { type: 'paid',      at: '2026-04-20T09:01:05Z', by: 'Pago',    note: 'Visa •••• 4242 · USD 380.00 aprobado' },
    { type: 'confirmed', at: '2026-04-20T09:01:08Z', by: 'Sistema', note: 'Entrada confirmada' },
    { type: 'refunded',  at: '2026-06-08T16:42:00Z', by: 'Sistema', note: 'Reembolso aprobado · USD 380.00 acreditados a Visa •••• 4242' },
  ],
}

export const getTicket        = (id) => userTickets.find(t => t.id === id)
export const getSector        = (id) => stadiumSectors.find(s => s.id === id)
export const getTicketHistory = (id) => ticketHistory[id] || []
