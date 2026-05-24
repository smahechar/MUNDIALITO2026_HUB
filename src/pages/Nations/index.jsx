import { useState } from 'react'
import { PageShell, PageHeader, Footer } from '@/components/shared/Layout'
import { Eyebrow, SectionHead } from '@/components/shared/atoms'
import { nations, groups } from '@/mocks/data/nations'

// ─── Mini flag — stripes rendered as CSS ──────────────────────────────────────
function MiniFlag({ colors = [], layout = 'h', size = 40 }) {
  const [a, b, c] = colors
  const base = {
    width: size * 1.5, height: size, borderRadius: 4, overflow: 'hidden',
    flexShrink: 0, border: '1px solid rgba(0,0,0,.1)',
  }
  if (layout === 'v') {
    return (
      <div style={{ ...base, display: 'flex' }}>
        {[a, b, c].map((col, i) => <div key={i} style={{ flex: 1, background: col }} />)}
      </div>
    )
  }
  if (layout === 'cross') {
    return (
      <div style={{ ...base, background: a, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', height: '30%', background: b }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '20%', height: '100%', background: b }} />
        </div>
      </div>
    )
  }
  if (layout === 'diag') {
    return (
      <div style={{ ...base, background: a, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 0, height: 0,
          borderStyle: 'solid', borderWidth: `${size}px ${size * 1.5}px 0 0`,
          borderColor: `transparent ${b} transparent transparent`,
        }} />
      </div>
    )
  }
  // default: horizontal stripes
  return (
    <div style={{ ...base, display: 'flex', flexDirection: 'column' }}>
      {[a, b, c].map((col, i) => <div key={i} style={{ flex: 1, background: col }} />)}
    </div>
  )
}

// ─── NationCard ───────────────────────────────────────────────────────────────
function NationCard({ nation, standing }) {
  return (
    <div
      className="gc-card gc-hover"
      style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'default' }}
    >
      <MiniFlag colors={nation.colors} layout={nation.layout} size={36} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: .9, textTransform: 'uppercase' }}>
          {nation.name}
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .45, letterSpacing: '.1em', marginTop: 4 }}>
          {nation.code} · GRUPO {nation.group}
        </div>
      </div>

      {standing && (
        <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
          {[
            { label: 'PJ', val: standing.played },
            { label: 'PTS', val: standing.pts },
            { label: 'GD', val: standing.gd >= 0 ? `+${standing.gd}` : standing.gd },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', minWidth: 28 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, opacity: .4, letterSpacing: '.1em' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: .9, marginTop: 2 }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── GroupStandings table ─────────────────────────────────────────────────────
function GroupTable({ group }) {
  return (
    <div className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 40px 40px 40px 40px 40px 40px 48px',
        gap: 4, padding: '10px 18px',
        background: 'var(--ink)', color: 'var(--paper)',
        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.1em', opacity: 1,
      }}>
        {['SELECCIÓN', 'PJ', 'G', 'E', 'P', 'GF', 'GA', 'PTS'].map(h => (
          <div key={h} style={{ textAlign: h === 'SELECCIÓN' ? 'left' : 'center', opacity: .55 }}>{h}</div>
        ))}
      </div>
      {group.teams.map((t, i) => (
        <div key={t.code} style={{
          display: 'grid', gridTemplateColumns: '1fr 40px 40px 40px 40px 40px 40px 48px',
          gap: 4, padding: '12px 18px',
          borderBottom: i < group.teams.length - 1 ? '1px solid var(--rule)' : 'none',
          background: i < 2 ? 'rgba(0,0,0,0)' : 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {i < 2 && (
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: 'var(--green)', flexShrink: 0,
              }} />
            )}
            <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 13 }}>{t.name}</span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, opacity: .4, letterSpacing: '.06em' }}>{t.code}</span>
          </div>
          {[t.played, t.w, t.d, t.l, t.gf, t.ga].map((v, j) => (
            <div key={j} style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 13, opacity: .7 }}>{v}</div>
          ))}
          <div style={{ textAlign: 'center', fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: .9 }}>{t.pts}</div>
        </div>
      ))}
    </div>
  )
}

// ─── NationsPage ──────────────────────────────────────────────────────────────
export default function NationsPage() {
  const [view,      setView]  = useState('grupos')
  const [search,    setSearch] = useState('')
  const [groupFilter, setGF]  = useState('all')

  const filtered = nations.filter(n => {
    const matchSearch = !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.code.toLowerCase().includes(search.toLowerCase())
    const matchGroup  = groupFilter === 'all' || n.group === groupFilter
    return matchSearch && matchGroup
  })

  // Build standing lookup: code → standing object
  const standingByCode = {}
  groups.forEach(g => g.teams.forEach(t => { standingByCode[t.code] = t }))

  return (
    <PageShell>
      <PageHeader
        kicker={`${nations.length} SELECCIONES · 6 GRUPOS · GLOBAL CUP 2026`}
        title={<>Naciones<span style={{ color: 'var(--gold)' }}>.</span></>}
        lede="Las 24 selecciones clasificadas al Global Cup 2026. Seguí el rendimiento de cada equipo, conocé sus grupos y sus posiciones en la tabla."
      />

      {/* View toggle + search */}
      <div style={{ padding: '0 56px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="gc-tabs" style={{ flexShrink: 0 }}>
          <button className={view === 'grupos'    ? 'is-on' : ''} onClick={() => setView('grupos')}>GRUPOS</button>
          <button className={view === 'selecciones' ? 'is-on' : ''} onClick={() => setView('selecciones')}>SELECCIONES</button>
        </div>

        {view === 'selecciones' && (
          <>
            <input
              className="gc-input"
              placeholder="Buscar selección…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 220, padding: '8px 14px', fontSize: 12 }}
            />
            <div className="gc-tabs" style={{ flexShrink: 0 }}>
              {['all', 'A', 'B', 'C', 'D', 'E', 'F'].map(g => (
                <button key={g} className={groupFilter === g ? 'is-on' : ''} onClick={() => setGF(g)}>
                  {g === 'all' ? 'TODOS' : `GRP ${g}`}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── View: Grupos ─────────────────────────────────────────────────────── */}
      {view === 'grupos' && (
        <div style={{ padding: '24px 56px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24 }}>
          {groups.map(g => (
            <div key={g.name}>
              <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--ink)', color: 'var(--paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-display)', fontSize: 20,
                }}>{g.name}</div>
                <Eyebrow>GRUPO {g.name}</Eyebrow>
              </div>
              <GroupTable group={g} />
            </div>
          ))}
        </div>
      )}

      {/* ── View: Selecciones ────────────────────────────────────────────────── */}
      {view === 'selecciones' && (
        <div style={{ padding: '24px 56px 0' }}>
          {filtered.length === 0 ? (
            <div className="gc-card" style={{ padding: 60, textAlign: 'center' }}>
              <Eyebrow>SIN RESULTADOS</Eyebrow>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: '10px 0', lineHeight: .9 }}>Nada por acá.</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>Probá con otro nombre o código.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {filtered.map(n => (
                <NationCard key={n.code} nation={n} standing={standingByCode[n.code]} />
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ height: 60 }} />
      <Footer />
    </PageShell>
  )
}
