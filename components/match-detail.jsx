// components/match-detail.jsx
// Components for the fixture / match-detail module.
// Reuses primitives from atoms/match/data-viz/features.
// New here: MatchHero, MatchTimeline, MatchStats, MatchLineups, StadiumCard,
//          MatchRow, DateScrubber, StatusChips, FormChips, PredictionBar.

// ─── FormChips · W/D/L last 5 ────────────────────────────────────────────────
function FormChips({ form }) {
  const colorMap = {
    W: "var(--green)", D: "var(--muted)", L: "var(--red)", "—": "var(--paper-2)",
  };
  const fgMap = { W: "var(--paper)", D: "var(--paper)", L: "var(--paper)", "—": "var(--muted)" };
  return (
    <div className="gc-row gc-gap-xs">
      {form.map((r, i) => (
        <span key={i} style={{
          width: 22, height: 22, borderRadius: 4,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: colorMap[r], color: fgMap[r],
          fontFamily: "var(--f-sub)", fontSize: 11, fontWeight: 800,
        }}>{r}</span>
      ))}
    </div>
  );
}

// ─── MatchHero · broadcast-style header ──────────────────────────────────────
function MatchHero({ match, detail }) {
  const home = window.GC.byCode[match.home];
  const away = window.GC.byCode[match.away];
  const stadiumInfo = window.GC.stadiums[match.stadium];
  const isLive = match.status === "live" || match.status === "halftime";
  const isFinal = match.status === "final";

  return (
    <section className="bc-hero-stage" style={{ paddingBottom: 24 }}>
      <Floodlight size={720} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.35} top={-260} left="30%" blend="multiply" />
      <Floodlight size={560} color="color-mix(in oklab, var(--red) 50%, transparent)"  opacity={.28} top={-180} right={-120} blend="multiply" />
      <Floodlight size={640} color="color-mix(in oklab, var(--green) 55%, transparent)" opacity={.22} bottom={-280} left={-160} blend="multiply" />
      <Watermark style={{ top: 180, right: -20 }}>{match.group || "MD"}</Watermark>

      <div style={{ padding: "20px 56px 8px", position: "relative", zIndex: 2 }}>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Eyebrow>↘ {match.phase} · {stadiumInfo ? stadiumInfo.country : match.city}</Eyebrow>
          <div className="gc-row gc-gap-sm">
            {isLive
              ? <Pill live>{match.minute || "LIVE"}</Pill>
              : isFinal
                ? <Pill tone="ink">FT</Pill>
                : <Pill>{new Date(match.kickoff).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Pill>}
            <Pill>Group {match.group}</Pill>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 56px 0", position: "relative", zIndex: 1 }}>
        <div className="gc-rule-double" />
      </div>

      <div className="gc-rise" style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
        gap: 28, alignItems: "center",
        padding: "32px 56px",
        position: "relative", zIndex: 1,
      }}>
        {/* HOME */}
        <div className="gc-col gc-gap-sm" style={{ alignItems: "flex-end", textAlign: "right", minWidth: 0 }}>
          <Flag code={home.code} size={120} />
          <span className="gc-mono" style={{ fontSize: 13, letterSpacing: ".1em", fontWeight: 700, color: "var(--muted)" }}>{home.code}</span>
          <h1 style={{
            fontFamily: "var(--f-display)",
            fontSize: "clamp(34px, 5vw, 72px)", lineHeight: .88,
            margin: "2px 0 8px",
            textTransform: "uppercase",
            wordBreak: "break-word",
          }}>{home.name}</h1>
          {detail.formHome && <FormChips form={detail.formHome} />}
          {detail.lineupHome && (
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>
              {detail.lineupHome.manager} · {detail.lineupHome.formation}
            </span>
          )}
        </div>

        {/* SCORE */}
        <div className="gc-col" style={{ alignItems: "center", textAlign: "center", minWidth: 0 }}>
          {match.homeScore !== null ? (
            <div className="gc-row" style={{ gap: "clamp(8px, 1.5vw, 32px)", alignItems: "baseline" }}>
              <span className={`gc-score ${isLive ? "gc-score-pop" : ""}`} style={{ fontSize: "clamp(80px, 11vw, 168px)" }}>{match.homeScore}</span>
              <span className="gc-mono" style={{ fontSize: "clamp(28px, 4vw, 56px)", color: "var(--muted)" }}>—</span>
              <span className={`gc-score ${isLive ? "gc-score-pop" : ""}`} style={{ fontSize: "clamp(80px, 11vw, 168px)" }}>{match.awayScore}</span>
            </div>
          ) : (
            <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(60px, 8vw, 116px)", color: "var(--muted)", lineHeight: 1 }}>vs</span>
          )}
          <div className="gc-mono" style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".12em", marginTop: 10, textTransform: "uppercase" }}>
            {match.stadium} · {match.city}
            {stadiumInfo && ` · CAP. ${stadiumInfo.cap.toLocaleString()}`}
          </div>
        </div>

        {/* AWAY */}
        <div className="gc-col gc-gap-sm" style={{ alignItems: "flex-start", textAlign: "left", minWidth: 0 }}>
          <Flag code={away.code} size={120} />
          <span className="gc-mono" style={{ fontSize: 13, letterSpacing: ".1em", fontWeight: 700, color: "var(--muted)" }}>{away.code}</span>
          <h1 style={{
            fontFamily: "var(--f-display)",
            fontSize: "clamp(34px, 5vw, 72px)", lineHeight: .88,
            margin: "2px 0 8px",
            textTransform: "uppercase",
            wordBreak: "break-word",
          }}>{away.name}</h1>
          {detail.formAway && <FormChips form={detail.formAway} />}
          {detail.lineupAway && (
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>
              {detail.lineupAway.manager} · {detail.lineupAway.formation}
            </span>
          )}
        </div>
      </div>

      {/* Countdown row — only for upcoming matches, full-width below the score */}
      {!isLive && !isFinal && match.homeScore === null && (
        <div style={{
          padding: "4px 56px 32px",
          display: "flex", justifyContent: "center",
          position: "relative", zIndex: 1,
        }}>
          <div className="gc-glass" style={{ padding: "18px 28px", display: "inline-flex", alignItems: "center", gap: 18 }}>
            <Eyebrow tone="red" style={{ whiteSpace: "nowrap" }}>↘ KICKOFF EN</Eyebrow>
            <Countdown target={new Date(match.kickoff)} />
          </div>
        </div>
      )}
    </section>
  );
}

