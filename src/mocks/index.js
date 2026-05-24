// Central mock data export — replace services/*.service.js calls with real API
// when backend is ready. Components never import from here directly; only hooks do.
export * as nationsData  from './data/nations'
export * as matchesData  from './data/matches'
export * as poolsData    from './data/pools'
