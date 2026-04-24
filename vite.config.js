import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy للـ development فقط (npm run dev)
    // على Netlify مش محتاجينه لأن netlify.toml بيتكفل
    proxy: {
      '/api': {
        target: 'https://medicall2026.runasp.net',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})