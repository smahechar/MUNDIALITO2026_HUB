import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { byCode } from '@/mocks/data/nations'
import { matchDays, stadiums } from '@/mocks/data/matches'
import { Flag, Eyebrow, Pill } from '@/components/shared/atoms'
import { Floodlight } from '@/components/shared/Layout'

function getTeam(code) {
  const safeCode = String(code ?? '').trim().toUpperCase()

  return byCode[safeCode] ?? {
    code: safeCode || 'TBD',
    name: safeCode || 'Por definir',
  }
}

function safeText(value, fallback = '—') {
  return String(value ?? fallback)
}

export function FreshnessBadge({ source, lastSyncedAt }) {
  const isExternal = source && source !== "seed";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
      isExternal
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-600"
    }`}>
      {isExternal ? "Actualizado" : "Base"}
      {lastSyncedAt ? ` · ${new Date(lastSyncedAt).toLocaleString()}` : ""}
    </span>
  );
}
// ─── MatchCard · tarjeta de partido (cuadrada) ───────────────────────────────
export function MatchCard({ match }) {
  const navigate = useNavigate()
  const home = getTeam(match.home)
  const away = getTeam(match.away)
  const isLive  = match.status === 'live' || match.status === 'halftime'
  const isFinal = match.status === 'final'

  return (
    <div
      className="gc-card gc-hover"
      style={{ padding: 18, cursor: 'pointer' }}
      onClick={() => navigate(`/match/${match.id}`)}
    >
      <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <Eyebrow>{match.phase}</Eyebrow>
        {isLive
          ? <Pill live>{match.minute || 'LIVE'}</Pill>
          : isFinal
            ? <Pill tone="ink">FT</Pill>
            : <Pill>{new Date(match.kickoff).toLocaleString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Pill>
        }
      </div>
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gc-col gc-gap-xs" style={{ alignItems: 'center', flex: 1 }}>
          <Flag code={home.code} size={44} />
          <span className="gc-mono" style={{ fontWeight: 700, letterSpacing: '.1em', fontSize: 11 }}>{home.code}</span>
          <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'center' }}>{home.name}</span>
        </div>
        <div className="gc-col" style={{ alignItems: 'center', padding: '0 14px' }}>
          {match.homeScore !== null ? (
            <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline' }}>
              <span className={`gc-score ${isLive ? 'gc-score-pop' : ''}`} style={{ fontSize: 52 }}>{match.homeScore}</span>
              <span className="gc-mono" style={{ color: 'var(--muted)' }}>—</span>
              <span className={`gc-score ${isLive ? 'gc-score-pop' : ''}`} style={{ fontSize: 52 }}>{match.awayScore}</span>
            </div>
          ) : (
            <span className="gc-display" style={{ fontSize: 30, color: 'var(--muted)' }}>vs</span>
          )}
        </div>
        <div className="gc-col gc-gap-xs" style={{ alignItems: 'center', flex: 1 }}>
          <Flag code={away.code} size={44} />
          <span className="gc-mono" style={{ fontWeight: 700, letterSpacing: '.1em', fontSize: 11 }}>{away.code}</span>
          <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'center' }}>{away.name}</span>
        </div>
      </div>
      <div className="gc-row gc-rule" style={{ justifyContent: 'space-between', marginTop: 16, paddingTop: 12, fontSize: 11.5, color: 'var(--muted)' }}>
        <span className="gc-mono gc-truncate" style={{ letterSpacing: '.08em', textTransform: 'uppercase' }}>{match.stadium}</span>
        <span className="gc-mono" style={{ letterSpacing: '.08em', textTransform: 'uppercase', flexShrink: 0, marginLeft: 8 }}>{match.city}</span>
      </div>
    </div>
  )
}

// ─── MatchRow · fila horizontal estilo broadcast (lista de fixture) ──────────
export function MatchRow({ match, onClick }) {
  const home = getTeam(match.home)
  const away = getTeam(match.away)
  const isLive = match.status === 'live' || match.status === 'halftime'
  const isFinal = match.status === 'final'

  

  return (
    <div
      className="gc-hover"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '70px minmax(0,1fr) auto minmax(0,1fr) minmax(140px,200px) minmax(60px,90px) 22px',
        gap: 14, alignItems: 'center',
        padding: '16px 22px',
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 12,
        cursor: 'pointer',
      }}
    >
      {/* estado / hora */}
      <div className="gc-col gc-gap-xs" style={{ alignItems: 'flex-start' }}>
        {isLive
          ? <Pill live style={{ fontSize: 10 }}>{match.minute || 'LIVE'}</Pill>
          : isFinal
            ? <Pill tone="ink" style={{ fontSize: 10 }}>FT</Pill>
            : <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em' }}>
                {new Date(match.kickoff).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
        }
        <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>
          {match.group ? `GRP ${match.group}` : '—'}
        </span>
      </div>

      {/* local (derecha → marcador) */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent: 'flex-end', alignItems: 'center', minWidth: 0 }}>
        <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14, textAlign: 'right' }}>{home.name}</span>
        <Flag code={home.code} size={24} />
      </div>

      {/* marcador */}
      <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline', justifyContent: 'center', minWidth: 80 }}>
        {match.homeScore !== null ? (
          <>
            <span className={`gc-display ${isLive ? 'gc-score-pop' : ''}`} style={{ fontSize: 28 }}>{match.homeScore}</span>
            <span className="gc-mono" style={{ color: 'var(--muted)' }}>—</span>
            <span className={`gc-display ${isLive ? 'gc-score-pop' : ''}`} style={{ fontSize: 28 }}>{match.awayScore}</span>
          </>
        ) : (
          <span className="gc-display" style={{ fontSize: 24, color: 'var(--muted)' }}>vs</span>
        )}
      </div>

      {/* visitante */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent: 'flex-start', alignItems: 'center', minWidth: 0 }}>
        <Flag code={away.code} size={24} />
        <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14 }}>{away.name}</span>
      </div>

      {/* estadio */}
      <div className="gc-col" style={{ minWidth: 0 }}>
        <span className="gc-mono gc-truncate" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.04em' }}>{match.stadium}</span>
        <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>{safeText(match.city).toUpperCase()}</span>
      </div>

      {/* fase */}
      <span className="gc-mono gc-truncate" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', textAlign: 'right' }}>
        {safeText(match.phase).split('·').pop().trim()}
      </span>

      {/* flecha */}
      <span style={{ color: 'var(--muted)', fontSize: 18, justifySelf: 'end' }}>→</span>
    </div>
  )
}

// ─── SpotlightMatch · tarjeta grande oscura (partido destacado) ──────────────
export function SpotlightMatch({ match, onClick }) {
  const home = getTeam(match.home)
  const away = getTeam(match.away)
  const info = stadiums[match.stadium]
  const isLive = match.status === 'live' || match.status === 'halftime'
  const isFinal = match.status === 'final'

  

  return (
    <div
      className="gc-card gc-card-ink gc-hover no-accent"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
      onClick={onClick}
    >
      <Floodlight size={500} color="var(--gold)" opacity={.25} top={-200} right={-100} />
      <Floodlight size={420} color="var(--red)"  opacity={.22} bottom={-220} left={-120} />

      <div style={{
        padding: '28px 32px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr) minmax(220px,280px)',
        gap: 24, alignItems: 'center', position: 'relative',
      }}>
        {/* local */}
        <div className="gc-col gc-gap-sm" style={{ alignItems: 'flex-end', textAlign: 'right', minWidth: 0 }}>
          <Flag code={home.code} size={64} />
          <span className="gc-mono" style={{ fontSize: 12, color: 'rgba(247,241,223,.7)', letterSpacing: '.1em', fontWeight: 700 }}>{home.code}</span>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(26px,3.5vw,48px)', margin: 0, lineHeight: .85, textTransform: 'uppercase', wordBreak: 'break-word' }}>
            {home.name}
          </h3>
        </div>

        {/* marcador / vs */}
        <div className="gc-col" style={{ alignItems: 'center', padding: '0 8px', minWidth: 0 }}>
          {match.homeScore !== null ? (
            <div className="gc-row" style={{ gap: 'clamp(8px,1vw,18px)', alignItems: 'baseline' }}>
              <span className={`gc-score ${isLive ? 'gc-score-pop' : ''}`} style={{ fontSize: 'clamp(64px,8.5vw,124px)', color: 'var(--gold)' }}>{match.homeScore}</span>
              <span className="gc-mono" style={{ fontSize: 'clamp(20px,2.5vw,36px)', color: 'rgba(247,241,223,.4)' }}>—</span>
              <span className={`gc-score ${isLive ? 'gc-score-pop' : ''}`} style={{ fontSize: 'clamp(64px,8.5vw,124px)', color: 'var(--gold)' }}>{match.awayScore}</span>
            </div>
          ) : (
            <>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px,6.5vw,92px)', color: 'rgba(247,241,223,.4)', lineHeight: 1 }}>vs</span>
              <span className="gc-mono" style={{ fontSize: 13, color: 'rgba(247,241,223,.7)', letterSpacing: '.1em', marginTop: 6, textAlign: 'center' }}>
                {new Date(match.kickoff).toLocaleString('es-CO', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          )}
          <div className="gc-row gc-gap-sm" style={{ marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            {isLive
              ? <Pill live>{match.minute || 'LIVE'}</Pill>
              : isFinal
                ? <Pill tone="gold">FULL TIME</Pill>
                : <Pill style={{ background: 'rgba(247,241,223,.12)', borderColor: 'transparent', color: 'var(--paper)' }}>UPCOMING</Pill>
            }
            <Pill style={{ background: 'rgba(247,241,223,.12)', borderColor: 'transparent', color: 'var(--paper)' }}>GRP {match.group}</Pill>
          </div>
        </div>

        {/* visitante */}
        <div className="gc-col gc-gap-sm" style={{ alignItems: 'flex-start', minWidth: 0 }}>
          <Flag code={away.code} size={64} />
          <span className="gc-mono" style={{ fontSize: 12, color: 'rgba(247,241,223,.7)', letterSpacing: '.1em', fontWeight: 700 }}>{away.code}</span>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(26px,3.5vw,48px)', margin: 0, lineHeight: .85, textTransform: 'uppercase', wordBreak: 'break-word' }}>
            {away.name}
          </h3>
        </div>

        {/* sede */}
        <div className="gc-col gc-gap-sm" style={{ borderLeft: '1px solid rgba(247,241,223,.18)', paddingLeft: 24, minWidth: 0 }}>
          <Eyebrow tone="onDark">↘ HOST VENUE</Eyebrow>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(22px,2.5vw,30px)', lineHeight: .9, textTransform: 'uppercase', wordBreak: 'break-word' }}>{match.stadium}</div>
          <span className="gc-mono" style={{ fontSize: 11, color: 'rgba(247,241,223,.65)', letterSpacing: '.08em' }}>
            {safeText(match.city).toUpperCase()}{info ? ` · CAP. ${info.cap.toLocaleString()}` : ''}
          </span>
          {info && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(247,241,223,.75)' }}>{info.surface} · {info.roof}</div>
          )}
          <span className="gc-link" style={{ color: 'var(--gold)', borderColor: 'var(--gold)', marginTop: 10, alignSelf: 'flex-start' }}>
            Abrir match centre →
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── DateScrubber · barra interactiva de jornadas en la parte superior ───────
export function DateScrubber({ active, onSelect, days = matchDays }) {
  return (
    <div
      className="gc-row"
      style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', overflow: 'hidden' }}
    >
      {days.map(d => {
        const isOn = active === d.key
        const stateColor =
          d.group === 'live'      ? 'var(--red)'
          : d.group === 'next'   ? 'var(--ink)'
          : 'var(--muted)'

        return (
          <button
            key={d.key}
            onClick={() => onSelect(d.key)}
            style={{
              flex: 1,
              border: 0,
              background: isOn ? 'var(--ink)' : 'var(--paper)',
              color: isOn ? 'var(--paper)' : 'var(--ink)',
              padding: '16px 14px',
              cursor: 'pointer',
              borderRight: '1px solid var(--rule)',
              transition: 'background .15s ease, color .15s ease',
              textAlign: 'left',
            }}
          >
            <div
              className="gc-mono"
              style={{
                fontSize: 10,
                letterSpacing: '.12em',
                color: isOn ? 'var(--paper)' : stateColor,
                opacity: isOn ? .65 : 1,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {d.group === 'live' ? '● ' : ''}{d.label}
            </div>

            <div style={{ fontFamily: 'var(--f-display)', fontSize: 28, lineHeight: 1, marginTop: 4 }}>
              {d.date}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── StatusChips · filtro segmentado con contadores ──────────────────────────
export function StatusChips({ value, onChange, options }) {
  return (
    <div className="gc-tabs">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={value === o.id ? 'is-on' : ''}
        >
          {o.label}{typeof o.count === 'number' ? ` · ${o.count}` : ''}
        </button>
      ))}
    </div>
  )
}

// ─── DayBlock · grupo de partidos bajo una fecha ─────────────────────────────
export function DayBlock({ date, matches, onNavigate }) {
  const dayLabel = date.toLocaleDateString('es-CO', { weekday: 'long', month: 'long', day: 'numeric' })
  const hasLive  = matches.some(m => m.status === 'live' || m.status === 'halftime')
  const allDone  = matches.every(m => m.status === 'final')
  const label    = hasLive ? 'EN CURSO' : allDone ? 'FINALIZADO' : 'PROGRAMADO'

  return (
    <div className="gc-col gc-gap-sm" style={{ marginBottom: 28 }}>
      <div className="gc-row gc-rule-double" style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="gc-row gc-gap-md" style={{ alignItems: 'baseline' }}>
          <span className="gc-display" style={{ fontSize: 56, lineHeight: 1 }}>{date.getDate()}</span>
          <div className="gc-col">
            <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 16, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {dayLabel}
            </span>
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
              {matches.length} partidos
            </span>
          </div>
        </div>
        <Pill>{label}</Pill>
      </div>
      <div className="gc-col gc-gap-sm" style={{ marginTop: 10 }}>
        {matches.map(m => (
          <MatchRow key={m.id} match={m} onClick={() => onNavigate(`/match/${m.id}`)} />
        ))}
      </div>
    </div>
  )
}

// ─── StadiumMiniCard · tarjeta de estadio con cancha SVG ─────────────────────
export function StadiumMiniCard({ name, info }) {
  return (
    <div className="gc-card gc-hover" style={{ padding: 0, overflow: 'hidden' }}>
      {/* vista previa del estadio */}
      <div style={{ height: 130, position: 'relative', background: 'var(--green)' }}>
        <svg
          viewBox="0 0 400 200" width="100%" height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0 }}
        >
          <ellipse cx="200" cy="220" rx="240" ry="60" fill="rgba(0,0,0,.2)" />
          <ellipse cx="200" cy="210" rx="200" ry="48" fill="rgba(247,241,223,.08)" />
          <rect x="30"  y="40"  width="340" height="130" fill="none" stroke="rgba(247,241,223,.35)" strokeWidth="1.5" />
          <rect x="30"  y="40"  width="85"  height="130" fill="none" stroke="rgba(247,241,223,.25)" strokeWidth="1" />
          <rect x="285" y="40"  width="85"  height="130" fill="none" stroke="rgba(247,241,223,.25)" strokeWidth="1" />
          <rect x="80"  y="65"  width="55"  height="80"  fill="none" stroke="rgba(247,241,223,.2)"  strokeWidth="1" />
          <rect x="265" y="65"  width="55"  height="80"  fill="none" stroke="rgba(247,241,223,.2)"  strokeWidth="1" />
          <line x1="200" y1="40" x2="200" y2="170" stroke="rgba(247,241,223,.25)" strokeWidth="1" />
          <circle cx="200" cy="105" r="22" fill="none" stroke="rgba(247,241,223,.35)" strokeWidth="1.5" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Pill tone="gold" style={{ fontSize: 10, alignSelf: 'flex-start' }}>{info.roof}</Pill>
          <span className="gc-mono" style={{ fontSize: 10, color: 'rgba(247,241,223,.7)', letterSpacing: '.08em' }}>{info.city.toUpperCase()}</span>
        </div>
      </div>
      {/* datos del estadio */}
      <div style={{ padding: 18 }}>
        <h4 style={{ fontFamily: 'var(--f-display)', fontSize: 26, margin: 0, lineHeight: .9, textTransform: 'uppercase' }}>{name}</h4>
        <div className="gc-row" style={{ marginTop: 12, gap: 18 }}>
          <div className="gc-col">
            <Eyebrow style={{ fontSize: 9 }}>CAP.</Eyebrow>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1, marginTop: 4 }}>{info.cap.toLocaleString()}</span>
          </div>
          <div className="gc-col">
            <Eyebrow style={{ fontSize: 9 }}>SURFACE</Eyebrow>
            <span style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{info.surface}</span>
          </div>
          <div className="gc-col">
            <Eyebrow style={{ fontSize: 9 }}>OPENED</Eyebrow>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1, marginTop: 4 }}>{info.opened}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Countdown · reloj regresivo hasta el próximo pitazo ─────────────────────
export function Countdown({ target, big = false }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const ms  = Math.max(0, target - now)
  const d   = Math.floor(ms / 86400000)
  const h   = Math.floor((ms % 86400000) / 3600000)
  const m   = Math.floor((ms % 3600000)  / 60000)
  const s   = Math.floor((ms % 60000)    / 1000)
  const pad = n => String(n).padStart(2, '0')
  const cells = [{ v: pad(d), l: 'Days' }, { v: pad(h), l: 'Hours' }, { v: pad(m), l: 'Min' }, { v: pad(s), l: 'Sec' }]

  return (
    <div className="gc-row" style={{ gap: big ? 28 : 18, alignItems: 'stretch' }}>
      {cells.map((c, i) => (
        <span key={c.l} style={{ display: 'flex', alignItems: 'baseline', gap: big ? 12 : 8 }}>
          <div className="gc-col" style={{ alignItems: 'flex-start', gap: 6 }}>
            <span className="gc-cd" style={{ fontSize: big ? 124 : 80 }}>{c.v}</span>
            <span className="gc-eyebrow" style={{ fontSize: 10.5 }}>{c.l}</span>
          </div>
          {i < cells.length - 1 && (
            <span style={{ fontFamily: 'var(--f-display)', fontSize: big ? 124 : 80, lineHeight: .85, color: 'var(--rule-strong)' }}>:</span>
          )}
        </span>
      ))}
    </div>
  )
}

// ─── FixtureRail · rail compacto de partidos (Home page) ─────────────────────
export function FixtureRail({ matches = [], count = 6 }) {
  const items = matches.slice(0, count)
  return (
    <div className="bc-fixrail">
      {items.map(m => {
        const home    = byCode[m.home]
        const away    = byCode[m.away]
        const isLive  = m.status === 'live' || m.status === 'halftime'
        const isFinal = m.status === 'final'
        return (
          <div key={m.id} className="gc-col gc-gap-xs">
            <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Eyebrow style={{ fontSize: 10 }}>{m.phase}</Eyebrow>
              {isLive
                ? <Pill live style={{ fontSize: 10, padding: '2px 7px' }}>{m.minute || 'LIVE'}</Pill>
                : isFinal
                  ? <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>FT</span>
                  : <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>
                      {new Date(m.kickoff).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
              }
            </div>
            <div className="gc-row gc-gap-sm" style={{ alignItems: 'center', marginTop: 4 }}>
              <Flag code={home.code} size={20} />
              <span className="gc-grow gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{home.name}</span>
              <span className="gc-mono" style={{ fontSize: 16, fontWeight: 800 }}>{m.homeScore ?? '—'}</span>
            </div>
            <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
              <Flag code={away.code} size={20} />
              <span className="gc-grow gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{away.name}</span>
              <span className="gc-mono" style={{ fontSize: 16, fontWeight: 800 }}>{m.awayScore ?? '—'}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
