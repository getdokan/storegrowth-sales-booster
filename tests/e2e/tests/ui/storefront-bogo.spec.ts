import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoProduct, computedStyle } from '../../helpers/storefront';
import { getProductIdBySlug, apiFetch } from '../../helpers/wc';
import {
  gotoModuleSettings,
  openTab,
  saveForm,
  setSwitch,
  switchControl,
  setNumber,
} from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

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
  if (!Array.isArray(offers)) return; // route gone when module inactive
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

  test.describe('Render behaviour', () => {
    test('shows the gift offer on a product that has a BOGO offer', async ({ page }) => {
      const a = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const b = await getProductIdBySlug(page, PRODUCTS.b.slug);
      const res = await apiFetch(page, 'post', REST, offerPayload(a, b));
      expect(res.status()).toBe(201);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toBeVisible();
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
      expect(await computedStyle(page, `${OFFER} .dynamic-offer-text`, 'background-color')).toBe('rgb(255, 0, 0)');
      expect(await computedStyle(page, OFFER, 'border-top-color')).toBe('rgb(0, 0, 255)');
    });
  });

  test.describe('General settings', () => {
    test('"Show Regular Price" toggle persists via the form', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSwitch(page, 'Show Regular Price', true);
      await saveForm(page);

      await gotoModuleSettings(page, ROUTE);
      await expect(switchControl(page, 'Show Regular Price')).toHaveAttribute('aria-checked', 'true');

      await setSwitch(page, 'Show Regular Price', false);
      await saveForm(page);
    });

    test('"Product Page Badge Icon" toggles the offer badge on the product page', async ({ page }) => {
      const a = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const b = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await apiFetch(page, 'post', REST, offerPayload(a, b));

      await gotoModuleSettings(page, ROUTE);
      await setSwitch(page, 'Product Page Badge Icon', true);
      await saveForm(page);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.bogo-badge-image').first()).toBeVisible();

      await gotoModuleSettings(page, ROUTE);
      await setSwitch(page, 'Product Page Badge Icon', false);
      await saveForm(page);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.bogo-badge-image')).toHaveCount(0);
    });
  });

  test.describe('Create New form', { tag: '@admin' }, () => {
    const FIELDS = {
      'Basic Information': [
        'Name of BOGO',
        'Select Target Product(s)',
        'BOGO Deal Type',
        'Offer Product',
        'Offer Price/Discount',
        'Offer Start Date',
        'Offer End Date',
        'Select Min Quantity',
      ],
      Design: ['Offer Icon', 'Overview Border', 'Border Color', 'Top Margin', 'Bottom Margin', 'Background Color', 'Text Color', 'Font Size'],
      Content: ['Product Page Message'],
    };

    test('the Create New form exposes every field across its three tabs', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await page.locator('#sbooster-settings-page').getByRole('button', { name: 'Create New' }).click();
      await expect(page).toHaveURL(/create-bogo/);

      const root = page.locator('#sbooster-settings-page');
      for (const [tab, labels] of Object.entries(FIELDS)) {
        await openTab(page, tab);
        for (const label of labels) {
          await expect(root.locator('.card-heading', { hasText: label }).first()).toBeVisible();
        }
      }
    });

    async function pickSearch(page: any, heading: string, text: string) {
      await page
        .locator('#sbooster-settings-page')
        .locator('.card-heading', { hasText: heading })
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]')
        .click();
      const dd = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
      await dd.waitFor({ state: 'visible' });
      await page.keyboard.type(text);
      await page.waitForTimeout(400);
      await dd.getByText(text, { exact: true }).last().click();
      await page.waitForTimeout(300);
    }

    test('creates a BOGO through the form and renders it on the storefront', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await page.locator('#sbooster-settings-page').getByRole('button', { name: 'Create New' }).click();
      await expect(page).toHaveURL(/create-bogo/);

      await page.getByPlaceholder('Enter BOGO Name').fill('E2E UI BOGO');
      await pickSearch(page, 'Select Target Product(s)', PRODUCTS.a.name);
      await pickSearch(page, 'Offer Product', PRODUCTS.b.name);
      // Offer type is a non-search "combine" select; on a fresh form ArrowDown→Enter
      // lands on "Discount%", which enables the adjacent amount input.
      await page.locator('#sbooster-settings-page .ant-select.combine-select').click();
      await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first().waitFor({ state: 'visible' });
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      await page.locator('#sbooster-settings-page .combine-field .ant-input-number-input').fill('25');
      await setNumber(page, 'Select Min Quantity', 2);

      // Form footer re-renders continuously, so a normal click can't stabilise;
      // trigger the visible Save button's React handler directly.
      await page.evaluate(() => {
        const root = document.querySelector('#sbooster-settings-page');
        const btn = [...(root?.querySelectorAll('button') ?? [])].find(
          (b) => /^Save$/.test(b.textContent?.trim() ?? '') && (b as HTMLElement).offsetParent !== null,
        ) as HTMLButtonElement | undefined;
        btn?.click();
      });
      await expect(page.locator('.ant-notification-notice-message')).toContainText('Order Bogo Creation', {
        timeout: 10000,
      });

      await expect(page.locator('#sbooster-settings-page .ant-table')).toContainText('E2E UI BOGO');

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(OFFER)).toBeVisible();
      await expect(page.locator(`${OFFER} .offer-product-title`)).toContainText(PRODUCTS.b.name);
    });
  });

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.bogo.name, false);
      await setModuleState(page, MODULES.bogo.name, true);
      await expect(moduleToggle(page, MODULES.bogo.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
