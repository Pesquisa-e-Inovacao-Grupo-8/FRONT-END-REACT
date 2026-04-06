import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // expõe na rede local (0.0.0.0)
    port: 8080,
  },
});
