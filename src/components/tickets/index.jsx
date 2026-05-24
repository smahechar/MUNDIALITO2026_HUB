import { useState, useEffect, useMemo } from 'react'
import { Flag, Pill, Eyebrow, Btn, SectionHead } from '@/components/shared/atoms'
import { Floodlight } from '@/components/shared/Layout'
import { ModalOverlay } from '@/components/shared/Modal'
import { byCode } from '@/mocks/data/nations'
import { matches, stadiums } from '@/mocks/data/matches'
import { stadiumSectors, getSector } from '@/mocks/data/tickets'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  confirmed:   { label: 'CONFIRMADA',  stripe: 'var(--green)',   pillBg: 'var(--green)',   pillFg: 'var(--green-ink)'   },
  reserved:    { label: 'RESERVADA',   stripe: 'var(--gold)',    pillBg: 'var(--gold)',    pillFg: 'var(--gold-ink)'    },
  expired:     { label: 'EXPIRADA',    stripe: 'var(--red)',     pillBg: 'var(--red)',     pillFg: 'var(--red-ink)'     },
  transferred: { label: 'TRANSFERIDA', stripe: 'var(--muted)',   pillBg: 'var(--paper-2)', pillFg: 'var(--muted)'       },
  refunded:    { label: 'REEMBOLSADA', stripe: 'var(--muted)',   pillBg: 'var(--paper-2)', pillFg: 'var(--muted)'       },
}

// ─── TicketStatusBadge ────────────────────────────────────────────────────────
export function TicketStatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.confirmed
  const padding  = size === 'lg' ? '8px 14px' : '4px 9px'
  const fontSize = size === 'lg' ? 13 : 10.5
  return (
    <span style={{
      padding, borderRadius: 999,
      background: cfg.pillBg, color: cfg.pillFg,
      fontFamily: 'var(--f-sub)', fontWeight: 800,
      fontSize, letterSpacing: '.1em', textTransform: 'uppercase',
      whiteSpace: 'nowrap', border: 'none',
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      {status === 'reserved' && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      )}
      {cfg.label}
    </span>
  )
}

// ─── ReserveCountdown ─────────────────────────────────────────────────────────
export function ReserveCountdown({ expiresAt, big = false }) {
  const target = useMemo(() => new Date(expiresAt), [expiresAt])
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = Math.max(0, target - now)
  const m = Math.floor(remaining / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  const danger  = remaining < 60000
  const expired = remaining === 0

  return (
    <div className="gc-col" style={{ alignItems: big ? 'flex-start' : 'flex-end' }}>
      <span className="gc-mono" style={{
        fontSize: big ? 14 : 10,
        letterSpacing: '.14em',
        color: danger ? 'var(--red)' : 'var(--muted)',
        fontWeight: 700, textTransform: 'uppercase',
      }}>
        {expired ? 'EXPIRADA' : 'EXPIRA EN'}
      </span>
      <span className="gc-mono" style={{
        fontSize: big ? 'clamp(80px, 12vw, 144px)' : 28,
        fontWeight: 800,
        color: expired ? 'var(--muted)' : danger ? 'var(--red)' : 'var(--ink)',
        letterSpacing: big ? '-.01em' : '.04em',
        lineHeight: 1,
      }}>
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  )
}

// ─── QRPlaceholder (deterministic from ticket id) ─────────────────────────────
export function QRPlaceholder({ seed = 'T-0000', size = 140 }) {
  const n = 14
  const cells = []
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      h = (h * 1664525 + 1013904223) >>> 0
      const on = (h & 1) === 1
      const inCorner = (x < 3 && y < 3) || (x >= n - 3 && y < 3) || (x < 3 && y >= n - 3)
      if (inCorner) {
        const ring = x === 0 || x === 2 || y === 0 || y === 2 ||
                     x === n - 1 || x === n - 3 || y === n - 1 || y === n - 3
        const center = (x === 1 && y === 1) || (x === n - 2 && y === 1) || (x === 1 && y === n - 2)
        cells.push(ring || center)
      } else {
        cells.push(on)
      }
    }
  }
  const cell = size / n
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 6, background: 'var(--paper)' }}>
      <rect width={size} height={size} fill="var(--paper)" />
      {cells.map((on, i) => on && (
        <rect key={i}
          x={(i % n) * cell} y={Math.floor(i / n) * cell}
          width={cell} height={cell}
          fill="var(--ink)" />
      ))}
    </svg>
  )
}

