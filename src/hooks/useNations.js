import { useState, useEffect } from 'react'
import { nationsService } from '@/services/nations.service'

export function useGroups() {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => { nationsService.getGroups().then(setGroups).finally(() => setIsLoading(false)) }, [])
  return { groups, isLoading }
}

export function useByCode() {
  const [byCode, setByCode] = useState({})
  useEffect(() => {
    nationsService.getAll().then(nations => setByCode(Object.fromEntries(nations.map(n => [n.code, n]))))
  }, [])
  return byCode
}
