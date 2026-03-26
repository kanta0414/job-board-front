import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // ① 推奨： /api で統一（後でコードを綺麗にできる）
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },

      // ② 現在 /jobs を直接呼んでいる場合の保険
      '/jobs': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})