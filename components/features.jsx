// components/features.jsx
// Feature-domain components: PoolCard, StickerGrid, TicketCard, HypePoster, HypeReel, BracketTeaser, TradeCard.

// ─── PoolCard ───────────────────────────────────────────────────────────────
function PoolCard({ pool }) {
  return (
    <div className="gc-card gc-hover">
      <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <Eyebrow>POOL · {pool.code}</Eyebrow>
        <Pill>{pool.members.toLocaleString()} miembros</Pill>
      </div>
      <h4 style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 22, margin: "0 0 16px", letterSpacing: "0.01em", textTransform: "uppercase" }}>{pool.name}</h4>
      <div className="gc-row" style={{ justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div className="gc-col">
          <Eyebrow style={{ fontSize: 10 }}>Tu posición</Eyebrow>
          <span className="gc-display" style={{ fontSize: 48 }}>#{pool.you}</span>
          <span className="gc-mono gc-mute" style={{ fontSize: 11 }}>{pool.yourPts} pts</span>
        </div>
        <div className="gc-col" style={{ alignItems: "flex-end", textAlign: "right" }}>
          <Eyebrow style={{ fontSize: 10 }}>Líder</Eyebrow>
          <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 20, textTransform: "uppercase" }}>{pool.top}</span>
          <span className="gc-mono gc-mute" style={{ fontSize: 11 }}>{pool.topPts} pts</span>
        </div>
      </div>
      <div className="gc-row gc-rule" style={{ paddingTop: 12, justifyContent: "space-between", fontSize: 11.5 }}>
        <span className="gc-mono gc-uppercase gc-mute" style={{ letterSpacing: ".1em" }}>Cierra en {pool.closesIn}</span>
        <span className="gc-link">Predecir →</span>
      </div>
    </div>
  );
}

// ─── PoolCardInline (no card chrome — for nested use) ───────────────────────
function PoolCardInline({ pool }) {
  return (
    <div>
      <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <Eyebrow>POOL · {pool.code}</Eyebrow>
        <Pill>{pool.members.toLocaleString()} miembros</Pill>
      </div>
      <h4 style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 22, margin: "0 0 16px", letterSpacing: "0.01em", textTransform: "uppercase" }}>{pool.name}</h4>
      <div className="gc-row" style={{ justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div className="gc-col">
          <Eyebrow style={{ fontSize: 10 }}>Tu posición</Eyebrow>
          <span className="gc-display" style={{ fontSize: 48 }}>#{pool.you}</span>
          <span className="gc-mono gc-mute" style={{ fontSize: 11 }}>{pool.yourPts} pts</span>
        </div>
        <div className="gc-col" style={{ alignItems: "flex-end", textAlign: "right" }}>
          <Eyebrow style={{ fontSize: 10 }}>Líder</Eyebrow>
          <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>{pool.top}</span>
          <span className="gc-mono gc-mute" style={{ fontSize: 11 }}>{pool.topPts} pts</span>
        </div>
      </div>
      <div className="gc-row gc-rule" style={{ paddingTop: 12, justifyContent: "space-between", fontSize: 11.5 }}>
        <span className="gc-mono gc-uppercase gc-mute" style={{ letterSpacing: ".1em" }}>Cierra en {pool.closesIn}</span>
        <span className="gc-link">Predecir →</span>
      </div>
    </div>
  );
}

// ─── StickerGrid ────────────────────────────────────────────────────────────
function StickerGrid({ cols = 6 }) {
  const cells = window.GC.album.sample.slice(0, cols * 2);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {cells.map((c, i) => (
        <div key={i} className={`gc-sticker is-${c.state === "owned" ? "owned" : c.state === "shine" ? "shine" : c.state === "dupe" ? "owned is-dupe" : "empty"}`}>
          <span className="num">N° {c.n}</span>
          {c.state !== "empty" && (
            <div style={{
              flex: 1, margin: "8px 0", borderRadius: 4,
              background: c.state === "shine"
                ? "linear-gradient(135deg, #fff3b8 0%, #f4b500 50%, #b58400 100%)"
                : "repeating-linear-gradient(135deg, var(--paper-edge) 0 8px, var(--paper-2) 8px 9px)",
              border: "1px solid var(--rule)",
            }} />
          )}
          <span className="name">{c.name}</span>
        </div>
      ))}
    </div>
  );
}

