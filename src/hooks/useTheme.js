import { useState, useEffect, useRef } from 'react'

const PALETTE_OPTIONS = [
  ["#0e3b2a","#d6362a","#f0b400","#f7f1df","#0c0c0d"],
  ["#003d2b","#e63946","#fcbf49","#fff8ec","#0a0a0a"],
  ["#1a4ed1","#ff007a","#f4b500","#fbf2e0","#101a2f"],
  ["#0c2a4a","#d4ff00","#ffffff","#f5f5f0","#0c0c0d"],
]

function mix(hex1, hex2, amt) {
  const p = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16))
  const [r1,g1,b1] = p(hex1), [r2,g2,b2] = p(hex2)
  return "#" + [
    Math.round(r1*(1-amt)+r2*amt),
    Math.round(g1*(1-amt)+g2*amt),
    Math.round(b1*(1-amt)+b2*amt),
  ].map(c => c.toString(16).padStart(2,"0")).join("")
}

function applyPalette(el, palette) {
  if (!el || !palette) return
  const [green,red,gold,paper,ink] = palette
  el.style.setProperty("--green", green)
  el.style.setProperty("--red", red)
  el.style.setProperty("--gold", gold)
  el.style.setProperty("--paper", paper)
  el.style.setProperty("--ink", ink)
  el.style.setProperty("--paper-2", mix(paper,ink,0.07))
  el.style.setProperty("--paper-edge", mix(paper,ink,0.14))
  el.style.setProperty("--ink-2", mix(ink,paper,0.15))
}

export function useTheme() {
  const [dark, setDark]       = useState(false)
  const [palette, setPalette] = useState(PALETTE_OPTIONS[0])
  const [density, setDensity] = useState("regular")
  const rootRef = useRef(null)

  useEffect(() => {
    const el = document.documentElement
    rootRef.current = el
    applyPalette(el, palette)
    el.setAttribute("data-theme",   dark    ? "dark" : "light")
    el.setAttribute("data-density", density)
  }, [dark, palette, density])

  return { dark, setDark, palette, setPalette, density, setDensity, paletteOptions: PALETTE_OPTIONS }
}
