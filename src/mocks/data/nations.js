export const nations = [
  { code: "ATL", name: "Atlantica",  group: "A", colors: ["#1a4ed1","#ffffff","#d6362a"], layout: "v" },
  { code: "BOR", name: "Borealis",   group: "A", colors: ["#0e3b2a","#f4b500","#0e3b2a"], layout: "h" },
  { code: "CAR", name: "Carpathia",  group: "A", colors: ["#d6362a","#0c0c0d","#f4b500"], layout: "v" },
  { code: "DUR", name: "Durango",    group: "A", colors: ["#0c0c0d","#d6362a","#ffffff"], layout: "h" },
  { code: "ESP", name: "Esperanza",  group: "B", colors: ["#0e3b2a","#ffffff","#d6362a"], layout: "diag" },
  { code: "FRJ", name: "Fjordland",  group: "B", colors: ["#1a6ee0","#ffffff","#1a6ee0"], layout: "h" },
  { code: "GAL", name: "Galicia",    group: "B", colors: ["#f4b500","#0c0c0d","#f4b500"], layout: "v" },
  { code: "HEL", name: "Helvetia",   group: "B", colors: ["#d6362a","#ffffff","#d6362a"], layout: "cross" },
  { code: "INK", name: "Inkala",     group: "C", colors: ["#7c3aff","#f4b500","#0c0c0d"], layout: "v" },
  { code: "JOR", name: "Joriba",     group: "C", colors: ["#0e3b2a","#f4b500","#d6362a"], layout: "h" },
  { code: "KAL", name: "Kalandra",   group: "C", colors: ["#1a6ee0","#ffffff","#f4b500"], layout: "diag" },
  { code: "LUM", name: "Lumeria",    group: "C", colors: ["#ffffff","#1a6ee0","#d6362a"], layout: "h" },
  { code: "MER", name: "Meridian",   group: "D", colors: ["#0c0c0d","#f4b500","#0c0c0d"], layout: "v" },
  { code: "NOV", name: "Novara",     group: "D", colors: ["#d6362a","#f4b500","#0e3b2a"], layout: "v" },
  { code: "ORY", name: "Oryana",     group: "D", colors: ["#1a6ee0","#d6362a","#ffffff"], layout: "h" },
  { code: "PAR", name: "Parana",     group: "D", colors: ["#0e3b2a","#ffffff","#f4b500"], layout: "diag" },
  { code: "QUI", name: "Quintara",   group: "E", colors: ["#7c3aff","#ffffff","#0c0c0d"], layout: "h" },
  { code: "RHO", name: "Rhodian",    group: "E", colors: ["#d6362a","#ffffff","#1a6ee0"], layout: "v" },
  { code: "SAB", name: "Sabinia",    group: "E", colors: ["#f4b500","#d6362a","#0c0c0d"], layout: "diag" },
  { code: "TER", name: "Terramar",   group: "E", colors: ["#0e3b2a","#1a6ee0","#0e3b2a"], layout: "h" },
  { code: "URS", name: "Ursalia",    group: "F", colors: ["#0c0c0d","#d6362a","#ffffff"], layout: "diag" },
  { code: "VAL", name: "Valdoria",   group: "F", colors: ["#ffffff","#0e3b2a","#d6362a"], layout: "v" },
  { code: "WIN", name: "Windhelm",   group: "F", colors: ["#1a6ee0","#f4b500","#ffffff"], layout: "h" },
  { code: "XAN", name: "Xandar",     group: "F", colors: ["#7c3aff","#0c0c0d","#f4b500"], layout: "v" },
]

export const byCode = Object.fromEntries(nations.map(n => [n.code, n]))

export const groups = ["A","B","C","D","E","F"].map(g => {
  const teams = nations.filter(n => n.group === g)
  const seed = g.charCodeAt(0)
  return {
    name: g,
    teams: teams.map((t, i) => {
      const pl = 2, w = (seed + i) % 3, d = ((seed + i*2) % 2), l = pl - w - d
      const gf = w*2 + d, ga = l*2
      return { code: t.code, name: t.name, played: pl, w, d, l, gf, ga, gd: gf - ga, pts: w*3 + d }
    }).sort((a,b) => b.pts - a.pts || b.gd - a.gd),
  }
})
