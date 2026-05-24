// Base API client — backend team configures VITE_API_BASE_URL in .env.local
import { ENV } from '@/config/env'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('mundialito_token')
  const res = await fetch(`${ENV.API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}
