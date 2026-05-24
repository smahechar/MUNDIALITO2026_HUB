import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell, Floodlight, Band } from '@/components/shared/Layout'
import { Eyebrow, Flag, Btn } from '@/components/shared/atoms'
import {
  FormChips, MatchHero, MatchTabs, MatchTimeline,
  MatchStats, MatchLineups, StadiumCard,
  PredictionBar, H2HCard, MetaCard,
} from '@/components/matches/MatchDetail'
import { useMatch, useMatchDetail } from '@/hooks/useMatches'
import { byCode } from '@/mocks/data/nations'
import { matches } from '@/mocks/data/matches'

const TABS = [
  { id: 'summary',  label: 'Resumen'       },
  { id: 'timeline', label: 'Timeline'      },
  { id: 'stats',    label: 'Estadísticas'  },
  { id: 'lineups',  label: 'Alineaciones'  },
  { id: 'venue',    label: 'Sede'          },
  { id: 'h2h',      label: 'Historial'     },
]

// ─── StatsTeaser · compact 3-row preview ─────────────────────────────────────
function StatsTeaser({ stats, onMore }) {
  const rows = [
    { l: 'POSESIÓN',      k: 'possession',    pct: true  },
    { l: 'TIROS AL ARCO', k: 'shotsOnTarget', pct: false },
    { l: 'PASES',         k: 'passes',        pct: false },
  ]
  return (
    <div className="gc-card" style={{ padding: 28 }}>
      <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'baseline' }}>
        <Eyebrow>STATS · TEASER</Eyebrow>
        <span className="gc-link" onClick={onMore} style={{ fontSize: 11, cursor: 'pointer' }}>Ver completo →</span>
      </div>
      <div className="gc-col gc-gap-md">
        {rows.map(r => {
          const [h, a] = stats[r.k]
          const total  = r.pct ? 100 : h + a
          const hPct   = total > 0 ? (h / total) * 100 : 50
          return (
            <div key={r.k}>
              <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 6, alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, lineHeight: 1 }}>{h}{r.pct && '%'}</span>
                <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.1em' }}>{r.l}</span>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, lineHeight: 1 }}>{a}{r.pct && '%'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `${hPct}% ${100 - hPct}%`, height: 6, background: 'var(--paper-2)', borderRadius: 999, overflow: 'hidden', gap: 2 }}>
                <div style={{ background: 'var(--ink)' }} />
                <div style={{ background: 'var(--red)' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── SummaryTab ───────────────────────────────────────────────────────────────
function SummaryTab({ match, detail, home, away, onTab }) {
  const isLive     = match.status === 'live' || match.status === 'halftime'
  const isFinal    = match.status === 'final'
  const isUpcoming = !isLive && !isFinal

  const kickoffLabel = new Date(match.kickoff).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="gc-col gc-gap-md">

      {/* key events strip (live/final) */}
      {!isUpcoming && detail.events?.length > 0 && (
        <div className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="gc-row" style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)', justifyContent: 'space-between', alignItems: 'center' }}>
            <Eyebrow>↘ MOMENTUM · KEY EVENTS</Eyebrow>
            <span className="gc-link" onClick={() => onTab('timeline')} style={{ fontSize: 11, cursor: 'pointer' }}>Timeline completo →</span>
          </div>
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {detail.events.filter(e => e.type === 'goal').slice(0, 6).map((e, i) => (
              <div key={i} className="gc-col" style={{
                padding: 12, background: 'var(--paper-2)', borderRadius: 8,
                borderLeft: `3px solid ${e.team === 'home' ? 'var(--ink)' : 'var(--red)'}`,
              }}>
                <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 20 }}>{e.minute}</span>
                  <Flag code={e.team === 'home' ? home.code : away.code} size={16} />
                  <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>GOAL</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{e.player}</span>
                <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{e.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* fan prediction (upcoming) */}
      {isUpcoming && detail.predictions && (
        <PredictionBar pct={detail.predictions} homeName={home.name} awayName={away.name} />
      )}

      {/* stats teaser + meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {detail.stats ? (
          <StatsTeaser stats={detail.stats} onMore={() => onTab('stats')} />
        ) : (
          <div className="gc-card" style={{ padding: 28 }}>
            <Eyebrow>STATS WILL APPEAR AT KICKOFF</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 38, margin: '8px 0 4px', lineHeight: .9 }}>
              Posesión, tiros, pases, faltas.
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              Once the referee blows the first whistle, broadcast-style stat bars compare both sides minute by minute.
            </p>
          </div>
        )}
        <MetaCard detail={detail} />
      </div>

      {/* form chips */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="gc-card" style={{ padding: 24 }}>
          <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <Eyebrow>FORM · LAST 5</Eyebrow>
            <Flag code={home.code} size={18} />
          </div>
          <div className="gc-row gc-gap-md" style={{ alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 38, lineHeight: .9, textTransform: 'uppercase' }}>{home.name}</span>
            <FormChips form={detail.formHome || ['—','—','—','—','—']} />
          </div>
        </div>
        <div className="gc-card" style={{ padding: 24 }}>
          <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <Eyebrow>FORM · LAST 5</Eyebrow>
            <Flag code={away.code} size={18} />
          </div>
          <div className="gc-row gc-gap-md" style={{ alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 38, lineHeight: .9, textTransform: 'uppercase' }}>{away.name}</span>
            <FormChips form={detail.formAway || ['—','—','—','—','—']} />
          </div>
        </div>
      </div>

      {/* venue snapshot */}
      <StadiumCard
        name={match.stadium}
        city={match.city}
        matchTime={kickoffLabel}
        attendance={detail.attendance}
      />
    </div>
  )
}

// ─── MatchDetailPage ──────────────────────────────────────────────────────────
export default function MatchDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [tab, setTab] = useState('summary')

  const { match, isLoading: matchLoading }   = useMatch(id)
  const { detail, isLoading: detailLoading } = useMatchDetail(id)

  if (matchLoading || detailLoading) {
    return (
      <PageShell>
        <div style={{ padding: '80px 56px', textAlign: 'center' }}>
          <span className="gc-mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.1em' }}>LOADING MATCH…</span>
        </div>
      </PageShell>
    )
  }

  if (!match) {
    return (
      <PageShell>
        <div style={{ padding: '48px 56px' }}>
          <Eyebrow>MATCH NOT FOUND</Eyebrow>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 96, lineHeight: .85, margin: '10px 0 18px', textTransform: 'uppercase' }}>
            Match<br />not found.
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 480, marginBottom: 24 }}>
            No match with id "{id}". Head back to the fixture list.
          </p>
          <Btn onClick={() => navigate('/fixture')}>← Fixture</Btn>
        </div>
      </PageShell>
    )
  }

  const home       = byCode[match.home]
  const away       = byCode[match.away]
  const idx        = matches.findIndex(m => m.id === id)
  const prev       = idx > 0 ? matches[idx - 1] : null
  const next       = idx < matches.length - 1 ? matches[idx + 1] : null

  return (
    <PageShell>

      {/* Breadcrumb */}
      <div style={{ padding: '20px 56px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gc-row gc-gap-sm">
          <span className="gc-link" onClick={() => navigate('/fixture')} style={{ cursor: 'pointer' }}>← Fixture</span>
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>/ {match.id.toUpperCase()}</span>
        </div>
        <div className="gc-row gc-gap-sm">
          {prev && (
            <Btn kind="ghost" onClick={() => navigate(`/match/${prev.id}`)} style={{ padding: '8px 14px', fontSize: 11 }}>
              ← {byCode[prev.home]?.code} v {byCode[prev.away]?.code}
            </Btn>
          )}
          {next && (
            <Btn kind="ghost" onClick={() => navigate(`/match/${next.id}`)} style={{ padding: '8px 14px', fontSize: 11 }}>
              {byCode[next.home]?.code} v {byCode[next.away]?.code} →
            </Btn>
          )}
        </div>
      </div>

      <MatchHero match={match} detail={detail} />

      <MatchTabs tabs={TABS} active={tab} onSelect={setTab} />

      <div style={{ padding: '36px 56px 0' }}>
        {tab === 'summary'  && <SummaryTab match={match} detail={detail} home={home} away={away} onTab={setTab} />}
        {tab === 'timeline' && <MatchTimeline events={detail?.events || []} homeCode={home.code} awayCode={away.code} />}
        {tab === 'stats'    && <MatchStats stats={detail?.stats} />}
        {tab === 'lineups'  && <MatchLineups home={detail?.lineupHome} away={detail?.lineupAway} homeNation={home} awayNation={away} />}
        {tab === 'venue'    && (
          <StadiumCard
            name={match.stadium}
            city={match.city}
            matchTime={new Date(match.kickoff).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            attendance={detail?.attendance}
          />
        )}
        {tab === 'h2h'      && <H2HCard h2h={detail?.h2h} />}
      </div>

      {/* CTA band — upcoming matches */}
      {match.status === 'upcoming' && (
        <Band tone="red" style={{ marginTop: 64 }}>
          <Floodlight size={500} color="var(--gold)" opacity={.22} top={-200} left={-100} />
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', position: 'relative', gap: 24 }}>
            <div>
              <Eyebrow tone="onGreen">↗ POLLAS · CIERRA AL PITAZO INICIAL</Eyebrow>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 72, margin: '6px 0 0', lineHeight: .85, textTransform: 'uppercase' }}>
                Hacé tu predicción.
              </h2>
              <p style={{ fontSize: 14, opacity: .92, maxWidth: 480, marginTop: 10 }}>
                Marcador exacto = 30 pts · ganador = 10 pts · cierre automático al pitazo inicial.
              </p>
            </div>
            <Btn kind="primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }} onClick={() => navigate('/pools')}>
              Ir a pollas
            </Btn>
          </div>
        </Band>
      )}

      <div style={{ height: 80 }} />
    </PageShell>
  )
}
