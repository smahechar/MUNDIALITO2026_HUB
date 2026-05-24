// Mock data for Global Cup 2026 Hub — original fictional content only.
// No real teams, players, flags, or logos.
// All "nations" are invented; flags are abstracted 3-stripe geometries.

window.GC = window.GC || {};

// ─────────────────────── nations (invented) ───────────────────────
// Each "flag" is just 3 colors + a layout type. We render them as abstract stripes.
GC.nations = [
  { code: "ATL", name: "Atlantica",  group: "A", colors: ["#1a4ed1", "#ffffff", "#d6362a"], layout: "v" },
  { code: "BOR", name: "Borealis",   group: "A", colors: ["#0e3b2a", "#f4b500", "#0e3b2a"], layout: "h" },
  { code: "CAR", name: "Carpathia",  group: "A", colors: ["#d6362a", "#0c0c0d", "#f4b500"], layout: "v" },
  { code: "DUR", name: "Durango",    group: "A", colors: ["#0c0c0d", "#d6362a", "#ffffff"], layout: "h" },

  { code: "ESP", name: "Esperanza",  group: "B", colors: ["#0e3b2a", "#ffffff", "#d6362a"], layout: "diag" },
  { code: "FRJ", name: "Fjordland",  group: "B", colors: ["#1a6ee0", "#ffffff", "#1a6ee0"], layout: "h" },
  { code: "GAL", name: "Galicia",    group: "B", colors: ["#f4b500", "#0c0c0d", "#f4b500"], layout: "v" },
  { code: "HEL", name: "Helvetia",   group: "B", colors: ["#d6362a", "#ffffff", "#d6362a"], layout: "cross" },

  { code: "INK", name: "Inkala",     group: "C", colors: ["#7c3aff", "#f4b500", "#0c0c0d"], layout: "v" },
  { code: "JOR", name: "Joriba",     group: "C", colors: ["#0e3b2a", "#f4b500", "#d6362a"], layout: "h" },
  { code: "KAL", name: "Kalandra",   group: "C", colors: ["#1a6ee0", "#ffffff", "#f4b500"], layout: "diag" },
  { code: "LUM", name: "Lumeria",    group: "C", colors: ["#ffffff", "#1a6ee0", "#d6362a"], layout: "h" },

  { code: "MER", name: "Meridian",   group: "D", colors: ["#0c0c0d", "#f4b500", "#0c0c0d"], layout: "v" },
  { code: "NOV", name: "Novara",     group: "D", colors: ["#d6362a", "#f4b500", "#0e3b2a"], layout: "v" },
  { code: "ORY", name: "Oryana",     group: "D", colors: ["#1a6ee0", "#d6362a", "#ffffff"], layout: "h" },
  { code: "PAR", name: "Parana",     group: "D", colors: ["#0e3b2a", "#ffffff", "#f4b500"], layout: "diag" },

  { code: "QUI", name: "Quintara",   group: "E", colors: ["#7c3aff", "#ffffff", "#0c0c0d"], layout: "h" },
  { code: "RHO", name: "Rhodian",    group: "E", colors: ["#d6362a", "#ffffff", "#1a6ee0"], layout: "v" },
  { code: "SAB", name: "Sabinia",    group: "E", colors: ["#f4b500", "#d6362a", "#0c0c0d"], layout: "diag" },
  { code: "TER", name: "Terramar",   group: "E", colors: ["#0e3b2a", "#1a6ee0", "#0e3b2a"], layout: "h" },

  { code: "URS", name: "Ursalia",    group: "F", colors: ["#0c0c0d", "#d6362a", "#ffffff"], layout: "diag" },
  { code: "VAL", name: "Valdoria",   group: "F", colors: ["#ffffff", "#0e3b2a", "#d6362a"], layout: "v" },
  { code: "WIN", name: "Windhelm",   group: "F", colors: ["#1a6ee0", "#f4b500", "#ffffff"], layout: "h" },
  { code: "XAN", name: "Xandar",     group: "F", colors: ["#7c3aff", "#0c0c0d", "#f4b500"], layout: "v" },
];

GC.byCode = Object.fromEntries(GC.nations.map(n => [n.code, n]));

