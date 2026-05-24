// pages/fixture.jsx
// Match browsing — calendar of all matches, filter by match day, status, group.
// Click a row to navigate into /match/:id detail page.

function FixturePage({ current, onNavigate }) {
  const allMatches = window.GC.matches;

  // active match day filter (or "ALL")
  const [md, setMd] = React.useState("MD2");
  // status filter
  const [status, setStatus] = React.useState("all");
  // group filter
  const [group, setGroup] = React.useState("all");

  // counts for chips
  const counts = React.useMemo(() => ({
    all:      allMatches.length,
    live:     allMatches.filter(m => m.status === "live" || m.status === "halftime").length,
    upcoming: allMatches.filter(m => m.status === "upcoming").length,
    final:    allMatches.filter(m => m.status === "final").length,
  }), [allMatches]);

  // filtered list
  const filtered = React.useMemo(() => {
    return allMatches.filter(m => {
      if (md !== "ALL" && !m.phase.includes(md)) return false;
      if (status !== "all") {
        if (status === "live" && !(m.status === "live" || m.status === "halftime")) return false;
        if (status === "upcoming" && m.status !== "upcoming") return false;
        if (status === "final" && m.status !== "final") return false;
      }
      if (group !== "all" && m.group !== group) return false;
      return true;
    });
  }, [md, status, group, allMatches]);

  // group by kickoff date
  const grouped = React.useMemo(() => {
    const buckets = {};
    filtered.forEach(m => {
      const d = new Date(m.kickoff);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = buckets[key] || [];
      buckets[key].push(m);
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, matches]) => ({ key: k, date: new Date(k), matches: matches.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)) }));
  }, [filtered]);

  // spotlight match — first live, else next upcoming, else first final
  const spotlight = React.useMemo(() => {
    return filtered.find(m => m.status === "live" || m.status === "halftime")
        || filtered.find(m => m.status === "upcoming")
        || filtered[0];
  }, [filtered]);

  const stadiums = React.useMemo(() => {
    const set = new Set();
    filtered.forEach(m => set.add(m.stadium));
    return Array.from(set).map(name => ({ name, info: window.GC.stadiums[name] })).filter(s => s.info);
  }, [filtered]);

  return (
    <PageShell current="fixture" onNavigate={onNavigate}>
      <PageHeader
        kicker={`MODULE · FIXTURE · ${counts.all} MATCHES TOTAL`}
        title={<>Fixture<br/>completo.</>}
        lede="64 matches across 12 match days, 6 groups, and 16 host stadiums. Filter by match day, status, or group. Click any row to enter the broadcast-style match centre."
        action={
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost">Mi agenda</Btn>
            <Btn>Notificarme</Btn>
          </div>
        }
      />

      {/* ── Match Day scrubber ── */}
      <div style={{ padding: "0 56px" }}>
        <DateScrubber active={md} onSelect={setMd} />
      </div>

      {/* ── Filters row ── */}
      <div style={{ padding: "20px 56px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <StatusChips
          value={status}
          onChange={setStatus}
          options={[
            { id: "all",      label: "TODOS",       count: counts.all },
            { id: "live",     label: "EN VIVO",     count: counts.live },
            { id: "upcoming", label: "PRÓXIMOS",    count: counts.upcoming },
            { id: "final",    label: "TERMINADOS",  count: counts.final },
          ]}
        />
        <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
          <Eyebrow>GROUP</Eyebrow>
          <div className="gc-row gc-gap-xs">
            {["all", "A", "B", "C", "D", "E", "F"].map(g => (
              <button key={g} onClick={() => setGroup(g)} style={{
                border: 0,
                background: group === g ? "var(--ink)" : "transparent",
                color: group === g ? "var(--paper)" : "var(--ink)",
                width: 32, height: 32, borderRadius: 6, cursor: "pointer",
                fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 12,
                letterSpacing: ".06em", textTransform: "uppercase",
                outline: group === g ? "none" : "1px solid var(--rule)",
                transition: "background .15s ease, color .15s ease",
              }}>{g === "all" ? "ALL" : g}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SPOTLIGHT MATCH ── */}
      {spotlight && (
        <SectionHead
          num="01"
          label="↘ SPOTLIGHT · FEATURED OF THE WINDOW"
          title="Spotlight match"
          right={<span className="gc-link" onClick={() => onNavigate("match/" + spotlight.id)}>Abrir match centre →</span>}
        />
      )}
      {spotlight && (
        <div style={{ padding: "22px 56px 0" }}>
          <SpotlightMatch match={spotlight} onClick={() => onNavigate("match/" + spotlight.id)} />
        </div>
      )}

      {/* ── MATCHES BY DATE ── */}
      <SectionHead
        num="02"
        label={`↘ ${filtered.length} MATCHES · ${md === "ALL" ? "FULL CALENDAR" : md}`}
        title="Matches"
        right={<span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".12em" }}>RF-13 · RF-14 · RF-15</span>}
      />

      <div style={{ padding: "22px 56px 0" }}>
        {grouped.length === 0 ? (
          <div className="gc-card" style={{ padding: 56, textAlign: "center" }}>
            <Eyebrow>NO MATCHES</Eyebrow>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 42, margin: "10px 0 8px", lineHeight: .9 }}>
              No matches with those filters
            </h3>
            <p style={{ fontSize: 13, color: "var(--ink-2)" }}>Try clearing a filter or pick another match day.</p>
          </div>
        ) : (
          grouped.map(g => (
            <DayBlock key={g.key} date={g.date} matches={g.matches} onNavigate={onNavigate} />
          ))
        )}
      </div>

      {/* ── STADIUMS IN THIS WINDOW ── */}
      {stadiums.length > 0 && (
        <>
          <SectionHead
            num="03"
            label="↘ HOST VENUES · IN THIS WINDOW"
            title="Stadiums"
          />
          <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {stadiums.map(({ name, info }) => (
              <StadiumMiniCard key={name} name={name} info={info} />
            ))}
          </div>
        </>
      )}

      {/* ── CTA band ── */}
      <Band tone="ink" style={{ marginTop: 80 }}>
        <Floodlight size={600} color="var(--gold)" opacity={.22} top={-200} right={-100} />
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 24, position: "relative" }}>
          <div>
            <Eyebrow tone="onDark">↗ ACTIVATE NOTIFICATIONS</Eyebrow>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 72, margin: "8px 0 0", lineHeight: .85, textTransform: "uppercase" }}>
              Never miss<br/>a kickoff.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(247,241,223,.7)", maxWidth: 480, marginTop: 12 }}>
              Pick the matches you care about. We'll alert you 30 minutes before kickoff,
              when goals are scored, at half time, and when your team's xG creeps over 1.5.
            </p>
          </div>
          <button className="gc-btn" style={{ background: "var(--gold)", color: "var(--gold-ink)" }}>Configurar alertas</button>
        </div>
      </Band>

      <Footer />
    </PageShell>
  );
}

