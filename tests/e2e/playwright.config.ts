import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { env } from './helpers/env';
import { ADMIN_STORAGE_STATE } from './fixtures/test';

const isCI = !!process.env.CI;

// list = readable local output, html = browsable report, junit = CI ingestion.
const reporter: ReporterDescription[] = [
  ['list'],
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'results/junit.xml' }],
];
// Inline annotations on the PR/checks UI when running in GitHub Actions.
if (isCI) reporter.push(['github']);

export default defineConfig({
  testDir: './tests',

  // Run spec files in parallel; deterministic worker count keeps CI stable.
  fullyParallel: true,
  workers: isCI ? 2 : undefined,

  // Guardrails: never let a stray `.only` pass CI; retry only to absorb infra flake.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,

  // Tight timeouts = fast, honest failures.
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter,

  use: {
    baseURL: env.baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    headless: false,
    // Capture debug artifacts only when something actually fails / retries.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 1) Authenticate once and persist the admin session to disk.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 2) UI / E2E — reuse the saved session, so no test pays the login cost.
    {
      name: 'ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_STORAGE_STATE,
      },
    },

    // 3) API — browserless; auth handled by the `api` fixture (App Password).
    {
      name: 'api',
      testDir: './tests/api',
    },
  ],
});
