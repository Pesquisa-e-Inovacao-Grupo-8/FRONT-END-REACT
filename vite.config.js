import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  define: {
    global: 'globalThis',
  },

  server: {
    host: true,
    port: 8000,

    proxy: {
      '/spring': {
        target: 'http://renatatukotomi.duckdns.org:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/spring/, ''),
      },
    },
  },
});
