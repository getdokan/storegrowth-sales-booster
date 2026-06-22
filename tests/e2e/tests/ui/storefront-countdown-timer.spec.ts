import { test, expect } from '../../fixtures/test';
import { setModuleActive, moduleAjax, getIsPro } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { getProductIdBySlug, setProductMeta, updateProduct, dateOffset } from '../../helpers/wc';
import { gotoProduct, gotoShop } from '../../helpers/storefront';
import { gotoModuleSettings, openTab, saveForm, setTextField, setColor } from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Countdown Timer — the full module spec (render behaviour + design settings +
 * countdown accuracy). One spec per module.
 *
 * Render gate (CommonHooks + template + Helper::is_product_discountable): module
 * active, product in stock, and a valid per-product discount (amount + end set,
 * start ≤ now ≤ end). When it renders it also discounts the price and marks the
 * product on sale, and the JS ticks down to the configured end date.
 *
 * Marker: `.spsg-countdown-timer` with `.spsg-countdown-timer-items[data-end-date]`.
 * Per-product config = the meta the Countdown Timer product tab writes
 * (`_spsg_countdown_timer_discount_{amount,start,end}`). Module/global design
 * settings live in `spsg_countdown_timer_settings` (flat form_data ajax) and map
 * to inline styles on the storefront. Countdown Timer is baseline-active.
 */
const MARKER = '.spsg-countdown-timer';
const HEADING = '.spsg-countdown-timer-heading';
const ITEM = '.spsg-countdown-timer-item';
const ITEMS = '.spsg-countdown-timer-items';
const META = {
  amount: '_spsg_countdown_timer_discount_amount',
  start: '_spsg_countdown_timer_discount_start',
  end: '_spsg_countdown_timer_discount_end',
};

/** Configure a current, valid discount on a product (optionally a precise end). */
async function setDiscount(page: any, id: number, amount = '20', end = dateOffset(30, '23:59:59')) {
  await setProductMeta(page, id, {
    [META.amount]: amount,
    [META.start]: dateOffset(-1, '00:00:00'),
    [META.end]: end,
  });
}

/** Remove any countdown config from a product. */
async function clearDiscount(page: any, id: number) {
  await setProductMeta(page, id, { [META.amount]: '', [META.start]: '', [META.end]: '' });
}

/** Save global countdown settings (flat form_data; replaces the option). */
async function saveCountdown(page: any, overrides: Record<string, unknown> = {}) {
  return moduleAjax(page, 'spsg_countdown_timer_save_settings', {
    form_data: { selected_theme: 'ct-layout-1', product_page_countdown_enable: '1', ...overrides },
  });
}

/** Inline style of the first matching element on the current page. */
async function styleOf(page: any, selector: string): Promise<string> {
  return (await page.locator(selector).first().getAttribute('style')) ?? '';
}

