import { useState, useEffect } from 'react'
import { Flag, Pill, Eyebrow, Btn } from '@/components/shared/atoms'
import { Floodlight, Watermark } from '@/components/shared/Layout'



function getTeam(code, fallbackName) {
  const safeCode = String(code ?? '').trim().toUpperCase()

  return {
    code: safeCode || 'TBD',
    name: fallbackName || safeCode || 'Por definir',
  }
}
function upper(value, fallback = '—') {
  return String(value ?? fallback).toUpperCase()
}

function getSafeStadium(match) {
  return {
    name: match?.stadium || 'Estadio por definir',
    city: match?.city || 'Ciudad por definir',
    country: match?.country || '',
    cap: match?.capacity || match?.cap || null,
    roof: match?.roof || 'Dato no disponible',
    surface: match?.surface || 'Dato no disponible',
    opened: match?.opened || '—',
  }
}
// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ target }) {
  const [diff, setDiff] = useState(target - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  const t   = Math.max(0, Math.floor(diff / 1000))
  const d   = Math.floor(t / 86400)
  const h   = Math.floor((t % 86400) / 3600)
  const m   = Math.floor((t % 3600) / 60)
  const s   = t % 60
  const pad = n => String(n).padStart(2, '0')
  return (
    <span className="gc-mono" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.1em' }}>
      {d > 0 && `${d}D `}{pad(h)}:{pad(m)}:{pad(s)}
    </span>
  )
}

// ─── FormChips · W/D/L last 5 ────────────────────────────────────────────────
export function FormChips({ form }) {
  const bgMap = { W: 'var(--green)', D: 'var(--muted)', L: 'var(--red)', '—': 'var(--paper-2)' }
  const fgMap = { W: 'var(--paper)', D: 'var(--paper)', L: 'var(--paper)', '—': 'var(--muted)' }
  return (
    <div className="gc-row gc-gap-xs">
      {form.map((r, i) => (
        <span key={i} style={{
          width: 22, height: 22, borderRadius: 4,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: bgMap[r] || 'var(--paper-2)',
          color:      fgMap[r] || 'var(--muted)',
          fontFamily: 'var(--f-sub)', fontSize: 11, fontWeight: 800,
        }}>{r}</span>
      ))}
    </div>
  )
}

