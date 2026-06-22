import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import { ADMIN_STORAGE_STATE } from '../fixtures/test';
import { login } from '../helpers/wp-admin';

/**
 * How long a saved admin session is trusted before we re-authenticate.
 *
 * WordPress login cookies (without "remember me") live ~48h, so a 12h reuse
 * window stays comfortably inside that while letting repeated local runs skip
 * the login entirely.
 */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Authentication setup — runs before the `ui` project (declared as its
 * dependency in playwright.config.ts).
 *
 * The `setup` project re-runs on every invocation, but the login itself is the
 * slow part. So we reuse an existing `admin.json` while it's still fresh and
 * only log in when the file is missing or stale, then persist the session so
 * every UI test starts already authenticated.
 */
setup('authenticate as admin', async ({ page }) => {
  try {
    const { mtimeMs } = fs.statSync(ADMIN_STORAGE_STATE);
    if (Date.now() - mtimeMs < SESSION_TTL_MS) {
      setup.info().annotations.push({ type: 'auth', description: 'reused cached admin session' });
      return;
    }
  } catch {
    // No saved session yet — fall through and log in.
  }

  await login(page);
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
