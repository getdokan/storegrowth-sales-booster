import { APIRequestContext, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import {
  gotoSettings,
  resetSettings,
  saveSettings,
  setColor,
  setField,
  setText,
} from '../../helpers/settings-ui';
import { addToCart, computedStyle } from '../../helpers/storefront';
import {
  getModuleSettings,
  hasPro,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { MODULES } from '../../data/modules';
import { PRODUCTS, STORE_PAGES } from '../../data/products';

// Free Shipping Rules (`progressive-discount-banner`,
// docs/redesign/modules/progressive-discount-banner.md). A guest/customer-only
// promotion: storefront checks use the logged-out `guestPage`. The schema is
// gated (the first save turns the bar on, §5); the beforeEach reset is that
// save. The bar keeps its inline CSS (ADR-005 deferred), so read computed
// styles. The bar ships hidden and fades in after `banner_delay` (a pro key,
// 7s by default): attribute / text / computed-style checks don't wait for it.
const id = MODULES.freeShipping.id;
const WRAP = '.spsg-pd-banner-bar-wrapper';
const TEXT = `${WRAP} .spsg-pd-banner-text`;
const BTN = `${WRAP} a.fn-bar-action-button`;
const ICON = `${WRAP} .spsg-pd-banner-bar-icon svg`;
const REMOVE = `${WRAP} .spsg-pd-banner-bar-remove svg`;

// An empty cart is below this minimum, so the progressive text shows.
const HIGH_MINIMUM = 100000;

let pro: boolean | undefined;
async function isPro(api: APIRequestContext): Promise<boolean> {
  pro ??= await hasPro(api);
  return pro;
}

/**
 * The session's cart through the Store API (the provisioned cart page is the
 * Cart block): fees and total in minor units (cents).
 */
async function storeCart(page: Page): Promise<{ fees: { name: string; total: string }[]; total: string }> {
  const res = await page.request.get('/wp-json/wc/store/v1/cart');
  expect(res.ok(), `Store API cart: HTTP ${res.status()}`).toBeTruthy();
  const cart = await res.json();
  return {
    fees: cart.fees.map((f: { name: string; totals: { total: string } }) => ({ name: f.name, total: f.totals.total })),
    total: cart.totals.total_price,
  };
}

async function gotoShopAsGuest(guestPage: Page): Promise<void> {
  await guestPage.goto(STORE_PAGES.shop);
  await expect(guestPage.locator(WRAP)).toHaveCount(1);
}

test.describe('Storefront · Free Shipping Rules', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id, { cart_minimum_amount: HIGH_MINIMUM });
  });

  test.afterEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
  });

  test.describe('Admin UI → storefront', { tag: '@admin' }, () => {
    test('Banner Text (Content) updates the bar text', async ({ page, guestPage }) => {
      await gotoSettings(page, id, 'content');
      await setText(page, 'Banner Text', 'Spend more, ship free today!');
      await saveSettings(page, id);

      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(TEXT)).toContainText('Spend more, ship free today!');
    });

    test('Bar Type "Sticky" (Configure) makes the bar position fixed', async ({ page, api, guestPage }) => {
      const { schema } = await getModuleSettings(api, id);
      await gotoSettings(page, id, 'configure');
      await setField(page, schema.bar_type, 'sticky');
      await saveSettings(page, id);

      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'position')).toBe('fixed');
    });

    test('Background Color (Design) applies to the bar', async ({ page, guestPage }) => {
      await gotoSettings(page, id, 'design');
      await setColor(page, 'Background Color', '#112233');
      await saveSettings(page, id);

      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'background-color')).toBe('rgb(17, 34, 51)');
    });

    test('Reset + Save restores the default banner text', async ({ page, api }) => {
      const def = (await getModuleSettings(api, id)).schema.progressive_banner_text.default;
      await saveModuleSettings(api, id, { progressive_banner_text: 'Temporary text 999' });

      await gotoSettings(page, id, 'content');
      await resetSettings(page, id);
      expect((await getModuleSettings(api, id)).values.progressive_banner_text).toBe(def);
    });
  });

  test.describe('Content', () => {
    test('Cart Minimum Amount feeds the [amount] placeholder', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, {
        cart_minimum_amount: 250,
        progressive_banner_text: 'Add [amount] more to get FREE SHIPPING.',
      });
      // Empty guest cart → [amount] = 250 − 0.
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(TEXT)).toContainText('$250.00');
    });

    test('[amount] counts down as the cart fills', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, {
        cart_minimum_amount: 50,
        progressive_banner_text: 'Add [amount] more',
      });
      await addToCart(guestPage, PRODUCTS.a.id); // 19.99 → 30.01 to go
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(TEXT)).toContainText('$30.01');
    });

    test('Goal Completion Text shows once the cart clears the minimum', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, {
        cart_minimum_amount: 0, // empty cart (0) ≥ 0
        goal_completion_text: 'Goal reached — free shipping!',
      });
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(TEXT)).toContainText('Goal reached — free shipping!');
    });

    test('the default banner icon renders', async ({ guestPage }) => {
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(`${ICON}.spsg-bar-icon`)).toHaveCount(1);
    });

    test('Display CTA Button off removes the action button', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { btn_style: false });
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(BTN)).toHaveCount(0);
    });

    test('CTA Name and CTA Target URI shape the button', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { btn_text: 'Grab Free Shipping', btn_target: 'https://example.com/free-shipping' });
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(BTN)).toContainText('Grab Free Shipping');
      await expect(guestPage.locator(BTN)).toHaveAttribute('href', 'https://example.com/free-shipping');
    });
  });

  test.describe('Configure', () => {
    test('Bar Type "Normal" leaves the bar absolutely positioned', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, { bar_type: 'normal' });
      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'position')).toBe('absolute');
    });

    test('the bar is revealed after the trigger delay', async ({ guestPage }) => {
      await gotoShopAsGuest(guestPage);
      await expect(guestPage.locator(WRAP)).toBeVisible({ timeout: 15_000 });
      await expect(guestPage.locator('body')).toHaveClass(/show_discount_banner/);
    });

    test('Discount Type "Discount Amount" (fixed) takes the amount off a cart over the minimum', async ({
      api,
      guestPage,
    }) => {
      await saveModuleSettings(api, id, {
        discount_type: 'discount-amount',
        discount_amount_mode: 'fixed-amount',
        discount_amount_value: 5,
        cart_minimum_amount: 10,
      });
      await addToCart(guestPage, PRODUCTS.a.id); // 19.99 ≥ 10
      const cart = await storeCart(guestPage);
      expect(cart.fees).toEqual([{ name: 'Discount', total: '-500' }]);
      expect(cart.total).toBe('1499');
    });

    test('Discount Type "Discount Amount" (percentage) takes a share of the subtotal', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, {
        discount_type: 'discount-amount',
        discount_amount_mode: 'percentage',
        discount_amount_value: 10,
        cart_minimum_amount: 10,
      });
      await addToCart(guestPage, PRODUCTS.b.id); // 49.00 → −4.90
      const cart = await storeCart(guestPage);
      expect(cart.fees).toEqual([{ name: 'Discount', total: '-490' }]);
      expect(cart.total).toBe('4410');
    });

    test('no discount below the cart minimum', async ({ api, guestPage }) => {
      await saveModuleSettings(api, id, {
        discount_type: 'discount-amount',
        discount_amount_mode: 'fixed-amount',
        discount_amount_value: 5,
        cart_minimum_amount: 100,
      });
      await addToCart(guestPage, PRODUCTS.a.id);
      const cart = await storeCart(guestPage);
      expect(cart.fees).toEqual([]);
      expect(cart.total).toBe('1999');
    });
  });

  test.describe('Design', () => {
    const cases: [string, Record<string, unknown>, string, string, string][] = [
      ['Text Color applies to the bar', { text_color: '#445566' }, WRAP, 'color', 'rgb(68, 85, 102)'],
      // The icons are stroked lucide SVGs (stroke="currentColor"): the colour is `color`.
      ['Icon Color applies to the bar icon', { icon_color: '#123456' }, ICON, 'color', 'rgb(18, 52, 86)'],
      ['Close Button Color applies to the dismiss (X) icon', { close_icon_color: '#654321' }, REMOVE, 'color', 'rgb(101, 67, 33)'],
      ['CTA Background applies to the action button', { btn_color: '#aa0000' }, BTN, 'background-color', 'rgb(170, 0, 0)'],
      ['CTA Text Color applies to the action button text', { btn_text_color: '#00bb00' }, BTN, 'color', 'rgb(0, 187, 0)'],
    ];
    for (const [title, values, selector, prop, expected] of cases) {
      test(title, async ({ api, guestPage }) => {
        await saveModuleSettings(api, id, values);
        await gotoShopAsGuest(guestPage);
        expect(await computedStyle(guestPage, selector, prop)).toBe(expected);
      });
    }

    for (const [slug, family] of [
      ['roboto', 'Roboto'],
      ['lato', 'Lato'],
      ['montserrat', 'Montserrat'],
      ['ibm_plex_sans', 'IBM Plex Sans'],
      ['open_sans', 'Open Sans'],
    ] as const) {
      test(`Font Family "${slug}" applies to the bar text`, async ({ api, guestPage }) => {
        await saveModuleSettings(api, id, { font_family: slug });
        await gotoShopAsGuest(guestPage);
        expect(await computedStyle(guestPage, TEXT, 'font-family')).toContain(family);
      });
    }
  });

  test.describe('Pro', { tag: '@pro' }, () => {
    test('lite ignores the pro keys (position, height, font size, icon, devices)', async ({ api }) => {
      test.skip(await isPro(api), 'lite-only behaviour');
      const saved = await saveModuleSettings(api, id, {
        bar_position: 'bottom',
        banner_height: 80,
        font_size: 24,
        progressive_banner_icon_name: 'shipping-bar-icon-2',
        banner_device_view: [],
      });
      expect(saved.values).toMatchObject({
        bar_position: 'top',
        banner_height: 60,
        font_size: 20,
        progressive_banner_icon_name: 'shipping-bar-icon-1',
        banner_device_view: ['banner-show-desktop'],
      });
    });

    test('Bar Position "Bottom" pins the bar to the bottom', async ({ api, guestPage }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, id, { bar_position: 'bottom' });
      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'bottom')).toBe('0px');
    });

    test('Banner Height and Font Size apply to the bar', async ({ api, guestPage }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, id, { banner_height: 80, font_size: 24 });
      await gotoShopAsGuest(guestPage);
      expect(await computedStyle(guestPage, WRAP, 'height')).toBe('80px');
      expect(await computedStyle(guestPage, TEXT, 'font-size')).toBe('24px');
    });

    test('Show Banner without Desktop removes the bar on desktop', async ({ api, guestPage }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, id, { banner_device_view: [] });
      await guestPage.goto(STORE_PAGES.shop);
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });

    test('Page Targeting "Show on Specific Pages" hides the bar elsewhere', async ({ api, guestPage }) => {
      test.skip(!(await isPro(api)), 'StoreGrowth Pro required');
      await saveModuleSettings(api, id, { banner_show_option: 'banner-show-selected', slected_page_option: ['is_front_page'] });
      await guestPage.goto(STORE_PAGES.shop);
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });
  });

  test.describe('Visibility', () => {
    test('bar is not shown to a logged-in admin (promotions are guest-only)', async ({ page }) => {
      await page.goto(STORE_PAGES.shop);
      await expect(page.locator(WRAP)).toHaveCount(0);
    });

    test('no bar when the module is inactive', async ({ api, guestPage }) => {
      await setModuleStatus(api, id, false);
      await guestPage.goto(STORE_PAGES.shop);
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
      await expect(guestPage.locator('body')).not.toHaveClass(/show_discount_banner/);
    });
  });

  // Last: the UI toggle churns shared state.
  test.describe('Enable', { tag: '@admin' }, () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.freeShipping.name, false);
      await setModuleState(page, MODULES.freeShipping.name, true);
      await expect(moduleToggle(page, MODULES.freeShipping.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
