// components/match.jsx
// Match & scoreboard components: LiveTicker, Countdown, MatchCard, MatchCardPro, FixtureRail.

// ─── LiveTicker ─────────────────────────────────────────────────────────────
function LiveTicker({ tone = "ink" }) {
  const items = window.GC.matches;
  const bg = tone === "ink" ? "var(--ink)" : "var(--paper)";
  const fg = tone === "ink" ? "var(--paper)" : "var(--ink)";
  const border = tone === "ink" ? "transparent" : "var(--rule)";
  const all = [...items, ...items];

  return (
    <div style={{
      background: bg, color: fg,
      borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
      overflow: "hidden", position: "relative",
      padding: "10px 0",
    }}>
      <div className="gc-row gc-gap-sm" style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        background: "var(--red)", color: "var(--red-ink)",
        padding: "0 16px", zIndex: 2,
        fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 12,
        letterSpacing: ".14em", textTransform: "uppercase",
      }}>
        <span className="gc-dot" style={{ background: "currentColor" }}></span>
        LIVE
      </div>
      <div className="gc-ticker-track" style={{ paddingLeft: 90 }}>
        {all.map((m, i) => {
          const home = window.GC.byCode[m.home];
          const away = window.GC.byCode[m.away];
          const isLive = m.status === "live" || m.status === "halftime";
          return (
            <div key={i} className="gc-row gc-gap-sm" style={{
              padding: "0 24px", borderRight: `1px solid ${tone === "ink" ? "rgba(246,239,217,.16)" : "var(--rule)"}`,
              minWidth: "max-content", alignItems: "center",
            }}>
              <Flag code={home.code} size={18} />
              <span className="gc-mono" style={{ fontWeight: 600, letterSpacing: ".06em", fontSize: 12 }}>{home.code}</span>
              <span className="gc-mono" style={{ fontWeight: 700, fontSize: 13 }}>{m.homeScore ?? "–"}</span>
              <span className="gc-mono" style={{ opacity: .5 }}>:</span>
              <span className="gc-mono" style={{ fontWeight: 700, fontSize: 13 }}>{m.awayScore ?? "–"}</span>
              <span className="gc-mono" style={{ fontWeight: 600, letterSpacing: ".06em", fontSize: 12 }}>{away.code}</span>
              <Flag code={away.code} size={18} />
              <span className="gc-mono" style={{
                marginLeft: 4, fontSize: 10.5, letterSpacing: ".12em",
                color: isLive ? "var(--gold)" : "currentColor",
                opacity: isLive ? 1 : .6,
              }}>
                {isLive ? m.minute : m.status === "final" ? "FT" : "·"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Countdown ──────────────────────────────────────────────────────────────
function Countdown({ target, big = false }) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, target - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const cells = [
    { v: pad(d), l: "Days" },
    { v: pad(h), l: "Hours" },
    { v: pad(m), l: "Min" },
    { v: pad(s), l: "Sec" },
  ];
  return (
    <div className="gc-row" style={{ gap: big ? 28 : 18, alignItems: "stretch" }}>
      {cells.map((c, i) => (
        <React.Fragment key={c.l}>
          <div className="gc-col" style={{ alignItems: "flex-start", gap: 6 }}>
            <span className="gc-cd" style={{ fontSize: big ? 124 : 80 }}>{c.v}</span>
            <span className="gc-eyebrow" style={{ fontSize: 10.5 }}>{c.l}</span>
          </div>
          {i < cells.length - 1 && (
            <span style={{ fontFamily: "var(--f-display)", fontSize: big ? 124 : 80, lineHeight: .85, color: "var(--rule-strong)" }}>:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── MatchCard (base) ───────────────────────────────────────────────────────
function MatchCard({ match }) {
  const home = window.GC.byCode[match.home];
  const away = window.GC.byCode[match.away];
  const isLive = match.status === "live" || match.status === "halftime";
  const isFinal = match.status === "final";

  return (
    <div className="gc-card gc-hover" style={{ padding: 18 }}>
      <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <Eyebrow>{match.phase}</Eyebrow>
        {isLive ? <Pill live>{match.minute || "LIVE"}</Pill>
         : isFinal ? <Pill tone="ink">FT</Pill>
         : <Pill>{new Date(match.kickoff).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Pill>}
      </div>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="gc-col gc-gap-xs" style={{ alignItems: "center", flex: 1 }}>
          <Flag code={home.code} size={42} />
          <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em" }}>{home.code}</span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{home.name}</span>
        </div>
        <div className="gc-col" style={{ alignItems: "center", padding: "0 14px" }}>
          {match.homeScore !== null ? (
            <div className="gc-row gc-gap-sm" style={{ alignItems: "baseline" }}>
              <span className="gc-score" style={{ fontSize: 48 }}>{match.homeScore}</span>
              <span className="gc-mono" style={{ color: "var(--muted)" }}>—</span>
              <span className="gc-score" style={{ fontSize: 48 }}>{match.awayScore}</span>
            </div>
          ) : (
            <span className="gc-display" style={{ fontSize: 30, color: "var(--muted)" }}>vs</span>
          )}
        </div>
        <div className="gc-col gc-gap-xs" style={{ alignItems: "center", flex: 1 }}>
          <Flag code={away.code} size={42} />
          <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em" }}>{away.code}</span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{away.name}</span>
        </div>
      </div>
      <div className="gc-row gc-rule" style={{ justifyContent: "space-between", marginTop: 14, paddingTop: 10, fontSize: 11.5, color: "var(--muted)" }}>
        <span className="gc-mono gc-uppercase" style={{ letterSpacing: ".1em" }}>{match.stadium}</span>
        <span className="gc-mono gc-uppercase" style={{ letterSpacing: ".1em" }}>{match.city}</span>
      </div>
    </div>
  );
}

// ─── MatchCardPro (with live ring + radial wash) ─────────────────────────────
function MatchCardPro({ match }) {
  const home = window.GC.byCode[match.home];
  const away = window.GC.byCode[match.away];
  const isLive = match.status === "live" || match.status === "halftime";
  const isFinal = match.status === "final";

  return (
    <div className={`gc-card gc-hover ${isLive ? "gc-live-card" : ""}`} style={{ padding: 20, position: "relative", overflow: "hidden" }}>
      {isLive && (
        <div style={{
          position: "absolute", top: 0, right: 0, width: 220, height: 220,
          background: "radial-gradient(circle at top right, color-mix(in oklab, var(--red) 28%, transparent), transparent 60%)",
          pointerEvents: "none",
        }} />
      )}
      <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
        <Eyebrow>{match.phase}</Eyebrow>
        {isLive ? <Pill live>{match.minute || "LIVE"}</Pill>
         : isFinal ? <Pill tone="ink">FT</Pill>
         : <Pill>{new Date(match.kickoff).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Pill>}
      </div>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div className="gc-col gc-gap-xs" style={{ alignItems: "center", flex: 1 }}>
          <Flag code={home.code} size={44} />
          <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em" }}>{home.code}</span>
          <span style={{ fontWeight: 600, fontSize: 13, textAlign: "center" }}>{home.name}</span>
        </div>
        <div className="gc-col" style={{ alignItems: "center", padding: "0 14px" }}>
          {match.homeScore !== null ? (
            <div className="gc-row gc-gap-sm" style={{ alignItems: "baseline" }}>
              <span className={`gc-score ${isLive ? "gc-score-pop" : ""}`} style={{ fontSize: 52 }}>{match.homeScore}</span>
              <span className="gc-mono" style={{ color: "var(--muted)" }}>—</span>
              <span className={`gc-score ${isLive ? "gc-score-pop" : ""}`} style={{ fontSize: 52 }}>{match.awayScore}</span>
            </div>
          ) : (
            <span className="gc-display" style={{ fontSize: 30, color: "var(--muted)" }}>vs</span>
          )}
        </div>
        <div className="gc-col gc-gap-xs" style={{ alignItems: "center", flex: 1 }}>
          <Flag code={away.code} size={44} />
          <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em" }}>{away.code}</span>
          <span style={{ fontWeight: 600, fontSize: 13, textAlign: "center" }}>{away.name}</span>
        </div>
      </div>
      <div className="gc-row gc-rule" style={{ justifyContent: "space-between", marginTop: 16, paddingTop: 12, fontSize: 11.5, color: "var(--muted)" }}>
        <span className="gc-mono gc-uppercase" style={{ letterSpacing: ".1em" }}>{match.stadium}</span>
        <span className="gc-mono gc-uppercase" style={{ letterSpacing: ".1em" }}>{match.city}</span>
      </div>
    </div>
  );
}

// ─── FixtureRail (horizontal scoreboard strip) ───────────────────────────────
function FixtureRail({ count = 6 }) {
  const items = window.GC.matches.slice(0, count);
  return (
    <div className="bc-fixrail">
      {items.map(m => {
        const home = window.GC.byCode[m.home];
        const away = window.GC.byCode[m.away];
        const isLive = m.status === "live" || m.status === "halftime";
        const isFinal = m.status === "final";
        return (
          <div key={m.id} className="gc-col gc-gap-xs">
            <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <Eyebrow style={{ fontSize: 10 }}>{m.phase}</Eyebrow>
              {isLive ? (
                <Pill live style={{ fontSize: 10, padding: "2px 7px 2px 6px" }}>{m.minute || "LIVE"}</Pill>
              ) : isFinal ? (
                <span className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em" }}>FT</span>
              ) : (
                <span className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em" }}>
                  {new Date(m.kickoff).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <div className="gc-row gc-gap-sm" style={{ alignItems: "center", marginTop: 4 }}>
              <Flag code={home.code} size={20} />
              <span className="gc-grow gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{home.name}</span>
              <span className="gc-mono" style={{ fontSize: 16, fontWeight: 800 }}>{m.homeScore ?? "–"}</span>
            </div>
            <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
              <Flag code={away.code} size={20} />
              <span className="gc-grow gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{away.name}</span>
              <span className="gc-mono" style={{ fontSize: 16, fontWeight: 800 }}>{m.awayScore ?? "–"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { LiveTicker, Countdown, MatchCard, MatchCardPro, FixtureRail });
