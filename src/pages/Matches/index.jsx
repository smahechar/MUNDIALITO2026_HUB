import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell, PageHeader, Band, Floodlight } from '@/components/shared/Layout'
import { Eyebrow, Pill, Btn, SectionHead } from '@/components/shared/atoms'
import {
  DateScrubber, StatusChips, SpotlightMatch,
  DayBlock, StadiumMiniCard,
} from '@/components/matches/MatchCard'
import { useMatches } from '@/hooks/useMatches'
import { stadiums } from '@/mocks/data/matches'

export default function MatchesPage() {
  const navigate = useNavigate()
  const { matches: allMatches, isLoading, error } = useMatches()

  const [md,      setMd]      = useState('ALL')
  const [status,  setStatus]  = useState('all')
  const [group,   setGroup]   = useState('all')
  const [team,    setTeam]    = useState('all')
  const [stadium, setStadium] = useState('all')

  const availableDays = useMemo(() => {
  const buckets = {}

  allMatches.forEach((m) => {
    if (!m.kickoff) return

    const key = String(m.kickoff).slice(0, 10)

    if (!buckets[key]) {
      buckets[key] = {
        key,
        count: 0,
        hasLive: false,
      }
    }

    buckets[key].count += 1

    if (m.status === 'live' || m.status === 'halftime') {
      buckets[key].hasLive = true
    }
  })

  return Object.values(buckets)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((day, index) => {
      const date = new Date(`${day.key}T12:00:00`)

      return {
        key: day.key,
        label: `Match Day ${index + 1} · ${day.count}`,
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
        }),
        group: day.hasLive ? 'live' : index === 0 ? 'next' : 'future',
      }
    })
}, [allMatches])

