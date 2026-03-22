import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      setupFiles: [],
      include: ['firestore.rules.test.ts'],
      exclude: ['**/node_modules/**'],
    },
  })
);
