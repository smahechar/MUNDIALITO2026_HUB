import { useNavigate, useParams } from 'react-router-dom'
import { PageShell, Floodlight, Footer } from '@/components/shared/Layout'
import { Eyebrow, Btn, SectionHead, Flag, Pill } from '@/components/shared/atoms'
import {
  BoardingPassHero, TicketTimeline, TicketStatusBadge,
  ReserveCountdown, TransferModal, RefundModal,
} from '@/components/tickets'
import { useTicket } from '@/hooks/useTickets'
import { matches } from '@/mocks/data/matches'
import { getSector } from '@/mocks/data/tickets'
import { byCode } from '@/mocks/data/nations'
import { useState } from 'react'

// ─── Inline match card for "Contexto del partido" section ────────────────────
function MatchContextCard({ match }) {
  const home = byCode[match.home]
  const away = byCode[match.away]
  const isLive  = match.status === 'live' || match.status === 'halftime'
  const isFinal = match.status === 'final'
  const hasScore = match.homeScore !== null

  return (
    <div className="gc-card" style={{ padding: 24 }}>
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Eyebrow>{match.phase}</Eyebrow>
        {isLive  && <Pill live>LIVE · {match.minute}</Pill>}
        {isFinal && <Pill tone="ink">FT</Pill>}
        {!isLive && !isFinal && <Pill>PRÓXIMO</Pill>}
      </div>

      <div className="gc-row gc-gap-md" style={{ alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div className="gc-col gc-gap-xs" style={{ alignItems: 'center', flex: 1 }}>
          <Flag code={home.code} size={48} />
          <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 16, textTransform: 'uppercase', textAlign: 'center' }}>
            {home.name}
          </span>
        </div>

        {hasScore ? (
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 56, lineHeight: 1, letterSpacing: '.04em', color: isLive ? 'var(--red)' : 'var(--ink)' }}>
            {match.homeScore} – {match.awayScore}
          </span>
        ) : (
          <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 28, color: 'var(--muted)' }}>vs</span>
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
              {new Date(match.kickoff).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        <div className="gc-col gc-gap-xs" style={{ alignItems: 'center', flex: 1 }}>
          <Flag code={away.code} size={48} />
          <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 16, textTransform: 'uppercase', textAlign: 'center' }}>
            {away.name}
          </span>
        </div>
      </div>

      <div className="gc-row gc-gap-md" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--rule)', flexWrap: 'wrap' }}>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>{match.stadium}</span>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>{match.city}</span>
      </div>
    </div>
  )
}

// ─── ActionCard ──────────────────────────────────────────────────────────────
function ActionCard({ eyebrow, title, body, cta, onClick, disabled, danger }) {
  return (
    <div
      className="gc-card gc-hover"
      onClick={!disabled ? onClick : undefined}
      style={{ padding: 24, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? .6 : 1, borderLeft: danger ? '3px solid var(--red)' : undefined }}
    >
      <Eyebrow tone={danger ? 'red' : 'default'}>{eyebrow}</Eyebrow>
      <h4 style={{ fontFamily: 'var(--f-display)', fontSize: 28, margin: '8px 0 8px', lineHeight: .9, textTransform: 'uppercase' }}>{title}</h4>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>{body}</p>
      <span
        className="gc-link"
        style={{ marginTop: 14, display: 'inline-block', color: disabled ? 'var(--muted)' : danger ? 'var(--red)' : 'var(--ink)', borderColor: disabled ? 'var(--rule)' : danger ? 'var(--red)' : 'var(--ink)' }}
      >
        {cta}
      </span>
    </div>
  )
}

