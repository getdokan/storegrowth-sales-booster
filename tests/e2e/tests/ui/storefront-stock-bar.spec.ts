import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { moduleAjax, setModuleActive } from '../../helpers/ajax';
import { gotoProduct } from '../../helpers/storefront';
import { getProductIdBySlug, updateProduct } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Stock Bar — a stock-availability progress bar on the single product page
 * (woocommerce_before_add_to_cart_form). Renders only when the product *manages
 * stock*, is in stock, and the `product_page_stock_bar_enable` setting is on.
 *
 * Markers (verified live): `.spsg-stock-bar`, `.spsg-stock-progress-title`,
 * `.jqmeter-container`. Settings use the flat `form_data` ajax. Owns the
 * `stock-bar` module.
 */
const MARKER = '.spsg-stock-bar';

async function saveStockBar(page: any, formData: Record<string, unknown>) {
  return moduleAjax(page, 'spsg_stock_bar_save_settings', { form_data: formData });
}

test.describe('Storefront · Stock Bar', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.stockBar.id, true);
    // Known-good settings (bar enabled). The flat form_data ajax can't be reset
    // with an empty payload, so without this the disabled state would leak across
    // tests/runs.
    await saveStockBar(page, { product_page_stock_bar_enable: '1' });
  });

  test.afterEach(async ({ page }) => {
    await saveStockBar(page, { product_page_stock_bar_enable: '1' }); // restore enabled
    // Restore product stock state used by negative tests.
    await updateProduct(page, await getProductIdBySlug(page, PRODUCTS.b.slug), {
      manage_stock: true,
      stock_quantity: 5,
      stock_status: 'instock',
    });
    await updateProduct(page, await getProductIdBySlug(page, PRODUCTS.c.slug), {
      manage_stock: true,
      stock_quantity: 100,
      stock_status: 'instock',
    });
    await setModuleActive(page, MODULES.stockBar.id, true);
  });

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.stockBar.name, false);
    await setModuleState(page, MODULES.stockBar.name, true);
    await expect(moduleToggle(page, MODULES.stockBar.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive --------------------------------------------------------------

  test('shows the stock bar on a stock-managed product page', async ({ page }) => {
    await gotoProduct(page, PRODUCTS.a.slug); // manage_stock, 25 in stock
    await expect(page.locator(MARKER)).toBeVisible();
    await expect(page.locator('.spsg-stock-progress-title')).toBeVisible();
  });

  test('reflects a custom availability label from settings', async ({ page }) => {
    await saveStockBar(page, { available_item_count_text: 'Only a few left', show_stock_status: '1' });
    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator(MARKER)).toContainText('Only a few left');
  });

  // ---- Negative --------------------------------------------------------------

  test('no stock bar on a product that does not manage stock', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.c.slug);
    await updateProduct(page, id, { manage_stock: false, stock_status: 'instock' });

    await gotoProduct(page, PRODUCTS.c.slug);
    await expect(page.locator(MARKER)).toHaveCount(0);
  });

  test('no stock bar on an out-of-stock product', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.b.slug);
    await updateProduct(page, id, { manage_stock: true, stock_quantity: 0, stock_status: 'outofstock' });

    await gotoProduct(page, PRODUCTS.b.slug);
    await expect(page.locator(MARKER)).toHaveCount(0);
  });

  test('hidden on the product page when product_page_stock_bar_enable is off', async ({ page }) => {
    // Use '0' (falsy but non-empty) — empty-string form values get dropped.
    await saveStockBar(page, { product_page_stock_bar_enable: '0' });
    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator(MARKER)).toHaveCount(0);
  });

  test('no stock bar when the module is inactive', async ({ page }) => {
    await setModuleState(page, MODULES.stockBar.name, false);
    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator(MARKER)).toHaveCount(0);
  });
});
