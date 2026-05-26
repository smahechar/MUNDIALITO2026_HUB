import { useNavigate } from 'react-router-dom'
import { PageShell, PageHeader, Band, Floodlight } from '@/components/shared/Layout'
import { Flag, Eyebrow, Pill, Btn, SectionHead, CountInt } from '@/components/shared/atoms'
import { usePoolsPageData } from '@/hooks/usePools'

function num(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function pickMatchId(prediction = {}) {
  return prediction.matchId || prediction.match_id || prediction.match?.id || null
}

function pickHome(prediction = {}) {
  return prediction.home ?? prediction.home_pick ?? prediction.homePick ?? prediction.homeScorePick ?? null
}

function pickAway(prediction = {}) {
  return prediction.away ?? prediction.away_pick ?? prediction.awayPick ?? prediction.awayScorePick ?? null
}

function getTeam(code, name) {
  const safeCode = String(code ?? 'TBD').trim().toUpperCase()
  return {
    code: safeCode || 'TBD',
    name: name || safeCode || 'Por definir',
    group: '—',
  }
}

function getMatchFromPrediction(prediction = {}, matches = []) {
  if (prediction.match) return prediction.match

  const id = pickMatchId(prediction)
  const found = matches.find(m => String(m.id) === String(id))

  if (found) return found

  return {
    id,
    home: prediction.homeCode || prediction.home_code || prediction.homeTeam || prediction.home_team || 'TBD',
    away: prediction.awayCode || prediction.away_code || prediction.awayTeam || prediction.away_team || 'TBD',
    homeName: prediction.homeName || prediction.home_name || prediction.homeTeamName,
    awayName: prediction.awayName || prediction.away_name || prediction.awayTeamName,
    homeScore: prediction.homeScore ?? prediction.home_score ?? 0,
    awayScore: prediction.awayScore ?? prediction.away_score ?? 0,
    phase: prediction.phase || 'PARTIDO',
    stadium: prediction.stadium || 'Estadio por definir',
    minute: prediction.minute || null,
  }
}

function RankBadge({ rank, size = 28 }) {
  const r = num(rank, 0)
  const tone = r === 1
    ? { bg: 'var(--gold)', fg: 'var(--gold-ink)' }
    : r > 0 && r <= 3
      ? { bg: 'var(--ink)', fg: 'var(--paper)' }
      : { bg: 'var(--paper-2)', fg: 'var(--muted)' }

  return (
    <span
      className="gc-mono"
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: tone.bg,
        color: tone.fg,
        fontSize: size >= 32 ? 13 : 11,
        fontWeight: 800,
      }}
    >
      {r || '—'}
    </span>
  )
}

function PointsBadge({ pts, kind }) {
  const map = {
    exact: { bg: 'var(--green)', fg: 'var(--green-ink)', label: 'EXACTO' },
    diff: { bg: 'var(--ink)', fg: 'var(--paper)', label: 'DIFF' },
    winner: { bg: 'var(--paper-2)', fg: 'var(--ink)', label: 'GANADOR' },
    miss: { bg: 'transparent', fg: 'var(--muted)', label: 'MISS' },
  }

  const item = map[kind] || map.miss
  const points = num(pts, 0)

  return (
    <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
      <span
        style={{
          fontFamily: 'var(--f-sub)',
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: 999,
          background: item.bg,
          color: item.fg,
          border: kind === 'miss' ? '1px dashed var(--rule)' : 'none',
        }}
      >
        {item.label}
      </span>
      <span className="gc-display" style={{ fontSize: 22, color: points > 0 ? 'var(--ink)' : 'var(--muted)' }}>
        +{points}
      </span>
    </div>
  )
}

