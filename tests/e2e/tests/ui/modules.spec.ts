import { test, expect } from '../../fixtures/test';
import { gotoModules, setModuleState, moduleToggle, moduleCardLink } from '../../helpers/modules';
import { isModuleActive, listModules, setModuleStatus } from '../../helpers/rest';
import { MODULES } from '../../data/modules';

// The Modules screen (`#/modules`): one card per module, each with an
// "Enable <name>" switch that saves through `POST sales-booster/v1/modules/<id>`.
// The baseline stack has every module active; toggling tests restore it.
test.describe('Admin · Modules catalog', { tag: '@ui' }, () => {
  test('renders a card and a switch for every module', async ({ page }) => {
    await gotoModules(page);

    for (const mod of Object.values(MODULES)) {
      await expect(moduleCardLink(page, mod.name), `card for "${mod.name}"`).toBeVisible();
      await expect(moduleToggle(page, mod.name), `switch for "${mod.name}"`).toBeVisible();
    }
  });

  test('the catalog matches the REST module list', async ({ page, api }) => {
    const modules = await listModules(api);
    expect(modules.map((m) => m.id).sort()).toEqual(Object.values(MODULES).map((m) => m.id).sort());

    await gotoModules(page);
    for (const mod of modules) {
      await expect(moduleToggle(page, mod.name)).toHaveAttribute('aria-checked', String(mod.status));
    }
  });

  test('baseline modules show as active', async ({ page }) => {
    await gotoModules(page);
    for (const mod of Object.values(MODULES)) {
      await expect(moduleToggle(page, mod.name), mod.name).toHaveAttribute('aria-checked', 'true');
    }
  });

  // This file owns Direct Checkout + Floating Bar for toggling (ISSUES.md #2:
  // one shared option, so specs toggle distinct modules and restore them).
  test.describe('toggling', () => {
    test.afterEach(async ({ api }) => {
      await setModuleStatus(api, MODULES.directCheckout.id, true);
      await setModuleStatus(api, MODULES.floatingBar.id, true);
    });

    test('a module can be deactivated and reactivated', async ({ page, api }) => {
      const mod = MODULES.directCheckout;

      await setModuleState(page, mod.name, false);
      expect(await isModuleActive(api, mod.id)).toBe(false);

      await setModuleState(page, mod.name, true);
      expect(await isModuleActive(api, mod.id)).toBe(true);
    });

    test('toggled state persists across a reload', async ({ page, api }) => {
      const mod = MODULES.floatingBar;
      await setModuleState(page, mod.name, false);

      await page.reload();
      await gotoModules(page);
      await expect(moduleToggle(page, mod.name)).toHaveAttribute('aria-checked', 'false');
      expect(await isModuleActive(api, mod.id)).toBe(false);
    });

    test('a REST change shows on the screen', async ({ page, api }) => {
      const mod = MODULES.directCheckout;
      await setModuleStatus(api, mod.id, false);

      await gotoModules(page);
      await expect(moduleToggle(page, mod.name)).toHaveAttribute('aria-checked', 'false');
    });
  });
});
