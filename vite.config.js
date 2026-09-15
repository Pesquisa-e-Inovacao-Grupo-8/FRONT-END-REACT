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
        target: 'https://spring.renatahtokutomi.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/spring/, ''),
      },
      '/api/payment': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/payment/, ''),
      },
    },
  },
});