// ─── TicketCard ─────────────────────────────────────────────────────────────
function TicketCard({ ticket }) {
  const statusColor =
    ticket.status === "Active" ? "var(--green)"
    : ticket.status === "Pending" ? "var(--gold)"
    : "var(--muted)";
  return (
    <div className="gc-card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      <div className="gc-row" style={{ background: "var(--ink)", color: "var(--paper)", padding: "14px 18px", justifyContent: "space-between", alignItems: "center" }}>
        <Eyebrow style={{ color: "var(--paper)", opacity: .65 }}>TICKET · {ticket.id}</Eyebrow>
        <span className="gc-pill" style={{
          background: statusColor, color: ticket.status === "Pending" ? "var(--gold-ink)" : "var(--paper)",
          borderColor: "transparent",
        }}>{ticket.status}</span>
      </div>
      <div style={{ padding: 18 }}>
        <Eyebrow>{ticket.phase}</Eyebrow>
        <h4 style={{ fontFamily: "var(--f-display)", fontSize: 30, margin: "6px 0 12px", lineHeight: .9 }}>{ticket.match}</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div className="gc-col">
            <Eyebrow style={{ fontSize: 9 }}>Sede</Eyebrow>
            <span style={{ fontWeight: 600 }}>{ticket.stadium}</span>
            <span className="gc-mute">{ticket.section}</span>
          </div>
          <div className="gc-col">
            <Eyebrow style={{ fontSize: 9 }}>Asiento</Eyebrow>
            <span style={{ fontWeight: 600 }}>{ticket.seat}</span>
            <span className="gc-mute">{ticket.date}</span>
          </div>
        </div>
      </div>
      <div style={{
        position: "absolute", left: -8, right: -8, bottom: 56, height: 16,
        background: "repeating-linear-gradient(90deg, var(--paper) 0 8px, transparent 8px 16px)",
        pointerEvents: "none",
      }} />
      <div className="gc-row gc-rule" style={{ padding: "12px 18px", justifyContent: "space-between" }}>
        <span className="gc-link">Ver pase</span>
        <span className="gc-link" style={{ color: "var(--muted)", borderColor: "var(--rule)" }}>Transferir</span>
      </div>
    </div>
  );
}

// ─── HypePoster ─────────────────────────────────────────────────────────────
function HypePoster({ tagline = "FEEL EVERY MATCH", subtitle = "GLOBAL CUP 2026", ratio = "4 / 5" }) {
  return (
    <div className="gc-art" style={{ aspectRatio: ratio, background: "var(--green)" }}>
      <svg viewBox="0 0 400 500" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="flood" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#f4b500" stopOpacity=".55" />
            <stop offset="60%" stopColor="#f4b500" stopOpacity="0" />
          </radialGradient>
          <pattern id="grain" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".4" fill="rgba(247,241,223,.06)" />
          </pattern>
        </defs>
        <rect width="400" height="500" fill="url(#flood)" />
        <rect width="400" height="500" fill="url(#grain)" />
        <rect x="0" y="320" width="400" height="2" fill="rgba(247,241,223,.4)" />
        <g transform="translate(200,205)">
          <ellipse cx="0" cy="115" rx="120" ry="20" fill="rgba(0,0,0,.25)" />
          <rect x="-46" y="-100" width="92" height="120" rx="46" fill="#f0b400" />
          <rect x="-36" y="20"  width="72" height="18" rx="6" fill="#f0b400" />
          <rect x="-58" y="38"  width="116" height="14" rx="4" fill="#f0b400" />
          <path d="M-46,-60 Q-90,-40 -82,10" stroke="#f0b400" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M46,-60 Q90,-40 82,10"   stroke="#f0b400" strokeWidth="10" fill="none" strokeLinecap="round" />
        </g>
        <rect x="14" y="14" width="372" height="472" fill="none" stroke="rgba(247,241,223,.35)" strokeWidth="1" />
        <rect x="20" y="20" width="360" height="460" fill="none" stroke="rgba(247,241,223,.2)" strokeWidth="1" strokeDasharray="2 4" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, padding: 28,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        color: "var(--green-ink)",
      }}>
        <div className="gc-row" style={{ justifyContent: "space-between" }}>
          <span className="gc-mono gc-uppercase" style={{ fontSize: 10.5, letterSpacing: ".18em", opacity: .8 }}>{subtitle}</span>
          <span className="gc-mono gc-uppercase" style={{ fontSize: 10.5, letterSpacing: ".18em", opacity: .8 }}>32 NATIONS · 1 TROPHY</span>
        </div>
        <div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 84, lineHeight: .82, textTransform: "uppercase" }}>{tagline}</div>
          <div className="gc-row gc-gap-md" style={{ marginTop: 14 }}>
            <Pill tone="gold">32 days to kickoff</Pill>
            <span className="gc-pill" style={{ background: "transparent", color: "var(--green-ink)", borderColor: "rgba(247,241,223,.4)" }}>16 host cities</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HypeReel ───────────────────────────────────────────────────────────────
