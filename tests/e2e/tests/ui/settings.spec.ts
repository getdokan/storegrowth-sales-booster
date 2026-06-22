import { test, expect } from '../../fixtures/test';
import { gotoSettings, gotoAdminPage } from '../../helpers/wp-admin';

test.describe('Admin · Settings screen', () => {
  test('mounts the settings React app at the dashboard route', async ({ page }) => {
    await gotoSettings(page);

    // The settings SPA mounts into #sbooster-settings-page (assets/src/settings.js).
    await expect(page.locator('#sbooster-settings-page')).toBeVisible();
    await expect(page).toHaveTitle(/StoreGrowth/i);
  });

  test('bare ?page=spsg-settings still mounts the settings app', async ({ page }) => {
    // The HashRouter has no index route, so the bare slug resolves to a default
    // hash route (the first active module's settings, e.g. #/bogo) rather than a
    // clean landing page. With zero modules active it instead bounces to the
    // Modules screen — see ISSUES.md #1. Either way, deep-link the dashboard
    // route (gotoSettings) for a stable entry point.
    await gotoAdminPage(page, 'spsg-settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#sbooster-settings-page')).toBeVisible();
    await expect(page).toHaveURL(/page=spsg-settings#\//);
  });

  test('renders settings content (not an empty shell)', async ({ page }) => {
    await gotoSettings(page);
    // The app renders interactive content inside the mount once booted.
    await expect(page.locator('#sbooster-settings-page')).not.toBeEmpty();
  });
});
