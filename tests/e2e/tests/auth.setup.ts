import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import { ADMIN_STORAGE_STATE } from '../fixtures/test';
import { login } from '../helpers/wp-admin';

// WP login cookies (no "remember me") live ~48h; a 12h reuse window stays well
// inside that while letting repeated local runs skip the login.
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

// Reuse a fresh admin.json; only log in when it's missing or stale.
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
