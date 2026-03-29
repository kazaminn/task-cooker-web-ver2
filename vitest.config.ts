import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['**/*.test.ts', '**/*.test.tsx'],
      exclude: [
        '**/node_modules/**',
        '**/*.emulator.test.ts',
        '**/firestore.rules.test.ts',
        // Firebase API tests — require VITE_FIREBASE_* env vars (run in CI only)
        '**/features/auth/hooks/useAuth.test.ts',
        '**/features/auth/store/authStore.test.ts',
        '**/features/dashboard/hooks/useDashboardData.test.ts',
        '**/features/tasks/components/TaskListView.test.tsx',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'text-summary', 'html', 'lcov'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.stories.{ts,tsx}',
          'src/types/*.d.ts',
          'src/main.tsx',
          'src/vite-env.d.ts',
          'src/services/**',
        ],
        // 傾斜つきカバレッジ目標（暫定ベースライン）
        // 最終目標は testing-strategy.md 参照。テスト追加に応じて段階的に引き上げる
        thresholds: {
          'api/**': {
            statements: 60,
            branches: 40,
            functions: 40,
            lines: 60,
          },
          'hooks/**': {
            statements: 50,
            branches: 50,
            functions: 50,
            lines: 50,
          },
          'features/**/components/**': {
            statements: 50,
            branches: 40,
            functions: 40,
            lines: 50,
          },
          'features/**/pages/**': {
            statements: 50,
            branches: 50,
            functions: 50,
            lines: 50,
          },
          'libs/**': {
            statements: 55,
            branches: 25,
            functions: 15,
            lines: 55,
          },
          'types/**': {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
          },
          'stores/**': {
            statements: 80,
            branches: 50,
            functions: 80,
            lines: 80,
          },
        },
      },
    },
  })
);
