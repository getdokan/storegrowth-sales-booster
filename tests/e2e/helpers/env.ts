import * as path from 'path';
import * as dotenv from 'dotenv';

// Load tests/e2e/.env (or the file named by E2E_ENV_FILE, e.g. `.env.sg-e2e-b2`
// written by `E2E_PROJECT=sg-e2e-b2 bin/setup-docker.sh`). Variables already in
// the process environment win. In CI the values come from the job env instead.
dotenv.config({ path: path.resolve(__dirname, '..', process.env.E2E_ENV_FILE ?? '.env') });

const baseURL = process.env.BASE_URL ?? 'http://localhost:8888';

export const env = {
  /** Base URL of the WordPress site under test. */
  baseURL,

  /**
   * Suffix that keeps a parallel stack's artefacts apart: '' for the default
   * :8888 stack, `-<port>` for any other (session file, test-results, report).
   */
  runSuffix: (() => {
    const port = new URL(baseURL).port || '80';
    return port === '8888' ? '' : `-${port}`;
  })(),

  /** WP admin credentials used for the UI login + persisted session. */
  adminUser: process.env.WP_ADMIN_USER ?? 'admin',
  adminPassword: process.env.WP_ADMIN_PASSWORD ?? 'password',

  // REST auth over HTTP Basic: the Docker stack installs the WP-API Basic-Auth
  // plugin, so the admin user/password authenticate REST directly (no App
  // Password needed). WP_APP_PASSWORD still works as an override if set.
  apiUser: process.env.WP_API_USER ?? process.env.WP_ADMIN_USER ?? 'admin',
  apiPassword:
    process.env.WP_APP_PASSWORD ?? process.env.WP_ADMIN_PASSWORD ?? 'password',

  /**
   * Optional WP-CLI command prefix for the site under test (helpers/wp-cli.ts),
   * e.g. `docker compose -p sg-e2e-b2 run --rm -T cli wp` (bin/setup-docker.sh
   * writes it) or `npx wp-env run tests-cli wp`. Empty: specs that need raw
   * WordPress access (writing an option no API exposes) skip.
   */
  wpCli: process.env.E2E_WP_CLI ?? '',

  /** Pre-built `Authorization` header for authenticated REST requests. */
  get basicAuthHeader(): string {
    const token = Buffer.from(`${this.apiUser}:${this.apiPassword}`).toString('base64');
    return `Basic ${token}`;
  },
};
