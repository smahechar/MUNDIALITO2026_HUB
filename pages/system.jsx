// pages/system.jsx
// Living design system reference — implementation-ready documentation.
// Every token, primitive, and pattern used across the platform.

function SystemPage({ onNavigate }) {
  return (
    <PageShell current="system" onNavigate={onNavigate} showTicker={false}>
      <PageHeader
        kicker="DESIGN SYSTEM · v0.1 · LOCKED VISUAL DIRECTION"
        title={<>The Daily<br/>Broadcast.</>}
        lede="A single visual system for the Global Cup 2026 Hub. Editorial broadsheet meets live broadcast graphics: wide-condensed display type, strict horizontal rules, cream paper, festival color bands. This page is the source of truth — every component below is the one rendered across the platform."
        action={<Btn kind="ghost" onClick={() => onNavigate("landing")}>← Ver landing</Btn>}
      />

      <SystemSection num="A" label="FOUNDATIONS · COLOR" title="Color tokens">
        <ColorGrid />
      </SystemSection>

      <SystemSection num="B" label="FOUNDATIONS · TYPOGRAPHY" title="Type system">
        <TypeSpec />
      </SystemSection>

      <SystemSection num="C" label="FOUNDATIONS · SPACING & RADII" title="Spacing & radii">
        <SpacingSpec />
      </SystemSection>

      <SystemSection num="D" label="FOUNDATIONS · ICONOGRAPHY" title="Flag abstractions">
        <FlagGrid />
      </SystemSection>

      <SystemSection num="E" label="PRIMITIVES · PILLS, BUTTONS, EYEBROWS" title="Atomic primitives">
        <PrimitivesGrid />
      </SystemSection>

      <SystemSection num="F" label="MOTION · MICRO-INTERACTIONS" title="Motion vocabulary">
        <MotionSpec />
      </SystemSection>

      <SystemSection num="G" label="COMPONENTS · MATCH & SCOREBOARD" title="Match components">
        <MatchSamples />
      </SystemSection>

      <SystemSection num="H" label="COMPONENTS · DATA VIZ" title="Data viz">
        <DataVizSamples />
      </SystemSection>

      <SystemSection num="I" label="COMPONENTS · FEATURE PRIMITIVES" title="Feature primitives">
        <FeatureSamples />
      </SystemSection>

      <SystemSection num="J" label="LAYOUT · GRID & BANDS" title="Layout system">
        <LayoutSpec />
      </SystemSection>

      <SystemSection num="K" label="COPY · VOICE & TONE" title="Voice & tone">
        <VoiceSpec />
      </SystemSection>

      <SystemSection num="L" label="HANDOFF · FILE STRUCTURE" title="File structure">
        <FilesSpec />
      </SystemSection>

      <Footer />
    </PageShell>
  );
}

// ─── shared layout for each system section ───────────────────────────────────
function SystemSection({ num, label, title, children }) {
  return (
    <>
      <SectionHead num={num} label={label} title={title} />
      <div style={{ padding: "22px 56px 0" }}>{children}</div>
    </>
  );
}

