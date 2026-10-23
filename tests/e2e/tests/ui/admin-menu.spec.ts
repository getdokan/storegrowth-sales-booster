import { test, expect } from '../../fixtures/test';
import { adminApp, gotoDashboard, gotoModules } from '../../helpers/modules';

// The WordPress menu and the app shell (ADR-008): one page,
// `admin.php?page=storegrowth#/<route>`, with header, notices and app roots.
test.describe('Admin · StoreGrowth menu', { tag: '@ui' }, () => {
  test('top-level StoreGrowth menu lists the app routes', async ({ page }) => {
    await page.goto('/wp-admin/');
    const menu = page.locator('#adminmenu');
    await expect(menu.getByRole('link', { name: 'StoreGrowth', exact: true }).first()).toBeVisible();

    // Submenu links point into the one app page.
    const expected: Record<string, string> = {
      Dashboard: 'admin.php?page=storegrowth',
      Features: 'admin.php?page=storegrowth#/features',
      Modules: 'admin.php?page=storegrowth#/modules',
      Settings: 'admin.php?page=storegrowth#/settings',
    };
    for (const [name, href] of Object.entries(expected)) {
      await expect(
        menu.locator(`a[href="${href}"]`).filter({ hasText: name }),
        `submenu "${name}"`,
      ).toHaveCount(1);
    }
  });

  test('the app page mounts header, notices and the app', async ({ page }) => {
    await gotoDashboard(page);
    await expect(page).toHaveTitle(/StoreGrowth/i);
    await expect(page.locator('#spsg-admin-header')).not.toBeEmpty();
    await expect(page.locator('#spsg-admin-notices')).toBeAttached();
    await expect(adminApp(page)).not.toBeEmpty();
  });

  test('no hash opens the dashboard', async ({ page }) => {
    await page.goto('/wp-admin/admin.php?page=storegrowth');
    await expect(
      adminApp(page).getByRole('heading', { level: 1, name: 'Dashboard', exact: true }),
    ).toBeVisible();
  });

  test('Modules submenu opens the module catalog', async ({ page }) => {
    // On StoreGrowth's own page its submenu is expanded (clickable).
    await gotoDashboard(page);
    await page.locator('#adminmenu a[href="admin.php?page=storegrowth#/modules"]').click();
    await expect(page).toHaveURL(/page=storegrowth#\/modules$/);
    await gotoModules(page); // asserts the catalog drew
  });

  test('Features opens the first active module page', async ({ page }) => {
    await page.goto('/wp-admin/admin.php?page=storegrowth#/features');
    await expect(page).toHaveURL(/#\/(settings\?module=[a-z-]+|bogo|upsell-order-bump)/);
    await expect(adminApp(page).getByRole('heading', { level: 1 })).toBeVisible();
  });
});
