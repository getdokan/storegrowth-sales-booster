import { APIRequestContext, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { moduleAjax } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { gotoSettings, saveSettings, setColor } from '../../helpers/settings-ui';
import { computedStyle, emptyCart, gotoProduct, gotoShop } from '../../helpers/storefront';
import {
  getModuleSettings,
  hasPro,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { deleteAllBogoOffers } from '../../helpers/records';
import { getProductIdBySlug, setProductMeta } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS, STORE_PAGES } from '../../data/products';

// Direct Checkout (docs/redesign/modules/direct-checkout.md). Setup through
// REST; the button styles are still an inline <style> (read computed styles).
// The button label, the shop-page button and the "Add to cart as Buy Now" /
// "specific products" layouts are pro: a lite save ignores them.
const id = MODULES.directCheckout.id;
const PRODUCT_BTN = '.summary .spsg_buy_now_button_product_page';
const SHOP_BTN = '.spsg_buy_now_button';

let pro: boolean | undefined;
async function isPro(api: APIRequestContext): Promise<boolean> {
  pro ??= await hasPro(api);
  return pro;
}

/** The old admin's ajax save, kept as an adapter (ADR-004). */
async function legacySave(page: Page, values: Record<string, unknown>) {
  return moduleAjax(page, 'spsg_direct_checkout_save_settings', {
    data: JSON.stringify({ direct_checkout_data: values }),
  });
}

test.describe('Storefront · Direct Checkout', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
  });

  test.afterEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
  });

  test.describe('Render behaviour', () => {
    test('adds a Buy Now button linking to checkout on the product page', async ({ page }) => {
      await gotoProduct(page, PRODUCTS.a.slug);
      const btn = page.locator(PRODUCT_BTN);
      await expect(btn).toBeVisible();
      await expect(btn).toHaveText(/Buy Now/i);
      await expect(btn).toHaveAttribute('href', /\/checkout\/?/);
    });

    test('the "Default Add to cart" layout shows no Buy Now button', async ({ page, api }) => {
      await saveModuleSettings(api, id, { buy_now_button_setting: 'default-add-to-cart' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator('.spsg_buy_now_button_product_page')).toHaveCount(0);
      await expect(page.locator('.summary .single_add_to_cart_button').first()).toBeVisible();
    });

    test('no Buy Now button when "Display on Product Page" is off', async ({ page, api }) => {
      await saveModuleSettings(api, id, { product_page_checkout_enable: false });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(PRODUCT_BTN)).toHaveCount(0);
    });

    test('no Buy Now button when the module is inactive', async ({ page, api }) => {
      await setModuleStatus(api, id, false);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(PRODUCT_BTN)).toHaveCount(0);
    });

    test('clicking Buy Now adds the product and checkout shows the exact price', async ({ page, api }) => {
      // Everything else that changes Product A's price or the cart: a countdown
      // discount, a Free Shipping Rules "discount amount" fee, a BOGO gift line.
      const pid = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setProductMeta(page, pid, {
        _spsg_countdown_timer_discount_amount: '',
        _spsg_countdown_timer_discount_start: '',
        _spsg_countdown_timer_discount_end: '',
      });
      await resetModuleSettings(api, MODULES.freeShipping.id); // discount_type: free-shipping
      await deleteAllBogoOffers(api);
      await emptyCart(page);

      try {
        await gotoProduct(page, PRODUCTS.a.slug);
        await Promise.all([page.waitForURL(/\/(checkout|cart)\//), page.locator(PRODUCT_BTN).click()]);

        await page.goto(STORE_PAGES.checkout);
        const review = page.locator('.woocommerce-checkout-review-order-table');
        await expect(review).toBeVisible();
        await expect(review.locator('.cart_item')).toHaveCount(1);
        await expect(review.locator('.cart_item .product-name')).toContainText(PRODUCTS.a.name);
        await expect(review.locator('.cart_item .product-name')).toContainText('× 1');
        await expect(review.locator('.cart_item .product-total')).toContainText(PRODUCTS.a.price);
        await expect(review.locator('.order-total')).toContainText(PRODUCTS.a.price);
      } finally {
        await emptyCart(page);
      }
    });
  });

  test.describe('Design', () => {
    const cases: [string, Record<string, unknown>, string, string][] = [
      ['button color is applied', { button_color: '#ff0000' }, 'background-color', 'rgb(255, 0, 0)'],
      ['text color is applied', { text_color: '#00ff00' }, 'color', 'rgb(0, 255, 0)'],
      ['font size is applied', { font_size: 22 }, 'font-size', '22px'],
      ['border radius is applied', { button_border_radius: 12 }, 'border-top-left-radius', '12px'],
    ];
    for (const [title, values, prop, expected] of cases) {
      test(title, async ({ page, api }) => {
        await saveModuleSettings(api, id, values);
        await gotoProduct(page, PRODUCTS.a.slug);
        expect(await computedStyle(page, PRODUCT_BTN, prop)).toBe(expected);
      });
    }

    test('custom styles are NOT applied when Custom Button Style is off', async ({ page, api }) => {
      await saveModuleSettings(api, id, { button_style: false, button_color: '#ff0000' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, PRODUCT_BTN, 'background-color')).not.toBe('rgb(255, 0, 0)');
    });
  });

  test.describe('Pro', { tag: '@pro' }, () => {
    test('lite ignores the pro label, shop display and layouts', async ({ page, api }) => {
      test.skip(await isPro(api), 'lite-only behaviour');
      const saved = await saveModuleSettings(api, id, {
        buy_now_button_label: 'Purchase Now',
        shop_page_checkout_enable: false,
        checkout_redirect: 'quick-cart-checkout',
      });
      expect(saved.values).toMatchObject({
        buy_now_button_label: 'Buy Now',
        shop_page_checkout_enable: true,
        checkout_redirect: 'legacy-checkout',
      });

      // A pro-only option of a lite select is refused like any invalid value.
      const res = await api.post(`/wp-json/sales-booster/v1/settings/${id}`, {
        data: { values: { buy_now_button_setting: 'cart-to-buy-now' } },
      });
      expect((await getModuleSettings(api, id)).values.buy_now_button_setting, `HTTP ${res.status()}`).toBe(
        'cart-with-buy-now',
      );

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(PRODUCT_BTN)).toHaveText(/Buy Now/);
      await gotoShop(page);
      await expect(page.locator(SHOP_BTN)).toHaveCount(0); // the shop button needs pro
    });

    test('honours a custom Buy Now button label', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, id, { buy_now_button_label: 'Purchase Now' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(PRODUCT_BTN)).toHaveText(/Purchase Now/);
    });

    test('shows a Buy Now button per product on the shop loop', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, id, { button_color: '#ff0000' });
      await gotoShop(page);
      const buttons = page.locator(SHOP_BTN);
      await expect(buttons.first()).toBeVisible();
      await expect(buttons.first()).toHaveAttribute('href', /\/checkout\/?/);
      expect(await buttons.count()).toBe(await page.locator('ul.products li.product').count());
      expect(await computedStyle(page, SHOP_BTN, 'background-color')).toBe('rgb(255, 0, 0)');
    });

    test('hides the shop Buy Now button when shop display is off', async ({ page, api }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, id, { shop_page_checkout_enable: false });
      await gotoShop(page);
      await expect(page.locator(SHOP_BTN)).toHaveCount(0);
    });
  });

  test.describe('Legacy ajax save (ADR-004)', () => {
    test('spsg_direct_checkout_save_settings still drives the storefront', async ({ page, api }) => {
      const res = await legacySave(page, { button_color: '#aa0000', product_page_checkout_enable: true });
      expect(res.body?.success, JSON.stringify(res.body)).toBe(true);
      expect((await getModuleSettings(api, id)).values.button_color).toBe('#aa0000');

      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, PRODUCT_BTN, 'background-color')).toBe('rgb(170, 0, 0)');
    });
  });

  test.describe('Admin form', { tag: '@admin' }, () => {
    test('editing the Button Color on the settings page updates the button', async ({ page }) => {
      await gotoSettings(page, id, 'design');
      await setColor(page, 'Button Color', '#ff0000');
      await saveSettings(page, id);

      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, PRODUCT_BTN, 'background-color')).toBe('rgb(255, 0, 0)');
    });
  });

  // Last: the UI toggle churns shared state.
  test.describe('Enable', { tag: '@admin' }, () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.directCheckout.name, false);
      await setModuleState(page, MODULES.directCheckout.name, true);
      await expect(moduleToggle(page, MODULES.directCheckout.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
