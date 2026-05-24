// components/pools.jsx
// Pollas-module components. Reuse atoms / layout / match primitives.
// Exposes (on window):
//   RankBadge, MovementIndicator
//   PoolStandings (full leaderboard)
//   PoolSummaryCard (replaces PoolCard for module pages)
//   ScoreStepper (interactive ±)
//   PredictionRow (compact line)
//   LivePredictionCard (live tracker)
//   SettledPredictionCard
//   PointsTimelineChart
//   SpecialPickCard
//   PrizeCard / RulesCard
//   DiscoveryPoolCard
//   PoolHeaderBlock

// ─── RankBadge / MovementIndicator ──────────────────────────────────────────
function RankBadge({ rank, tone = "auto", size = 28 }) {
  const t = tone === "auto"
    ? (rank === 1 ? "gold" : rank <= 3 ? "ink" : "muted")
    : tone;
  const map = {
    gold:   { bg: "var(--gold)", fg: "var(--gold-ink)" },
    ink:    { bg: "var(--ink)",  fg: "var(--paper)" },
    muted:  { bg: "var(--paper-2)", fg: "var(--muted)" },
    red:    { bg: "var(--red)",  fg: "var(--red-ink)" },
    green:  { bg: "var(--green)",fg: "var(--green-ink)" },
  };
  const s = map[t] || map.muted;
  return (
    <span className="gc-mono" style={{
      width: size, height: size, borderRadius: 6,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: s.bg, color: s.fg,
      fontSize: size >= 32 ? 13 : 11, fontWeight: 800, letterSpacing: 0,
    }}>{rank}</span>
  );
}

function MovementIndicator({ change }) {
  if (change === 0) return (
    <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em" }}>—</span>
  );
  const up = change > 0;
  return (
    <span className="gc-mono" style={{
      fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
      color: up ? "var(--green)" : "var(--red)",
    }}>
      {up ? "▲" : "▼"} {Math.abs(change)}
    </span>
  );
}

