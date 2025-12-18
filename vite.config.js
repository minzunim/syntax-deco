import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
    host: true,
    allowedHosts: ['6d36c1ee2b9c.ngrok-free.app']
  }
})
