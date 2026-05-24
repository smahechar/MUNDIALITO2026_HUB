import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell, Floodlight, Watermark, Band } from '@/components/shared/Layout'
import { Flag, Eyebrow, Pill, Btn, SectionHead, CountInt } from '@/components/shared/atoms'
import { MatchCard, Countdown, FixtureRail } from '@/components/matches/MatchCard'
import { useMatches } from '@/hooks/useMatches'
import { nations } from '@/mocks/data/nations'
import { moments, scorers, nextKickoff } from '@/mocks/data/matches'
import { pools, userPredictions } from '@/mocks/data/pools'
import { currentUser, album, tickets } from '@/mocks/data/user'

// ─── PersonalStatTile ────────────────────────────────────────────────────────
function PersonalStatTile({ label, value, change, tone='paper' }) {
  const bg = tone==='ink'?'var(--ink)':tone==='red'?'var(--red)':tone==='gold'?'var(--gold)':'var(--paper-2)'
  const fg = tone==='ink'?'var(--paper)':tone==='red'?'var(--red-ink)':tone==='gold'?'var(--gold-ink)':'var(--ink)'
  return (
    <div style={{ background:bg, color:fg, borderRadius:14, padding:24 }}>
      <div className="gc-eyebrow" style={{ fontSize:10, color:'currentColor', opacity:.65, letterSpacing:'.12em' }}>{label}</div>
      <div className="gc-display" style={{ fontSize:64, lineHeight:.82, margin:'8px 0 4px' }}>
        {typeof value==='number' ? <CountInt to={value} /> : value}
      </div>
      <div className="gc-mono" style={{ fontSize:11, opacity:.75, letterSpacing:'.06em' }}>{change}</div>
    </div>
  )
}

// ─── NextPredictionCard · pollas band ────────────────────────────────────────
function NextPredictionCard({ prediction, navigate }) {
  if (!prediction) return (
    <div className="gc-card gc-card-ink" style={{ padding:26 }}>
      <Eyebrow tone="onDark">↗ TUS PREDICCIONES</Eyebrow>
      <h3 style={{ fontFamily:'var(--f-display)', fontSize:44, lineHeight:.9, margin:'10px 0 20px', textTransform:'uppercase' }}>
        Sin picks abiertos
      </h3>
      <p style={{ fontSize:13, color:'rgba(247,241,223,.65)', lineHeight:1.5 }}>
        Todos tus partidos están liquidados. Espera la próxima jornada para seguir prediciendo.
      </p>
    </div>
  )
  return (
    <div className="gc-card gc-card-ink gc-hover no-accent" style={{ padding:26, cursor:'pointer' }}
      onClick={() => navigate(`/predict/${prediction.matchId}`)}>
      <Eyebrow tone="onDark">↘ TU PRÓXIMA PREDICCIÓN · CIERRA {prediction.locksAt}</Eyebrow>
      <h3 style={{ fontFamily:'var(--f-display)', fontSize:44, lineHeight:.9, margin:'10px 0 20px', textTransform:'uppercase' }}>
        {prediction.match}
      </h3>
      <div className="gc-row" style={{ justifyContent:'space-around', alignItems:'center', marginBottom:22 }}>
        {[
          { code: prediction.homeCode, pick: prediction.home },
          { code: prediction.awayCode, pick: prediction.away },
        ].map((side, i) => (
          <div key={i} className="gc-col gc-gap-xs" style={{ alignItems:'center' }}>
            <Flag code={side.code} size={36} />
            <span className="gc-mono" style={{ fontSize:11, letterSpacing:'.08em', fontWeight:700 }}>{side.code}</span>
            <div style={{
              width:60, height:60, borderRadius:12,
              background: side.pick !== null ? 'var(--gold)' : 'var(--paper-2)',
              color: side.pick !== null ? 'var(--gold-ink)' : 'rgba(247,241,223,.4)',
              fontFamily:'var(--f-display)', fontSize:42,
              display:'flex', alignItems:'center', justifyContent:'center', marginTop:4,
            }}>
              {side.pick !== null ? side.pick : '?'}
            </div>
          </div>
        ))}
      </div>
      <div className="gc-row" style={{ justifyContent:'space-between', paddingTop:14, borderTop:'1px solid rgba(247,241,223,.18)' }}>
        <span className="gc-mono" style={{ fontSize:11, opacity:.75, letterSpacing:'.1em', textTransform:'uppercase' }}>+30 pts si aciertas</span>
        <span style={{ color:'var(--gold)', fontFamily:'var(--f-sub)', fontWeight:800, fontSize:11.5, letterSpacing:'.08em', textTransform:'uppercase' }}>
          Editar pick →
        </span>
      </div>
    </div>
  )
}

