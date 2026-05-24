// pages/pool.jsx
// Single pool detail — leaderboard, your predictions inside this pool,
// open & settled, member highlights.

function PoolPage({ params, current, onNavigate }) {
  const poolId = params[0];
  const pool = window.GC.getPool(poolId);
  const members = window.GC.getMembers(poolId);

  const [tab, setTab] = React.useState("leaderboard");

  if (!pool) {
    return (
      <PageShell current="pools" onNavigate={onNavigate}>
        <PageHeader
          kicker="POOL NOT FOUND"
          title={<>Pool<br/>no encontrado.</>}
          lede={`No existe un pool con id "${poolId}".`}
          action={<Btn onClick={() => onNavigate("pools")}>← Pollas</Btn>}
        />
        <Footer />
      </PageShell>
    );
  }

  const open = window.GC.userPredictions.filter(p => p.status === "open" || p.status === "live");
  const settled = window.GC.userPredictions.filter(p => p.status === "settled");

  const tabs = [
    { id: "leaderboard", label: "Tabla" },
    { id: "yours",       label: "Tus predicciones" },
    { id: "history",     label: "Historial" },
    { id: "rules",       label: "Reglas" },
  ];

  // member highlights for this pool
  const hotStreak = members.filter(m => m.hot).slice(0, 3);
  const yourMember = members.find(m => m.isYou);

  return (
    <PageShell current="pools" onNavigate={onNavigate}>

      {/* breadcrumb */}
      <div style={{ padding: "20px 56px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="gc-row gc-gap-sm">
          <span className="gc-link" onClick={() => onNavigate("pools")}>← Pollas</span>
          <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>/ {pool.id.toUpperCase()}</span>
        </div>
      </div>

      <PoolHeaderBlock pool={pool} you={yourMember} />

      <MatchTabs tabs={tabs} active={tab} onSelect={setTab} />

      <div style={{ padding: "32px 56px 0" }}>
        {tab === "leaderboard" && (
          <LeaderboardTab members={members} hotStreak={hotStreak} pool={pool} onNavigate={onNavigate} />
        )}
        {tab === "yours" && (
          <YourPicksTab open={open} settled={settled.slice(0, 4)} onNavigate={onNavigate} />
        )}
        {tab === "history" && (
          <HistoryTab settled={settled} onNavigate={onNavigate} />
        )}
        {tab === "rules" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <RulesCard />
            <PrizeCard prize={pool.prize} hostType={pool.hostType} members={pool.members} code={pool.code} closesIn={pool.closesIn} />
          </div>
        )}
      </div>

      {/* CTA — next prediction */}
      {open.length > 0 && (
        <Band tone="ink" style={{ marginTop: 80 }}>
          <Floodlight size={500} color="var(--gold)" opacity={.22} top={-200} right={-100} />
          <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 24, position: "relative", flexWrap: "wrap" }}>
            <div>
              <Eyebrow tone="onDark">↗ PRÓXIMO CIERRE · {open[0].locksAt || "EN JUEGO"}</Eyebrow>
              <h2 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(36px, 5vw, 72px)", margin: "8px 0 0", lineHeight: .85, textTransform: "uppercase" }}>
                Próxima predicción.
              </h2>
              <p style={{ fontSize: 14, color: "rgba(247,241,223,.7)", maxWidth: 460, marginTop: 10 }}>
                Marcador exacto = 30 pts · Diferencia = 15 pts · Ganador = 10 pts. Tus picks cuentan en todos los pools donde estés.
              </p>
            </div>
            <Btn kind="primary" style={{ background: "var(--gold)", color: "var(--gold-ink)" }} onClick={() => onNavigate("predict/" + open[0].matchId)}>Hacer mi pick →</Btn>
          </div>
        </Band>
      )}

      <Footer />
    </PageShell>
  );
}

