import { useState, useEffect } from 'react'
import { groupsService } from '@/services/groups.service'

export function useGroups() {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    groupsService.getMyGroups().then(setGroups).finally(() => setIsLoading(false))
  }, [])
  return { groups, isLoading, setGroups }
}

export function useDiscoverGroups() {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    groupsService.getDiscover().then(setGroups).finally(() => setIsLoading(false))
  }, [])
  return { groups, isLoading }
}
