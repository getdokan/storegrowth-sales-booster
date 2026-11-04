import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import { ADMIN_STORAGE_STATE } from '../fixtures/test';
import { login } from '../helpers/wp-admin';
import { env } from '../helpers/env';

// WP login cookies (no "remember me") live ~48h; a 12h reuse window stays well
// inside that while letting repeated local runs skip the login.
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

// Reuse a fresh admin.json; only log in when it's missing, stale, or no longer
// accepted (a re-provisioned stack on the same port has new auth salts).
setup('authenticate as admin', async ({ page, playwright }) => {
  try {
    const { mtimeMs } = fs.statSync(ADMIN_STORAGE_STATE);
    if (Date.now() - mtimeMs < SESSION_TTL_MS) {
      const probe = await playwright.request.newContext({ baseURL: env.baseURL, storageState: ADMIN_STORAGE_STATE });
      const res = await probe.get('/wp-admin/', { maxRedirects: 0 });
      await probe.dispose();
      if (res.status() === 200) {
        setup.info().annotations.push({ type: 'auth', description: 'reused cached admin session' });
        return;
      }
    }
  } catch {
    // No saved session yet — fall through and log in.
  }

  await login(page);
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
