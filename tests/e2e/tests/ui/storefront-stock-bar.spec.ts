import { test, expect } from '../../fixtures/test';
import { setModuleActive, moduleAjax } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoProduct } from '../../helpers/storefront';
import { getProductIdBySlug, updateProduct } from '../../helpers/wc';
import { gotoModuleSettings, openTab, saveForm, setTextField, setNumber, setCheckbox } from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Related products render their own bars, so assertions scope to the main product's `.entry-summary`.
const ROUTE = 'stock-bar';
const MAIN_BAR = '.entry-summary .spsg-stock-bar';
const MAIN_SECTION = '.entry-summary .spsg-stock-progress-bar-section';

// Flat form_data can't be cleared empty, so reset to a clean enabled base.
async function resetStockBar(page: any) {
  await moduleAjax(page, 'spsg_stock_bar_save_settings', {
    form_data: { product_page_stock_bar_enable: '1' },
  });
}

test.describe('Storefront · Stock Bar', { tag: '@ui' }, () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.stockBar.id, true);
    await resetStockBar(page);
  });

  test.afterEach(async ({ page }) => {
    await resetStockBar(page);
    await updateProduct(page, await getProductIdBySlug(page, PRODUCTS.b.slug), {
      manage_stock: true, stock_quantity: 5, stock_status: 'instock',
    });
    await updateProduct(page, await getProductIdBySlug(page, PRODUCTS.c.slug), {
      manage_stock: true, stock_quantity: 100, stock_status: 'instock',
    });
    await setModuleActive(page, MODULES.stockBar.id, true);
  });

  test.describe('Render behaviour', () => {
    test('shows on a stock-managed, in-stock product', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_BAR)).toBeVisible();
      await expect(page.locator('.entry-summary .spsg-stock-progress-title')).toBeVisible();
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

    test('not shown when the module is inactive', async ({ page }) => {
      await setModuleActive(page, MODULES.stockBar.id, false);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.spsg-stock-bar')).toHaveCount(0);
    });
  });

  test.describe('Design', () => {
    test('Available Item Count Text appears on the bar', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setTextField(page, 'Available Item Count Text', 'Only a few left');
      await saveForm(page);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_BAR)).toContainText('Only a few left');
    });

    test('Total Sell Count Text appears on the bar', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setTextField(page, 'Total Sell Count Text', 'Units Sold');
      await saveForm(page);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_BAR)).toContainText('Units Sold');
    });

    test('Stock Bar Height is applied to the progress bar', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setNumber(page, 'Stock Bar Height', 25);
      await saveForm(page);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_SECTION)).toHaveAttribute('data-height', '25');
    });

    test('"Display on Product Page" off hides the bar', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setCheckbox(page, 'Display on Product Page', false);
      await saveForm(page);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MAIN_BAR)).toHaveCount(0);
    });
  });

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.stockBar.name, false);
      await setModuleState(page, MODULES.stockBar.name, true);
      await expect(moduleToggle(page, MODULES.stockBar.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
