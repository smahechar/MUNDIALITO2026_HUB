// pages/landing.jsx
// PRIMARY LANDING — locked visual direction: The Daily Broadcast.
// Editorial broadcast foundation + festival color rhythm from rejected B variant.

function LandingPage({ tweaks, heroVariant, onNavigate }) {
  const headline = tweaks.headline || "EVERY MATCH.\nEVERY MOMENT.";
  const tagline  = tweaks.tagline  || "The Global Cup 2026, lived from first whistle to final lift. Track every kick, run your pool, collect the album, and never miss a kickoff in your timezone.";
  const target   = React.useMemo(() => window.GC.nextKickoff(), []);
  const featured = window.GC.matches.slice(0, 4);

  return (
    <PageShell current="landing" onNavigate={onNavigate}>

      {/* ── HERO ── */}
      <section className="bc-hero-stage">
        <Floodlight size={720} color="color-mix(in oklab, var(--gold) 60%, transparent)" opacity={.35} top={-260} left={"30%"} blend="multiply" />
        <Floodlight size={560} color="color-mix(in oklab, var(--red) 50%, transparent)" opacity={.3}  top={-180} right={-120} blend="multiply" />
        <Floodlight size={640} color="color-mix(in oklab, var(--green) 55%, transparent)" opacity={.25} bottom={-280} left={-160} blend="multiply" />
        <Watermark style={{ top: 240, right: -40 }}>2026</Watermark>

        <div className="bc-mast">
          <div className="gc-col gc-gap-xs gc-rise" style={{ alignItems: "flex-start" }}>
            <Eyebrow>VOL. 02 · MATCH DAY 2 · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Eyebrow>
            <div className="gc-row gc-gap-sm">
              <Pill live>3 MATCHES LIVE</Pill>
              <Pill tone="gold">YOUR POOL · #{window.GC.pools[0].you}</Pill>
            </div>
          </div>
          <h1 className="gc-rise" style={{ animationDelay: ".05s" }}>
            <div>Global<span className="it"> Cup</span></div>
            <div style={{ fontSize: ".68em", marginTop: 6, letterSpacing: ".01em" }}>2026 · The Hub</div>
          </h1>
          <div className="gc-col gc-gap-xs gc-rise" style={{ alignItems: "flex-end", textAlign: "right", animationDelay: ".1s" }}>
            <Eyebrow>EDITION · ES · COL · UTC-5</Eyebrow>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>32 NATIONS · 16 HOST CITIES · 64 MATCHES</span>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>
              <CountInt to={window.GC.pools.reduce((a, p) => a + p.members, 0)} /> HUB MEMBERS
            </span>
          </div>
        </div>

        <div style={{ padding: "0 56px" }}>
          <div className="gc-rule-double" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)", gap: 40, padding: "32px 56px 0", position: "relative", zIndex: 1 }}>
          <div className="gc-col gc-gap-md gc-rise" style={{ animationDelay: ".15s" }}>
            <Eyebrow>↗ THE LEAD STORY</Eyebrow>
            <h2 className="bc-kicker" style={{ whiteSpace: "pre-line", fontSize: 116 }}>{headline}</h2>
            <p style={{ fontSize: 17, lineHeight: 1.5, maxWidth: 540, color: "var(--ink-2)" }}>{tagline}</p>
            <div className="gc-row gc-gap-md" style={{ marginTop: 8 }}>
              <Btn>Crear cuenta</Btn>
              <Btn kind="ghost">Ver fixture →</Btn>
            </div>
            <HeroFeaturedMatch target={target} />
          </div>
          <div className="gc-rise" style={{ animationDelay: ".2s" }}>
            <HeroSwitcher variant={heroVariant} />
          </div>
        </div>

        <div style={{ padding: "32px 56px 0", position: "relative", zIndex: 1 }}>
          <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 12, alignItems: "baseline" }}>
            <Eyebrow>↘ FIXTURE RAIL · LIVE & UPCOMING</Eyebrow>
            <span className="gc-link" style={{ fontSize: 11 }} onClick={() => onNavigate("fixture")}>Mi agenda →</span>
          </div>
          <FixtureRail />
        </div>
      </section>

      <div style={{ padding: "44px 56px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatTilePro label="MATCHES PLAYED"   value={32}     change="+8 today"             tone="paper" />
          <StatTilePro label="GOALS SCORED"     value={94}     change="2.9 per match"        tone="ink" />
          <StatTilePro label="POOL MEMBERS"     value={4218}   change="+312 this week"       tone="red" />
          <StatTilePro label="STICKERS TRADED"  value={11340}  change="6 of yours pending"   tone="gold" />
        </div>
      </div>

      <SectionHead num="01" label="MATCH DAY · LIVE & NEXT" title="Match Day"
        right={<div className="gc-row gc-gap-md">
          <span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".12em" }}>RF-13 · RF-14 · RF-15</span>
          <span className="gc-link" onClick={() => onNavigate("fixture")}>Fixture completo →</span>
        </div>} />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {featured.map(m => <MatchCardPro key={m.id} match={m} />)}
      </div>

      <SectionHead num="02" label="GROUP STAGE · STANDINGS" title="Group Stage"
        right={<span className="gc-link" onClick={() => onNavigate("groups")}>Todos los grupos →</span>} />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <GroupSwitcher />
        <div className="gc-col gc-gap-md">
          <div className="gc-card gc-card-green gc-hover no-accent" style={{ padding: 26, position: "relative", overflow: "hidden" }}>
            <Floodlight size={380} color="var(--gold)" opacity={.35} bottom={-180} right={-120} />
            <Eyebrow tone="onGreen">↘ QUALIFIED · ROUND OF 16</Eyebrow>
            <div className="gc-display" style={{ fontSize: 92, marginTop: 6, lineHeight: .85 }}>
              <CountInt to={8} /><span style={{ opacity: .45 }}>/16</span>
            </div>
            <div className="gc-mono" style={{ fontSize: 12, opacity: .85, marginTop: 4 }}>tickets to knockout punched</div>
          </div>
          <div className="gc-card gc-hover" style={{ padding: 24 }}>
            <Eyebrow>↗ SECOND-SCREEN HIGHLIGHT</Eyebrow>
            <h4 style={{ fontFamily: "var(--f-display)", fontSize: 42, margin: "10px 0 8px", lineHeight: .88 }}>Atlantica clinch group A</h4>
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
              Two wins from two; +5 goal differential. They face the runner-up of Group B on June 28 in the R16 opener at Estadio Alma.
            </p>
            <span className="gc-link" style={{ marginTop: 10 }}>Leer análisis →</span>
          </div>
        </div>
      </div>

      {/* POLLAS — red band */}
      <Band tone="red" withFloodlight={<Floodlight size={600} color="var(--gold)" opacity={.25} top={-200} left={-100} />}>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, position: "relative" }}>
          <div className="gc-col gc-gap-xs">
            <Eyebrow tone="onGreen"><b style={{ fontFamily: "var(--f-display)", fontSize: 22, fontWeight: 400, color: "currentColor" }}>03</b> · POLLAS FUTBOLERAS</Eyebrow>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 88, lineHeight: .85, margin: "6px 0 0", textTransform: "uppercase" }}>
              The game<br/>before the game.
            </h2>
          </div>
          <p style={{ maxWidth: 340, fontSize: 15, lineHeight: 1.5, opacity: .92, margin: 0 }}>
            Create pools with friends or your class, predict scorelines, climb the live ranking. Points settle automatically at the final whistle.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: 18, position: "relative" }}>
          <NextPredictionCard />
          {window.GC.pools.slice(0, 2).map(p => (
            <div key={p.id} className="gc-hover" style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: 14, padding: 24, border: "1px solid transparent" }}>
              <PoolCardInline pool={p} />
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 18, padding: "20px 28px",
          background: "rgba(247,241,223,.1)", border: "1.5px dashed rgba(255,247,226,.4)",
          borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "relative",
        }}>
          <div>
            <Eyebrow tone="onGreen">↗ CREA UNA POLLA EN 30 SEGUNDOS</Eyebrow>
            <h4 style={{ fontFamily: "var(--f-display)", fontSize: 34, margin: "4px 0 0", lineHeight: 1 }}>Invita por código, juega por cualquier cosa.</h4>
          </div>
          <button className="gc-btn" style={{ background: "var(--paper)", color: "var(--ink)" }} onClick={() => onNavigate("pools")}>Crear polla</button>
        </div>
      </Band>

      {/* GOLDEN BOOT — ink band */}
      <Band tone="ink" withFloodlight={<Floodlight size={700} color="var(--gold)" opacity={.25} top={-300} right={-200} />}>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, position: "relative" }}>
          <div>
            <Eyebrow tone="onDark"><b style={{ fontFamily: "var(--f-display)", fontSize: 22, fontWeight: 400, color: "currentColor" }}>04</b> · GOLDEN BOOT RACE</Eyebrow>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 88, lineHeight: .85, margin: "8px 0 0", textTransform: "uppercase" }}>
              Quien patea,<br/>
              <span style={{ color: "var(--gold)" }}>se anota.</span>
            </h2>
          </div>
          <span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: "rgba(247,241,223,.55)", letterSpacing: ".12em" }}>UPDATED · LIVE</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20, position: "relative" }}>
          <div className="gc-card gc-card-gold gc-hover no-accent" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <Floodlight size={280} color="#fff3b8" opacity={.6} top={-100} right={-60} />
            <Eyebrow tone="gold">↘ #1 ON THE RACE</Eyebrow>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 64, lineHeight: .82, margin: "10px 0", textTransform: "uppercase", position: "relative" }}>K. Olabode</h3>
            <div className="gc-row gc-gap-sm" style={{ marginBottom: 22 }}>
              <Flag code="JOR" size={24} />
              <span style={{ fontWeight: 700 }}>Joriba · Striker · #9</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, paddingTop: 20, borderTop: "1.5px solid rgba(26,19,0,.25)", position: "relative" }}>
              <div><Eyebrow tone="gold">Goles</Eyebrow><div className="gc-display" style={{ fontSize: 48 }}><CountInt to={5} /></div></div>
              <div><Eyebrow tone="gold">Asists.</Eyebrow><div className="gc-display" style={{ fontSize: 48 }}><CountInt to={2} /></div></div>
              <div><Eyebrow tone="gold">Tiros</Eyebrow><div className="gc-display" style={{ fontSize: 48 }}><CountInt to={14} /></div></div>
            </div>
          </div>
          <div style={{ background: "rgba(247,241,223,.06)", borderRadius: 14, padding: 24, border: "1px solid rgba(247,241,223,.12)" }}>
            <ScorersListOnDark />
          </div>
        </div>
      </Band>

      {/* ÁLBUM — gold band */}
      <Band tone="gold" withFloodlight={<Floodlight size={700} color="var(--red)" opacity={.2} bottom={-300} left={-200} blend="multiply" />}>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, position: "relative" }}>
          <div>
            <Eyebrow tone="gold"><b style={{ fontFamily: "var(--f-display)", fontSize: 22, fontWeight: 400, color: "currentColor" }}>05</b> · ÁLBUM DIGITAL</Eyebrow>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 88, lineHeight: .85, margin: "8px 0 0", textTransform: "uppercase" }}>
              Coleccionar,<br/>intercambiar, brillar.
            </h2>
          </div>
          <div className="gc-col gc-gap-xs" style={{ alignItems: "flex-end", textAlign: "right" }}>
            <span className="gc-display" style={{ fontSize: 96, lineHeight: .82 }}><CountInt to={312} /><span style={{ opacity: .35 }}>/540</span></span>
            <span className="gc-mono" style={{ fontSize: 12, letterSpacing: ".1em" }}>58% COMPLETO · 47 REPETIDAS · 6 TRADES ABIERTOS</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, position: "relative" }}>
          <div style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: 16, padding: 24 }}>
            <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 14, alignItems: "baseline" }}>
              <Eyebrow>↘ SECCIÓN · LÁMINAS 24 → 35</Eyebrow>
              <Pill tone="gold">3 BRILLOS DESBLOQUEADOS</Pill>
            </div>
            <StickerGrid cols={6} />
          </div>
          <div className="gc-col gc-gap-md">
            <ActiveTradeCard />
            <NextPackCard />
          </div>
        </div>
      </Band>

      <SectionHead num="06" label="TUS ENTRADAS · DEL HUB AL TORNIQUETE" title="Tus entradas"
        right={<span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".12em" }}>RF-17 → RF-22</span>} />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {window.GC.tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
      </div>

      <SectionHead num="07" label="32 NACIONES · EL MAPA DEL TORNEO" title="32 Naciones"
        right={<span className="gc-link" onClick={() => onNavigate("nations")}>Explorar selecciones →</span>} />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 12 }}>
        {window.GC.nations.map(n => (
          <div key={n.code} className="gc-card gc-hover" style={{ padding: 16, cursor: "pointer" }}>
            <Flag code={n.code} size={40} />
            <div className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em", marginTop: 12 }}>{n.code} · GRP {n.group}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{n.name}</div>
          </div>
        ))}
      </div>

      <SectionHead num="08" label="BROADCAST MOMENTS · STATS · RECAPS" title="Broadcast Moments"
        right={<span className="gc-link">Toda la cobertura →</span>} />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {window.GC.moments.map((m, i) => (
          <div key={i} className="gc-card gc-hover" style={{ padding: 22 }}>
            <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <Pill tone="green">{m.tag}</Pill>
              <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{m.time}</span>
            </div>
            <h4 style={{ fontFamily: "var(--f-display)", fontSize: 30, margin: "6px 0 8px", lineHeight: .9 }}>{m.title}</h4>
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{m.body}</p>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, display: "block", letterSpacing: ".08em" }}>{m.match}</span>
          </div>
        ))}
      </div>

      <Footer />
    </PageShell>
  );
}