// ─── TicketDetailPage ─────────────────────────────────────────────────────────
export default function TicketDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { ticket, history, isLoading } = useTicket(id)
  const [showTransfer, setTransfer] = useState(false)
  const [showRefund,   setRefund]   = useState(false)

  if (isLoading) {
    return (
      <PageShell>
        <div style={{ padding: '80px 56px', textAlign: 'center' }}>
          <Eyebrow>CARGANDO</Eyebrow>
        </div>
      </PageShell>
    )
  }

  if (!ticket) {
    return (
      <PageShell>
        <div style={{ padding: '60px 56px' }}>
          <Eyebrow>ENTRADA NO ENCONTRADA</Eyebrow>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 80, margin: '10px 0 20px', lineHeight: .85 }}>
            Entrada no<br />encontrada.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 440, lineHeight: 1.5, marginBottom: 24 }}>
            No existe una entrada con id "{id}". Volvé a tus pases y elegí otra.
          </p>
          <Btn onClick={() => navigate('/tickets')}>← Mis Entradas</Btn>
        </div>
        <Footer />
      </PageShell>
    )
  }

  const match  = matches.find(m => m.id === ticket.matchId)
  const sector = getSector(ticket.sector)

  const isConfirmed = ticket.status === 'confirmed'
  const isReserved  = ticket.status === 'reserved'
  const isExpired   = ticket.status === 'expired'
  const isInactive  = ticket.status === 'transferred' || ticket.status === 'refunded'

  return (
    <PageShell>
      {showTransfer && <TransferModal ticket={ticket} onClose={() => setTransfer(false)} />}
      {showRefund   && <RefundModal   ticket={ticket} onClose={() => setRefund(false)} />}

      {/* breadcrumb */}
      <div style={{ padding: '20px 56px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="gc-row gc-gap-sm">
          <span className="gc-link" onClick={() => navigate('/tickets')}>← Mis Entradas</span>
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>/ #{ticket.id}</span>
        </div>
        {match && (
          <span className="gc-link" onClick={() => navigate(`/match/${match.id}`)}>Ver match centre →</span>
        )}
      </div>

      {/* boarding pass hero */}
      {match && (
        <div style={{ padding: '24px 56px 0' }}>
          <BoardingPassHero ticket={ticket} match={match} sector={sector} />
        </div>
      )}

      {/* actions */}
      <SectionHead
        num="01"
        label={`↘ ACCIONES · ${ticket.status.toUpperCase()}`}
        title="Qué podés hacer"
      />
      <div style={{ padding: '22px 56px 0' }}>
        {isConfirmed && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
            <ActionCard
              eyebrow="↘ TRANSFERIR"
              title="A otro usuario del Hub"
              body="Reasigná la entrada a una persona registrada. Tu QR se invalida y se genera uno nuevo a su nombre."
              cta="Transferir →"
              onClick={() => setTransfer(true)}
            />
            <ActionCard
              eyebrow="↘ REEMBOLSO"
              title="Recuperar el monto"
              body="Hasta 72h antes del partido. Se descuenta un 10% por cargos administrativos. Crédito a Visa •••• 4242."
              cta="Solicitar reembolso →"
              onClick={() => setRefund(true)}
              danger
            />
            <ActionCard
              eyebrow="↘ DESCARGAR"
              title="PDF imprimible"
              body="Versión imprimible con QR de alta resolución. Lo podés llevar en físico al estadio."
              cta="Próximamente"
              disabled
            />
          </div>
        )}

        {isReserved && (
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 16, padding: 32, position: 'relative', overflow: 'hidden' }}>
            <Floodlight size={500} color="var(--gold)" opacity={.3} top={-200} right={-100} />
            <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 28, position: 'relative' }}>
              <div className="gc-col gc-gap-sm">
                <Eyebrow tone="onDark">↘ TIEMPO RESTANTE PARA PAGAR</Eyebrow>
                <ReserveCountdown expiresAt={ticket.expiresAt} big />
                <span className="gc-mono" style={{ fontSize: 12, color: 'rgba(247,241,223,.6)', letterSpacing: '.08em' }}>
                  Pasado el tiempo la reserva se libera automáticamente.
                </span>
              </div>
              <div className="gc-col gc-gap-sm" style={{ alignItems: 'flex-end' }}>
                <Btn style={{ background: 'var(--gold)', color: 'var(--gold-ink)' }}>
                  Completar pago → USD {ticket.priceUSD}
                </Btn>
                <Btn kind="ghost" style={{ borderColor: 'rgba(247,241,223,.3)', color: 'var(--paper)' }}>
                  Cancelar reserva
                </Btn>
              </div>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="gc-card" style={{ padding: 28, borderLeft: '4px solid var(--red)' }}>
            <Eyebrow tone="red">↘ RESERVA EXPIRADA</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: '8px 0 6px', lineHeight: .9 }}>El cupo se liberó.</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5 }}>
              Esta reserva no fue pagada dentro de los 15 minutos. Si querés ir al partido tendrás que iniciar una nueva reserva (si aún hay disponibilidad).
            </p>
            <div className="gc-row gc-gap-md" style={{ marginTop: 16 }}>
              <Btn onClick={() => navigate('/tickets')}>← Ver entradas</Btn>
              {match && <Btn kind="ghost" onClick={() => navigate(`/match/${match.id}`)}>Match centre</Btn>}
            </div>
          </div>
        )}

        {isInactive && (
          <div className="gc-card" style={{ padding: 28, borderLeft: '4px solid var(--muted)' }}>
            <Eyebrow>↘ ENTRADA INACTIVA</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: '8px 0 6px', lineHeight: .9 }}>
              {ticket.status === 'transferred'
                ? `Transferida a ${ticket.transferredTo?.name || 'otro usuario'}`
                : 'Reembolsada'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5 }}>
              Tu acceso a este QR fue revocado. Mantenemos el registro histórico para auditoría — ver línea de tiempo abajo.
            </p>
          </div>
        )}
      </div>

      {/* audit timeline */}
      <SectionHead num="02" label="↘ HISTORIAL DE TRANSICIONES" title="Línea de tiempo" />
      <div style={{ padding: '22px 56px 0' }}>
        <TicketTimeline events={history} correlationId={ticket.correlationId} />
      </div>

      {/* match context */}
      {match && (
        <>
          <SectionHead
            num="03"
            label="↘ EL PARTIDO"
            title="Contexto del partido"
            right={<span className="gc-link" onClick={() => navigate(`/match/${match.id}`)}>Abrir match centre →</span>}
          />
          <div style={{ padding: '22px 56px 0' }}>
            <MatchContextCard match={match} />
          </div>
        </>
      )}

      <Footer />
    </PageShell>
  )
}