// ─── StickerGrid ─────────────────────────────────────────────────────────────
function StickerGrid({ cells, cols=6 }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:10 }}>
      {cells.map((c,i) => (
        <div key={i} className={`gc-sticker is-${c.state==='owned'?'owned':c.state==='shine'?'shine':c.state==='dupe'?'owned is-dupe':'empty'}`}>
          <span className="num">N° {c.n}</span>
          {c.state !== 'empty' && (
            <div style={{
              flex:1, margin:'8px 0', borderRadius:4,
              background: c.state==='shine'
                ? 'linear-gradient(135deg, #fff3b8 0%, #f4b500 50%, #b58400 100%)'
                : 'repeating-linear-gradient(135deg, var(--paper-edge) 0 8px, var(--paper-2) 8px 9px)',
              border:'1px solid var(--rule)',
            }} />
          )}
          <span className="name">{c.name}</span>
        </div>
      ))}
    </div>
  )
}

// ─── TicketCard ───────────────────────────────────────────────────────────────
function TicketCard({ ticket }) {
  const statusColor = ticket.status==='Active'?'var(--green)':ticket.status==='Pending'?'var(--gold)':'var(--muted)'
  return (
    <div className="gc-card" style={{ padding:0, overflow:'hidden', position:'relative' }}>
      <div className="gc-row" style={{ background:'var(--ink)', color:'var(--paper)', padding:'14px 18px', justifyContent:'space-between', alignItems:'center' }}>
        <Eyebrow style={{ color:'var(--paper)', opacity:.65 }}>TICKET · {ticket.id}</Eyebrow>
        <span className="gc-pill" style={{ background:statusColor, color:ticket.status==='Pending'?'var(--gold-ink)':'var(--paper)', borderColor:'transparent' }}>
          {ticket.status}
        </span>
      </div>
      <div style={{ padding:18 }}>
        <Eyebrow>{ticket.phase}</Eyebrow>
        <h4 style={{ fontFamily:'var(--f-display)', fontSize:30, margin:'6px 0 12px', lineHeight:.9 }}>{ticket.match}</h4>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:12 }}>
          <div className="gc-col">
            <Eyebrow style={{ fontSize:9 }}>Sede</Eyebrow>
            <span style={{ fontWeight:600 }}>{ticket.stadium}</span>
            <span style={{ color:'var(--muted)', fontSize:11 }}>{ticket.section}</span>
          </div>
          <div className="gc-col">
            <Eyebrow style={{ fontSize:9 }}>Asiento</Eyebrow>
            <span style={{ fontWeight:600 }}>{ticket.seat}</span>
            <span style={{ color:'var(--muted)', fontSize:11 }}>{ticket.date}</span>
          </div>
        </div>
      </div>
      {/* perforado */}
      <div style={{ position:'absolute', left:-8, right:-8, bottom:56, height:16,
        background:'repeating-linear-gradient(90deg, var(--paper) 0 8px, transparent 8px 16px)',
        pointerEvents:'none' }} />
      <div className="gc-rule gc-row" style={{ padding:'12px 18px', justifyContent:'space-between' }}>
        <span className="gc-link">Ver pase</span>
        <span className="gc-link" style={{ color:'var(--muted)', borderColor:'var(--rule)' }}>Transferir</span>
      </div>
    </div>
  )
}

