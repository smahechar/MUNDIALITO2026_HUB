export const matches = [
  { id:"m1",  home:"ATL", away:"DUR", group:"A", stadium:"Arena Aurora",   city:"Norden",     phase:"Group A · MD2", status:"live",     minute:"67'", homeScore:2, awayScore:1, kickoff:"2026-06-12T20:00:00Z" },
  { id:"m2",  home:"JOR", away:"LUM", group:"C", stadium:"Estadio Sol",    city:"Sereno",     phase:"Group C · MD2", status:"live",     minute:"32'", homeScore:0, awayScore:0, kickoff:"2026-06-12T20:30:00Z" },
  { id:"m3",  home:"INK", away:"KAL", group:"C", stadium:"Coliseu Mare",   city:"Porto Mare", phase:"Group C · MD2", status:"halftime", minute:"HT",  homeScore:1, awayScore:1, kickoff:"2026-06-12T18:00:00Z" },
  { id:"m4",  home:"ESP", away:"GAL", group:"B", stadium:"Estadio Alma",   city:"Brava",      phase:"Group B · MD3", status:"upcoming", minute:null,  homeScore:null, awayScore:null, kickoff:"2026-06-13T17:00:00Z" },
  { id:"m5",  home:"MER", away:"PAR", group:"D", stadium:"Velódromo Cima", city:"Cima",       phase:"Group D · MD3", status:"upcoming", minute:null,  homeScore:null, awayScore:null, kickoff:"2026-06-13T20:00:00Z" },
  { id:"m6",  home:"BOR", away:"CAR", group:"A", stadium:"Polar Bowl",     city:"Bjarki",     phase:"Group A · MD2", status:"final",    minute:"FT",  homeScore:3, awayScore:2, kickoff:"2026-06-12T16:00:00Z" },
  { id:"m7",  home:"QUI", away:"TER", group:"E", stadium:"Estadio Norte",  city:"Vesna",      phase:"Group E · MD2", status:"final",    minute:"FT",  homeScore:0, awayScore:0, kickoff:"2026-06-12T13:00:00Z" },
  { id:"m8",  home:"URS", away:"WIN", group:"F", stadium:"Stadtarena",     city:"Stahlfeld",  phase:"Group F · MD2", status:"upcoming", minute:null,  homeScore:null, awayScore:null, kickoff:"2026-06-13T13:00:00Z" },
  { id:"m9",  home:"DUR", away:"BOR", group:"A", stadium:"Arena Aurora",   city:"Norden",     phase:"Group A · MD3", status:"upcoming", minute:null,  homeScore:null, awayScore:null, kickoff:"2026-06-15T20:00:00Z" },
  { id:"m10", home:"CAR", away:"ATL", group:"A", stadium:"Polar Bowl",     city:"Bjarki",     phase:"Group A · MD3", status:"upcoming", minute:null,  homeScore:null, awayScore:null, kickoff:"2026-06-15T20:00:00Z" },
  { id:"m11", home:"HEL", away:"FRJ", group:"B", stadium:"Estadio Alma",   city:"Brava",      phase:"Group B · MD3", status:"upcoming", minute:null,  homeScore:null, awayScore:null, kickoff:"2026-06-15T17:00:00Z" },
  { id:"m12", home:"GAL", away:"HEL", group:"B", stadium:"Coliseu Mare",   city:"Porto Mare", phase:"Group B · MD2", status:"final",    minute:"FT",  homeScore:1, awayScore:0, kickoff:"2026-06-11T16:00:00Z" },
]

export const moments = [
  { time:"MIN 67", title:"Olabode brace",       body:"Half-volley from 22 yards. xG 0.09 — outside the box, inside the post.", match:"Atlantica 2–1 Durango",   tag:"GOAL" },
  { time:"MIN 32", title:"Wall save",            body:"Akinola pushes the bender onto the bar. Velocity 102 km/h, swerve 2.4 m.", match:"Joriba 0–0 Lumeria",    tag:"SAVE" },
  { time:"MIN 24", title:"Pressing trap",        body:"Esperanza recover possession 38 m from goal — 7 sequences ending in shots.", match:"Esperanza × Galicia", tag:"STAT" },
  { time:"FT",     title:"Polar Bowl thriller",  body:"Five goals, two woodwork, one disallowed. Borealis steal it at 89'.", match:"Borealis 3–2 Carpathia",   tag:"RECAP" },
]

export const scorers = [
  { rank:1, name:"K. Olabode",    nation:"JOR", goals:5, assists:2, mins:270, role:"Striker"  },
  { rank:2, name:"M. Costa",      nation:"ESP", goals:4, assists:3, mins:270, role:"Forward"  },
  { rank:3, name:"L. Tannenbaum", nation:"BOR", goals:4, assists:1, mins:195, role:"Striker"  },
  { rank:4, name:"S. Vidal",      nation:"PAR", goals:3, assists:2, mins:270, role:"Winger"   },
  { rank:5, name:"A. Petrović",   nation:"CAR", goals:3, assists:0, mins:240, role:"Forward"  },
  { rank:6, name:"R. Akhtar",     nation:"INK", goals:2, assists:4, mins:270, role:"Midfield" },
]

export const nextKickoff = () => {
  const t = new Date()
  t.setHours(t.getHours() + 28, t.getMinutes() + 12, 0, 0)
  return t
}

// Match day scrubber (top interactive bar)
export const matchDays = [
  { key:"MD1", label:"MATCH DAY 1", date:"Jun 11", group:"completed" },
  { key:"MD2", label:"MATCH DAY 2", date:"Jun 12", group:"live" },
  { key:"MD3", label:"MATCH DAY 3", date:"Jun 13", group:"next" },
  { key:"MD4", label:"MATCH DAY 4", date:"Jun 17", group:"future" },
  { key:"MD5", label:"MATCH DAY 5", date:"Jun 22", group:"future" },
  { key:"R16", label:"ROUND OF 16", date:"Jun 28", group:"future" },
  { key:"QF",  label:"QUARTERS",    date:"Jul 04", group:"future" },
  { key:"SF",  label:"SEMIFINALS",  date:"Jul 10", group:"future" },
  { key:"F",   label:"FINAL",       date:"Jul 19", group:"future" },
]

// Stadium details (host venues)
export const stadiums = {
  "Arena Aurora":   { city:"Norden",     country:"Borealis",  cap:72400, surface:"Hybrid grass", opened:2018, roof:"Retractable" },
  "Coliseu Mare":   { city:"Porto Mare", country:"Lumeria",   cap:55800, surface:"Natural",      opened:2009, roof:"Open" },
  "Estadio Alma":   { city:"Brava",      country:"Esperanza", cap:68100, surface:"Hybrid grass", opened:2014, roof:"Open" },
  "Velódromo Cima": { city:"Cima",       country:"Meridian",  cap:49300, surface:"Natural",      opened:1998, roof:"Open" },
  "Estadio Norte":  { city:"Vesna",      country:"Quintara",  cap:61200, surface:"Natural",      opened:2006, roof:"Partial" },
  "Stadtarena":     { city:"Stahlfeld",  country:"Ursalia",   cap:82000, surface:"Hybrid grass", opened:2021, roof:"Closed" },
  "Polar Bowl":     { city:"Bjarki",     country:"Borealis",  cap:64500, surface:"Synthetic",    opened:2003, roof:"Domed" },
  "Estadio Sol":    { city:"Sereno",     country:"Joriba",    cap:58000, surface:"Natural",      opened:2011, roof:"Open" },
}
