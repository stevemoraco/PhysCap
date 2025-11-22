import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**', // Exclude Playwright E2E tests from Vitest
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'text-summary'],
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
      all: true,
      include: [
        'client/src/**/*.{ts,tsx}',
        'server/**/*.ts',
        'shared/**/*.ts',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'tests/**',
        'node_modules/**',
        'dist/**',
        '**/*.config.{ts,js}',
        '**/ui/**', // Exclude shadcn/ui components
        'client/src/main.tsx', // Entry point
        'server/index.ts', // Entry point
        '**/types.ts', // Type definitions
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@server': path.resolve(__dirname, './server'),
    },
  },
});
