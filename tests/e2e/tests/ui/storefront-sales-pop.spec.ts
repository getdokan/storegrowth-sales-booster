import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoSettings } from '../../helpers/settings-ui';
import { computedStyle } from '../../helpers/storefront';
import {
  getModuleSettings,
  productIdBySlug,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { MODULES } from '../../data/modules';
import { PRODUCTS, STORE_PAGES } from '../../data/products';

// Sales Notification (`sales-pop`, option `spsg_popup_products`). The popup
// markup is hidden until its timer fires, so the stable signals are the
// enqueued `popup-custom.js` and the (hidden) template's computed styles.
// Storefront styles are still inline (sales-pop.md §5: ADR-005 deferred).
const POPUP_JS = 'script[src*="popup-custom.js"]';
const POPUP = 'section.custom-social-proof';
const id = MODULES.salesPop.id;

/** The old admin's ajax save (`create_popup`), kept as an adapter (ADR-004). */
async function createPopup(page: Page, popupData: Record<string, unknown>) {
  await gotoSettings(page, id); // localizes window.sales_pop_data.ajd_nonce
  const nonce = await page.evaluate(() => (window as any).sales_pop_data?.ajd_nonce);
  expect(nonce, 'sales_pop_data.ajd_nonce should be localized on the StoreGrowth page').toBeTruthy();
  const res = await page.request.post('/wp-admin/admin-ajax.php', {
    form: { action: 'create_popup', _ajax_nonce: nonce, data: JSON.stringify({ popup_data: popupData }) },
  });
  expect(res.status(), await res.text()).toBe(200);
  expect((await res.json()).success).toBe(true);
}

test.describe('Storefront · Sales Notification', { tag: '@ui' }, () => {
  let productId: number;

  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    productId = await productIdBySlug(api, PRODUCTS.a.slug);
    // Selected products as the source, so the storefront shows exactly these.
    await resetModuleSettings(api, id, { product_source: '1' });
  });

  test.afterEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
  });

  test('loads the popup script and markup on the storefront with a valid config', async ({ api, guestPage }) => {
    await saveModuleSettings(api, id, {
      enable: true,
      popup_products: [productId],
      virtual_name: ['John', 'Sara'],
      virtual_locations: ['New York', 'London'],
    });

    await guestPage.goto(STORE_PAGES.shop);
    await expect(guestPage.locator(POPUP_JS)).toHaveCount(1);
    await expect(guestPage.locator(POPUP)).toHaveCount(1);
    const info = await guestPage.evaluate(() => (window as any).popup_info);
    expect(info.product_list).toEqual([PRODUCTS.a.name]);
    expect(info.virtual_name).toEqual(['John', 'Sara']);
    expect(info.virtual_locations).toEqual(['New York', 'London']);
  });

  test('no popup markup while the popup is disabled', async ({ api, guestPage }) => {
    await saveModuleSettings(api, id, { enable: false, popup_products: [productId] });
    await guestPage.goto(STORE_PAGES.shop);
    await expect(guestPage.locator(POPUP)).toHaveCount(0);
  });

  test('Text Style settings render on the popup', async ({ api, guestPage }) => {
    // Lite fields, so this holds with or without pro.
    await saveModuleSettings(api, id, {
      enable: true,
      popup_products: [productId],
      product_title_color: '#abcdef',
      product_title_font_size: 18,
      time_text_color: '#123456',
    });

    await guestPage.goto(STORE_PAGES.shop);
    await expect(guestPage.locator(POPUP)).toHaveCount(1);
    expect(await computedStyle(guestPage, `${POPUP} #product`, 'color')).toBe('rgb(171, 205, 239)');
    expect(await computedStyle(guestPage, `${POPUP} #product`, 'font-size')).toBe('18px');
    expect(await computedStyle(guestPage, `${POPUP} #time`, 'color')).toBe('rgb(18, 52, 86)');
  });

  test('does not load the popup script when the module is inactive', async ({ api, guestPage }) => {
    await saveModuleSettings(api, id, { enable: true, popup_products: [productId] });
    await setModuleStatus(api, id, false);
    await guestPage.goto(STORE_PAGES.shop);
    await expect(guestPage.locator(POPUP_JS)).toHaveCount(0);
    await expect(guestPage.locator(POPUP)).toHaveCount(0);
  });

  test.describe('legacy create_popup', () => {
    test('a newline-separated virtual_locations string is saved as a list', async ({ page, api, guestPage }) => {
      await createPopup(page, {
        enable: true,
        popup_products: [productId],
        virtual_locations: 'New York\nLondon',
      });
      expect((await getModuleSettings(api, id)).values.virtual_locations).toEqual(['New York', 'London']);

      await guestPage.goto(STORE_PAGES.shop);
      await expect(guestPage.locator(POPUP_JS)).toHaveCount(1);
    });

    test('an array virtual_locations must not break the storefront enqueue [BUG #6]', async ({ page, guestPage }) => {
      await createPopup(page, { enable: true, popup_products: [productId], virtual_locations: [] });

      const res = await guestPage.goto(STORE_PAGES.shop);
      expect(res?.status()).toBe(200);
      await expect(guestPage.locator(POPUP_JS)).toHaveCount(1);
    });
  });

  // Last: the UI toggle churns shared state.
  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.salesPop.name, false);
    await setModuleState(page, MODULES.salesPop.name, true);
    await expect(moduleToggle(page, MODULES.salesPop.name)).toHaveAttribute('aria-checked', 'true');
  });
});