// ─── DayBlock · matches under one date heading ───────────────────────────────
function DayBlock({ date, matches, onNavigate }) {
  const dayLabel = date.toLocaleDateString("es-CO", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="gc-col gc-gap-sm" style={{ marginBottom: 28 }}>
      <div className="gc-row gc-rule-double" style={{ alignItems: "baseline", justifyContent: "space-between" }}>
        <div className="gc-row gc-gap-md" style={{ alignItems: "baseline" }}>
          <span className="gc-display" style={{ fontSize: 56, lineHeight: 1 }}>{date.getDate()}</span>
          <div className="gc-col">
            <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: ".04em" }}>{dayLabel}</span>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{matches.length} partidos</span>
          </div>
        </div>
        <Pill>{matches.find(m => m.status === "live" || m.status === "halftime") ? "EN CURSO" : matches.every(m => m.status === "final") ? "FINALIZADO" : "PROGRAMADO"}</Pill>
      </div>
      <div className="gc-col gc-gap-sm" style={{ marginTop: 10 }}>
        {matches.map(m => (
          <MatchRow key={m.id} match={m} onClick={() => onNavigate("match/" + m.id)} />
        ))}
      </div>
    </div>
  );
}

// ─── SpotlightMatch · large featured card ────────────────────────────────────
function SpotlightMatch({ match, onClick }) {
  const home = window.GC.byCode[match.home];
  const away = window.GC.byCode[match.away];
  const info = window.GC.stadiums[match.stadium];
  const isLive = match.status === "live" || match.status === "halftime";
  const isFinal = match.status === "final";

  return (
    <div className="gc-card gc-card-ink gc-hover no-accent" style={{ padding: 0, overflow: "hidden", cursor: "pointer", position: "relative" }} onClick={onClick}>
      <Floodlight size={500} color="var(--gold)" opacity={.25} top={-200} right={-100} />
      <Floodlight size={420} color="var(--red)"  opacity={.22} bottom={-220} left={-120} />
      <div style={{ padding: "28px 32px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr) minmax(220px, 280px)", gap: 24, alignItems: "center", position: "relative" }}>

        {/* home */}
        <div className="gc-col gc-gap-sm" style={{ alignItems: "flex-end", textAlign: "right", minWidth: 0 }}>
          <Flag code={home.code} size={64} />
          <span className="gc-mono" style={{ fontSize: 12, color: "rgba(247,241,223,.7)", letterSpacing: ".1em", fontWeight: 700 }}>{home.code}</span>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(26px, 3.5vw, 48px)", margin: 0, lineHeight: .85, textTransform: "uppercase", wordBreak: "break-word" }}>{home.name}</h3>
        </div>

        {/* score / time */}
        <div className="gc-col" style={{ alignItems: "center", padding: "0 8px", minWidth: 0 }}>
          {match.homeScore !== null ? (
            <div className="gc-row" style={{ gap: "clamp(8px, 1vw, 18px)", alignItems: "baseline" }}>
              <span className={`gc-score ${isLive ? "gc-score-pop" : ""}`} style={{ fontSize: "clamp(64px, 8.5vw, 124px)", color: "var(--gold)" }}>{match.homeScore}</span>
              <span className="gc-mono" style={{ fontSize: "clamp(20px, 2.5vw, 36px)", color: "rgba(247,241,223,.4)" }}>—</span>
              <span className={`gc-score ${isLive ? "gc-score-pop" : ""}`} style={{ fontSize: "clamp(64px, 8.5vw, 124px)", color: "var(--gold)" }}>{match.awayScore}</span>
            </div>
          ) : (
            <>
              <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(48px, 6.5vw, 92px)", color: "rgba(247,241,223,.4)", lineHeight: 1 }}>vs</span>
              <span className="gc-mono" style={{ fontSize: 13, color: "rgba(247,241,223,.7)", letterSpacing: ".1em", marginTop: 6, textAlign: "center" }}>
                {new Date(match.kickoff).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </>
          )}
          <div className="gc-row gc-gap-sm" style={{ marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {isLive ? <Pill live>{match.minute || "LIVE"}</Pill>
             : isFinal ? <Pill tone="gold">FULL TIME</Pill>
             : <Pill style={{ background: "rgba(247,241,223,.12)", borderColor: "transparent", color: "var(--paper)" }}>UPCOMING</Pill>}
            <Pill style={{ background: "rgba(247,241,223,.12)", borderColor: "transparent", color: "var(--paper)" }}>GRP {match.group}</Pill>
          </div>
        </div>

        {/* away */}
        <div className="gc-col gc-gap-sm" style={{ alignItems: "flex-start", minWidth: 0 }}>
          <Flag code={away.code} size={64} />
          <span className="gc-mono" style={{ fontSize: 12, color: "rgba(247,241,223,.7)", letterSpacing: ".1em", fontWeight: 700 }}>{away.code}</span>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(26px, 3.5vw, 48px)", margin: 0, lineHeight: .85, textTransform: "uppercase", wordBreak: "break-word" }}>{away.name}</h3>
        </div>

        {/* venue facts */}
        <div className="gc-col gc-gap-sm" style={{ borderLeft: "1px solid rgba(247,241,223,.18)", paddingLeft: 24, minWidth: 0 }}>
          <Eyebrow tone="onDark">↘ HOST VENUE</Eyebrow>
          <div style={{ fontFamily: "var(--f-display)", fontSize: "clamp(22px, 2.5vw, 30px)", lineHeight: .9, textTransform: "uppercase", wordBreak: "break-word" }}>{match.stadium}</div>
          <span className="gc-mono" style={{ fontSize: 11, color: "rgba(247,241,223,.65)", letterSpacing: ".08em" }}>
            {match.city.toUpperCase()}{info && ` · CAP. ${info.cap.toLocaleString()}`}
          </span>
          <div style={{ marginTop: 6, fontSize: 12, color: "rgba(247,241,223,.75)" }}>{info?.surface || "Natural grass"} · {info?.roof || "Open roof"}</div>
          <span className="gc-link" style={{ color: "var(--gold)", borderColor: "var(--gold)", marginTop: 10, alignSelf: "flex-start" }}>Abrir match centre →</span>
        </div>
      </div>
    </div>
  );
}

// ─── StadiumMiniCard ────────────────────────────────────────────────────────
function StadiumMiniCard({ name, info }) {
  return (
    <div className="gc-card gc-hover" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        height: 130, position: "relative",
        background: "var(--green)", color: "var(--green-ink)",
      }}>
        <svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
          <ellipse cx="200" cy="220" rx="240" ry="60" fill="rgba(0,0,0,.2)" />
          <ellipse cx="200" cy="210" rx="200" ry="48" fill="rgba(247,241,223,.08)" />
          <rect x="30" y="40" width="340" height="130" fill="none" stroke="rgba(247,241,223,.35)" strokeWidth="1.5" />
          <circle cx="200" cy="105" r="22" fill="none" stroke="rgba(247,241,223,.35)" strokeWidth="1.5" />
        </svg>
        <div style={{ position: "absolute", inset: 0, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Pill tone="gold" style={{ fontSize: 10 }}>{info.roof}</Pill>
          <div>
            <span className="gc-mono" style={{ fontSize: 10, color: "rgba(247,241,223,.7)", letterSpacing: ".08em" }}>{info.city.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <h4 style={{ fontFamily: "var(--f-display)", fontSize: 26, margin: 0, lineHeight: .9, textTransform: "uppercase" }}>{name}</h4>
        <div className="gc-row" style={{ marginTop: 12, gap: 18 }}>
          <div className="gc-col">
            <Eyebrow style={{ fontSize: 9 }}>CAP.</Eyebrow>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1, marginTop: 4 }}>{info.cap.toLocaleString()}</span>
          </div>
          <div className="gc-col">
            <Eyebrow style={{ fontSize: 9 }}>SURFACE</Eyebrow>
            <span style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{info.surface}</span>
          </div>
          <div className="gc-col">
            <Eyebrow style={{ fontSize: 9 }}>OPENED</Eyebrow>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1, marginTop: 4 }}>{info.opened}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FixturePage, DayBlock, SpotlightMatch, StadiumMiniCard });
