import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  css: {
    devSourcemap: true
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true
  }
})