// data-pools.js
// Extends window.GC with pool members, prediction history, points timeline,
// champion pick, scoring rules. Loaded after data-fixture.js.

(function () {
  const G = window.GC;
  if (!G) return;

  G.you = { id: "you", name: "Tú", handle: "@tu", joined: "2026-05-12" };

  // ───────── scoring rules ─────────
  G.scoringRules = [
    { id: "exact",       label: "Marcador exacto",         pts: 30, desc: "Aciertas el resultado completo · ej. 2-1 → 2-1" },
    { id: "diff",        label: "Diferencia de goles",      pts: 15, desc: "Aciertas la diferencia exacta · ej. ganó por 2" },
    { id: "winner",      label: "Ganador",                  pts: 10, desc: "Aciertas quién gana o empate, sin marcador" },
    { id: "doubleDown",  label: "Pick doble",               pts: "×2", desc: "Multiplica los puntos. Sólo 3 por torneo." },
    { id: "champion",    label: "Bono campeón",             pts: 100, desc: "Si tu campeón gana el torneo · una sola predicción" },
    { id: "topScorer",   label: "Bono goleador",            pts: 50, desc: "Si tu elección gana el botín de oro" },
  ];

  // ───────── pool members (full leaderboards) ─────────
  // p1 = Aula 304, p2 = Familia Buitrago, p3 = Global Casuales
  G.poolMembers = {
    p1: [
      { id: "u1",  name: "Camila R.",     pts: 184, exact: 3, winner: 8, lastChange:  0, hot: true },
      { id: "u2",  name: "Mauricio O.",   pts: 178, exact: 2, winner: 9, lastChange: +1, hot: true },
      { id: "u3",  name: "Andrés P.",     pts: 168, exact: 2, winner: 8, lastChange: -1, hot: false },
      { id: "you", name: "Tú",            pts: 162, exact: 2, winner: 7, lastChange: +2, hot: true, isYou: true },
      { id: "u4",  name: "Luis F.",       pts: 156, exact: 1, winner: 8, lastChange:  0, hot: false },
      { id: "u5",  name: "Daniela M.",    pts: 148, exact: 1, winner: 7, lastChange: -2, hot: false },
      { id: "u6",  name: "Sebastián G.",  pts: 142, exact: 1, winner: 7, lastChange: +1, hot: true },
      { id: "u7",  name: "Carolina V.",   pts: 138, exact: 0, winner: 7, lastChange: -1, hot: false },
      { id: "u8",  name: "Felipe O.",     pts: 134, exact: 1, winner: 6, lastChange:  0, hot: false },
      { id: "u9",  name: "Diego B.",      pts: 128, exact: 0, winner: 6, lastChange: +3, hot: true },
      { id: "u10", name: "Valentina T.",  pts: 122, exact: 0, winner: 6, lastChange: -1, hot: false },
      { id: "u11", name: "Juan M.",       pts: 118, exact: 1, winner: 5, lastChange:  0, hot: false },
      { id: "u12", name: "Paola H.",      pts: 114, exact: 0, winner: 5, lastChange: -2, hot: false },
      { id: "u13", name: "Esteban R.",    pts: 108, exact: 0, winner: 5, lastChange: +1, hot: false },
      { id: "u14", name: "Mariana C.",    pts: 102, exact: 0, winner: 5, lastChange: -1, hot: false },
      { id: "u15", name: "Tomás N.",      pts:  96, exact: 0, winner: 4, lastChange:  0, hot: false },
      { id: "u16", name: "Luisa K.",      pts:  92, exact: 0, winner: 4, lastChange: +2, hot: false },
      { id: "u17", name: "Bruno S.",      pts:  88, exact: 0, winner: 4, lastChange: -1, hot: false },
      { id: "u18", name: "Lucía E.",      pts:  82, exact: 0, winner: 4, lastChange:  0, hot: false },
      { id: "u19", name: "Rafael A.",     pts:  76, exact: 0, winner: 3, lastChange: -2, hot: false },
      { id: "u20", name: "Isabella D.",   pts:  72, exact: 0, winner: 3, lastChange:  0, hot: false },
      { id: "u21", name: "Pablo Q.",      pts:  68, exact: 0, winner: 3, lastChange: +1, hot: false },
      { id: "u22", name: "Antonia L.",    pts:  62, exact: 0, winner: 3, lastChange: -1, hot: false },
      { id: "u23", name: "Joaquín W.",    pts:  56, exact: 0, winner: 2, lastChange:  0, hot: false },
      { id: "u24", name: "Sara Y.",       pts:  48, exact: 0, winner: 2, lastChange:  0, hot: false },
      { id: "u25", name: "Nicolás I.",    pts:  42, exact: 0, winner: 2, lastChange: -3, hot: false },
      { id: "u26", name: "Renata P.",     pts:  38, exact: 0, winner: 1, lastChange:  0, hot: false },
      { id: "u27", name: "Hugo X.",       pts:  24, exact: 0, winner: 1, lastChange:  0, hot: false },
    ],
    p2: [
      { id: "you",   name: "Tú",          pts: 142, exact: 3, winner: 5, lastChange:  0, hot: true, isYou: true },
      { id: "f1",    name: "María B.",    pts: 128, exact: 2, winner: 5, lastChange:  0, hot: false },
      { id: "f2",    name: "Andrea B.",   pts: 124, exact: 1, winner: 6, lastChange: +1, hot: true },
      { id: "f3",    name: "Carlos B.",   pts: 118, exact: 1, winner: 5, lastChange: -1, hot: false },
      { id: "f4",    name: "José M.",     pts: 112, exact: 0, winner: 6, lastChange:  0, hot: false },
      { id: "f5",    name: "Tía Rosa",    pts: 102, exact: 0, winner: 5, lastChange: +1, hot: false },
      { id: "f6",    name: "Tío Hugo",    pts:  96, exact: 1, winner: 3, lastChange: -1, hot: false },
      { id: "f7",    name: "Sofía B.",    pts:  88, exact: 0, winner: 4, lastChange:  0, hot: false },
      { id: "f8",    name: "Mateo B.",    pts:  74, exact: 0, winner: 3, lastChange: -2, hot: false },
    ],
    p3: [
      // top of global
      { id: "g1",  name: "Adrian K.",   pts: 226, exact: 5, winner: 11, lastChange:  0, hot: true },
      { id: "g2",  name: "Mei L.",      pts: 218, exact: 4, winner: 11, lastChange: +1, hot: true },
      { id: "g3",  name: "Oluwa B.",    pts: 214, exact: 4, winner: 10, lastChange: -1, hot: false },
      { id: "g4",  name: "Sven E.",     pts: 208, exact: 3, winner: 11, lastChange:  0, hot: false },
      { id: "g5",  name: "Laila K.",    pts: 202, exact: 4, winner:  9, lastChange: +2, hot: true },
      { id: "g6",  name: "Pedro V.",    pts: 196, exact: 3, winner: 10, lastChange:  0, hot: false },
      { id: "g7",  name: "Aiko T.",     pts: 192, exact: 2, winner: 11, lastChange: -1, hot: false },
      { id: "g8",  name: "Marcus J.",   pts: 188, exact: 3, winner:  9, lastChange:  0, hot: false },
      // ... your row near 612 of 4218
      { id: "you", name: "Tú",          pts: 178, exact: 2, winner:  8, lastChange: +14, hot: true, isYou: true, rank: 612 },
      // some context around your row
      { id: "g613",name: "Yusuf D.",    pts: 178, exact: 2, winner:  8, lastChange:  0, hot: false, rank: 613 },
      { id: "g614",name: "Inés P.",     pts: 176, exact: 1, winner:  9, lastChange: +3, hot: false, rank: 614 },
      { id: "g615",name: "Hans O.",     pts: 176, exact: 2, winner:  8, lastChange: -2, hot: false, rank: 615 },
    ],
  };

  // ───────── user predictions (mix of open / live / settled) ─────────
  G.userPredictions = [
    // OPEN — locked at kickoff
    { id: "pr1", matchId: "m4",  home: 2, away: 1, status: "open", pts: 30, doubleDown: false, locksAt: "1d 04h" },
    { id: "pr2", matchId: "m5",  home: 1, away: 1, status: "open", pts: 30, doubleDown: false, locksAt: "1d 08h" },
    { id: "pr3", matchId: "m8",  home: null, away: null, status: "open", pts: 30, doubleDown: false, locksAt: "0d 18h" },
    { id: "pr4", matchId: "m9",  home: 2, away: 0, status: "open", pts: 30, doubleDown: true,  locksAt: "1d 12h" },
    { id: "pr5", matchId: "m11", home: 1, away: 2, status: "open", pts: 30, doubleDown: false, locksAt: "1d 18h" },

    // LIVE — match in progress, your prediction vs current state
    { id: "pr6", matchId: "m1",  home: 1, away: 0, status: "live", pts: null, currentPts: 10, doubleDown: false, note: "Ganador acertado" },
    { id: "pr7", matchId: "m2",  home: 0, away: 1, status: "live", pts: null, currentPts: 0,  doubleDown: false, note: "Aún empatado" },

    // SETTLED — past matches with scored points
    { id: "pr8", matchId: "m6",  home: 3, away: 2, status: "settled", pts: 30, kind: "exact",  doubleDown: false, note: "Marcador exacto" },
    { id: "pr9", matchId: "m7",  home: 0, away: 0, status: "settled", pts: 30, kind: "exact",  doubleDown: false, note: "Empate sin goles" },
    { id: "pr10",matchId: "m12", home: 2, away: 0, status: "settled", pts: 15, kind: "diff",   doubleDown: false, note: "Diferencia acertada" },
    { id: "pr11",matchId: "m13", home: 1, away: 1, status: "settled", pts: 30, kind: "exact",  doubleDown: false, note: "Marcador exacto" },
    { id: "pr12",matchId: "m16", home: 2, away: 1, status: "settled", pts: 10, kind: "winner", doubleDown: false, note: "Sólo ganador" },
    { id: "pr13",matchId: "m17", home: 1, away: 1, status: "settled", pts:  0, kind: "miss",   doubleDown: false, note: "Fallaste" },
    { id: "pr14",matchId: "m19", home: 0, away: 0, status: "settled", pts: 30, kind: "exact",  doubleDown: false, note: "Marcador exacto" },
    { id: "pr15",matchId: "m20", home: 2, away: 1, status: "settled", pts: 10, kind: "winner", doubleDown: false, note: "Sólo ganador" },
  ];

  // ───────── points timeline (per match day) ─────────
  G.pointsTimeline = [
    { md: "MD1", pts: 70, total: 70  },
    { md: "MD2", pts: 92, total: 162 },
    { md: "MD3", pts: 0,  total: 162, pending: true },
    { md: "MD4", pts: 0,  total: 162, future: true },
    { md: "MD5", pts: 0,  total: 162, future: true },
    { md: "R16", pts: 0,  total: 162, future: true },
    { md: "QF",  pts: 0,  total: 162, future: true },
    { md: "SF",  pts: 0,  total: 162, future: true },
    { md: "F",   pts: 0,  total: 162, future: true },
  ];

  // ───────── special bonus picks ─────────
  G.specialPicks = {
    champion: { nation: "ATL",                    pickedAt: "2026-05-01", reward: 100, status: "alive" },
    runnerUp: { nation: "BOR",                    pickedAt: "2026-05-01", reward:  40, status: "alive" },
    topScorer:{ player: "K. Olabode", nation: "JOR", goalsNow: 5, pickedAt: "2026-05-01", reward: 50, status: "leading" },
    darkHorse:{ nation: "JOR",                    pickedAt: "2026-05-01", reward:  60, status: "alive", note: "Si llega a semifinal" },
  };

  // ───────── discover (public pools you could join) ─────────
  G.discoverPools = [
    { id: "d1", code: "BIENESTAR",  name: "Bienestar Universitario",  members: 412,  prize: "Camiseta oficial",        host: "Univ. El Bosque" },
    { id: "d2", code: "INGSYS",     name: "Ingenieros de Sistemas",   members: 1184, prize: "Suscripción premium",     host: "Facultad" },
    { id: "d3", code: "ALUMNI",     name: "Alumni 2024 · 2025",       members:  238, prize: "Cena de exalumnos",        host: "Asociación" },
    { id: "d4", code: "LATAM",      name: "Latam · Casuales",         members: 8920, prize: "Bragging rights",          host: "Comunidad" },
    { id: "d5", code: "WORKMATES",  name: "Equipo de Marketing",      members:   42, prize: "Día libre",                host: "Privada" },
    { id: "d6", code: "DEFAULT",    name: "Global · Hub",             members: 18420,prize: "Top 100 → camiseta firmada",host: "Oficial" },
  ];

  // ───────── pool extension: code/prize/closesIn already on G.pools; add hostType ─────────
  G.pools.forEach(p => {
    p.hostType  = p.id === "p1" ? "Universidad"
                : p.id === "p2" ? "Familia"
                : "Global";
    p.startedAt = "2026-06-10";
    p.maxBonus  = 3; // double-down picks remaining
    p.usedBonus = p.id === "p1" ? 1 : 0;
  });

  // ───────── helper ─────────
  G.getPool = (id) => G.pools.find(p => p.id === id);
  G.getMembers = (poolId) => G.poolMembers[poolId] || [];
  G.getPrediction = (matchId) => G.userPredictions.find(p => p.matchId === matchId);
})();
