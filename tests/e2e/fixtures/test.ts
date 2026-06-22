import { test as base, expect, APIRequestContext } from '@playwright/test';
import * as path from 'path';
import { env } from '../helpers/env';

/** Where the authenticated admin session is persisted by the `setup` project. */
export const ADMIN_STORAGE_STATE = path.resolve(__dirname, '..', '.auth', 'admin.json');

type Fixtures = {
  /**
   * Authenticated REST client (Basic auth via WP Application Password).
   *
   * Scoped per-test so request state never leaks between tests. Use it for
   * fast, browserless API checks: `const res = await api.get('/wp-json/...')`.
   */
  api: APIRequestContext;
};

/**
 * Project-wide custom test. Import `{ test, expect }` from here (never from
 * `@playwright/test` directly) so every spec gets the shared fixtures.
 */
export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: env.baseURL,
      extraHTTPHeaders: {
        Authorization: env.basicAuthHeader,
        Accept: 'application/json',
      },
    });
    await use(context);
    await context.dispose();
  },
});

export { expect };