function StatTile({ label, value, change, tone = 'paper' }) {
  const bg = tone === 'ink' ? 'var(--ink)' : tone === 'red' ? 'var(--red)' : tone === 'gold' ? 'var(--gold)' : 'var(--paper-2)'
  const fg = tone === 'ink' ? 'var(--paper)' : tone === 'red' ? 'var(--red-ink)' : tone === 'gold' ? 'var(--gold-ink)' : 'var(--ink)'

  return (
    <div style={{ background: bg, color: fg, borderRadius: 14, padding: 24 }}>
      <div className="gc-eyebrow" style={{ fontSize: 10, opacity: 0.65, letterSpacing: '.12em', color: 'currentColor' }}>
        {label}
      </div>
      <div className="gc-display" style={{ fontSize: 64, lineHeight: 0.82, margin: '8px 0 4px' }}>
        <CountInt to={num(value, 0)} />
      </div>
      <div className="gc-mono" style={{ fontSize: 11, opacity: 0.75, letterSpacing: '.06em' }}>
        {change}
      </div>
    </div>
  )
}

function TeamMini({ team, align = 'left' }) {
  return (
    <div className="gc-row gc-gap-sm" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start', alignItems: 'center', minWidth: 0 }}>
      {align === 'left' && <Flag code={team.code} size={22} />}
      <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14 }}>{team.name}</span>
      {align === 'right' && <Flag code={team.code} size={22} />}
    </div>
  )
}

function PredictionRow({ prediction, matches = [], onClick }) {
  const match = getMatchFromPrediction(prediction, matches)
  const home = getTeam(match.home, match.homeName || match.home_name)
  const away = getTeam(match.away, match.awayName || match.away_name)
  const homePick = pickHome(prediction)
  const awayPick = pickAway(prediction)
  const status = prediction.status || 'open'
  const isOpen = status === 'open'
  const isLive = status === 'live'
  const isSet = status === 'settled'
  const noPick = homePick === null || homePick === undefined || awayPick === null || awayPick === undefined

  return (
    <div
      className="gc-hover"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr) minmax(130px,180px) minmax(130px,160px)',
        gap: 14,
        alignItems: 'center',
        padding: '16px 22px',
        background: isLive ? 'var(--paper-2)' : 'var(--paper)',
        border: `1px solid ${isLive ? 'var(--red)' : 'var(--rule)'}`,
        borderRadius: 12,
        cursor: 'pointer',
      }}
    >
      <TeamMini team={home} align="right" />

      <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline', minWidth: 80, justifyContent: 'center' }}>
        {noPick ? (
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
            SIN PICK
          </span>
        ) : (
          <>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1, color: isLive ? 'var(--red)' : 'var(--ink)' }}>{homePick}</span>
            <span className="gc-mono" style={{ color: 'var(--muted)' }}>—</span>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1, color: isLive ? 'var(--red)' : 'var(--ink)' }}>{awayPick}</span>
          </>
        )}
      </div>

      <TeamMini team={away} align="left" />

      <div className="gc-col" style={{ alignItems: 'flex-start' }}>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
          {match.phase || 'PARTIDO'}
        </span>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
          {match.stadium || 'Estadio por definir'}
        </span>
      </div>

      <div className="gc-row gc-gap-sm" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
        {isOpen && (
          <>
            {prediction.doubleDown && <Pill tone="gold" style={{ fontSize: 9, padding: '2px 6px' }}>×2</Pill>}
            <Pill style={{ fontSize: 10 }}>CIERRA {prediction.locksAt || 'PRONTO'}</Pill>
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>ABIERTO</span>
          </>
        )}
        {isLive && (
          <>
            <Pill live style={{ fontSize: 10 }}>LIVE</Pill>
            <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, color: num(prediction.currentPts, 0) > 0 ? 'var(--green)' : 'var(--muted)' }}>
              +{num(prediction.currentPts, 0)}
            </span>
          </>
        )}
        {isSet && <PointsBadge pts={prediction.pts} kind={prediction.kind} />}
      </div>
    </div>
  )
}

