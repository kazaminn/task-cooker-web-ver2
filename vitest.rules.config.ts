import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  {
    ...viteConfig,
    root: '.',
  },
  defineConfig({
    test: {
      environment: 'node',
      setupFiles: [],
      include: ['test/firestore.rules.test.ts'],
      exclude: ['**/node_modules/**'],
    },
  })
);