// ─── ScorersListOnDark ───────────────────────────────────────────────────────
function ScorersListOnDark({ items }) {
  const max = items[0]?.goals || 1
  return (
    <div className="gc-col" style={{ gap:16 }}>
      {items.map((p,i) => (
        <div key={p.name} className="gc-col gc-gap-xs">
          <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'center' }}>
            <div className="gc-row gc-gap-sm" style={{ alignItems:'center' }}>
              <span className="gc-mono" style={{
                width:22, height:22, borderRadius:6,
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                background: i===0?'var(--gold)':'rgba(247,241,223,.1)',
                color: i===0?'var(--gold-ink)':'var(--paper)',
                fontSize:11, fontWeight:800,
              }}>{p.rank}</span>
              <Flag code={p.nation} size={20} />
              <div className="gc-col">
                <span style={{ fontWeight:700, fontSize:14 }}>{p.name}</span>
                <Eyebrow tone="onDark">{p.role}</Eyebrow>
              </div>
            </div>
            <div className="gc-row gc-gap-md" style={{ alignItems:'baseline' }}>
              <span className="gc-mono" style={{ fontSize:11, opacity:.6 }}>{p.assists} A</span>
              <span className="gc-display" style={{ fontSize:30, color:i===0?'var(--gold)':'var(--paper)' }}>{p.goals}</span>
            </div>
          </div>
          <div className="gc-bar" style={{ background:'rgba(247,241,223,.12)' }}>
            <i style={{ width:`${(p.goals/max)*100}%`, background:i===0?'var(--gold)':'var(--paper)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const { matches } = useMatches()
  const target     = useMemo(() => nextKickoff(), [])

  const liveMatches     = matches.filter(m => m.status==='live'||m.status==='halftime')
  const upcomingMatches = matches.filter(m => m.status==='upcoming')
  const featuredMatches = [...liveMatches, ...upcomingMatches].slice(0,4)

  const openPreds  = userPredictions.filter(p => p.status==='open')
  const totalPts   = userPredictions.filter(p=>p.status==='settled').reduce((s,p)=>s+p.pts,0)
  const livePts    = userPredictions.filter(p=>p.status==='live').reduce((s,p)=>s+(p.currentPts||0),0)
  const myPool     = pools[0]

  // Enriquecer la primera predicción abierta con los códigos de equipos
  const nextPred = useMemo(() => {
    if (!openPreds[0]) return null
    const m = matches.find(x => x.id===openPreds[0].matchId)
    if (!m) return null
    return { ...openPreds[0], match:`${m.home==='ESP'?'Esperanza':m.home} × ${m.away==='GAL'?'Galicia':m.away}`, homeCode:m.home, awayCode:m.away }
  }, [openPreds, matches])

  return (
    <PageShell>

      {/* ══ HERO · dashboard personalizado ══ */}
      <section className="bc-hero-stage">
        <Floodlight size={720} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.35} top={-260} left="30%" blend="multiply" />
        <Floodlight size={560} color="color-mix(in oklab, var(--red) 50%, transparent)"  opacity={.3}  top={-180} right={-120} blend="multiply" />
        <Floodlight size={640} color="color-mix(in oklab, var(--green) 55%, transparent)" opacity={.25} bottom={-280} left={-160} blend="multiply" />
        <Watermark style={{ top:240, right:-40 }}>2026</Watermark>

        {/* masthead */}
        <div className="bc-mast">
          <div className="gc-col gc-gap-xs gc-rise" style={{ alignItems:'flex-start' }}>
            <Eyebrow>VOL. 02 · MATCH DAY 2 · {new Date().toLocaleDateString('es-CO',{weekday:'long',month:'long',day:'numeric'})}</Eyebrow>
            <div className="gc-row gc-gap-sm">
              {liveMatches.length > 0 && <Pill live>{liveMatches.length} MATCHES LIVE</Pill>}
              <Pill tone="gold">TU POOL · #{myPool.you}</Pill>
            </div>
          </div>
          <h1 className="gc-rise" style={{ animationDelay:'.05s' }}>
            <div>Global<span className="it"> Cup</span></div>
            <div style={{ fontSize:'.68em', marginTop:6, letterSpacing:'.01em' }}>2026 · The Hub</div>
          </h1>
          <div className="gc-col gc-gap-xs gc-rise" style={{ alignItems:'flex-end', textAlign:'right', animationDelay:'.1s' }}>
            <Eyebrow>BIENVENIDO · {currentUser.name.toUpperCase()} · {currentUser.timezone}</Eyebrow>
            <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)' }}>32 NATIONS · 16 HOST CITIES · 64 MATCHES</span>
            <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)' }}>
              <CountInt to={pools.reduce((a,p)=>a+p.members,0)} /> HUB MEMBERS
            </span>
          </div>
        </div>

        <div style={{ padding:'0 56px' }}><div className="gc-rule-double" /></div>

        {/* hero grid: titular izq + fixture rail der */}
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.05fr) minmax(0,1fr)', gap:40, padding:'32px 56px 0', position:'relative', zIndex:1 }}>

          {/* izquierda: headline + countdown + featured */}
          <div className="gc-col gc-gap-md gc-rise" style={{ animationDelay:'.15s' }}>
            <Eyebrow>↗ EN ESTE MOMENTO</Eyebrow>
            <h2 className="bc-kicker" style={{ whiteSpace:'pre-line', fontSize:'clamp(60px,8vw,116px)' }}>
              {'EVERY MATCH.\nEVERY MOMENT.'}
            </h2>
            <p style={{ fontSize:17, lineHeight:1.5, maxWidth:540, color:'var(--ink-2)' }}>
              Tu hub personalizado del Global Cup 2026. Todos tus partidos, tus pools, tu álbum y tus entradas en un solo lugar.
            </p>

            {/* próximo partido + cuenta regresiva */}
            <div className="gc-glass" style={{ padding:'22px 24px', position:'relative', overflow:'hidden' }}>
              <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
                <Eyebrow tone="red">↘ NEXT KICKOFF · GROUP B · MD3</Eyebrow>
                <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.1em' }}>ESTADIO ALMA · BRAVA</span>
              </div>
              <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'center' }}>
                <div className="gc-row gc-gap-md" style={{ alignItems:'center' }}>
                  {['ESP','GAL'].map((code,i) => (
                    <span key={code} style={{ display:'flex', gap:8, alignItems:'center' }}>
                      {i===1 && <span className="gc-display" style={{ fontSize:44, color:'var(--muted)' }}>vs</span>}
                      <div className="gc-col" style={{ alignItems:'center' }}>
                        <Flag code={code} size={44} />
                        <span className="gc-mono" style={{ fontSize:11, fontWeight:700, marginTop:6, letterSpacing:'.08em' }}>{code}</span>
                        <span style={{ fontWeight:600, fontSize:12 }}>{code==='ESP'?'Esperanza':'Galicia'}</span>
                      </div>
                    </span>
                  ))}
                </div>
                <Countdown target={target} />
              </div>
            </div>
          </div>

          {/* derecha: fixture rail */}
          <div className="gc-rise" style={{ animationDelay:'.2s' }}>
            <div style={{ background:'var(--paper-2)', borderRadius:16, padding:24, height:'100%' }}>
              <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
                <Eyebrow>↘ FIXTURE RAIL · LIVE & UPCOMING</Eyebrow>
                <span className="gc-link" style={{ fontSize:11, cursor:'pointer' }} onClick={() => navigate('/fixture')}>
                  Ver todo →
                </span>
              </div>
              <FixtureRail matches={matches} count={6} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ STAT TILES · personales ══ */}
      <div style={{ padding:'44px 56px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          <PersonalStatTile label="TUS PUNTOS · TEMPORADA"    value={totalPts}          change="MD1 → MD2 acumulados"     tone="ink"  />
          <PersonalStatTile label="PTS EN JUEGO · LIVE"       value={livePts}           change="2 partidos activos ahora"  tone="red"  />
          <PersonalStatTile label="TU POOL · POSICIÓN"        value={`#${myPool.you}`}  change={`de ${myPool.members} en ${myPool.name}`} tone="paper" />
          <PersonalStatTile label="ÁLBUM · COMPLETADO"        value={`${album.pctComplete}%`} change={`${album.owned}/${album.total} · ${album.duplicates} repetidas`} tone="gold" />
        </div>
      </div>

      {/* ══ 01 · MATCH DAY · tus partidos ══ */}
      <SectionHead num="01" label="MATCH DAY · LIVE & NEXT" title="Match Day"
        right={<span className="gc-link" style={{ cursor:'pointer' }} onClick={() => navigate('/fixture')}>Fixture completo →</span>} />
      <div style={{ padding:'22px 56px 0', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {featuredMatches.map(m => <MatchCard key={m.id} match={m} />)}
      </div>

      {/* ══ 02 · POLLAS · band roja ══ */}
      <Band tone="red" withFloodlight={<Floodlight size={600} color="var(--gold)" opacity={.25} top={-200} left={-100} />}>
        <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, position:'relative' }}>
          <div className="gc-col gc-gap-xs">
            <Eyebrow tone="onGreen"><b style={{ fontFamily:'var(--f-display)', fontSize:22, fontWeight:400, color:'currentColor' }}>02</b> · POLLAS FUTBOLERAS</Eyebrow>
            <h2 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(48px,6vw,88px)', lineHeight:.85, margin:'6px 0 0', textTransform:'uppercase' }}>
              The game<br/>before the game.
            </h2>
          </div>
          <div className="gc-col gc-gap-sm" style={{ alignItems:'flex-end' }}>
            <div className="gc-row gc-gap-sm">
              <Pill style={{ background:'rgba(247,241,223,.2)', borderColor:'transparent', color:'var(--paper)' }}>#{myPool.you} en {myPool.name}</Pill>
              <Pill tone="gold">{totalPts} pts</Pill>
            </div>
            <span className="gc-link" style={{ color:'rgba(247,241,223,.75)', borderColor:'rgba(247,241,223,.4)', cursor:'pointer' }}
              onClick={() => navigate('/pools')}>
              Ver mis pollas →
            </span>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, position:'relative' }}>
          <NextPredictionCard prediction={nextPred} navigate={navigate} />
          {/* picks abiertos restantes */}
          <div className="gc-col gc-gap-sm">
            <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
              <Eyebrow tone="onGreen">↘ PREDICCIONES ABIERTAS · {openPreds.length}</Eyebrow>
            </div>
            {openPreds.slice(0,3).map(p => {
              const m = matches.find(x=>x.id===p.matchId)
              if (!m) return null
              return (
                <div key={p.id} className="gc-card gc-hover" style={{ padding:'14px 18px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                  onClick={() => navigate(`/predict/${p.matchId}`)}>
                  <div>
                    <span className="gc-mono" style={{ fontSize:10, color:'var(--muted)', letterSpacing:'.08em' }}>CIERRA {p.locksAt}</span>
                    <div style={{ fontWeight:600, fontSize:13, marginTop:2 }}>{m.home} × {m.away}</div>
                    <span className="gc-mono" style={{ fontSize:10, color:'var(--muted)' }}>{m.phase}</span>
                  </div>
                  <div className="gc-col" style={{ alignItems:'flex-end' }}>
                    {p.home!==null ? (
                      <span style={{ fontFamily:'var(--f-display)', fontSize:22 }}>{p.home} – {p.away}</span>
                    ) : (
                      <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)' }}>SIN PICK</span>
                    )}
                    {p.doubleDown && <Pill tone="gold" style={{ fontSize:9, padding:'2px 6px' }}>×2</Pill>}
                  </div>
                </div>
              )
            })}
            {openPreds.length > 3 && (
              <span className="gc-link" style={{ fontSize:11, cursor:'pointer', alignSelf:'flex-end' }}
                onClick={() => navigate('/pools')}>
                +{openPreds.length-3} más →
              </span>
            )}
          </div>
        </div>
      </Band>

      {/* ══ 03 · GOLDEN BOOT · band oscura ══ */}
      <Band tone="ink" withFloodlight={<Floodlight size={700} color="var(--gold)" opacity={.25} top={-300} right={-200} />}>
        <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'flex-end', marginBottom:32, position:'relative' }}>
          <div>
            <Eyebrow tone="onDark"><b style={{ fontFamily:'var(--f-display)', fontSize:22, fontWeight:400, color:'currentColor' }}>03</b> · GOLDEN BOOT RACE</Eyebrow>
            <h2 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(48px,6vw,88px)', lineHeight:.85, margin:'8px 0 0', textTransform:'uppercase' }}>
              Quien patea,<br/><span style={{ color:'var(--gold)' }}>se anota.</span>
            </h2>
          </div>
          <span className="gc-mono gc-uppercase" style={{ fontSize:11, color:'rgba(247,241,223,.55)', letterSpacing:'.12em' }}>UPDATED · LIVE</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:20, position:'relative' }}>
          {/* tarjeta #1 */}
          <div className="gc-card gc-card-gold gc-hover no-accent" style={{ padding:28, position:'relative', overflow:'hidden' }}>
            <Floodlight size={280} color="#fff3b8" opacity={.6} top={-100} right={-60} />
            <Eyebrow tone="gold">↘ #1 ON THE RACE</Eyebrow>
            <h3 style={{ fontFamily:'var(--f-display)', fontSize:64, lineHeight:.82, margin:'10px 0', textTransform:'uppercase', position:'relative' }}>
              {scorers[0].name}
            </h3>
            <div className="gc-row gc-gap-sm" style={{ marginBottom:22 }}>
              <Flag code={scorers[0].nation} size={24} />
              <span style={{ fontWeight:700 }}>{scorers[0].role} · #{scorers[0].rank}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, paddingTop:20, borderTop:'1.5px solid rgba(26,19,0,.25)', position:'relative' }}>
              {[{l:'Goles',v:scorers[0].goals},{l:'Asists.',v:scorers[0].assists},{l:'Tiros',v:14}].map(s => (
                <div key={s.l}><Eyebrow tone="gold">{s.l}</Eyebrow><div className="gc-display" style={{ fontSize:48 }}><CountInt to={s.v} /></div></div>
              ))}
            </div>
          </div>
          {/* lista */}
          <div style={{ background:'rgba(247,241,223,.06)', borderRadius:14, padding:24, border:'1px solid rgba(247,241,223,.12)' }}>
            <ScorersListOnDark items={scorers} />
          </div>
        </div>
      </Band>

      {/* ══ 04 · ÁLBUM DIGITAL · band dorada ══ */}
      <Band tone="gold" withFloodlight={<Floodlight size={700} color="var(--red)" opacity={.2} bottom={-300} left={-200} blend="multiply" />}>
        <div className="gc-row" style={{ justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, position:'relative' }}>
          <div>
            <Eyebrow tone="gold"><b style={{ fontFamily:'var(--f-display)', fontSize:22, fontWeight:400, color:'currentColor' }}>04</b> · ÁLBUM DIGITAL</Eyebrow>
            <h2 style={{ fontFamily:'var(--f-display)', fontSize:'clamp(48px,6vw,88px)', lineHeight:.85, margin:'8px 0 0', textTransform:'uppercase' }}>
              Coleccionar,<br/>intercambiar, brillar.
            </h2>
          </div>
          <div className="gc-col gc-gap-xs" style={{ alignItems:'flex-end', textAlign:'right' }}>
            <div className="gc-display" style={{ fontSize:96, lineHeight:.82 }}>
              <CountInt to={album.owned} />
              <span style={{ opacity:.35 }}>/{album.total}</span>
            </div>
            <span className="gc-mono" style={{ fontSize:12, letterSpacing:'.1em' }}>
              {album.pctComplete}% COMPLETO · {album.duplicates} REPETIDAS · {album.trades} TRADES ABIERTOS
            </span>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:24, position:'relative' }}>
          {/* grilla de láminas */}
          <div style={{ background:'var(--paper)', color:'var(--ink)', borderRadius:16, padding:24 }}>
            <div className="gc-row" style={{ justifyContent:'space-between', marginBottom:14, alignItems:'baseline' }}>
              <Eyebrow>↘ SECCIÓN · LÁMINAS 24 → 35</Eyebrow>
              <Pill tone="gold">3 BRILLOS DESBLOQUEADOS</Pill>
            </div>
            <StickerGrid cells={album.sample} cols={6} />
          </div>
          {/* trade activo + próximo paquete */}
          <div className="gc-col gc-gap-md">
            {/* intercambio activo */}
            <div style={{ background:'var(--ink)', color:'var(--paper)', borderRadius:16, padding:24, position:'relative', overflow:'hidden' }}>
              <Eyebrow tone="gold">↘ INTERCAMBIO ACTIVO</Eyebrow>
              <h4 style={{ fontFamily:'var(--f-display)', fontSize:30, margin:'8px 0 14px', lineHeight:.9, textTransform:'uppercase' }}>
                Tú × {album.activeTrade.withUser}
              </h4>
              <div className="gc-row gc-gap-md" style={{ alignItems:'center', justifyContent:'center', padding:'12px 0' }}>
                <div className="gc-col gc-gap-xs" style={{ alignItems:'center' }}>
                  <div className="gc-shimmer" style={{ width:64, height:84, borderRadius:6 }} />
                  <span className="gc-mono" style={{ fontSize:10, opacity:.8, letterSpacing:'.08em' }}>N° {album.activeTrade.give.n} · {album.activeTrade.give.name}</span>
                </div>
                <span style={{ fontFamily:'var(--f-display)', fontSize:28, opacity:.55 }}>⇄</span>
                <div className="gc-col gc-gap-xs" style={{ alignItems:'center' }}>
                  <div style={{ width:64, height:84, borderRadius:6, background:'var(--paper-2)', border:'1px solid rgba(247,241,223,.2)' }} />
                  <span className="gc-mono" style={{ fontSize:10, opacity:.8, letterSpacing:'.08em' }}>N° {album.activeTrade.receive.n} · {album.activeTrade.receive.name}</span>
                </div>
              </div>
              <div className="gc-row" style={{ justifyContent:'space-between', paddingTop:12, borderTop:'1px solid rgba(247,241,223,.18)', fontSize:12 }}>
                <span style={{ opacity:.7 }}>Esperando confirmación · {album.activeTrade.expiresIn}</span>
                <span style={{ color:'var(--gold)', fontWeight:700, fontFamily:'var(--f-sub)', letterSpacing:'.08em', textTransform:'uppercase', cursor:'pointer' }}>
                  Aceptar →
                </span>
              </div>
            </div>
            {/* próximo paquete */}
            <div style={{ background:'var(--paper)', color:'var(--ink)', borderRadius:16, padding:24 }}>
              <Eyebrow>↘ PRÓXIMO PAQUETE GRATIS</Eyebrow>
              <h4 style={{ fontFamily:'var(--f-display)', fontSize:38, margin:'6px 0 4px', lineHeight:.9 }}>{album.nextPackIn}</h4>
              <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)' }}>Después de tu próximo partido en vivo</span>
              <div style={{ marginTop:14 }}>
                <button className="gc-btn" style={{ padding:'10px 18px', fontSize:12 }}
                  onClick={() => navigate('/album')}>
                  Abrir paquete · 50 GCoins
                </button>
              </div>
            </div>
          </div>
        </div>
      </Band>

      {/* ══ 05 · TUS ENTRADAS ══ */}
      <SectionHead num="05" label="TUS ENTRADAS · DEL HUB AL TORNIQUETE" title="Tus entradas"
        right={<span className="gc-mono gc-uppercase" style={{ fontSize:11, color:'var(--muted)', letterSpacing:'.12em' }}>RF-17 → RF-22</span>} />
      <div style={{ padding:'22px 56px 0', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
      </div>

      {/* ══ 06 · 32 NACIONES ══ */}
      <SectionHead num="06" label="32 NACIONES · EL MAPA DEL TORNEO" title="32 Naciones"
        right={<span className="gc-link" style={{ cursor:'pointer' }} onClick={() => navigate('/nations')}>Explorar selecciones →</span>} />
      <div style={{ padding:'22px 56px 0', display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:12 }}>
        {nations.map(n => (
          <div key={n.code} className="gc-card gc-hover" style={{ padding:16, cursor:'pointer' }}>
            <Flag code={n.code} size={40} />
            <div className="gc-mono" style={{ fontSize:10, color:'var(--muted)', letterSpacing:'.08em', marginTop:12 }}>{n.code} · GRP {n.group}</div>
            <div style={{ fontWeight:700, fontSize:13, marginTop:2 }}>{n.name}</div>
          </div>
        ))}
      </div>

      {/* ══ 07 · BROADCAST MOMENTS ══ */}
      <SectionHead num="07" label="BROADCAST MOMENTS · STATS · RECAPS" title="Broadcast Moments"
        right={<span className="gc-link" style={{ cursor:'pointer' }}>Toda la cobertura →</span>} />
      <div style={{ padding:'22px 56px 48px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {moments.map((m,i) => (
          <div key={i} className="gc-card gc-hover" style={{ padding:22 }}>
            <div className="gc-row" style={{ justifyContent:'space-between', marginBottom:12 }}>
              <Pill tone="green">{m.tag}</Pill>
              <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)' }}>{m.time}</span>
            </div>
            <h4 style={{ fontFamily:'var(--f-display)', fontSize:30, margin:'6px 0 8px', lineHeight:.9 }}>{m.title}</h4>
            <p style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.5 }}>{m.body}</p>
            <span className="gc-mono" style={{ fontSize:11, color:'var(--muted)', marginTop:12, display:'block', letterSpacing:'.08em' }}>{m.match}</span>
          </div>
        ))}
      </div>

    </PageShell>
  )
}
