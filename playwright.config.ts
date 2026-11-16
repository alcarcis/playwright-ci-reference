import { randomBytes } from 'node:crypto';
import { defineConfig, devices } from '@playwright/test';

// Credentials are never committed. In CI they are generated per run and masked;
// locally, if not provided, a random pair is generated for this run.
process.env.APP_USER ??= 'qa-user';
process.env.APP_PASSWORD ??= randomBytes(12).toString('hex');

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // CI: "blob" lets sharded jobs be merged into a single HTML report afterwards.
  reporter: isCI ? [['blob'], ['github']] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
  },
  webServer: {
    command: 'node app/server.js',
    url: `${baseURL}/api/health`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !isCI,
    timeout: 15_000,
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    {
      name: 'ui',
      testDir: './tests/ui',
      // PW_CHANNEL lets a machine with Chrome installed run without downloading browsers.
      use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined },
    },
  ],
});
