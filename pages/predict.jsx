// pages/predict.jsx
// Prediction-entry flow — 3 steps:
//   1) Marcador · pick scoreline with steppers
//   2) Confianza · optional double-down + optional first scorer
//   3) Listo · confirmation screen with locked-in pick

function PredictPage({ params, current, onNavigate }) {
  const matchId = params[0];
  const match = window.GC.matches.find(m => m.id === matchId);
  if (!match) {
    return (
      <PageShell current="pools" onNavigate={onNavigate}>
        <PageHeader
          kicker="MATCH NOT FOUND"
          title={<>Match<br/>no encontrado.</>}
          lede="Volvé al fixture y elegí otro partido."
          action={<Btn onClick={() => onNavigate("fixture")}>← Fixture</Btn>}
        />
        <Footer />
      </PageShell>
    );
  }
  const home = window.GC.byCode[match.home];
  const away = window.GC.byCode[match.away];
  const existing = window.GC.getPrediction(matchId);

  const [step, setStep] = React.useState(existing && existing.status === "settled" ? 2 : 0);
  const [homeScore, setHomeScore] = React.useState(existing?.home ?? 1);
  const [awayScore, setAwayScore] = React.useState(existing?.away ?? 0);
  const [doubleDown, setDoubleDown] = React.useState(existing?.doubleDown ?? false);
  const [scorerPick, setScorerPick] = React.useState(null);

  // points calc preview
  const previewPts = doubleDown ? 60 : 30;
  const isLocked = match.status !== "upcoming";

  const stepDefs = [
    { id: 0, label: "Marcador" },
    { id: 1, label: "Confianza" },
    { id: 2, label: "Listo" },
  ];

  return (
    <PageShell current="pools" onNavigate={onNavigate}>

      {/* breadcrumb */}
      <div style={{ padding: "20px 56px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="gc-row gc-gap-sm">
          <span className="gc-link" onClick={() => onNavigate("pools")}>← Pollas</span>
          <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>/ PREDECIR · {match.id.toUpperCase()}</span>
        </div>
        <span className="gc-link" onClick={() => onNavigate("match/" + matchId)}>Ver match centre →</span>
      </div>

      {/* hero */}
      <section className="bc-hero-stage" style={{ paddingBottom: 24 }}>
        <Floodlight size={620} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.3} top={-260} left="30%" blend="multiply" />
        <Floodlight size={420} color="color-mix(in oklab, var(--red)  55%, transparent)" opacity={.25} top={-180} right={-100} blend="multiply" />

        <div style={{ padding: "20px 56px 0", position: "relative" }}>
          <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
            <Eyebrow>↘ PREDICCIÓN · {match.phase}</Eyebrow>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".1em" }}>{match.stadium} · {match.city}</span>
          </div>
          <h1 style={{
            fontFamily: "var(--f-display)",
            fontSize: "clamp(40px, 6vw, 96px)",
            margin: "12px 0 6px",
            lineHeight: .85,
            textTransform: "uppercase",
          }}>
            {home.name} <span style={{ color: "var(--muted)" }}>×</span> {away.name}
          </h1>
          {!isLocked && (
            <div className="gc-row gc-gap-md" style={{ alignItems: "center" }}>
              <Eyebrow tone="red">↘ CIERRA EN</Eyebrow>
              <Countdown target={new Date(match.kickoff)} />
            </div>
          )}
        </div>

        <div style={{ padding: "24px 56px 0", position: "relative" }}>
          <div className="gc-rule-double" />
        </div>

        {/* step indicator */}
        <div style={{ padding: "24px 56px 0", display: "flex", justifyContent: "center", gap: 0, position: "relative" }}>
          <div className="gc-row" style={{ alignItems: "center", gap: 0, flexWrap: "wrap" }}>
            {stepDefs.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="gc-row gc-gap-sm" style={{ alignItems: "center" }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 999,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: step >= s.id ? "var(--ink)" : "transparent",
                    color: step >= s.id ? "var(--paper)" : "var(--muted)",
                    border: step < s.id ? "1.5px dashed var(--rule)" : "none",
                    fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 12,
                  }}>{s.id + 1}</span>
                  <span className="gc-mono" style={{
                    fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase",
                    color: step >= s.id ? "var(--ink)" : "var(--muted)",
                    fontWeight: step === s.id ? 800 : 500,
                  }}>{s.label}</span>
                </div>
                {i < stepDefs.length - 1 && (
                  <div style={{ width: 60, height: 2, background: step > i ? "var(--ink)" : "var(--rule)", margin: "0 16px" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <div style={{ padding: "32px 56px 0" }}>
        {step === 0 && (
          <Step1Scoreline
            home={home} away={away}
            homeScore={homeScore} awayScore={awayScore}
            setHomeScore={setHomeScore} setAwayScore={setAwayScore}
            onNext={() => setStep(1)}
            onCancel={() => onNavigate("pools")}
          />
        )}
        {step === 1 && (
          <Step2Confidence
            home={home} away={away}
            homeScore={homeScore} awayScore={awayScore}
            doubleDown={doubleDown} setDoubleDown={setDoubleDown}
            scorerPick={scorerPick} setScorerPick={setScorerPick}
            previewPts={previewPts}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step3Confirmation
            match={match} home={home} away={away}
            homeScore={homeScore} awayScore={awayScore}
            doubleDown={doubleDown} scorerPick={scorerPick}
            previewPts={previewPts}
            onEdit={() => setStep(0)}
            onClose={() => onNavigate("pools")}
            onMatchCentre={() => onNavigate("match/" + matchId)}
          />
        )}
      </div>

      <Footer />
    </PageShell>
  );
}

// ─── Step 1 · scoreline ─────────────────────────────────────────────────────
function Step1Scoreline({ home, away, homeScore, awayScore, setHomeScore, setAwayScore, onNext, onCancel }) {
  // last-3 H2H suggestion logic — show last meeting result as a quick pick
  const suggestions = [
    { h: 2, a: 1, label: "Tendencia · local fuerte" },
    { h: 1, a: 1, label: "Empate cómodo" },
    { h: 1, a: 2, label: "Sorpresa visitante" },
    { h: 0, a: 0, label: "Pizarra blanca" },
    { h: 3, a: 1, label: "Goleada local" },
  ];
  return (
    <div className="gc-col gc-gap-md">
      <Eyebrow>STEP 1 · ELIGE EL MARCADOR</Eyebrow>
      <div className="gc-card" style={{ padding: "44px 32px", position: "relative", overflow: "hidden" }}>
        <Floodlight size={420} color="var(--gold)" opacity={.18} top={-220} left="40%" blend="multiply" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 24, alignItems: "center",
          position: "relative",
        }}>
          <ScoreStepper value={homeScore} onChange={setHomeScore} label="LOCAL" code={home.code} tone="home" />
          <span className="gc-display" style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "var(--muted)" }}>—</span>
          <ScoreStepper value={awayScore} onChange={setAwayScore} label="VISITANTE" code={away.code} tone="away" />
        </div>
      </div>

      <Eyebrow>↘ PICKS RÁPIDOS · BASADOS EN H2H</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        {suggestions.map((s, i) => {
          const isActive = s.h === homeScore && s.a === awayScore;
          return (
            <button key={i} onClick={() => { setHomeScore(s.h); setAwayScore(s.a); }} style={{
              padding: "16px 18px", borderRadius: 12,
              background: isActive ? "var(--ink)" : "var(--paper)",
              color: isActive ? "var(--paper)" : "var(--ink)",
              border: isActive ? "1px solid var(--ink)" : "1px solid var(--rule)",
              cursor: "pointer", textAlign: "left",
              transition: "all .15s ease",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }} onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--paper-2)"; }}
               onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "var(--paper)"; }}>
              <span className="gc-mono" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", opacity: isActive ? .7 : .65 }}>{s.label}</span>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1 }}>{s.h}<span style={{ opacity: .5, padding: "0 6px" }}>—</span>{s.a}</span>
            </button>
          );
        })}
      </div>

      <div className="gc-row" style={{ justifyContent: "space-between", marginTop: 28, alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Btn kind="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={onNext}>Siguiente · Confianza →</Btn>
      </div>
    </div>
  );
}

