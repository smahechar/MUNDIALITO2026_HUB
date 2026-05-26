import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell, PageHeader, Floodlight } from '@/components/shared/Layout'
import { Eyebrow, Pill, Btn, Flag } from '@/components/shared/atoms'
import { FreshnessBadge } from '@/components/matches/MatchCard'
import { matchesService } from '@/services/matches.service'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/config/routes'

// ─── ReasonChip ──────────────────────────────────────────────────────────────
function ReasonChip({ reason }) {
  const isFav = reason.kind === 'favorite_home' || reason.kind === 'favorite_away'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: isFav ? 'var(--gold)' : 'var(--paper-2)',
      color: isFav ? 'var(--gold-ink)' : 'var(--ink)',
      fontFamily: 'var(--f-sub)', fontWeight: 800,
      fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
    }}>
      {isFav ? '★' : '◎'} {reason.label}
    </span>
  )
}

// ─── AgendaRow ───────────────────────────────────────────────────────────────
function AgendaRow({ match, onOpen }) {
  const isLive = match.status === 'live' || match.status === 'halftime'
  const date   = match.kickoff ? new Date(match.kickoff) : null

  return (
    <div
      className="gc-card gc-hover"
      style={{ padding: 18, cursor: 'pointer', display: 'grid',
               gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}
      onClick={onOpen}
    >
      <div style={{ minWidth: 0 }}>
        <div className="gc-row gc-gap-sm" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
          <Eyebrow>{match.phase}</Eyebrow>
          <FreshnessBadge match={match} compact />
          {(match.reasons || []).map((r, i) => <ReasonChip key={i} reason={r} />)}
        </div>

        <div className="gc-row gc-gap-md" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Flag code={match.home} size={28} />
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 28, lineHeight: 1, textTransform: 'uppercase' }}>
            {match.home}
            <span style={{ color: 'var(--muted)', fontSize: '0.6em', padding: '0 10px' }}>×</span>
            {match.away}
          </span>
          <Flag code={match.away} size={28} />
        </div>

        <div className="gc-mono" style={{ fontSize: 11, opacity: .65, marginTop: 8, letterSpacing: '.06em' }}>
          {match.stadium} · {match.city}
          {date && ` · ${date.toLocaleString('es-CO', {
            weekday: 'short', day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit',
          })}`}
        </div>
      </div>

      <div className="gc-col" style={{ alignItems: 'flex-end', gap: 8 }}>
        {isLive
          ? <Pill live>{match.minute || 'LIVE'}</Pill>
          : match.status === 'final'
            ? <Pill tone="ink">FT · {match.homeScore}–{match.awayScore}</Pill>
            : <Pill>Próximo</Pill>}
        <span className="gc-mono" style={{ fontSize: 10, opacity: .5, letterSpacing: '.08em' }}>
          PRIORIDAD {match.priority ?? 0}
        </span>
      </div>
    </div>
  )
}

// ─── AgendaPage ──────────────────────────────────────────────────────────────
export default function AgendaPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    matchesService.getAgenda()
      .then(data => { if (alive) setItems(Array.isArray(data) ? data : []) })
      .catch(err => { if (alive) setError(err.message ?? 'Error al cargar la agenda') })
      .finally(()  => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const noPrefs = !user?.favoriteTeams?.length && !user?.city

  return (
    <PageShell>
      <PageHeader
        kicker={`AGENDA · ${user?.handle ?? ''}`}
        title={<>Tu <span style={{ color: 'var(--gold)' }}>agenda.</span></>}
        lede={
          noPrefs
            ? 'Sin preferencias configuradas — mostramos los próximos partidos. Editá tus favoritas en Perfil.'
            : 'Partidos relevantes para vos: tus selecciones favoritas y los que se juegan en tu ciudad.'
        }
      />

      <div style={{ padding: '0 56px 56px', position: 'relative' }}>
        <Floodlight size={420} color="var(--gold)" opacity={.12} top={-180} right={-80} />

        {loading && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Cargando agenda…</div>
        )}

        {!loading && error && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--red)' }}>{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="gc-card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, opacity: .35, marginBottom: 12 }}>📅</div>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 32, lineHeight: .9, margin: '0 0 10px' }}>
              No hay partidos en tu agenda.
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 440, margin: '0 auto 18px' }}>
              {noPrefs
                ? 'Configurá tus selecciones favoritas en tu perfil para ver una agenda personalizada.'
                : 'No hay próximos partidos con tus selecciones o en tu ciudad por ahora.'}
            </p>
            <Btn onClick={() => navigate(ROUTES.PROFILE)}>Editar preferencias →</Btn>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="gc-col gc-gap-md">
            {items.map(m => (
              <AgendaRow
                key={m.id}
                match={m}
                onOpen={() => navigate(`/match/${m.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
