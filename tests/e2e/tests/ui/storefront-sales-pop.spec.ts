import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoSettings } from '../../helpers/wp-admin';
import { getProductIdBySlug } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Sales Notification (sales-pop) — live "social-proof" popups for guests
 * (Helper::is_current_user_allowed_to_view_promotions), driven by
 * `popup-custom.js` + the `spsg_popup_products` config.
 *
 * The server-rendered `.custom-notification-container` is consumed/removed by the
 * popup JS at runtime, so it is not a stable DOM signal. The reliable signal is
 * whether the module's frontend boots cleanly: `popup-custom.js` is enqueued.
 * Config goes through the `create_popup` ajax (nonce `ajd_protected` →
 * `window.sales_pop_data.ajd_nonce` on Settings). Owns the `sales-pop` module.
 *
 * KNOWN BUG #6 (ISSUES.md): EnqueueScript::enqueue_scripts does
 * `explode("\n", $virtual_locations)`, but the value is an array unless supplied
 * as a string → TypeError that fatals the storefront (so the script never
 * loads). Documented by the `test.fail` below.
 */
const POPUP_JS = 'script[src*="popup-custom.js"]';

async function saveSalesPop(page: any, popupData: Record<string, unknown>) {
  await gotoSettings(page); // localizes window.sales_pop_data.ajd_nonce
  const nonce = await page.evaluate(() => (window as any).sales_pop_data?.ajd_nonce);
  expect(nonce, 'sales_pop_data.ajd_nonce should be available on Settings').toBeTruthy();
  const res = await page.request.post('/wp-admin/admin-ajax.php', {
    form: { action: 'create_popup', _ajax_nonce: nonce, data: JSON.stringify({ popup_data: popupData }) },
  });
  expect(res.status()).toBe(200);
}

test.describe('Storefront · Sales Notification', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.salesPop.id, true);
  });

  test.afterEach(async ({ page }) => {
    // Ensure active (so the nonce localizes), reset to a non-fatal config, then deactivate.
    await setModuleActive(page, MODULES.salesPop.id, true);
    await saveSalesPop(page, { enable: false, popup_products: [], virtual_locations: '' });
    await setModuleActive(page, MODULES.salesPop.id, true);
  });

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.salesPop.name, false);
    await setModuleState(page, MODULES.salesPop.name, true);
    await expect(moduleToggle(page, MODULES.salesPop.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive (guest) ------------------------------------------------------

  test('loads the popup script on the storefront with a valid config', async ({ page, guestPage }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await saveSalesPop(page, {
      enable: true,
      external_link: false,
      popup_products: [id],
      virtual_name: 'John,Sara',
      virtual_locations: 'New York\nLondon', // string — avoids BUG #6
    });

    await guestPage.goto('/shop/');
    await expect(guestPage.locator(POPUP_JS)).toHaveCount(1);
  });

  // ---- Design tab (server-rendered popup container) --------------------------

  test('Design settings render on the popup container', async ({ page, guestPage }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    // Background + border radius are inline on the server-rendered container; a long
    // initial delay keeps it present (the JS only shows/cycles it after the delay).
    await saveSalesPop(page, {
      enable: true,
      external_link: false,
      popup_products: [id],
      virtual_locations: 'New York',
      background_color: '#abcdef',
      popup_border_radius: '12',
      initial_time_delay: '30',
    });

    await guestPage.goto('/shop/');
    const style = await guestPage.locator('.custom-notification').first().getAttribute('style');
    // The browser normalises the inline #abcdef → rgb(171, 205, 239).
    expect(style).toContain('rgb(171, 205, 239)');
    expect(style).toContain('border-radius: 12px');
  });

  // ---- Negative --------------------------------------------------------------

  test('does not load the popup script when the module is inactive', async ({ page, guestPage }) => {
    await setModuleActive(page, MODULES.salesPop.id, false);
    await guestPage.goto('/shop/');
    await expect(guestPage.locator(POPUP_JS)).toHaveCount(0);
  });

  // ---- Known bug -------------------------------------------------------------

  test('an array virtual_locations must not break the storefront enqueue [BUG #6]', async ({
    page,
    guestPage,
  }) => {
    test.fail(); // enqueue_scripts explode()s an array → fatal → script never loads (still reproduces under Pro).
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await saveSalesPop(page, { enable: true, external_link: false, popup_products: [id], virtual_locations: [] });

    await guestPage.goto('/shop/');
    await expect(guestPage.locator(POPUP_JS)).toHaveCount(1);
  });
});
