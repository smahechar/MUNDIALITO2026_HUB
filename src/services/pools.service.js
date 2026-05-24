import { ENV } from '@/config/env'
import { apiFetch } from './api'
import { pools, userPredictions, pointsTimeline, specialPicks, discoverPools, scoringRules, poolMembers } from '@/mocks/data/pools'

export const poolsService = {
  getMyPools:        () => ENV.USE_MOCKS ? Promise.resolve(pools)              : apiFetch('/pools/me'),
  getMembers:        (id) => ENV.USE_MOCKS ? Promise.resolve(poolMembers[id] ?? []) : apiFetch(`/pools/${id}/members`),
  getById:           (id) => ENV.USE_MOCKS ? Promise.resolve(pools.find(p=>p.id===id)??null) : apiFetch(`/pools/${id}`),
  getMyPredictions:  () => ENV.USE_MOCKS ? Promise.resolve(userPredictions)    : apiFetch('/predictions/me'),
  getTimeline:       () => ENV.USE_MOCKS ? Promise.resolve(pointsTimeline)     : apiFetch('/predictions/timeline'),
  getSpecialPicks:   () => ENV.USE_MOCKS ? Promise.resolve(specialPicks)       : apiFetch('/predictions/special'),
  getDiscoverPools:  () => ENV.USE_MOCKS ? Promise.resolve(discoverPools)      : apiFetch('/pools/discover'),
  getScoringRules:   () => ENV.USE_MOCKS ? Promise.resolve(scoringRules)       : apiFetch('/pools/rules'),
  createPool:  (data) => ENV.USE_MOCKS ? Promise.resolve({id:'p-new',...data}) : apiFetch('/pools',{method:'POST',body:JSON.stringify(data)}),
  joinPool:    (code) => ENV.USE_MOCKS ? Promise.resolve({success:true})       : apiFetch('/pools/join',{method:'POST',body:JSON.stringify({code})}),
  savePrediction: (matchId, pick) => ENV.USE_MOCKS ? Promise.resolve({success:true}) : apiFetch(`/predictions/${matchId}`,{method:'PUT',body:JSON.stringify(pick)}),
}