// ─── MatchHero · broadcast-style header ──────────────────────────────────────
export function MatchHero({ match, detail }) {
  const home = getTeam(match.home, match.homeName)
  const away = getTeam(match.away, match.awayName)
  const stadiumInfo = getSafeStadium(match)
  const isLive     = match.status === 'live' || match.status === 'halftime'
  const isFinal    = match.status === 'final'

  const kickoffLabel = new Date(match.kickoff).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <section style={{ position: 'relative', paddingBottom: 24, overflow: 'hidden' }}>
      <Floodlight size={720} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.35} top={-260} left="30%" blend="multiply" />
      <Floodlight size={560} color="color-mix(in oklab, var(--red) 50%, transparent)"  opacity={.28} top={-180} right={-120} blend="multiply" />
      <Floodlight size={640} color="color-mix(in oklab, var(--green) 55%, transparent)" opacity={.22} bottom={-280} left={-160} blend="multiply" />
      <Watermark style={{ top: 180, right: -20 }}>{match.group || 'MD'}</Watermark>

      <div style={{ padding: '20px 56px 8px', position: 'relative', zIndex: 2 }}>
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow>↘ {match.phase || 'Fase por definir'} · {stadiumInfo.country || stadiumInfo.city}</Eyebrow>
          <div className="gc-row gc-gap-sm">
            {isLive
              ? <Pill live>{match.minute || 'LIVE'}</Pill>
              : isFinal
                ? <Pill tone="ink">FT</Pill>
                : <Pill>{kickoffLabel}</Pill>}
            <Pill>Group {match.group}</Pill>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 56px 0', position: 'relative', zIndex: 1 }}>
        <div className="gc-rule-double" />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)',
        gap: 28, alignItems: 'center', padding: '32px 56px',
        position: 'relative', zIndex: 1,
      }}>
        {/* HOME */}
        <div className="gc-col gc-gap-sm" style={{ alignItems: 'flex-end', textAlign: 'right', minWidth: 0 }}>
          <Flag code={home.code} size={120} />
          <span className="gc-mono" style={{ fontSize: 13, letterSpacing: '.1em', fontWeight: 700, color: 'var(--muted)' }}>{home.code}</span>
          <h1 style={{
            fontFamily: 'var(--f-display)', fontSize: 'clamp(34px, 5vw, 72px)',
            lineHeight: .88, margin: '2px 0 8px', textTransform: 'uppercase', wordBreak: 'break-word',
          }}>{home.name}</h1>
          {detail?.formHome && <FormChips form={detail.formHome} />}
          {detail?.lineupHome && (
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
              {detail.lineupHome.manager} · {detail.lineupHome.formation}
            </span>
          )}
        </div>

        {/* SCORE */}
        <div className="gc-col" style={{ alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
          {match.homeScore !== null ? (
            <div className="gc-row" style={{ gap: 'clamp(8px, 1.5vw, 32px)', alignItems: 'baseline' }}>
              <span className={`gc-score${isLive ? ' gc-score-pop' : ''}`} style={{ fontSize: 'clamp(80px, 11vw, 168px)' }}>{match.homeScore}</span>
              <span className="gc-mono" style={{ fontSize: 'clamp(28px, 4vw, 56px)', color: 'var(--muted)' }}>—</span>
              <span className={`gc-score${isLive ? ' gc-score-pop' : ''}`} style={{ fontSize: 'clamp(80px, 11vw, 168px)' }}>{match.awayScore}</span>
            </div>
          ) : (
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(60px, 8vw, 116px)', color: 'var(--muted)', lineHeight: 1 }}>vs</span>
          )}
          <div className="gc-mono" style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.12em', marginTop: 10, textTransform: 'uppercase' }}>
            {stadiumInfo.name} · {stadiumInfo.city}
            {stadiumInfo.cap ? ` · CAP. ${stadiumInfo.cap.toLocaleString()}` : ''}
          </div>
        </div>

        {/* AWAY */}
        <div className="gc-col gc-gap-sm" style={{ alignItems: 'flex-start', textAlign: 'left', minWidth: 0 }}>
          <Flag code={away.code} size={120} />
          <span className="gc-mono" style={{ fontSize: 13, letterSpacing: '.1em', fontWeight: 700, color: 'var(--muted)' }}>{away.code}</span>
          <h1 style={{
            fontFamily: 'var(--f-display)', fontSize: 'clamp(34px, 5vw, 72px)',
            lineHeight: .88, margin: '2px 0 8px', textTransform: 'uppercase', wordBreak: 'break-word',
          }}>{away.name}</h1>
          {detail?.formAway && <FormChips form={detail.formAway} />}
          {detail?.lineupAway && (
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
              {detail.lineupAway.manager} · {detail.lineupAway.formation}
            </span>
          )}
        </div>
      </div>

      {!isLive && !isFinal && match.homeScore === null && (
        <div style={{ padding: '4px 56px 32px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div className="gc-glass" style={{ padding: '18px 28px', display: 'inline-flex', alignItems: 'center', gap: 18 }}>
            <Eyebrow tone="red" style={{ whiteSpace: 'nowrap' }}>↘ KICKOFF EN</Eyebrow>
            <Countdown target={new Date(match.kickoff)} />
          </div>
        </div>
      )}
    </section>
  )
}

// ─── MatchTabs ───────────────────────────────────────────────────────────────
export function MatchTabs({ tabs, active, onSelect }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--paper)', borderBottom: '2px solid var(--ink)' }}>
      <div className="gc-row" style={{ padding: '0 56px', gap: 16, flexWrap: 'wrap' }}>
        {tabs.map(t => {
          const isOn = active === t.id
          return (
            <button key={t.id} onClick={() => onSelect(t.id)} style={{
              border: 0, background: 'transparent', color: 'var(--ink)',
              fontFamily: 'var(--f-sub)', fontWeight: 800,
              fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase',
              padding: '16px 4px', cursor: 'pointer',
              borderBottom: isOn ? '3px solid var(--ink)' : '3px solid transparent',
              marginBottom: -2, transition: 'border-color .15s ease',
              opacity: isOn ? 1 : .55,
            }}>{t.label}</button>
          )
        })}
      </div>
    </div>
  )
}

