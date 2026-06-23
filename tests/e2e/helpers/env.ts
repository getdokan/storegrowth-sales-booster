import * as path from 'path';
import * as dotenv from 'dotenv';

// Load tests/e2e/.env when present. In CI the values come from the job env instead.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const env = {
  /** Base URL of the WordPress site under test. */
  baseURL: process.env.BASE_URL ?? 'http://localhost:8888',

  /** WP admin credentials used for the UI login + persisted session. */
  adminUser: process.env.WP_ADMIN_USER ?? 'admin',
  adminPassword: process.env.WP_ADMIN_PASSWORD ?? 'password',

  // REST auth over HTTP Basic: the Docker stack installs the WP-API Basic-Auth
  // plugin, so the admin user/password authenticate REST directly (no App
  // Password needed). WP_APP_PASSWORD still works as an override if set.
  apiUser: process.env.WP_API_USER ?? process.env.WP_ADMIN_USER ?? 'admin',
  apiPassword:
    process.env.WP_APP_PASSWORD ?? process.env.WP_ADMIN_PASSWORD ?? 'password',

  /** Pre-built `Authorization` header for authenticated REST requests. */
  get basicAuthHeader(): string {
    const token = Buffer.from(`${this.apiUser}:${this.apiPassword}`).toString('base64');
    return `Basic ${token}`;
  },
};
