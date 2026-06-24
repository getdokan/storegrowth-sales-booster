import { test, expect } from '../../fixtures/test';
import { setModuleActive, moduleAjax, getIsPro } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoProduct, gotoShop, emptyCart } from '../../helpers/storefront';
import { getProductIdBySlug, setProductMeta } from '../../helpers/wc';
import { gotoModuleSettings, openTab, saveForm, setColor } from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

const PRODUCT_BTN = '.summary .spsg_buy_now_button_product_page';
const SHOP_BTN = '.spsg_buy_now_button';

async function saveDirectCheckout(page: any, data: Record<string, unknown>) {
  return moduleAjax(page, 'spsg_direct_checkout_save_settings', {
    data: JSON.stringify({ direct_checkout_data: data }),
  });
}

async function computed(page: any, selector: string, prop: string): Promise<string> {
  return page
    .locator(selector)
    .first()
    .evaluate((el: Element, p: string) => getComputedStyle(el).getPropertyValue(p).trim(), prop);
}

function baseConfig(overrides: Record<string, unknown> = {}) {
  return {
    buy_now_button_setting: 'cart-with-buy-now',
    product_page_checkout_enable: true,
    shop_page_checkout_enable: true,
    button_style: true,
    ...overrides,
  };
}

test.describe('Storefront · Direct Checkout', { tag: '@ui' }, () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.directCheckout.id, true);
    // Known base config so tests don't inherit prior settings.
    await saveDirectCheckout(page, baseConfig());
  });

  test.afterEach(async ({ page }) => {
    await saveDirectCheckout(page, {});
    await setModuleActive(page, MODULES.directCheckout.id, true);
  });

  test.describe('Render behaviour', () => {
    test('adds a Buy Now button linking to checkout on the product page', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.a.slug);
      const btn = page.locator(PRODUCT_BTN);
      await expect(btn).toBeVisible();
      await expect(btn).toHaveText(/Buy Now/i);
      await expect(btn).toHaveAttribute('href', /\/checkout\/?/);
    });

    test('honours a custom Buy Now button label', async ({ page }) => {
      await saveDirectCheckout(page, baseConfig({ buy_now_button_label: 'Purchase Now' }));
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(PRODUCT_BTN)).toHaveText(/Purchase Now/i);
    });

    test('the "Default Add to cart" layout shows no Buy Now button', async ({ page }) => {
      await saveDirectCheckout(page, { buy_now_button_setting: 'default-add-to-cart' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.spsg_buy_now_button_product_page')).toHaveCount(0);
      await expect(page.locator('.summary button.single_add_to_cart_button, .summary .single_add_to_cart_button').first()).toBeVisible();
    });

    test('no Buy Now button when product page display is off', async ({ page }) => {
      await saveDirectCheckout(page, { buy_now_button_setting: 'cart-with-buy-now', product_page_checkout_enable: false });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(PRODUCT_BTN)).toHaveCount(0);
    });

    test('no Buy Now button when the module is inactive', async ({ page }) => {
      await setModuleActive(page, MODULES.directCheckout.id, false);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(PRODUCT_BTN)).toHaveCount(0);
    });

    test('clicking Buy Now adds the product and checkout shows the exact price', async ({ page }) => {
      // Force Product A to its regular price ($19.99 — clear any countdown discount).
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setProductMeta(page, id, {
        _spsg_countdown_timer_discount_amount: '',
        _spsg_countdown_timer_discount_end: '',
      });
      await emptyCart(page);

      await gotoProduct(page, PRODUCTS.a.slug);
      await Promise.all([
        page.waitForURL(/\/(checkout|cart)\//),
        page.locator(PRODUCT_BTN).click(),
      ]);

      await page.goto('/checkout/');
      const review = page.locator('.woocommerce-checkout-review-order-table');
      await expect(review).toBeVisible();
      await expect(review.locator('.cart_item .product-name')).toContainText('E2E Test Product A');
      await expect(review.locator('.cart_item .product-name')).toContainText('× 1');
      await expect(review.locator('.cart_item .product-total')).toContainText('19.99');
      await expect(review.locator('.order-total')).toContainText('19.99');

      await emptyCart(page);
    });
  });

  test.describe('Design', () => {
    test('button color is applied', async ({ page }) => {
      await saveDirectCheckout(page, baseConfig({ button_color: '#ff0000' }));
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computed(page, PRODUCT_BTN, 'background-color')).toBe('rgb(255, 0, 0)');
    });

    test('text color is applied', async ({ page }) => {
      await saveDirectCheckout(page, baseConfig({ text_color: '#00ff00' }));
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computed(page, PRODUCT_BTN, 'color')).toBe('rgb(0, 255, 0)');
    });

    test('font size is applied', async ({ page }) => {
      await saveDirectCheckout(page, baseConfig({ font_size: '22' }));
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computed(page, PRODUCT_BTN, 'font-size')).toBe('22px');
    });

    test('border radius is applied', async ({ page }) => {
      await saveDirectCheckout(page, baseConfig({ button_border_radius: '12' }));
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computed(page, PRODUCT_BTN, 'border-radius')).toBe('12px');
    });

    test('custom styles are NOT applied when Custom Button Style is off', async ({ page }) => {
      await saveDirectCheckout(page, baseConfig({ button_style: false, button_color: '#ff0000' }));
      await gotoProduct(page, PRODUCTS.a.slug);
      // Toggle off → injected <style> is skipped, so not the custom red.
      expect(await computed(page, PRODUCT_BTN, 'background-color')).not.toBe('rgb(255, 0, 0)');
    });
  });

  test.describe('Shop page', () => {
    test('shows a Buy Now button per product on the shop loop when enabled (Pro)', { tag: ['@pro', '@admin'] }, async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'requires Pro');
      await saveDirectCheckout(page, baseConfig({ button_color: '#ff0000' }));
      await gotoShop(page);

      const buttons = page.locator(SHOP_BTN);
      await expect(buttons.first()).toBeVisible();
      await expect(buttons.first()).toHaveAttribute('href', /\/checkout\/?/);
      const products = await page.locator('ul.products li.product').count();
      expect(await buttons.count()).toBe(products);
      expect(await computed(page, SHOP_BTN, 'background-color')).toBe('rgb(255, 0, 0)');
    });

    test('hides the shop Buy Now button when shop display is off (Pro)', { tag: ['@pro', '@admin'] }, async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'requires Pro');
      await saveDirectCheckout(page, { buy_now_button_setting: 'cart-with-buy-now', shop_page_checkout_enable: false });
      await gotoShop(page);
      await expect(page.locator(SHOP_BTN)).toHaveCount(0);
    });
  });

  test.describe('Admin form', () => {
    test('editing the Button Color via the Settings form updates the button', async ({ page }) => {
      await gotoModuleSettings(page, 'direct-checkout');
      await openTab(page, 'Design');
      await setColor(page, 'Button Color', '#ff0000');
      await saveForm(page);

      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computed(page, PRODUCT_BTN, 'background-color')).toBe('rgb(255, 0, 0)');
    });
  });

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.directCheckout.name, false);
      await setModuleState(page, MODULES.directCheckout.name, true);
      await expect(moduleToggle(page, MODULES.directCheckout.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