// ─── MatchTabs · navigation between sections of detail page ─────────────────
function MatchTabs({ tabs, active, onSelect }) {
  return (
    <div style={{ position: "sticky", top: 60, zIndex: 30, background: "var(--paper)", borderBottom: "2px solid var(--ink)" }}>
      <div className="gc-row" style={{ padding: "0 56px", gap: 16, flexWrap: "wrap" }}>
        {tabs.map(t => {
          const isOn = active === t.id;
          return (
            <button key={t.id} onClick={() => onSelect(t.id)} style={{
              border: 0, background: "transparent", color: "var(--ink)",
              fontFamily: "var(--f-sub)", fontWeight: 800,
              fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase",
              padding: "16px 4px", cursor: "pointer",
              borderBottom: isOn ? "3px solid var(--ink)" : "3px solid transparent",
              marginBottom: -2, transition: "border-color .15s ease",
              opacity: isOn ? 1 : .55,
            }}>{t.label}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── MatchTimeline · event log ──────────────────────────────────────────────
function MatchTimeline({ events, homeCode, awayCode }) {
  if (!events.length) {
    return (
      <div className="gc-card" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow>NO EVENTS YET</Eyebrow>
        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 42, margin: "10px 0 8px", lineHeight: .9 }}>
          Pitazo inicial pendiente
        </h3>
        <p style={{ fontSize: 13, color: "var(--ink-2)", maxWidth: 420, margin: "0 auto" }}>
          Once the referee blows the first whistle, every goal, card, substitution and key save will appear here in real time.
        </p>
      </div>
    );
  }

  const iconMap = {
    goal:    { glyph: "●", color: "var(--green)" },
    yellow:  { glyph: "■", color: "var(--gold)" },
    red:     { glyph: "■", color: "var(--red)" },
    sub:     { glyph: "⇄", color: "var(--ink)" },
    kickoff: { glyph: "▶", color: "var(--muted)" },
  };

  return (
    <div className="gc-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="gc-row" style={{ padding: "14px 22px", borderBottom: "1px solid var(--rule)", justifyContent: "space-between", alignItems: "center" }}>
        <Eyebrow>TIMELINE · MATCH EVENTS</Eyebrow>
        <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{events.length} EVENTS</span>
      </div>
      <div className="gc-col" style={{ position: "relative" }}>
        {events.map((e, i) => {
          const icon = iconMap[e.type] || iconMap.kickoff;
          const isHome = e.team === "home";
          const isAway = e.team === "away";
          const isCenter = !isHome && !isAway;
          return (
            <div key={i} className="gc-row" style={{
              padding: "16px 22px",
              borderBottom: i < events.length - 1 ? "1px solid var(--rule)" : 0,
              alignItems: "center",
              background: isCenter ? "var(--paper-2)" : "transparent",
            }}>
              {/* home column */}
              <div className="gc-col" style={{ flex: 1, alignItems: "flex-end", textAlign: "right" }}>
                {isHome && (
                  <>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{e.player}</span>
                    {e.detail && <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{e.detail}</span>}
                  </>
                )}
              </div>

              {/* center column */}
              <div className="gc-col" style={{ width: 120, alignItems: "center", flex: "0 0 auto" }}>
                <span style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1, color: isCenter ? "var(--muted)" : "var(--ink)" }}>{e.minute}</span>
                <div className="gc-row gc-gap-xs" style={{ alignItems: "center", marginTop: 2 }}>
                  <span style={{ color: icon.color, fontSize: 14 }}>{icon.glyph}</span>
                  <span className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>{e.type}</span>
                </div>
              </div>

              {/* away column */}
              <div className="gc-col" style={{ flex: 1, alignItems: "flex-start", textAlign: "left" }}>
                {isAway && (
                  <>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{e.player}</span>
                    {e.detail && <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{e.detail}</span>}
                  </>
                )}
                {isCenter && (
                  <span className="gc-mono gc-uppercase" style={{ width: "100%", textAlign: "center", fontSize: 11, color: "var(--muted)", letterSpacing: ".12em" }}>{e.detail}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MatchStats · broadcast-style stat bars ─────────────────────────────────
function MatchStats({ stats }) {
  if (!stats) {
    return (
      <div className="gc-card" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow>STATS PENDING</Eyebrow>
        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 42, margin: "10px 0 8px", lineHeight: .9 }}>
          Live stats start at kickoff
        </h3>
      </div>
    );
  }

  const rows = [
    { l: "Posesión",       k: "possession",   pct: true },
    { l: "Tiros",          k: "shots",        pct: false },
    { l: "Tiros al arco",  k: "shotsOnTarget",pct: false },
    { l: "Pases",          k: "passes",       pct: false },
    { l: "% Pases",        k: "passAccuracy", pct: true },
    { l: "Tiros de esquina", k: "corners",    pct: false },
    { l: "Faltas",         k: "fouls",        pct: false },
    { l: "Fueras de lugar",k: "offsides",     pct: false },
  ];

  return (
    <div className="gc-card" style={{ padding: 28 }}>
      <Eyebrow>STAT COMPARISON · BROADCAST GRAPH</Eyebrow>
      <div className="gc-col gc-gap-md" style={{ marginTop: 18 }}>
        {rows.map(r => {
          const [h, a] = stats[r.k];
          const total = r.pct ? 100 : h + a;
          const hPct = total > 0 ? (h / total) * 100 : 50;
          return (
            <div key={r.k}>
              <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 6, alignItems: "baseline" }}>
                <span className="gc-display" style={{ fontSize: 28, lineHeight: 1 }}>{h}{r.pct && "%"}</span>
                <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase" }}>{r.l}</span>
                <span className="gc-display" style={{ fontSize: 28, lineHeight: 1 }}>{a}{r.pct && "%"}</span>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: `${hPct}% ${100 - hPct}%`,
                height: 8, background: "var(--paper-2)", borderRadius: 999, overflow: "hidden", gap: 2,
              }}>
                <div style={{ background: "var(--ink)", borderRadius: "999px 0 0 999px" }} />
                <div style={{ background: "var(--red)", borderRadius: "0 999px 999px 0" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MatchLineups · simplified XI list per side ──────────────────────────────
function MatchLineups({ home, away, homeNation, awayNation }) {
  if (!home || !away) {
    return (
      <div className="gc-card" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow>LINEUPS PENDING</Eyebrow>
        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 42, margin: "10px 0 8px", lineHeight: .9 }}>
          Alineaciones 1h antes del pitazo
        </h3>
        <p style={{ fontSize: 13, color: "var(--ink-2)", maxWidth: 420, margin: "0 auto" }}>
          Coaches confirm starting elevens roughly an hour before kickoff. We'll surface the XI plus formation here as soon as it's official.
        </p>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <LineupCard team={home} nation={homeNation} side="home" />
      <LineupCard team={away} nation={awayNation} side="away" />
    </div>
  );
}

function LineupCard({ team, nation, side }) {
  return (
    <div className="gc-card" style={{ padding: 24 }}>
      <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 18, alignItems: "center" }}>
        <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
          <Flag code={nation.code} size={28} />
          <div className="gc-col">
            <span style={{ fontFamily: "var(--f-display)", fontSize: 26, textTransform: "uppercase", lineHeight: 1 }}>{nation.name}</span>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{team.manager} · {team.formation}</span>
          </div>
        </div>
        <Pill tone={side === "home" ? "ink" : "default"}>
          {side === "home" ? "HOME" : "AWAY"}
        </Pill>
      </div>
      <div className="gc-col gc-gap-xs">
        {team.eleven.map(p => (
          <div key={p.num} className="gc-row" style={{ padding: "8px 0", borderBottom: "1px solid var(--rule)", alignItems: "center" }}>
            <span className="gc-mono" style={{
              width: 30, color: p.pos === "GK" ? "var(--gold)" : "var(--muted)",
              fontWeight: 800, fontSize: 13, letterSpacing: ".05em",
            }}>{String(p.num).padStart(2, "0")}</span>
            <span className="gc-grow" style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
            <span className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase" }}>{p.pos}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── StadiumCard ─────────────────────────────────────────────────────────────
function StadiumCard({ name, city, matchTime, attendance }) {
  const info = window.GC.stadiums[name];
  return (
    <div className="gc-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        position: "relative", aspectRatio: "16 / 8",
        background: "var(--green)", color: "var(--green-ink)",
      }}>
        <svg viewBox="0 0 800 400" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="stad-flood" cx="50%" cy="0%" r="80%">
              <stop offset="0%"  stopColor="#f4b500" stopOpacity=".5" />
              <stop offset="55%" stopColor="#f4b500" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="400" fill="url(#stad-flood)" />
          {/* pitch markings */}
          <rect x="60" y="80" width="680" height="260" fill="none" stroke="rgba(247,241,223,.45)" strokeWidth="2" />
          <line x1="400" y1="80" x2="400" y2="340" stroke="rgba(247,241,223,.4)" strokeWidth="2" />
          <circle cx="400" cy="210" r="44" fill="none" stroke="rgba(247,241,223,.4)" strokeWidth="2" />
          <circle cx="400" cy="210" r="3" fill="rgba(247,241,223,.6)" />
          <rect x="60"  y="155" width="60" height="110" fill="none" stroke="rgba(247,241,223,.4)" strokeWidth="2" />
          <rect x="680" y="155" width="60" height="110" fill="none" stroke="rgba(247,241,223,.4)" strokeWidth="2" />
          <rect x="60"  y="185" width="20" height="50"  fill="none" stroke="rgba(247,241,223,.4)" strokeWidth="2" />
          <rect x="720" y="185" width="20" height="50"  fill="none" stroke="rgba(247,241,223,.4)" strokeWidth="2" />
          {/* crowd dots */}
          {Array.from({ length: 100 }).map((_, i) => (
            <circle key={i}
                    cx={20 + (i * 7) % 760}
                    cy={20 + ((i * 11) % 50)}
                    r="1.4" fill="rgba(247,241,223,0.45)" />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="gc-row gc-gap-sm">
            <Pill tone="gold">{info?.roof || "Open roof"}</Pill>
            <Pill style={{ background: "rgba(247,241,223,.15)", borderColor: "transparent", color: "var(--green-ink)" }}>{info?.surface || "Natural"}</Pill>
          </div>
          <div>
            <Eyebrow tone="onGreen">↘ HOST VENUE</Eyebrow>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 44, margin: "6px 0 4px", lineHeight: .9, textTransform: "uppercase", color: "var(--green-ink)" }}>{name}</h3>
            <span className="gc-mono" style={{ fontSize: 12, opacity: .8, letterSpacing: ".1em" }}>{city.toUpperCase()}{info && ` · ${info.country.toUpperCase()}`}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: 22, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <Stat label="CAPACIDAD"  value={info?.cap?.toLocaleString() || "—"} />
        <Stat label="ABRIÓ"      value={info?.opened || "—"} />
        <Stat label="KICKOFF"    value={matchTime || "—"} />
        <Stat label="ASISTENCIA" value={attendance || "Pendiente"} />
      </div>
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div className="gc-col">
      <Eyebrow style={{ fontSize: 9 }}>{label}</Eyebrow>
      <span style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: .9, marginTop: 6 }}>{value}</span>
    </div>
  );
}

// ─── PredictionBar (used in upcoming match detail) ───────────────────────────
function PredictionBar({ pct, homeName, awayName }) {
  if (!pct) return null;
  return (
    <div className="gc-card" style={{ padding: 28 }}>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <Eyebrow>FAN PREDICTIONS · 4,218 PICKS</Eyebrow>
        <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>ALL POOLS</span>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: `${pct.homeWin}% ${pct.draw}% ${pct.awayWin}%`,
        marginTop: 18, height: 64, borderRadius: 12, overflow: "hidden", gap: 2,
      }}>
        <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "0 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="gc-mono" style={{ fontSize: 10, opacity: .7, letterSpacing: ".08em" }}>{homeName.toUpperCase()} GANA</span>
          <span className="gc-display" style={{ fontSize: 36, lineHeight: 1 }}>{pct.homeWin}%</span>
        </div>
        <div style={{ background: "var(--paper-2)", color: "var(--ink)", padding: "0 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="gc-mono" style={{ fontSize: 10, opacity: .65, letterSpacing: ".08em" }}>EMPATE</span>
          <span className="gc-display" style={{ fontSize: 36, lineHeight: 1 }}>{pct.draw}%</span>
        </div>
        <div style={{ background: "var(--red)", color: "var(--red-ink)", padding: "0 14px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
          <span className="gc-mono" style={{ fontSize: 10, opacity: .85, letterSpacing: ".08em" }}>{awayName.toUpperCase()} GANA</span>
          <span className="gc-display" style={{ fontSize: 36, lineHeight: 1 }}>{pct.awayWin}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── H2HCard ────────────────────────────────────────────────────────────────
function H2HCard({ h2h }) {
  if (!h2h?.length) return null;
  return (
    <div className="gc-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="gc-row" style={{ padding: "14px 22px", borderBottom: "1px solid var(--rule)" }}>
        <Eyebrow>HEAD TO HEAD · LAST {h2h.length} MEETINGS</Eyebrow>
      </div>
      {h2h.map((m, i) => {
        const wColor = m.you === "W" ? "var(--green)" : m.you === "L" ? "var(--red)" : "var(--muted)";
        return (
          <div key={i} className="gc-row" style={{
            padding: "14px 22px", borderBottom: i < h2h.length - 1 ? "1px solid var(--rule)" : 0,
            alignItems: "center", gap: 16,
          }}>
            <span className="gc-mono" style={{ width: 90, fontSize: 12, color: "var(--muted)", letterSpacing: ".06em" }}>{m.date}</span>
            <span className="gc-mono gc-grow" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>{m.phase}</span>
            <span className="gc-display" style={{ fontSize: 22 }}>{m.result}</span>
            <span style={{
              width: 24, height: 24, borderRadius: 4,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: wColor, color: "var(--paper)",
              fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 11,
            }}>{m.you}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── MetaCard · referee / weather / attendance facts ────────────────────────
function MetaCard({ detail }) {
  const cells = [];
  if (detail.weather) cells.push({ l: "CLIMA", v: `${detail.weather.temp}°C · ${detail.weather.cond}`, sub: detail.weather.wind });
  if (detail.attendance) cells.push({ l: "ASISTENCIA", v: detail.attendance, sub: "" });
  if (detail.referee)   cells.push({ l: "ÁRBITRO", v: detail.referee, sub: detail.var ? `VAR · ${detail.var}` : "" });
  if (!cells.length) return null;
  return (
    <div className="gc-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="gc-row" style={{ padding: "14px 22px", borderBottom: "1px solid var(--rule)" }}>
        <Eyebrow>MATCH FACTS</Eyebrow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
        {cells.map((c, i) => (
          <div key={c.l} style={{ padding: 20, borderRight: i < cells.length - 1 ? "1px solid var(--rule)" : 0 }}>
            <Eyebrow style={{ fontSize: 9 }}>{c.l}</Eyebrow>
            <div style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 18, marginTop: 6, letterSpacing: ".01em", textTransform: "uppercase" }}>{c.v}</div>
            {c.sub && <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em" }}>{c.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MatchRow · compact horizontal row used in lists ────────────────────────
function MatchRow({ match, onClick }) {
  const home = window.GC.byCode[match.home];
  const away = window.GC.byCode[match.away];
  const isLive = match.status === "live" || match.status === "halftime";
  const isFinal = match.status === "final";
  return (
    <div className="gc-hover" onClick={onClick} style={{
      display: "grid",
      gridTemplateColumns: "70px minmax(0, 1fr) auto minmax(0, 1fr) minmax(140px, 200px) minmax(60px, 90px) 22px",
      gap: 14, alignItems: "center",
      padding: "16px 22px",
      background: "var(--paper)",
      border: "1px solid var(--rule)",
      borderRadius: 12, cursor: "pointer",
      position: "relative",
    }}>
      <div className="gc-col gc-gap-xs" style={{ alignItems: "flex-start" }}>
        {isLive ? <Pill live style={{ fontSize: 10 }}>{match.minute || "LIVE"}</Pill>
         : isFinal ? <Pill tone="ink" style={{ fontSize: 10 }}>FT</Pill>
         : <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: "var(--ink)" }}>
             {new Date(match.kickoff).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}
           </span>}
        <span className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em" }}>{match.group ? `GRP ${match.group}` : "—"}</span>
      </div>

      {/* home — right aligned to score */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent: "flex-end", alignItems: "center", minWidth: 0 }}>
        <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14, textAlign: "right" }}>{home.name}</span>
        <Flag code={home.code} size={24} />
      </div>

      {/* score */}
      <div className="gc-row gc-gap-sm" style={{ alignItems: "baseline", justifyContent: "center", minWidth: 80 }}>
        {match.homeScore !== null ? (
          <>
            <span className={`gc-display ${isLive ? "gc-score-pop" : ""}`} style={{ fontSize: 28 }}>{match.homeScore}</span>
            <span className="gc-mono" style={{ color: "var(--muted)" }}>—</span>
            <span className={`gc-display ${isLive ? "gc-score-pop" : ""}`} style={{ fontSize: 28 }}>{match.awayScore}</span>
          </>
        ) : (
          <span className="gc-display" style={{ fontSize: 24, color: "var(--muted)" }}>vs</span>
        )}
      </div>

      {/* away */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent: "flex-start", alignItems: "center", minWidth: 0 }}>
        <Flag code={away.code} size={24} />
        <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14 }}>{away.name}</span>
      </div>

      {/* stadium */}
      <div className="gc-col" style={{ minWidth: 0 }}>
        <span className="gc-mono gc-truncate" style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".04em" }}>{match.stadium}</span>
        <span className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em" }}>{match.city.toUpperCase()}</span>
      </div>

      {/* phase */}
      <span className="gc-mono gc-truncate" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", textAlign: "right" }}>{match.phase.split("·").pop().trim()}</span>

      {/* chevron */}
      <span style={{ color: "var(--muted)", fontSize: 18, justifySelf: "end" }}>→</span>
    </div>
  );
}

// ─── DateScrubber · horizontal MDx bar ──────────────────────────────────────
function DateScrubber({ active, onSelect }) {
  return (
    <div className="gc-row" style={{ borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)", overflow: "hidden" }}>
      {window.GC.matchDays.map(d => {
        const isOn = active === d.key;
        const stateColor =
          d.group === "live" ? "var(--red)"
          : d.group === "next" ? "var(--ink)"
          : "var(--muted)";
        return (
          <button key={d.key} onClick={() => onSelect(d.key)} style={{
            flex: 1, border: 0,
            background: isOn ? "var(--ink)" : "var(--paper)",
            color: isOn ? "var(--paper)" : "var(--ink)",
            padding: "16px 14px", cursor: "pointer",
            borderRight: "1px solid var(--rule)",
            transition: "background .15s ease, color .15s ease",
            textAlign: "left",
          }}>
            <div className="gc-mono" style={{
              fontSize: 10, letterSpacing: ".12em",
              color: isOn ? "var(--paper)" : stateColor, opacity: isOn ? .65 : 1,
              fontWeight: 700, textTransform: "uppercase",
            }}>{d.group === "live" ? "● " : ""}{d.label}</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1, marginTop: 4 }}>{d.date}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── StatusChips · pill segmented filter ─────────────────────────────────────
function StatusChips({ value, onChange, options }) {
  return (
    <div className="gc-tabs">
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} className={value === o.id ? "is-on" : ""}>
          {o.label}{typeof o.count === "number" ? ` · ${o.count}` : ""}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, {
  FormChips, MatchHero, MatchTabs, MatchTimeline,
  MatchStats, MatchLineups, LineupCard, StadiumCard,
  PredictionBar, H2HCard, MetaCard,
  MatchRow, DateScrubber, StatusChips,
});
