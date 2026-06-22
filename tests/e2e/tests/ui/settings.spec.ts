import { test, expect } from '../../fixtures/test';
import { gotoAdminPage } from '../../helpers/wp-admin';

test.describe('Admin · Settings screen', () => {
  test('mounts the settings React app', async ({ page }) => {
    await gotoAdminPage(page, 'spsg-settings');

    // The settings SPA mounts into #sbooster-settings-page (assets/src/settings.js).
    await expect(page.locator('#sbooster-settings-page')).toBeVisible();
    await expect(page).toHaveTitle(/StoreGrowth/i);
  });
});
