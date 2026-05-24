// components/layout.jsx
// Layout primitives: NavBar, Band (colored section panel), HeroStage, Footer, PageShell.

// ─── NavBar (sticky, glass) ──────────────────────────────────────────────────
function NavBar({ tone = "default", current = "landing", onNavigate }) {
  const isDark = tone === "ink";
  const style = isDark ? { background: "var(--ink)", color: "var(--paper)", borderColor: "rgba(247,241,223,.14)" } : {};
  const links = [
    { id: "landing",  label: "Inicio" },
    { id: "fixture",  label: "Partidos" },
    { id: "groups",   label: "Grupos" },
    { id: "pools",    label: "Pollas" },
    { id: "album",    label: "Álbum" },
    { id: "tickets",  label: "Entradas" },
    { id: "nations",  label: "Países" },
    { id: "system",   label: "Sistema" },
  ];
  return (
    <div className="gc-nav" style={style}>
      <div className="gc-row gc-gap-md">
        <span
          onClick={() => onNavigate && onNavigate("landing")}
          style={{ fontFamily: "var(--f-display)", fontSize: 22, letterSpacing: "0.005em", textTransform: "uppercase", cursor: "pointer" }}>
          Global<span style={{ color: "var(--red)" }}>·</span>Cup
        </span>
        <span className="gc-mono" style={{ fontSize: 10.5, letterSpacing: ".14em", opacity: .55 }}>2026 HUB</span>
      </div>
      <div className="gc-nav-links">
        {links.map(l => (
          <a key={l.id}
             className={current === l.id ? "is-active" : ""}
             onClick={() => onNavigate && onNavigate(l.id)}>
            {l.label}
          </a>
        ))}
      </div>
      <div className="gc-row gc-gap-sm">
        <button style={{
          border: 0, background: "transparent", color: "inherit",
          fontFamily: "var(--f-sub)", fontWeight: 700, letterSpacing: ".08em",
          fontSize: 11.5, textTransform: "uppercase", cursor: "pointer",
        }}>Buscar</button>
        <span className="gc-pill" style={{ borderColor: isDark ? "rgba(247,241,223,.25)" : "var(--rule)" }}>ES · COL</span>
        <button className="gc-btn gc-btn-accent" style={{ padding: "10px 16px", fontSize: 12 }}>Ingresar</button>
      </div>
    </div>
  );
}

// ─── Band (colored section wrapper) ──────────────────────────────────────────
// Borrowed from B variant — bands of color provide festival rhythm
// inside the editorial broadcast shell.
function Band({ tone = "paper2", children, style = {}, withFloodlight = null }) {
  const cls = `bc-band bc-band-${tone}`;
  return (
    <div className={cls} style={style}>
      {withFloodlight}
      {children}
    </div>
  );
}

// ─── Floodlight (positioned radial glow) ─────────────────────────────────────
function Floodlight({ size = 600, color = "var(--gold)", opacity = .3, top, left, right, bottom, blend = "screen" }) {
  return (
    <div className="gc-floodlight" style={{
      width: size, height: size,
      top, left, right, bottom,
      background: `radial-gradient(circle, ${color}, transparent 60%)`,
      opacity, mixBlendMode: blend,
    }} />
  );
}

// ─── Watermark numeral (decorative bg) ───────────────────────────────────────
function Watermark({ children = "2026", style = {} }) {
  return <div className="bc-watermark" style={style}>{children}</div>;
}

// ─── PageShell (standard page wrapper: ticker + nav + content) ───────────────
function PageShell({ current, onNavigate, children, showTicker = true }) {
  return (
    <div className="gc bc gc-grain" data-screen-label={`Page · ${current}`}>
      <div className="bc-wrap">
        {showTicker && <LiveTicker tone="ink" />}
        <NavBar current={current} onNavigate={onNavigate} />
        {children}
      </div>
    </div>
  );
}

// ─── PageHeader (used by inner pages like /system, /pools, etc.) ─────────────
function PageHeader({ kicker, title, lede, action }) {
  return (
    <section style={{ padding: "48px 56px 32px", position: "relative", overflow: "hidden" }}>
      <Floodlight size={520} color="var(--gold)" opacity={.18} top={-220} left={"30%"} />
      <Eyebrow>{kicker}</Eyebrow>
      <h1 style={{
        fontFamily: "var(--f-display)",
        fontSize: 124, lineHeight: .85,
        margin: "10px 0 18px",
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        position: "relative",
      }}>{title}</h1>
      {(lede || action) && (
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
          {lede && <p style={{ maxWidth: 640, fontSize: 17, lineHeight: 1.5, color: "var(--ink-2)", margin: 0 }}>{lede}</p>}
          {action}
        </div>
      )}
      <div className="gc-rule-double" style={{ marginTop: 28 }} />
    </section>
  );
}

// ─── Footer (green CTA band) ─────────────────────────────────────────────────
function Footer() {
  return (
    <div className="bc-band bc-band-green" style={{ marginTop: 80, padding: "100px 56px 56px", position: "relative" }}>
      <Floodlight size={700} color="var(--gold)" opacity={.3} top={-200} left={"30%"} />
      <Eyebrow tone="onGreen">↘ THE HUB IS LIVE</Eyebrow>
      <h2 style={{
        fontFamily: "var(--f-display)",
        fontSize: 196, lineHeight: .82,
        margin: "12px 0 28px",
        textTransform: "uppercase",
        letterSpacing: "-0.005em",
        position: "relative",
      }}>
        <div>Live the</div>
        <div style={{ color: "var(--gold)" }}>Global Cup.</div>
      </h2>
      <div className="gc-row gc-gap-md">
        <button className="gc-btn" style={{ background: "var(--gold)", color: "var(--gold-ink)" }}>Crear cuenta</button>
        <button className="gc-btn gc-btn-ghost" style={{ borderColor: "var(--green-ink)", color: "var(--green-ink)" }}>Descargar app →</button>
      </div>
      <div className="gc-row" style={{ justifyContent: "space-between", marginTop: 90, paddingTop: 24, borderTop: "1px solid rgba(247,241,223,.18)", position: "relative" }}>
        <span className="gc-mono" style={{ fontSize: 11, opacity: .65, letterSpacing: ".12em" }}>
          © 2026 · UNIVERSIDAD EL BOSQUE · INGENIERÍA DE SISTEMAS · CURSO DE SOFTWARE
        </span>
        <div className="gc-row gc-gap-md">
          <span className="gc-link" style={{ color: "var(--green-ink)", borderColor: "var(--green-ink)" }}>iOS</span>
          <span className="gc-link" style={{ color: "var(--green-ink)", borderColor: "var(--green-ink)" }}>Android</span>
          <span className="gc-link" style={{ color: "var(--green-ink)", borderColor: "var(--green-ink)" }}>Soporte</span>
          <span className="gc-link" style={{ color: "var(--green-ink)", borderColor: "var(--green-ink)" }}>Privacidad</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NavBar, Band, Floodlight, Watermark, PageShell, PageHeader, Footer });
