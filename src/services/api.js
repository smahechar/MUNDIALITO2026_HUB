import { ENV } from "../config/env"

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("mundialito_token")

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${ENV.API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || `HTTP ${response.status}`)
  }

  return data
}