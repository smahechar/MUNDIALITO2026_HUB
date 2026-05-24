// components/data-viz.jsx
// Standings table, scorers list, stat tiles, group switcher.

// ─── StandingsTable ─────────────────────────────────────────────────────────
function StandingsTable({ group, compact = false }) {
  return (
    <table className="gc-table">
      <thead>
        <tr>
          <th style={{ width: 22 }}>#</th>
          <th>Team</th>
          <th style={{ textAlign: "right" }}>P</th>
          <th style={{ textAlign: "right" }}>W</th>
          <th style={{ textAlign: "right" }}>D</th>
          <th style={{ textAlign: "right" }}>L</th>
          <th style={{ textAlign: "right" }}>GD</th>
          <th style={{ textAlign: "right" }}>Pts</th>
        </tr>
      </thead>
      <tbody>
        {group.teams.map((t, i) => (
          <tr key={t.code}>
            <td>
              <span style={{
                display: "inline-flex", width: 18, height: 18, borderRadius: 4,
                alignItems: "center", justifyContent: "center",
                background: i < 2 ? "var(--green)" : "transparent",
                color: i < 2 ? "var(--green-ink)" : "var(--muted)",
                fontSize: 10, fontWeight: 700,
              }}>{i + 1}</span>
            </td>
            <td>
              <span className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
                <Flag code={t.code} size={18} />
                <span style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 13 }}>{t.name}</span>
              </span>
            </td>
            <td style={{ textAlign: "right" }}>{t.played}</td>
            <td style={{ textAlign: "right" }}>{t.w}</td>
            <td style={{ textAlign: "right" }}>{t.d}</td>
            <td style={{ textAlign: "right" }}>{t.l}</td>
            <td style={{ textAlign: "right", color: t.gd > 0 ? "var(--green)" : t.gd < 0 ? "var(--red)" : "var(--muted)" }}>
              {t.gd > 0 ? "+" + t.gd : t.gd}
            </td>
            <td style={{ textAlign: "right", fontWeight: 700, color: "var(--ink)" }}>{t.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── GroupSwitcher ──────────────────────────────────────────────────────────
function GroupSwitcher() {
  const [active, setActive] = React.useState(0);
  const group = window.GC.groups[active];
  return (
    <div className="gc-card" style={{ padding: 24 }}>
      <div className="gc-row gc-gap-sm" style={{ marginBottom: 14, flexWrap: "wrap" }}>
        {window.GC.groups.map((g, i) => (
          <button key={g.name} onClick={() => setActive(i)} style={{
            border: 0, background: i === active ? "var(--ink)" : "transparent",
            color: i === active ? "var(--paper)" : "var(--ink)",
            fontFamily: "var(--f-sub)", fontWeight: 800, textTransform: "uppercase",
            letterSpacing: ".08em", fontSize: 12, padding: "8px 14px",
            borderRadius: 999, cursor: "pointer",
            transition: "background .2s ease, color .2s ease",
          }}>Group {g.name}</button>
        ))}
      </div>
      <StandingsTable group={group} />
    </div>
  );
}

// ─── ScorersList ────────────────────────────────────────────────────────────
function ScorersList({ limit = 6 }) {
  const top = window.GC.scorers.slice(0, limit);
  const max = top[0].goals;
  return (
    <div className="gc-col" style={{ gap: 12 }}>
      {top.map((p, i) => (
        <div key={p.name} className="gc-col gc-gap-xs">
          <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
              <span className="gc-mono" style={{
                width: 22, height: 22, borderRadius: 6,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: i === 0 ? "var(--gold)" : i < 3 ? "var(--ink)" : "var(--paper-2)",
                color: i === 0 ? "var(--gold-ink)" : i < 3 ? "var(--paper)" : "var(--muted)",
                fontSize: 11, fontWeight: 800,
              }}>{p.rank}</span>
              <Flag code={p.nation} size={20} />
              <div className="gc-col">
                <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                <Eyebrow style={{ fontSize: 10 }}>{p.role}</Eyebrow>
              </div>
            </div>
            <div className="gc-row gc-gap-md" style={{ alignItems: "baseline" }}>
              <span className="gc-mono gc-mute" style={{ fontSize: 11 }}>{p.assists} A</span>
              <span className="gc-display" style={{ fontSize: 30, color: "var(--ink)" }}>{p.goals}</span>
            </div>
          </div>
          <div className="gc-bar"><i style={{ width: `${(p.goals / max) * 100}%`, background: i === 0 ? "var(--gold)" : "var(--ink)" }} /></div>
        </div>
      ))}
    </div>
  );
}

// ─── ScorersListOnDark ──────────────────────────────────────────────────────
function ScorersListOnDark({ limit = 6 }) {
  const top = window.GC.scorers.slice(0, limit);
  const max = top[0].goals;
  return (
    <div className="gc-col" style={{ gap: 16 }}>
      {top.map((p, i) => (
        <div key={p.name} className="gc-col gc-gap-xs">
          <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
              <span className="gc-mono" style={{
                width: 22, height: 22, borderRadius: 6,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: i === 0 ? "var(--gold)" : "rgba(247,241,223,.1)",
                color: i === 0 ? "var(--gold-ink)" : "var(--paper)",
                fontSize: 11, fontWeight: 800,
              }}>{p.rank}</span>
              <Flag code={p.nation} size={20} />
              <div className="gc-col">
                <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                <Eyebrow tone="onDark">{p.role}</Eyebrow>
              </div>
            </div>
            <div className="gc-row gc-gap-md" style={{ alignItems: "baseline" }}>
              <span className="gc-mono" style={{ fontSize: 11, opacity: .6 }}>{p.assists} A</span>
              <span className="gc-display" style={{ fontSize: 30, color: i === 0 ? "var(--gold)" : "var(--paper)" }}>{p.goals}</span>
            </div>
          </div>
          <div className="gc-bar" style={{ background: "rgba(247,241,223,.12)" }}>
            <i style={{ width: `${(p.goals / max) * 100}%`, background: i === 0 ? "var(--gold)" : "var(--paper)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── StatTile (static) ──────────────────────────────────────────────────────
function StatTile({ label, value, change, tone = "paper" }) {
  const isInk = tone === "ink";
  const isRed = tone === "red";
  const isGold = tone === "gold";
  const isGreen = tone === "green";
  const bg = isInk ? "var(--ink)" : isRed ? "var(--red)" : isGold ? "var(--gold)" : isGreen ? "var(--green)" : "var(--paper)";
  const fg = isInk ? "var(--paper)" : isRed ? "var(--red-ink)" : isGold ? "var(--gold-ink)" : isGreen ? "var(--green-ink)" : "var(--ink)";
  return (
    <div className="gc-card" style={{ background: bg, color: fg, borderColor: bg === "var(--paper)" ? "var(--rule)" : "transparent", padding: 22 }}>
      <Eyebrow style={{ color: fg, opacity: .7 }}>{label}</Eyebrow>
      <div className="gc-display" style={{ fontSize: 68, marginTop: 8, lineHeight: .85 }}>{value}</div>
      <div className="gc-mono" style={{ fontSize: 11.5, marginTop: 12, opacity: .75, letterSpacing: ".06em" }}>{change}</div>
    </div>
  );
}

// ─── StatTilePro (animated count-up + corner radial) ────────────────────────
function StatTilePro({ label, value, change, decimals = 0, tone = "paper" }) {
  const v = useCountUp(value, 1400);
  const isInk = tone === "ink";
  const isRed = tone === "red";
  const isGold = tone === "gold";
  const bg = isInk ? "var(--ink)" : isRed ? "var(--red)" : isGold ? "var(--gold)" : "var(--paper)";
  const fg = isInk ? "var(--paper)" : isRed ? "var(--red-ink)" : isGold ? "var(--gold-ink)" : "var(--ink)";
  const display = decimals
    ? v.toFixed(decimals)
    : value >= 1000 ? Math.round(v).toLocaleString() : Math.round(v);
  return (
    <div className="gc-card gc-hover no-accent" style={{
      background: bg, color: fg, padding: 24,
      borderColor: bg === "var(--paper)" ? "var(--rule)" : "transparent",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(circle at 100% 0%, ${isInk ? "rgba(247,241,223,.06)" : "rgba(255,255,255,.18)"}, transparent 60%)`,
      }} />
      <Eyebrow style={{ color: fg, opacity: .7, position: "relative" }}>{label}</Eyebrow>
      <div className="gc-display" style={{ fontSize: 64, marginTop: 10, lineHeight: .85, position: "relative" }}>{display}</div>
      <div className="gc-mono" style={{ fontSize: 11.5, marginTop: 12, opacity: .8, letterSpacing: ".06em", position: "relative" }}>{change}</div>
    </div>
  );
}

Object.assign(window, {
  StandingsTable, GroupSwitcher,
  ScorersList, ScorersListOnDark,
  StatTile, StatTilePro,
});