// ─── Step 2 · confidence (double-down + first scorer) ───────────────────────
function Step2Confidence({ home, away, homeScore, awayScore, doubleDown, setDoubleDown, scorerPick, setScorerPick, previewPts, onBack, onNext }) {
  const candidates = window.GC.scorers.filter(s => s.nation === home.code || s.nation === away.code).slice(0, 6);

  return (
    <div className="gc-col gc-gap-md">
      <Eyebrow>STEP 2 · NIVEL DE CONFIANZA</Eyebrow>

      {/* pick recap */}
      <div className="gc-card gc-card-ink" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
        <Floodlight size={300} color="var(--gold)" opacity={.25} top={-150} right={-80} />
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16, position: "relative" }}>
          <Eyebrow tone="onDark">↘ TU PICK</Eyebrow>
          <div className="gc-row gc-gap-md" style={{ alignItems: "baseline" }}>
            <div className="gc-col" style={{ alignItems: "center" }}>
              <Flag code={home.code} size={26} />
              <span className="gc-mono" style={{ fontSize: 10, opacity: .8, letterSpacing: ".08em" }}>{home.code}</span>
            </div>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 52, color: "var(--gold)" }}>{homeScore}</span>
            <span className="gc-mono" style={{ fontSize: 22, opacity: .5 }}>—</span>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 52, color: "var(--gold)" }}>{awayScore}</span>
            <div className="gc-col" style={{ alignItems: "center" }}>
              <Flag code={away.code} size={26} />
              <span className="gc-mono" style={{ fontSize: 10, opacity: .8, letterSpacing: ".08em" }}>{away.code}</span>
            </div>
          </div>
          <span className="gc-display" style={{ fontSize: 36, color: "var(--gold)" }}>+{previewPts}</span>
        </div>
      </div>

      {/* double-down toggle */}
      <div className={`gc-card gc-hover no-accent`} style={{
        padding: 24,
        background: doubleDown ? "var(--gold)" : "var(--paper)",
        color: doubleDown ? "var(--gold-ink)" : "var(--ink)",
        borderColor: doubleDown ? "transparent" : "var(--rule)",
        cursor: "pointer", transition: "background .2s ease",
      }} onClick={() => setDoubleDown(!doubleDown)}>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div className="gc-col" style={{ flex: 1 }}>
            <Eyebrow style={{ color: doubleDown ? "var(--gold-ink)" : "var(--muted)", opacity: doubleDown ? .8 : 1 }}>
              ↘ MULTIPLICADOR × 2 · 2 DISPONIBLES
            </Eyebrow>
            <h4 style={{ fontFamily: "var(--f-display)", fontSize: 38, margin: "8px 0 6px", lineHeight: .9, textTransform: "uppercase" }}>
              Pick doble
            </h4>
            <p style={{ fontSize: 13, margin: 0, opacity: doubleDown ? .85 : 1, color: doubleDown ? "var(--gold-ink)" : "var(--ink-2)" }}>
              Duplica los puntos si aciertas el marcador exacto, la diferencia o el ganador. Si fallás, perdés un multiplicador igual.
            </p>
          </div>
          <div className="gc-col" style={{ alignItems: "center", textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 999,
              background: doubleDown ? "var(--ink)" : "transparent",
              color: doubleDown ? "var(--gold)" : "var(--ink)",
              border: doubleDown ? "none" : "2px dashed var(--rule)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-display)", fontSize: 42, lineHeight: 1,
            }}>×2</div>
            <span className="gc-mono" style={{ fontSize: 11, marginTop: 6, letterSpacing: ".1em", opacity: doubleDown ? .8 : .65 }}>
              {doubleDown ? "ACTIVO" : "INACTIVO"}
            </span>
          </div>
        </div>
      </div>

      {/* first-scorer pick */}
      <Eyebrow>↘ BONO · PRIMER GOLEADOR · +20 PTS</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {candidates.length === 0 ? (
          <div className="gc-card" style={{ padding: 20, gridColumn: "1 / -1" }}>
            <span className="gc-mono" style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".08em" }}>No hay jugadores destacados para este partido todavía.</span>
          </div>
        ) : candidates.map(s => {
          const active = scorerPick === s.name;
          return (
            <button key={s.name} onClick={() => setScorerPick(active ? null : s.name)} style={{
              padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              background: active ? "var(--ink)" : "var(--paper)",
              color: active ? "var(--paper)" : "var(--ink)",
              border: active ? "1px solid var(--ink)" : "1px solid var(--rule)",
              display: "flex", alignItems: "center", gap: 12, textAlign: "left",
              transition: "all .15s ease",
            }}>
              <Flag code={s.nation} size={22} />
              <div className="gc-col" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                <span className="gc-mono" style={{ fontSize: 10, opacity: .65, letterSpacing: ".06em" }}>{s.role} · {s.goals}G {s.assists}A</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="gc-row" style={{ justifyContent: "space-between", marginTop: 28, alignItems: "center" }}>
        <Btn kind="ghost" onClick={onBack}>← Volver</Btn>
        <Btn onClick={onNext}>Lockear pick →</Btn>
      </div>
    </div>
  );
}

// ─── Step 3 · confirmation ──────────────────────────────────────────────────
function Step3Confirmation({ match, home, away, homeScore, awayScore, doubleDown, scorerPick, previewPts, onEdit, onClose, onMatchCentre }) {
  return (
    <div className="gc-col gc-gap-md">
      <Eyebrow>STEP 3 · LISTO · TU PICK QUEDÓ LOCKEADO</Eyebrow>

      <div className="gc-card" style={{ padding: 40, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Floodlight size={520} color="var(--gold)" opacity={.22} top={-260} left="30%" blend="multiply" />
        <div style={{ position: "relative" }}>
          <div className="gc-rise" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Pill tone="green" style={{ padding: "6px 14px", fontSize: 12 }}>✓ PREDICCIÓN GUARDADA</Pill>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(48px, 7vw, 96px)", margin: "10px 0 0", lineHeight: .85, textTransform: "uppercase" }}>
              Bloqueada.
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8, maxWidth: 480 }}>
              Tu pick queda registrada en todos tus pools. Se liquida automáticamente al pitazo final con las reglas oficiales.
            </p>
          </div>

          <div className="gc-row" style={{ gap: 32, alignItems: "center", justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
            <div className="gc-col gc-gap-xs" style={{ alignItems: "center" }}>
              <Flag code={home.code} size={48} />
              <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em" }}>{home.code}</span>
              <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(80px, 11vw, 144px)", color: "var(--ink)", lineHeight: .85 }}>{homeScore}</span>
            </div>
            <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(40px, 5vw, 72px)", color: "var(--muted)" }}>—</span>
            <div className="gc-col gc-gap-xs" style={{ alignItems: "center" }}>
              <Flag code={away.code} size={48} />
              <span className="gc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em" }}>{away.code}</span>
              <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(80px, 11vw, 144px)", color: "var(--ink)", lineHeight: .85 }}>{awayScore}</span>
            </div>
          </div>

          <div className="gc-row gc-gap-sm" style={{ justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
            {doubleDown && <Pill tone="gold">PICK DOBLE · ×2</Pill>}
            {scorerPick && <Pill tone="ink">PRIMER GOL · {scorerPick}</Pill>}
            <Pill tone="green">+{previewPts} si aciertas exacto</Pill>
          </div>
        </div>
      </div>

      {/* What's next */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <ActionTile
          eyebrow="↘ NEXT"
          title="Match centre"
          body="Seguí el partido en vivo con timeline, stats y alineaciones."
          cta="Abrir →"
          onClick={onMatchCentre}
        />
        <ActionTile
          eyebrow="↘ EDIT"
          title="Cambiar pick"
          body="Podés editar hasta el pitazo inicial. Después queda fijado."
          cta="Editar pick"
          onClick={onEdit}
        />
        <ActionTile
          eyebrow="↘ POOLS"
          title="Volver a pollas"
          body="Mirá tu posición en cada pool y tus próximas decisiones."
          cta="Mis pools →"
          onClick={onClose}
        />
      </div>
    </div>
  );
}

function ActionTile({ eyebrow, title, body, cta, onClick }) {
  return (
    <div className="gc-card gc-hover" onClick={onClick} style={{ padding: 24, cursor: "pointer" }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h4 style={{ fontFamily: "var(--f-display)", fontSize: 30, margin: "8px 0 8px", lineHeight: .9 }}>{title}</h4>
      <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>{body}</p>
      <span className="gc-link" style={{ marginTop: 12, display: "inline-block" }}>{cta}</span>
    </div>
  );
}

Object.assign(window, { PredictPage, Step1Scoreline, Step2Confidence, Step3Confirmation, ActionTile });
