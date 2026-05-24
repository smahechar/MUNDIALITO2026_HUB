import { useState, useEffect } from 'react'
import { byCode } from '@/mocks/data/nations'

// ─── Motion hook ──────────────────────────────────────────────────────────────
export function useCountUp(target, duration = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let r
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setV(target * eased)
      if (p < 1) r = requestAnimationFrame(tick)
    }
    r = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(r)
  }, [target, duration])
  return v
}

export function CountInt({ to, suffix = "", className = "" }) {
  const v = useCountUp(to, 1600)
  const out = to >= 1000 ? Math.round(v).toLocaleString() : Math.round(v)
  return <span className={className}>{out}{suffix}</span>
}

export function CountDec({ to, suffix = "", className = "", decimals = 1 }) {
  const v = useCountUp(to, 1600)
  return <span className={className}>{v.toFixed(decimals)}{suffix}</span>
}

// ─── Flag (abstract 3-stripe; no real flags) ──────────────────────────────────
export function Flag({ code, size = 28 }) {
  const n = byCode[code]
  if (!n) return null
  const w = size, h = Math.round(size * 0.72)
  const [a, b, c] = n.colors
  return (
    <svg width={w} height={h} viewBox="0 0 30 22" className="gc-flag"
         style={{ width: w, height: h, flex: "0 0 auto" }} aria-label={n.name}>
      {n.layout === "v" && (<>
        <rect x="0"  y="0" width="10" height="22" fill={a} />
        <rect x="10" y="0" width="10" height="22" fill={b} />
        <rect x="20" y="0" width="10" height="22" fill={c} />
      </>)}
      {n.layout === "h" && (<>
        <rect x="0" y="0"  width="30" height="7.5" fill={a} />
        <rect x="0" y="7"  width="30" height="8"   fill={b} />
        <rect x="0" y="15" width="30" height="7.5" fill={c} />
      </>)}
      {n.layout === "diag" && (<>
        <rect x="0" y="0" width="30" height="22" fill={a} />
        <polygon points="0,22 30,22 30,6"  fill={b} />
        <polygon points="0,22 30,22 30,14" fill={c} />
      </>)}
      {n.layout === "cross" && (<>
        <rect x="0"    y="0"   width="30" height="22" fill={a} />
        <rect x="12"   y="0"   width="6"  height="22" fill={b} />
        <rect x="0"    y="8"   width="30" height="6"  fill={b} />
        <rect x="13.5" y="0"   width="3"  height="22" fill={c} />
        <rect x="0"    y="9.5" width="30" height="3"  fill={c} />
      </>)}
    </svg>
  )
}

export function NationChip({ code, showName = true, size = 22 }) {
  const n = byCode[code]
  if (!n) return null
  return (
    <span className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
      <Flag code={code} size={size} />
      {showName && (<>
        <span className="gc-mono" style={{ fontWeight: 600, letterSpacing: ".08em", fontSize: 11 }}>{n.code}</span>
        <span style={{ fontWeight: 600, letterSpacing: "0.01em" }}>{n.name}</span>
      </>)}
    </span>
  )
}

export function Pill({ tone = "default", live = false, children, style = {} }) {
  const cls = ["gc-pill", live && "gc-pill-live", tone === "green" && "gc-pill-green",
    tone === "gold" && "gc-pill-gold", tone === "ink" && "gc-pill-ink"].filter(Boolean).join(" ")
  const inkStyle = tone === "ink" ? { background: "var(--ink)", color: "var(--paper)", borderColor: "transparent", ...style } : style
  return <span className={cls} style={inkStyle}>{children}</span>
}

export function Eyebrow({ children, tone = "default", style = {} }) {
  const colorMap = { default: "var(--muted)", red: "var(--red)", gold: "var(--gold-ink)", onDark: "rgba(247,241,223,.55)", onGreen: "rgba(247,241,223,.7)" }
  return <span className="gc-eyebrow" style={{ color: colorMap[tone], ...style }}>{children}</span>
}

export function Btn({ kind = "primary", children, style = {}, onClick }) {
  return <button className={`gc-btn gc-btn-${kind}`} style={style} onClick={onClick}>{children}</button>
}

export function ProgressBar({ value, max = 100, tone = "ink" }) {
  const pct = useCountUp(Math.min(100, (value / max) * 100), 1500)
  const fill = tone === "gold" ? "var(--gold)" : tone === "green" ? "var(--green)" : tone === "red" ? "var(--red)" : "var(--ink)"
  return <div className="gc-bar"><i style={{ width: `${pct}%`, background: fill }} /></div>
}

export function SectionHead({ num, label, title, right }) {
  return (
    <div className="bc-section-head">
      <div className="gc-col gc-gap-xs" style={{ alignItems: "flex-start" }}>
        <span className="bc-section-num"><b>{num}</b> · {label}</span>
        <h2>{title}</h2>
      </div>
      {right}
    </div>
  )
}
