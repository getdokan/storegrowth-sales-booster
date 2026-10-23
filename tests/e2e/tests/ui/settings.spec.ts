import { test, expect } from '../../fixtures/test';
import { gotoAdminPage } from '../../helpers/wp-admin';
import { adminApp, gotoAppRoute } from '../../helpers/modules';
import {
  gotoSettings,
  openTab,
  saveSettings,
  resetSettings,
  setField,
  saveButton,
} from '../../helpers/settings-ui';
import {
  getAllSettingsPages,
  getModuleSettings,
  hasPro,
  resetModuleSettings,
} from '../../helpers/rest';
import { MODULES } from '../../data/modules';

// Generated settings pages (ADR-009) at `#/settings?module=<id>&tab=<tab>`, the
// record pages (BOGO offers, order bumps) and the legacy slug redirects.
test.describe('Admin · Settings screen', { tag: '@ui' }, () => {
  test('every settings page mounts with its title and tabs', async ({ page, api }) => {
    const pages = await getAllSettingsPages(api);
    expect(Object.keys(pages)).toEqual(expect.arrayContaining(['general', MODULES.stockBar.id]));

    for (const [id, data] of Object.entries(pages)) {
      await test.step(id, async () => {
        await gotoSettings(page, id);
        const app = adminApp(page);
        await expect(app.getByRole('heading', { level: 1 })).toHaveText(data.page.title);

        for (const tab of Object.values(data.page.tabs ?? {})) {
          await expect(app.getByRole('tab', { name: tab.label, exact: true })).toBeVisible();
        }
      });
    }
  });

  test('the tab in the URL is the selected tab', async ({ page, api }) => {
    const { page: def } = await getModuleSettings(api, MODULES.stockBar.id);
    await gotoSettings(page, MODULES.stockBar.id, 'design');
    await expect(
      adminApp(page).getByRole('tab', { name: def.tabs!.design.label, exact: true }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  test('record pages mount (BOGO offers, order bumps)', async ({ page }) => {
    await gotoAppRoute(page, '/bogo');
    await expect(adminApp(page).getByRole('heading', { level: 1 })).toHaveText('BOGO Offers');

    await gotoAppRoute(page, '/upsell-order-bump');
    await expect(adminApp(page).getByRole('heading', { level: 1 })).toHaveText('Order Bumps');
  });

  test.describe('save and reset', () => {
    const id = MODULES.stockBar.id;
    test.afterEach(async ({ api }) => {
      await resetModuleSettings(api, id);
    });

    test('Save persists a change; Reset + Save restores the default', async ({ page, api }) => {
      const { schema, page: def } = await getModuleSettings(api, id);
      const field = schema.count_text_size; // a lite number field on the Design tab
      expect(field.pro).toBeFalsy();

      await gotoSettings(page, id);
      await openTab(page, def.tabs![field.tab!].label);
      await expect(saveButton(page)).toBeDisabled(); // nothing changed yet
      await setField(page, field, 17);
      const saved = await saveSettings(page, id);
      expect(saved.values.count_text_size).toBe(17);
      expect((await getModuleSettings(api, id)).values.count_text_size).toBe(17);

      await page.reload();
      await gotoSettings(page, id, field.tab);
      await expect(adminApp(page).getByRole('spinbutton', { name: field.label })).toHaveValue('17');

      await resetSettings(page, id);
      expect((await getModuleSettings(api, id)).values.count_text_size).toBe(field.default);
    });

    test('a pro field is locked on lite', async ({ page, api }) => {
      test.skip(await hasPro(api), 'lite-only check');
      const { schema, page: def } = await getModuleSettings(api, id);
      await gotoSettings(page, id);
      await openTab(page, def.tabs![schema.stockbar_height.tab!].label);
      await expect(
        adminApp(page).getByRole('spinbutton', { name: `${schema.stockbar_height.label} Pro` }),
      ).toBeDisabled();
    });
  });

  test.describe('legacy slugs redirect to the app page', () => {
    test('spsg-settings keeps the hash route', async ({ page }) => {
      await gotoAdminPage(page, 'spsg-settings', '#/modules');
      await expect(page).toHaveURL(/page=storegrowth#\/modules$/);
    });

    test('spsg-modules opens the module catalog', async ({ page }) => {
      await gotoAdminPage(page, 'spsg-modules');
      await expect(page).toHaveURL(/page=storegrowth&view=modules/);
      await expect(
        adminApp(page).getByRole('heading', { level: 1, name: 'Modules', exact: true }),
      ).toBeVisible();
    });

    test('an old module route opens its settings page', async ({ page }) => {
      await gotoAdminPage(page, 'spsg-settings', `#/${MODULES.stockBar.id}`);
      await expect(page).toHaveURL(new RegExp(`#/settings\\?module=${MODULES.stockBar.id}`));
      await expect(adminApp(page).getByRole('heading', { level: 1 })).toHaveText(
        MODULES.stockBar.name,
      );
    });
  });
});
