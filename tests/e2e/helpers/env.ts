import * as path from 'path';
import * as dotenv from 'dotenv';

// Load tests/e2e/.env when present. In CI the values come from the job env instead.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Centralised, typed access to test configuration.
 *
 * Keeping every `process.env` read in one place means tests never touch raw
 * env vars and we get one obvious place to document/validate configuration.
 */
export const env = {
  /** Base URL of the WordPress site under test. */
  baseURL: process.env.BASE_URL ?? 'http://localhost:8888',

  /** WP admin credentials used for the UI login + persisted session. */
  adminUser: process.env.WP_ADMIN_USER ?? 'admin',
  adminPassword: process.env.WP_ADMIN_PASSWORD ?? 'password',

  /** REST auth via a WP Application Password (HTTP Basic over the wire). */
  apiUser: process.env.WP_API_USER ?? process.env.WP_ADMIN_USER ?? 'admin',
  apiAppPassword: process.env.WP_APP_PASSWORD ?? '',

  /** Pre-built `Authorization` header for authenticated REST requests. */
  get basicAuthHeader(): string {
    const token = Buffer.from(`${this.apiUser}:${this.apiAppPassword}`).toString('base64');
    return `Basic ${token}`;
  },
};