// ─── A · COLOR ───────────────────────────────────────────────────────────────
function ColorGrid() {
  const swatches = [
    { name: "Ink",       v: "--ink",       desc: "Primary text, broadcast frames, masthead",  fg: "var(--paper)" },
    { name: "Paper",     v: "--paper",     desc: "Default page background",                   fg: "var(--ink)" },
    { name: "Paper 2",   v: "--paper-2",   desc: "Alt section bg, sticker fields",            fg: "var(--ink)" },
    { name: "Green",     v: "--green",     desc: "Pitch · qualifying status · success",       fg: "var(--green-ink)" },
    { name: "Red",       v: "--red",       desc: "LIVE indicator · pollas accent · alerts",   fg: "var(--red-ink)" },
    { name: "Gold",      v: "--gold",      desc: "Trophy moments · álbum · #1 leader",        fg: "var(--gold-ink)" },
    { name: "Sky",       v: "--sky",       desc: "Hyperlinks (rare, mostly use ink rule)",    fg: "#fff" },
    { name: "Muted",     v: "--muted",     desc: "Metadata, secondary copy",                  fg: "var(--paper)" },
  ];
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {swatches.map(s => (
          <div key={s.name} className="gc-card" style={{ background: `var(${s.v})`, color: s.fg, padding: 22, borderColor: "transparent", minHeight: 160, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span className="gc-mono" style={{ fontSize: 10, letterSpacing: ".12em", opacity: .7 }}>{s.v}</span>
            <div>
              <div className="gc-display" style={{ fontSize: 42, lineHeight: .85 }}>{s.name}</div>
              <p style={{ fontSize: 12, margin: "6px 0 0", opacity: .85, lineHeight: 1.4 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }} className="gc-card">
        <Eyebrow>SEMANTIC USAGE</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 14 }}>
          <UsageRow label="LIVE state" tone="red" />
          <UsageRow label="Qualified · Final" tone="green" />
          <UsageRow label="Leader · Trophy" tone="gold" />
        </div>
      </div>
    </>
  );
}
function UsageRow({ label, tone }) {
  return (
    <div className="gc-col gc-gap-xs">
      <Eyebrow style={{ fontSize: 10 }}>{label}</Eyebrow>
      <div className="gc-row gc-gap-sm">
        <Pill tone={tone} live={tone === "red"}>SAMPLE</Pill>
        <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{`<Pill tone="${tone}" />`}</span>
      </div>
    </div>
  );
}

// ─── B · TYPE ────────────────────────────────────────────────────────────────
function TypeSpec() {
  const samples = [
    { fam: "Anton",            usage: "Display · masthead · big numbers · section heads", token: "--f-display", sample: "GOLDEN BOOT RACE",  size: 88 },
    { fam: "Barlow Condensed", usage: "Sub-display · buttons · eyebrows · pills",         token: "--f-sub",     sample: "MATCH DAY 02",      size: 36 },
    { fam: "DM Sans",          usage: "Body · paragraphs · UI copy",                      token: "--f-body",    sample: "The Global Cup 2026, lived from kickoff to final whistle.", size: 22 },
    { fam: "JetBrains Mono",   usage: "Metadata · scoreboards · codes · tabular nums",    token: "--f-mono",    sample: "ESP 2 — 1 GAL · MIN 67",  size: 22 },
  ];
  return (
    <div className="gc-col gc-gap-md">
      {samples.map(s => (
        <div key={s.fam} className="gc-card" style={{ padding: 24 }}>
          <div className="gc-row" style={{ justifyContent: "space-between", marginBottom: 14, alignItems: "baseline" }}>
            <Eyebrow>{s.fam} · {s.token}</Eyebrow>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{s.usage}</span>
          </div>
          <div style={{
            fontFamily: `var(${s.token})`,
            fontSize: s.size, lineHeight: 1.05,
            textTransform: s.token === "--f-display" || s.token === "--f-sub" ? "uppercase" : "none",
            letterSpacing: s.token === "--f-sub" ? ".06em" : 0,
          }}>{s.sample}</div>
        </div>
      ))}

      <div className="gc-card" style={{ padding: 24 }}>
        <Eyebrow>TYPE SCALE · DISPLAY</Eyebrow>
        <div className="gc-col gc-gap-sm" style={{ marginTop: 12 }}>
          {[{ s: 196, l: "Hero" }, { s: 124, l: "Page H1" }, { s: 88, l: "Section H2" }, { s: 64, l: "Section H2 alt" }, { s: 42, l: "Card title" }, { s: 30, l: "Sub-card" }].map(r => (
            <div key={r.s} className="gc-row" style={{ alignItems: "baseline", gap: 18 }}>
              <span className="gc-mono" style={{ width: 60, color: "var(--muted)", fontSize: 11, letterSpacing: ".08em" }}>{r.s}px</span>
              <span className="gc-mono" style={{ width: 140, color: "var(--muted)", fontSize: 11, letterSpacing: ".08em" }}>{r.l}</span>
              <span style={{ fontFamily: "var(--f-display)", fontSize: r.s, lineHeight: .9, textTransform: "uppercase" }}>Aa</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── C · SPACING / RADII ─────────────────────────────────────────────────────
function SpacingSpec() {
  const tokens = [
    { name: "--pad",   value: "22px", desc: "Card padding · regular density" },
    { name: "--gap",   value: "22px", desc: "Default grid gap" },
    { name: "--r-xs",  value: "4px",  desc: "Small chips" },
    { name: "--r-sm",  value: "8px",  desc: "Buttons inline, table cells" },
    { name: "--r-md",  value: "14px", desc: "Cards, panels (default)" },
    { name: "--r-lg",  value: "22px", desc: "Hero cards, feature panels" },
  ];
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {tokens.map(t => (
          <div key={t.name} className="gc-card">
            <Eyebrow>{t.name}</Eyebrow>
            <div className="gc-display" style={{ fontSize: 32, margin: "8px 0" }}>{t.value}</div>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".08em" }}>{t.desc}</span>
          </div>
        ))}
      </div>

      <div className="gc-card" style={{ marginTop: 18, padding: 24 }}>
        <Eyebrow>DENSITY MODES</Eyebrow>
        <p style={{ fontSize: 13, color: "var(--ink-2)", maxWidth: 540, marginTop: 6 }}>
          Toggle via <code style={{ fontFamily: "var(--f-mono)", background: "var(--paper-2)", padding: "2px 6px", borderRadius: 4 }}>data-density</code> attribute on the page root. Compact for dense reports, comfy for marketing.
        </p>
        <div className="gc-row gc-gap-md" style={{ marginTop: 14 }}>
          {["compact", "regular", "comfy"].map(d => (
            <div key={d} data-density={d} className="gc-card" style={{ flex: 1, padding: "var(--pad)" }}>
              <Eyebrow>{d}</Eyebrow>
              <div className="gc-display" style={{ fontSize: 42, margin: "4px 0" }}>{getComputedDensity(d)}</div>
              <span className="gc-mono" style={{ fontSize: 11, color: "var(--muted)" }}>--pad</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
function getComputedDensity(d) {
  return ({ compact: "16px", regular: "22px", comfy: "28px" })[d];
}

// ─── D · FLAG GRID ───────────────────────────────────────────────────────────
function FlagGrid() {
  return (
    <>
      <p style={{ fontSize: 14, color: "var(--ink-2)", maxWidth: 640, marginBottom: 16 }}>
        All "nation" identifiers are fictional and rendered as abstracted 3-stripe geometries (vertical, horizontal, diagonal, cross). No real flags or insignia are used. Pass a 3-letter code to <code style={{ fontFamily: "var(--f-mono)", background: "var(--paper-2)", padding: "2px 6px", borderRadius: 4 }}>{`<Flag code="ATL" />`}</code>.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 12 }}>
        {window.GC.nations.map(n => (
          <div key={n.code} className="gc-card" style={{ padding: 14 }}>
            <Flag code={n.code} size={42} />
            <div className="gc-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, letterSpacing: ".08em" }}>{n.code} · {n.layout}</div>
            <div style={{ fontWeight: 700, fontSize: 12, marginTop: 2 }}>{n.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── E · PRIMITIVES ──────────────────────────────────────────────────────────
function PrimitivesGrid() {
  return (
    <div className="gc-col gc-gap-md">
      <SpecRow label="<Pill> · default · live · ink · green · gold">
        <div className="gc-row gc-gap-sm" style={{ flexWrap: "wrap" }}>
          <Pill>DEFAULT</Pill>
          <Pill live>LIVE · MIN 67</Pill>
          <Pill tone="ink">FT</Pill>
          <Pill tone="green">QUALIFIED</Pill>
          <Pill tone="gold">SHINE</Pill>
        </div>
      </SpecRow>

      <SpecRow label="<Btn> · primary · accent · ghost">
        <div className="gc-row gc-gap-md">
          <Btn>Crear cuenta</Btn>
          <Btn kind="accent">Ingresar</Btn>
          <Btn kind="ghost">Ver fixture →</Btn>
        </div>
      </SpecRow>

      <SpecRow label="<Eyebrow> · monospace, 11px, .14em tracking">
        <div className="gc-col gc-gap-xs">
          <Eyebrow>↘ DEFAULT · LIVE LEADERBOARD</Eyebrow>
          <Eyebrow tone="red">↗ ALERT EYEBROW</Eyebrow>
        </div>
      </SpecRow>

      <SpecRow label="<NationChip>">
        <div className="gc-col gc-gap-sm">
          <NationChip code="ATL" />
          <NationChip code="JOR" />
        </div>
      </SpecRow>

      <SpecRow label="<ProgressBar value=42>">
        <div style={{ width: 320 }}>
          <ProgressBar value={42} />
          <div style={{ marginTop: 8 }}><ProgressBar value={68} tone="gold" /></div>
          <div style={{ marginTop: 8 }}><ProgressBar value={89} tone="red" /></div>
        </div>
      </SpecRow>

      <SpecRow label="<CountInt to=4218>">
        <span className="gc-display" style={{ fontSize: 56 }}>
          <CountInt to={4218} />
        </span>
      </SpecRow>
    </div>
  );
}
function SpecRow({ label, children }) {
  return (
    <div className="gc-card" style={{ padding: 22, display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "center" }}>
      <Eyebrow>{label}</Eyebrow>
      <div>{children}</div>
    </div>
  );
}

// ─── F · MOTION ──────────────────────────────────────────────────────────────
function MotionSpec() {
  const motions = [
    { name: "gc-rise",      desc: "Entry rise + fade (.8s, ease-out cubic). Staggered hero reveals." },
    { name: "gc-score-pop", desc: "Scoreboard digit pop on update. .5s with overshoot." },
    { name: "gc-live-card", desc: "Slow red glow ring (2.6s loop) around live match cards." },
    { name: "gc-pulse",     desc: "Live indicator dot pulse (1.4s loop)." },
    { name: "gc-shimmer",   desc: "Gold shine sweep on premium stickers (6s loop)." },
    { name: "gc-tickscroll",desc: "Score ticker horizontal scroll (60s linear)." },
    { name: "gc-hover",     desc: "Lift + shadow + red top-rule slide. .25s cubic ease." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
      {motions.map(m => (
        <div key={m.name} className="gc-card" style={{ padding: 22 }}>
          <Eyebrow>{m.name}</Eyebrow>
          <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "6px 0 0", lineHeight: 1.5 }}>{m.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── G · MATCH SAMPLES ───────────────────────────────────────────────────────
function MatchSamples() {
  return (
    <div className="gc-col gc-gap-md">
      <Eyebrow>{`<MatchCardPro> · live, upcoming, final`}</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <MatchCardPro match={window.GC.matches[0]} />
        <MatchCardPro match={window.GC.matches[3]} />
        <MatchCardPro match={window.GC.matches[5]} />
      </div>

      <Eyebrow style={{ marginTop: 14 }}>{`<FixtureRail>`}</Eyebrow>
      <FixtureRail count={6} />

      <Eyebrow style={{ marginTop: 14 }}>{`<Countdown>`}</Eyebrow>
      <div className="gc-card" style={{ padding: 26 }}>
        <Countdown target={window.GC.nextKickoff()} />
      </div>

      <Eyebrow style={{ marginTop: 14 }}>{`<LiveTicker>`}</Eyebrow>
      <LiveTicker tone="ink" />
    </div>
  );
}

// ─── H · DATA VIZ SAMPLES ────────────────────────────────────────────────────
function DataVizSamples() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
      <div className="gc-col gc-gap-md">
        <Eyebrow>{`<GroupSwitcher> + <StandingsTable>`}</Eyebrow>
        <GroupSwitcher />
        <Eyebrow style={{ marginTop: 10 }}>{`<StatTilePro>`}</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          <StatTilePro label="MATCHES PLAYED" value={32} change="+8 today" tone="paper" />
          <StatTilePro label="GOALS SCORED" value={94} change="2.9 per match" tone="ink" />
        </div>
      </div>
      <div className="gc-col gc-gap-md">
        <Eyebrow>{`<ScorersList>`}</Eyebrow>
        <div className="gc-card" style={{ padding: 22 }}>
          <ScorersList limit={5} />
        </div>
      </div>
    </div>
  );
}

// ─── I · FEATURE SAMPLES ─────────────────────────────────────────────────────
function FeatureSamples() {
  return (
    <div className="gc-col gc-gap-md">
      <Eyebrow>{`<PoolCard>`}</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {window.GC.pools.slice(0, 3).map(p => <PoolCard key={p.id} pool={p} />)}
      </div>

      <Eyebrow style={{ marginTop: 14 }}>{`<StickerGrid cols=8>`}</Eyebrow>
      <div className="gc-card" style={{ padding: 18 }}><StickerGrid cols={8} /></div>

      <Eyebrow style={{ marginTop: 14 }}>{`<TicketCard>`}</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {window.GC.tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
      </div>

      <Eyebrow style={{ marginTop: 14 }}>{`<HypeReel>`}</Eyebrow>
      <HypeReel />
    </div>
  );
}

// ─── J · LAYOUT SPEC ─────────────────────────────────────────────────────────
function LayoutSpec() {
  return (
    <div className="gc-col gc-gap-md">
      <div className="gc-card" style={{ padding: 24 }}>
        <Eyebrow>PAGE GRID</Eyebrow>
        <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.5, maxWidth: 640 }}>
          1440px max width, centered. Side gutter: 56px. Inner grid: 12 columns, 20px gap. Section heads use a thick (2px) underline rule. Section bands break the column grid and run full-bleed inside the page wrap.
        </p>
        <div className="gc-row gc-gap-md" style={{ marginTop: 14 }}>
          {[..."AB"].map((_, i) => (
            <div key={i} className="gc-card" style={{ flex: 1, padding: 16, textAlign: "center" }}>
              <Eyebrow>{i === 0 ? "GUTTER" : "INNER GRID"}</Eyebrow>
              <div className="gc-display" style={{ fontSize: 36, margin: "6px 0" }}>{i === 0 ? "56px" : "12 col"}</div>
            </div>
          ))}
        </div>
      </div>

      <Eyebrow>COLOR BANDS (festival rhythm)</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { tone: "red",   l: "POLLAS"   },
          { tone: "ink",   l: "GOLDEN BOOT" },
          { tone: "gold",  l: "ÁLBUM"    },
          { tone: "green", l: "CTA / FOOTER" },
        ].map(b => {
          const bg = b.tone === "red" ? "var(--red)" : b.tone === "ink" ? "var(--ink)" : b.tone === "gold" ? "var(--gold)" : "var(--green)";
          const fg = b.tone === "red" ? "var(--red-ink)" : b.tone === "ink" ? "var(--paper)" : b.tone === "gold" ? "var(--gold-ink)" : "var(--green-ink)";
          return (
            <div key={b.tone} className="gc-card" style={{ background: bg, color: fg, borderColor: "transparent", minHeight: 140, padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Eyebrow style={{ color: fg, opacity: .7 }}>BAND</Eyebrow>
              <div>
                <div className="gc-display" style={{ fontSize: 32, lineHeight: .9 }}>{b.l}</div>
                <span className="gc-mono" style={{ fontSize: 11, opacity: .8, letterSpacing: ".08em" }}>tone="{b.tone}"</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── K · VOICE ───────────────────────────────────────────────────────────────
function VoiceSpec() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {[
        { title: "Broadcast journalist", body: "Confident, present-tense, declarative. Clean facts over hype.", do: "“Atlantica clinch group A — +5 GD with a match to spare.”", dont: "“OMG Atlantica are CRUSHING IT!! 🔥🔥🔥”" },
        { title: "Editorial restraint",   body: "Headlines uppercase, body sentence-case. No exclamation points unless quoting a player.", do: "“The game before the game.”", dont: "“The BEST pollas EVER!!!”" },
        { title: "Spanish/English mix",   body: "Spanish for product nouns (Pollas, Álbum, Entradas). English for editorial framing.", do: "“Pollas Futboleras — the game before the game.”", dont: "“Soccer Pools — bet on matches!”" },
      ].map(s => (
        <div key={s.title} className="gc-card" style={{ padding: 22 }}>
          <h4 style={{ fontFamily: "var(--f-display)", fontSize: 30, margin: 0, lineHeight: .9 }}>{s.title}</h4>
          <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 10 }}>{s.body}</p>
          <div className="gc-col gc-gap-xs" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--rule)" }}>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--green)", letterSpacing: ".08em" }}>DO</span>
            <p style={{ fontSize: 13, margin: 0 }}>{s.do}</p>
            <span className="gc-mono" style={{ fontSize: 11, color: "var(--red)", letterSpacing: ".08em", marginTop: 8 }}>DON'T</span>
            <p style={{ fontSize: 13, margin: 0, color: "var(--muted)" }}>{s.dont}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── L · FILE STRUCTURE ──────────────────────────────────────────────────────
function FilesSpec() {
  const tree = [
    { path: "data.js",                       desc: "Mock data (matches, nations, scorers, pools, etc.)" },
    { path: "styles.css",                    desc: "Design tokens (CSS vars), base styles, motion keyframes" },
    { path: "components/atoms.jsx",          desc: "Flag, NationChip, Pill, Btn, Eyebrow, ProgressBar, SectionHead, useCountUp, CountInt" },
    { path: "components/layout.jsx",         desc: "NavBar, Band, Floodlight, Watermark, PageShell, PageHeader, Footer" },
    { path: "components/match.jsx",          desc: "LiveTicker, Countdown, MatchCard, MatchCardPro, FixtureRail" },
    { path: "components/data-viz.jsx",       desc: "StandingsTable, GroupSwitcher, ScorersList, ScorersListOnDark, StatTile, StatTilePro" },
    { path: "components/features.jsx",       desc: "PoolCard, PoolCardInline, StickerGrid, TicketCard, HypePoster, HypeReel, BracketTeaser" },
    { path: "pages/landing.jsx",             desc: "Landing page (Daily Broadcast)" },
    { path: "pages/system.jsx",              desc: "This page — design system reference" },
    { path: "pages/placeholder.jsx",         desc: "Stub for upcoming pages (fixture, groups, pools, álbum, tickets, naciones)" },
    { path: "router.jsx",                    desc: "Hash router with current page state" },
    { path: "tweaks-panel.jsx",              desc: "Tweaks panel host protocol + controls" },
    { path: "app.jsx",                       desc: "Entry — tweak defaults, palette, root render" },
    { path: "index.html",                    desc: "Shell — script loads in dep order" },
  ];
  return (
    <div className="gc-card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="gc-table" style={{ fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ paddingLeft: 22, width: 320 }}>PATH</th>
            <th>RESPONSIBILITY</th>
          </tr>
        </thead>
        <tbody>
          {tree.map(t => (
            <tr key={t.path}>
              <td style={{ paddingLeft: 22, fontFamily: "var(--f-mono)", fontSize: 12 }}>{t.path}</td>
              <td>{t.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { SystemPage });
