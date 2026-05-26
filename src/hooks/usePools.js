import { useState, useEffect } from 'react'
import { poolsService } from '@/services/pools.service'
import { matchesService } from '@/services/matches.service'

const EMPTY_DATA = {
  pools: [],
  predictions: [],
  timeline: [],
  specialPicks: {},
  discoverPools: [],
  scoringRules: [],
  matches: [],
}

export function usePoolDetail(poolId) {
  const [pool, setPool] = useState(null)
  const [members, setMembers] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadPoolDetail() {
      if (!poolId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [p, m] = await Promise.all([
          poolsService.getById(poolId),
          poolsService.getMembers(poolId),
        ])

        if (!alive) return

        setPool(p || null)
        setMembers(Array.isArray(m) ? m : [])
      } catch (err) {
        console.error('Error cargando detalle de polla:', err)

        if (!alive) return

        setError(err)
        setPool(null)
        setMembers([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadPoolDetail()

    return () => {
      alive = false
    }
  }, [poolId])

  return { pool, members, isLoading, error }
}

export function useMyPools() {
  const [pools, setPools] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadMyPools() {
      try {
        setLoading(true)
        setError(null)

        const data = await poolsService.getMyPools()

        if (!alive) return

        setPools(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error cargando mis pollas:', err)

        if (!alive) return

        setError(err)
        setPools([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadMyPools()

    return () => {
      alive = false
    }
  }, [])

  return { pools, isLoading, error }
}

export function useMyPredictions() {
  const [predictions, setPredictions] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadPredictions() {
      try {
        setLoading(true)
        setError(null)

        const data = await poolsService.getMyPredictions()

        if (!alive) return

        setPredictions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error cargando predicciones:', err)

        if (!alive) return

        setError(err)
        setPredictions([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadPredictions()

    return () => {
      alive = false
    }
  }, [])

  return { predictions, isLoading, error }
}

export function usePoolsPageData() {
  const [data, setData] = useState(EMPTY_DATA)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadPoolsPageData() {
      try {
        setLoading(true)
        setError(null)

        const [
          pools,
          predictions,
          timeline,
          specialPicks,
          discoverPools,
          scoringRules,
          matches,
        ] = await Promise.all([
          poolsService.getMyPools(),
          poolsService.getMyPredictions(),
          poolsService.getTimeline(),
          poolsService.getSpecialPicks(),
          poolsService.getDiscoverPools(),
          poolsService.getScoringRules(),
          matchesService.getAll(),
        ])

        if (!alive) return

        setData({
          pools: Array.isArray(pools) ? pools : [],
          predictions: Array.isArray(predictions) ? predictions : [],
          timeline: Array.isArray(timeline) ? timeline : [],
          specialPicks: specialPicks || {},
          discoverPools: Array.isArray(discoverPools) ? discoverPools : [],
          scoringRules: Array.isArray(scoringRules) ? scoringRules : [],
          matches: Array.isArray(matches) ? matches : [],
        })
      } catch (err) {
        console.error('Error cargando página de pollas:', err)

        if (!alive) return

        setError(err)
        setData(EMPTY_DATA)
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadPoolsPageData()

    return () => {
      alive = false
    }
  }, [])

  return { data, isLoading, error }
}