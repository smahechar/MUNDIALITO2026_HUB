import { nations, byCode } from './nations'

export const RARITY_CFG = {
  C: { label: 'Común',      fg: 'var(--muted)',  shine: false },
  R: { label: 'Rara',       fg: '#4ab8f5',       shine: true  },
  E: { label: 'Épica',      fg: 'var(--red)',    shine: true  },
  L: { label: 'Legendaria', fg: 'var(--gold)',   shine: true  },
}

export const TEMPLATE = [
  [1,  'Escudo',        'badge',   'C'],
  [2,  'Portero',       'player',  'C'],
  [3,  'Defensa #1',   'player',  'C'],
  [4,  'Defensa #2',   'player',  'C'],
  [5,  'Mediocampista','player',  'R'],
  [6,  'Capitán',      'player',  'E'],
  [7,  'Delantero #1', 'player',  'R'],
  [8,  'Delantero #2', 'player',  'C'],
  [9,  'Estadio',      'stadium', 'R'],
  [10, 'Kit local',    'kit',     'C'],
  [11, 'Kit visitante','kit',     'C'],
  [12, 'MOMENTO',      'moment',  'L'],
]

// Build full sticker catalogue: 24 nations × 12 = 288 stickers
let _id = 1
export const allStickers = []
nations.forEach(n => {
  TEMPLATE.forEach(([slot, name, type, rarity]) => {
    allStickers.push({
      id:        `${n.code}-${String(slot).padStart(2, '0')}`,
      num:       _id++,
      nation:    n.code,
      slot,
      name:      `${n.code} · ${name}`,
      shortName: name,
      type,
      rarity,
    })
  })
})

export const albumTotal = allStickers.length

// User collection — deterministic seed: every 3rd nation complete, others partial
export const userOwned = new Set()
export const userDupes = {}

nations.forEach((n, ni) => {
  const slotsOwned = ni % 3 === 0 ? 12 : ni % 3 === 1 ? 8 : 5
  TEMPLATE.forEach(([slot]) => {
    if (slot <= slotsOwned) {
      const id = `${n.code}-${String(slot).padStart(2, '00')}`
      userOwned.add(id)
      if (slot <= 3 && ni % 4 === 0) userDupes[id] = 2
      if (slot === 1 && ni % 7 === 0) userDupes[id] = 3
    }
  })
})

export const albumOwned      = userOwned.size
export const albumDuplicates = Object.keys(userDupes).length
export const albumMissing    = albumTotal - albumOwned
export const albumPct        = Math.round((albumOwned / albumTotal) * 100)
export const albumSetsComplete = nations.filter(n =>
  TEMPLATE.every(([slot]) => userOwned.has(`${n.code}-${String(slot).padStart(2, '0')}`))
).length

// Helpers
export const getNationStickers = (code) => allStickers.filter(s => s.nation === code)
export const isOwned   = (id) => userOwned.has(id)
export const isDupe    = (id) => !!userDupes[id]
export const dupeCount = (id) => userDupes[id] || 1
export const getStickerById  = (id) => allStickers.find(s => s.id === id)
export const getDupeStickers = () => allStickers.filter(s => isDupe(s.id))

export function openPack() {
  const missing = allStickers.filter(s => !isOwned(s.id))
  const result  = []
  for (let i = 0; i < 5; i++) {
    const pool = Math.random() < 0.7 && missing.length ? missing : allStickers
    result.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return result
}

export const pendingTrades = [
  {
    id: 'tr1', with: 'Camila R.', withHandle: '@camila304',
    offered:   ['JOR-01', 'ATL-05', 'BOR-12'],
    requested: ['ESP-06', 'GAL-09'],
    status: 'pending', createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'tr2', with: 'Andrés P.', withHandle: '@andres_p',
    offered:   ['INK-01'],
    requested: ['JOR-06'],
    status: 'confirmed', createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tr3', with: 'Daniela M.', withHandle: '@dani_m',
    offered:   ['CAR-01', 'DUR-11'],
    requested: ['LUM-06', 'KAL-08'],
    status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

// Re-export byCode for convenience in album components
export { byCode }
