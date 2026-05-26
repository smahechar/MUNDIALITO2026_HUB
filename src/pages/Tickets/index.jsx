import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell, PageHeader, Footer } from '@/components/shared/Layout'
import { Eyebrow, Btn, SectionHead } from '@/components/shared/atoms'
import { useCountUp } from '@/components/shared/atoms'
import { BoardingPassRow, AvailableMatchCard, ReserveModal } from '@/components/tickets'
import { useTickets, useAvailableTickets } from '@/hooks/useTickets'

// ─── StatTilePro ─────────────────────────────────────────────────────────────
function StatTilePro({ label, value, change, tone = 'paper' }) {
  const v  = useCountUp(typeof value === 'number' ? value : 0, 1400)
  const display = typeof value === 'number' ? Math.round(v) : value
  const styles = {
    paper: { bg: 'var(--paper)',   fg: 'var(--ink)',       border: '1px solid var(--rule)' },
    ink:   { bg: 'var(--ink)',     fg: 'var(--paper)',     border: 'transparent' },
    green: { bg: 'var(--green)',   fg: 'var(--green-ink)', border: 'transparent' },
    gold:  { bg: 'var(--gold)',    fg: 'var(--gold-ink)',  border: 'transparent' },
  }[tone] || { bg: 'var(--paper)', fg: 'var(--ink)', border: '1px solid var(--rule)' }

  return (
    <div className="gc-card gc-hover" style={{ background: styles.bg, color: styles.fg, padding: 24, borderColor: styles.border, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at 100% 0%, ${tone === 'ink' ? 'rgba(247,241,223,.06)' : 'rgba(255,255,255,.18)'}, transparent 60%)` }} />
      <Eyebrow style={{ color: styles.fg, opacity: .7, position: 'relative' }}>{label}</Eyebrow>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 64, marginTop: 10, lineHeight: .85, position: 'relative' }}>{display}</div>
      <div className="gc-mono" style={{ fontSize: 11.5, marginTop: 12, opacity: .8, letterSpacing: '.06em', position: 'relative' }}>{change}</div>
    </div>
  )
}

// ─── StatusChips · filter tabs with count badges ──────────────────────────────
function StatusChips({ value, onChange, options }) {
  return (
    <div className="gc-tabs">
      {options.map(o => (
        <button
          key={o.id}
          className={value === o.id ? 'is-on' : ''}
          onClick={() => onChange(o.id)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          {o.label}
          {o.count > 0 && (
            <span style={{
              minWidth: 18, height: 18, borderRadius: 999,
              background: value === o.id ? 'rgba(247,241,223,.25)' : 'var(--paper-2)',
              color: 'inherit',
              fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 10,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 5px',
            }}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── TicketsPage ──────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const navigate = useNavigate()
  const { tickets }            = useTickets()
  const { available, sectors } = useAvailableTickets()
  const [tab,        setTab]   = useState('all')
  const [reserving,  setRes]   = useState(null)

  const byStatus = {
    confirmed:   tickets.filter(t => t.status === 'confirmed'),
    reserved:    tickets.filter(t => t.status === 'reserved'),
    history:     tickets.filter(t => ['expired', 'transferred', 'refunded'].includes(t.status)),
  }
  const counts = {
    all:         tickets.length,
    confirmed:   byStatus.confirmed.length,
    reserved:    byStatus.reserved.length,
    history:     byStatus.history.length,
    transferred: tickets.filter(t => t.status === 'transferred').length,
    refunded:    tickets.filter(t => t.status === 'refunded').length,
  }

  const visible =
    tab === 'confirmed' ? byStatus.confirmed :
    tab === 'reserved'  ? byStatus.reserved  :
    tab === 'history'   ? byStatus.history   :
    tickets

  const tabLabel = tab === 'all' ? 'TODOS LOS ESTADOS' : tab.toUpperCase()

  return (
    <PageShell>
      {reserving && (
        <ReserveModal
          available={reserving}
          sectors={sectors}
          onClose={() => setRes(null)}
          onComplete={(id) => navigate(`/tickets/${id}`)}
        />
      )}

      <PageHeader
        kicker={`${counts.all} ENTRADAS · ${counts.confirmed} CONFIRMADAS · ${counts.reserved} PENDIENTES`}
        title={<>Mis <span style={{ color: 'var(--gold)' }}>Entradas.</span></>}
        lede="Tu colección de pases de acceso al Mundial 2026. Cada entrada vive en un único estado (reservada, confirmada, transferida o reembolsada) con auditoría completa de transiciones."
        action={
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
              Reservar nueva →
            </Btn>
          </div>
        }
      />

      {/* stat tiles */}
      <div style={{ padding: '0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
          <StatTilePro label="CONFIRMADAS"  value={counts.confirmed}   change="Acceso garantizado al estadio" tone="green" />
          <StatTilePro label="PENDIENTES"   value={counts.reserved}    change="Reservadas · pagar en ≤15min"   tone="gold" />
          <StatTilePro label="TRANSFERIDAS" value={counts.transferred} change="Reasignadas a otros usuarios"   tone="paper" />
          <StatTilePro label="REEMBOLSADAS" value={counts.refunded}    change="Devueltas a tu medio de pago"   tone="ink" />
        </div>
      </div>

      {/* ticket list */}
      <SectionHead
        num="01"
        label={`↘ ${visible.length} ENTRADAS · ${tabLabel}`}
        title="Tus pases"
        right={
          <StatusChips
            value={tab}
            onChange={setTab}
            options={[
              { id: 'all',       label: 'TODAS',       count: counts.all },
              { id: 'confirmed', label: 'CONFIRMADAS', count: counts.confirmed },
              { id: 'reserved',  label: 'RESERVADAS',  count: counts.reserved },
              { id: 'history',   label: 'HISTORIAL',   count: counts.history },
            ]}
          />
        }
      />

      <div style={{ padding: '22px 56px 0', display: 'grid', gap: 12 }}>
        {visible.length === 0 ? (
          <div className="gc-card" style={{ padding: 60, textAlign: 'center' }}>
            <Eyebrow>SIN ENTRADAS EN ESTE FILTRO</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 8px', lineHeight: .9 }}>
              Nada por acá todavía.
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              Cuando reserves o compres entradas las verás listadas aquí.
            </p>
          </div>
        ) : (
          visible.map(t => (
            <BoardingPassRow key={t.id} ticket={t} onOpen={() => navigate(`/tickets/${t.id}`)} />
          ))
        )}
      </div>

      {/* available matches */}
      <SectionHead
        num="02"
        label={`↘ PARTIDOS DISPONIBLES · ${available.length} CON ENTRADAS`}
        title="Reservá tu próxima entrada"
        right={
          <span className="gc-link" onClick={() => navigate('/fixture')}>
            Ver fixture completo →
          </span>
        }
      />
      <div style={{ padding: '22px 56px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        {available.slice(0, 6).map((a, i) => (
          <AvailableMatchCard
            key={a.matchId ?? i}
            available={a}
            onReserve={setRes}
          />
        ))}
      </div>

      <Footer />
    </PageShell>
  )
}
