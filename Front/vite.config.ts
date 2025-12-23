import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true, // Для доступа с хоста
    // УДАЛИТЕ HTTPS из разработки, если не нужны сертификаты
    // В продакшене HTTPS обеспечивается nginx
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        secure: false, // false, так как backend не использует HTTPS внутри сети
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Добавьте для production
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})