// ─── BoardingPassRow · horizontal list card ───────────────────────────────────
export function BoardingPassRow({ ticket, onOpen }) {
  const cfg    = STATUS_CFG[ticket.status] || STATUS_CFG.confirmed
  const match  = matches.find(m => m.id === ticket.matchId)
  const sector = getSector(ticket.sector)
  if (!match) return null
  const home = byCode[match.home]
  const away = byCode[match.away]

  return (
    <div
      className="gc-hover no-accent"
      onClick={onOpen}
      style={{
        display: 'grid',
        gridTemplateColumns: '8px minmax(0,1fr) auto',
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* status stripe */}
      <div style={{ background: cfg.stripe }} />

      {/* main body */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0,1fr) minmax(120px,200px)',
        gap: 22, padding: '16px 22px',
        alignItems: 'center',
      }}>
        {/* flags */}
        <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
          <Flag code={home.code} size={28} />
          <span className="gc-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--muted)' }}>VS</span>
          <Flag code={away.code} size={28} />
        </div>

        {/* match info */}
        <div className="gc-col gc-gap-xs" style={{ minWidth: 0 }}>
          <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline' }}>
            <span style={{
              fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 17,
              textTransform: 'uppercase', letterSpacing: '.01em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {home.name} × {away.name}
            </span>
            <Eyebrow style={{ fontSize: 10 }}>{match.phase}</Eyebrow>
          </div>
          <div className="gc-row gc-gap-md" style={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span className="gc-mono" style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--muted)' }}>
              {new Date(match.kickoff).toLocaleString('es-CO', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="gc-mono" style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--muted)' }}>
              {match.stadium} · {match.city}
            </span>
            <span className="gc-mono" style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--ink)', fontWeight: 700 }}>
              {sector?.name} · Fila {ticket.seatRow} · Asiento {ticket.seatNum}
            </span>
          </div>
        </div>

        {/* status */}
        <div className="gc-col gc-gap-xs" style={{ alignItems: 'flex-end' }}>
          <TicketStatusBadge status={ticket.status} />
          {ticket.status === 'reserved'
            ? <ReserveCountdown expiresAt={ticket.expiresAt} />
            : <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>#{ticket.id}</span>}
        </div>
      </div>

      {/* perforation stub */}
      <div style={{
        background: 'var(--paper)',
        borderLeft: '1px dashed var(--rule)',
        padding: '16px 18px',
        display: 'flex', alignItems: 'center',
      }}>
        <span className="gc-link" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>Detalle →</span>
      </div>
    </div>
  )
}

// ─── PassField helper ─────────────────────────────────────────────────────────
function PassField({ label, value, sub }) {
  return (
    <div className="gc-col">
      <Eyebrow style={{ fontSize: 9 }}>{label}</Eyebrow>
      <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 15, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '.02em', marginTop: 4 }}>
        {value}
      </span>
      {sub && <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', marginTop: 3 }}>{sub}</span>}
    </div>
  )
}

// ─── BoardingPassHero · full detail card ─────────────────────────────────────
export function BoardingPassHero({ ticket, match, sector }) {
  const cfg = STATUS_CFG[ticket.status] || STATUS_CFG.confirmed
  const home = byCode[match.home]
  const away = byCode[match.away]
  const stadiumInfo = stadiums[match.stadium]
  const dateFmt = new Date(match.kickoff).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeFmt = new Date(match.kickoff).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const gateNum = ((parseInt(ticket.id.slice(-3), 10) % 8) + 1).toString().padStart(2, '0')

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1.5px solid var(--rule)',
      borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 20px 50px -25px rgba(12,12,13,.32), 0 4px 8px rgba(12,12,13,.04)',
    }}>
      {/* top status strip */}
      <div style={{ height: 8, background: cfg.stripe }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) auto',
      }}>
        {/* LEFT — match identity */}
        <div style={{ padding: '32px 36px' }}>
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
            <Eyebrow>↘ {match.phase} · GLOBAL CUP 2026</Eyebrow>
            <TicketStatusBadge status={ticket.status} size="lg" />
          </div>

          <div className="gc-row gc-gap-md" style={{ alignItems: 'center', marginBottom: 22 }}>
            <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
              <Flag code={home.code} size={70} />
              <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: 'var(--muted)' }}>{home.code}</span>
            </div>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(28px,3.5vw,44px)', color: 'var(--muted)', padding: '0 8px' }}>×</span>
            <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
              <Flag code={away.code} size={70} />
              <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: 'var(--muted)' }}>{away.code}</span>
            </div>
          </div>

          <h1 style={{
            fontFamily: 'var(--f-display)',
            fontSize: 'clamp(40px,6vw,88px)',
            margin: '0 0 24px', lineHeight: .86,
            textTransform: 'uppercase', wordBreak: 'break-word',
          }}>
            {home.name} <span style={{ color: 'var(--muted)' }}>×</span> {away.name}
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
            gap: 18, paddingTop: 22,
            borderTop: '1.5px dashed var(--rule)',
          }}>
            <PassField label="ESTADIO"   value={match.stadium}      sub={`${match.city.toUpperCase()}${stadiumInfo ? ` · ${stadiumInfo.country.toUpperCase()}` : ''}`} />
            <PassField label="FECHA"     value={dateFmt}            sub={`Hora: ${timeFmt} · UTC-5`} />
            <PassField label="FASE"      value={match.phase.split('·')[0].trim()} sub={match.phase.split('·').slice(1).join('·').trim() || ''} />
            <PassField label="CAPACIDAD" value={stadiumInfo ? stadiumInfo.cap.toLocaleString() : '—'} sub={stadiumInfo?.roof || ''} />
          </div>
        </div>

        {/* perforated divider */}
        <div style={{ position: 'relative', width: 1, borderRight: '2px dashed var(--rule)' }}>
          <span style={{ position: 'absolute', top: -10, left: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--paper-2)', border: '1.5px solid var(--rule)' }} />
          <span style={{ position: 'absolute', bottom: -10, left: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--paper-2)', border: '1.5px solid var(--rule)' }} />
        </div>

        {/* RIGHT — stub */}
        <div style={{
          width: 320, padding: '32px 28px',
          background: 'color-mix(in oklab, var(--paper) 60%, var(--paper-2))',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Eyebrow>↘ ENTRADA</Eyebrow>
            <span className="gc-mono" style={{ fontWeight: 700, fontSize: 11, letterSpacing: '.12em', color: 'var(--muted)' }}>STUB</span>
          </div>

          <div style={{ alignSelf: 'center', padding: 12, background: 'var(--paper)', borderRadius: 10, border: '1.5px solid var(--rule)' }}>
            <QRPlaceholder seed={ticket.id} size={140} />
          </div>

          <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
            <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.1em' }}>N° DE ENTRADA</span>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 32, lineHeight: 1, letterSpacing: '.04em' }}>{ticket.id}</span>
          </div>

          <div style={{ padding: '14px 18px', border: '1.5px dashed var(--rule)', borderRadius: 10, background: 'var(--paper)' }}>
            <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <Eyebrow style={{ fontSize: 9 }}>SECTOR</Eyebrow>
              <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase' }}>{sector?.name}</span>
            </div>
            <div className="gc-row" style={{ justifyContent: 'space-between', gap: 16 }}>
              <div className="gc-col">
                <Eyebrow style={{ fontSize: 9 }}>FILA</Eyebrow>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1 }}>{ticket.seatRow}</span>
              </div>
              <div className="gc-col">
                <Eyebrow style={{ fontSize: 9 }}>ASIENTO</Eyebrow>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1 }}>{ticket.seatNum}</span>
              </div>
              <div className="gc-col">
                <Eyebrow style={{ fontSize: 9 }}>PUERTA</Eyebrow>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1 }}>{gateNum}</span>
              </div>
            </div>
          </div>

          <div className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em', textAlign: 'center', borderTop: '1px solid var(--rule)', paddingTop: 12 }}>
            {ticket.correlationId}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TicketTimeline · audit log ───────────────────────────────────────────────
