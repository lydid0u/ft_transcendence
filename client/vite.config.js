import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Garde votre structure actuelle avec index.html à la racine
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
    cssCodeSplit: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Support TypeScript out of the box
  esbuild: {
    target: 'es2020'
  },
  // Résolution des modules pour TypeScript
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
});