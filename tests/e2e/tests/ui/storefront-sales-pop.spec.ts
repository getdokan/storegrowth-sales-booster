import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoSettings } from '../../helpers/wp-admin';
import { getProductIdBySlug } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// The popup container is consumed/removed by popup JS at runtime; the stable signal is whether
// `popup-custom.js` enqueues. BUG #6 (ISSUES.md): enqueue_scripts explode()s virtual_locations,
// which fatals the storefront when it's an array — see the BUG #6 test below.
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
    // Must be active so the nonce localizes before resetting to a non-fatal config.
    await setModuleActive(page, MODULES.salesPop.id, true);
    await saveSalesPop(page, { enable: false, popup_products: [], virtual_locations: '' });
    await setModuleActive(page, MODULES.salesPop.id, true);
  });

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.salesPop.name, false);
    await setModuleState(page, MODULES.salesPop.name, true);
    await expect(moduleToggle(page, MODULES.salesPop.name)).toHaveAttribute('aria-checked', 'true');
  });

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

  test('Design settings render on the popup container', async ({ page, guestPage }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    // A long initial delay keeps the container present (JS only shows/cycles it after the delay).
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

  test('does not load the popup script when the module is inactive', async ({ page, guestPage }) => {
    await setModuleActive(page, MODULES.salesPop.id, false);
    await guestPage.goto('/shop/');
    await expect(guestPage.locator(POPUP_JS)).toHaveCount(0);
  });

  test('an array virtual_locations must not break the storefront enqueue [BUG #6]', async ({
    page,
    guestPage,
  }) => {
     // enqueue_scripts explode()s an array → fatal → script never loads (still reproduces under Pro).
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await saveSalesPop(page, { enable: true, external_link: false, popup_products: [id], virtual_locations: [] });

    await guestPage.goto('/shop/');
    await expect(guestPage.locator(POPUP_JS)).toHaveCount(1);
  });
});
