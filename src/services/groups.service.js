import { ENV } from '@/config/env'
import { apiFetch } from './api'
import { userGroups, discoverGroups, groupActivity } from '@/mocks/data/groups'

// Backend team: endpoints expected at /groups/*
export const groupsService = {
  getMyGroups: ()      => ENV.USE_MOCKS ? Promise.resolve(userGroups)                                   : apiFetch('/groups/me'),
  getDiscover: ()      => ENV.USE_MOCKS ? Promise.resolve(discoverGroups)                               : apiFetch('/groups/discover'),
  getById:     (gId)   => ENV.USE_MOCKS ? Promise.resolve(userGroups.find(g => g.id === gId) ?? null)  : apiFetch(`/groups/${gId}`),
  getActivity: (gId)   => ENV.USE_MOCKS ? Promise.resolve(groupActivity.filter(a => a.groupId === gId)): apiFetch(`/groups/${gId}/activity`),
  create: (data)       => ENV.USE_MOCKS ? Promise.resolve({ id: 'g-new', code: 'NEW001', members: 1, yourRole: 'admin', ...data }) : apiFetch('/groups', { method: 'POST', body: JSON.stringify(data) }),
  join:   (code)       => ENV.USE_MOCKS ? Promise.resolve({ success: true })                           : apiFetch('/groups/join',       { method: 'POST', body: JSON.stringify({ code }) }),
  leave:  (gId)        => ENV.USE_MOCKS ? Promise.resolve({ success: true })                           : apiFetch(`/groups/${gId}/leave`, { method: 'POST' }),
}
