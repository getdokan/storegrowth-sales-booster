import { test, expect } from '../../fixtures/test';

test.describe('Admin · StoreGrowth menu', () => {
  test('top-level StoreGrowth menu is present', async ({ page }) => {
    await page.goto('/wp-admin/');
    await expect(page.locator('#wpadminbar')).toBeVisible();

    const menu = page.locator('#adminmenu').getByRole('link', { name: 'StoreGrowth', exact: true });
    await expect(menu.first()).toBeVisible();
  });

  test('Modules and Settings submenus navigate to their SPAs', async ({ page }) => {
    await page.goto('/wp-admin/admin.php?page=spsg-modules');
    await expect(page.locator('#sbooster-modules-page')).toBeVisible();
    await expect(page).toHaveTitle(/Modules.*StoreGrowth/i);

    // Settings via its hash route — the supported entry point.
    await page.goto('/wp-admin/admin.php?page=spsg-settings#/dashboard/overview');
    await expect(page.locator('#sbooster-settings-page')).toBeVisible();
  });
});
