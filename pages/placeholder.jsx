// pages/placeholder.jsx
// Generic placeholder used for routes we haven't built yet (fixture, groups, pools, album, tickets, nations).
// Keeps the visual system consistent — same nav, ticker, page header.
// Includes a roadmap card with the RF requirements that page will fulfil.

const PAGE_META = {
  fixture: {
    kicker: "MODULE · PARTIDOS · FIXTURE",
    title: <>Match<br/>fixture.</>,
    lede: "Calendar of all 64 matches with personal-agenda sync, timezone normalization, and live status overlays. Filter by group, nation, stadium, or kickoff window.",
    rf: ["RF-13 Consulta de partidos", "RF-14 Resultados en vivo", "RF-15 Filtros y agenda personal"],
    sections: ["Calendar grid · Day / Week / Phase", "Match detail drawer", "Live commentary feed", "Add to my agenda CTA"],
  },
  groups: {
    kicker: "MODULE · FASE DE GRUPOS",
    title: <>Group<br/>stage.</>,
    lede: "Live standings across all six groups, head-to-head tiebreakers, qualification probabilities, and a knockout-bracket projection that updates after every final whistle.",
    rf: ["RF-09 Visualización de grupos", "RF-10 Tabla de posiciones en vivo", "RF-11 Proyección al bracket"],
    sections: ["6× group cards · expandable", "Cross-group standings", "Bracket projection (R16 → Final)"],
  },
  pools: {
    kicker: "MODULE · POLLAS FUTBOLERAS",
    title: <>Pollas<br/>futboleras.</>,
    lede: "Create, join, or browse prediction pools. Make picks, climb the ranking, settle automatically at the final whistle. Pools support private codes, public discovery, and university group leagues.",
    rf: ["RF-04 Pollas (motor de predicciones)", "RF-23 Crear polla", "RF-24 Unirse a polla", "RF-25 Realizar predicción", "RF-26 Ranking de polla"],
    sections: ["My pools dashboard", "Pool detail · leaderboard + predictions", "Create-pool flow", "Single-match prediction modal"],
  },
  album: {
    kicker: "MODULE · ÁLBUM DIGITAL",
    title: <>Álbum<br/>digital.</>,
    lede: "Collect 540 stickers across 32 nations, golden moments, and host stadiums. Open packs, mark duplicates, send and receive trade offers with other Hub members.",
    rf: ["RF-05 Álbum digital", "RF-27 Apertura de paquetes", "RF-28 Marcar repetidos", "RF-29 Intercambios"],
    sections: ["Full album page · 32 sections", "Pack-opening flow", "Trade inbox · offers in / out", "Marketplace · public trade board"],
  },
  tickets: {
    kicker: "MODULE · ENTRADAS",
    title: <>Tickets.</>,
    lede: "Browse availability for every match, reserve seats in the sandbox payment flow, transfer between authorized accounts, and request refunds within tournament rules.",
    rf: ["RF-17 Catálogo de entradas", "RF-18 Reserva", "RF-19 Pago (sandbox)", "RF-20 Transferencia", "RF-21 Reembolso", "RF-22 Historial"],
    sections: ["Match availability list", "Seat map · interactive", "Checkout flow", "My tickets · active / past / transferred"],
  },
  nations: {
    kicker: "MODULE · PAÍSES",
    title: <>32 nations.</>,
    lede: "Each nation gets a hub: squad, schedule, group context, head-to-head form, sticker checklist, and a moment timeline. The country card you saw on the landing expands into a full profile.",
    rf: ["RF-06 Perfil de país", "RF-07 Squad y estadísticas", "RF-08 Estadios sede"],
    sections: ["Nation profile · masthead + key stats", "Squad list", "Match history & upcoming", "Stadium gallery"],
  },
};

function PlaceholderPage({ current, onNavigate }) {
  const meta = PAGE_META[current] || PAGE_META.fixture;
  return (
    <PageShell current={current} onNavigate={onNavigate}>
      <PageHeader
        kicker={meta.kicker}
        title={meta.title}
        lede={meta.lede}
        action={<Btn kind="ghost" onClick={() => onNavigate("landing")}>← Inicio</Btn>}
      />

      <SectionHead num="01" label="ROADMAP · REQUIREMENTS COVERED" title="Requirements"
        right={<span className="gc-mono gc-uppercase" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".12em" }}>SOURCE · PROJECT DOC</span>} />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {meta.rf.map(r => (
          <div key={r} className="gc-card gc-hover" style={{ padding: 22 }}>
            <Eyebrow>{r.split(" ")[0]}</Eyebrow>
            <h4 style={{ fontFamily: "var(--f-display)", fontSize: 26, margin: "8px 0 0", lineHeight: .9 }}>
              {r.split(" ").slice(1).join(" ")}
            </h4>
          </div>
        ))}
      </div>

      <SectionHead num="02" label="SECTIONS PLANNED" title="Sections to build" />
      <div style={{ padding: "22px 56px 0", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {meta.sections.map((s, i) => (
          <div key={i} className="gc-card gc-hover" style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div className="gc-row gc-gap-md" style={{ alignItems: "center", flex: 1 }}>
              <span className="gc-display" style={{ fontSize: 48, color: "var(--muted)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: "var(--f-sub)", fontWeight: 800, fontSize: 18, textTransform: "uppercase", letterSpacing: ".02em" }}>{s}</span>
            </div>
            <Pill>PENDING</Pill>
          </div>
        ))}
      </div>

      <Band tone="paper2" style={{ marginTop: 56 }}>
        <div className="gc-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div>
            <Eyebrow>↗ NEXT</Eyebrow>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 48, margin: "6px 0 0", lineHeight: .9, textTransform: "uppercase" }}>
              Tell me which module to build first.
            </h3>
            <p style={{ fontSize: 14, color: "var(--ink-2)", maxWidth: 560, marginTop: 10 }}>
              The visual system is locked. Pick a module and I'll build it page-by-page, reusing the components catalogued in the design system.
            </p>
          </div>
          <Btn onClick={() => onNavigate("system")}>Ver Design System →</Btn>
        </div>
      </Band>

      <Footer />
    </PageShell>
  );
}

Object.assign(window, { PlaceholderPage, PAGE_META });
