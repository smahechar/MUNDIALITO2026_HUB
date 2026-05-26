import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { PageShell, PageHeader, Band, Floodlight } from '@/components/shared/Layout'
import { Flag, Eyebrow, Pill, Btn, SectionHead, CountInt } from '@/components/shared/atoms'
import { usePoolsPageData } from '@/hooks/usePools'
import { matches as allMatches } from '@/mocks/data/matches'
import { byCode } from '@/mocks/data/nations'

// ─── helpers ─────────────────────────────────────────────────────────────────
function getMatch(matchId) { return allMatches.find(m => m.id === matchId) }

function RankBadge({ rank, size = 28 }) {
  const tone = rank === 1 ? { bg:'var(--gold)', fg:'var(--gold-ink)' }
    : rank <= 3 ? { bg:'var(--ink)', fg:'var(--paper)' }
    : { bg:'var(--paper-2)', fg:'var(--muted)' }
  return (
    <span className="gc-mono" style={{
      width:size, height:size, borderRadius:6,
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      background:tone.bg, color:tone.fg,
      fontSize:size>=32?13:11, fontWeight:800,
    }}>{rank}</span>
  )
}

function PointsBadge({ pts, kind }) {
  const map = {
    exact:  { bg:'var(--green)',   fg:'var(--green-ink)', label:'EXACTO' },
    diff:   { bg:'var(--ink)',     fg:'var(--paper)',     label:'DIFF'   },
    winner: { bg:'var(--paper-2)', fg:'var(--ink)',       label:'GANADOR'},
    miss:   { bg:'transparent',    fg:'var(--muted)',     label:'MISS'   },
  }
  const m = map[kind] || map.miss
  return (
    <div className="gc-row gc-gap-sm" style={{ alignItems:'center' }}>
      <span style={{
        fontFamily:'var(--f-sub)', fontWeight:800,
        fontSize:10, letterSpacing:'.08em', textTransform:'uppercase',
        padding:'3px 8px', borderRadius:999,
        background:m.bg, color:m.fg,
        border: kind==='miss' ? '1px dashed var(--rule)' : 'none',
      }}>{m.label}</span>
      <span className="gc-display" style={{ fontSize:22, color:pts>0?'var(--ink)':'var(--muted)' }}>+{pts}</span>
    </div>
  )
}

// ─── StatTile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, change, tone='paper' }) {
  const bg = tone==='ink'?'var(--ink)':tone==='red'?'var(--red)':tone==='gold'?'var(--gold)':'var(--paper-2)'
  const fg = tone==='ink'?'var(--paper)':tone==='red'?'var(--red-ink)':tone==='gold'?'var(--gold-ink)':'var(--ink)'
  return (
    <div style={{ background:bg, color:fg, borderRadius:14, padding:24 }}>
      <div className="gc-eyebrow" style={{ fontSize:10, opacity:.65, letterSpacing:'.12em', color:'currentColor' }}>{label}</div>
      <div className="gc-display" style={{ fontSize:64, lineHeight:.82, margin:'8px 0 4px' }}>
        <CountInt to={typeof value==='number'?value:0} />
      </div>
      <div className="gc-mono" style={{ fontSize:11, opacity:.75, letterSpacing:'.06em' }}>{change}</div>
    </div>
  )
}