// ─── ScoreStepper · interactive +/- for a side ──────────────────────────────
function ScoreStepper({ value, onChange, label, code, tone = "default" }) {
  const tones = {
    home:    { accent: "var(--ink)",  bg: "var(--paper)", border: "var(--ink)" },
    away:    { accent: "var(--red)",  bg: "var(--paper)", border: "var(--red)" },
    default: { accent: "var(--ink)",  bg: "var(--paper)", border: "var(--rule)" },
  };
  const t = tones[tone];
  return (
    <div className="gc-col" style={{ alignItems: "center", gap: 12 }}>
      <Eyebrow>{label}</Eyebrow>
      <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
        <Flag code={code} size={36} />
        <span className="gc-mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".08em" }}>{code}</span>
      </div>
      <div className="gc-row" style={{ alignItems: "center", gap: 14 }}>
        <button onClick={() => onChange(Math.max(0, value - 1))} aria-label="Decrease" style={{
          width: 44, height: 44, borderRadius: 999,
          border: `2px solid ${t.border}`,
          background: "transparent", color: "var(--ink)",
          fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 22,
          cursor: "pointer", transition: "transform .15s ease, background .15s ease",
        }} onMouseEnter={e => e.currentTarget.style.background = "var(--paper-2)"}
           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>−</button>
        <span className="gc-score" style={{
          fontSize: "clamp(60px, 10vw, 96px)",
          color: t.accent,
          minWidth: 72, textAlign: "center", lineHeight: .85,
        }}>{value}</span>
        <button onClick={() => onChange(Math.min(15, value + 1))} aria-label="Increase" style={{
          width: 44, height: 44, borderRadius: 999,
          border: `2px solid ${t.border}`,
          background: t.accent, color: "var(--paper)",
          fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 22,
          cursor: "pointer", transition: "transform .15s ease, background .15s ease",
        }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
           onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>+</button>
      </div>
    </div>
  );
}

// ─── PoolStandings ──────────────────────────────────────────────────────────
function PoolStandings({ members, highlightId = "you" }) {
  return (
    <div className="gc-card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="gc-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th style={{ paddingLeft: 22, width: 60 }}>#</th>
            <th>Miembro</th>
            <th style={{ textAlign: "right" }}>Exactos</th>
            <th style={{ textAlign: "right" }}>Aciertos</th>
            <th style={{ textAlign: "right", width: 60 }}>Mov.</th>
            <th style={{ textAlign: "right", paddingRight: 22, width: 100 }}>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => {
            const rank = m.rank || (i + 1);
            const isYou = m.id === highlightId;
            return (
              <tr key={m.id} style={{
                background: isYou ? "var(--paper-2)" : "transparent",
              }}>
                <td style={{ paddingLeft: 22 }}>
                  <RankBadge rank={rank} />
                </td>
                <td>
                  <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
                    <span style={{ fontWeight: isYou ? 800 : 600, fontSize: 14 }}>{m.name}</span>
                    {m.hot && <Pill tone="red" live={false} style={{ fontSize: 9, padding: "2px 6px" }}>HOT</Pill>}
                    {isYou && <Pill tone="ink" style={{ fontSize: 9, padding: "2px 6px" }}>TÚ</Pill>}
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>{m.exact}</td>
                <td style={{ textAlign: "right" }}>{m.winner}</td>
                <td style={{ textAlign: "right" }}><MovementIndicator change={m.lastChange} /></td>
                <td style={{ textAlign: "right", paddingRight: 22, fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 1, color: isYou ? "var(--red)" : "var(--ink)" }}>{m.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── PoolSummaryCard · used in dashboard and pool detail header ─────────────
function PoolSummaryCard({ pool, onOpen }) {
  return (
    <div className="gc-card gc-hover" style={{ padding: 24, cursor: onOpen ? "pointer" : "default" }} onClick={onOpen}>
      <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <Eyebrow>POOL · {pool.code}</Eyebrow>
        <Pill>{pool.hostType}</Pill>
      </div>
      <h4 style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 22, margin: "0 0 16px", letterSpacing: "0.01em", textTransform: "uppercase" }}>{pool.name}</h4>
      <div className="gc-row" style={{ justifyContent: "space-between", gap: 12, marginBottom: 16, alignItems: "flex-end" }}>
        <div className="gc-col">
          <Eyebrow style={{ fontSize: 10 }}>Tu posición</Eyebrow>
          <div className="gc-row gc-gap-sm" style={{ alignItems: "baseline" }}>
            <RankBadge rank={pool.you} size={32} tone={pool.you === 1 ? "gold" : pool.you <= 3 ? "ink" : "auto"} />
            <span className="gc-mono gc-mute" style={{ fontSize: 11 }}>{pool.yourPts} pts</span>
          </div>
        </div>
        <div className="gc-col" style={{ alignItems: "flex-end", textAlign: "right" }}>
          <Eyebrow style={{ fontSize: 10 }}>Líder</Eyebrow>
          <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>{pool.top}</span>
          <span className="gc-mono gc-mute" style={{ fontSize: 11 }}>{pool.topPts} pts · +{pool.topPts - pool.yourPts} de ti</span>
        </div>
      </div>
      <div className="gc-row gc-rule" style={{ paddingTop: 12, justifyContent: "space-between", fontSize: 11.5, alignItems: "center" }}>
        <span className="gc-mono gc-uppercase gc-mute" style={{ letterSpacing: ".1em" }}>{pool.members.toLocaleString()} miembros</span>
        <span className="gc-link">Abrir pool →</span>
      </div>
    </div>
  );
}

// ─── PredictionRow · open/locked compact row ────────────────────────────────
function PredictionRow({ prediction, onClick }) {
  const match = window.GC.matches.find(m => m.id === prediction.matchId);
  if (!match) return null;
  const home = window.GC.byCode[match.home];
  const away = window.GC.byCode[match.away];
  const isOpen = prediction.status === "open";
  const isLive = prediction.status === "live";
  const isSet = prediction.status === "settled";
  const noPick = prediction.home === null;

  let toneBg = "var(--paper)";
  if (isLive) toneBg = "var(--paper-2)";

  return (
    <div className="gc-hover" onClick={onClick} style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr) minmax(120px, 180px) minmax(110px, 140px)",
      gap: 14, alignItems: "center",
      padding: "16px 22px",
      background: toneBg,
      border: `1px solid ${isLive ? "var(--red)" : "var(--rule)"}`,
      borderRadius: 12, cursor: "pointer",
      position: "relative",
    }}>
      {/* home */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent: "flex-end", alignItems: "center", minWidth: 0 }}>
        <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14 }}>{home.name}</span>
        <Flag code={home.code} size={22} />
      </div>

      {/* pick (or score) */}
      <div className="gc-row gc-gap-sm" style={{ alignItems: "baseline", minWidth: 80, justifyContent: "center" }}>
        {noPick ? (
          <span className="gc-mono" style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Sin pick</span>
        ) : (
          <>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 30, lineHeight: 1, color: isLive ? "var(--red)" : "var(--ink)" }}>{prediction.home}</span>
            <span className="gc-mono" style={{ color: "var(--muted)" }}>—</span>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 30, lineHeight: 1, color: isLive ? "var(--red)" : "var(--ink)" }}>{prediction.away}</span>
          </>
        )}
      </div>

      {/* away */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent: "flex-start", alignItems: "center", minWidth: 0 }}>
        <Flag code={away.code} size={22} />
        <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14 }}>{away.name}</span>
      </div>

      {/* match status */}
      <div className="gc-col" style={{ alignItems: "flex-start" }}>
        <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{match.phase}</span>
        <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{match.stadium}</span>
      </div>

      {/* status pill or pts */}
      <div className="gc-row gc-gap-sm" style={{ justifyContent: "flex-end", alignItems: "center" }}>
        {isOpen && (
          <>
            {prediction.doubleDown && <Pill tone="gold" style={{ fontSize: 9, padding: "2px 6px" }}>×2</Pill>}
            <Pill style={{ fontSize: 10 }}>{prediction.locksAt}</Pill>
          </>
        )}
        {isLive && (
          <>
            <Pill live style={{ fontSize: 10 }}>LIVE</Pill>
            <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, color: prediction.currentPts > 0 ? "var(--green)" : "var(--muted)" }}>+{prediction.currentPts}</span>
          </>
        )}
        {isSet && (
          <PointsBadge pts={prediction.pts} kind={prediction.kind} />
        )}
      </div>
    </div>
  );
}