// ─── MatchTimeline ───────────────────────────────────────────────────────────
export function MatchTimeline({ events, homeCode, awayCode }) {
  if (!events?.length) {
    return (
      <div className="gc-card" style={{ padding: 40, textAlign: 'center' }}>
        <Eyebrow>NO EVENTS YET</Eyebrow>
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 8px', lineHeight: .9 }}>
          Pitazo inicial pendiente
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 420, margin: '0 auto' }}>
          Once the referee blows the first whistle, every goal, card, substitution and key save will appear here in real time.
        </p>
      </div>
    )
  }

  const iconMap = {
    goal:    { glyph: '●', color: 'var(--green)' },
    yellow:  { glyph: '■', color: 'var(--gold)' },
    red:     { glyph: '■', color: 'var(--red)' },
    sub:     { glyph: '⇄', color: 'var(--ink)' },
    kickoff: { glyph: '▶', color: 'var(--muted)' },
  }

  return (
    <div className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="gc-row" style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow>TIMELINE · MATCH EVENTS</Eyebrow>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>{events.length} EVENTS</span>
      </div>
      <div className="gc-col">
        {events.map((e, i) => {
          const icon    = iconMap[e.type] || iconMap.kickoff
          const isHome  = e.team === 'home'
          const isAway  = e.team === 'away'
          const isCenter = !isHome && !isAway
          return (
            <div key={i} className="gc-row" style={{
              padding: '16px 22px',
              borderBottom: i < events.length - 1 ? '1px solid var(--rule)' : 0,
              alignItems: 'center',
              background: isCenter ? 'var(--paper-2)' : 'transparent',
            }}>
              <div className="gc-col" style={{ flex: 1, alignItems: 'flex-end', textAlign: 'right' }}>
                {isHome && (<>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{e.player}</span>
                  {e.detail && <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{e.detail}</span>}
                </>)}
              </div>
              <div className="gc-col" style={{ width: 120, alignItems: 'center', flex: '0 0 auto' }}>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1, color: isCenter ? 'var(--muted)' : 'var(--ink)' }}>{e.minute}</span>
                <div className="gc-row gc-gap-xs" style={{ alignItems: 'center', marginTop: 2 }}>
                  <span style={{ color: icon.color, fontSize: 14 }}>{icon.glyph}</span>
                  <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{e.type}</span>
                </div>
              </div>
              <div className="gc-col" style={{ flex: 1, alignItems: 'flex-start', textAlign: 'left' }}>
                {isAway && (<>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{e.player}</span>
                  {e.detail && <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{e.detail}</span>}
                </>)}
                {isCenter && (
                  <span className="gc-mono" style={{ width: '100%', textAlign: 'center', fontSize: 11, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase' }}>{e.detail}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MatchStats ──────────────────────────────────────────────────────────────
export function MatchStats({ stats = {} }) {
  const rows = [
    { label: 'POSESIÓN', key: 'possession', pct: true },
    { label: 'TIROS', key: 'shots', pct: false },
    { label: 'TIROS AL ARCO', key: 'shotsOnTarget', pct: false },
    { label: 'PASES', key: 'passes', pct: false },
    { label: 'PRECISIÓN DE PASE', key: 'passAccuracy', pct: true },
    { label: 'FALTAS', key: 'fouls', pct: false },
    { label: 'TARJETAS AMARILLAS', key: 'yellowCards', pct: false },
    { label: 'TARJETAS ROJAS', key: 'redCards', pct: false },
    { label: 'CÓRNERS', key: 'corners', pct: false },
    { label: 'FUERA DE LUGAR', key: 'offsides', pct: false },
  ]

  function getPair(value) {
    if (Array.isArray(value)) {
      return [Number(value[0] ?? 0), Number(value[1] ?? 0)]
    }

    if (value && typeof value === 'object') {
      return [
        Number(value.home ?? value.h ?? value.local ?? 0),
        Number(value.away ?? value.a ?? value.visitante ?? 0),
      ]
    }

    return [0, 0]
  }

  const hasAnyStats = rows.some((row) => {
    const [homeValue, awayValue] = getPair(stats?.[row.key])
    return homeValue > 0 || awayValue > 0
  })

  if (!hasAnyStats) {
    return (
      <div className="gc-card" style={{ padding: 28 }}>
        <Eyebrow>ESTADÍSTICAS</Eyebrow>
        <h3
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 42,
            margin: '10px 0 8px',
            lineHeight: 0.9,
          }}
        >
          Sin estadísticas todavía.
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
          Las estadísticas aparecerán cuando el partido tenga datos registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="gc-card" style={{ padding: 28 }}>
      <Eyebrow>ESTADÍSTICAS DEL PARTIDO</Eyebrow>

      <div className="gc-col gc-gap-md" style={{ marginTop: 22 }}>
        {rows.map((row) => {
          const [homeValue, awayValue] = getPair(stats?.[row.key])

          const total = row.pct ? 100 : homeValue + awayValue
          const homePct = total > 0 ? (homeValue / total) * 100 : 50
          const awayPct = 100 - homePct

          return (
            <div key={row.key}>
              <div
                className="gc-row"
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 30,
                    lineHeight: 1,
                  }}
                >
                  {homeValue}
                  {row.pct ? '%' : ''}
                </span>

                <span
                  className="gc-mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--muted)',
                    letterSpacing: '.1em',
                  }}
                >
                  {row.label}
                </span>

                <span
                  style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 30,
                    lineHeight: 1,
                  }}
                >
                  {awayValue}
                  {row.pct ? '%' : ''}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `${homePct}% ${awayPct}%`,
                  height: 8,
                  background: 'var(--paper-2)',
                  borderRadius: 999,
                  overflow: 'hidden',
                  gap: 2,
                }}
              >
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

// ─── MatchLineups ─────────────────────────────────────────────────────────────
function LineupCard({ team = {}, nation, side }) {
  const safeNation = nation ?? {
    code: 'TBD',
    name: 'Por definir',
  }

  const players = Array.isArray(team?.eleven)
    ? team.eleven
    : Array.isArray(team?.players)
      ? team.players
      : Array.isArray(team?.lineup)
        ? team.lineup
        : []

  const manager = team?.manager || 'DT por definir'
  const formation = team?.formation || 'Formación por definir'

  return (
    <div className="gc-card" style={{ padding: 24 }}>
      <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 18, alignItems: 'center' }}>
        <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
          <Flag code={safeNation.code} size={28} />
          <div className="gc-col">
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 26, textTransform: 'uppercase', lineHeight: 1 }}>
              {safeNation.name}
            </span>
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
              {manager} · {formation}
            </span>
          </div>
        </div>

        <Pill tone={side === 'home' ? 'ink' : 'default'}>
          {side === 'home' ? 'HOME' : 'AWAY'}
        </Pill>
      </div>

      {players.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', border: '1px solid var(--rule)', borderRadius: 12 }}>
          <Eyebrow>ALINEACIÓN PENDIENTE</Eyebrow>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 0 }}>
            Todavía no hay jugadores registrados para esta selección.
          </p>
        </div>
      ) : (
        <div className="gc-col gc-gap-xs">
          {players.map((p, index) => {
            const number = p.num ?? p.number ?? index + 1
            const name = p.name ?? p.player ?? 'Jugador por definir'
            const pos = p.pos ?? p.position ?? '—'

            return (
              <div
                key={`${number}-${name}-${index}`}
                className="gc-row"
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid var(--rule)',
                  alignItems: 'center',
                }}
              >
                <span
                  className="gc-mono"
                  style={{
                    width: 30,
                    color: pos === 'GK' ? 'var(--gold)' : 'var(--muted)',
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: '.05em',
                  }}
                >
                  {String(number).padStart(2, '0')}
                </span>

                <span className="gc-grow" style={{ fontWeight: 600, fontSize: 14 }}>
                  {name}
                </span>

                <span
                  className="gc-mono"
                  style={{
                    fontSize: 10,
                    color: 'var(--muted)',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {pos}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function MatchLineups({ home, away, homeNation, awayNation }) {
  const hasHome = Boolean(home)
  const hasAway = Boolean(away)

  if (!hasHome && !hasAway) {
    return (
      <div className="gc-card" style={{ padding: 40, textAlign: 'center' }}>
        <Eyebrow>LINEUPS PENDING</Eyebrow>
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 8px', lineHeight: .9 }}>
          Alineaciones pendientes.
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 420, margin: '0 auto' }}>
          Las alineaciones aparecerán cuando estén registradas en la base de datos.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <LineupCard team={home || {}} nation={homeNation} side="home" />
      <LineupCard team={away || {}} nation={awayNation} side="away" />
    </div>
  )
}
// ─── StadiumCard ─────────────────────────────────────────────────────────────
function StatBox({ label, value }) {
  return (
    <div className="gc-col">
      <Eyebrow style={{ fontSize: 9 }}>{label}</Eyebrow>
      <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, lineHeight: .9, marginTop: 6 }}>{value}</span>
    </div>
  )
}

export function StadiumCard({ name, city, matchTime, attendance }) {
  const safeName = name || 'Estadio por definir'
  const safeCity = city || 'Ciudad por definir'
  const safeAttendance = attendance ?? null

  return (
    <div className="gc-card" style={{ padding: 28 }}>
      <Eyebrow>SEDE DEL PARTIDO</Eyebrow>

      <h3
        style={{
          fontFamily: 'var(--f-display)',
          fontSize: 42,
          margin: '10px 0 8px',
          lineHeight: 0.9,
          textTransform: 'uppercase',
        }}
      >
        {safeName}
      </h3>

      <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 0 }}>
        {safeCity}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginTop: 22,
        }}
      >
        <div className="gc-card" style={{ padding: 16 }}>
          <Eyebrow>HORARIO</Eyebrow>
          <strong>{matchTime || 'Por definir'}</strong>
        </div>

        <div className="gc-card" style={{ padding: 16 }}>
          <Eyebrow>ASISTENCIA</Eyebrow>
          <strong>
            {safeAttendance !== null
              ? Number(safeAttendance).toLocaleString()
              : 'No registrada'}
          </strong>
        </div>

        <div className="gc-card" style={{ padding: 16 }}>
          <Eyebrow>PAÍS / CIUDAD</Eyebrow>
          <strong>{safeCity}</strong>
        </div>
      </div>
    </div>
  )
}