const TIMELINE_ICONS = {
  reserved:    { glyph: '●', color: 'var(--gold)'  },
  paid:        { glyph: '$', color: 'var(--green)'  },
  confirmed:   { glyph: '✓', color: 'var(--green)'  },
  transferred: { glyph: '→', color: 'var(--ink)'    },
  refunded:    { glyph: '↩', color: 'var(--muted)'  },
  expired:     { glyph: '×', color: 'var(--red)'    },
  cancelled:   { glyph: '×', color: 'var(--muted)'  },
}
const TIMELINE_LABELS = {
  reserved:    'RESERVADA',
  paid:        'PAGO APROBADO',
  confirmed:   'CONFIRMADA',
  transferred: 'TRANSFERIDA',
  refunded:    'REEMBOLSADA',
  expired:     'EXPIRADA',
  cancelled:   'CANCELADA',
}

export function TicketTimeline({ events, correlationId }) {
  return (
    <div className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="gc-row" style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow>HISTORIAL DE ESTADOS · AUDIT LOG</Eyebrow>
        {correlationId && <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>{correlationId}</span>}
      </div>
      <div style={{ position: 'relative' }}>
        {events.map((ev, i) => {
          const icon   = TIMELINE_ICONS[ev.type] || TIMELINE_ICONS.reserved
          const isLast = i === events.length - 1
          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: 'auto minmax(0,1fr) auto',
              gap: 18, padding: '16px 22px',
              borderBottom: !isLast ? '1px solid var(--rule)' : 'none',
              alignItems: 'flex-start',
            }}>
              {/* icon + connector */}
              <div style={{ position: 'relative', width: 32, paddingTop: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: icon.color, color: 'var(--paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 14,
                  position: 'relative', zIndex: 2,
                }}>{icon.glyph}</div>
                {!isLast && (
                  <div style={{ position: 'absolute', left: 13.5, top: 32, bottom: -16, width: 1, background: 'var(--rule)' }} />
                )}
              </div>

              {/* content */}
              <div className="gc-col gc-gap-xs" style={{ minWidth: 0 }}>
                <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 14, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    {TIMELINE_LABELS[ev.type] || ev.type.toUpperCase()}
                  </span>
                  <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.06em' }}>POR {ev.by}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>{ev.note}</span>
              </div>

              {/* timestamp */}
              <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                {new Date(ev.at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── AvailableMatchCard ───────────────────────────────────────────────────────
export function AvailableMatchCard({ available, onReserve }) {
  const match = matches.find(m => m.id === available.matchId)
  if (!match) return null
  const home = byCode[match.home]
  const away = byCode[match.away]

  const demandCfg = {
    high:   { label: 'ALTA DEMANDA', style: { background: 'var(--red)', color: 'var(--red-ink)', borderColor: 'transparent' } },
    medium: { label: 'DISPONIBLE',   style: {} },
    low:    { label: 'AMPLIA',       style: {} },
  }[available.demand]

  const demandTone = available.demand === 'low' ? 'green' : 'default'

  return (
    <div className="gc-card gc-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Eyebrow>{match.phase}</Eyebrow>
        <Pill tone={demandTone} style={demandCfg.style}>{demandCfg.label}</Pill>
      </div>

      <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
        <div className="gc-col gc-gap-xs" style={{ alignItems: 'center', flex: 1 }}>
          <Flag code={home.code} size={36} />
          <span className="gc-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em' }}>{home.code}</span>
          <span style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{home.name}</span>
        </div>
        <span style={{ fontFamily: 'var(--f-display)', fontSize: 28, color: 'var(--muted)' }}>vs</span>
        <div className="gc-col gc-gap-xs" style={{ alignItems: 'center', flex: 1 }}>
          <Flag code={away.code} size={36} />
          <span className="gc-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em' }}>{away.code}</span>
          <span style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>{away.name}</span>
        </div>
      </div>

      <div className="gc-col gc-gap-xs" style={{ paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
          {new Date(match.kickoff).toLocaleString('es-CO', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
          {match.stadium} · {match.city}
        </span>
      </div>

      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4 }}>
        <div className="gc-col">
          <Eyebrow style={{ fontSize: 9 }}>DESDE</Eyebrow>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 32, lineHeight: 1 }}>USD {available.fromUSD}</span>
          <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{available.remaining.toLocaleString()} disponibles</span>
        </div>
        <Btn onClick={() => onReserve(available)} style={{ padding: '10px 18px', fontSize: 12 }}>Reservar →</Btn>
      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      width: 56, height: 56,
      border: '4px solid var(--rule)',
      borderTopColor: 'var(--ink)',
      borderRadius: 999,
      animation: 'gc-spin 1s linear infinite',
    }} />
  )
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────
function SummaryRow({ label, value, accent }) {
  return (
    <div className="gc-row" style={{
      justifyContent: 'space-between', alignItems: 'baseline',
      paddingTop: accent ? 10 : 0,
      borderTop: accent ? '1px solid var(--rule)' : 'none',
    }}>
      <span style={{ fontSize: 13, color: accent ? 'var(--ink)' : 'var(--muted)', fontWeight: accent ? 700 : 500 }}>{label}</span>
      <span style={{
        fontFamily: accent ? 'var(--f-display)' : 'var(--f-mono)',
        fontSize: accent ? 28 : 13,
        fontWeight: accent ? 400 : 600,
        color: accent ? 'var(--gold)' : 'var(--ink)',
      }}>{value}</span>
    </div>
  )
}

// ─── ReserveModal · 3-step flow ───────────────────────────────────────────────
// step 0: sector + qty | step 1: payment review | step 2: processing | step 3: confirmed
export function ReserveModal({ available, onClose, onComplete }) {
  const [step,       setStep]  = useState(0)
  const [sectorId,   setSec]   = useState(stadiumSectors[1].id)
  const [qty,        setQty]   = useState(1)
  const [newTicketId, setTid]  = useState(null)

  const sessionExpires = useMemo(() => new Date(Date.now() + 15 * 60_000), [])
  const sector  = getSector(sectorId)
  const match   = matches.find(m => m.id === available.matchId)
  const home    = byCode[match.home]
  const away    = byCode[match.away]
  const subtotal = sector.priceUSD * qty
  const fee      = Math.round(subtotal * 0.06)
  const total    = subtotal + fee

  function handlePay() {
    setStep(2)
    // Backend team: replace with ticketsService.reserve(matchId, sectorId, qty)
    // then ticketsService.confirmPayment(reservedTicketId)
    setTimeout(() => {
      const id = `T-${Math.floor(7000 + Math.random() * 1999)}`
      setTid(id)
      setStep(3)
    }, 1500)
  }

  const stepLabels = ['SECTOR', 'PAGO', 'CONFIRMACIÓN']

  return (
    <ModalOverlay onClose={onClose} maxWidth={640}>
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <Eyebrow>↘ RESERVA · {match.phase}</Eyebrow>
        {step < 3 && <ReserveCountdown expiresAt={sessionExpires.toISOString()} />}
      </div>

      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(36px,5vw,56px)', margin: '0 0 22px', lineHeight: .88, textTransform: 'uppercase' }}>
        {step === 3 ? 'Confirmada.' : step === 2 ? 'Procesando.' : step === 1 ? 'Confirmar pago.' : 'Elegí tu sector.'}
      </h2>

      {step < 3 && (
        <div className="gc-row gc-gap-sm" style={{ marginBottom: 22 }}>
          {stepLabels.map((l, i) => (
            <span key={l} style={{
              padding: '5px 10px', borderRadius: 999,
              fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 10, letterSpacing: '.1em',
              background: i === step ? 'var(--ink)' : i < step ? 'var(--green)' : 'transparent',
              color: i <= step ? 'var(--paper)' : 'var(--muted)',
              border: i <= step ? 'none' : '1px dashed var(--rule)',
            }}>{i + 1} · {l}</span>
          ))}
        </div>
      )}

      {step === 0 && (
        <div className="gc-col gc-gap-md">
          <div className="gc-col gc-gap-sm">
            <Eyebrow style={{ fontSize: 10 }}>SECTOR DEL ESTADIO</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {stadiumSectors.map(s => {
                const active = s.id === sectorId
                return (
                  <button key={s.id} onClick={() => setSec(s.id)} style={{
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    background: active ? 'var(--ink)' : 'var(--paper)',
                    color: active ? 'var(--paper)' : 'var(--ink)',
                    border: `1px solid ${active ? 'var(--ink)' : 'var(--rule)'}`,
                    textAlign: 'left', transition: 'all .15s ease',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                  }}>
                    <div className="gc-col gc-gap-xs" style={{ alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 13, letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.name}</span>
                      <span className="gc-mono" style={{ fontSize: 10, opacity: active ? .65 : .55, letterSpacing: '.04em' }}>{s.desc}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: active ? 'var(--gold)' : 'var(--ink)', whiteSpace: 'nowrap' }}>
                      USD {s.priceUSD}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="gc-col gc-gap-sm">
            <Eyebrow style={{ fontSize: 10 }}>CANTIDAD · MÁX 4 ENTRADAS</Eyebrow>
            <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={qtyBtnStyle}>−</button>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 48, minWidth: 70, textAlign: 'center', lineHeight: 1 }}>{qty}</span>
              <button onClick={() => setQty(Math.min(4, qty + 1))} style={qtyBtnStyle}>+</button>
              <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 14 }}>
                USD {(sector.priceUSD * qty).toLocaleString()} subtotal
              </span>
            </div>
          </div>

          <div className="gc-row gc-gap-md" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn onClick={() => setStep(1)}>Siguiente · Pago →</Btn>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="gc-col gc-gap-md">
          <div className="gc-card" style={{ padding: 22 }}>
            <Eyebrow>↘ RESUMEN</Eyebrow>
            <div className="gc-col gc-gap-sm" style={{ marginTop: 14 }}>
              <SummaryRow label={`${home.name} × ${away.name}`} value={new Date(match.kickoff).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} />
              <SummaryRow label="Sector"   value={sector.name} />
              <SummaryRow label="Cantidad" value={`${qty} entrada${qty > 1 ? 's' : ''}`} />
              <SummaryRow label="Subtotal" value={`USD ${subtotal.toLocaleString()}`} />
              <SummaryRow label="Cargos por servicio (6%)" value={`USD ${fee.toLocaleString()}`} />
              <SummaryRow label="TOTAL"    value={`USD ${total.toLocaleString()}`} accent />
            </div>
          </div>

          <div className="gc-card" style={{ padding: 22 }}>
            <Eyebrow>↘ MÉTODO DE PAGO</Eyebrow>
            <div style={{
              marginTop: 14, padding: '18px 22px',
              background: 'var(--paper-2)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
              border: '1.5px solid var(--ink)',
            }}>
              <div className="gc-row gc-gap-md" style={{ alignItems: 'center' }}>
                <div style={{
                  width: 46, height: 30, borderRadius: 4,
                  background: 'linear-gradient(135deg,#1a1f71 0%,#2e3a90 50%,#1a1f71 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontFamily: 'var(--f-sub)', fontWeight: 900, fontSize: 12, letterSpacing: '.05em',
                }}>VISA</div>
                <div className="gc-col">
                  <span className="gc-mono" style={{ fontWeight: 700, fontSize: 14, letterSpacing: '.12em' }}>•••• •••• •••• 4242</span>
                  <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Vence 09/28 · Sandbox</span>
                </div>
              </div>
              <Pill tone="green">PRINCIPAL</Pill>
            </div>
            <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em', marginTop: 10, display: 'block' }}>
              Pago simulado · transacción no real
            </span>
          </div>

          <div className="gc-row gc-gap-md" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <Btn kind="ghost" onClick={() => setStep(0)}>← Volver</Btn>
            <Btn style={{ background: 'var(--gold)', color: 'var(--gold-ink)' }} onClick={handlePay}>
              Pagar USD {total.toLocaleString()} →
            </Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="gc-col" style={{ alignItems: 'center', padding: 40, gap: 18 }}>
          <Spinner />
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 32, lineHeight: 1, textTransform: 'uppercase' }}>Procesando pago…</span>
          <span className="gc-mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.1em' }}>Esto suele tomar 1-2 segundos</span>
        </div>
      )}

      {step === 3 && (
        <div className="gc-col gc-gap-md" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: 'var(--green)', color: 'var(--green-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-display)', fontSize: 36,
          }}>✓</div>
          <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
            <Eyebrow>↘ ENTRADA CONFIRMADA</Eyebrow>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 52, lineHeight: 1, marginTop: 4, letterSpacing: '.02em' }}>
              {newTicketId}
            </span>
            <span className="gc-mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.08em' }}>
              {sector.name} · {qty} entrada{qty > 1 ? 's' : ''} · USD {total}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 380, margin: 0 }}>
            Te enviamos el QR por correo. Podés verlo en cualquier momento desde "Mis Entradas".
          </p>
          <div className="gc-row gc-gap-md">
            <Btn kind="ghost" onClick={onClose}>Cerrar</Btn>
            <Btn onClick={() => { onComplete?.(newTicketId); onClose() }}>Ver entrada →</Btn>
          </div>
        </div>
      )}
    </ModalOverlay>
  )
}

