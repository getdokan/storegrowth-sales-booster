import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoProduct, computedStyle } from '../../helpers/storefront';
import { createBogoOffer, deleteAllBogoOffers } from '../../helpers/records';
import { hasPro, resetModuleSettings, saveModuleSettings, setModuleStatus } from '../../helpers/rest';
import { gotoSettings, saveSettings, setToggle } from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// BOGO on the product page: the offer box (`bogo-product-front-view.php`) and
// the badge, from offers and global settings set up over REST. The admin list
// and editor are covered by bogo-admin.spec.ts; cart pricing by
// pricing-characterisation.spec.ts.
const OFFER = '.offer-main-wrap';
const BOGO = MODULES.bogo.id;

/** An active Buy X Get Y offer: buy product A, get product B. */
function offerOnA(api: Parameters<typeof createBogoOffer>[0], extra: Record<string, unknown> = {}) {
  return createBogoOffer(api, {
    offered_products: [PRODUCTS.a.id],
    get_different_product_field: PRODUCTS.b.id,
    box_border_color: '#0000ff',
    discount_background_color: '#ff0000',
    ...extra,
  });
}

test.describe('Storefront · BOGO', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, BOGO, true);
    await deleteAllBogoOffers(api);
    await resetModuleSettings(api, BOGO);
  });

  test.afterEach(async ({ api }) => {
    // Reactivate first so the offers REST route exists, then clean up.
    await setModuleStatus(api, BOGO, true);
    await deleteAllBogoOffers(api);
    await resetModuleSettings(api, BOGO);
  });

  test.describe('Render behaviour', () => {
    test('shows the offer product on a product that has a BOGO offer', async ({ page, api }) => {
      await offerOnA(api);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toBeVisible();
      await expect(page.locator(`${OFFER} .offer-product-title`)).toContainText(PRODUCTS.b.name);
    });

    test('no offer block on a product without a BOGO offer', async ({ page, api }) => {
      await offerOnA(api);
      await gotoProduct(page, PRODUCTS.c.slug);
      await expect(page.locator(OFFER)).toHaveCount(0);
    });

    test('no offer block when the module is inactive', async ({ page, api }) => {
      await offerOnA(api);
      await setModuleStatus(api, BOGO, false);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toHaveCount(0);
    });

    test('no offer block when the offer is switched off', async ({ page, api }) => {
      const offer = await offerOnA(api);
      const res = await api.put(`/wp-json/sales-booster/v1/bogo/offers/${offer.id}/status`, { data: { status: 'no' } });
      expect(res.ok()).toBeTruthy();
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toHaveCount(0);
    });

    test('no offer block when the offer has ended', async ({ page, api }) => {
      await offerOnA(api, { offer_start: '2020-01-01', offer_end: '2020-01-31' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toHaveCount(0);
    });
  });

  test.describe('Offer fields', () => {
    test('a free offer: "Free Gift" header, data-offer-type free, $0.00', async ({ page, api }) => {
      await offerOnA(api);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toHaveAttribute('data-offer-type', 'free');
      await expect(page.locator(`${OFFER} .dynamic-offer-text`)).toContainText('Free Gift');
      await expect(page.locator(`${OFFER} .offer-price`)).toContainText('$0.00');
    });

    test('a percentage offer: "50% Off" header and the discounted price', async ({ page, api }) => {
      await offerOnA(api, { offer_type: 'discount', discount_amount: 50 });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toHaveAttribute('data-offer-type', 'discount');
      await expect(page.locator(`${OFFER} .dynamic-offer-text`)).toContainText('50% Off');
      await expect(page.locator(`${OFFER} .offer-price`)).toContainText('$24.50');
    });

    test('the custom product-page message shows in the offer header (pro)', async ({ page, api }) => {
      // Editing the message is pro (R3): lite stores "Free Gift" whatever is sent.
      const pro = await hasPro(api);
      await offerOnA(api, { product_page_message: 'Buy one get one free deal' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(`${OFFER} .dynamic-offer-text`)).toContainText(
        pro ? 'Buy one get one free deal' : 'Free Gift',
      );
    });

    test('offer design colours apply to the offer block', async ({ page, api }) => {
      await offerOnA(api);
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, `${OFFER} .dynamic-offer-text`, 'background-color')).toBe('rgb(255, 0, 0)');
      expect(await computedStyle(page, OFFER, 'border-top-color')).toBe('rgb(0, 0, 255)');
    });

    test('border "None" draws no border', async ({ page, api }) => {
      await offerOnA(api, { box_border_style: 'no_border' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, OFFER, 'border-top-style')).toBe('none');
    });
  });

  test.describe('General settings', () => {
    const regularPrice = `${OFFER} .offer-price span >> nth=0`;

    test('"Show Regular Price" shows the struck-through regular price', async ({ page, api }) => {
      await offerOnA(api);

      await saveModuleSettings(api, BOGO, { regular_price_show: false });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(regularPrice)).toBeHidden();

      await saveModuleSettings(api, BOGO, { regular_price_show: true });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(regularPrice)).toBeVisible();
      await expect(page.locator(regularPrice)).toContainText('$49.00');
    });

    test('"Show Regular Price" saved through the settings page reaches the storefront', async ({ page, api }) => {
      await offerOnA(api);
      await gotoSettings(page, BOGO);
      await setToggle(page, 'Show Regular Price', true);
      const saved = await saveSettings(page, BOGO);
      expect(saved.values.regular_price_show).toBe(true);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(regularPrice)).toBeVisible();
    });

    test('"Product Page Badge Icon" toggles the offer badge on the product page', async ({ page, api }) => {
      await offerOnA(api);

      await saveModuleSettings(api, BOGO, { global_product_page_bage_icon: true });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.bogo-badge-image').first()).toBeAttached();

      await saveModuleSettings(api, BOGO, { global_product_page_bage_icon: false });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.bogo-badge-image')).toHaveCount(0);
    });
  });

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.bogo.name, false);
      await setModuleState(page, MODULES.bogo.name, true);
      await expect(moduleToggle(page, MODULES.bogo.name)).toHaveAttribute('aria-checked', 'true');
    });
  });

  // The Dokan vendor dashboard (integrations/src/dokan/bogo) needs Dokan,
  // which the stack doesn't install: not covered here (gap).
});
