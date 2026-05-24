// pages/pools.jsx
// Pollas dashboard — overview of all the user's pools, active predictions,
// special picks (champion, top scorer), discover new pools.

function PoolsPage({ current, onNavigate }) {
  const myPools = window.GC.pools;
  const openPredictions = window.GC.userPredictions.filter(p => p.status === "open");
  const livePredictions = window.GC.userPredictions.filter(p => p.status === "live");
  const settledPredictions = window.GC.userPredictions.filter(p => p.status === "settled");
  const totalSettled = settledPredictions.reduce((s, p) => s + p.pts, 0);
  const totalLive    = livePredictions.reduce((s, p) => s + (p.currentPts || 0), 0);
  const totalOpen    = openPredictions.length;
  const champion = window.GC.specialPicks.champion;
  const topScorer = window.GC.specialPicks.topScorer;
  const discover = window.GC.discoverPools;

  return (
    <PageShell current="pools" onNavigate={onNavigate}>
      <PageHeader
        kicker={`MODULE · POLLAS FUTBOLERAS · ${myPools.length} POOLS ACTIVOS`}
        title={<>Pollas<br/>futboleras.</>}
        lede="The game before the game. Track every prediction, climb live leaderboards, and settle automatically at the final whistle. Your picks count across every pool you're in."
        action={<div className="gc-row gc-gap-sm">
          <Btn kind="ghost">Unirme con código</Btn>
          <Btn>Crear polla</Btn>
        </div>}
      />

      {/* ── 4 stat tiles ── */}
      <div style={{ padding: "0 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <StatTilePro label="PUNTOS · TEMPORADA"   value={totalSettled}      change="MD1 → MD2 acumulado" tone="ink" />
          <StatTilePro label="PTS EN JUEGO · LIVE"  value={totalLive}         change="2 partidos en curso" tone="red" />
          <StatTilePro label="PREDICCIONES ABIERTAS" value={totalOpen}        change="se cierran al pitazo" tone="paper" />
          <StatTilePro label="POOLS ACTIVOS"        value={myPools.length}    change={`${myPools.reduce((a,p)=>a+p.members,0).toLocaleString()} miembros`} tone="gold" />
        </div>
      </div>

      {/* ── LIVE predictions spotlight ── */}
      {livePredictions.length > 0 && (
        <>
          <SectionHead
            num="01"
            label="↘ EN JUEGO · TUS PREDICCIONES LIVE"
            title="Live picks"
            right={<span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".12em" }}>ACTUALIZACIÓN EN VIVO</span>}
          />
          <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
            {livePredictions.map(p => (
              <LivePredictionCard key={p.id} prediction={p} onClick={() => onNavigate("match/" + p.matchId)} />
            ))}
          </div>
        </>
      )}

      {/* ── My pools ── */}
      <SectionHead
        num="02"
        label="↘ TUS POOLS · POSICIÓN ACTUAL"
        title="Tus pools"
        right={<span className="gc-link" onClick={() => onNavigate("pool/p1")}>Ver tabla completa →</span>}
      />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {myPools.map(p => (
          <PoolSummaryCard key={p.id} pool={p} onOpen={() => onNavigate("pool/" + p.id)} />
        ))}
      </div>

      {/* ── Open predictions ── */}
      <SectionHead
        num="03"
        label={`↘ POR DECIDIR · ${openPredictions.length} PREDICCIONES ABIERTAS`}
        title="Próximas decisiones"
        right={<span className="gc-link" onClick={() => onNavigate("fixture")}>Ver fixture →</span>}
      />
      <div style={{ padding: "22px 56px 0", display: "grid", gap: 10 }}>
        {openPredictions.map(p => (
          <PredictionRow key={p.id} prediction={p} onClick={() => onNavigate("predict/" + p.matchId)} />
        ))}
      </div>

      {/* ── Points timeline + special picks side by side ── */}
      <SectionHead
        num="04"
        label="↘ TU TEMPORADA · TIMELINE + BONOS"
        title="Tu temporada"
      />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <PointsTimelineChart timeline={window.GC.pointsTimeline} />
        <div className="gc-col gc-gap-md">
          <SpecialPickCard kind="champion"  pick={window.GC.specialPicks.champion}  tone="ink" />
          <SpecialPickCard kind="topScorer" pick={topScorer} />
        </div>
      </div>

      <div style={{ padding: "16px 56px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SpecialPickCard kind="runnerUp"  pick={window.GC.specialPicks.runnerUp} />
        <SpecialPickCard kind="darkHorse" pick={window.GC.specialPicks.darkHorse} />
      </div>

      {/* ── Settled history ── */}
      <SectionHead
        num="05"
        label={`↘ HISTORIAL · ${settledPredictions.length} PREDICCIONES LIQUIDADAS`}
        title="Cómo fuiste"
      />
      <div style={{ padding: "22px 56px 0", display: "grid", gap: 10 }}>
        {settledPredictions.map(p => (
          <PredictionRow key={p.id} prediction={p} onClick={() => onNavigate("match/" + p.matchId)} />
        ))}
      </div>

      {/* ── Discover (red band) ── */}
      <Band tone="red" withFloodlight={<Floodlight size={600} color="var(--gold)" opacity={.22} top={-200} left={-100} />}>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, position: "relative", flexWrap: "wrap", gap: 16 }}>
          <div>
            <Eyebrow tone="onGreen"><b style={{ fontFamily: "var(--f-display)", fontSize: 22, fontWeight: 400, color: "currentColor" }}>06</b> · DESCUBRE</Eyebrow>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(40px, 6vw, 88px)", lineHeight: .85, margin: "6px 0 0", textTransform: "uppercase" }}>
              Más pollas,<br/>más juego.
            </h2>
          </div>
          <Btn kind="primary" style={{ background: "var(--paper)", color: "var(--ink)" }}>Crear la tuya</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, position: "relative" }}>
          {discover.map(p => (
            <DiscoveryPoolCard key={p.id} pool={p} onJoin={() => alert(`Unirse a "${p.name}"`)} />
          ))}
        </div>
      </Band>

      {/* ── Scoring rules at the bottom ── */}
      <SectionHead
        num="07"
        label="↘ CÓMO SE PUNTÚA"
        title="Reglas"
      />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <RulesCard />
        <div className="gc-card" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <Eyebrow>↘ MULTIPLICADORES · 3 PICKS DOBLES POR TORNEO</Eyebrow>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 38, margin: "8px 0 0", lineHeight: .9, textTransform: "uppercase" }}>
              Pickea doble<br/>cuando estés seguro.
            </h3>
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 12, maxWidth: 460 }}>
              Cada usuario tiene 3 multiplicadores ×2 por torneo. Aplica uno en la predicción que más confianza te da — los puntos se duplican si aciertas, y se duplican las pérdidas si fallas.
            </p>
          </div>
          <div className="gc-row gc-gap-sm" style={{ marginTop: 16 }}>
            <div style={{
              padding: "12px 14px", borderRadius: 12, background: "var(--gold)", color: "var(--gold-ink)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 1 }}>×2</span>
              <span className="gc-mono" style={{ fontSize: 10, letterSpacing: ".1em", fontWeight: 700 }}>USADO · 1</span>
            </div>
            <div style={{
              padding: "12px 14px", borderRadius: 12, background: "transparent", color: "var(--ink)",
              border: "1.5px dashed var(--rule)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 1 }}>×2</span>
              <span className="gc-mono" style={{ fontSize: 10, letterSpacing: ".1em" }}>DISPONIBLE</span>
            </div>
            <div style={{
              padding: "12px 14px", borderRadius: 12, background: "transparent", color: "var(--ink)",
              border: "1.5px dashed var(--rule)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 1 }}>×2</span>
              <span className="gc-mono" style={{ fontSize: 10, letterSpacing: ".1em" }}>DISPONIBLE</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </PageShell>
  );
}

Object.assign(window, { PoolsPage });
