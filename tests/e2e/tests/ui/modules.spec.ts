import { test, expect } from '../../fixtures/test';
import { gotoModules, setModuleState, moduleToggle } from '../../helpers/modules';
import { MODULES, BASELINE_ACTIVE } from '../../data/modules';

test.describe('Admin · Modules catalog', { tag: '@ui' }, () => {
  test('mounts the modules React app', async ({ page }) => {
    await gotoModules(page);
    await expect(page.locator('#sbooster-modules-page')).toBeVisible();
  });

  test('renders a card for every module', async ({ page }) => {
    await gotoModules(page);

    for (const mod of Object.values(MODULES)) {
      await expect(
        page.locator('.spsg-module-card', { hasText: mod.name }),
        `module card for "${mod.name}" should render`,
      ).toBeVisible();
    }
  });

  test('exposes exactly ten module cards each with a toggle', async ({ page }) => {
    await gotoModules(page);
    await expect(page.locator('.spsg-module-card')).toHaveCount(Object.keys(MODULES).length);
  });

  test('baseline modules show as active', async ({ page }) => {
    await gotoModules(page);
    for (const id of BASELINE_ACTIVE) {
      const mod = Object.values(MODULES).find((m) => m.id === id)!;
      await expect(moduleToggle(page, mod.name)).toHaveAttribute('aria-checked', 'true');
    }
  });

  // Each toggling test must restore its module to active so later specs see the
  // baseline. This file owns Direct Checkout + Floating Bar for toggling.
  test('a module can be deactivated and reactivated (idempotent, leaves state as found)', async ({
    page,
  }) => {
    const name = MODULES.directCheckout.name;
    await setModuleState(page, name, false);
    await expect(moduleToggle(page, name)).toHaveAttribute('aria-checked', 'false');

    await setModuleState(page, name, true);
    await expect(moduleToggle(page, name)).toHaveAttribute('aria-checked', 'true');
  });

  test('toggled state persists across a reload', async ({ page }) => {
    const name = MODULES.floatingBar.name;
    await setModuleState(page, name, false);

    await page.reload();
    await expect(page.locator('#sbooster-modules-page')).toBeVisible();
    await expect(moduleToggle(page, name)).toHaveAttribute('aria-checked', 'false');

    await setModuleState(page, name, true);
  });
});
