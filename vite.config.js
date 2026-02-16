import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /api and /health requests to the backend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Show helpful errors during development
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('[vite proxy] Backend not ready yet, retrying...', err.message);
          });
        },
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
