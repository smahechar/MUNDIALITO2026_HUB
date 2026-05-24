import { useState, useMemo } from 'react'
import { PageShell, Floodlight, Watermark, Band } from '@/components/shared/Layout'
import { Eyebrow, Btn, SectionHead, useCountUp } from '@/components/shared/atoms'
import { MatchTabs } from '@/components/matches/MatchDetail'
import {
  StickerCard, AlbumProgressBar, NationCard, NationModal,
  PackOpenModal, TradeModal, ActiveTradesSection,
} from '@/components/album'
import { nations } from '@/mocks/data/nations'
import {
  albumTotal, albumOwned, albumDuplicates, albumMissing,
  albumPct, albumSetsComplete,
  getNationStickers, isOwned, isDupe, getDupeStickers,
  pendingTrades,
} from '@/mocks/data/album'

// ─── StatTilePro ─────────────────────────────────────────────────────────────
function StatTilePro({ label, value, change, decimals = 0, tone = 'paper' }) {
  const isNumeric = typeof value === 'number' && !isNaN(value)
  const v = useCountUp(isNumeric ? value : 0, 1400)
  const bg = tone === 'ink' ? 'var(--ink)' : tone === 'red' ? 'var(--red)' : tone === 'gold' ? 'var(--gold)' : tone === 'green' ? 'var(--green)' : 'var(--paper)'
  const fg = tone === 'ink' ? 'var(--paper)' : tone === 'red' ? 'var(--red-ink)' : tone === 'gold' ? 'var(--gold-ink)' : tone === 'green' ? 'var(--green-ink)' : 'var(--ink)'
  const display = !isNumeric ? value : decimals ? v.toFixed(decimals) : value >= 1000 ? Math.round(v).toLocaleString() : Math.round(v)
  return (
    <div className="gc-card gc-hover" style={{ background: bg, color: fg, padding: 24, borderColor: bg === 'var(--paper)' ? 'var(--rule)' : 'transparent', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at 100% 0%, ${tone === 'ink' ? 'rgba(247,241,223,.06)' : 'rgba(255,255,255,.18)'}, transparent 60%)` }} />
      <Eyebrow style={{ color: fg, opacity: .7, position: 'relative' }}>{label}</Eyebrow>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 64, marginTop: 10, lineHeight: .85, position: 'relative' }}>{display}</div>
      <div className="gc-mono" style={{ fontSize: 11.5, marginTop: 12, opacity: .8, letterSpacing: '.06em', position: 'relative' }}>{change}</div>
    </div>
  )
}

// ─── AlbumPage ────────────────────────────────────────────────────────────────
export default function AlbumPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [groupFilter,  setGroupFilter]  = useState('all')
  const [tab,          setTab]          = useState('album')
  const [expandedCode, setExpanded]     = useState(null)
  const [showPack,     setShowPack]     = useState(false)
  const [showTrade,    setShowTrade]    = useState(false)
  const [search,       setSearch]       = useState('')

  const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F']
  const TABS   = [{ id: 'album', label: 'Mi álbum' }, { id: 'trades', label: 'Intercambios' }]

  const filteredNations = useMemo(() => {
    let ns = nations
    if (search.trim()) {
      const q = search.toLowerCase()
      ns = ns.filter(n => n.name.toLowerCase().includes(q) || n.code.toLowerCase().includes(q))
    }
    if (statusFilter === 'owned')   ns = ns.filter(n => getNationStickers(n.code).every(s => isOwned(s.id)))
    if (statusFilter === 'missing') ns = ns.filter(n => getNationStickers(n.code).some(s => !isOwned(s.id)))
    if (statusFilter === 'dupes')   ns = ns.filter(n => getNationStickers(n.code).some(s => isDupe(s.id)))
    if (groupFilter !== 'all')      ns = ns.filter(n => n.group === groupFilter)
    return ns
  }, [statusFilter, groupFilter, search])

  const expandedNation = expandedCode ? nations.find(n => n.code === expandedCode) : null

  return (
    <PageShell>

      {/* Modals */}
      {showPack  && <PackOpenModal onClose={() => setShowPack(false)} />}
      {showTrade && <TradeModal    onClose={() => setShowTrade(false)} />}
      {expandedNation && <NationModal nation={expandedNation} onClose={() => setExpanded(null)} />}

      {/* ── Hero ── */}
      <section style={{ position: 'relative', paddingBottom: 28, overflow: 'hidden' }}>
        <Floodlight size={680} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.32} top={-260} left="30%" blend="multiply" />
        <Floodlight size={440} color="color-mix(in oklab, var(--green) 55%, transparent)" opacity={.24} bottom={-260} right={-120} blend="multiply" />
        <Watermark style={{ top: 200, right: -20 }}>{albumTotal}</Watermark>

        <div style={{ padding: '20px 56px 0', position: 'relative', zIndex: 2 }}>
          <Eyebrow>COLECCIÓN MUNDIAL 2026 · {albumSetsComplete} / {nations.length} SELECCIONES COMPLETAS</Eyebrow>
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(56px, 8vw, 124px)', margin: 0, lineHeight: .85, textTransform: 'uppercase' }}>
              Mi <span style={{ color: 'var(--gold)' }}>Álbum.</span>
            </h1>
            <div className="gc-row gc-gap-sm">
              <Btn kind="ghost" onClick={() => setShowTrade(true)}>Intercambiar</Btn>
              <Btn style={{ background: 'var(--gold)', color: 'var(--gold-ink)' }} onClick={() => setShowPack(true)}>
                Abrir sobre ★
              </Btn>
            </div>
          </div>
        </div>

        <div style={{ padding: '22px 56px 0', position: 'relative', zIndex: 1 }}>
          <div className="gc-rule-double" />
        </div>

        <div style={{ padding: '24px 56px 0', position: 'relative' }}>
          <AlbumProgressBar owned={albumOwned} total={albumTotal} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginTop: 20 }}>
            <StatTilePro label="TOTAL"          value={albumTotal}       change={`de ${albumTotal} láminas`}       tone="paper" />
            <StatTilePro label="OBTENIDAS"      value={albumOwned}       change={`${albumPct}% del álbum`}          tone="ink" />
            <StatTilePro label="REPETIDAS"      value={albumDuplicates}  change="disponibles para intercambio"      tone="gold" />
            <StatTilePro label="FALTAN"         value={albumMissing}     change="para completar"                   tone="red" />
            <StatTilePro label="SETS COMPLETOS" value={albumSetsComplete} change={`de ${nations.length} selecciones`} tone="green" />
          </div>
        </div>
      </section>

      <MatchTabs tabs={TABS} active={tab} onSelect={setTab} />

      {/* ── TAB: Mi álbum ── */}
      {tab === 'album' && (
        <div style={{ padding: '28px 56px 0' }}>

          {/* filters row */}
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
            <div className="gc-row gc-gap-md" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="gc-tabs">
                {[
                  { id: 'all',     label: 'TODAS' },
                  { id: 'owned',   label: 'COMPLETAS' },
                  { id: 'missing', label: 'INCOMPLETAS' },
                  { id: 'dupes',   label: 'REPETIDAS' },
                ].map(o => (
                  <button key={o.id} onClick={() => setStatusFilter(o.id)} className={statusFilter === o.id ? 'is-on' : ''}>{o.label}</button>
                ))}
              </div>

              <div className="gc-row gc-gap-xs" style={{ alignItems: 'center' }}>
                <Eyebrow style={{ marginRight: 4 }}>GRP</Eyebrow>
                {['all', ...GROUPS].map(g => (
                  <button key={g} onClick={() => setGroupFilter(g)} style={{
                    border: 0,
                    background: groupFilter === g ? 'var(--ink)' : 'transparent',
                    color:      groupFilter === g ? 'var(--paper)' : 'var(--ink)',
                    width: 30, height: 30, borderRadius: 6, cursor: 'pointer',
                    fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 12,
                    letterSpacing: '.04em', textTransform: 'uppercase',
                    outline: groupFilter === g ? 'none' : '1px solid var(--rule)',
                    transition: 'background .15s ease, color .15s ease',
                  }}>{g === 'all' ? '☰' : g}</button>
                ))}
              </div>
            </div>

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar selección…"
              style={{
                fontFamily: 'var(--f-body)', fontSize: 13, padding: '10px 14px',
                borderRadius: 999, border: '1px solid var(--rule)',
                background: 'var(--paper-2)', color: 'var(--ink)', outline: 'none', width: 200,
              }}
            />
          </div>

          <Eyebrow style={{ marginBottom: 14 }}>
            ↘ {filteredNations.length} SELECCIONES · {statusFilter !== 'all' ? statusFilter.toUpperCase() : 'TODAS LAS CATEGORÍAS'}
          </Eyebrow>

          {filteredNations.length === 0 ? (
            <div className="gc-card" style={{ padding: 56, textAlign: 'center' }}>
              <Eyebrow>SIN RESULTADOS</Eyebrow>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 8px', lineHeight: .9 }}>Ninguna selección coincide.</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>Probá cambiando los filtros o borrando la búsqueda.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {filteredNations.map(n => (
                <NationCard key={n.code} nation={n} onExpand={() => setExpanded(n.code)} />
              ))}
            </div>
          )}

          <Band tone="gold" style={{ marginTop: 56 }}>
            <Floodlight size={500} color="var(--red)" opacity={.18} bottom={-280} left={-160} blend="multiply" />
            <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 24, position: 'relative', flexWrap: 'wrap' }}>
              <div>
                <Eyebrow tone="gold">↘ FALTAN {albumMissing} LÁMINAS</Eyebrow>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 5.5vw, 80px)', margin: '8px 0 0', lineHeight: .85, textTransform: 'uppercase' }}>Abrí otro sobre.</h2>
                <p style={{ fontSize: 14, maxWidth: 460, marginTop: 12, lineHeight: 1.5 }}>
                  Cada sobre trae 5 láminas — al menos 1 Rara garantizada. Usá las repetidas para intercambiar.
                </p>
              </div>
              <Btn kind="primary" style={{ background: 'var(--ink)', color: 'var(--paper)' }} onClick={() => setShowPack(true)}>
                Abrir sobre →
              </Btn>
            </div>
          </Band>
        </div>
      )}

      {/* ── TAB: Intercambios ── */}
      {tab === 'trades' && (
        <div style={{ padding: '28px 56px 0' }}>
          <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <SectionHead num="01" label={`↘ INTERCAMBIOS · ${pendingTrades.length} ACTIVOS`} title="Intercambios" />
            <Btn onClick={() => setShowTrade(true)} style={{ marginTop: -60 }}>+ Proponer</Btn>
          </div>

          {pendingTrades.length === 0 ? (
            <div className="gc-card" style={{ padding: 56, textAlign: 'center' }}>
              <Eyebrow>SIN INTERCAMBIOS</Eyebrow>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 42, margin: '10px 0 8px', lineHeight: .9 }}>Propone un intercambio.</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>Usá tus repetidas para conseguir las que faltan.</p>
              <div style={{ marginTop: 20 }}><Btn onClick={() => setShowTrade(true)}>Proponer intercambio →</Btn></div>
            </div>
          ) : (
            <ActiveTradesSection trades={pendingTrades} />
          )}

          <div style={{ marginTop: 36 }}>
            <SectionHead num="02" label={`↘ TUS REPETIDAS · ${albumDuplicates} DISPONIBLES`} title="Repetidas" />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              {getDupeStickers().slice(0, 24).map(s => (
                <div key={s.id} className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
                  <StickerCard sticker={s} size="sm" showCount clickable onClick={() => setShowTrade(true)} />
                </div>
              ))}
            </div>
          </div>

          <Band tone="ink" style={{ marginTop: 56 }}>
            <Floodlight size={500} color="var(--gold)" opacity={.22} top={-200} right={-100} />
            <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 24, position: 'relative', flexWrap: 'wrap' }}>
              <div>
                <Eyebrow tone="onDark">↗ INTERCAMBIÁ TUS REPETIDAS</Eyebrow>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(36px, 5vw, 72px)', margin: '8px 0 0', lineHeight: .85, textTransform: 'uppercase' }}>
                  Conseguí las que faltan.
                </h2>
              </div>
              <Btn style={{ background: 'var(--gold)', color: 'var(--gold-ink)' }} onClick={() => setShowTrade(true)}>
                Proponer →
              </Btn>
            </div>
          </Band>

          <div style={{ height: 80 }} />
        </div>
      )}
    </PageShell>
  )
}