// ─────────────────────── matches ───────────────────────
// status: "live" | "upcoming" | "final"
GC.matches = [
  { id: "m1",  home: "ATL", away: "DUR", group: "A", stadium: "Arena Aurora",  city: "Norden",     phase: "Group A · MD2", status: "live",     minute: "67'",       homeScore: 2, awayScore: 1, kickoff: "2026-06-12T20:00:00Z" },
  { id: "m2",  home: "JOR", away: "LUM", group: "C", stadium: "Estadio Sol",   city: "Sereno",     phase: "Group C · MD2", status: "live",     minute: "32'",       homeScore: 0, awayScore: 0, kickoff: "2026-06-12T20:30:00Z" },
  { id: "m3",  home: "INK", away: "KAL", group: "C", stadium: "Coliseu Mare",  city: "Porto Mare", phase: "Group C · MD2", status: "halftime", minute: "HT",        homeScore: 1, awayScore: 1, kickoff: "2026-06-12T18:00:00Z" },
  { id: "m4",  home: "ESP", away: "GAL", group: "B", stadium: "Estadio Alma",  city: "Brava",      phase: "Group B · MD3", status: "upcoming", minute: null,        homeScore: null, awayScore: null, kickoff: "2026-06-13T17:00:00Z" },
  { id: "m5",  home: "MER", away: "PAR", group: "D", stadium: "Velódromo Cima",city: "Cima",       phase: "Group D · MD3", status: "upcoming", minute: null,        homeScore: null, awayScore: null, kickoff: "2026-06-13T20:00:00Z" },
  { id: "m6",  home: "BOR", away: "CAR", group: "A", stadium: "Polar Bowl",    city: "Bjarki",     phase: "Group A · MD2", status: "final",    minute: "FT",        homeScore: 3, awayScore: 2, kickoff: "2026-06-12T16:00:00Z" },
  { id: "m7",  home: "QUI", away: "TER", group: "E", stadium: "Estadio Norte", city: "Vesna",      phase: "Group E · MD2", status: "final",    minute: "FT",        homeScore: 0, awayScore: 0, kickoff: "2026-06-12T13:00:00Z" },
  { id: "m8",  home: "URS", away: "WIN", group: "F", stadium: "Stadtarena",    city: "Stahlfeld",  phase: "Group F · MD2", status: "upcoming", minute: null,        homeScore: null, awayScore: null, kickoff: "2026-06-13T13:00:00Z" },
];

// ─────────────────────── groups & standings ───────────────────────
GC.groups = ["A","B","C","D","E","F"].map(g => {
  const teams = GC.nations.filter(n => n.group === g);
  // deterministic-ish standings — vary by group
  const seed = g.charCodeAt(0);
  return {
    name: g,
    teams: teams.map((t, i) => {
      const pl = 2;
      const w = (seed + i) % 3;
      const d = ((seed + i*2) % 2);
      const l = pl - w - d;
      const gf = w*2 + d;
      const ga = l*2;
      return {
        code: t.code, name: t.name, played: pl,
        w, d, l, gf, ga, gd: gf - ga,
        pts: w*3 + d,
      };
    }).sort((a,b) => b.pts - a.pts || b.gd - a.gd),
  };
});

// ─────────────────────── top scorers ───────────────────────
GC.scorers = [
  { rank: 1, name: "K. Olabode",      nation: "JOR", goals: 5, assists: 2, mins: 270, role: "Striker"   },
  { rank: 2, name: "M. Costa",         nation: "ESP", goals: 4, assists: 3, mins: 270, role: "Forward"  },
  { rank: 3, name: "L. Tannenbaum",    nation: "BOR", goals: 4, assists: 1, mins: 195, role: "Striker"  },
  { rank: 4, name: "S. Vidal",         nation: "PAR", goals: 3, assists: 2, mins: 270, role: "Winger"   },
  { rank: 5, name: "A. Petrović",      nation: "CAR", goals: 3, assists: 0, mins: 240, role: "Forward"  },
  { rank: 6, name: "R. Akhtar",        nation: "INK", goals: 2, assists: 4, mins: 270, role: "Midfield" },
  { rank: 7, name: "T. Holm",          nation: "FRJ", goals: 2, assists: 2, mins: 270, role: "Striker"  },
];

// ─────────────────────── prediction pools ───────────────────────
GC.pools = [
  { id: "p1", name: "Aula 304 — Ingeniería",  members: 28, code: "AULA304", you: 4, top: "Camila R.", topPts: 184, yourPts: 162, closesIn: "1d 04h", prize: "Pizza party" },
  { id: "p2", name: "Familia Buitrago",        members: 9,  code: "FAMBUI",  you: 1, top: "TÚ",        topPts: 142, yourPts: 142, closesIn: "1d 04h", prize: "Cena ganador" },
  { id: "p3", name: "Global · Casuales",       members: 4218, code: "GLOBAL", you: 612, top: "Mauricio O.", topPts: 226, yourPts: 178, closesIn: "1d 04h", prize: "Bragging rights" },
];

GC.predictions = [
  { match: "m4", you: { h: 2, a: 1 }, lock: "1d 04h", points: 30 },
  { match: "m5", you: { h: 1, a: 1 }, lock: "1d 08h", points: 25 },
  { match: "m8", you: { h: null, a: null }, lock: "0d 18h", points: 30 },
];

