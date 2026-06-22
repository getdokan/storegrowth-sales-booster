import { test as setup } from '@playwright/test';
import { ADMIN_STORAGE_STATE } from '../fixtures/test';
import { login } from '../helpers/wp-admin';

/**
 * Authentication setup — runs before the `ui` project (declared as its
 * dependency in playwright.config.ts). Logs in once and writes the session to
 * disk so every UI test starts already authenticated.
 */
setup('authenticate as admin', async ({ page }) => {
  await login(page);
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
