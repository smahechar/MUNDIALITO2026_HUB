// Datos del usuario autenticado y sus activos
export const currentUser = {
  id: 'you', name: 'Martín', handle: '@martin', timezone: 'UTC-5',
  favoriteTeams: ['ESP','BOR'], city: 'Bogotá',
}

export const album = {
  total: 540, owned: 312, duplicates: 47, trades: 6,
  pctComplete: 58,
  sample: [
    { n:'024', name:'OLABODE',     state:'shine' },
    { n:'025', name:'ADEYEMI',     state:'owned' },
    { n:'026', name:'TANNENBAUM',  state:'owned' },
    { n:'027', name:'—',           state:'empty' },
    { n:'028', name:'VIDAL',       state:'dupe'  },
    { n:'029', name:'COSTA',       state:'owned' },
    { n:'030', name:'—',           state:'empty' },
    { n:'031', name:'AKHTAR',      state:'owned' },
    { n:'032', name:'PETROVIĆ',    state:'dupe'  },
    { n:'033', name:'—',           state:'empty' },
    { n:'034', name:'HOLM',        state:'owned' },
    { n:'035', name:'SABATIER',    state:'owned' },
  ],
  activeTrade: { withUser:'Camila R.', give:{n:'028',name:'VIDAL'}, receive:{n:'142',name:'HOLM'}, expiresIn:'02h' },
  nextPackIn: '02:14:38',
}

export const tickets = [
  { id:'T-7821', match:'Atlantica × Durango',  phase:'Group A · MD2', stadium:'Arena Aurora',   section:'Norte · 214',  seat:'Row 12 · Seat 7',  date:'Jun 12, 20:00', status:'Active'      },
  { id:'T-7822', match:'Esperanza × Galicia',  phase:'Group B · MD3', stadium:'Estadio Alma',   section:'Sur · 108',    seat:'Row 4 · Seat 22',  date:'Jun 13, 17:00', status:'Pending'     },
  { id:'T-7619', match:'Borealis × Carpathia', phase:'Group A · MD2', stadium:'Polar Bowl',     section:'Oeste · 322',  seat:'Row 19 · Seat 3',  date:'Jun 12, 16:00', status:'Transferred' },
]
