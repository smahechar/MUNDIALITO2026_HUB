import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: [
        '**/backend/venv/**',
        '**/backend/.venv/**',
        '**/node_modules/**',
        '**/dist/**',
      ],
    },
  },
  optimizeDeps: {
    exclude: [],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/backend/venv/**',
      '**/backend/.venv/**',
    ],
  },
})