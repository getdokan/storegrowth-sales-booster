import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { env } from './helpers/env';
import { ADMIN_STORAGE_STATE } from './fixtures/test';

const isCI = !!process.env.CI;

const reporter: ReporterDescription[] = [
  ['list'],
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'results/junit.xml' }],
];
if (isCI) reporter.push(['github']);

export default defineConfig({
  testDir: './tests',

  // Single worker: `update_module_status` does a non-atomic read-modify-write of
  // the site-wide `spsg_active_module_ids` option, so concurrent toggles from
  // different workers clobber each other (see ISSUES.md #2).
  fullyParallel: false,
  workers: 1,

  forbidOnly: isCI,
  // One retry absorbs genuine infra flake without tripling the cost of a real
  // failure; CI shards the suite across parallel jobs to claw back wall-clock.
  retries: isCI ? 1 : 0,

  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter,

  use: {
    baseURL: env.baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Headed by default for local debugging; CI and `HEADLESS=1` force headless.
    headless: isCI || process.env.HEADLESS === '1',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // UI/E2E — reuses the saved session from `setup`.
    {
      name: 'ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_STORAGE_STATE,
      },
    },

    // API — browserless; auth handled by the `api` fixture.
    {
      name: 'api',
      testDir: './tests/api',
    },
  ],
});