test.describe('Storefront · Countdown Timer', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.countdownTimer.id, true);
  });

  test.afterEach(async ({ page }) => {
    // Restore baseline: default settings, no product discounts, stock restored.
    await saveCountdown(page, { selected_theme: 'ct-custom' });
    for (const slug of [PRODUCTS.a.slug, PRODUCTS.b.slug, PRODUCTS.c.slug]) {
      await clearDiscount(page, await getProductIdBySlug(page, slug));
    }
    await updateProduct(page, await getProductIdBySlug(page, PRODUCTS.c.slug), {
      manage_stock: true,
      stock_quantity: 100,
      stock_status: 'instock',
    });
    await setModuleActive(page, MODULES.countdownTimer.id, true);
  });

  // ===== Render behaviour ====================================================

  test.describe('Render behaviour', () => {
    test('renders the timer on a product with a valid, current discount', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, id, '20');

      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MARKER).first()).toBeVisible();
      await expect(page.locator('.spsg-countdown-timer-item-days')).toBeVisible();
      await expect(page.locator('.spsg-countdown-timer-item-hours')).toBeVisible();
      await expect(page.locator('.spsg-countdown-timer-item-minutes')).toBeVisible();
      await expect(page.locator('.spsg-countdown-timer-item-seconds')).toBeVisible();
      await expect(page.locator(ITEMS)).toHaveAttribute('data-end-date', /\d{4}-\d{2}-\d{2}/);
    });

    test('heading shows the configured discount percentage', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, id, '25');
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(HEADING)).toContainText('25');
    });

    test('discounts the price and marks the product on sale', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug); // $19.99 → 20% → $15.99
      await setDiscount(page, id, '20');
      await gotoProduct(page, PRODUCTS.a.slug);
      const price = page.locator('.summary p.price');
      await expect(price).toContainText('15.99');
      await expect(price.locator('del')).toBeVisible();
      await expect(page.locator('.summary .onsale, .product .onsale').first()).toBeVisible();
    });

    test('no timer on a product without any discount configured', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await clearDiscount(page, id);
      await gotoProduct(page, PRODUCTS.b.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
      await expect(page.locator('.summary p.price del')).toHaveCount(0);
    });

    test('no timer when the discount window has already ended', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await setProductMeta(page, id, {
        [META.amount]: '20',
        [META.start]: dateOffset(-10, '00:00:00'),
        [META.end]: dateOffset(-1, '23:59:59'),
      });
      await gotoProduct(page, PRODUCTS.b.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });

    test('no timer when the discount has not started yet', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.b.slug);
      await setProductMeta(page, id, {
        [META.amount]: '20',
        [META.start]: dateOffset(5, '00:00:00'),
        [META.end]: dateOffset(30, '23:59:59'),
      });
      await gotoProduct(page, PRODUCTS.b.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });

    test('no timer on an out-of-stock product even with a valid discount', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.c.slug);
      await setDiscount(page, id, '20');
      await updateProduct(page, id, { manage_stock: false, stock_status: 'outofstock' });
      await gotoProduct(page, PRODUCTS.c.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });

    test('no timer when the module is inactive', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, id, '20');
      await setModuleActive(page, MODULES.countdownTimer.id, false);
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });
  });

  // ===== Countdown accuracy ==================================================

  test.describe('Accuracy', () => {
    test('counts down to the exact end date configured on the product', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      const end = dateOffset(3, '08:30:00'); // a precise future moment
      await setDiscount(page, id, '20', end);

      await gotoProduct(page, PRODUCTS.a.slug);

      // The end the merchant set is wired through to the widget verbatim.
      await expect(page.locator(ITEMS)).toHaveAttribute('data-end-date', end);
      // The JS populates the units (days no longer the server placeholder "00").
      await expect(page.locator('.spsg-countdown-timer-item-days')).not.toHaveText('00');

      // The displayed remaining time matches the time-to-end (computed in-browser
      // so the timezone is identical to the countdown JS). Allow tick latency.
      const deltaSec = await page.evaluate(() => {
        const n = (s: string) => parseInt(document.querySelector(s)!.textContent!.trim(), 10);
        const d = n('.spsg-countdown-timer-item-days');
        const h = n('.spsg-countdown-timer-item-hours');
        const m = n('.spsg-countdown-timer-item-minutes');
        const s = n('.spsg-countdown-timer-item-seconds');
        const ui = ((d * 24 + h) * 60 + m) * 60 + s;
        const endAttr = document
          .querySelector('.spsg-countdown-timer-items')!
          .getAttribute('data-end-date')!;
        const expected = Math.round((new Date(endAttr.replace(' ', 'T')).getTime() - Date.now()) / 1000);
        return ui - expected;
      });
      expect(Math.abs(deltaSec)).toBeLessThan(120);
    });

    test('a shorter end date shows fewer days remaining', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, id, '20', dateOffset(1, '23:59:59')); // ~1 day left
      await gotoProduct(page, PRODUCTS.a.slug);
      const days = parseInt(
        (await page.locator('.spsg-countdown-timer-item-days').textContent())!.trim(),
        10,
      );
      expect(days).toBeLessThanOrEqual(1);
    });
  });

  // ===== Design / General settings → storefront ==============================

  test.describe('Design', () => {
    test.beforeEach(async ({ page }) => {
      // The timer needs a discountable product to render.
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, id, '20');
    });

    for (const layout of ['ct-layout-1', 'ct-layout-2', 'ct-custom']) {
      test(`layout "${layout}" is applied to the timer`, async ({ page }) => {
        // Selecting a layout also sets counter_background_color; for non-ct-layout-1
        // the template keeps the layout class only when that is 'transparent'.
        await saveCountdown(page, { selected_theme: layout, counter_background_color: 'transparent' });
        await gotoProduct(page, PRODUCTS.a.slug);
        await expect(page.locator(MARKER).first()).toHaveClass(new RegExp(layout));
      });
    }

    test('border color is applied to the timer wrapper', async ({ page }) => {
      await saveCountdown(page, { border_color: '#ff0000' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await styleOf(page, MARKER)).toContain('#ff0000');
    });

    test('widget background color is applied to the timer wrapper', async ({ page }) => {
      await saveCountdown(page, { widget_background_color: '#123456' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await styleOf(page, MARKER)).toContain('#123456');
    });

    test('heading text color is applied to the heading', async ({ page }) => {
      await saveCountdown(page, { selected_theme: 'ct-layout-1', heading_text_color: '#0a0b0c' });
      await gotoProduct(page, PRODUCTS.a.slug);
      expect(await styleOf(page, HEADING)).toContain('#0a0b0c');
    });

    for (const [value, css] of [
      ['roboto', 'Roboto'],
      ['poppins', 'Poppins'],
      ['montserrat', 'Montserrat'],
    ] as const) {
      test(`font family "${value}" renders as ${css}`, async ({ page }) => {
        await saveCountdown(page, { font_family: value });
        await gotoProduct(page, PRODUCTS.a.slug);
        expect(await styleOf(page, HEADING)).toContain(css);
      });
    }

    test('countdown heading substitutes the discount percentage', async ({ page }) => {
      await saveCountdown(page, { countdown_heading: 'Hurry — [discount]% gone soon' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(HEADING)).toContainText('Hurry — 20% gone soon');
    });

    test('product page display off hides the timer on the product page', async ({ page }) => {
      await saveCountdown(page, { product_page_countdown_enable: '0' });
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });

    test('counter unit text/background/border colours apply (Pro)', async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'requires Pro');
      await saveCountdown(page, {
        day_text_color: '#00ff00',
        counter_background_color: '#222222',
        counter_border_color: '#333333',
      });
      await gotoProduct(page, PRODUCTS.a.slug);
      const itemStyle = await styleOf(page, ITEM);
      expect(itemStyle).toContain('#00ff00');
      expect(itemStyle).toContain('#222222');
      expect(itemStyle).toContain('#333333');
    });

    test('shop countdown shows on the shop loop when enabled (Pro)', async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'requires Pro');
      await saveCountdown(page, { shop_page_countdown_enable: '1', border_color: '#ff0000' });
      await gotoShop(page);
      await expect(page.locator(MARKER).first()).toBeVisible();
      expect(await styleOf(page, MARKER)).toContain('#ff0000');
    });

    test('shop countdown hidden on the shop loop when disabled (Pro)', async ({ page }) => {
      test.skip(!(await getIsPro(page)), 'requires Pro');
      await saveCountdown(page, {}); // shop enable omitted → off
      await gotoShop(page);
      await expect(page.locator(MARKER)).toHaveCount(0);
    });
  });

  // ===== Admin form → storefront (driven through the real Settings UI) ========

  test.describe('Admin form', () => {
    test('editing heading + border via the Settings form updates the timer', async ({ page }) => {
      const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
      await setDiscount(page, id, '20'); // discountable so the timer renders

      // Change settings through the actual admin controls, then Save.
      await gotoModuleSettings(page, 'countdown-timer');
      await setTextField(page, 'Countdown Heading', 'Ends soon: [discount]% OFF');
      await openTab(page, 'Design');
      await setColor(page, 'Border Color', '#ff0000');
      await saveForm(page);

      // The storefront timer reflects exactly what was set from the admin form.
      await gotoProduct(page, PRODUCTS.a.slug);
      await expect(page.locator(HEADING)).toContainText('Ends soon: 20% OFF');
      const borderColor = await page
        .locator(MARKER)
        .first()
        .evaluate((el) => getComputedStyle(el).borderTopColor);
      expect(borderColor).toBe('rgb(255, 0, 0)');
    });
  });

  // ===== Module enable (last: the UI toggle churns shared state) ==============

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.countdownTimer.name, false);
      await setModuleState(page, MODULES.countdownTimer.name, true);
      await expect(moduleToggle(page, MODULES.countdownTimer.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