// ─── TransferModal ────────────────────────────────────────────────────────────
export function TransferModal({ ticket, onClose, onComplete }) {
  const [step,   setStep]  = useState(0)
  const [handle, setHandle] = useState('')

  function handleConfirm() {
    setStep(1)
    // Backend team: replace with ticketsService.transfer(ticket.id, handle)
    setTimeout(() => setStep(2), 1200)
  }

  return (
    <ModalOverlay onClose={onClose}>
      {step === 0 && (
        <div className="gc-col gc-gap-md">
          <Eyebrow>↘ TRANSFERIR ENTRADA</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 44, margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>¿A quién?</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5 }}>
            Ingresá el handle o correo de la persona registrada en el Hub.
            La entrada se reasigna inmediatamente; perdés acceso al QR.
          </p>
          <div className="gc-col gc-gap-xs">
            <Eyebrow style={{ fontSize: 10 }}>HANDLE O CORREO</Eyebrow>
            <input
              value={handle}
              onChange={e => setHandle(e.target.value)}
              placeholder="@usuario · correo@dominio.com"
              style={inputStyle}
            />
          </div>
          <div className="gc-card" style={{ padding: 16, background: 'var(--paper-2)' }}>
            <Eyebrow style={{ fontSize: 9 }}>ENTRADA A TRANSFERIR</Eyebrow>
            <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 15, textTransform: 'uppercase', display: 'block', marginTop: 6 }}>
              {ticket.id} · Fila {ticket.seatRow} · Asiento {ticket.seatNum}
            </span>
          </div>
          <div className="gc-row gc-gap-md" style={{ justifyContent: 'flex-end' }}>
            <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn onClick={handleConfirm} style={{ opacity: handle.length < 3 ? .5 : 1 }}>Transferir →</Btn>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="gc-col" style={{ alignItems: 'center', padding: 28, gap: 16 }}>
          <Spinner />
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 28, textTransform: 'uppercase' }}>Transfiriendo…</span>
        </div>
      )}
      {step === 2 && (
        <div className="gc-col gc-gap-md" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--green)', color: 'var(--green-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-display)', fontSize: 30 }}>✓</div>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: 0, lineHeight: .9, textTransform: 'uppercase' }}>Transferencia exitosa.</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 380, margin: 0 }}>
            {ticket.id} se reasignó a <b>{handle}</b>. Tu acceso al QR fue revocado.
          </p>
          <Btn onClick={() => { onComplete?.(handle); onClose() }}>Cerrar</Btn>
        </div>
      )}
    </ModalOverlay>
  )
}

