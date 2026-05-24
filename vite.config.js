import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    // JSX + Fast Refresh for everything under src/
    react(),

    // Legacy: serve root-level .jsx files as plain text so the Babel
    // standalone scripts in the old index can still fetch them.
    // Explicitly skips src/ so Vite can transform those normally.
    {
      name: 'serve-babel-jsx-raw',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0]
          const isSrcFile = url?.startsWith('/src/')
          if (url && url.endsWith('.jsx') && !isSrcFile) {
            const filePath = path.join(process.cwd(), url)
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/plain; charset=utf-8')
              res.end(fs.readFileSync(filePath, 'utf-8'))
              return
            }
          }
          next()
        })
      }
    }
  ],

  resolve: {
    alias: {
      // Allows imports like: import Foo from '@/components/Foo'
      '@': path.resolve(process.cwd(), 'src'),
    },
  },

  server: {
    port: 5173,
  },
})