function PointsBadge({ pts, kind }) {
  const map = {
    exact:  { bg: "var(--green)", fg: "var(--green-ink)", label: "EXACTO" },
    diff:   { bg: "var(--ink)",   fg: "var(--paper)",     label: "DIFF" },
    winner: { bg: "var(--paper-2)", fg: "var(--ink)",     label: "GANADOR" },
    miss:   { bg: "transparent",  fg: "var(--muted)",     label: "MISS" },
  };
  const m = map[kind] || map.miss;
  return (
    <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
      <span style={{
        fontFamily: "var(--f-sub)", fontWeight: 800,
        fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase",
        padding: "3px 8px", borderRadius: 999,
        background: m.bg, color: m.fg,
        border: kind === "miss" ? "1px dashed var(--rule)" : "none",
      }}>{m.label}</span>
      <span className="gc-display" style={{ fontSize: 22, color: pts > 0 ? "var(--ink)" : "var(--muted)" }}>+{pts}</span>
    </div>
  );
}

// ─── LivePredictionCard · full card for live in-progress predictions ────────
function LivePredictionCard({ prediction, onClick }) {
  const match = window.GC.matches.find(m => m.id === prediction.matchId);
  if (!match) return null;
  const home = window.GC.byCode[match.home];
  const away = window.GC.byCode[match.away];
  return (
    <div className="gc-card gc-live-card gc-hover no-accent" onClick={onClick} style={{ padding: 22, cursor: "pointer", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: 240, height: 240,
        background: "radial-gradient(circle at top right, color-mix(in oklab, var(--red) 25%, transparent), transparent 60%)",
        pointerEvents: "none",
      }} />
      <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 14, position: "relative" }}>
        <Eyebrow tone="red">↘ LIVE · TU PREDICCIÓN EN JUEGO</Eyebrow>
        <Pill live>{match.minute || "LIVE"}</Pill>
      </div>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16, position: "relative" }}>
        <div className="gc-col" style={{ alignItems: "center", flex: 1, minWidth: 0 }}>
          <Flag code={home.code} size={36} />
          <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", marginTop: 4 }}>{home.code}</span>
          <span className="gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{home.name}</span>
        </div>

        <div className="gc-col gc-gap-sm" style={{ alignItems: "center", padding: "0 12px" }}>
          <span className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em" }}>EN VIVO</span>
          <div className="gc-row gc-gap-sm" style={{ alignItems: "baseline" }}>
            <span className="gc-score gc-score-pop" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>{match.homeScore}</span>
            <span className="gc-mono" style={{ color: "var(--muted)" }}>—</span>
            <span className="gc-score gc-score-pop" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>{match.awayScore}</span>
          </div>
          <span className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em" }}>TU PICK</span>
          <div className="gc-row gc-gap-sm" style={{ alignItems: "baseline", opacity: .65 }}>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>{prediction.home}</span>
            <span className="gc-mono" style={{ color: "var(--muted)" }}>—</span>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>{prediction.away}</span>
          </div>
        </div>

        <div className="gc-col" style={{ alignItems: "center", flex: 1, minWidth: 0 }}>
          <Flag code={away.code} size={36} />
          <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", marginTop: 4 }}>{away.code}</span>
          <span className="gc-truncate" style={{ fontWeight: 600, fontSize: 13 }}>{away.name}</span>
        </div>
      </div>

      <div className="gc-rule" style={{ marginTop: 16, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".1em" }}>{prediction.note}</span>
        <div className="gc-row gc-gap-sm" style={{ alignItems: "baseline" }}>
          <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>EN JUEGO</span>
          <span className="gc-display" style={{ fontSize: 36, color: prediction.currentPts > 0 ? "var(--green)" : "var(--muted)" }}>+{prediction.currentPts}</span>
        </div>
      </div>
    </div>
  );
}

