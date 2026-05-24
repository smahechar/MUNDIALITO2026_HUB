import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

// ─── Floodlight ────────────────────────────────────────────────────────────
export function Floodlight({ size=600, color="var(--gold)", opacity=.3, top, left, right, bottom, blend="screen" }) {
  return (
    <div className="gc-floodlight" style={{
      width:size, height:size, top, left, right, bottom,
      background:`radial-gradient(circle, ${color}, transparent 60%)`,
      opacity, mixBlendMode:blend,
    }}/>
  )
}

export function Watermark({ children="2026", style={} }) {
  return <div className="bc-watermark" style={style}>{children}</div>
}

export function Band({ tone="paper2", children, style={}, withFloodlight=null }) {
  return (
    <div className={`bc-band bc-band-${tone}`} style={style}>
      {withFloodlight}{children}
    </div>
  )
}

// ─── NavBar ─────────────────────────────────────────────────────────────────
export function NavBar({ tone="default" }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isDark    = tone === "ink"
  const navStyle  = isDark ? { background:"var(--ink)", color:"var(--paper)", borderColor:"rgba(247,241,223,.14)" } : {}
  
  const links = [
    { path:"/",        label:"Inicio" },
    { path:"/fixture", label:"Partidos" },
    { path:"/groups",  label:"Grupos" },
    { path:"/pools",   label:"Pollas" },
    { path:"/album",   label:"Álbum" },
    { path:"/tickets", label:"Entradas" },
    { path:"/nations", label:"Países" },
  ]

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)

  return (
    <div className="gc-nav" style={navStyle}>
      <div className="gc-row gc-gap-md">
        <span onClick={() => navigate("/")}
          style={{ fontFamily:"var(--f-display)", fontSize:22, letterSpacing:"0.005em", textTransform:"uppercase", cursor:"pointer" }}>
          Global<span style={{ color:"var(--red)" }}>·</span>Cup
        </span>
        <span className="gc-mono" style={{ fontSize:10.5, letterSpacing:".14em", opacity:.55 }}>2026 HUB</span>
      </div>
      <div className="gc-nav-links">
        {links.map(l => (
          <a key={l.path} className={isActive(l.path) ? "is-active" : ""}
             onClick={() => navigate(l.path)} style={{ cursor:"pointer" }}>
            {l.label}
          </a>
        ))}
      </div>
      <div className="gc-row gc-gap-sm">
        <span className="gc-pill" style={{ borderColor: isDark ? "rgba(247,241,223,.25)" : "var(--rule)" }}>ES · COL</span>
        <button className="gc-btn gc-btn-accent" style={{ padding:"10px 16px", fontSize:12 }}
          onClick={() => navigate(ROUTES.LOGIN)}>
          Ingresar
        </button>
      </div>
    </div>
  )
}

// ─── LiveTicker ─────────────────────────────────────────────────────────────
// TODO backend: connect to real live match feed
export function LiveTicker({ tone="ink" }) {
  const items = [
    "⚽ MIN 67 · Atlantica 2–1 Durango · GOLAZO Olabode",
    "🟡 MIN 64 · Joriba × Lumeria · AMARILLA Reyes",  
    "⚽ MIN 58 · Inkala 1–1 Kalandra · Empate Kovač",
    "🔴 MIN 71 · Atlantica 2–1 Durango · ROJA Mbeki",
  ]
  const tickerStyle = tone === "ink"
    ? { background:"var(--ink)", color:"var(--paper)", borderBottom:"1px solid rgba(247,241,223,.1)" }
    : { background:"var(--green)", color:"var(--green-ink)" }
  return (
    <div style={{ ...tickerStyle, padding:"8px 24px", fontSize:11, fontFamily:"var(--f-mono)", letterSpacing:".06em", overflow:"hidden", whiteSpace:"nowrap" }}>
      <span style={{ opacity:.55, marginRight:16 }}>LIVE</span>
      {items.join("  ·  ")}
    </div>
  )
}

// ─── PageShell ───────────────────────────────────────────────────────────────
export function PageShell({ children, showTicker=true, showFooter=false }) {
  const location = useLocation()
  const pageName = location.pathname.replace("/","") || "home"
  return (
    <div className="gc bc gc-grain" data-screen-label={`Page · ${pageName}`}>
      <div className="bc-wrap">
        {showTicker && <LiveTicker tone="ink" />}
        <NavBar />
        {children}
        {showFooter && <Footer />}
      </div>
    </div>
  )
}

// ─── PageHeader ──────────────────────────────────────────────────────────────
export function PageHeader({ kicker, title, lede, action }) {
  return (
    <section style={{ padding:"48px 56px 32px", position:"relative", overflow:"hidden" }}>
      <Floodlight size={520} color="var(--gold)" opacity={.18} top={-220} left={"30%"} />
      <span className="gc-eyebrow" style={{ color:"var(--muted)" }}>{kicker}</span>
      <h1 style={{ fontFamily:"var(--f-display)", fontSize:124, lineHeight:.85, margin:"10px 0 18px", textTransform:"uppercase", letterSpacing:"-0.01em", position:"relative" }}>
        {title}
      </h1>
      {(lede || action) && (
        <div className="gc-row" style={{ justifyContent:"space-between", alignItems:"flex-end", position:"relative" }}>
          {lede && <p style={{ maxWidth:640, fontSize:17, lineHeight:1.5, color:"var(--ink-2)", margin:0 }}>{lede}</p>}
          {action}
        </div>
      )}
      <div className="gc-rule-double" style={{ marginTop:28 }} />
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <div className="bc-band bc-band-green" style={{ marginTop:80, padding:"100px 56px 56px", position:"relative" }}>
      <Floodlight size={700} color="var(--gold)" opacity={.3} top={-200} left={"30%"} />
      <span className="gc-eyebrow" style={{ color:"rgba(247,241,223,.7)" }}>↘ THE HUB IS LIVE</span>
      <h2 style={{ fontFamily:"var(--f-display)", fontSize:196, lineHeight:.82, margin:"12px 0 28px", textTransform:"uppercase", letterSpacing:"-0.005em", position:"relative" }}>
        <div>Live the</div>
        <div style={{ color:"var(--gold)" }}>Global Cup.</div>
      </h2>
      <div className="gc-row gc-gap-md">
        <button className="gc-btn" style={{ background:"var(--gold)", color:"var(--gold-ink)" }}>Crear cuenta</button>
        <button className="gc-btn gc-btn-ghost" style={{ borderColor:"var(--green-ink)", color:"var(--green-ink)" }}>Descargar app →</button>
      </div>
      <div className="gc-row" style={{ justifyContent:"space-between", marginTop:90, paddingTop:24, borderTop:"1px solid rgba(247,241,223,.18)", position:"relative" }}>
        <span className="gc-mono" style={{ fontSize:11, opacity:.65, letterSpacing:".12em" }}>
          © 2026 · UNIVERSIDAD EL BOSQUE · INGENIERÍA DE SISTEMAS
        </span>
        <div className="gc-row gc-gap-md">
          {["iOS","Android","Soporte","Privacidad"].map(l => (
            <span key={l} className="gc-link" style={{ color:"var(--green-ink)", borderColor:"var(--green-ink)" }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