// ─── RefundModal ──────────────────────────────────────────────────────────────
export function RefundModal({ ticket, onClose, onComplete }) {
  const [step,   setStep]  = useState(0)
  const [accept, setAccept] = useState(false)
  const refundAmt = Math.round(ticket.priceUSD * 0.9)

  function handleRefund() {
    setStep(1)
    // Backend team: replace with ticketsService.refund(ticket.id)
    setTimeout(() => setStep(2), 1500)
  }

  return (
    <ModalOverlay onClose={onClose}>
      {step === 0 && (
        <div className="gc-col gc-gap-md">
          <Eyebrow>↘ SOLICITUD DE REEMBOLSO</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 44, margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>¿Confirmás?</h2>
          <div className="gc-card" style={{ padding: 18, background: 'var(--paper-2)' }}>
            <Eyebrow style={{ fontSize: 9 }}>TÉRMINOS</Eyebrow>
            <ul style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, paddingLeft: 18, marginTop: 8 }}>
              <li>Reembolsos sólo hasta 72h antes del partido.</li>
              <li>Se descuenta un 10% de cargo administrativo.</li>
              <li>El monto se acredita en 3-5 días hábiles.</li>
              <li>La entrada pasa a estado <b>REEMBOLSADA</b> y no podrá usarse.</li>
            </ul>
          </div>
          <div className="gc-card" style={{ padding: 18 }}>
            <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="gc-mono" style={{ fontSize: 13 }}>Pago original</span>
              <span className="gc-mono" style={{ fontSize: 13, fontWeight: 700 }}>USD {ticket.priceUSD}</span>
            </div>
            <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="gc-mono" style={{ fontSize: 13 }}>Cargo (10%)</span>
              <span className="gc-mono" style={{ fontSize: 13, color: 'var(--red)' }}>− USD {Math.round(ticket.priceUSD * 0.1)}</span>
            </div>
            <div className="gc-row" style={{ paddingTop: 10, borderTop: '1px solid var(--rule)', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 14, letterSpacing: '.04em', textTransform: 'uppercase' }}>Recibirás</span>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 32, color: 'var(--green)' }}>USD {refundAmt}</span>
            </div>
          </div>
          <label className="gc-row gc-gap-sm" style={{ alignItems: 'center', cursor: 'pointer', padding: '8px 0' }}>
            <input type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)} style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 13 }}>He leído y acepto los términos del reembolso.</span>
          </label>
          <div className="gc-row gc-gap-md" style={{ justifyContent: 'flex-end' }}>
            <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn onClick={handleRefund} style={{ opacity: !accept ? .5 : 1, background: 'var(--red)', color: 'var(--red-ink)' }}>
              Solicitar reembolso
            </Btn>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="gc-col" style={{ alignItems: 'center', padding: 28, gap: 16 }}>
          <Spinner />
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 28, textTransform: 'uppercase' }}>Procesando reembolso…</span>
        </div>
      )}
      {step === 2 && (
        <div className="gc-col gc-gap-md" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--green)', color: 'var(--green-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-display)', fontSize: 30 }}>✓</div>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: 0, lineHeight: .9, textTransform: 'uppercase' }}>Reembolso aprobado.</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 380, margin: 0 }}>
            Acreditamos <b>USD {refundAmt}</b> a tu Visa •••• 4242. Verás el movimiento en 3-5 días hábiles.
          </p>
          <Btn onClick={() => { onComplete?.(); onClose() }}>Cerrar</Btn>
        </div>
      )}
    </ModalOverlay>
  )
}

const qtyBtnStyle = {
  width: 48, height: 48, borderRadius: 999,
  border: '2px solid var(--ink)', background: 'transparent',
  fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 22,
  cursor: 'pointer', color: 'var(--ink)', lineHeight: 1,
}

const inputStyle = {
  fontFamily: 'var(--f-body)', fontSize: 14, padding: '12px 16px',
  borderRadius: 10, border: '2px solid var(--rule)',
  background: 'var(--paper-2)', color: 'var(--ink)', outline: 'none',
  width: '100%', boxSizing: 'border-box', transition: 'border-color .15s ease',
}
