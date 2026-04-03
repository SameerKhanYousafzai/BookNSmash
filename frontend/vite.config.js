import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/**
 * Reads the backend port from backend/.port (written by the backend on startup).
 * Falls back to 5000 if the file doesn't exist yet.
 */
function getBackendPort() {
  const portFile = path.resolve(__dirname, 'backend', '.port')
  try {
    if (fs.existsSync(portFile)) {
      const port = parseInt(fs.readFileSync(portFile, 'utf-8').trim(), 10)
      if (port > 0 && port < 65536) {
        console.log(`[vite] 📡 Proxying /api → http://localhost:${port} (from .port file)`)
        return port
      }
    }
  } catch {
    // Fall through to default
  }
  console.log('[vite] 📡 Proxying /api → http://localhost:5000 (default)')
  return 5000
}

const backendPort = getBackendPort()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /api and /health requests to the backend
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        // Show helpful errors during development
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('[vite proxy] Backend not ready yet, retrying...', err.message);
          });
        },
      },
      '/health': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
      '/uploads': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
})
