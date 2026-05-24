import { useState } from 'react'
import { Flag, Pill, Eyebrow, Btn, useCountUp } from '@/components/shared/atoms'
import { Floodlight } from '@/components/shared/Layout'
import { ModalOverlay } from '@/components/shared/Modal'
import {
  RARITY_CFG, allStickers, byCode,
  isOwned, isDupe, dupeCount, getStickerById,
  getNationStickers, getDupeStickers, openPack,
} from '@/mocks/data/album'

const TYPE_ICON = { player: '●', badge: '■', stadium: '◆', kit: '◈', moment: '★' }

// ─── StickerCard ──────────────────────────────────────────────────────────────
export function StickerCard({ sticker, size = 'md', showCount = true, clickable = false, onClick }) {
  const owned = isOwned(sticker.id)
  const dupe  = isDupe(sticker.id)
  const count = dupeCount(sticker.id)
  const rar   = RARITY_CFG[sticker.rarity]
  const isLeg = sticker.rarity === 'L'

  const w = size === 'sm' ? 72  : size === 'lg' ? 140 : 100
  const h = size === 'sm' ? 96  : size === 'lg' ? 186 : 132

  const nationColors = byCode[sticker.nation]?.colors || ['#999', '#555', '#333']

  return (
    <div
      onClick={onClick}
      style={{
        width: w, height: h, borderRadius: 8, flexShrink: 0, position: 'relative',
        background: owned
          ? isLeg
            ? 'linear-gradient(135deg,#1a1300 0%,#5a3c00 30%,#1a1300 60%,#5a3c00 100%)'
            : 'var(--paper)'
          : 'var(--paper-2)',
        border: owned
          ? `1.5px solid ${isLeg ? 'var(--gold)' : rar.shine ? rar.fg : 'var(--rule)'}`
          : '1.5px dashed var(--rule)',
        overflow: 'hidden',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform .15s ease, box-shadow .15s ease',
        opacity: owned ? 1 : .5,
      }}
      onMouseEnter={e => clickable && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => clickable && (e.currentTarget.style.transform = '')}
    >
      {/* shine for rare+ */}
      {owned && rar.shine && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 50%,rgba(255,255,255,.08) 100%)',
        }} />
      )}

      {/* number */}
      <div className="gc-mono" style={{
        position: 'absolute', top: 6, left: 7, fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
        color: owned ? (isLeg ? 'var(--gold)' : 'var(--muted)') : 'var(--muted)',
      }}>N°{String(sticker.num).padStart(3, '0')}</div>

      {/* type icon */}
      <div style={{
        position: 'absolute', top: 6, right: 7, fontSize: 10,
        color: owned ? rar.fg : 'var(--muted)', opacity: .8,
      }}>{TYPE_ICON[sticker.type] || '●'}</div>

      {/* artwork */}
      <div style={{
        position: 'absolute', left: 8, right: 8, top: 22, bottom: 30,
        borderRadius: 4, overflow: 'hidden',
        background: owned
          ? isLeg
            ? 'radial-gradient(circle at 50% 40%,rgba(240,180,0,.5),rgba(26,19,0,.8))'
            : `linear-gradient(160deg,${nationColors[0]} 0%,${nationColors[1]} 100%)`
          : 'var(--paper-edge)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {owned ? (
          <Flag code={sticker.nation} size={size === 'sm' ? 24 : size === 'lg' ? 52 : 36} />
        ) : (
          <span style={{ fontSize: size === 'sm' ? 18 : 26, opacity: .25 }}>?</span>
        )}
      </div>

      {/* name */}
      <div style={{
        position: 'absolute', left: 6, right: 6, bottom: 6,
        fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: size === 'sm' ? 8 : 10,
        letterSpacing: '.03em', textTransform: 'uppercase', lineHeight: 1.1,
        color: owned ? (isLeg ? 'var(--gold)' : 'var(--ink)') : 'var(--muted)',
        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{sticker.shortName}</div>

      {/* dupe badge */}
      {dupe && showCount && (
        <div style={{
          position: 'absolute', top: -4, right: -4,
          background: 'var(--red)', color: 'var(--red-ink)',
          fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 9,
          padding: '2px 5px', borderRadius: 999, letterSpacing: '.04em',
        }}>×{count}</div>
      )}

      {/* legendaria glow */}
      {owned && isLeg && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 8,
          boxShadow: 'inset 0 0 12px rgba(240,180,0,.4)',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}

// ─── AlbumProgressBar ─────────────────────────────────────────────────────────
export function AlbumProgressBar({ owned, total }) {
  const pct = useCountUp((owned / total) * 100, 1400)
  return (
    <div>
      <div className="gc-row" style={{ justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
        <Eyebrow>PROGRESO DEL ÁLBUM</Eyebrow>
        <span style={{ fontFamily: 'var(--f-display)', fontSize: 36, lineHeight: 1, color: 'var(--gold)' }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ height: 12, borderRadius: 999, background: 'var(--paper-2)', overflow: 'hidden', border: '1px solid var(--rule)' }}>
        <div style={{
          height: '100%', borderRadius: 999, width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--gold) 0%, #ffe27a 60%, var(--gold) 100%)',
          backgroundSize: '200% 100%',
          animation: 'gc-shimmer 4s linear infinite',
          transition: 'width .8s cubic-bezier(.2,.7,.2,1)',
        }} />
      </div>
      <div className="gc-row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{owned.toLocaleString()} láminas obtenidas</span>
        <span className="gc-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{total.toLocaleString()} total</span>
      </div>
    </div>
  )
}

// ─── NationCard ───────────────────────────────────────────────────────────────
export function NationCard({ nation, onExpand }) {
  const stickers = getNationStickers(nation.code)
  const total    = stickers.length
  const owned    = stickers.filter(s => isOwned(s.id)).length
  const dupes    = stickers.filter(s => isDupe(s.id)).length
  const complete = owned === total
  const pct      = Math.round((owned / total) * 100)

  return (
    <div
      className="gc-card gc-hover"
      onClick={onExpand}
      style={{
        padding: 0, overflow: 'hidden', cursor: 'pointer',
        background: complete ? 'var(--green)' : 'var(--paper)',
        borderColor: complete ? 'transparent' : 'var(--rule)',
        position: 'relative',
      }}
    >
      {complete && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 70% 20%, rgba(240,180,0,.35), transparent 60%)',
        }} />
      )}

      <div style={{ padding: '16px 18px 14px' }}>
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
            <Flag code={nation.code} size={30} />
            <div className="gc-col gc-gap-xs">
              <span className="gc-mono" style={{ fontSize: 9, letterSpacing: '.1em', color: complete ? 'rgba(247,241,223,.7)' : 'var(--muted)' }}>{nation.code} · GRP {nation.group}</span>
              <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 15, textTransform: 'uppercase', lineHeight: 1, color: complete ? 'var(--green-ink)' : 'var(--ink)' }}>{nation.name}</span>
            </div>
          </div>
          <div className="gc-row gc-gap-xs" style={{ alignItems: 'center' }}>
            {complete && <span style={{ color: 'var(--gold)', fontSize: 18 }}>★</span>}
            {dupes > 0 && !complete && (
              <span style={{ background: 'var(--red)', color: 'var(--red-ink)', fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 10, padding: '2px 7px', borderRadius: 999, letterSpacing: '.04em' }}>REP·{dupes}</span>
            )}
          </div>
        </div>

        {/* mini sticker dots */}
        <div className="gc-row gc-gap-xs" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
          {stickers.slice(0, 8).map(s => {
            const o = isOwned(s.id)
            const dotColor = o
              ? s.rarity === 'L' ? 'var(--gold)' : s.rarity === 'E' ? 'var(--red)' : s.rarity === 'R' ? '#4ab8f5' : 'var(--ink)'
              : 'var(--paper-edge)'
            return (
              <div key={s.id} style={{
                width: 14, height: 18, borderRadius: 3,
                background: dotColor,
                border: o ? 'none' : '1px dashed var(--rule)',
                opacity: o ? 1 : .6,
              }} title={s.name} />
            )
          })}
          {stickers.length > 8 && (
            <span className="gc-mono" style={{ fontSize: 9, color: complete ? 'rgba(247,241,223,.7)' : 'var(--muted)', alignSelf: 'center', marginLeft: 2 }}>+{stickers.length - 8}</span>
          )}
        </div>

        {/* progress bar */}
        <div>
          <div style={{ height: 5, borderRadius: 999, background: complete ? 'rgba(247,241,223,.25)' : 'var(--paper-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: complete ? 'var(--gold)' : 'var(--ink)', transition: 'width .6s ease' }} />
          </div>
          <div className="gc-row" style={{ justifyContent: 'space-between', marginTop: 5 }}>
            <span className="gc-mono" style={{ fontSize: 10, color: complete ? 'rgba(247,241,223,.7)' : 'var(--muted)' }}>{owned}/{total}</span>
            <span className="gc-mono" style={{ fontSize: 10, color: complete ? 'var(--gold)' : 'var(--muted)' }}>{complete ? 'COMPLETA ★' : `${pct}%`}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NationModal ──────────────────────────────────────────────────────────────
export function NationModal({ nation, onClose }) {
  const stickers = getNationStickers(nation.code)
  const owned    = stickers.filter(s => isOwned(s.id)).length

  return (
    <ModalOverlay onClose={onClose} maxWidth={560}>
      <div className="gc-col gc-gap-md">
        <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
            <Flag code={nation.code} size={44} />
            <div className="gc-col">
              <Eyebrow style={{ fontSize: 10 }}>↘ COLECCIÓN · {owned}/{stickers.length}</Eyebrow>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 48, margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>{nation.name}</h3>
            </div>
          </div>
          <Pill tone={owned === stickers.length ? 'green' : 'default'}>
            {owned === stickers.length ? 'COMPLETA ★' : `${Math.round(owned / stickers.length * 100)}%`}
          </Pill>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {stickers.map(s => (
            <div key={s.id} className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
              <StickerCard sticker={s} size="sm" />
              <span className="gc-mono" style={{ fontSize: 8, textAlign: 'center', letterSpacing: '.06em', color: 'var(--muted)', lineHeight: 1.2 }}>{s.shortName}</span>
              <span style={{ fontSize: 8, fontFamily: 'var(--f-sub)', fontWeight: 800, letterSpacing: '.04em', color: RARITY_CFG[s.rarity].fg, textTransform: 'uppercase' }}>{RARITY_CFG[s.rarity].label[0]}</span>
            </div>
          ))}
        </div>

        <Btn kind="ghost" onClick={onClose} style={{ alignSelf: 'flex-end' }}>Cerrar</Btn>
      </div>
    </ModalOverlay>
  )
}

// ─── PackOpenModal ────────────────────────────────────────────────────────────
export function PackOpenModal({ onClose }) {
  const [step,    setStep]    = useState(0)  // 0=ready 1=opening 2=reveal 3=summary
  const [pack,    setPack]    = useState(null)
  const [flipped, setFlipped] = useState([])
  const [active,  setActive]  = useState(-1)

  function handleOpen() {
    const result = openPack()
    setPack(result)
    setStep(1)
    setTimeout(() => { setStep(2); revealSequence(result) }, 600)
  }

  function revealSequence(result) {
    result.forEach((_, i) => {
      setTimeout(() => setActive(i), i * 450)
      setTimeout(() => {
        setFlipped(f => [...f, i])
        if (i === result.length - 1) setTimeout(() => setStep(3), 500)
      }, i * 450 + 220)
    })
  }

  const isNew = (s) => !isOwned(s.id)

  return (
    <ModalOverlay onClose={onClose}>
      <style>{`
        @keyframes packFlip { 0%{transform:rotateY(0deg)} 50%{transform:rotateY(90deg)} 100%{transform:rotateY(0deg)} }
        @keyframes packDrop { from{opacity:0;transform:translateY(-20px) scale(.85)} to{opacity:1;transform:translateY(0) scale(1)} }
        .pack-card { animation: packDrop .35s cubic-bezier(.2,.7,.2,1) both; }
        .pack-flipping { animation: packFlip .4s ease both; }
      `}</style>

      {step === 0 && (
        <div className="gc-col gc-gap-md" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Eyebrow>↘ SOBRE OFICIAL · MUNDIAL 2026</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 64, margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>
            Abrí tu paquete.
          </h2>
          <div style={{
            width: 160, height: 220, borderRadius: 16, margin: '8px auto',
            background: 'linear-gradient(145deg, var(--green) 0%, #16543d 50%, var(--green) 100%)',
            border: '2px solid var(--gold)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, position: 'relative', overflow: 'hidden',
            boxShadow: '0 16px 48px -12px rgba(12,12,13,.55)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg,rgba(240,180,0,.06) 0 2px,transparent 2px 10px)' }} />
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 56, color: 'var(--gold)', lineHeight: 1, position: 'relative' }}>★</span>
            <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(247,241,223,.8)', position: 'relative' }}>Global Cup 2026</span>
            <span className="gc-mono" style={{ fontSize: 10, color: 'rgba(247,241,223,.55)', letterSpacing: '.12em', position: 'relative' }}>5 LÁMINAS</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 380, margin: 0 }}>
            Cada sobre trae 5 láminas. Podés conseguir Comunes, Raras, Épicas y Legendarias.
          </p>
          <div className="gc-row gc-gap-md">
            <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn style={{ background: 'var(--gold)', color: 'var(--gold-ink)' }} onClick={handleOpen}>
              Abrir sobre →
            </Btn>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="gc-col" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 20 }}>
          <div style={{
            width: 160, height: 220, borderRadius: 16,
            background: 'linear-gradient(145deg, var(--green) 0%, #16543d 100%)',
            border: '2px solid var(--gold)',
            animation: 'packFlip .5s ease-in',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: 56, color: 'var(--gold)' }}>★</span>
          </div>
          <span className="gc-mono" style={{ fontSize: 12, letterSpacing: '.14em', color: 'var(--muted)' }}>ABRIENDO…</span>
        </div>
      )}

      {step === 2 && pack && (
        <div className="gc-col gc-gap-md" style={{ alignItems: 'center' }}>
          <Eyebrow>↘ REVELA TUS LÁMINAS</Eyebrow>
          <div className="gc-row" style={{ gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {pack.map((s, i) => (
              <div key={i} className={active >= i ? 'pack-card' : ''} style={{
                opacity: active >= i ? 1 : 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div className={flipped.includes(i) ? '' : 'pack-flipping'} style={{ animationFillMode: 'forwards' }}>
                  <StickerCard sticker={s} size="lg" showCount={false} />
                </div>
                <div className="gc-col" style={{ alignItems: 'center', gap: 3 }}>
                  <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 12, letterSpacing: '.04em', textAlign: 'center', textTransform: 'uppercase' }}>{s.shortName}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--f-sub)', fontWeight: 800, color: RARITY_CFG[s.rarity].fg, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    {RARITY_CFG[s.rarity].label}
                  </span>
                  {isNew(s)
                    ? <span style={{ background: 'var(--green)', color: 'var(--green-ink)', fontSize: 9, padding: '2px 6px', borderRadius: 999, fontFamily: 'var(--f-sub)', fontWeight: 800, letterSpacing: '.06em' }}>NUEVA</span>
                    : <span style={{ background: 'var(--paper-2)', color: 'var(--muted)', fontSize: 9, padding: '2px 6px', borderRadius: 999, fontFamily: 'var(--f-sub)', fontWeight: 800, letterSpacing: '.06em' }}>REPETIDA</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && pack && (
        <div className="gc-col gc-gap-md">
          <Eyebrow>↘ RESUMEN DEL SOBRE</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 52, margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>
            {pack.filter(isNew).length > 0 ? `${pack.filter(isNew).length} nuevas.` : 'Todo repetido.'}
          </h2>
          <div className="gc-row gc-gap-sm" style={{ flexWrap: 'wrap' }}>
            {pack.map((s, i) => (
              <div key={i} className="gc-card" style={{ padding: '10px 14px', flex: '1 1 auto', minWidth: 160, borderLeft: `4px solid ${isNew(s) ? 'var(--green)' : 'var(--muted)'}` }}>
                <div className="gc-row gc-gap-sm" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="gc-col gc-gap-xs">
                    <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.08em' }}>N°{String(s.num).padStart(3, '0')} · {s.nation}</span>
                    <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase' }}>{s.shortName}</span>
                    <span style={{ fontSize: 11, color: RARITY_CFG[s.rarity].fg, fontFamily: 'var(--f-sub)', fontWeight: 700, letterSpacing: '.04em' }}>{RARITY_CFG[s.rarity].label}</span>
                  </div>
                  <span style={{
                    padding: '4px 8px', borderRadius: 999, fontSize: 10, fontWeight: 800,
                    fontFamily: 'var(--f-sub)', letterSpacing: '.08em', textTransform: 'uppercase',
                    background: isNew(s) ? 'var(--green)' : 'transparent',
                    color: isNew(s) ? 'var(--green-ink)' : 'var(--muted)',
                    border: isNew(s) ? 'none' : '1px dashed var(--rule)',
                  }}>{isNew(s) ? 'NUEVA' : 'REP'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="gc-row gc-gap-md" style={{ justifyContent: 'flex-end' }}>
            <Btn kind="ghost" onClick={onClose}>Cerrar</Btn>
            <Btn onClick={onClose}>Ver en álbum →</Btn>
          </div>
        </div>
      )}
    </ModalOverlay>
  )
}

// ─── TradeModal ───────────────────────────────────────────────────────────────
export function TradeModal({ onClose }) {
  const [step,     setStep]     = useState(0)
  const [offering, setOffering] = useState(new Set())
  const [search,   setSearch]   = useState('')
  const dupes = getDupeStickers().slice(0, 18)

  function toggleOffer(id) {
    setOffering(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const offeringList = dupes.filter(s => offering.has(s.id))

  return (
    <ModalOverlay onClose={onClose}>
      {step === 0 && (
        <div className="gc-col gc-gap-md">
          <Eyebrow>↘ PROPONER INTERCAMBIO</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 48, margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>Tus repetidas.</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>Seleccioná las láminas que querés ofrecer. Después elegís el usuario.</p>

          {dupes.length === 0 ? (
            <div className="gc-card" style={{ padding: 28, textAlign: 'center' }}>
              <span className="gc-mono" style={{ fontSize: 12, color: 'var(--muted)' }}>No tenés repetidas por ahora.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, maxHeight: 280, overflowY: 'auto' }}>
              {dupes.map(s => (
                <div key={s.id} onClick={() => toggleOffer(s.id)} style={{
                  cursor: 'pointer', padding: 6, borderRadius: 10,
                  background: offering.has(s.id) ? 'var(--paper-2)' : 'transparent',
                  border: `2px solid ${offering.has(s.id) ? 'var(--ink)' : 'transparent'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all .15s ease',
                }}>
                  <StickerCard sticker={s} size="sm" showCount />
                  <span className="gc-mono" style={{ fontSize: 8, textAlign: 'center', color: 'var(--muted)' }}>{s.nation}</span>
                </div>
              ))}
            </div>
          )}

          {offering.size > 0 && (
            <div className="gc-card" style={{ padding: 16, background: 'var(--paper-2)' }}>
              <Eyebrow style={{ fontSize: 9 }}>OFRECIENDO · {offering.size} LÁMINAS</Eyebrow>
              <div className="gc-row gc-gap-sm" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                {offeringList.map(s => (
                  <span key={s.id} className="gc-mono" style={{ padding: '4px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: 'var(--ink)', color: 'var(--paper)', letterSpacing: '.08em' }}>
                    N°{String(s.num).padStart(3, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <Eyebrow style={{ fontSize: 10, marginBottom: 8 }}>BUSCAR USUARIO</Eyebrow>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="@usuario o nombre"
              style={{
                fontFamily: 'var(--f-body)', fontSize: 14, padding: '12px 16px',
                borderRadius: 10, border: '2px solid var(--rule)',
                background: 'var(--paper-2)', color: 'var(--ink)', outline: 'none',
                width: '100%', boxSizing: 'border-box',
              }}
            />
          </div>

          <div className="gc-row gc-gap-md" style={{ justifyContent: 'flex-end' }}>
            <Btn kind="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn onClick={() => setStep(1)} style={{ opacity: offering.size === 0 ? .5 : 1 }}>Ver propuesta →</Btn>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="gc-col gc-gap-md">
          <Eyebrow>↘ CONFIRMACIÓN DEL INTERCAMBIO</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 48, margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>¿Confirmar?</h2>
          <div className="gc-card gc-card-ink" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            <Floodlight size={250} color="var(--gold)" opacity={.25} top={-120} right={-80} />
            <div className="gc-row" style={{ justifyContent: 'space-around', alignItems: 'center', gap: 16, position: 'relative' }}>
              <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
                <Eyebrow tone="onDark">TÚ OFRECÉS</Eyebrow>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 48 }}>{offering.size}</span>
                <span className="gc-mono" style={{ fontSize: 11, opacity: .7, letterSpacing: '.08em' }}>LÁMINAS</span>
              </div>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 36, opacity: .45 }}>⇄</span>
              <div className="gc-col gc-gap-xs" style={{ alignItems: 'center' }}>
                <Eyebrow tone="onDark">SOLICITÁS A</Eyebrow>
                <span style={{ fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase' }}>{search || 'Usuario'}</span>
                <span className="gc-mono" style={{ fontSize: 11, opacity: .7, letterSpacing: '.08em' }}>REPETIDAS TUYAS</span>
              </div>
            </div>
          </div>
          <div className="gc-row gc-gap-md" style={{ justifyContent: 'flex-end' }}>
            <Btn kind="ghost" onClick={() => setStep(0)}>← Volver</Btn>
            <Btn style={{ background: 'var(--gold)', color: 'var(--gold-ink)' }} onClick={() => setStep(2)}>Proponer intercambio</Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="gc-col gc-gap-md" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Eyebrow>↘ PROPUESTA ENVIADA</Eyebrow>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 52, margin: 0, lineHeight: .88, textTransform: 'uppercase' }}>En espera.</h2>
          <div className="gc-card" style={{ padding: 28, background: 'var(--paper-2)', maxWidth: 360 }}>
            <Pill live style={{ marginBottom: 12 }}>PENDIENTE DE CONFIRMACIÓN</Pill>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>
              Le enviamos la propuesta a <b>{search || 'tu usuario'}</b>. Te notificamos cuando responda.
            </p>
          </div>
          <Btn onClick={onClose}>Cerrar</Btn>
        </div>
      )}
    </ModalOverlay>
  )
}

// ─── ActiveTradesSection ──────────────────────────────────────────────────────
export function ActiveTradesSection({ trades }) {
  const statusCfg = {
    pending:   { label: 'PENDIENTE',  tone: 'default', bg: 'var(--paper)' },
    confirmed: { label: 'CONFIRMADO', tone: 'green',   bg: 'color-mix(in oklab, var(--green) 10%, var(--paper))' },
    rejected:  { label: 'RECHAZADO',  tone: 'default', bg: 'transparent' },
  }

  function rel(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 60000)
    if (diff < 60)   return `Hace ${diff}min`
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`
    return `Hace ${Math.floor(diff / 1440)}d`
  }

  return (
    <div className="gc-col gc-gap-sm">
      {trades.map(t => {
        const cfg       = statusCfg[t.status] || statusCfg.pending
        const offered   = t.offered.map(id => getStickerById(id)).filter(Boolean)
        const requested = t.requested.map(id => getStickerById(id)).filter(Boolean)
        return (
          <div key={t.id} className="gc-card" style={{ padding: 20, background: cfg.bg }}>
            <div className="gc-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div className="gc-row gc-gap-sm" style={{ alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 14 }}>
                  {t.with[0]}
                </div>
                <div className="gc-col">
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{t.with}</span>
                  <span className="gc-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{t.withHandle} · {rel(t.createdAt)}</span>
                </div>
              </div>
              <Pill tone={cfg.tone} live={t.status === 'pending'}>{cfg.label}</Pill>
            </div>
            <div className="gc-row" style={{ gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="gc-col gc-gap-xs">
                <Eyebrow style={{ fontSize: 9 }}>TÚ OFRECÉS</Eyebrow>
                <div className="gc-row gc-gap-sm">{offered.map(s => <StickerCard key={s.id} sticker={s} size="sm" showCount={false} />)}</div>
              </div>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, color: 'var(--muted)' }}>⇄</span>
              <div className="gc-col gc-gap-xs">
                <Eyebrow style={{ fontSize: 9 }}>QUERÉS</Eyebrow>
                <div className="gc-row gc-gap-sm">{requested.map(s => <StickerCard key={s.id} sticker={s} size="sm" showCount={false} />)}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