// ─── LivePredictionCard ───────────────────────────────────────────────────────
function LivePredictionCard({ prediction, onClick }) {
  const match = getMatch(prediction.matchId)
  if (!match) return null
  const home = byCode[match.home]
  const away = byCode[match.away]
  return (
    <div className="gc-card gc-live-card gc-hover no-accent" onClick={onClick}
      style={{ padding:22, cursor:'pointer', position:'relative', overflow:'hidden' }}>
      {/* gradiente rojo sutil en esquina */}
      <div style={{ position:'absolute', top:0, right:0, width:240, height:240,
        background:'radial-gradient(circle at top right, color-mix(in oklab, var(--red) 25%, transparent), transparent 60%)',
        pointerEvents:'none' }} />

      <div className="gc-row" style={{ justifyContent:'space-between', marginBottom:14, position:'relative' }}>
        <Eyebrow tone="red">↘ LIVE · TU PREDICCIÓN EN JUEGO</Eyebrow>
        <Pill live>{match.minute || 'LIVE'}</Pill>
      </div>

      <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'center', gap:16, position:'relative' }}>
        <div className="gc-col" style={{ alignItems:'center', flex:1, minWidth:0 }}>
          <Flag code={home.code} size={36} />
          <span className="gc-mono" style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', marginTop:4 }}>{home.code}</span>
          <span className="gc-truncate" style={{ fontWeight:600, fontSize:13 }}>{home.name}</span>
        </div>

        <div className="gc-col gc-gap-sm" style={{ alignItems:'center', padding:'0 12px' }}>
          <span className="gc-mono" style={{ fontSize:10, color:'var(--muted)', letterSpacing:'.08em' }}>EN VIVO</span>
          <div className="gc-row gc-gap-sm" style={{ alignItems:'baseline' }}>
            <span className="gc-score gc-score-pop" style={{ fontSize:'clamp(40px,6vw,64px)' }}>{match.homeScore}</span>
            <span className="gc-mono" style={{ color:'var(--muted)' }}>—</span>
            <span className="gc-score gc-score-pop" style={{ fontSize:'clamp(40px,6vw,64px)' }}>{match.awayScore}</span>
          </div>
          <span className="gc-mono" style={{ fontSize:10, color:'var(--muted)', letterSpacing:'.08em' }}>TU PICK</span>
          <div className="gc-row gc-gap-sm" style={{ alignItems:'baseline', opacity:.65 }}>
            <span style={{ fontFamily:'var(--f-display)', fontSize:22 }}>{prediction.home ?? '?'}</span>
            <span className="gc-mono" style={{ color:'var(--muted)' }}>—</span>
            <span style={{ fontFamily:'var(--f-display)', fontSize:22 }}>{prediction.away ?? '?'}</span>
          </div>
        </div>

        <div className="gc-col" style={{ alignItems:'center', flex:1, minWidth:0 }}>
          <Flag code={away.code} size={36} />
          <span className="gc-mono" style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', marginTop:4 }}>{away.code}</span>
          <span className="gc-truncate" style={{ fontWeight:600, fontSize:13 }}>{away.name}</span>
        </div>
      </div>

      <div className="gc-rule" style={{ marginTop:16, paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative' }}>
        <span className="gc-mono gc-uppercase" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.1em' }}>{prediction.note}</span>
        <div className="gc-row gc-gap-sm" style={{ alignItems:'baseline' }}>
          <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)' }}>EN JUEGO</span>
          <span className="gc-display" style={{ fontSize:36, color:prediction.currentPts>0?'var(--green)':'var(--muted)' }}>
            +{prediction.currentPts}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── PoolSummaryCard ──────────────────────────────────────────────────────────
function PoolSummaryCard({ pool, onOpen }) {
  const isLeader = pool.you === 1
  return (
    <div className="gc-card gc-hover" style={{ padding:24, cursor:'pointer' }} onClick={onOpen}>
      <div className="gc-row" style={{ justifyContent:'space-between', marginBottom:14, alignItems:'center' }}>
        <Eyebrow>POOL · {pool.code}</Eyebrow>
        <Pill>{pool.hostType}</Pill>
      </div>
      <h4 style={{ fontFamily:'var(--f-sub)', fontWeight:800, fontSize:22, margin:'0 0 16px',
        letterSpacing:'0.01em', textTransform:'uppercase' }}>{pool.name}</h4>
      <div className="gc-row" style={{ justifyContent:'space-between', gap:12, marginBottom:16, alignItems:'flex-end' }}>
        <div className="gc-col">
          <Eyebrow style={{ fontSize:10 }}>Tu posición</Eyebrow>
          <div className="gc-row gc-gap-sm" style={{ alignItems:'baseline', marginTop:4 }}>
            <RankBadge rank={pool.you} size={32} />
            <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)' }}>{pool.yourPts} pts</span>
          </div>
        </div>
        <div className="gc-col" style={{ alignItems:'flex-end', textAlign:'right' }}>
          <Eyebrow style={{ fontSize:10 }}>Líder</Eyebrow>
          <span style={{ fontFamily:'var(--f-sub)', fontWeight:800, fontSize:18, textTransform:'uppercase' }}>{pool.top}</span>
          <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)' }}>
            {pool.topPts} pts · +{pool.topPts - pool.yourPts} de ti
          </span>
        </div>
      </div>
      <div className="gc-rule gc-row" style={{ paddingTop:12, justifyContent:'space-between', fontSize:11.5, alignItems:'center' }}>
        <span className="gc-mono gc-uppercase" style={{ color:'var(--muted)', letterSpacing:'.1em' }}>
          {pool.members.toLocaleString()} miembros
        </span>
        <span className="gc-link">Abrir pool →</span>
      </div>
    </div>
  )
}

