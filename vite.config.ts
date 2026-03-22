import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 3000 },
  root: 'src',
  envDir: path.resolve(dirname),
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      plugins: [visualizer()],
    },
  },
});
