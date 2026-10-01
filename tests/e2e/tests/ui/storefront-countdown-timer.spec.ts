import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { getProductIdBySlug, setProductMeta, updateProduct, dateOffset } from '../../helpers/wc';
import { computedStyle, gotoProduct, gotoShop } from '../../helpers/storefront';
import { gotoSettings, openTab, saveSettings, setColor, setText } from '../../helpers/settings-ui';
import {
  getModuleSettings,
  hasPro,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Render gate: module active, product in stock, and a valid per-product discount
// (amount + end set, start ≤ now ≤ end). Per-product config is product meta;
// the design settings live in spsg_countdown_timer_settings and reach the
// storefront as `--spsg-countdown-timer-*` CSS variables (ADR-005) — so the
// design checks read COMPUTED styles, never the inline style attribute.
const id = MODULES.countdownTimer.id;
const MARKER = '.spsg-countdown-timer';
const HEADING = '.spsg-countdown-timer-heading';
const ITEM = '.spsg-countdown-timer-item';
const ITEMS = '.spsg-countdown-timer-items';
const META = {
  amount: '_spsg_countdown_timer_discount_amount',
  start: '_spsg_countdown_timer_discount_start',
  end: '_spsg_countdown_timer_discount_end',
};

async function setDiscount(page: Page, productId: number, amount = '20', end = dateOffset(30, '23:59:59')) {
  await setProductMeta(page, productId, {
    [META.amount]: amount,
    [META.start]: dateOffset(-1, '00:00:00'),
    [META.end]: end,
  });
}

async function clearDiscount(page: Page, productId: number) {
  await setProductMeta(page, productId, { [META.amount]: '', [META.start]: '', [META.end]: '' });
}

test.describe('Storefront · Countdown Timer', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
  });

  test.afterEach(async ({ page, api }) => {
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
    for (const slug of [PRODUCTS.a.slug, PRODUCTS.b.slug, PRODUCTS.c.slug]) {
      await clearDiscount(page, await getProductIdBySlug(page, slug));
    }
    await updateProduct(page, await getProductIdBySlug(page, PRODUCTS.c.slug), {
      manage_stock: true,
      stock_quantity: 100,
      stock_status: 'instock',
    });
  });

  test.describe('Render behaviour', () => {
    test('renders the timer on a product with a valid, current discount', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, pid, '20');

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MARKER).first()).toBeVisible();
      await expect(page.locator('.spsg-countdown-timer-item-days')).toBeVisible();
      await expect(page.locator('.spsg-countdown-timer-item-hours')).toBeVisible();
      await expect(page.locator('.spsg-countdown-timer-item-minutes')).toBeVisible();
      await expect(page.locator('.spsg-countdown-timer-item-seconds')).toBeVisible();
      await expect(page.locator(ITEMS)).toHaveAttribute('data-end-date', /\d{4}-\d{2}-\d{2}/);
    });

    test('heading shows the configured discount percentage', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, pid, '25');
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(HEADING)).toContainText('25');
    });

    test('discounts the price and marks the product on sale', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.a.slug); // $19.99 → 20% off → $15.99
      await setDiscount(page, pid, '20');
      await gotoProduct(page, PRODUCTS.a.slug);
      const price = page.locator('.summary p.price');
      await expect(price).toContainText('15.99');
      await expect(price.locator('del')).toBeVisible();
      await expect(page.locator('.summary .onsale, .product .onsale').first()).toBeVisible();
    });

    test('no timer on a product without any discount configured', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await clearDiscount(page, pid);
      await gotoProduct(page, PRODUCTS.b.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
      await expect(page.locator('.summary p.price del')).toHaveCount(0);
    });

    test('no timer when the discount window has already ended', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await setProductMeta(page, pid, {
        [META.amount]: '20',
        [META.start]: dateOffset(-10, '00:00:00'),
        [META.end]: dateOffset(-1, '23:59:59'),
      });
      await gotoProduct(page, PRODUCTS.b.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });

    test('no timer when the discount has not started yet', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await setProductMeta(page, pid, {
        [META.amount]: '20',
        [META.start]: dateOffset(5, '00:00:00'),
        [META.end]: dateOffset(30, '23:59:59'),
      });
      await gotoProduct(page, PRODUCTS.b.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });

    test('no timer on an out-of-stock product even with a valid discount', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.c.slug);
      await setDiscount(page, pid, '20');
      await updateProduct(page, pid, { manage_stock: false, stock_status: 'outofstock' });
      await gotoProduct(page, PRODUCTS.c.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });

    test('no timer when the module is inactive', async ({ page, api }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, pid, '20');
      await setModuleStatus(api, id, false);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });
  });

  test.describe('Accuracy', () => {
    test('counts down to the exact end date configured on the product', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const end = dateOffset(3, '08:30:00');
      await setDiscount(page, pid, '20', end);

      await gotoProduct(page, PRODUCTS.a.slug);

      await expect(page.locator(ITEMS)).toHaveAttribute('data-end-date', end);
      await expect(page.locator('.spsg-countdown-timer-item-days')).not.toHaveText('00');

      // Compute remaining time in-browser so the timezone matches the countdown JS.
      const deltaSec = await page.evaluate(() => {
        const n = (s: string) => parseInt(document.querySelector(s)!.textContent!.trim(), 10);
        const d = n('.spsg-countdown-timer-item-days');
        const h = n('.spsg-countdown-timer-item-hours');
        const m = n('.spsg-countdown-timer-item-minutes');
        const s = n('.spsg-countdown-timer-item-seconds');
        const ui = ((d * 24 + h) * 60 + m) * 60 + s;
        const endAttr = document.querySelector('.spsg-countdown-timer-items')!.getAttribute('data-end-date')!;
        const expected = Math.round((new Date(endAttr.replace(' ', 'T')).getTime() - Date.now()) / 1000);
        return ui - expected;
      });
      expect(Math.abs(deltaSec)).toBeLessThan(120);
    });

    test('a shorter end date shows fewer days remaining', async ({ page }) => {
      const pid = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, pid, '20', dateOffset(1, '23:59:59'));
      await gotoProduct(page, PRODUCTS.a.slug);
      const days = parseInt((await page.locator('.spsg-countdown-timer-item-days').textContent())!.trim(), 10);
      expect(days).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Design', () => {
    test.beforeEach(async ({ page }) => {
      // The timer needs a discountable product to render.
      await setDiscount(page, await getProductIdBySlug(page, PRODUCTS.a.slug), '20');
    });

    for (const layout of ['ct-layout-1', 'ct-layout-2', 'ct-dark']) {
      test(`template "${layout}" is applied to the timer`, async ({ page, api }) => {
        test.skip(layout === 'ct-layout-2' && (await hasPro(api)), "with pro the saved counter background decides ct-layout-2's class");
        await saveModuleSettings(api, id, { selected_theme: layout });
        await gotoProduct(page, PRODUCTS.a.slug);
        await expect(page.locator(MARKER).first()).toHaveClass(new RegExp(`\\b${layout}\\b`));
      });
    }

    test('the removed "ct-custom" layout is refused and the stored template kept', async ({ api }) => {
      // countdown-timer.md §5: only the six templates and two old layouts are valid.
      const before = (await getModuleSettings(api, id)).values.selected_theme;
      const res = await api.post(`/wp-json/sales-booster/v1/settings/${id}`, {
        data: { values: { selected_theme: 'ct-custom' } },
      });
      expect(res.status()).toBe(400);
      expect((await getModuleSettings(api, id)).values.selected_theme).toBe(before);
    });

    test('on lite the counter colours come from the template (pro keys ignored)', async ({ page, api }) => {
      test.skip(await hasPro(api), 'lite-only: with pro the saved counter colours win');
      // The pro key is ignored by the engine on lite; ct-dark's counter background is #1E293B.
      await saveModuleSettings(api, id, { selected_theme: 'ct-dark', counter_background_color: '#00ff00' });
      expect((await getModuleSettings(api, id)).values.counter_background_color).not.toBe('#00ff00');
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, ITEM, 'background-color')).toBe('rgb(30, 41, 59)');
    });

    test('border color is applied to the timer wrapper', async ({ page, api }) => {
      await saveModuleSettings(api, id, { border_color: '#ff0000' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, MARKER, 'border-top-color')).toBe('rgb(255, 0, 0)');
    });

    test('widget background color is applied to the timer wrapper', async ({ page, api }) => {
      await saveModuleSettings(api, id, { widget_background_color: '#123456' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, MARKER, 'background-color')).toBe('rgb(18, 52, 86)');
    });

    test('widget radius is applied to the timer wrapper', async ({ page, api }) => {
      await saveModuleSettings(api, id, { widget_radius: 17 });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, MARKER, 'border-top-left-radius')).toBe('17px');
    });

    test('heading text color is applied to the heading', async ({ page, api }) => {
      await saveModuleSettings(api, id, { heading_text_color: '#0a0b0c' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, HEADING, 'color')).toBe('rgb(10, 11, 12)');
    });

    for (const [value, css] of [
      ['roboto', 'Roboto'],
      ['poppins', 'Poppins'],
      ['montserrat', 'Montserrat'],
    ] as const) {
      test(`font family "${value}" renders as ${css}`, async ({ page, api }) => {
        await saveModuleSettings(api, id, { font_family: value });
        await gotoProduct(page, PRODUCTS.a.slug);
        expect(await computedStyle(page, HEADING, 'font-family')).toContain(css);
      });
    }

    test('countdown heading substitutes the discount percentage', async ({ page, api }) => {
      await saveModuleSettings(api, id, { countdown_heading: 'Hurry — [discount]% gone soon' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(HEADING)).toContainText('Hurry — 20% gone soon');
    });

    test('product page display off hides the timer on the product page', async ({ page, api }) => {
      await saveModuleSettings(api, id, { product_page_countdown_enable: false });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });

    test('counter digit/background/border colours apply (Pro)', { tag: ['@pro'] }, async ({ page, api }) => {
      test.skip(!(await hasPro(api)), 'requires Pro');
      await saveModuleSettings(api, id, {
        day_text_color: '#00ff00',
        counter_background_color: '#222222',
        counter_border_color: '#333333',
      });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await computedStyle(page, '.spsg-countdown-timer-item-days', 'color')).toBe('rgb(0, 255, 0)');
      expect(await computedStyle(page, ITEM, 'background-color')).toBe('rgb(34, 34, 34)');
      expect(await computedStyle(page, ITEM, 'border-top-color')).toBe('rgb(51, 51, 51)');
    });

    test('shop countdown shows on the shop loop when enabled (Pro)', { tag: ['@pro'] }, async ({ page, api }) => {
      test.skip(!(await hasPro(api)), 'requires Pro');
      await saveModuleSettings(api, id, { shop_page_countdown_enable: true, border_color: '#ff0000' });
      await gotoShop(page);
      await expect(page.locator(MARKER).first()).toBeVisible();
      expect(await computedStyle(page, MARKER, 'border-top-color')).toBe('rgb(255, 0, 0)');
    });

    test('shop countdown hidden on the shop loop when disabled (Pro)', { tag: ['@pro'] }, async ({ page, api }) => {
      test.skip(!(await hasPro(api)), 'requires Pro');
      await saveModuleSettings(api, id, { shop_page_countdown_enable: false });
      await gotoShop(page);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });
  });

  test.describe('Admin form', () => {
    test('editing heading + heading color in the settings page updates the timer', async ({ page }) => {
      await setDiscount(page, await getProductIdBySlug(page, PRODUCTS.a.slug), '20');

      // The SaveBar saves the open tab only: save Configure before Design.
      await gotoSettings(page, id, 'configure');
      await setText(page, 'Countdown Heading', 'Ends soon: [discount]% OFF');
      await saveSettings(page, id);
      await openTab(page, 'Design');
      await setColor(page, 'Heading Color', '#ff0000');
      await saveSettings(page, id);

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(HEADING)).toContainText('Ends soon: 20% OFF');
      expect(await computedStyle(page, HEADING, 'color')).toBe('rgb(255, 0, 0)');
    });
  });

  // Last: the UI toggle churns shared state.
  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.countdownTimer.name, false);
      await setModuleState(page, MODULES.countdownTimer.name, true);
      await expect(moduleToggle(page, MODULES.countdownTimer.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
