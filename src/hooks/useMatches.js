import { useEffect, useState } from 'react'
import { matchesService } from '@/services/matches.service'

const EMPTY_DETAIL = {
  events: [],
  stats: null,
  lineupHome: null,
  lineupAway: null,
  h2h: [],
  predictions: null,
  attendance: null,
}

export function useMatches() {
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadMatches() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await matchesService.getAll()

        if (!alive) return

        setMatches(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error cargando partidos:', err)

        if (!alive) return

        setError(err)
        setMatches([])
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadMatches()

    return () => {
      alive = false
    }
  }, [])

  return {
    matches,
    allMatches: matches,
    isLoading,
    error,
  }
}

export function useMatch(id) {
  const [match, setMatch] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadMatch() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await matchesService.getById(id)

        if (!alive) return

        setMatch(data || null)
      } catch (err) {
        console.error('Error cargando partido:', err)

        if (!alive) return

        setError(err)
        setMatch(null)
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    if (id) {
      loadMatch()
    } else {
      setMatch(null)
      setIsLoading(false)
    }

    return () => {
      alive = false
    }
  }, [id])

  return {
    match,
    isLoading,
    error,
  }
}

export function useMatchDetail(id) {
  const [detail, setDetail] = useState(EMPTY_DETAIL)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadDetail() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await matchesService.getDetail(id)

        if (!alive) return

        setDetail(data || EMPTY_DETAIL)
      } catch (err) {
        console.error('Error cargando detalle del partido:', err)

        if (!alive) return

        setError(err)
        setDetail(EMPTY_DETAIL)
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    if (id) {
      loadDetail()
    } else {
      setDetail(EMPTY_DETAIL)
      setIsLoading(false)
    }

    return () => {
      alive = false
    }
  }, [id])

  return {
    detail,
    isLoading,
    error,
  }
}