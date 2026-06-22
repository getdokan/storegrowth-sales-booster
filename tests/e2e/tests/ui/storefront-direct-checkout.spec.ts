import { test, expect } from '../../fixtures/test';
import { moduleAjax, setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoProduct, gotoShop } from '../../helpers/storefront';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Direct Checkout — adds a "Buy Now" button that links straight to checkout.
 *
 * In the lite build the default mode (`cart-with-buy-now`) appends the button on
 * the single product page (`.spsg_buy_now_button_product_page`,
 * CommonHooks::show_direct_checkout_button_product, gated by the
 * `product_page_checkout_enable` setting). The shop-loop button is pro-gated, so
 * it must NOT appear in lite. Owns the `direct-checkout` module.
 */
const PRODUCT_BTN = '.spsg_buy_now_button_product_page';

/** Save direct-checkout settings (option payload is a JSON `direct_checkout_data`). */
async function saveDirectCheckout(page: any, data: Record<string, unknown>) {
  return moduleAjax(page, 'spsg_direct_checkout_save_settings', {
    data: JSON.stringify({ direct_checkout_data: data }),
  });
}

test.describe('Storefront · Direct Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.directCheckout.id, true);
  });

  test.afterEach(async ({ page }) => {
    await saveDirectCheckout(page, {}); // reset to defaults
    await setModuleActive(page, MODULES.directCheckout.id, true);
  });

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.directCheckout.name, false);
    await setModuleState(page, MODULES.directCheckout.name, true);
    await expect(moduleToggle(page, MODULES.directCheckout.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive --------------------------------------------------------------

  test('adds a Buy Now button linking to checkout on the product page', async ({ page }) => {
    await gotoProduct(page, PRODUCTS.a.slug);

    const btn = page.locator(PRODUCT_BTN);
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText(/Buy Now/i);
    await expect(btn).toHaveAttribute('href', /\/checkout\/?/);
  });

  test('honours a custom Buy Now button label', async ({ page }) => {
    await saveDirectCheckout(page, {
      buy_now_button_setting: 'cart-with-buy-now',
      buy_now_button_label: 'Purchase Now',
      product_page_checkout_enable: true,
    });

    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator(PRODUCT_BTN)).toHaveText(/Purchase Now/i);
  });

  // ---- Negative --------------------------------------------------------------

  test('no Buy Now button when the module is inactive', async ({ page }) => {
    await setModuleActive(page, MODULES.directCheckout.id, false);

    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator(PRODUCT_BTN)).toHaveCount(0);
  });

  test('hides the product-page button when product_page_checkout_enable is off', async ({ page }) => {
    await saveDirectCheckout(page, {
      buy_now_button_setting: 'cart-with-buy-now',
      product_page_checkout_enable: false,
    });

    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator(PRODUCT_BTN)).toHaveCount(0);
  });

  test('shop-loop Buy Now button is not present in the lite build (pro-gated)', async ({ page }) => {
    await gotoShop(page);
    await expect(page.locator('.spsg_buy_now_button')).toHaveCount(0);
    // Normal WooCommerce add-to-cart buttons remain.
    expect(await page.locator('a.add_to_cart_button').count()).toBeGreaterThan(0);
  });
});
