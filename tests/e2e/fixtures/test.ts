import { test as base, expect, APIRequestContext, Page } from '@playwright/test';
import * as path from 'path';
import { env } from '../helpers/env';

/** Where the authenticated admin session is persisted by the `setup` project. */
export const ADMIN_STORAGE_STATE = path.resolve(__dirname, '..', '.auth', 'admin.json');

type Fixtures = {
  /** Authenticated, browserless REST client (Basic auth). Scoped per-test. */
  api: APIRequestContext;

  /**
   * A logged-OUT storefront page. Needed for "promotion" modules (Floating Bar,
   * Sales Notification) which the plugin only shows to guests/customers — the
   * default `page` carries the admin session, so it can't see them.
   */
  guestPage: Page;
};

// Import `{ test, expect }` from here (not `@playwright/test`) so every spec
// gets the shared fixtures.
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
    // Force an empty storageState (else it picks up admin cookies) and set
    // baseURL explicitly (a fresh context doesn't inherit the project's).
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
