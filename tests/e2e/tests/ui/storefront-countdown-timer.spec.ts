import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { getProductIdBySlug, setProductMeta, updateProduct, dateOffset } from '../../helpers/wc';
import { gotoProduct } from '../../helpers/storefront';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Countdown Timer — user-facing behaviour on the single product page.
 *
 * Render gate (CommonHooks::show_countdown_timer_template + template +
 * Helper::is_product_discountable): module active, product in stock, and a valid
 * per-product discount (amount + end set, start ≤ now ≤ end). When it renders it
 * also discounts the price and marks the product on sale.
 *
 * Marker: `.spsg-countdown-timer` with `.spsg-countdown-timer-items[data-end-date]`.
 * Config is the product meta the Countdown Timer product tab writes
 * (`_spsg_countdown_timer_discount_{amount,start,end}`). Owns the
 * `countdown-timer` module; restores baseline (inactive) + clears product meta.
 */
const MARKER = '.spsg-countdown-timer';
const META = {
  amount: '_spsg_countdown_timer_discount_amount',
  start: '_spsg_countdown_timer_discount_start',
  end: '_spsg_countdown_timer_discount_end',
};

/** Configure a current, valid discount on a product. */
async function setActiveDiscount(page: any, id: number, amount = '20') {
  await setProductMeta(page, id, {
    [META.amount]: amount,
    [META.start]: dateOffset(-1, '00:00:00'),
    [META.end]: dateOffset(30, '23:59:59'),
  });
}

/** Remove any countdown config from a product. */
async function clearDiscount(page: any, id: number) {
  await setProductMeta(page, id, { [META.amount]: '', [META.start]: '', [META.end]: '' });
}

test.describe('Storefront · Countdown Timer', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.countdownTimer.id, true);
  });

  test.afterEach(async ({ page }) => {
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

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.countdownTimer.name, false);
    await setModuleState(page, MODULES.countdownTimer.name, true);
    await expect(moduleToggle(page, MODULES.countdownTimer.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive --------------------------------------------------------------

  test('renders the timer on a product with a valid, current discount', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await setActiveDiscount(page, id, '20');

    await gotoProduct(page, PRODUCTS.a.slug);

    const timer = page.locator(MARKER);
    await expect(timer).toBeVisible();
    // The four counter units + the end date the JS ticks down to.
    await expect(page.locator('.spsg-countdown-timer-item-days')).toBeVisible();
    await expect(page.locator('.spsg-countdown-timer-item-hours')).toBeVisible();
    await expect(page.locator('.spsg-countdown-timer-item-minutes')).toBeVisible();
    await expect(page.locator('.spsg-countdown-timer-item-seconds')).toBeVisible();
    await expect(page.locator('.spsg-countdown-timer-items')).toHaveAttribute('data-end-date', /\d{4}-\d{2}-\d{2}/);
  });

  test('heading shows the configured discount percentage', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await setActiveDiscount(page, id, '25');

    await gotoProduct(page, PRODUCTS.a.slug);
    // Default heading "Last chance! [discount]% OFF" → substitutes the amount.
    await expect(page.locator('.spsg-countdown-timer-heading')).toContainText('25');
  });

  test('discounts the price and marks the product on sale', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug); // $19.99 → 20% → $15.99
    await setActiveDiscount(page, id, '20');

    await gotoProduct(page, PRODUCTS.a.slug);
    const price = page.locator('.summary p.price');
    await expect(price).toContainText('15.99');
    // Original price is shown struck-through alongside the sale price.
    await expect(price.locator('del')).toBeVisible();
    await expect(page.locator('.summary .onsale, .product .onsale').first()).toBeVisible();
  });

  // ---- Negative --------------------------------------------------------------

  test('no timer on a product without any discount configured', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.b.slug);
    await clearDiscount(page, id);

    await gotoProduct(page, PRODUCTS.b.slug);
    await expect(page.locator(MARKER)).toHaveCount(0);
    await expect(page.locator('.summary p.price del')).toHaveCount(0); // not discounted
  });

  test('no timer when the discount window has already ended', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.b.slug);
    // End date in the past → is_product_discountable() returns false.
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
    // Start date in the future → not yet discountable.
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
    await setActiveDiscount(page, id, '20');
    await updateProduct(page, id, { manage_stock: false, stock_status: 'outofstock' });

    await gotoProduct(page, PRODUCTS.c.slug);
    await expect(page.locator(MARKER)).toHaveCount(0);
  });

  test('no timer when the module is inactive', async ({ page }) => {
    const id = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await setActiveDiscount(page, id, '20');
    await setModuleActive(page, MODULES.countdownTimer.id, false);

    await gotoProduct(page, PRODUCTS.a.slug);
    await expect(page.locator(MARKER)).toHaveCount(0);
  });
});