// ─── PredictionBar ────────────────────────────────────────────────────────────
export function PredictionBar({ pct, homeName, awayName }) {
  if (!pct) return null
  return (
    <div className="gc-card" style={{ padding: 28 }}>
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Eyebrow>FAN PREDICTIONS · 4,218 PICKS</Eyebrow>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>ALL POOLS</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${pct.homeWin}% ${pct.draw}% ${pct.awayWin}%`,
        marginTop: 18, height: 64, borderRadius: 12, overflow: 'hidden', gap: 2,
      }}>
        <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '0 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="gc-mono" style={{ fontSize: 10, opacity: .7, letterSpacing: '.08em' }}>{upper(homeName, 'Local')} GANA</span>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 36, lineHeight: 1 }}>{pct.homeWin}%</span>
        </div>
        <div style={{ background: 'var(--paper-2)', color: 'var(--ink)', padding: '0 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="gc-mono" style={{ fontSize: 10, opacity: .65, letterSpacing: '.08em' }}>EMPATE</span>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 36, lineHeight: 1 }}>{pct.draw}%</span>
        </div>
        <div style={{ background: 'var(--red)', color: 'var(--red-ink)', padding: '0 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
          <span className="gc-mono" style={{ fontSize: 10, opacity: .85, letterSpacing: '.08em' }}>{upper(awayName, 'Visitante')} GANA</span>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 36, lineHeight: 1 }}>{pct.awayWin}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── H2HCard ─────────────────────────────────────────────────────────────────
export function H2HCard({ h2h }) {
  if (!h2h?.length) return null
  return (
    <div className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="gc-row" style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)' }}>
        <Eyebrow>HEAD TO HEAD · LAST {h2h.length} MEETINGS</Eyebrow>
      </div>
      {h2h.map((m, i) => {
        const wColor = m.you === 'W' ? 'var(--green)' : m.you === 'L' ? 'var(--red)' : 'var(--muted)'
        return (
          <div key={i} className="gc-row" style={{
            padding: '14px 22px',
            borderBottom: i < h2h.length - 1 ? '1px solid var(--rule)' : 0,
            alignItems: 'center', gap: 16,
          }}>
            <span className="gc-mono" style={{ width: 90, fontSize: 12, color: 'var(--muted)', letterSpacing: '.06em' }}>{m.date}</span>
            <span className="gc-mono gc-grow" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{m.phase}</span>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 22 }}>{m.result}</span>
            <span style={{
              width: 24, height: 24, borderRadius: 4,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: wColor, color: 'var(--paper)',
              fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 11,
            }}>{m.you}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── MetaCard ─────────────────────────────────────────────────────────────────
export function MetaCard({ detail }) {
  const cells = []
  if (detail?.weather)    cells.push({ l: 'CLIMA',      v: `${detail.weather.temp}°C · ${detail.weather.cond}`, sub: detail.weather.wind })
  if (detail?.attendance) cells.push({ l: 'ASISTENCIA', v: detail.attendance, sub: '' })
  if (detail?.referee)    cells.push({ l: 'ÁRBITRO',    v: detail.referee,    sub: detail.var ? `VAR · ${detail.var}` : '' })
  if (!cells.length) return null
  return (
    <div className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="gc-row" style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)' }}>
        <Eyebrow>MATCH FACTS</Eyebrow>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
        {cells.map((c, i) => (
          <div key={c.l} style={{ padding: 20, borderRight: i < cells.length - 1 ? '1px solid var(--rule)' : 0 }}>
            <Eyebrow style={{ fontSize: 9 }}>{c.l}</Eyebrow>
            <div style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 18, marginTop: 6, letterSpacing: '.01em', textTransform: 'uppercase' }}>{c.v}</div>
            {c.sub && <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.06em' }}>{c.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