// ─── PredictionRow · fila compacta para OPEN y SETTLED ───────────────────────
function PredictionRow({ prediction, onClick }) {
  const match = getMatch(prediction.matchId)
  if (!match) return null
  const home   = byCode[match.home]
  const away   = byCode[match.away]
  const isOpen = prediction.status === 'open'
  const isLive = prediction.status === 'live'
  const isSet  = prediction.status === 'settled'
  const noPick = prediction.home === null

  return (
    <div className="gc-hover" onClick={onClick} style={{
      display:'grid',
      gridTemplateColumns:'minmax(0,1fr) auto minmax(0,1fr) minmax(130px,180px) minmax(130px,160px)',
      gap:14, alignItems:'center', padding:'16px 22px',
      background: isLive ? 'var(--paper-2)' : 'var(--paper)',
      border:`1px solid ${isLive?'var(--red)':'var(--rule)'}`,
      borderRadius:12, cursor:'pointer',
    }}>
      {/* local */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent:'flex-end', alignItems:'center', minWidth:0 }}>
        <span className="gc-truncate" style={{ fontWeight:700, fontSize:14 }}>{home.name}</span>
        <Flag code={home.code} size={22} />
      </div>

      {/* pick */}
      <div className="gc-row gc-gap-sm" style={{ alignItems:'baseline', minWidth:80, justifyContent:'center' }}>
        {noPick ? (
          <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.08em' }}>SIN PICK</span>
        ) : (
          <>
            <span style={{ fontFamily:'var(--f-display)', fontSize:30, lineHeight:1,
              color: isLive?'var(--red)':'var(--ink)' }}>{prediction.home}</span>
            <span className="gc-mono" style={{ color:'var(--muted)' }}>—</span>
            <span style={{ fontFamily:'var(--f-display)', fontSize:30, lineHeight:1,
              color: isLive?'var(--red)':'var(--ink)' }}>{prediction.away}</span>
          </>
        )}
      </div>

      {/* visitante */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent:'flex-start', alignItems:'center', minWidth:0 }}>
        <Flag code={away.code} size={22} />
        <span className="gc-truncate" style={{ fontWeight:700, fontSize:14 }}>{away.name}</span>
      </div>

      {/* partido: fase + estadio */}
      <div className="gc-col" style={{ alignItems:'flex-start' }}>
        <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.08em' }}>{match.phase}</span>
        <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.08em' }}>{match.stadium}</span>
      </div>

      {/* estado / pts */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent:'flex-end', alignItems:'center' }}>
        {isOpen && (
          <>
            {prediction.doubleDown && <Pill tone="gold" style={{ fontSize:9, padding:'2px 6px' }}>×2</Pill>}
            <Pill style={{ fontSize:10 }}>CIERRA {prediction.locksAt}</Pill>
            <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.08em' }}>ABIERTO</span>
          </>
        )}
        {isLive && (
          <>
            <Pill live style={{ fontSize:10 }}>LIVE</Pill>
            <span className="gc-mono" style={{ fontSize:12, fontWeight:700,
              color:prediction.currentPts>0?'var(--green)':'var(--muted)' }}>+{prediction.currentPts}</span>
          </>
        )}
        {isSet && <PointsBadge pts={prediction.pts} kind={prediction.kind} />}
      </div>
    </div>
  )
}