function LivePredictionCard({ prediction, matches = [], onClick }) {
  const match = getMatchFromPrediction(prediction, matches)
  const home = getTeam(match.home, match.homeName || match.home_name)
  const away = getTeam(match.away, match.awayName || match.away_name)
  const homePick = pickHome(prediction)
  const awayPick = pickAway(prediction)

  return (
    <div className="gc-card gc-live-card gc-hover no-accent" onClick={onClick} style={{ padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 240, height: 240, background: 'radial-gradient(circle at top right, color-mix(in oklab, var(--red) 25%, transparent), transparent 60%)', pointerEvents: 'none' }} />
      <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
        <Eyebrow tone="red">↘ LIVE · TU PREDICCIÓN EN JUEGO</Eyebrow>
        <Pill live>{match.minute || 'LIVE'}</Pill>
      </div>

      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, position: 'relative' }}>
        <div className="gc-col" style={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Flag code={home.code} size={36} />
          <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', marginTop: 4 }}>{home.code}</span>
          <span className="gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{home.name}</span>
        </div>

        <div className="gc-col gc-gap-sm" style={{ alignItems: 'center', padding: '0 12px' }}>
          <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>EN VIVO</span>
          <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline' }}>
            <span className="gc-score gc-score-pop" style={{ fontSize: 'clamp(40px,6vw,64px)' }}>{num(match.homeScore ?? match.home_score, 0)}</span>
            <span className="gc-mono" style={{ color: 'var(--muted)' }}>—</span>
            <span className="gc-score gc-score-pop" style={{ fontSize: 'clamp(40px,6vw,64px)' }}>{num(match.awayScore ?? match.away_score, 0)}</span>
          </div>
          <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>TU PICK</span>
          <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline', opacity: 0.65 }}>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 22 }}>{homePick ?? '?'}</span>
            <span className="gc-mono" style={{ color: 'var(--muted)' }}>—</span>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 22 }}>{awayPick ?? '?'}</span>
          </div>
        </div>

        <div className="gc-col" style={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Flag code={away.code} size={36} />
          <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', marginTop: 4 }}>{away.code}</span>
          <span className="gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{away.name}</span>
        </div>
      </div>

      <div className="gc-rule" style={{ marginTop: 16, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.1em' }}>{prediction.note || 'Predicción activa'}</span>
        <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline' }}>
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>EN JUEGO</span>
          <span className="gc-display" style={{ fontSize: 36, color: num(prediction.currentPts, 0) > 0 ? 'var(--green)' : 'var(--muted)' }}>
            +{num(prediction.currentPts, 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

function PoolSummaryCard({ pool, onOpen }) {
  const you = num(pool.you ?? pool.yourRank ?? pool.rank, 0)
  const yourPts = num(pool.yourPts ?? pool.points, 0)
  const topPts = num(pool.topPts ?? pool.leaderPts, 0)
  const members = num(pool.members ?? pool.memberCount ?? pool.members_count, 0)

  return (
    <div className="gc-card gc-hover" style={{ padding: 24, cursor: 'pointer' }} onClick={onOpen}>
      <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
        <Eyebrow>POOL · {pool.code || 'SIN-CÓDIGO'}</Eyebrow>
        <Pill>{pool.hostType ?? pool.host ?? 'Pública'}</Pill>
      </div>
      <h4 style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 22, margin: '0 0 16px', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
        {pool.name || 'Polla sin nombre'}
      </h4>
      <div className="gc-row" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
        <div className="gc-col">
          <Eyebrow style={{ fontSize: 10 }}>Tu posición</Eyebrow>
          <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline', marginTop: 4 }}>
            <RankBadge rank={you} size={32} />
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{yourPts} pts</span>
          </div>
        </div>
        <div className="gc-col" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
          <Eyebrow style={{ fontSize: 10 }}>Líder</Eyebrow>
          <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 18, textTransform: 'uppercase' }}>{pool.top || pool.leader || '—'}</span>
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{topPts} pts · +{Math.max(topPts - yourPts, 0)} de ti</span>
        </div>
      </div>
      <div className="gc-rule gc-row" style={{ paddingTop: 12, justifyContent: 'space-between', fontSize: 11.5, alignItems: 'center' }}>
        <span className="gc-mono gc-uppercase" style={{ color: 'var(--muted)', letterSpacing: '.1em' }}>{members.toLocaleString()} miembros</span>
        <span className="gc-link">Abrir pool →</span>
      </div>
    </div>
  )
}

function PointsTimelineChart({ timeline = [] }) {
  const safeTimeline = Array.isArray(timeline) && timeline.length > 0
    ? timeline
    : [{ md: 'MD1', total: 0, future: false, pending: false }]

  const max = Math.max(...safeTimeline.map(d => num(d.total, 0)), 200)
  const W = 600
  const H = 200
  const P = 32
  const denominator = Math.max(safeTimeline.length - 1, 1)
  const xs = (i) => P + (i * (W - 2 * P)) / denominator
  const ys = (v) => H - P - ((num(v, 0) / max) * (H - 2 * P))
  const pts = safeTimeline.map((d, i) => `${xs(i)},${ys(d.total)}`).join(' ')
  const lastSettledIdx = [...safeTimeline].reverse().findIndex(d => !d.future && !d.pending)
  const lastSettled = lastSettledIdx === -1 ? 0 : safeTimeline.length - 1 - lastSettledIdx

  return (
    <div className="gc-card" style={{ padding: 24 }}>
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <Eyebrow>POINTS TIMELINE · MATCH DAY POR MATCH DAY</Eyebrow>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>
          TOTAL · <CountInt to={num(safeTimeline[lastSettled]?.total, 0)} /> PTS
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMinYMid meet" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="tl-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity=".5" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(g => (
          <line key={g} x1={P} x2={W - P} y1={ys(max * g)} y2={ys(max * g)} stroke="var(--rule)" strokeWidth="1" />
        ))}
        <polygon fill="url(#tl-fill)" points={`${P},${H - P} ${pts} ${xs(safeTimeline.length - 1)},${H - P}`} />
        <polyline fill="none" stroke="var(--ink)" strokeWidth="2.5" points={pts} />
        {safeTimeline.map((d, i) => (
          <g key={d.md || i}>
            <circle
              cx={xs(i)}
              cy={ys(d.total)}
              r={d.future ? 3 : 5}
              fill={d.future ? 'var(--paper)' : d.pending ? 'var(--gold)' : 'var(--ink)'}
              stroke={d.future ? 'var(--rule)' : 'var(--paper)'}
              strokeWidth="2"
            />
            <text x={xs(i)} y={H - 10} textAnchor="middle" fontFamily="var(--f-mono)" fontSize="9" letterSpacing="0.08em" fill={d.future ? 'var(--muted)' : 'var(--ink)'}>
              {d.md || `MD${i + 1}`}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function SpecialPickCard({ kind, pick = {}, tone = 'default' }) {
  const meta = {
    champion: { label: '↘ CAMPEÓN', title: 'Tu campeón' },
    runnerUp: { label: '↘ FINALISTA', title: 'Tu finalista' },
    topScorer: { label: '↘ GOLEADOR', title: 'Tu goleador' },
    darkHorse: { label: '↘ CABALLO NEGRO', title: 'Tu sorpresa' },
  }[kind] || { label: '↘ PICK', title: 'Tu pick' }

  const statusMap = {
    alive: { tone: 'green', label: 'VIGENTE' },
    leading: { tone: 'gold', label: 'LIDERANDO' },
    out: { tone: 'red', label: 'ELIMINADO' },
  }

  const st = statusMap[pick.status] || statusMap.alive
  const isDark = tone === 'ink'
  const nation = getTeam(pick.nation, pick.nationName || pick.nation_name)

  return (
    <div className="gc-card gc-hover no-accent" style={{ padding: 22, position: 'relative', overflow: 'hidden', background: isDark ? 'var(--ink)' : 'var(--paper)', color: isDark ? 'var(--paper)' : 'var(--ink)', borderColor: isDark ? 'transparent' : 'var(--rule)' }}>
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Eyebrow tone={isDark ? 'onDark' : 'default'}>{meta.label}</Eyebrow>
        <Pill tone={st.tone}>{st.label}</Pill>
      </div>
      <h4 style={{ fontFamily: 'var(--f-display)', fontSize: 28, margin: '0 0 12px', lineHeight: 0.9, textTransform: 'uppercase' }}>{meta.title}</h4>

      {kind === 'topScorer' ? (
        <div className="gc-row gc-gap-md" style={{ alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: 'linear-gradient(135deg, var(--gold), #fff3b8 50%, var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-ink)', fontFamily: 'var(--f-display)', fontSize: 22 }}>
            {num(pick.goalsNow, 0)}
          </div>
          <div className="gc-col">
            <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 18, textTransform: 'uppercase' }}>{pick.player || 'Jugador por definir'}</span>
            <div className="gc-row gc-gap-sm" style={{ marginTop: 4 }}>
              <Flag code={pick.nation || 'TBD'} size={18} />
              <span className="gc-mono" style={{ fontSize: 11, letterSpacing: '.08em' }}>{pick.nation || 'TBD'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="gc-row gc-gap-md" style={{ alignItems: 'center' }}>
          <Flag code={nation.code} size={42} />
          <div className="gc-col">
            <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase', lineHeight: 1 }}>{nation.name}</span>
            <span className="gc-mono" style={{ fontSize: 11, color: isDark ? 'rgba(247,241,223,.6)' : 'var(--muted)', letterSpacing: '.08em' }}>
              {nation.code} · GRP {nation.group}
            </span>
          </div>
        </div>
      )}

      <div className="gc-rule" style={{ marginTop: 16, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderColor: isDark ? 'rgba(247,241,223,.2)' : 'var(--rule)' }}>
        {pick.note && <span className="gc-mono" style={{ fontSize: 11, letterSpacing: '.08em', color: isDark ? 'rgba(247,241,223,.55)' : 'var(--muted)' }}>{pick.note}</span>}
        <span className="gc-display" style={{ fontSize: 28, color: 'var(--gold)', marginLeft: 'auto' }}>+{num(pick.reward, 0)}</span>
      </div>
    </div>
  )
}

function DiscoveryPoolCard({ pool, onJoin }) {
  const members = num(pool.members ?? pool.memberCount ?? pool.members_count, 0)

  return (
    <div className="gc-card gc-hover" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--paper)' }}>
      <div className="gc-row" style={{ justifyContent: 'space-between' }}>
        <Eyebrow>CODE · {pool.code || 'SIN-CÓDIGO'}</Eyebrow>
        <Pill>{pool.hostType ?? pool.host ?? 'Pública'}</Pill>
      </div>
      <h4 style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '0.01em', textTransform: 'uppercase', lineHeight: 1.1, color: 'var(--ink)' }}>
        {pool.name || 'Polla sin nombre'}
      </h4>
      <div className="gc-row" style={{ justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--rule)', alignItems: 'center' }}>
        <div className="gc-col">
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>MIEMBROS</span>
          <span className="gc-display" style={{ fontSize: 28, lineHeight: 1, color: 'var(--ink)' }}>{members.toLocaleString()}</span>
        </div>
        <button className="gc-btn gc-btn-ghost" onClick={onJoin} style={{ padding: '10px 16px', fontSize: 11 }}>Unirme →</button>
      </div>
      <div className="gc-mono" style={{ fontSize: 11, color: 'var(--ink)', letterSpacing: '.08em' }}>
        PREMIO · <b style={{ fontWeight: 700 }}>{pool.prize || 'Sin premio registrado'}</b>
      </div>
    </div>
  )
}

function RulesCard({ rules = [] }) {
  return (
    <div className="gc-card" style={{ padding: 24 }}>
      <Eyebrow>REGLAS DE PUNTUACIÓN</Eyebrow>
      <div className="gc-col gc-gap-sm" style={{ marginTop: 14 }}>
        {rules.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>No hay reglas registradas todavía.</p>
        ) : (
          rules.map((r, i) => (
            <div key={r.id || i} className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
              <div className="gc-col" style={{ flex: 1 }}>
                <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '.02em' }}>{r.label || r.name || 'Regla'}</span>
                <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.desc || r.description || 'Sin descripción'}</span>
              </div>
              <span className="gc-display" style={{ fontSize: 26, color: typeof r.pts === 'string' ? 'var(--gold)' : 'var(--ink)' }}>+{r.pts ?? r.points ?? 0}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function PoolsPage() {
  const navigate = useNavigate()
  const { data, isLoading } = usePoolsPageData()

  if (isLoading || !data) {
    return (
      <PageShell>
        <div style={{ padding: '80px 56px', textAlign: 'center', color: 'var(--muted)' }}>
          Cargando…
        </div>
      </PageShell>
    )
  }

  const {
    pools = [],
    predictions = [],
    timeline = [],
    specialPicks = {},
    discoverPools = [],
    scoringRules = [],
    matches = [],
  } = data || {}

  const open = predictions.filter(p => p.status === 'open')
  const live = predictions.filter(p => p.status === 'live')
  const settled = predictions.filter(p => p.status === 'settled')
  const totalPts = settled.reduce((s, p) => s + num(p.pts, 0), 0)
  const livePts = live.reduce((s, p) => s + num(p.currentPts, 0), 0)
  const totalMembers = pools.reduce((s, p) => s + num(p.members ?? p.memberCount ?? p.members_count, 0), 0)

  return (
    <PageShell>
      <PageHeader
        kicker={`MODULE · POLLAS FUTBOLERAS · ${pools.length} POOLS ACTIVOS`}
        title={<>Pollas<br />futboleras.</>}
        lede="The game before the game. Track every prediction, climb live leaderboards, and settle automatically at the final whistle."
        action={
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost">Unirme con código</Btn>
            <Btn onClick={() => navigate('/pools/new')}>Crear polla</Btn>
          </div>
        }
      />

      <div style={{ padding: '0 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <StatTile label="PUNTOS · TEMPORADA" value={totalPts} change="MD1 → MD2 acumulado" tone="ink" />
          <StatTile label="PTS EN JUEGO · LIVE" value={livePts} change={`${live.length} partidos en curso`} tone="red" />
          <StatTile label="PREDICCIONES ABIERTAS" value={open.length} change="se cierran al pitazo" tone="paper" />
          <StatTile label="POOLS ACTIVOS" value={pools.length} change={`${totalMembers.toLocaleString()} miembros`} tone="gold" />
        </div>
      </div>

      {live.length > 0 && (
        <>
          <SectionHead
            num="01"
            label="↘ EN JUEGO · TUS PREDICCIONES LIVE"
            title="Live picks"
            right={<span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.12em' }}>ACTUALIZACIÓN EN VIVO</span>}
          />
          <div style={{ padding: '22px 56px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            {live.map(p => (
              <LivePredictionCard
                key={p.id}
                prediction={p}
                matches={matches}
                onClick={() => navigate(`/match/${pickMatchId(p)}`)}
              />
            ))}
          </div>
        </>
      )}

      <SectionHead
        num="02"
        label="↘ TUS POOLS · POSICIÓN ACTUAL"
        title="Tus pools"
        right={<span className="gc-link" style={{ cursor: 'pointer' }} onClick={() => pools[0]?.id && navigate(`/pools/${pools[0].id}`)}>Ver tabla completa →</span>}
      />

      <div style={{ padding: '22px 56px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {pools.length === 0 ? (
          <div className="gc-card" style={{ padding: 32, textAlign: 'center' }}>
            <Eyebrow>SIN POLLAS</Eyebrow>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Todavía no perteneces a ninguna polla.</p>
          </div>
        ) : (
          pools.map(p => (
            <PoolSummaryCard key={p.id} pool={p} onOpen={() => navigate(`/pools/${p.id}`)} />
          ))
        )}
      </div>

      <SectionHead
        num="03"
        label={`↘ POR DECIDIR · ${open.length} PREDICCIONES ABIERTAS`}
        title="Próximas decisiones"
        right={<span className="gc-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/fixture')}>Ver fixture →</span>}
      />

      <div style={{ padding: '22px 56px 0', display: 'grid', gap: 10 }}>
        {open.length === 0 ? (
          <div className="gc-card" style={{ padding: 28, textAlign: 'center' }}>
            <Eyebrow>SIN PREDICCIONES ABIERTAS</Eyebrow>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>No hay partidos disponibles para pronosticar por ahora.</p>
          </div>
        ) : (
          open.map(p => (
            <PredictionRow
              key={p.id}
              prediction={p}
              matches={matches}
              onClick={() => navigate(`/predict/${pickMatchId(p)}`)}
            />
          ))
        )}
      </div>

      <SectionHead num="04" label="↘ TU TEMPORADA · TIMELINE + BONOS" title="Tu temporada" />

      <div style={{ padding: '22px 56px 0', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <PointsTimelineChart timeline={timeline} />
        <div className="gc-col gc-gap-md">
          {specialPicks?.champion && <SpecialPickCard kind="champion" pick={specialPicks.champion} tone="ink" />}
          {specialPicks?.topScorer && <SpecialPickCard kind="topScorer" pick={specialPicks.topScorer} />}
        </div>
      </div>

      <div style={{ padding: '16px 56px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {specialPicks?.runnerUp && <SpecialPickCard kind="runnerUp" pick={specialPicks.runnerUp} />}
        {specialPicks?.darkHorse && <SpecialPickCard kind="darkHorse" pick={specialPicks.darkHorse} />}
      </div>

      <SectionHead num="05" label={`↘ HISTORIAL · ${settled.length} PREDICCIONES LIQUIDADAS`} title="Cómo fuiste" />

      <div style={{ padding: '22px 56px 0', display: 'grid', gap: 10 }}>
        {settled.length === 0 ? (
          <div className="gc-card" style={{ padding: 28, textAlign: 'center' }}>
            <Eyebrow>SIN HISTORIAL</Eyebrow>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Aún no hay predicciones liquidadas.</p>
          </div>
        ) : (
          settled.map(p => (
            <PredictionRow
              key={p.id}
              prediction={p}
              matches={matches}
              onClick={() => navigate(`/match/${pickMatchId(p)}`)}
            />
          ))
        )}
      </div>

      <Band tone="red" withFloodlight={<Floodlight size={600} color="var(--gold)" opacity={0.22} top={-200} left={-100} />}>
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, position: 'relative', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Eyebrow tone="onGreen">
              <b style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 400, color: 'currentColor' }}>06</b> · DESCUBRE
            </Eyebrow>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px,6vw,88px)', lineHeight: 0.85, margin: '6px 0 0', textTransform: 'uppercase' }}>
              Más pollas,<br />más juego.
            </h2>
          </div>
          <button className="gc-btn" style={{ background: 'var(--paper)', color: 'var(--ink)' }} onClick={() => navigate('/pools/new')}>
            Crear la tuya
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, position: 'relative' }}>
          {discoverPools.length === 0 ? (
            <div className="gc-card" style={{ padding: 28 }}>
              <Eyebrow>SIN POLLAS PÚBLICAS</Eyebrow>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>No hay pollas públicas disponibles por ahora.</p>
            </div>
          ) : (
            discoverPools.map(p => (
              <DiscoveryPoolCard key={p.id} pool={p} onJoin={() => alert(`Unirse a "${p.name}"`)} />
            ))
          )}
        </div>
      </Band>

      <SectionHead num="07" label="↘ CÓMO SE PUNTÚA" title="Reglas" />

      <div style={{ padding: '22px 56px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <RulesCard rules={scoringRules} />

        <div className="gc-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <Eyebrow>↘ MULTIPLICADORES · 3 PICKS DOBLES POR TORNEO</Eyebrow>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 38, margin: '8px 0 0', lineHeight: 0.9, textTransform: 'uppercase' }}>
              Pickea doble<br />cuando estés seguro.
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 12, maxWidth: 460 }}>
              Cada usuario tiene 3 multiplicadores ×2 por torneo. Aplica uno en la predicción que más confianza te da; los puntos se duplican si aciertas.
            </p>
          </div>

          <div className="gc-row gc-gap-sm" style={{ marginTop: 16 }}>
            {[
              { used: true, label: 'USADO · 1' },
              { used: false, label: 'DISPONIBLE' },
              { used: false, label: 'DISPONIBLE' },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: m.used ? 'var(--gold)' : 'transparent',
                  color: m.used ? 'var(--gold-ink)' : 'var(--ink)',
                  border: m.used ? 'none' : '1.5px dashed var(--rule)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, lineHeight: 1 }}>×2</span>
                <span className="gc-mono" style={{ fontSize: 10, letterSpacing: '.1em', fontWeight: m.used ? 700 : 400 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
