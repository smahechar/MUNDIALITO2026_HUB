import { ENV } from '@/config/env'
import { apiFetch } from './api'
import { nations, byCode, groups } from '@/mocks/data/nations'

export const nationsService = {
  getAll:   () => ENV.USE_MOCKS ? Promise.resolve(nations)    : apiFetch('/nations'),
  getByCode:(code) => ENV.USE_MOCKS ? Promise.resolve(byCode[code] ?? null) : apiFetch(`/nations/${code}`),
  getGroups:() => ENV.USE_MOCKS ? Promise.resolve(groups)     : apiFetch('/nations/groups'),
}
