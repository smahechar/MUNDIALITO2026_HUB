// data-fixture.js
// Extends window.GC with match events, lineups, stats, stadium details.
// Loaded after data.js.

(function () {
  const G = window.GC;
  if (!G) return;

  // ───────── stadium details (extend cities) ─────────
  const stadiumDetail = {
    "Arena Aurora":   { city: "Norden",     country: "Borealis",  cap: 72400, surface: "Hybrid grass",  opened: 2018, roof: "Retractable" },
    "Coliseu Mare":   { city: "Porto Mare", country: "Lumeria",   cap: 55800, surface: "Natural",       opened: 2009, roof: "Open" },
    "Estadio Alma":   { city: "Brava",      country: "Esperanza", cap: 68100, surface: "Hybrid grass",  opened: 2014, roof: "Open" },
    "Velódromo Cima": { city: "Cima",       country: "Meridian",  cap: 49300, surface: "Natural",       opened: 1998, roof: "Open" },
    "Estadio Norte":  { city: "Vesna",      country: "Quintara",  cap: 61200, surface: "Natural",       opened: 2006, roof: "Partial" },
    "Stadtarena":     { city: "Stahlfeld",  country: "Ursalia",   cap: 82000, surface: "Hybrid grass",  opened: 2021, roof: "Closed" },
    "Polar Bowl":     { city: "Bjarki",     country: "Borealis",  cap: 64500, surface: "Synthetic",     opened: 2003, roof: "Domed" },
  };
  G.stadiums = stadiumDetail;

  // ───────── expand matches: add full slate across 6 groups, MD1-MD3 ─────────
  const baseKickoff = new Date();
  baseKickoff.setDate(baseKickoff.getDate() - 1);
  baseKickoff.setHours(13, 0, 0, 0);

  const offsetHours = (h) => {
    const d = new Date(baseKickoff);
    d.setTime(d.getTime() + h * 3600 * 1000);
    return d.toISOString();
  };

  // augment existing matches and add additional ones
  // we'll keep G.matches as the canonical list — extend if shorter
  const existing = G.matches;
  const stadiumCities = [
    ["Arena Aurora", "Norden"],
    ["Coliseu Mare", "Porto Mare"],
    ["Estadio Alma", "Brava"],
    ["Velódromo Cima", "Cima"],
    ["Estadio Norte", "Vesna"],
    ["Stadtarena", "Stahlfeld"],
    ["Polar Bowl", "Bjarki"],
  ];

  // additional matches across all MDs and groups
  const extras = [
    { id: "m9",  home: "DUR", away: "BOR", group: "A", phase: "Group A · MD3", status: "upcoming", hOff: 24 },
    { id: "m10", home: "CAR", away: "ATL", group: "A", phase: "Group A · MD3", status: "upcoming", hOff: 27 },
    { id: "m11", home: "HEL", away: "FRJ", group: "B", phase: "Group B · MD3", status: "upcoming", hOff: 30 },
    { id: "m12", home: "GAL", away: "HEL", group: "B", phase: "Group B · MD2", status: "final",    hOff: -22, hs: 1, as: 0 },
    { id: "m13", home: "ESP", away: "FRJ", group: "B", phase: "Group B · MD2", status: "final",    hOff: -19, hs: 2, as: 2 },
    { id: "m14", home: "KAL", away: "LUM", group: "C", phase: "Group C · MD3", status: "upcoming", hOff: 36 },
    { id: "m15", home: "JOR", away: "INK", group: "C", phase: "Group C · MD3", status: "upcoming", hOff: 39 },
    { id: "m16", home: "PAR", away: "NOV", group: "D", phase: "Group D · MD2", status: "final",    hOff: -25, hs: 1, as: 1 },
    { id: "m17", home: "ORY", away: "MER", group: "D", phase: "Group D · MD2", status: "final",    hOff: -28, hs: 0, as: 2 },
    { id: "m18", home: "RHO", away: "SAB", group: "E", phase: "Group E · MD3", status: "upcoming", hOff: 42 },
    { id: "m19", home: "QUI", away: "RHO", group: "E", phase: "Group E · MD2", status: "final",    hOff: -30, hs: 0, as: 0 },
    { id: "m20", home: "WIN", away: "XAN", group: "F", phase: "Group F · MD2", status: "final",    hOff: -33, hs: 3, as: 1 },
    { id: "m21", home: "URS", away: "XAN", group: "F", phase: "Group F · MD3", status: "upcoming", hOff: 45 },
  ];

  extras.forEach((m, i) => {
    const [stadium, city] = stadiumCities[i % stadiumCities.length];
    G.matches.push({
      id: m.id, home: m.home, away: m.away, group: m.group, phase: m.phase,
      stadium, city, kickoff: offsetHours(m.hOff),
      status: m.status,
      minute: m.status === "final" ? "FT" : null,
      homeScore: m.status === "final" ? (m.hs ?? 0) : null,
      awayScore: m.status === "final" ? (m.as ?? 0) : null,
    });
  });

  // ───────── match detail data (events, lineups, stats) ─────────
  G.matchDetail = {};

  // helper to build event chain
  const ev = (minute, type, team, player, detail = "") => ({ minute, type, team, player, detail });

  // m1 — Atlantica 2-1 Durango (LIVE 67')
  G.matchDetail["m1"] = {
    events: [
      ev("14'", "goal",   "home", "L. Marín",   "Penalty · won by Vidal"),
      ev("23'", "yellow", "away", "A. Costa",   "Tactical foul · 32m"),
      ev("38'", "goal",   "away", "M. Silva",   "Header · Costa corner"),
      ev("46'", "kickoff","-",    "—",          "Second half"),
      ev("56'", "goal",   "home", "K. Bilic",   "Long range · 24m"),
      ev("61'", "sub",    "home", "Vidal ↔ Tannenbaum", ""),
      ev("64'", "yellow", "home", "Bilic",      "Late challenge"),
    ],
    stats: {
      possession: [54, 46], shots: [12, 8], shotsOnTarget: [6, 3],
      passes: [421, 358], passAccuracy: [87, 82],
      corners: [5, 3], fouls: [8, 11], offsides: [2, 1],
      cards: [{ yellow: 1, red: 0 }, { yellow: 1, red: 0 }],
    },
    lineupHome: {
      formation: "4-3-3",
      manager: "C. Vargas",
      eleven: [
        { num: 1,  name: "A. Mendez", pos: "GK" },
        { num: 2,  name: "R. Holm",   pos: "DF" },
        { num: 4,  name: "J. Park",   pos: "DF" },
        { num: 5,  name: "S. Oduya",  pos: "DF" },
        { num: 3,  name: "T. Reyes",  pos: "DF" },
        { num: 6,  name: "K. Bilic",  pos: "MF" },
        { num: 8,  name: "L. Marín",  pos: "MF" },
        { num: 10, name: "D. Vidal",  pos: "MF" },
        { num: 7,  name: "M. Yusupov",pos: "FW" },
        { num: 9,  name: "F. Rojas",  pos: "FW" },
        { num: 11, name: "P. Sato",   pos: "FW" },
      ],
    },
    lineupAway: {
      formation: "4-2-3-1",
      manager: "H. Petrov",
      eleven: [
        { num: 1,  name: "G. Stein",  pos: "GK" },
        { num: 2,  name: "B. Kovacs", pos: "DF" },
        { num: 4,  name: "I. Cruz",   pos: "DF" },
        { num: 5,  name: "N. Larsson",pos: "DF" },
        { num: 3,  name: "C. Diallo", pos: "DF" },
        { num: 6,  name: "M. Silva",  pos: "MF" },
        { num: 8,  name: "A. Costa",  pos: "MF" },
        { num: 10, name: "E. Tanaka", pos: "MF" },
        { num: 7,  name: "J. Adeola", pos: "MF" },
        { num: 11, name: "V. Petric", pos: "MF" },
        { num: 9,  name: "R. Banda",  pos: "FW" },
      ],
    },
    h2h: [
      { date: "2024-09-15", phase: "Friendly",         result: "1–1", you: "D" },
      { date: "2023-06-02", phase: "Qual. R3",         result: "2–0", you: "W" },
      { date: "2022-11-19", phase: "Friendly",         result: "0–1", you: "L" },
      { date: "2021-04-08", phase: "Qual. R1",         result: "3–2", you: "W" },
      { date: "2020-10-23", phase: "Friendly",         result: "1–0", you: "W" },
    ],
    formHome: ["W","W","D","W","L"],
    formAway: ["L","D","W","L","D"],
    weather: { temp: 22, cond: "Clear", wind: "8 km/h NE", humidity: "54%" },
    attendance: "71,820",
    referee: "M. Olivares (Carpathia)",
    var: "A. Lindqvist",
  };

  // m4 — Esperanza × Galicia (UPCOMING)
  G.matchDetail["m4"] = {
    events: [],
    stats: null,
    lineupHome: {
      formation: "4-3-3",
      manager: "I. Reis",
      eleven: [
        { num: 1, name: "T. Nasri",     pos: "GK" },
        { num: 2, name: "R. Andrade",   pos: "DF" },
        { num: 4, name: "P. Sandström", pos: "DF" },
        { num: 5, name: "L. Mbeki",     pos: "DF" },
        { num: 3, name: "K. Walsh",     pos: "DF" },
        { num: 6, name: "G. Ferro",     pos: "MF" },
        { num: 8, name: "M. Costa",     pos: "MF" },
        { num: 10,name: "S. Lima",      pos: "MF" },
        { num: 7, name: "B. Yáñez",     pos: "FW" },
        { num: 9, name: "A. Brun",      pos: "FW" },
        { num: 11,name: "J. Otieno",    pos: "FW" },
      ],
    },
    lineupAway: {
      formation: "3-5-2",
      manager: "Á. Lozano",
      eleven: [
        { num: 1, name: "F. Müller",    pos: "GK" },
        { num: 4, name: "E. Karim",     pos: "DF" },
        { num: 5, name: "N. Otsuki",    pos: "DF" },
        { num: 6, name: "T. Vasquez",   pos: "DF" },
        { num: 8, name: "K. Ahmadi",    pos: "MF" },
        { num: 10,name: "R. Singh",     pos: "MF" },
        { num: 14,name: "D. Lefevre",   pos: "MF" },
        { num: 7, name: "J. Holm",      pos: "MF" },
        { num: 11,name: "M. Eze",       pos: "MF" },
        { num: 9, name: "L. Saric",     pos: "FW" },
        { num: 17,name: "P. Bauer",     pos: "FW" },
      ],
    },
    h2h: [
      { date: "2025-03-21", phase: "Qual. PO", result: "2–1", you: "W" },
      { date: "2024-08-09", phase: "Friendly", result: "0–0", you: "D" },
      { date: "2023-11-12", phase: "Qual. R2", result: "1–2", you: "L" },
    ],
    formHome: ["W","D","W","W","D"],
    formAway: ["D","W","L","W","W"],
    predictions: { homeWin: 38, draw: 27, awayWin: 35 },
    weather: { temp: 19, cond: "Cloudy", wind: "12 km/h SW", humidity: "62%" },
  };

  // m6 — Borealis 3-2 Carpathia (FINAL)
  G.matchDetail["m6"] = {
    events: [
      ev("8'",  "goal",   "home", "L. Tannenbaum", "Solo run · cuts inside"),
      ev("19'", "yellow", "away", "A. Petrović",   ""),
      ev("31'", "goal",   "away", "A. Petrović",   "Volley · 18m"),
      ev("44'", "goal",   "home", "L. Tannenbaum", "Free kick · 24m"),
      ev("46'", "kickoff","-",    "—",             "Second half"),
      ev("58'", "sub",    "home", "Erikson ↔ Adeyemi", ""),
      ev("66'", "goal",   "away", "T. Dragan",     "Counter · slotted in"),
      ev("73'", "yellow", "home", "R. Marek",      ""),
      ev("89'", "goal",   "home", "L. Adeyemi",    "Sub heroics · header"),
      ev("FT",  "kickoff","-",    "—",             "Full time"),
    ],
    stats: {
      possession: [48, 52], shots: [16, 14], shotsOnTarget: [9, 6],
      passes: [378, 412], passAccuracy: [81, 84],
      corners: [7, 5], fouls: [12, 14], offsides: [3, 4],
      cards: [{ yellow: 1, red: 0 }, { yellow: 1, red: 0 }],
    },
    lineupHome: {
      formation: "4-2-3-1",
      manager: "T. Eklund",
      eleven: [
        { num: 1,  name: "S. Aaltonen", pos: "GK" },
        { num: 2,  name: "F. Karlsen",  pos: "DF" },
        { num: 4,  name: "R. Marek",    pos: "DF" },
        { num: 5,  name: "N. Vidø",     pos: "DF" },
        { num: 3,  name: "O. Jönsson",  pos: "DF" },
        { num: 6,  name: "M. Erikson",  pos: "MF" },
        { num: 8,  name: "H. Lindholm", pos: "MF" },
        { num: 10, name: "K. Norberg",  pos: "MF" },
        { num: 7,  name: "L. Tannenbaum",pos: "FW" },
        { num: 11, name: "I. Bakker",   pos: "FW" },
        { num: 9,  name: "L. Adeyemi",  pos: "FW" },
      ],
    },
    lineupAway: {
      formation: "4-3-3",
      manager: "Z. Iliescu",
      eleven: [
        { num: 1,  name: "D. Munteanu", pos: "GK" },
        { num: 2,  name: "G. Stoica",   pos: "DF" },
        { num: 4,  name: "M. Rusu",     pos: "DF" },
        { num: 5,  name: "P. Antic",    pos: "DF" },
        { num: 3,  name: "B. Vlad",     pos: "DF" },
        { num: 6,  name: "A. Petrović", pos: "MF" },
        { num: 8,  name: "T. Dragan",   pos: "MF" },
        { num: 10, name: "I. Nikolic",  pos: "MF" },
        { num: 7,  name: "S. Ferro",    pos: "FW" },
        { num: 11, name: "K. Voinescu", pos: "FW" },
        { num: 9,  name: "R. Costa",    pos: "FW" },
      ],
    },
    h2h: [
      { date: "2025-09-04", phase: "Friendly",   result: "0–0", you: "D" },
      { date: "2024-06-15", phase: "Qual. R3",   result: "2–1", you: "W" },
      { date: "2023-10-08", phase: "Friendly",   result: "1–2", you: "L" },
    ],
    formHome: ["W","L","W","D","W"],
    formAway: ["W","W","D","W","L"],
    weather: { temp: 16, cond: "Drizzle", wind: "14 km/h N", humidity: "78%" },
    attendance: "63,940",
    referee: "K. Olafsson (Fjordland)",
    var: "C. Vasquez",
  };

  // Default detail builder for matches without explicit data — minimal stub
  G.getMatchDetail = (matchId) => {
    return G.matchDetail[matchId] || {
      events: [],
      stats: null,
      lineupHome: null,
      lineupAway: null,
      h2h: [],
      formHome: ["—","—","—","—","—"],
      formAway: ["—","—","—","—","—"],
      weather: null,
      attendance: null,
      referee: null,
    };
  };

  // ───────── group dates / match days ─────────
  G.matchDays = [
    { key: "MD1", label: "MATCH DAY 1", date: "Jun 11", group: "completed" },
    { key: "MD2", label: "MATCH DAY 2", date: "Jun 12", group: "live" },
    { key: "MD3", label: "MATCH DAY 3", date: "Jun 13", group: "next" },
    { key: "MD4", label: "MATCH DAY 4", date: "Jun 17", group: "future" },
    { key: "MD5", label: "MATCH DAY 5", date: "Jun 22", group: "future" },
    { key: "R16", label: "ROUND OF 16", date: "Jun 28", group: "future" },
    { key: "QF",  label: "QUARTERS",    date: "Jul 04", group: "future" },
    { key: "SF",  label: "SEMIFINALS",  date: "Jul 10", group: "future" },
    { key: "F",   label: "FINAL",       date: "Jul 19", group: "future" },
  ];
})();
