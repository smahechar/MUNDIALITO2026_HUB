import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell, Band, Floodlight } from '@/components/shared/Layout'
import { Flag, Eyebrow, Pill, Btn, CountInt } from '@/components/shared/atoms'
import { ModalOverlay } from '@/components/shared/Modal'
import { usePoolDetail } from '@/hooks/usePools'
import { userPredictions, scoringRules } from '@/mocks/data/pools'

// ─── InviteModal ──────────────────────────────────────────────────────────────
function InviteModal({ pool, onClose }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(pool.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareText = `Unite a la polla "${pool.name}" en Mundial Hub 2026. Código: ${pool.code}`

  return (
    <ModalOverlay onClose={onClose} maxWidth={460}>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: '0 0 6px', lineHeight: .9, textTransform: 'uppercase' }}>
        Invitá amigos
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 24px', lineHeight: 1.5 }}>
        Compartí el código a continuación. Cualquier usuario del Hub puede usarlo para unirse a <strong>{pool.name}</strong>.
      </p>

      {/* Code display */}
      <div style={{
        padding: '22px 24px', borderRadius: 14, marginBottom: 20,
        background: 'var(--ink)', color: 'var(--paper)', textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .45, letterSpacing: '.14em', marginBottom: 6, textTransform: 'uppercase' }}>
          Código de invitación
        </div>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: 52, letterSpacing: '.06em', lineHeight: 1 }}>
          {pool.code}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Btn kind="primary" onClick={copy} style={{ flex: 1, justifyContent: 'center' }}>
          {copied ? '✓ Copiado' : 'Copiar código'}
        </Btn>
        {navigator.share && (
          <Btn
            kind="ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => navigator.share({ title: `Polla: ${pool.name}`, text: shareText })}
          >
            Compartir →
          </Btn>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '16px 0 0', fontFamily: 'var(--f-mono)', lineHeight: 1.5 }}>
        Para unirse: ir a Pollas → "Unirse con código" → ingresar <strong>{pool.code}</strong>
      </p>
    </ModalOverlay>
  )
}

// ─── RankBadge ───────────────────────────────────────────────────────────────
function RankBadge({ rank, size = 28, tone = 'auto' }) {
  const t = tone === 'auto'
    ? (rank === 1 ? 'gold' : rank <= 3 ? 'ink' : 'muted')
    : tone
  const map = {
    gold:  { bg: 'var(--gold)',    fg: 'var(--gold-ink)' },
    ink:   { bg: 'var(--ink)',     fg: 'var(--paper)'    },
    muted: { bg: 'var(--paper-2)', fg: 'var(--muted)'    },
  }
  const s = map[t] || map.muted
  return (
    <span className="gc-mono" style={{
      width: size, height: size, borderRadius: 6,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: s.bg, color: s.fg,
      fontSize: size >= 32 ? 13 : 11, fontWeight: 800, letterSpacing: 0,
    }}>{rank}</span>
  )
}

// ─── MovementIndicator ────────────────────────────────────────────────────────
function MovementIndicator({ change }) {
  if (change === 0) return <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>—</span>
  const up = change > 0
  return (
    <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)' }}>
      {up ? '▲' : '▼'} {Math.abs(change)}
    </span>
  )
}

