import { useState, useEffect } from 'react'
import { poolsService } from '@/services/pools.service'

export function usePoolDetail(poolId) {
  const [pool, setPool]       = useState(null)
  const [members, setMembers] = useState([])
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    if (!poolId) return
    Promise.all([
      poolsService.getById(poolId),
      poolsService.getMembers(poolId),
    ]).then(([p, m]) => { setPool(p); setMembers(m) })
      .finally(() => setLoading(false))
  }, [poolId])
  return { pool, members, isLoading }
}

export function useMyPools() {
  const [pools, setPools]       = useState([])
  const [isLoading, setLoading] = useState(true)
  useEffect(() => { poolsService.getMyPools().then(setPools).finally(()=>setLoading(false)) }, [])
  return { pools, isLoading }
}

export function useMyPredictions() {
  const [predictions, setPredictions] = useState([])
  useEffect(() => { poolsService.getMyPredictions().then(setPredictions) }, [])
  return predictions
}

export function usePoolsPageData() {
  const [data, setData]         = useState(null)
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([
      poolsService.getMyPools(),
      poolsService.getMyPredictions(),
      poolsService.getTimeline(),
      poolsService.getSpecialPicks(),
      poolsService.getDiscoverPools(),
      poolsService.getScoringRules(),
    ]).then(([pools, predictions, timeline, specialPicks, discoverPools, scoringRules]) => {
      setData({ pools, predictions, timeline, specialPicks, discoverPools, scoringRules })
    }).finally(() => setLoading(false))
  }, [])
  return { data, isLoading }
}
