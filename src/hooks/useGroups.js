import { useState, useEffect } from 'react'
import { groupsService } from '@/services/groups.service'

export function useGroups(refreshKey = 0) {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadGroups() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await groupsService.getMyGroups()

        if (!alive) return

        setGroups(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error cargando mis grupos:', err)

        if (!alive) return

        setError(err)
        setGroups([])
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadGroups()

    return () => {
      alive = false
    }
  }, [refreshKey])

  return { groups, isLoading, error, setGroups }
}

export function useDiscoverGroups(refreshKey = 0) {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadDiscoverGroups() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await groupsService.getDiscover()

        if (!alive) return

        setGroups(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error cargando grupos públicos:', err)

        if (!alive) return

        setError(err)
        setGroups([])
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadDiscoverGroups()

    return () => {
      alive = false
    }
  }, [refreshKey])

  return { groups, isLoading, error }
}