// ─── hero featured-match glass panel ────────────────────────────────────────
function HeroFeaturedMatch({ target }) {
  return (
    <div className="gc-glass" style={{ padding: "22px 24px", position: "relative", overflow: "hidden" }}>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <Eyebrow tone="red">↘ NEXT KICKOFF · GROUP B · MD3</Eyebrow>
        <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".1em" }}>ESTADIO ALMA · BRAVA</span>
      </div>
      <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="gc-row gc-gap-md" style={{ alignItems: "center" }}>
          <div className="gc-col" style={{ alignItems: "center" }}>
            <Flag code="ESP" size={44} />
            <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, marginTop: 6, letterSpacing: ".08em" }}>ESP</span>
            <span style={{ fontWeight: 600, fontSize: 12 }}>Esperanza</span>
          </div>
          <span className="gc-display" style={{ fontSize: 44, color: "var(--muted)" }}>vs</span>
          <div className="gc-col" style={{ alignItems: "center" }}>
            <Flag code="GAL" size={44} />
            <span className="gc-mono" style={{ fontSize: 11, fontWeight: 700, marginTop: 6, letterSpacing: ".08em" }}>GAL</span>
            <span style={{ fontWeight: 600, fontSize: 12 }}>Galicia</span>
          </div>
        </div>
        <Countdown target={target} />
      </div>
    </div>
  );
}

