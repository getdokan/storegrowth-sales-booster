import { test as base, expect, APIRequestContext, Page } from '@playwright/test';
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

  /**
   * A logged-OUT storefront page (fresh context, no admin session).
   *
   * Needed for "promotion" modules (Floating Bar, Sales Notification) which the
   * plugin only shows to guests/customers — never to admins
   * (Helper::is_current_user_allowed_to_view_promotions). The default `page`
   * carries the admin storageState, so it can't see them.
   */
  guestPage: Page;
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

  guestPage: async ({ browser }, use) => {
    // A clean, logged-OUT session. Force an empty storageState (otherwise the
    // context can pick up the admin cookies) and set baseURL explicitly (a fresh
    // context doesn't inherit the project's).
    const context = await browser.newContext({
      baseURL: env.baseURL,
      storageState: { cookies: [], origins: [] },
    });
    await context.clearCookies();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
