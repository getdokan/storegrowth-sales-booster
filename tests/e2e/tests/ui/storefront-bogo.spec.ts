import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoProduct, computedStyle } from '../../helpers/storefront';
import { getProductIdBySlug, apiFetch } from '../../helpers/wc';
import { gotoModuleSettings, saveForm, setSwitch, switchControl } from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * BOGO — full module spec. A global BOGO offer (created via the REST API the
 * admin UI uses) renders a gift-offer block on the matching product's single
 * page (woocommerce_single_product_summary → `.offer-main-wrap`). General-tab
 * settings are driven through the real admin form (helpers/settings-ui).
 * Baseline-active.
 */
const ROUTE = 'bogo';
const OFFER = '.offer-main-wrap';
const REST = '/wp-json/sales-booster/v1/bogo/offers';

function offerPayload(offeredId: number, giftId: number, extra: Record<string, any> = {}) {
  return {
    name_of_order_bogo: 'E2E BOGO Gift',
    offer_type: 'free',
    offered_products: [offeredId],
    get_alternate_products: [giftId],
    box_border_style: 'solid',
    box_border_color: '#0000ff',
    box_top_margin: '10',
    box_bottom_margin: '10',
    discount_background_color: '#ff0000',
    discount_text_color: '#ffffff',
    discount_font_size: '14',
    product_description_text_color: '#333333',
    product_description_font_size: '12',
    ...extra,
  };
}

async function deleteAllOffers(page: any) {
  const res = await apiFetch(page, 'get', REST);
  let offers: any[] = [];
  try {
    offers = await res.json();
  } catch {
    return;
  }
  if (!Array.isArray(offers)) return; // route gone (module inactive)
  for (const o of offers) {
    await apiFetch(page, 'delete', `${REST}/${o.id}`).catch(() => {});
  }
}

test.describe('Storefront · BOGO', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.bogo.id, true);
    await deleteAllOffers(page);
  });

  test.afterEach(async ({ page }) => {
    // Reactivate first so the offers REST route exists, then clean up.
    await setModuleActive(page, MODULES.bogo.id, true);
    await deleteAllOffers(page);
  });

  // ===== Render behaviour ====================================================

  test.describe('Render behaviour', () => {
    test('shows the gift offer on a product that has a BOGO offer', async ({ page }) => {
      const a = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const b = await getProductIdBySlug(page, PRODUCTS.b.slug);
      const res = await apiFetch(page, 'post', REST, offerPayload(a, b));
      expect(res.status()).toBe(201);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toBeVisible();
      // The gift product (B) is shown in the offer.
      await expect(page.locator(`${OFFER} .offer-product-title`)).toContainText(PRODUCTS.b.name);
    });

    test('no offer block on a product without a BOGO offer', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.c.slug);
      await expect(page.locator(OFFER)).toHaveCount(0);
    });

    test('no offer block when the module is inactive', async ({ page }) => {
      const a = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const b = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await apiFetch(page, 'post', REST, offerPayload(a, b));
      await setModuleActive(page, MODULES.bogo.id, false);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toHaveCount(0);
    });
  });

  // ===== Offer (Lists) fields → storefront ===================================

  test.describe('Offer fields', () => {
    test('the custom product-page message shows in the offer header', async ({ page }) => {
      const a = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const b = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await apiFetch(page, 'post', REST, offerPayload(a, b, { product_page_message: 'Buy one get one free deal' }));

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(`${OFFER} .dynamic-offer-text`)).toContainText('Buy one get one free deal');
    });

    test('the offer carries the configured offer-type data attribute', async ({ page }) => {
      const a = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const b = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await apiFetch(page, 'post', REST, offerPayload(a, b));

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toHaveAttribute('data-offer-type', 'free');
    });

    test('offer design colours apply to the offer block', async ({ page }) => {
      const a = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const b = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await apiFetch(page, 'post', REST, offerPayload(a, b));

      await gotoProduct(page, PRODUCTS.a.slug);
      // discount_background_color (#ff0000) → header background.
      expect(await computedStyle(page, `${OFFER} .dynamic-offer-text`, 'background-color')).toBe('rgb(255, 0, 0)');
      // box_border_color (#0000ff) → wrapper border.
      expect(await computedStyle(page, OFFER, 'border-top-color')).toBe('rgb(0, 0, 255)');
    });
  });

  // ===== General settings (admin UI → persistence) ===========================

  test.describe('General settings', () => {
    test('"Show Regular Price" toggle persists via the form', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSwitch(page, 'Show Regular Price', true);
      await saveForm(page);

      // Re-open the form; the toggle stays on (persisted from the admin end).
      await gotoModuleSettings(page, ROUTE);
      await expect(switchControl(page, 'Show Regular Price')).toHaveAttribute('aria-checked', 'true');

      await setSwitch(page, 'Show Regular Price', false);
      await saveForm(page);
    });
  });

  // ===== Enable ==============================================================

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.bogo.name, false);
      await setModuleState(page, MODULES.bogo.name, true);
      await expect(moduleToggle(page, MODULES.bogo.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