function HeroSwitcher({ variant }) {
  if (variant === "reel")    return <HypeReel />;
  if (variant === "bracket") return <BracketTeaser />;
  return <HypePoster tagline="FEEL EVERY MATCH" />;
}

// ─── prediction card (used in red Pollas band) ──────────────────────────────
function NextPredictionCard() {
  return (
    <div className="gc-card gc-card-ink gc-hover no-accent" style={{ padding: 26 }}>
      <Eyebrow tone="onDark">↘ TU PRÓXIMA PREDICCIÓN · CIERRA 1d 04h</Eyebrow>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: .9, margin: "10px 0 20px", textTransform: "uppercase" }}>
        Esperanza × Galicia
      </h3>
      <div className="gc-row" style={{ justifyContent: "space-around", alignItems: "center", marginBottom: 22 }}>
        <div className="gc-col gc-gap-xs" style={{ alignItems: "center" }}>
          <Flag code="ESP" size={36} />
          <span className="gc-mono" style={{ fontSize: 11, letterSpacing: ".08em", fontWeight: 700 }}>ESP</span>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: "var(--gold)", color: "var(--gold-ink)", fontFamily: "var(--f-display)", fontSize: 42, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>2</div>
        </div>
        <span className="gc-display" style={{ fontSize: 28, opacity: .45 }}>vs</span>
        <div className="gc-col gc-gap-xs" style={{ alignItems: "center" }}>
          <Flag code="GAL" size={36} />
          <span className="gc-mono" style={{ fontSize: 11, letterSpacing: ".08em", fontWeight: 700 }}>GAL</span>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: "var(--gold)", color: "var(--gold-ink)", fontFamily: "var(--f-display)", fontSize: 42, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>1</div>
        </div>
      </div>
      <div className="gc-row" style={{ justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(247,241,223,.18)" }}>
        <span className="gc-mono" style={{ fontSize: 11, opacity: .75, letterSpacing: ".1em", textTransform: "uppercase" }}>+30 pts si aciertas</span>
        <span style={{ color: "var(--gold)", fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer" }}>Editar pick →</span>
      </div>
    </div>
  );
}

// ─── active trade + next pack cards (used in gold Album band) ───────────────
function ActiveTradeCard() {
  return (
    <div style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" }}>
      <Eyebrow tone="gold">↘ INTERCAMBIO ACTIVO</Eyebrow>
      <h4 style={{ fontFamily: "var(--f-display)", fontSize: 30, margin: "8px 0 14px", lineHeight: .9, textTransform: "uppercase" }}>Tú × Camila R.</h4>
      <div className="gc-row gc-gap-md" style={{ alignItems: "center", justifyContent: "center", padding: "12px 0" }}>
        <div className="gc-col gc-gap-xs" style={{ alignItems: "center" }}>
          <div className="gc-shimmer" style={{ width: 64, height: 84, borderRadius: 6 }} />
          <span className="gc-mono" style={{ fontSize: 10, opacity: .8, letterSpacing: ".08em" }}>N° 028 · VIDAL</span>
        </div>
        <span style={{ fontFamily: "var(--f-display)", fontSize: 28, opacity: .55 }}>⇄</span>
        <div className="gc-col gc-gap-xs" style={{ alignItems: "center" }}>
          <div style={{ width: 64, height: 84, borderRadius: 6, background: "var(--paper-2)", border: "1px solid rgba(247,241,223,.2)" }} />
          <span className="gc-mono" style={{ fontSize: 10, opacity: .8, letterSpacing: ".08em" }}>N° 142 · HOLM</span>
        </div>
      </div>
      <div className="gc-row" style={{ justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(247,241,223,.18)", fontSize: 12 }}>
        <span style={{ opacity: .7 }}>Esperando confirmación · 02h</span>
        <span style={{ color: "var(--gold)", fontWeight: 700, fontFamily: "var(--f-sub)", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer" }}>Aceptar →</span>
      </div>
    </div>
  );
}

function NextPackCard() {
  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: 16, padding: 24 }}>
      <Eyebrow>↘ PRÓXIMO PAQUETE GRATIS</Eyebrow>
      <h4 style={{ fontFamily: "var(--f-display)", fontSize: 38, margin: "6px 0 4px", lineHeight: .9 }}>02:14:38</h4>
      <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>Después de tu próximo partido en vivo</span>
      <Btn style={{ marginTop: 14, padding: "10px 18px", fontSize: 12 }}>Abrir paquete · 50 GCoins</Btn>
    </div>
  );
}

Object.assign(window, { LandingPage, NextPredictionCard, ActiveTradeCard, NextPackCard });
