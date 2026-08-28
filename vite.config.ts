import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173, // Порт, на котором будет работать ваше SPA
  },
  build: {
    outDir: 'dist',
  },
});