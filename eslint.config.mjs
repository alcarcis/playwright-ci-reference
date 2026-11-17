import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'blob-report'] },
  js.configs.recommended,
  {
    files: ['app/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: { console: 'readonly', process: 'readonly', Buffer: 'readonly', URL: 'readonly' },
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
  {
    // k6 scripts run in k6's own runtime: its globals and `k6/*` modules are not Node's.
    files: ['perf/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: { __ENV: 'readonly', console: 'readonly' },
    },
  },
  {
    files: ['app/public/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { document: 'readonly', fetch: 'readonly', FormData: 'readonly' },
    },
  },
  {
    files: ['tests/**/*.ts', 'playwright.config.ts'],
    extends: [...tseslint.configs.recommended, playwright.configs['flat/recommended']],
    rules: {
      // Page-object assertion helpers are named expect*, so they count as assertions.
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect[A-Z]'] }],
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
    },
  },
);
