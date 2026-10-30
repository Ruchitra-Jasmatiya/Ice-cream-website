import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// In dev, serve the static admin panel (public/admin/index.html) at /admin
// (on Vercel this is handled by the rewrite in vercel.json).
const adminRoute = () => ({
  name: 'fnf-admin-route',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url?.startsWith('/admin?') || req.url === '/admin/') req.url = '/admin/index.html'
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adminRoute()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // `npm run dev:all` starts the API on :3001 — Vite forwards /api to it.
    proxy: { '/api': { target: process.env.API_TARGET || 'http://localhost:3001', changeOrigin: true } },
  },
})
