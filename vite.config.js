import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // IMPORTANT: Allows Vite to listen to all addresses, fixing 502 with Tunnels
    allowedHosts: true, // Permite conexiones entrantes desde LocalTunnel o Ngrok
    proxy: {
      "/api": {
        target: "http://localhost:5000", // 👈 tu backend
        changeOrigin: true,
        secure: false
      }
    }
  }
})