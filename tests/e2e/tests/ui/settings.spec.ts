import { test, expect } from '../../fixtures/test';
import { gotoSettings, gotoAdminPage } from '../../helpers/wp-admin';

test.describe('Admin · Settings screen', { tag: '@ui' }, () => {
  test('mounts the settings React app at the dashboard route', async ({ page }) => {
    await gotoSettings(page);

    await expect(page.locator('#sbooster-settings-page')).toBeVisible();
    await expect(page).toHaveTitle(/StoreGrowth/i);
  });

  test('old ?page=spsg-settings redirects to the app page, keeping the route', async ({ page }) => {
    await gotoAdminPage(page, 'spsg-settings', '#/modules');
    await expect(page).toHaveURL(/page=storegrowth#\/modules$/);

    await gotoAdminPage(page, 'spsg-modules');
    await expect(page).toHaveURL(/page=storegrowth&view=modules#\/modules$/);
  });

  test('renders settings content (not an empty shell)', async ({ page }) => {
    await gotoSettings(page);
    await expect(page.locator('#sbooster-settings-page')).not.toBeEmpty();
  });
});