// ─── PointsTimelineChart · cumulative line over match days ──────────────────
function PointsTimelineChart({ timeline }) {
  const max = Math.max(...timeline.map(d => d.total), 200);
  const W = 600, H = 200, P = 32;
  const xs = (i) => P + (i * (W - 2 * P)) / (timeline.length - 1);
  const ys = (v) => H - P - ((v / max) * (H - 2 * P));

  // build path
  const pts = timeline.map((d, i) => `${xs(i)},${ys(d.total)}`).join(" ");
  const lastSettled = timeline.findLastIndex(d => !d.future && !d.pending);

  return (
    <div className="gc-card" style={{ padding: 24 }}>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <Eyebrow>POINTS TIMELINE · MATCH DAY POR MATCH DAY</Eyebrow>
        <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>TOTAL · <CountInt to={timeline[lastSettled]?.total || 0} /> PTS</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMinYMid meet" style={{ display: "block" }}>
        {/* grid */}
        {[0, .25, .5, .75, 1].map(g => (
          <line key={g} x1={P} x2={W - P} y1={ys(max * g)} y2={ys(max * g)} stroke="var(--rule)" strokeWidth="1" />
        ))}
        {/* axis labels */}
        {[0, .5, 1].map(g => (
          <text key={g} x={8} y={ys(max * g) + 4} fontFamily="var(--f-mono)" fontSize="9" fill="var(--muted)" letterSpacing="0.06em">{Math.round(max * g)}</text>
        ))}
        {/* fill */}
        <polygon
          fill="url(#tl-fill)"
          points={`${P},${H - P} ${pts} ${xs(timeline.length - 1)},${H - P}`}
        />
        <defs>
          <linearGradient id="tl-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"  stopColor="var(--gold)" stopOpacity=".5" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* line */}
        <polyline fill="none" stroke="var(--ink)" strokeWidth="2.5" points={pts} />
        {/* points */}
        {timeline.map((d, i) => (
          <g key={d.md}>
            <circle cx={xs(i)} cy={ys(d.total)} r={d.future ? 3 : 5}
                    fill={d.future ? "var(--paper)" : d.pending ? "var(--gold)" : "var(--ink)"}
                    stroke={d.future ? "var(--rule)" : "var(--paper)"} strokeWidth="2" />
            <text x={xs(i)} y={H - 10} textAnchor="middle" fontFamily="var(--f-mono)" fontSize="9" letterSpacing="0.08em" fill={d.future ? "var(--muted)" : "var(--ink)"}>{d.md}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── SpecialPickCard · champion / topScorer / etc ───────────────────────────
function SpecialPickCard({ kind, pick, tone = "default" }) {
  const titles = {
    champion:  { l: "↘ CAMPEÓN",       title: "Tu campeón",       footer: "Si gana el torneo · +" },
    runnerUp:  { l: "↘ FINALISTA",     title: "Tu finalista",     footer: "Si llega a la final · +" },
    topScorer: { l: "↘ GOLEADOR",      title: "Tu goleador",      footer: "Si gana el botín · +" },
    darkHorse: { l: "↘ CABALLO NEGRO", title: "Tu sorpresa",      footer: "Si llega a semis · +" },
  };
  const meta = titles[kind] || titles.champion;
  const code = pick.nation;
  const nation = code ? window.GC.byCode[code] : null;
  const statusMap = {
    alive:   { tone: "green", label: "VIGENTE" },
    leading: { tone: "gold",  label: "LIDERANDO" },
    out:     { tone: "red",   label: "ELIMINADO" },
  };
  const status = statusMap[pick.status] || statusMap.alive;

  return (
    <div className="gc-card gc-hover no-accent" style={{
      padding: 22, position: "relative", overflow: "hidden",
      background: tone === "ink" ? "var(--ink)" : "var(--paper)",
      color: tone === "ink" ? "var(--paper)" : "var(--ink)",
      borderColor: tone === "ink" ? "transparent" : "var(--rule)",
    }}>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Eyebrow tone={tone === "ink" ? "onDark" : "default"}>{meta.l}</Eyebrow>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <h4 style={{ fontFamily: "var(--f-display)", fontSize: 28, margin: "0 0 12px", lineHeight: .9, textTransform: "uppercase" }}>{meta.title}</h4>
      {kind === "topScorer" ? (
        <div className="gc-row gc-gap-md" style={{ alignItems: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 999,
            background: "linear-gradient(135deg, var(--gold), #fff3b8 50%, var(--gold))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--gold-ink)", fontFamily: "var(--f-display)", fontSize: 22,
          }}>{pick.goalsNow}</div>
          <div className="gc-col">
            <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>{pick.player}</span>
            <div className="gc-row gc-gap-sm" style={{ marginTop: 4 }}>
              <Flag code={pick.nation} size={18} />
              <span className="gc-mono" style={{ fontSize: 11, letterSpacing: ".08em" }}>{pick.nation}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="gc-row gc-gap-md" style={{ alignItems: "center" }}>
          <Flag code={code} size={42} />
          <div className="gc-col">
            <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 22, textTransform: "uppercase", lineHeight: 1 }}>{nation?.name}</span>
            <span className="gc-mono" style={{ fontSize: 11, color: tone === "ink" ? "rgba(247,241,223,.6)" : "var(--muted)", letterSpacing: ".08em" }}>{nation?.code} · GRP {nation?.group}</span>
          </div>
        </div>
      )}
      <div className="gc-rule" style={{ marginTop: 16, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline", borderColor: tone === "ink" ? "rgba(247,241,223,.2)" : "var(--rule)" }}>
        {pick.note && <span className="gc-mono" style={{ fontSize: 11, color: tone === "ink" ? "rgba(247,241,223,.55)" : "var(--muted)", letterSpacing: ".08em" }}>{pick.note}</span>}
        <span className="gc-display" style={{ fontSize: 28, color: "var(--gold)", marginLeft: "auto" }}>+{pick.reward}</span>
      </div>
    </div>
  );
}

// ─── PrizeCard / RulesCard ──────────────────────────────────────────────────
function PrizeCard({ prize, hostType, members, code, closesIn }) {
  return (
    <div className="gc-card gc-card-ink" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
      <div className="gc-floodlight" style={{ width: 360, height: 360, top: -180, right: -120, background: "radial-gradient(circle, var(--gold), transparent 60%)", opacity: .35, mixBlendMode: "screen" }} />
      <Eyebrow tone="onDark">↘ PREMIO DEL POOL</Eyebrow>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 40, margin: "8px 0 14px", lineHeight: .9, textTransform: "uppercase" }}>{prize}</h3>
      <div className="gc-row gc-gap-md" style={{ position: "relative", marginTop: 8 }}>
        <div className="gc-col">
          <Eyebrow tone="onDark" style={{ fontSize: 9 }}>HOST</Eyebrow>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{hostType}</span>
        </div>
        <div className="gc-col">
          <Eyebrow tone="onDark" style={{ fontSize: 9 }}>CÓDIGO</Eyebrow>
          <span className="gc-mono" style={{ fontWeight: 700, fontSize: 13, letterSpacing: ".08em" }}>{code}</span>
        </div>
        <div className="gc-col">
          <Eyebrow tone="onDark" style={{ fontSize: 9 }}>MIEMBROS</Eyebrow>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{members.toLocaleString()}</span>
        </div>
        <div className="gc-col">
          <Eyebrow tone="onDark" style={{ fontSize: 9 }}>PRÓX. CIERRE</Eyebrow>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{closesIn}</span>
        </div>
      </div>
    </div>
  );
}

function RulesCard() {
  return (
    <div className="gc-card" style={{ padding: 24 }}>
      <Eyebrow>REGLAS DE PUNTUACIÓN</Eyebrow>
      <div className="gc-col gc-gap-sm" style={{ marginTop: 14 }}>
        {window.GC.scoringRules.map(r => (
          <div key={r.id} className="gc-row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--rule)" }}>
            <div className="gc-col" style={{ flex: 1 }}>
              <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: ".02em" }}>{r.label}</span>
              <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{r.desc}</span>
            </div>
            <span className="gc-display" style={{ fontSize: 26, color: typeof r.pts === "string" ? "var(--gold)" : "var(--ink)" }}>+{r.pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DiscoveryPoolCard · for the discover list ──────────────────────────────
function DiscoveryPoolCard({ pool, onJoin }) {
  return (
    <div className="gc-card gc-hover" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div className="gc-row" style={{ justifyContent: "space-between" }}>
        <Eyebrow>CODE · {pool.code}</Eyebrow>
        <Pill>{pool.host}</Pill>
      </div>
      <h4 style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: "0.01em", textTransform: "uppercase", lineHeight: 1.1 }}>{pool.name}</h4>
      <div className="gc-row" style={{ justifyContent: "space-between", marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--rule)", alignItems: "center" }}>
        <div className="gc-col">
          <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>MIEMBROS</span>
          <span className="gc-display" style={{ fontSize: 28, lineHeight: 1 }}>{pool.members.toLocaleString()}</span>
        </div>
        <Btn kind="ghost" onClick={onJoin} style={{ padding: "10px 16px", fontSize: 11 }}>Unirme →</Btn>
      </div>
      <div className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>PREMIO · <b style={{ color: "var(--ink)", fontWeight: 700 }}>{pool.prize}</b></div>
    </div>
  );
}

// ─── PoolHeaderBlock (used inside /pool/:id) ────────────────────────────────
function PoolHeaderBlock({ pool, you }) {
  const gap = pool.topPts - pool.yourPts;
  return (
    <section className="bc-hero-stage" style={{ paddingBottom: 32 }}>
      <Floodlight size={620} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.3} top={-260} right={-100} blend="multiply" />
      <Floodlight size={460} color="color-mix(in oklab, var(--red)  55%, transparent)" opacity={.25} bottom={-260} left={-160} blend="multiply" />

      <div style={{ padding: "20px 56px 0", position: "relative", zIndex: 2 }}>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div className="gc-col gc-gap-xs">
            <Eyebrow>POOL · {pool.code} · {pool.hostType}</Eyebrow>
            <h1 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(40px, 6vw, 96px)", margin: 0, lineHeight: .88, textTransform: "uppercase" }}>{pool.name}</h1>
          </div>
          <div className="gc-row gc-gap-sm">
            <Btn kind="ghost">Compartir</Btn>
            <Btn kind="accent">Predecir →</Btn>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 56px 0", position: "relative", zIndex: 1 }}>
        <div className="gc-rule-double" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, padding: "28px 56px 0", position: "relative" }}>
        <div className="gc-card gc-card-ink" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
          <Eyebrow tone="onDark">↘ TU POSICIÓN</Eyebrow>
          <div className="gc-row gc-gap-md" style={{ alignItems: "baseline", marginTop: 6 }}>
            <RankBadge rank={pool.you} size={40} tone={pool.you === 1 ? "gold" : "ink"} />
            <span style={{ fontFamily: "var(--f-display)", fontSize: 56, lineHeight: .85 }}>{pool.yourPts}</span>
            <span className="gc-mono" style={{ fontSize: 11, opacity: .65, letterSpacing: ".08em" }}>PTS</span>
          </div>
        </div>
        <div className="gc-card" style={{ padding: 20 }}>
          <Eyebrow>LÍDER</Eyebrow>
          <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 20, textTransform: "uppercase", display: "block", marginTop: 6 }}>{pool.top}</span>
          <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{pool.topPts} pts {gap > 0 ? `· +${gap} sobre ti` : "= tú"}</span>
        </div>
        <div className="gc-card" style={{ padding: 20 }}>
          <Eyebrow>MIEMBROS</Eyebrow>
          <div className="gc-display" style={{ fontSize: 38, lineHeight: .9, marginTop: 6 }}><CountInt to={pool.members} /></div>
        </div>
        <div className="gc-card gc-card-gold" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
          <Eyebrow tone="gold">↘ PREMIO</Eyebrow>
          <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 18, textTransform: "uppercase", display: "block", marginTop: 6, lineHeight: 1.05 }}>{pool.prize}</span>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  RankBadge, MovementIndicator, ScoreStepper,
  PoolStandings, PoolSummaryCard, PoolHeaderBlock,
  PredictionRow, PointsBadge, LivePredictionCard,
  PointsTimelineChart, SpecialPickCard,
  PrizeCard, RulesCard, DiscoveryPoolCard,
});
