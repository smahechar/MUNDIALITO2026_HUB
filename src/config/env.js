// Typed environment config — set values in .env.local
// Backend team: update VITE_API_BASE_URL and set VITE_USE_MOCKS=false when API is ready
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  USE_MOCKS:    import.meta.env.VITE_USE_MOCKS !== 'false', // defaults to mock mode
  APP_NAME:     'Global Cup 2026 · Hub',
}