// ─── PointsTimelineChart ──────────────────────────────────────────────────────
function PointsTimelineChart({ timeline }) {
  const max = Math.max(...timeline.map(d => d.total), 200)
  const W = 600, H = 200, P = 32
  const xs = (i) => P + (i * (W - 2*P)) / (timeline.length - 1)
  const ys = (v) => H - P - ((v / max) * (H - 2*P))
  const pts = timeline.map((d,i) => `${xs(i)},${ys(d.total)}`).join(' ')
  const lastSettledIdx = [...timeline].reverse().findIndex(d => !d.future && !d.pending)
  const lastSettled = lastSettledIdx === -1 ? 0 : timeline.length - 1 - lastSettledIdx

  return (
    <div className="gc-card" style={{ padding:24 }}>
      <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
        <Eyebrow>POINTS TIMELINE · MATCH DAY POR MATCH DAY</Eyebrow>
        <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.08em' }}>
          TOTAL · <CountInt to={timeline[lastSettled]?.total || 0} /> PTS
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMinYMid meet" style={{ display:'block' }}>
        <defs>
          <linearGradient id="tl-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="var(--gold)" stopOpacity=".5" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid lines */}
        {[0,.25,.5,.75,1].map(g => (
          <line key={g} x1={P} x2={W-P} y1={ys(max*g)} y2={ys(max*g)} stroke="var(--rule)" strokeWidth="1" />
        ))}
        {/* y axis labels */}
        {[0,.5,1].map(g => (
          <text key={g} x={8} y={ys(max*g)+4} fontFamily="var(--f-mono)" fontSize="9" fill="var(--muted)" letterSpacing="0.06em">
            {Math.round(max*g)}
          </text>
        ))}
        {/* area fill */}
        <polygon fill="url(#tl-fill)"
          points={`${P},${H-P} ${pts} ${xs(timeline.length-1)},${H-P}`} />
        {/* line */}
        <polyline fill="none" stroke="var(--ink)" strokeWidth="2.5" points={pts} />
        {/* dots + labels */}
        {timeline.map((d,i) => (
          <g key={d.md}>
            <circle cx={xs(i)} cy={ys(d.total)} r={d.future?3:5}
              fill={d.future?'var(--paper)':d.pending?'var(--gold)':'var(--ink)'}
              stroke={d.future?'var(--rule)':'var(--paper)'} strokeWidth="2" />
            <text x={xs(i)} y={H-10} textAnchor="middle"
              fontFamily="var(--f-mono)" fontSize="9" letterSpacing="0.08em"
              fill={d.future?'var(--muted)':'var(--ink)'}>{d.md}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ─── SpecialPickCard ──────────────────────────────────────────────────────────
function SpecialPickCard({ kind, pick, tone='default' }) {
  const meta = {
    champion:  { label:'↘ CAMPEÓN',       title:'Tu campeón'  },
    runnerUp:  { label:'↘ FINALISTA',     title:'Tu finalista'},
    topScorer: { label:'↘ GOLEADOR',      title:'Tu goleador' },
    darkHorse: { label:'↘ CABALLO NEGRO', title:'Tu sorpresa' },
  }[kind]
  const statusMap = {
    alive:   { tone:'green', label:'VIGENTE'   },
    leading: { tone:'gold',  label:'LIDERANDO' },
    out:     { tone:'red',   label:'ELIMINADO' },
  }
  const st = statusMap[pick.status] || statusMap.alive
  const isDark = tone === 'ink'
  const nation = byCode[pick.nation]

  return (
    <div className="gc-card gc-hover no-accent" style={{
      padding:22, position:'relative', overflow:'hidden',
      background: isDark ? 'var(--ink)' : 'var(--paper)',
      color: isDark ? 'var(--paper)' : 'var(--ink)',
      borderColor: isDark ? 'transparent' : 'var(--rule)',
    }}>
      <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <Eyebrow tone={isDark?'onDark':'default'}>{meta.label}</Eyebrow>
        <Pill tone={st.tone}>{st.label}</Pill>
      </div>
      <h4 style={{ fontFamily:'var(--f-display)', fontSize:28, margin:'0 0 12px', lineHeight:.9, textTransform:'uppercase' }}>
        {meta.title}
      </h4>

      {kind === 'topScorer' ? (
        <div className="gc-row gc-gap-md" style={{ alignItems:'center' }}>
          <div style={{
            width:56, height:56, borderRadius:999,
            background:'linear-gradient(135deg, var(--gold), #fff3b8 50%, var(--gold))',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--gold-ink)', fontFamily:'var(--f-display)', fontSize:22,
          }}>{pick.goalsNow}</div>
          <div className="gc-col">
            <span style={{ fontFamily:'var(--f-sub)', fontWeight:800, fontSize:18, textTransform:'uppercase' }}>{pick.player}</span>
            <div className="gc-row gc-gap-sm" style={{ marginTop:4 }}>
              <Flag code={pick.nation} size={18} />
              <span className="gc-mono" style={{ fontSize:11, letterSpacing:'.08em' }}>{pick.nation}</span>
            </div>
          </div>
        </div>
      ) : nation ? (
        <div className="gc-row gc-gap-md" style={{ alignItems:'center' }}>
          <Flag code={nation.code} size={42} />
          <div className="gc-col">
            <span style={{ fontFamily:'var(--f-sub)', fontWeight:800, fontSize:22, textTransform:'uppercase', lineHeight:1 }}>
              {nation.name}
            </span>
            <span className="gc-mono" style={{ fontSize:11, color:isDark?'rgba(247,241,223,.6)':'var(--muted)', letterSpacing:'.08em' }}>
              {nation.code} · GRP {nation.group}
            </span>
          </div>
        </div>
      ) : null}

      <div className="gc-rule" style={{
        marginTop:16, paddingTop:12,
        display:'flex', justifyContent:'space-between', alignItems:'baseline',
        borderColor: isDark?'rgba(247,241,223,.2)':'var(--rule)',
      }}>
        {pick.note && (
          <span className="gc-mono" style={{ fontSize:11, letterSpacing:'.08em',
            color:isDark?'rgba(247,241,223,.55)':'var(--muted)' }}>{pick.note}</span>
        )}
        <span className="gc-display" style={{ fontSize:28, color:'var(--gold)', marginLeft:'auto' }}>+{pick.reward}</span>
      </div>
    </div>
  )
}

// ─── DiscoveryPoolCard ────────────────────────────────────────────────────────
function DiscoveryPoolCard({ pool, onJoin }) {
  return (
    <div className="gc-card gc-hover" style={{
      padding:22, display:'flex', flexDirection:'column', gap:14,
      background:'var(--paper)', // fondo claro explícito
    }}>
      <div className="gc-row" style={{ justifyContent:'space-between' }}>
        <Eyebrow>CODE · {pool.code}</Eyebrow>
        <Pill>{pool.hostType ?? pool.host}</Pill>
      </div>
      <h4 style={{ fontFamily:'var(--f-sub)', fontWeight:800, fontSize:22,
        margin:0, letterSpacing:'0.01em', textTransform:'uppercase', lineHeight:1.1,
        color:'var(--ink)' /* explícito para que se lea sobre cualquier fondo */ }}>
        {pool.name}
      </h4>
      <div className="gc-row" style={{ justifyContent:'space-between', marginTop:'auto',
        paddingTop:14, borderTop:'1px solid var(--rule)', alignItems:'center' }}>
        <div className="gc-col">
          <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.08em' }}>MIEMBROS</span>
          <span className="gc-display" style={{ fontSize:28, lineHeight:1, color:'var(--ink)' }}>
            {pool.members.toLocaleString()}
          </span>
        </div>
        <button className="gc-btn gc-btn-ghost" onClick={onJoin} style={{ padding:'10px 16px', fontSize:11 }}>
          Unirme →
        </button>
      </div>
      <div className="gc-mono" style={{ fontSize:11, color:'var(--ink)', letterSpacing:'.08em' }}>
        PREMIO · <b style={{ fontWeight:700 }}>{pool.prize}</b>
      </div>
    </div>
  )
}

// ─── RulesCard ────────────────────────────────────────────────────────────────
function RulesCard({ rules }) {
  return (
    <div className="gc-card" style={{ padding:24 }}>
      <Eyebrow>REGLAS DE PUNTUACIÓN</Eyebrow>
      <div className="gc-col gc-gap-sm" style={{ marginTop:14 }}>
        {rules.map(r => (
          <div key={r.id} className="gc-row" style={{
            justifyContent:'space-between', alignItems:'flex-start',
            gap:14, padding:'10px 0', borderBottom:'1px solid var(--rule)',
          }}>
            <div className="gc-col" style={{ flex:1 }}>
              <span style={{ fontFamily:'var(--f-sub)', fontWeight:800, fontSize:14,
                textTransform:'uppercase', letterSpacing:'.02em' }}>{r.label}</span>
              <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{r.desc}</span>
            </div>
            <span className="gc-display" style={{ fontSize:26,
              color: typeof r.pts==='string'?'var(--gold)':'var(--ink)' }}>
              +{r.pts}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PoolsPage() {
  const navigate        = useNavigate()
  const { data, isLoading } = usePoolsPageData()

  if (isLoading || !data) return (
    <PageShell>
      <div style={{ padding:'80px 56px', textAlign:'center', color:'var(--muted)' }}>Cargando…</div>
    </PageShell>
  )

  const { pools, predictions, timeline, specialPicks, discoverPools, scoringRules } = data

  const open     = predictions.filter(p => p.status === 'open')
  const live     = predictions.filter(p => p.status === 'live')
  const settled  = predictions.filter(p => p.status === 'settled')
  const totalPts = settled.reduce((s,p) => s + p.pts, 0)
  const livePts  = live.reduce((s,p) => s + (p.currentPts||0), 0)

  return (
    <PageShell>

      {/* ── CABECERA ── */}
      <PageHeader
        kicker={`MODULE · POLLAS FUTBOLERAS · ${pools.length} POOLS ACTIVOS`}
        title={<>Pollas<br/>futboleras.</>}
        lede="The game before the game. Track every prediction, climb live leaderboards, and settle automatically at the final whistle."
        action={
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost">Unirme con código</Btn>
            <Btn onClick={() => navigate('/pools/new')}>Crear polla</Btn>
          </div>
        }
      />

      {/* ── STAT TILES ── */}
      <div style={{ padding:'0 56px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16 }}>
          <StatTile label="PUNTOS · TEMPORADA"    value={totalPts} change="MD1 → MD2 acumulado" tone="ink"  />
          <StatTile label="PTS EN JUEGO · LIVE"   value={livePts}  change="2 partidos en curso" tone="red"  />
          <StatTile label="PREDICCIONES ABIERTAS" value={open.length} change="se cierran al pitazo" tone="paper" />
          <StatTile label="POOLS ACTIVOS"         value={pools.length}
            change={`${pools.reduce((a,p)=>a+p.members,0).toLocaleString()} miembros`} tone="gold" />
        </div>
      </div>

      {/* ── 01 · LIVE PICKS ── */}
      {live.length > 0 && (
        <>
          <SectionHead num="01" label="↘ EN JUEGO · TUS PREDICCIONES LIVE" title="Live picks"
            right={<span className="gc-mono gc-uppercase" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.12em' }}>ACTUALIZACIÓN EN VIVO</span>} />
          <div style={{ padding:'22px 56px 0', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))', gap:16 }}>
            {live.map(p => (
              <LivePredictionCard key={p.id} prediction={p} onClick={() => navigate(`/match/${p.matchId}`)} />
            ))}
          </div>
        </>
      )}

      {/* ── 02 · TUS POOLS ── */}
      <SectionHead num="02" label="↘ TUS POOLS · POSICIÓN ACTUAL" title="Tus pools"
        right={<span className="gc-link" style={{ cursor:'pointer' }} onClick={() => navigate('/pools/p1')}>Ver tabla completa →</span>} />
      <div style={{ padding:'22px 56px 0', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16 }}>
        {pools.map(p => (
          <PoolSummaryCard key={p.id} pool={p} onOpen={() => navigate(`/pools/${p.id}`)} />
        ))}
      </div>

      {/* ── 03 · PRÓXIMAS DECISIONES ── */}
      <SectionHead num="03" label={`↘ POR DECIDIR · ${open.length} PREDICCIONES ABIERTAS`} title="Próximas decisiones"
        right={<span className="gc-link" style={{ cursor:'pointer' }} onClick={() => navigate('/fixture')}>Ver fixture →</span>} />
      <div style={{ padding:'22px 56px 0', display:'grid', gap:10 }}>
        {open.map(p => (
          <PredictionRow key={p.id} prediction={p} onClick={() => navigate(`/predict/${p.matchId}`)} />
        ))}
      </div>

      {/* ── 04 · TU TEMPORADA ── */}
      <SectionHead num="04" label="↘ TU TEMPORADA · TIMELINE + BONOS" title="Tu temporada" />
      <div style={{ padding:'22px 56px 0', display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20 }}>
        <PointsTimelineChart timeline={timeline} />
        <div className="gc-col gc-gap-md">
          {specialPicks?.champion && (
            <SpecialPickCard kind="champion" pick={specialPicks.champion} tone="ink" />
          )}

          {specialPicks?.topScorer && (
            <SpecialPickCard kind="topScorer" pick={specialPicks.topScorer} />
          )}
        </div>
      </div>
      <div style={{ padding:'16px 56px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {specialPicks?.runnerUp && (
          <SpecialPickCard kind="runnerUp" pick={specialPicks.runnerUp} />
        )}

        {specialPicks?.darkHorse && (
          <SpecialPickCard kind="darkHorse" pick={specialPicks.darkHorse} />
        )}
      </div>

      {/* ── 05 · HISTORIAL ── */}
      <SectionHead num="05" label={`↘ HISTORIAL · ${settled.length} PREDICCIONES LIQUIDADAS`} title="Cómo fuiste" />
      <div style={{ padding:'22px 56px 0', display:'grid', gap:10 }}>
        {settled.map(p => (
          <PredictionRow key={p.id} prediction={p} onClick={() => navigate(`/match/${p.matchId}`)} />
        ))}
      </div>

      {/* ── 06 · DESCUBRE ── */}
      <Band tone="red" withFloodlight={<Floodlight size={600} color="var(--gold)" opacity={.22} top={-200} left={-100} />}>
        <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, position:'relative', flexWrap:'wrap', gap:16 }}>
          <div>
            <Eyebrow tone="onGreen">
              <b style={{ fontFamily:'var(--f-display)', fontSize:22, fontWeight:400, color:'currentColor' }}>06</b> · DESCUBRE
            </Eyebrow>
            <h2 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(40px,6vw,88px)', lineHeight:.85, margin:'6px 0 0', textTransform:'uppercase' }}>
              Más pollas,<br/>más juego.
            </h2>
          </div>
          <button className="gc-btn" style={{ background:'var(--paper)', color:'var(--ink)' }}
            onClick={() => navigate('/pools/new')}>
            Crear la tuya
          </button>
        </div>
        {/* Cards con fondo claro para que el texto sea visible */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16, position:'relative' }}>
          {discoverPools.map(p => (
            <DiscoveryPoolCard key={p.id} pool={p} onJoin={() => alert(`Unirse a "${p.name}"`)} />
          ))}
        </div>
      </Band>

      {/* ── 07 · REGLAS ── */}
      <SectionHead num="07" label="↘ CÓMO SE PUNTÚA" title="Reglas" />
      <div style={{ padding:'22px 56px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <RulesCard rules={scoringRules} />
        <div className="gc-card" style={{ padding:24, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <Eyebrow>↘ MULTIPLICADORES · 3 PICKS DOBLES POR TORNEO</Eyebrow>
            <h3 style={{ fontFamily:'var(--f-display)', fontSize:38, margin:'8px 0 0', lineHeight:.9, textTransform:'uppercase' }}>
              Pickea doble<br/>cuando estés seguro.
            </h3>
            <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.5, marginTop:12, maxWidth:460 }}>
              Cada usuario tiene 3 multiplicadores ×2 por torneo. Aplica uno en la predicción que más confianza te da — los puntos se duplican si aciertas.
            </p>
          </div>
          <div className="gc-row gc-gap-sm" style={{ marginTop:16 }}>
            {[
              { used:true,  label:'USADO · 1' },
              { used:false, label:'DISPONIBLE' },
              { used:false, label:'DISPONIBLE' },
            ].map((m,i) => (
              <div key={i} style={{
                padding:'12px 14px', borderRadius:12,
                background: m.used ? 'var(--gold)' : 'transparent',
                color:      m.used ? 'var(--gold-ink)' : 'var(--ink)',
                border: m.used ? 'none' : '1.5px dashed var(--rule)',
                display:'flex', alignItems:'center', gap:8,
              }}>
                <span style={{ fontFamily:'var(--f-display)', fontSize:24, lineHeight:1 }}>×2</span>
                <span className="gc-mono" style={{ fontSize:10, letterSpacing:'.1em', fontWeight: m.used?700:400 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </PageShell>
  )
}
