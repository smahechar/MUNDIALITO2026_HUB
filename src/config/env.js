// Configuración centralizada del frontend.
// En desarrollo local usa el backend Flask en http://127.0.0.1:8000/api/v1.
// Para usar mocks, cambia VITE_USE_MOCKS=true en .env.local.

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true',
}