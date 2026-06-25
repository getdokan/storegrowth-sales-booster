import { test, expect } from '../../fixtures/test';
import { gotoSettings, gotoAdminPage } from '../../helpers/wp-admin';

test.describe('Admin · Settings screen', { tag: '@ui' }, () => {
  test('mounts the settings React app at the dashboard route', async ({ page }) => {
    await gotoSettings(page);

    await expect(page.locator('#sbooster-settings-page')).toBeVisible();
    await expect(page).toHaveTitle(/StoreGrowth/i);
  });

  test('bare ?page=spsg-settings still mounts the settings app', async ({ page }) => {
    // HashRouter has no index route: bare slug resolves to a default hash route
    // (or bounces to Modules with zero modules active) — see ISSUES.md #1.
    await gotoAdminPage(page, 'spsg-settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#sbooster-settings-page')).toBeVisible();
    await expect(page).toHaveURL(/page=spsg-settings#\//);
  });

  test('renders settings content (not an empty shell)', async ({ page }) => {
    await gotoSettings(page);
    await expect(page.locator('#sbooster-settings-page')).not.toBeEmpty();
  });
});
