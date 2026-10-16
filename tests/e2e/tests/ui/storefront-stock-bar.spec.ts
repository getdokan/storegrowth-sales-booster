import { APIRequestContext } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import {
  getModuleSettings,
  hasPro,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoSettings, saveSettings, setField } from '../../helpers/settings-ui';
import { gotoProduct, computedStyle } from '../../helpers/storefront';
import { getProductIdBySlug, updateProduct } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Stock Bar (docs/redesign/modules/stock-bar.md). Setup through REST; the
// design keys reach the storefront as inline CSS or `--spsg-stock-bar-*`
// variables, so assertions read computed styles. The count texts, bar height,
// bar colour and status colour are pro keys: a lite save ignores them.
//
// Related products render their own bars, so assertions scope to the main
// product's `.entry-summary`.
const ID = MODULES.stockBar.id;
const MAIN_BAR = '.entry-summary .spsg-stock-bar';
const SECTION = '.entry-summary .spsg-stock-progress-bar-section';
const TITLE = '.entry-summary .spsg-stock-progress-title';
const WARNING = '.entry-summary .stock-status-warning-msg';
const METER = '.entry-summary .jqmeter-container .outer-therm';

let pro: boolean | undefined;
async function isPro(api: APIRequestContext): Promise<boolean> {
  pro ??= await hasPro(api);
  return pro;
}