// ─── Leaderboard tab ────────────────────────────────────────────────────────
function LeaderboardTab({ members, hotStreak, pool, onNavigate }) {
  return (
    <div className="gc-col gc-gap-md">
      {/* Podium */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "end" }}>
        <PodiumStep member={members[1]} rank={2} height={140} tone="ink" />
        <PodiumStep member={members[0]} rank={1} height={180} tone="gold" />
        <PodiumStep member={members[2]} rank={3} height={120} tone="paper" />
      </div>

      {/* Hot members strip */}
      {hotStreak.length > 0 && (
        <div className="gc-card" style={{ padding: 22 }}>
          <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <Eyebrow tone="red">↘ EN RACHA · ESTA SEMANA</Eyebrow>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>HOT STREAK</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${hotStreak.length}, 1fr)`, gap: 14 }}>
            {hotStreak.map(m => (
              <div key={m.id} className="gc-row gc-gap-sm" style={{
                padding: "14px 16px", background: "var(--paper-2)", borderRadius: 10, alignItems: "center",
                borderLeft: "3px solid var(--red)",
              }}>
                <RankBadge rank={members.indexOf(m) + 1} />
                <div className="gc-col" style={{ flex: 1, minWidth: 0 }}>
                  <span className="gc-truncate" style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</span>
                  <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em" }}>{m.exact} exactos · {m.winner} aciertos</span>
                </div>
                <span className="gc-display" style={{ fontSize: 28 }}>{m.pts}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "baseline", padding: "12px 0" }}>
        <Eyebrow>↘ TABLA COMPLETA · {members.length} MIEMBROS</Eyebrow>
        <Btn kind="ghost" style={{ padding: "8px 14px", fontSize: 11 }}>Exportar CSV</Btn>
      </div>
      <PoolStandings members={members} />
    </div>
  );
}

// ─── PodiumStep ─────────────────────────────────────────────────────────────
function PodiumStep({ member, rank, height, tone }) {
  if (!member) return <div />;
  const bg = tone === "gold" ? "var(--gold)" : tone === "ink" ? "var(--ink)" : "var(--paper)";
  const fg = tone === "gold" ? "var(--gold-ink)" : tone === "ink" ? "var(--paper)" : "var(--ink)";
  return (
    <div className="gc-col gc-gap-sm" style={{ alignItems: "center" }}>
      <div className="gc-col gc-gap-xs" style={{ alignItems: "center" }}>
        <RankBadge rank={rank} size={40} tone={tone === "paper" ? "muted" : tone} />
        <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 18, textTransform: "uppercase", letterSpacing: ".01em", textAlign: "center" }}>{member.name}</span>
        {member.isYou && <Pill tone="red" style={{ fontSize: 9 }}>TÚ</Pill>}
        <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{member.exact} exactos · {member.winner} aciertos</span>
      </div>
      <div style={{
        height, width: "100%",
        background: bg, color: fg,
        borderRadius: "10px 10px 0 0",
        border: tone === "paper" ? "1px solid var(--rule)" : "none",
        borderBottom: "none",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "12px 16px",
        position: "relative", overflow: "hidden",
      }}>
        {tone === "gold" && (
          <div className="gc-floodlight" style={{ width: 240, height: 240, top: -120, left: -60, background: "radial-gradient(circle, #fff3b8, transparent 60%)", opacity: .65, mixBlendMode: "screen" }} />
        )}
        <Eyebrow style={{ color: fg, opacity: .7 }}>PUNTOS</Eyebrow>
        <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(36px, 5.5vw, 64px)", lineHeight: 1, marginTop: 4 }}>{member.pts}</span>
      </div>
    </div>
  );
}

// ─── Your picks tab ─────────────────────────────────────────────────────────
function YourPicksTab({ open, settled, onNavigate }) {
  const live = open.filter(p => p.status === "live");
  const queued = open.filter(p => p.status === "open");
  return (
    <div className="gc-col gc-gap-md">
      {live.length > 0 && (
        <>
          <Eyebrow tone="red">↘ LIVE · EN JUEGO AHORA</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 14 }}>
            {live.map(p => (
              <LivePredictionCard key={p.id} prediction={p} onClick={() => onNavigate("match/" + p.matchId)} />
            ))}
          </div>
        </>
      )}

      <Eyebrow>↘ ABIERTAS · {queued.length}</Eyebrow>
      <div style={{ display: "grid", gap: 10 }}>
        {queued.map(p => (
          <PredictionRow key={p.id} prediction={p} onClick={() => onNavigate("predict/" + p.matchId)} />
        ))}
      </div>

      {settled.length > 0 && (
        <>
          <Eyebrow>↘ RECIENTES · LIQUIDADAS</Eyebrow>
          <div style={{ display: "grid", gap: 10 }}>
            {settled.map(p => (
              <PredictionRow key={p.id} prediction={p} onClick={() => onNavigate("match/" + p.matchId)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── History tab ────────────────────────────────────────────────────────────
function HistoryTab({ settled, onNavigate }) {
  const total = settled.reduce((s, p) => s + p.pts, 0);
  const exact = settled.filter(p => p.kind === "exact").length;
  const winner = settled.filter(p => p.kind === "winner" || p.kind === "diff").length;
  const miss = settled.filter(p => p.kind === "miss").length;
  return (
    <div className="gc-col gc-gap-md">
      {/* summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <StatTilePro label="PUNTOS TOTALES" value={total} change={`${settled.length} predicciones liquidadas`} tone="ink" />
        <StatTilePro label="EXACTOS" value={exact} change={`${(exact / settled.length * 100).toFixed(0)}% de acierto`} tone="gold" />
        <StatTilePro label="DIF / GANADOR" value={winner} change="Aciertos parciales" tone="paper" />
        <StatTilePro label="MISSES" value={miss} change="Para olvidar" tone="red" />
      </div>

      <Eyebrow>↘ HISTORIAL · MATCH BY MATCH</Eyebrow>
      <div style={{ display: "grid", gap: 10 }}>
        {settled.map(p => (
          <PredictionRow key={p.id} prediction={p} onClick={() => onNavigate("match/" + p.matchId)} />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PoolPage, LeaderboardTab, PodiumStep, YourPicksTab, HistoryTab });
