import { defineConfig } from 'vite';
// import fs
import fs from 'fs';
import path from 'path';

export default defineConfig({
  root: '.', // Garde votre structure actuelle avec index.html à la racine
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './certs/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, './certs/server.crt')),
    },
    hmr: {
      port: 5173,
      overlay: true
    },
    cors: true,
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
  },
  preview: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './certs/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, './certs/server.crt')),
    },
    host: '0.0.0.0',
    port: 5173,
  },

});