// ─── PoolStandings ────────────────────────────────────────────────────────────
function PoolStandings({ members }) {
  return (
    <div className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="gc-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ paddingLeft: 22, width: 60 }}>#</th>
            <th>Miembro</th>
            <th style={{ textAlign: 'right' }}>Exactos</th>
            <th style={{ textAlign: 'right' }}>Aciertos</th>
            <th style={{ textAlign: 'right', width: 60 }}>Mov.</th>
            <th style={{ textAlign: 'right', paddingRight: 22, width: 100 }}>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => {
            const rank = m.rank || (i + 1)
            const isYou = m.isYou
            return (
              <tr key={m.id} style={{ background: isYou ? 'var(--paper-2)' : 'transparent' }}>
                <td style={{ paddingLeft: 22 }}><RankBadge rank={rank} /></td>
                <td>
                  <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
                    <span style={{ fontWeight: isYou ? 800 : 600, fontSize: 14 }}>{m.name}</span>
                    {m.hot && <Pill tone="default" style={{ fontSize: 9, padding: '2px 6px', background: 'var(--red)', color: 'var(--red-ink)', borderColor: 'transparent' }}>HOT</Pill>}
                    {isYou && <Pill tone="ink" style={{ fontSize: 9, padding: '2px 6px' }}>TÚ</Pill>}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>{m.exact}</td>
                <td style={{ textAlign: 'right' }}>{m.winner}</td>
                <td style={{ textAlign: 'right' }}><MovementIndicator change={m.lastChange} /></td>
                <td style={{ textAlign: 'right', paddingRight: 22, fontFamily: 'var(--f-display)', fontSize: 24, lineHeight: 1, color: isYou ? 'var(--red)' : 'var(--ink)' }}>
                  {m.pts}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── PodiumStep ───────────────────────────────────────────────────────────────
function PodiumStep({ member, rank, height, tone }) {
  if (!member) return <div />
  const bg = tone === 'gold' ? 'var(--gold)' : tone === 'ink' ? 'var(--ink)' : 'var(--paper-2)'
  const fg = tone === 'gold' ? 'var(--gold-ink)' : tone === 'ink' ? 'var(--paper)' : 'var(--ink)'
  return (
    <div className="gc-col gc-gap-sm" style={{ alignItems: 'center' }}>
      <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
        <RankBadge rank={rank} size={40} tone={tone === 'muted' ? 'muted' : tone} />
        <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 18, textTransform: 'uppercase', letterSpacing: '.01em', textAlign: 'center' }}>{member.name}</span>
        {member.isYou && <Pill tone="ink" style={{ fontSize: 9, padding: '2px 6px', background: 'var(--red)', color: 'var(--red-ink)', borderColor: 'transparent' }}>TÚ</Pill>}
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>{member.exact} ex · {member.winner} ac</span>
      </div>
      <div style={{
        height, width: '100%', background: bg, color: fg,
        borderRadius: '10px 10px 0 0',
        border: tone === 'muted' ? '1px solid var(--rule)' : 'none',
        borderBottom: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '12px 16px', position: 'relative', overflow: 'hidden',
      }}>
        {tone === 'gold' && (
          <div className="gc-floodlight" style={{ width: 200, height: 200, top: -100, left: -40, background: 'radial-gradient(circle, #fff3b8, transparent 60%)', opacity: .6, mixBlendMode: 'screen' }} />
        )}
        <Eyebrow style={{ color: fg, opacity: .7 }}>PUNTOS</Eyebrow>
        <span style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1, marginTop: 4 }}>{member.pts}</span>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function PoolTabs({ active, onSelect }) {
  const tabs = [
    { id: 'leaderboard', label: 'Tabla' },
    { id: 'yours',       label: 'Tus picks' },
    { id: 'history',     label: 'Historial' },
    { id: 'rules',       label: 'Reglas' },
  ]
  return (
    <div style={{ borderBottom: '2px solid var(--rule)', display: 'flex', gap: 0, padding: '0 56px', marginTop: 24 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)} style={{
          padding: '14px 22px', border: 0, background: 'transparent',
          fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 13,
          textTransform: 'uppercase', letterSpacing: '.06em', cursor: 'pointer',
          color: active === t.id ? 'var(--ink)' : 'var(--muted)',
          borderBottom: active === t.id ? '2px solid var(--ink)' : '2px solid transparent',
          marginBottom: -2, transition: 'color .15s ease, border-color .15s ease',
        }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── PoolHeaderBlock ──────────────────────────────────────────────────────────
function PoolHeaderBlock({ pool, members, navigate, onInvite }) {
  const you = members.find(m => m.isYou)
  const youRank = you ? (you.rank || members.findIndex(m => m.isYou) + 1) : '—'
  const leader = members[0]
  const gap = leader && you ? leader.pts - you.pts : 0

  return (
    <section className="bc-hero-stage" style={{ paddingBottom: 32 }}>
      <Floodlight size={620} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.3} top={-260} right={-100} blend="multiply" />
      <Floodlight size={460} color="color-mix(in oklab, var(--red) 55%, transparent)"  opacity={.25} bottom={-200} left={-160} blend="multiply" />

      <div style={{ padding: '20px 56px 0', position: 'relative', zIndex: 2 }}>
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div className="gc-col gc-gap-xs">
            <Eyebrow>POOL · {pool.code} · {pool.hostType}</Eyebrow>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 6vw, 88px)', margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>
              {pool.name}
            </h1>
          </div>
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost" onClick={onInvite}>Invitar →</Btn>
            <Btn kind="accent" onClick={() => navigate('/predict/m4')}>Predecir →</Btn>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 56px 0', position: 'relative', zIndex: 1 }}>
        <div className="gc-rule-double" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, padding: '28px 56px 0', position: 'relative' }}>
        <div className="gc-card gc-card-ink" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <Eyebrow tone="onDark">↘ TU POSICIÓN</Eyebrow>
          <div className="gc-row gc-gap-md" style={{ alignItems: 'baseline', marginTop: 6 }}>
            <RankBadge rank={typeof youRank === 'number' ? youRank : 1} size={40} tone={youRank === 1 ? 'gold' : 'muted'} />
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 56, lineHeight: .85, color: 'var(--paper)' }}>
              {you ? you.pts : pool.yourPts}
            </span>
            <span className="gc-mono" style={{ fontSize: 11, opacity: .65, letterSpacing: '.08em', color: 'var(--paper)' }}>PTS</span>
          </div>
        </div>
        <div className="gc-card" style={{ padding: 20 }}>
          <Eyebrow>LÍDER</Eyebrow>
          <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 20, textTransform: 'uppercase', display: 'block', marginTop: 6 }}>
            {pool.top}
          </span>
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
            {pool.topPts} pts {gap > 0 ? `· +${gap} sobre ti` : '= tú'}
          </span>
        </div>
        <div className="gc-card" style={{ padding: 20 }}>
          <Eyebrow>MIEMBROS</Eyebrow>
          <div className="gc-display" style={{ fontSize: 38, lineHeight: .9, marginTop: 6 }}>
            <CountInt to={pool.members} />
          </div>
        </div>
        <div className="gc-card gc-card-gold" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <Eyebrow tone="gold">↘ PREMIO</Eyebrow>
          <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 18, textTransform: 'uppercase', display: 'block', marginTop: 6, lineHeight: 1.05 }}>
            {pool.prize}
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── Leaderboard tab ──────────────────────────────────────────────────────────
function LeaderboardTab({ members, pool }) {
  const hot = members.filter(m => m.hot).slice(0, 3)
  return (
    <div className="gc-col gc-gap-md">
      {/* Podium */}
      {members.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'end' }}>
          <PodiumStep member={members[1]} rank={2} height={140} tone="ink"  />
          <PodiumStep member={members[0]} rank={1} height={180} tone="gold" />
          <PodiumStep member={members[2]} rank={3} height={120} tone="muted" />
        </div>
      )}

      {/* En racha */}
      {hot.length > 0 && (
        <div className="gc-card" style={{ padding: 22 }}>
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <Eyebrow tone="red">↘ EN RACHA · ESTA SEMANA</Eyebrow>
            <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>HOT STREAK</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(hot.length, 3)}, 1fr)`, gap: 14 }}>
            {hot.map((m, i) => (
              <div key={m.id} className="gc-row gc-gap-sm" style={{
                padding: '14px 16px', background: 'var(--paper-2)', borderRadius: 10,
                alignItems: 'center', borderLeft: '3px solid var(--red)',
              }}>
                <RankBadge rank={members.findIndex(x => x.id === m.id) + 1} />
                <div className="gc-col" style={{ flex: 1, minWidth: 0 }}>
                  <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</span>
                  <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.06em' }}>{m.exact} exactos · {m.winner} aciertos</span>
                </div>
                <span className="gc-display" style={{ fontSize: 28 }}>{m.pts}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla completa */}
      <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0' }}>
        <Eyebrow>↘ TABLA COMPLETA · {members.length} MIEMBROS</Eyebrow>
        <button className="gc-btn gc-btn-ghost" style={{ padding: '8px 14px', fontSize: 11 }}>Exportar CSV</button>
      </div>
      <PoolStandings members={members} />
    </div>
  )
}

// ─── Tus picks tab ────────────────────────────────────────────────────────────
function YourPicksTab({ navigate }) {
  const open   = userPredictions.filter(p => p.status === 'open')
  const live   = userPredictions.filter(p => p.status === 'live')
  const recent = userPredictions.filter(p => p.status === 'settled').slice(0, 4)

  return (
    <div className="gc-col gc-gap-md">
      {live.length > 0 && <>
        <Eyebrow tone="red">↘ LIVE · EN JUEGO AHORA</Eyebrow>
        {live.map(p => (
          <div key={p.id} className="gc-card gc-live-card gc-hover no-accent" onClick={() => navigate(`/match/${p.matchId}`)}
            style={{ padding: 20, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div className="gc-col gc-gap-xs">
              <Eyebrow tone="red">EN VIVO</Eyebrow>
              <span className="gc-mono" style={{ fontSize: 12, letterSpacing: '.08em' }}>Match {p.matchId.toUpperCase()}</span>
            </div>
            <div className="gc-row gc-gap-sm" style={{ alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 36, color: 'var(--red)' }}>{p.home}</span>
              <span className="gc-mono" style={{ color: 'var(--muted)' }}>—</span>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 36, color: 'var(--red)' }}>{p.away}</span>
            </div>
            <div className="gc-col" style={{ alignItems: 'flex-end' }}>
              <Pill live style={{ fontSize: 10 }}>LIVE</Pill>
              <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, color: p.currentPts > 0 ? 'var(--green)' : 'var(--muted)' }}>+{p.currentPts}</span>
            </div>
          </div>
        ))}
      </>}

      <Eyebrow>↘ ABIERTAS · {open.length}</Eyebrow>
      {open.map(p => (
        <div key={p.id} className="gc-hover" onClick={() => navigate(`/predict/${p.matchId}`)} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', background: 'var(--paper)', border: '1px solid var(--rule)',
          borderRadius: 10, cursor: 'pointer', gap: 12,
        }}>
          <span className="gc-mono" style={{ fontSize: 12, letterSpacing: '.08em' }}>Match {p.matchId.toUpperCase()}</span>
          {p.home !== null
            ? <span style={{ fontFamily: 'var(--f-display)', fontSize: 28 }}>{p.home} — {p.away}</span>
            : <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>SIN PICK</span>
          }
          <div className="gc-row gc-gap-sm">
            {p.doubleDown && <Pill tone="gold" style={{ fontSize: 9 }}>×2</Pill>}
            <Pill style={{ fontSize: 10 }}>CIERRA {p.locksAt}</Pill>
          </div>
        </div>
      ))}

      {recent.length > 0 && <>
        <Eyebrow>↘ RECIENTES · LIQUIDADAS</Eyebrow>
        {recent.map(p => (
          <div key={p.id} className="gc-hover" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', background: 'var(--paper)', border: '1px solid var(--rule)',
            borderRadius: 10, cursor: 'pointer', gap: 12,
          }}>
            <span className="gc-mono" style={{ fontSize: 12, letterSpacing: '.08em' }}>Match {p.matchId.toUpperCase()}</span>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 28 }}>{p.home} — {p.away}</span>
            <span style={{
              fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 999,
              background: p.kind === 'exact' ? 'var(--green)' : p.kind === 'miss' ? 'transparent' : 'var(--ink)',
              color: p.kind === 'exact' ? 'var(--green-ink)' : p.kind === 'miss' ? 'var(--muted)' : 'var(--paper)',
              border: p.kind === 'miss' ? '1px dashed var(--rule)' : 'none',
            }}>
              {p.kind === 'exact' ? 'EXACTO' : p.kind === 'diff' ? 'DIFF' : p.kind === 'winner' ? 'GANADOR' : 'MISS'} +{p.pts}
            </span>
          </div>
        ))}
      </>}
    </div>
  )
}

// ─── Historial tab ────────────────────────────────────────────────────────────
function HistoryTab({ navigate }) {
  const settled = userPredictions.filter(p => p.status === 'settled')
  const total   = settled.reduce((s, p) => s + p.pts, 0)
  const exact   = settled.filter(p => p.kind === 'exact').length
  const winner  = settled.filter(p => p.kind === 'winner' || p.kind === 'diff').length
  const miss    = settled.filter(p => p.kind === 'miss').length

  const tiles = [
    { label: 'PUNTOS TOTALES', value: total,  change: `${settled.length} predicciones`,  bg: 'var(--ink)', fg: 'var(--paper)' },
    { label: 'EXACTOS',        value: exact,  change: `${settled.length ? ((exact/settled.length)*100).toFixed(0) : 0}% de acierto`, bg: 'var(--gold)', fg: 'var(--gold-ink)' },
    { label: 'DIF / GANADOR',  value: winner, change: 'Aciertos parciales', bg: 'var(--paper-2)', fg: 'var(--ink)' },
    { label: 'MISSES',         value: miss,   change: 'Para olvidar',        bg: 'var(--red)',    fg: 'var(--red-ink)' },
  ]

  return (
    <div className="gc-col gc-gap-md">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {tiles.map(t => (
          <div key={t.label} style={{ background: t.bg, color: t.fg, borderRadius: 14, padding: 20 }}>
            <div className="gc-eyebrow" style={{ fontSize: 10, letterSpacing: '.12em', color: 'currentColor', opacity: .65 }}>{t.label}</div>
            <div className="gc-display" style={{ fontSize: 56, lineHeight: .85, margin: '8px 0 4px' }}>
              <CountInt to={t.value} />
            </div>
            <div className="gc-mono" style={{ fontSize: 11, opacity: .7, letterSpacing: '.06em' }}>{t.change}</div>
          </div>
        ))}
      </div>

      <Eyebrow>↘ HISTORIAL · MATCH BY MATCH</Eyebrow>
      <div className="gc-col" style={{ gap: 8 }}>
        {settled.map(p => (
          <div key={p.id} className="gc-hover" onClick={() => navigate(`/match/${p.matchId}`)} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', background: 'var(--paper)', border: '1px solid var(--rule)',
            borderRadius: 10, cursor: 'pointer', gap: 12,
          }}>
            <span className="gc-mono" style={{ fontSize: 12, letterSpacing: '.08em' }}>Match {p.matchId.toUpperCase()}</span>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 28 }}>{p.home} — {p.away}</span>
            <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
                padding: '3px 10px', borderRadius: 999,
                background: p.kind === 'exact' ? 'var(--green)' : p.kind === 'miss' ? 'transparent' : 'var(--ink)',
                color: p.kind === 'exact' ? 'var(--green-ink)' : p.kind === 'miss' ? 'var(--muted)' : 'var(--paper)',
                border: p.kind === 'miss' ? '1px dashed var(--rule)' : 'none',
              }}>
                {p.kind === 'exact' ? 'EXACTO' : p.kind === 'diff' ? 'DIFF' : p.kind === 'winner' ? 'GANADOR' : 'MISS'}
              </span>
              <span className="gc-display" style={{ fontSize: 22, color: p.pts > 0 ? 'var(--ink)' : 'var(--muted)' }}>+{p.pts}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Reglas tab ───────────────────────────────────────────────────────────────
function RulesTab({ pool }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
      {/* Scoring rules */}
      <div className="gc-card" style={{ padding: 24 }}>
        <Eyebrow>REGLAS DE PUNTUACIÓN</Eyebrow>
        <div className="gc-col gc-gap-sm" style={{ marginTop: 14 }}>
          {scoringRules.map(r => (
            <div key={r.id} className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
              <div className="gc-col" style={{ flex: 1 }}>
                <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '.02em' }}>{r.label}</span>
                <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.desc}</span>
              </div>
              <span className="gc-display" style={{ fontSize: 26, color: typeof r.pts === 'string' ? 'var(--gold)' : 'var(--ink)' }}>+{r.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pool info */}
      <div className="gc-card gc-card-ink" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div className="gc-floodlight" style={{ width: 360, height: 360, top: -180, right: -120, background: 'radial-gradient(circle, var(--gold), transparent 60%)', opacity: .35, mixBlendMode: 'screen' }} />
        <Eyebrow tone="onDark">↘ PREMIO DEL POOL</Eyebrow>
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 40, margin: '8px 0 14px', lineHeight: .9, textTransform: 'uppercase' }}>
          {pool.prize}
        </h3>
        <div className="gc-row gc-gap-md" style={{ position: 'relative', marginTop: 8 }}>
          <div className="gc-col">
            <Eyebrow tone="onDark" style={{ fontSize: 9 }}>HOST</Eyebrow>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--paper)' }}>{pool.hostType}</span>
          </div>
          <div className="gc-col">
            <Eyebrow tone="onDark" style={{ fontSize: 9 }}>CÓDIGO</Eyebrow>
            <span className="gc-mono" style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.08em', color: 'var(--paper)' }}>{pool.code}</span>
          </div>
          <div className="gc-col">
            <Eyebrow tone="onDark" style={{ fontSize: 9 }}>MIEMBROS</Eyebrow>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--paper)' }}>{pool.members.toLocaleString()}</span>
          </div>
        </div>

        <div className="gc-col gc-gap-sm" style={{ marginTop: 24, position: 'relative' }}>
          <Eyebrow tone="onDark">MULTIPLICADORES ×2 · 3 POR TORNEO</Eyebrow>
          <div className="gc-row gc-gap-sm" style={{ marginTop: 8 }}>
            {[
              { used: pool.usedBonus >= 1, label: pool.usedBonus >= 1 ? 'USADO' : 'DISP.' },
              { used: pool.usedBonus >= 2, label: pool.usedBonus >= 2 ? 'USADO' : 'DISP.' },
              { used: pool.usedBonus >= 3, label: pool.usedBonus >= 3 ? 'USADO' : 'DISP.' },
            ].map((m, i) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 10,
                background: m.used ? 'var(--gold)' : 'transparent',
                color:      m.used ? 'var(--gold-ink)' : 'rgba(247,241,223,.6)',
                border: m.used ? 'none' : '1.5px dashed rgba(247,241,223,.25)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 20, lineHeight: 1 }}>×2</span>
                <span className="gc-mono" style={{ fontSize: 9, letterSpacing: '.1em' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PoolDetailPage() {
  const { id: poolId } = useParams()
  const navigate       = useNavigate()
  const { pool, members, isLoading } = usePoolDetail(poolId)
  const [tab,     setTab]    = useState('leaderboard')
  const [inviting, setInviting] = useState(false)

  const openPredictions = userPredictions.filter(p => p.status === 'open' || p.status === 'live')

  if (isLoading) return (
    <PageShell>
      <div style={{ padding: '80px 56px', textAlign: 'center', color: 'var(--muted)' }}>Cargando pool…</div>
    </PageShell>
  )

  if (!pool) return (
    <PageShell>
      <div style={{ padding: '80px 56px', textAlign: 'center' }}>
        <Eyebrow>POOL NOT FOUND</Eyebrow>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 64, margin: '10px 0', lineHeight: .85 }}>Pool no encontrado.</h2>
        <Btn onClick={() => navigate('/pools')}>← Volver a pollas</Btn>
      </div>
    </PageShell>
  )

  return (
    <PageShell>
      {inviting && <InviteModal pool={pool} onClose={() => setInviting(false)} />}

      {/* breadcrumb */}
      <div style={{ padding: '20px 56px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="gc-row gc-gap-sm">
          <span className="gc-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/pools')}>← Pollas</span>
          <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.08em' }}>/ {pool.code}</span>
        </div>
      </div>

      {/* Hero con stats del pool */}
      <PoolHeaderBlock pool={pool} members={members} navigate={navigate} onInvite={() => setInviting(true)} />

      {/* Tabs */}
      <PoolTabs active={tab} onSelect={setTab} />

      {/* Contenido por tab */}
      <div style={{ padding: '32px 56px 0' }}>
        {tab === 'leaderboard' && <LeaderboardTab members={members} pool={pool} />}
        {tab === 'yours'       && <YourPicksTab navigate={navigate} />}
        {tab === 'history'     && <HistoryTab navigate={navigate} />}
        {tab === 'rules'       && <RulesTab pool={pool} />}
      </div>

      {/* CTA — próxima predicción */}
      {openPredictions.length > 0 && (
        <Band tone="ink" style={{ marginTop: 80 }}>
          <Floodlight size={500} color="var(--gold)" opacity={.22} top={-200} right={-100} />
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 24, position: 'relative', flexWrap: 'wrap' }}>
            <div>
              <Eyebrow tone="onDark">↗ PRÓXIMO CIERRE · {openPredictions[0].locksAt || 'EN JUEGO'}</Eyebrow>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(36px, 5vw, 72px)', margin: '8px 0 0', lineHeight: .85, textTransform: 'uppercase' }}>
                Próxima predicción.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(247,241,223,.7)', maxWidth: 460, marginTop: 10 }}>
                Marcador exacto = 30 pts · Diferencia = 15 pts · Ganador = 10 pts. Tus picks cuentan en todos tus pools.
              </p>
            </div>
            <Btn style={{ background: 'var(--gold)', color: 'var(--gold-ink)' }}
              onClick={() => navigate(`/predict/${openPredictions[0].matchId}`)}>
              Hacer mi pick →
            </Btn>
          </div>
        </Band>
      )}
    </PageShell>
  )
}
