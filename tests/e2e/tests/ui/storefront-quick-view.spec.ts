import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { setModuleActive } from '../../helpers/ajax';
import { gotoShop, gotoProduct } from '../../helpers/storefront';
import { getProductIdBySlug } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Quick View — adds a "Quick View" button to each product in the shop loop that
 * opens a product modal via ajax (spsgqcv_quickview).
 *
 * Markers (verified live): `.spsgqcv-btn` / `.spsgqcv-btn-{id}` (shop loop),
 * `.spsgqcv-popup` + `.spsgqcv-product` (the opened modal). Shop-loop only —
 * not on single product pages. Owns the `quick-view` module.
 */
const BTN = '.spsgqcv-btn';

test.describe('Storefront · Quick View', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.quickView.id, true);
  });

  test.afterEach(async ({ page }) => {
    await setModuleActive(page, MODULES.quickView.id, true);
  });

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.quickView.name, false);
    await setModuleState(page, MODULES.quickView.name, true);
    await expect(moduleToggle(page, MODULES.quickView.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive --------------------------------------------------------------

  test('adds a Quick View button to every product in the shop loop', async ({ page }) => {
    await gotoShop(page);
    const buttons = page.locator(BTN);
    await expect(buttons.first()).toBeVisible();
    // One per product card on the shop archive.
    const products = await page.locator('ul.products li.product').count();
    expect(await buttons.count()).toBe(products);
  });

  test('clicking a Quick View button opens the product modal', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await gotoShop(page);

    await page.locator(`.spsgqcv-btn-${id}`).click();

    const popup = page.locator('.spsgqcv-popup');
    await expect(popup).toBeVisible();
    await expect(popup.locator('.product_title')).toContainText(PRODUCTS.a.name);
    await expect(popup.locator('.single_add_to_cart_button')).toBeVisible();
  });

  // ---- Negative --------------------------------------------------------------

  test('no Quick View button in the main single-product summary', async ({ page }) => {
    // Quick View is a shop-loop feature — the product's own summary has no
    // button (related-products cards below are part of a loop and may have one).
    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator('.summary')).toBeVisible();
    await expect(page.locator('.summary .spsgqcv-btn')).toHaveCount(0);
  });

  test('no Quick View button when the module is inactive', async ({ page }) => {
    await setModuleState(page, MODULES.quickView.name, false);
    await gotoShop(page);
    await expect(page.locator(BTN)).toHaveCount(0);
  });
});