// ─────────────────────── sticker album ───────────────────────
// 24 slots for one group; mix of owned / dupe / empty / shine
GC.album = {
  total: 540,
  owned: 312,
  duplicates: 47,
  trades: 6,
  sample: [
    { n: "024", name: "OLABODE",     state: "shine" },
    { n: "025", name: "ADEYEMI",     state: "owned" },
    { n: "026", name: "TANNENBAUM",  state: "owned" },
    { n: "027", name: "—",           state: "empty" },
    { n: "028", name: "VIDAL",       state: "dupe"  },
    { n: "029", name: "COSTA",       state: "owned" },
    { n: "030", name: "—",           state: "empty" },
    { n: "031", name: "AKHTAR",      state: "owned" },
    { n: "032", name: "PETROVIĆ",    state: "dupe"  },
    { n: "033", name: "—",           state: "empty" },
    { n: "034", name: "HOLM",        state: "owned" },
    { n: "035", name: "SABATIER",    state: "owned" },
  ],
};

// ─────────────────────── tickets ───────────────────────
GC.tickets = [
  { id: "T-7821", match: "Atlantica × Durango", phase: "Group A · MD2", stadium: "Arena Aurora", section: "Norte · 214", seat: "Row 12 · Seat 7", date: "Jun 12, 20:00", status: "Active" },
  { id: "T-7822", match: "Esperanza × Galicia", phase: "Group B · MD3", stadium: "Estadio Alma", section: "Sur · 108", seat: "Row 4 · Seat 22", date: "Jun 13, 17:00", status: "Pending" },
  { id: "T-7619", match: "Borealis × Carpathia", phase: "Group A · MD2", stadium: "Polar Bowl", section: "Oeste · 322", seat: "Row 19 · Seat 3", date: "Jun 12, 16:00", status: "Transferred" },
];

// ─────────────────────── moments / stats highlights ───────────────────────
GC.moments = [
  { time: "MIN 67",  title: "Olabode brace",         body: "Half-volley from 22 yards. xG 0.09 — outside the box, inside the post.", match: "Atlantica 2–1 Durango", tag: "GOAL" },
  { time: "MIN 32",  title: "Wall save",             body: "Akinola pushes the bender onto the bar. Velocity 102 km/h, swerve 2.4 m.", match: "Joriba 0–0 Lumeria",    tag: "SAVE" },
  { time: "MIN 24",  title: "Pressing trap",         body: "Esperanza recover possession 38 m from goal — 7 sequences ending in shots.", match: "Esperanza × Galicia", tag: "STAT" },
  { time: "FT",      title: "Polar Bowl thriller",   body: "Five goals, two woodwork, one disallowed. Borealis steal it at 89'.",       match: "Borealis 3–2 Carpathia", tag: "RECAP" },
];

GC.broadcastStats = [
  { label: "MATCHES PLAYED",   value: "32",   change: "+8 today",   color: "ink"  },
  { label: "GOALS SCORED",     value: "94",   change: "2.9 per match", color: "red" },
  { label: "AVG. POSSESSION",  value: "51.3%", change: "Home advantage", color: "ink" },
  { label: "BOOKINGS",         value: "147",  change: "12 reds",       color: "ink" },
];

// ─────────────────────── stadium / cities ───────────────────────
GC.cities = [
  { city: "Norden",     stadium: "Arena Aurora",    cap: "72,400", host: ["ATL","DUR","BOR"] },
  { city: "Porto Mare", stadium: "Coliseu Mare",    cap: "55,800", host: ["INK","KAL","LUM"] },
  { city: "Brava",      stadium: "Estadio Alma",    cap: "68,100", host: ["ESP","GAL","HEL"] },
  { city: "Cima",       stadium: "Velódromo Cima",  cap: "49,300", host: ["MER","NOV","PAR"] },
  { city: "Vesna",      stadium: "Estadio Norte",   cap: "61,200", host: ["QUI","RHO","TER"] },
  { city: "Stahlfeld",  stadium: "Stadtarena",      cap: "82,000", host: ["URS","WIN","XAN"] },
];

// ─────────────────────── countdown target ───────────────────────
// Next match kickoff target: set 1d 4h from "now" so countdown ticks
GC.nextKickoff = () => {
  const t = new Date();
  t.setHours(t.getHours() + 28, t.getMinutes() + 12, 0, 0);
  return t;
};

// ─────────────────────── tournament tagline rotation ───────────────────────
GC.taglines = [
  "Feel Every Match",
  "Where the World Competes",
  "Every Match. Every Moment.",
  "Live the Global Cup",
];