function HypeReel() {
  return (
    <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden", background: "var(--ink)", color: "var(--paper)" }}>
      <svg viewBox="0 0 800 450" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#13251c" />
            <stop offset="60%"  stopColor="#0e3b2a" />
            <stop offset="100%" stopColor="#06150e" />
          </linearGradient>
          <radialGradient id="lite" cx="50%" cy="0%" r="80%">
            <stop offset="0%"  stopColor="#f4b500" stopOpacity=".55" />
            <stop offset="50%" stopColor="#f4b500" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#sky)" />
        <rect width="800" height="450" fill="url(#lite)" />
        <ellipse cx="400" cy="500" rx="540" ry="120" fill="#0a1f15" />
        <ellipse cx="400" cy="470" rx="460" ry="100" fill="#102b1f" />
        <ellipse cx="400" cy="445" rx="380" ry="80"  fill="#0d2419" />
        {Array.from({ length: 80 }).map((_, i) => (
          <circle key={i}
            cx={40 + (i * 9) % 720}
            cy={300 + ((i * 13) % 100)}
            r="1.6" fill="rgba(247,241,223,0.35)" />
        ))}
        <g stroke="rgba(244,181,0,.15)" strokeWidth="1">
          <line x1="100" y1="20" x2="350" y2="320" />
          <line x1="700" y1="20" x2="450" y2="320" />
          <line x1="400" y1="-10" x2="400" y2="320" />
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div className="gc-row gc-gap-sm">
          <Pill live>REEL · 02:47</Pill>
          <span className="gc-pill" style={{ background: "rgba(0,0,0,.4)", color: "var(--paper)", borderColor: "rgba(247,241,223,.2)" }}>Match Day 2 — Highlights</span>
        </div>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
          <div className="gc-col gc-gap-xs">
            <Eyebrow tone="onDark">Official Recap</Eyebrow>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 56, lineHeight: .88, margin: 0, textTransform: "uppercase" }}>The Polar Bowl Thriller</h3>
            <span className="gc-mono" style={{ fontSize: 12, opacity: .75 }}>Borealis 3 — 2 Carpathia · 5 goals, 2 woodwork</span>
          </div>
          <button className="gc-row gc-gap-sm" style={{
            background: "var(--paper)", color: "var(--ink)", border: 0, borderRadius: 999,
            padding: "14px 22px 14px 16px",
            fontFamily: "var(--f-sub)", fontWeight: 800, textTransform: "uppercase",
            letterSpacing: ".08em", fontSize: 13, cursor: "pointer",
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: 999, background: "var(--ink)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                width: 0, height: 0,
                borderLeft: "8px solid var(--paper)",
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                marginLeft: 2,
              }}></span>
            </span>
            Watch reel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BracketTeaser ──────────────────────────────────────────────────────────
function BracketTeaser() {
  const pairs = [
    ["ATL", "FRJ"], ["JOR", "MER"], ["ESP", "URS"], ["BOR", "INK"],
  ];
  return (
    <div className="gc-card gc-card-ink" style={{ padding: 24 }}>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div>
          <Eyebrow tone="onDark">KNOCKOUT STAGE · ROUND OF 16</Eyebrow>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: 48, lineHeight: .9, margin: "4px 0 0", textTransform: "uppercase" }}>The bracket so far</h3>
        </div>
        <span className="gc-pill" style={{ background: "transparent", color: "var(--paper)", borderColor: "rgba(247,241,223,.3)" }}>Updates after MD3</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {pairs.map(([a, b], i) => (
          <div key={i} className="gc-col gc-gap-xs">
            {[a, b].map((code) => {
              const n = window.GC.byCode[code];
              return (
                <div key={code} className="gc-row gc-gap-sm" style={{
                  alignItems: "center", padding: "10px 12px",
                  background: "rgba(247,241,223,.06)",
                  borderRadius: 8, border: "1px solid rgba(247,241,223,.12)",
                }}>
                  <Flag code={code} size={18} />
                  <span className="gc-mono" style={{ fontSize: 11, opacity: .65, letterSpacing: ".08em" }}>{n.code}</span>
                  <span className="gc-grow gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{n.name}</span>
                </div>
              );
            })}
            <Eyebrow tone="onDark" style={{ fontSize: 9, marginTop: 4 }}>R16 · {["Jun 28","Jun 29","Jun 30","Jul 1"][i]}</Eyebrow>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  PoolCard, PoolCardInline,
  StickerGrid,
  TicketCard,
  HypePoster, HypeReel, BracketTeaser,
});
