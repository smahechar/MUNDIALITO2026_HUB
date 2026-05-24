import { useState, useEffect } from 'react'
import { matchesService } from '@/services/matches.service'

export function useMatches(filters = {}) {
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    matchesService.getAll(filters)
      .then(setMatches)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [filters.status, filters.group])

  return { matches, isLoading, error }
}

export function useMatch(matchId) {
  const [match, setMatch] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return
    matchesService.getById(matchId).then(setMatch).finally(() => setIsLoading(false))
  }, [matchId])

  return { match, isLoading }
}

export function useLiveMatches() {
  const [matches, setMatches] = useState([])
  useEffect(() => { matchesService.getLive().then(setMatches) }, [])
  return matches
}

export function useMatchDetail(matchId) {
  const [detail, setDetail]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return
    matchesService.getDetail(matchId).then(setDetail).finally(() => setIsLoading(false))
  }, [matchId])

  return { detail, isLoading }
}
