import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // تعديل بسيط هنا: هنخلي البروكسي يوجه لـ /api
      '/api': {
        target: 'http://medicall2026.runasp.net',
        changeOrigin: true,
        secure: false,
        // أحياناً السيرفر بيحتاج المسار بدون الـ /api في الأول 
        // جرب تضيف السطر ده لو اللي فات منفعش، بس ابدأ بالأول من غيره
         rewrite: (path) => path.replace(/^\/api/, '/api') 
      }
    }
  }
})