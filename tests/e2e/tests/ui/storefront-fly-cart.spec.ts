import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { setModuleActive } from '../../helpers/ajax';
import { gotoShop, gotoProduct, addToCart, emptyCart } from '../../helpers/storefront';
import { getProductIdBySlug } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Fly Cart — a site-wide slide-out cart drawer injected in wp_footer.
 *
 * Markers (verified live): `.wfc-cart-icon` (floating icon), `.wfc-open-btn`
 * (opens the drawer), `.wfc-widget-sidebar` (drawer; closed = has `wfc-slide`,
 * open = no `wfc-slide`), `span.wfc-cart-countlocation` (count badge, refreshed
 * via woocommerce_add_to_cart_fragments). Owns the `fly-cart` module.
 */
const ICON = '.wfc-cart-icon';
const COUNT = 'span.wfc-cart-countlocation';

test.describe('Storefront · Fly Cart', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.flyCart.id, true);
    await emptyCart(page);
  });

  test.afterEach(async ({ page }) => {
    await emptyCart(page);
    await setModuleActive(page, MODULES.flyCart.id, true);
  });

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.flyCart.name, false);
    await setModuleState(page, MODULES.flyCart.name, true);
    await expect(moduleToggle(page, MODULES.flyCart.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive --------------------------------------------------------------

  test('shows the floating cart icon site-wide', async ({ page }) => {
    await gotoShop(page);
    await expect(page.locator(ICON).first()).toBeVisible();

    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator(ICON).first()).toBeVisible();
  });

  test('clicking the icon opens the cart drawer', async ({ page }) => {
    await gotoShop(page);

    const drawer = page.locator('.wfc-widget-sidebar');
    await expect(drawer).toHaveClass(/wfc-slide/); // closed initially

    await page.locator('.wfc-open-btn').first().click();

    await expect(drawer).not.toHaveClass(/wfc-slide/); // open
    await expect(page.locator('.wfc-cart-heading')).toBeVisible();
    await expect(page.locator('.wfc-close-btn').first()).toBeVisible();
  });

  test('count badge reflects the cart contents', async ({ page }) => {
    await gotoShop(page);
    await expect(page.locator(COUNT).first()).toHaveText('0');

    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await addToCart(page, id);

    await gotoShop(page);
    await expect(page.locator(COUNT).first()).toHaveText('1');
  });

  // ---- Negative --------------------------------------------------------------

  test('no cart icon when the module is inactive', async ({ page }) => {
    await setModuleState(page, MODULES.flyCart.name, false);
    await gotoShop(page);
    await expect(page.locator(ICON)).toHaveCount(0);
  });
});