useEffect(() => {
  if (md === 'ALL' && availableDays.length > 0) {
    setMd(availableDays[0].key)
  }
}, [availableDays, md])

  // contadores para los chips
  const counts = useMemo(() => ({
    all:      allMatches.length,
    live:     allMatches.filter(m => m.status === 'live' || m.status === 'halftime').length,
    upcoming: allMatches.filter(m => m.status === 'upcoming').length,
    final:    allMatches.filter(m => m.status === 'final').length,
  }), [allMatches])

  // all unique teams and stadiums in the data (for filter dropdowns)
  const allTeams    = useMemo(() => [...new Set(allMatches.flatMap(m => [m.home, m.away]))].sort(), [allMatches])
  const allStadiums = useMemo(() => [...new Set(allMatches.map(m => m.stadium))].sort(), [allMatches])

  // lista filtrada
  const filtered = useMemo(() => allMatches.filter(m => {
    const matchDate = m.kickoff ? String(m.kickoff).slice(0, 10) : ''

    if (md !== 'ALL' && matchDate !== md) return false

    if (status === 'live'     && !(m.status === 'live' || m.status === 'halftime')) return false
    if (status === 'upcoming' && m.status !== 'upcoming') return false
    if (status === 'final'    && m.status !== 'final')    return false
    if (group   !== 'all'     && m.group   !== group)     return false
    if (team    !== 'all'     && m.home    !== team && m.away !== team) return false
    if (stadium !== 'all'     && m.stadium !== stadium)   return false

    return true
  }), [md, status, group, team, stadium, allMatches])

  // agrupados por fecha
  const grouped = useMemo(() => {
    const buckets = {}
    filtered.forEach(m => {
      const key = m.kickoff.slice(0, 10)
      buckets[key] = buckets[key] || []
      buckets[key].push(m)
    })
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, ms]) => ({
        key: k,
        date: new Date(k + 'T12:00:00'),
        matches: ms.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)),
      }))
  }, [filtered])

  // spotlight: primero live, luego próximo, luego el primero que haya
  const spotlight = useMemo(() =>
    filtered.find(m => m.status === 'live' || m.status === 'halftime') ||
    filtered.find(m => m.status === 'upcoming') ||
    filtered[0]
  , [filtered])

  // estadios únicos del filtro actual
  const venuesInWindow = useMemo(() => {
    const seen = new Set()
    const result = []
    filtered.forEach(m => {
      if (!seen.has(m.stadium) && stadiums[m.stadium]) {
        seen.add(m.stadium)
        result.push({ name: m.stadium, info: stadiums[m.stadium] })
      }
    })
    return result
  }, [filtered])

  return (
    <PageShell>

      {/* ── CABECERA ── */}
      <PageHeader
        kicker={`MODULE · FIXTURE · ${counts.all} MATCHES TOTAL`}
        title={<>Fixture<br />completo.</>}
        lede="64 matches across 12 match days, 6 groups, and 16 host stadiums. Filter by match day, status, or group. Click any row to enter the broadcast-style match centre."
        action={
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost">Mi agenda</Btn>
            <Btn>Notificarme</Btn>
          </div>
        }
      />

      {/* ── BARRA DE JORNADAS (DateScrubber) ── */}
      <div style={{ padding: '0 56px' }}>
        <DateScrubber
          active={md}
          onSelect={setMd}
          days={availableDays}
        />
      </div>

      {/* ── FILTROS: estado + grupo + selección + estadio ── */}
      <div style={{ padding: '20px 56px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Row 1: status + group */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <StatusChips
            value={status}
            onChange={setStatus}
            options={[
              { id: 'all',      label: 'TODOS',      count: counts.all },
              { id: 'live',     label: 'EN VIVO',    count: counts.live },
              { id: 'upcoming', label: 'PRÓXIMOS',   count: counts.upcoming },
              { id: 'final',    label: 'TERMINADOS', count: counts.final },
            ]}
          />
          <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
            <Eyebrow>GROUP</Eyebrow>
            <div className="gc-row gc-gap-xs">
              {['all', 'A', 'B', 'C', 'D', 'E', 'F'].map(g => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  style={{
                    border: 0,
                    background: group === g ? 'var(--ink)' : 'transparent',
                    color:      group === g ? 'var(--paper)' : 'var(--ink)',
                    width: 32, height: 32, borderRadius: 6, cursor: 'pointer',
                    fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 12,
                    letterSpacing: '.06em', textTransform: 'uppercase',
                    outline: group === g ? 'none' : '1px solid var(--rule)',
                    transition: 'background .15s ease, color .15s ease',
                  }}
                >
                  {g === 'all' ? 'ALL' : g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: selección + estadio */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Eyebrow style={{ flexShrink: 0 }}>FILTRAR POR</Eyebrow>
          <select
            value={team}
            onChange={e => setTeam(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              border: '1px solid var(--rule)', background: 'var(--paper-2)',
              color: 'var(--ink)', fontFamily: 'var(--f-sub)', fontWeight: 700,
            }}
          >
            <option value="all">SELECCIÓN — TODAS</option>
            {allTeams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={stadium}
            onChange={e => setStadium(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              border: '1px solid var(--rule)', background: 'var(--paper-2)',
              color: 'var(--ink)', fontFamily: 'var(--f-sub)', fontWeight: 700,
            }}
          >
            <option value="all">ESTADIO — TODOS</option>
            {allStadiums.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {(team !== 'all' || stadium !== 'all') && (
            <button
              onClick={() => { setTeam('all'); setStadium('all') }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)',
                textDecoration: 'underline',
              }}
            >
              Limpiar filtros
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 11, opacity: .5 }}>
            {filtered.length} de {counts.all} partidos
          </span>
        </div>
      </div>

      {/* ── 01 · SPOTLIGHT MATCH ── */}
      {spotlight && (
        <>
          <SectionHead
            num="01"
            label="↘ SPOTLIGHT · FEATURED OF THE WINDOW"
            title="Spotlight match"
            right={
              <span
                className="gc-link"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/match/${spotlight.id}`)}
              >
                Abrir match centre →
              </span>
            }
          />
          <div style={{ padding: '22px 56px 0' }}>
            <SpotlightMatch
              match={spotlight}
              onClick={() => navigate(`/match/${spotlight.id}`)}
            />
          </div>
        </>
      )}

      {/* ── 02 · LISTA DE PARTIDOS POR FECHA ── */}
      <SectionHead
        num="02"
        label={`↘ ${filtered.length} MATCHES · ${
          md === 'ALL'
            ? 'FULL CALENDAR'
            : new Date(`${md}T12:00:00`).toLocaleDateString('es-CO', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
        }`}
        title="Matches"
        right={
          <span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.12em' }}>
            RF-13 · RF-14 · RF-15
          </span>
        }
      />

      <div style={{ padding: '22px 56px 0' }}>
        {isLoading ? (
          <div className="gc-card" style={{ padding: 56, textAlign: 'center' }}>
            <Eyebrow>CARGANDO</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 8px', lineHeight: .9 }}>
              Un momento…
            </h3>
          </div>
        ) : error ? (
          <div className="gc-card" style={{ padding: 56, textAlign: 'center' }}>
            <Eyebrow>ERROR API</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 8px', lineHeight: .9 }}>
              No se pudieron cargar los partidos
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              {error.message}
            </p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="gc-card" style={{ padding: 56, textAlign: 'center' }}>
            <Eyebrow>NO MATCHES</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 8px', lineHeight: .9 }}>
              No matches with those filters
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              Hay {allMatches.length} partidos cargados, pero los filtros actuales no muestran ninguno.
            </p>
          </div>
        ) : (
          grouped.map(g => (
            <DayBlock
              key={g.key}
              date={g.date}
              matches={g.matches}
              onNavigate={navigate}
            />
          ))
        )}
      </div>

      {/* ── 03 · ESTADIOS DE ESTA VENTANA ── */}
      {venuesInWindow.length > 0 && (
        <>
          <SectionHead
            num="03"
            label="↘ HOST VENUES · IN THIS WINDOW"
            title="Stadiums"
          />
          <div style={{ padding: '22px 56px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {venuesInWindow.map(({ name, info }) => (
              <StadiumMiniCard key={name} name={name} info={info} />
            ))}
          </div>
        </>
      )}

      {/* ── CTA BAND · nunca te pierdas un pitazo ── */}
      <Band tone="ink" style={{ marginTop: 80 }}>
        <Floodlight size={600} color="var(--gold)" opacity={.22} top={-200} right={-100} />
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 24, position: 'relative' }}>
          <div>
            <Eyebrow tone="onDark">↗ ACTIVATE NOTIFICATIONS</Eyebrow>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 72, margin: '8px 0 0', lineHeight: .85, textTransform: 'uppercase' }}>
              Never miss<br />a kickoff.
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(247,241,223,.7)', maxWidth: 480, marginTop: 12 }}>
              Pick the matches you care about. Te avisamos 30 minutos antes del pitazo inicial, cuando hay goles, en el medio tiempo y cuando el xG de tu equipo supera 1.5.
            </p>
          </div>
          <button
            className="gc-btn"
            style={{ background: 'var(--gold)', color: 'var(--gold-ink)', flexShrink: 0 }}
            onClick={() => navigate('/profile')}
          >
            Configurar alertas
          </button>
        </div>
      </Band>

    </PageShell>
  )
}
