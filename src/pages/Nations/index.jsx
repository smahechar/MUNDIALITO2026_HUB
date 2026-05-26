import { useEffect, useMemo, useState } from 'react'
import { PageShell, PageHeader, Footer } from '@/components/shared/Layout'
import { Eyebrow } from '@/components/shared/atoms'
import { nationsService } from '@/services/nations.service'

// ─── Mini flag — stripes rendered as CSS ──────────────────────────────────────
function MiniFlag({ colors = [], layout = 'h', size = 40 }) {
  const fallbackColors = colors?.length ? colors : ['#ddd', '#bbb', '#999']
  const [a, b, c] = fallbackColors

  const base = {
    width: size * 1.5,
    height: size,
    borderRadius: 4,
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid rgba(0,0,0,.1)',
  }

  if (layout === 'v') {
    return (
      <div style={{ ...base, display: 'flex' }}>
        {[a, b, c].map((col, i) => (
          <div key={i} style={{ flex: 1, background: col }} />
        ))}
      </div>
    )
  }

  if (layout === 'cross') {
    return (
      <div
        style={{
          ...base,
          background: a,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: `${size}px ${size * 1.5}px 0 0`,
            borderColor: `transparent ${b} transparent transparent`,
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ ...base, display: 'flex', flexDirection: 'column' }}>
      {[a, b, c].map((col, i) => (
        <div key={i} style={{ flex: 1, background: col }} />
      ))}
    </div>
  )
}

// ─── NationCard ───────────────────────────────────────────────────────────────
function NationCard({ nation, standing }) {
  const played = standing?.played ?? standing?.pj ?? 0
  const pts = standing?.pts ?? 0
  const gf = standing?.gf ?? 0
  const ga = standing?.ga ?? 0
  const gd = standing?.gd ?? gf - ga

  return (
    <div
      className="gc-card gc-hover"
      style={{
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'default',
      }}
    >
      <MiniFlag colors={nation.colors} layout={nation.layout} size={36} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 22,
            lineHeight: 0.9,
            textTransform: 'uppercase',
          }}
        >
          {nation.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            opacity: 0.45,
            letterSpacing: '.1em',
            marginTop: 4,
          }}
        >
          {nation.code} · GRUPO {nation.group || '—'}
        </div>
      </div>

      {standing && (
        <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
          {[
            { label: 'PJ', val: played },
            { label: 'PTS', val: pts },
            { label: 'GD', val: gd >= 0 ? `+${gd}` : gd },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', minWidth: 28 }}>
              <div
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  opacity: 0.4,
                  letterSpacing: '.1em',
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 22,
                  lineHeight: 0.9,
                  marginTop: 2,
                }}
              >
                {s.val}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── GroupStandings table ─────────────────────────────────────────────────────
function GroupTable({ group }) {
  const teams = Array.isArray(group?.teams) ? group.teams : []

  return (
    <div className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 40px 40px 40px 40px 40px 40px 48px',
          gap: 4,
          padding: '10px 18px',
          background: 'var(--ink)',
          color: 'var(--paper)',
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          letterSpacing: '.1em',
          opacity: 1,
        }}
      >
        {['SELECCIÓN', 'PJ', 'G', 'E', 'P', 'GF', 'GA', 'PTS'].map(h => (
          <div key={h} style={{ textAlign: h === 'SELECCIÓN' ? 'left' : 'center', opacity: 0.55 }}>
            {h}
          </div>
        ))}
      </div>

      {teams.map((t, i) => {
        const played = t.played ?? t.pj ?? 0
        const wins = t.w ?? t.g ?? 0
        const draws = t.d ?? t.e ?? 0
        const losses = t.l ?? t.p ?? 0
        const gf = t.gf ?? 0
        const ga = t.ga ?? 0
        const pts = t.pts ?? 0

        return (
          <div
            key={t.code ?? `${group.name}-${i}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 40px 40px 40px 40px 40px 40px 48px',
              gap: 4,
              padding: '12px 18px',
              borderBottom: i < teams.length - 1 ? '1px solid var(--rule)' : 'none',
              background: i < 2 ? 'rgba(0,0,0,0)' : 'transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {i < 2 && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    flexShrink: 0,
                  }}
                />
              )}

              <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 700, fontSize: 13 }}>
                {t.name}
              </span>

              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  opacity: 0.4,
                  letterSpacing: '.06em',
                }}
              >
                {t.code}
              </span>
            </div>

            {[played, wins, draws, losses, gf, ga].map((v, j) => (
              <div
                key={j}
                style={{
                  textAlign: 'center',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 13,
                  opacity: 0.7,
                }}
              >
                {v}
              </div>
            ))}

            <div
              style={{
                textAlign: 'center',
                fontFamily: 'var(--f-display)',
                fontSize: 22,
                lineHeight: 0.9,
              }}
            >
              {pts}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── NationsPage ──────────────────────────────────────────────────────────────
export default function NationsPage() {
  const [view, setView] = useState('grupos')
  const [search, setSearch] = useState('')
  const [groupFilter, setGF] = useState('all')

  const [nations, setNations] = useState([])
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        const [nationsData, groupsData] = await Promise.all([
          nationsService.getAll(),
          nationsService.getGroups(),
        ])

        setNations(Array.isArray(nationsData) ? nationsData : [])
        setGroups(Array.isArray(groupsData) ? groupsData : [])
      } catch (err) {
        console.error('Error cargando naciones:', err)
        setError(err)
        setNations([])
        setGroups([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const groupOptions = useMemo(() => {
    const values = new Set()

    nations.forEach(n => {
      if (n.group) values.add(n.group)
    })

    groups.forEach(g => {
      if (g.group) values.add(g.group)
      if (g.name) values.add(g.name)
    })

    return ['all', ...Array.from(values).sort()]
  }, [nations, groups])

  const filtered = useMemo(() => {
    return nations.filter(n => {
      const name = String(n.name ?? '').toLowerCase()
      const code = String(n.code ?? '').toLowerCase()
      const group = String(n.group ?? '')

      const term = search.toLowerCase()

      const matchSearch = !search || name.includes(term) || code.includes(term)
      const matchGroup = groupFilter === 'all' || group === groupFilter

      return matchSearch && matchGroup
    })
  }, [nations, search, groupFilter])

  const standingByCode = useMemo(() => {
    const lookup = {}

    groups.forEach(g => {
      const teams = Array.isArray(g.teams) ? g.teams : []

      teams.forEach(t => {
        if (t.code) lookup[t.code] = t
      })
    })

    return lookup
  }, [groups])

  return (
    <PageShell>
      <PageHeader
        kicker={`${nations.length} SELECCIONES · ${groups.length} GRUPOS · GLOBAL CUP 2026`}
        title={
          <>
            Naciones<span style={{ color: 'var(--gold)' }}>.</span>
          </>
        }
        lede="Las selecciones clasificadas al Global Cup 2026. Seguí el rendimiento de cada equipo, conocé sus grupos y sus posiciones en la tabla."
      />

      {isLoading && (
        <div style={{ padding: '24px 56px 0' }}>
          <div className="gc-card" style={{ padding: 40, textAlign: 'center' }}>
            <Eyebrow>CARGANDO</Eyebrow>
            <h3
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 38,
                margin: '10px 0',
                lineHeight: 0.9,
              }}
            >
              Cargando naciones desde la base de datos…
            </h3>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '24px 56px 0' }}>
          <div className="gc-card" style={{ padding: 40, textAlign: 'center' }}>
            <Eyebrow>ERROR API</Eyebrow>
            <h3
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 38,
                margin: '10px 0',
                lineHeight: 0.9,
              }}
            >
              No se pudieron cargar las naciones
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>{error.message}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* View toggle + search */}
          <div
            style={{
              padding: '0 56px',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div className="gc-tabs" style={{ flexShrink: 0 }}>
              <button className={view === 'grupos' ? 'is-on' : ''} onClick={() => setView('grupos')}>
                GRUPOS
              </button>
              <button
                className={view === 'selecciones' ? 'is-on' : ''}
                onClick={() => setView('selecciones')}
              >
                SELECCIONES
              </button>
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
                  {groupOptions.map(g => (
                    <button key={g} className={groupFilter === g ? 'is-on' : ''} onClick={() => setGF(g)}>
                      {g === 'all' ? 'TODOS' : `GRP ${g}`}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── View: Grupos ───────────────────────────────────────────────── */}
          {view === 'grupos' && (
            <div
              style={{
                padding: '24px 56px 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: 24,
              }}
            >
              {groups.length === 0 ? (
                <div className="gc-card" style={{ padding: 60, textAlign: 'center' }}>
                  <Eyebrow>SIN GRUPOS</Eyebrow>
                  <h3
                    style={{
                      fontFamily: 'var(--f-display)',
                      fontSize: 36,
                      margin: '10px 0',
                      lineHeight: 0.9,
                    }}
                  >
                    No hay grupos registrados.
                  </h3>
                </div>
              ) : (
                groups.map(g => {
                  const groupName = g.name ?? g.group ?? '—'

                  return (
                    <div key={groupName}>
                      <div
                        style={{
                          marginBottom: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: 'var(--ink)',
                            color: 'var(--paper)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--f-display)',
                            fontSize: 20,
                          }}
                        >
                          {groupName}
                        </div>
                        <Eyebrow>GRUPO {groupName}</Eyebrow>
                      </div>

                      <GroupTable group={{ ...g, name: groupName }} />
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ── View: Selecciones ──────────────────────────────────────────── */}
          {view === 'selecciones' && (
            <div style={{ padding: '24px 56px 0' }}>
              {filtered.length === 0 ? (
                <div className="gc-card" style={{ padding: 60, textAlign: 'center' }}>
                  <Eyebrow>SIN RESULTADOS</Eyebrow>
                  <h3
                    style={{
                      fontFamily: 'var(--f-display)',
                      fontSize: 36,
                      margin: '10px 0',
                      lineHeight: 0.9,
                    }}
                  >
                    Nada por acá.
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                    Probá con otro nombre o código.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 12,
                  }}
                >
                  {filtered.map(n => (
                    <NationCard key={n.code} nation={n} standing={standingByCode[n.code]} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div style={{ height: 60 }} />
      <Footer />
    </PageShell>
  )
}