test.describe('Storefront · Stock Bar', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, ID, true);
    await resetModuleSettings(api, ID);
  });

  test.afterEach(async ({ page, api }) => {
    await resetModuleSettings(api, ID);
    await updateProduct(page, await getProductIdBySlug(page, PRODUCTS.b.slug), {
      manage_stock: true, stock_quantity: PRODUCTS.b.stock, stock_status: 'instock',
    });
    await updateProduct(page, await getProductIdBySlug(page, PRODUCTS.c.slug), {
      manage_stock: true, stock_quantity: PRODUCTS.c.stock, stock_status: 'instock',
    });
    await setModuleStatus(api, ID, true);
  });

  test.describe('Render behaviour', () => {
    test('shows on a stock-managed, in-stock product', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_BAR)).toBeVisible();
      await expect(page.locator(TITLE)).toContainText('Total Sold');
      await expect(page.locator(TITLE)).toContainText('Available Item');
      await expect(page.locator(TITLE)).toContainText(String(PRODUCTS.a.stock));
    });

    test('not shown on a product that does not manage stock', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.c.slug);
      await updateProduct(page, id, { manage_stock: false, stock_status: 'instock' });
      await gotoProduct(page, PRODUCTS.c.slug);
      await expect(page.locator(MAIN_BAR)).toHaveCount(0);
    });

    test('not shown on an out-of-stock product', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await updateProduct(page, id, { manage_stock: true, stock_quantity: 0, stock_status: 'outofstock' });
      await gotoProduct(page, PRODUCTS.b.slug);
      await expect(page.locator(MAIN_BAR)).toHaveCount(0);
    });

    test('not shown when the module is inactive', async ({ page, api }) => {
      await setModuleStatus(api, ID, false);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.spsg-stock-bar')).toHaveCount(0);
    });

    test('the low-stock status line shows at or below the minimum quantity (10)', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.b.slug); // stock 5
      await expect(page.locator(WARNING)).toContainText(`only ${PRODUCTS.b.stock} stocks left`);

      await gotoProduct(page, PRODUCTS.a.slug); // stock 25
      await expect(page.locator(WARNING)).toHaveCount(0);
    });
  });

  test.describe('Configure', () => {
    test('"Display on Product Page" off hides the bar', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { product_page_stock_bar_enable: false });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_BAR)).toHaveCount(0);
    });

    test('"Stock Status" off hides the low-stock line', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { show_stock_status: false });
      await gotoProduct(page, PRODUCTS.b.slug);
      await expect(page.locator(MAIN_BAR)).toBeVisible();
      await expect(page.locator(WARNING)).toHaveCount(0);
    });
  });

  test.describe('Design', () => {
    test('defaults: the design card look', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, SECTION, 'background-color')).toBe('rgb(255, 255, 255)');
      expect(await computedStyle(page, SECTION, 'border-top-color')).toBe('rgb(221, 230, 249)');
      expect(await computedStyle(page, TITLE, 'font-size')).toBe('11px');
      expect(await computedStyle(page, TITLE, 'color')).toBe('rgb(37, 37, 45)');
    });

    test('Background Color (card) applies to the stock card', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { stockbar_card_bg_color: '#112233' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, SECTION, 'background-color')).toBe('rgb(17, 34, 51)');
    });

    test('Border Color applies to the stock card', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { stockbar_border_color: '#ff0000' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, SECTION, 'border-top-color')).toBe('rgb(255, 0, 0)');
    });

    test('Foreground Color applies to the bar track', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { stockbar_bg_color: '#00aa00' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(SECTION)).toHaveAttribute('data-bgcolor', '#00aa00');
      await expect(page.locator(METER)).toBeVisible();
      expect(await computedStyle(page, METER, 'background-color')).toBe('rgb(0, 170, 0)');
    });

    test('Count Text Size and Count Text Color apply to the counts row', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { count_text_size: 15, count_text_color: '#aa0000' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, TITLE, 'font-size')).toBe('15px');
      expect(await computedStyle(page, TITLE, 'color')).toBe('rgb(170, 0, 0)');
    });

    test('Status Text Size applies to the low-stock line', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { status_text_size: 17 });
      await gotoProduct(page, PRODUCTS.b.slug);
      expect(await computedStyle(page, WARNING, 'font-size')).toBe('17px');
    });

    test('Font Family applies to the stock card', async ({ page, api }) => {
      await saveModuleSettings(api, ID, { font_family: 'Roboto' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, SECTION, 'font-family')).toContain('Roboto');
    });
  });

  test.describe('Pro keys', { tag: '@pro' }, () => {
    test('lite ignores the pro texts and bar height', async ({ page, api }) => {
      test.skip(await isPro(api), 'lite-only behaviour');
      const saved = await saveModuleSettings(api, ID, {
        available_item_count_text: 'Only a few left',
        stockbar_height: 25,
      });
      expect(saved.values.available_item_count_text).toBe('Available Item');
      expect(saved.values.stockbar_height).toBe(10);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_BAR)).not.toContainText('Only a few left');
      await expect(page.locator(SECTION)).toHaveAttribute('data-height', '10');
    });

    test('Available Item / Total Sold texts appear on the bar', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, ID, {
        available_item_count_text: 'Only a few left',
        total_sell_count_text: 'Units Sold',
      });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_BAR)).toContainText('Only a few left');
      await expect(page.locator(MAIN_BAR)).toContainText('Units Sold');
    });

    test('Stock Bar Height is applied to the progress bar', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, ID, { stockbar_height: 25 });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(SECTION)).toHaveAttribute('data-height', '25');
      expect(await computedStyle(page, METER, 'height')).toBe('25px');
    });
  });

  test.describe('Admin form', { tag: '@admin' }, () => {
    test('editing Border Color on the settings page updates the storefront', async ({ page, api }) => {
      const { schema, page: settingsPage } = await getModuleSettings(api, ID);
      const field = schema.stockbar_border_color;
      await gotoSettings(page, ID);
      await setField(page, field, '#ff0000', settingsPage.tabs?.[String(field.tab)]?.label);
      await saveSettings(page, ID);

      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, SECTION, 'border-top-color')).toBe('rgb(255, 0, 0)');
    });
  });

  test.describe('Enable', { tag: '@admin' }, () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.stockBar.name, false);
      await setModuleState(page, MODULES.stockBar.name, true);
      await expect(moduleToggle(page, MODULES.stockBar.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
