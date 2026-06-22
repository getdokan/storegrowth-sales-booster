import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { addToCart, emptyCart } from '../../helpers/storefront';
import { getProductIdBySlug, apiFetch } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

/**
 * Upsell Order Bump — an offer shown on the checkout page when the cart matches
 * a configured bump (OrderBump::bump_product_frontend_view on the classic
 * `woocommerce_review_order_before_submit` hook).
 *
 * Requires the CLASSIC checkout (provisioning sets the `[woocommerce_checkout]`
 * shortcode — the block checkout does not fire the hook; ISSUES.md #7), a bump
 * whose target matches a cart product, and that product in the cart.
 *
 * Marker (verified live): `.offer-main-wrap` (with an opt-in checkbox).
 * `upsell-order-bump` is baseline-active; this spec restores it to active.
 */
const BUMP = '.offer-main-wrap';
const REST = '/wp-json/spsg/v1/order-bumps';

async function deleteAllBumps(page: any) {
  const res = await apiFetch(page, 'get', `${REST}?per_page=100&page=1`);
  const bumps = await res.json();
  for (const b of Array.isArray(bumps) ? bumps : []) {
    await apiFetch(page, 'delete', `${REST}/${b.id}`).catch(() => {});
  }
}

async function createBump(page: any, targetId: number, offerId: number) {
  const res = await apiFetch(page, 'post', REST, {
    name: 'E2E Checkout Bump',
    status: 'active',
    target_type: 'products',
    target_products: [targetId],
    offer_product_id: offerId,
    offer_type: 'discount',
    offer_amount: '10',
  });
  expect(res.status()).toBe(201);
  return (await res.json()).id as number | string;
}

test.describe('Storefront · Upsell Order Bump', () => {
  let createdBumpId: number | string | undefined;

  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.upsellOrderBump.id, true);
    await deleteAllBumps(page); // isolation: no bumps from other runs
    await emptyCart(page);
  });

  test.afterEach(async ({ page }) => {
    if (createdBumpId) {
      await apiFetch(page, 'delete', `${REST}/${createdBumpId}`).catch(() => {});
      createdBumpId = undefined;
    }
    await emptyCart(page);
    // Restore baseline: order bump stays active.
    await setModuleActive(page, MODULES.upsellOrderBump.id, true);
  });

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.upsellOrderBump.name, false);
    await setModuleState(page, MODULES.upsellOrderBump.name, true);
    await expect(moduleToggle(page, MODULES.upsellOrderBump.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive --------------------------------------------------------------

  test('shows the order bump on checkout when the cart matches', async ({ page }) => {
    const targetId = await getProductIdBySlug(page, PRODUCTS.a.slug);
    const offerId = await getProductIdBySlug(page, PRODUCTS.b.slug);
    createdBumpId = await createBump(page, targetId, offerId);

    await addToCart(page, targetId); // target product in cart
    await page.goto('/checkout/');

    await expect(page.locator(BUMP).first()).toBeVisible();
    await expect(page.locator(`${BUMP} input[type="checkbox"]`).first()).toBeVisible();
  });

  // ---- Negative --------------------------------------------------------------

  test('no order bump on checkout when no bump is configured', async ({ page }) => {
    const targetId = await getProductIdBySlug(page, PRODUCTS.a.slug);
    await addToCart(page, targetId);
    await page.goto('/checkout/');

    await expect(page.locator(BUMP)).toHaveCount(0);
  });

  test('no order bump when the cart does not contain the targeted product', async ({ page }) => {
    const targetId = await getProductIdBySlug(page, PRODUCTS.a.slug);
    const offerId = await getProductIdBySlug(page, PRODUCTS.b.slug);
    createdBumpId = await createBump(page, targetId, offerId);

    // Put a DIFFERENT, non-targeted product in the cart.
    const otherId = await getProductIdBySlug(page, PRODUCTS.c.slug);
    await addToCart(page, otherId);
    await page.goto('/checkout/');

    await expect(page.locator(BUMP)).toHaveCount(0);
  });

  test('no order bump when the module is inactive', async ({ page }) => {
    const targetId = await getProductIdBySlug(page, PRODUCTS.a.slug);
    const offerId = await getProductIdBySlug(page, PRODUCTS.b.slug);
    createdBumpId = await createBump(page, targetId, offerId);
    await addToCart(page, targetId);

    await setModuleActive(page, MODULES.upsellOrderBump.id, false);
    await page.goto('/checkout/');

    await expect(page.locator(BUMP)).toHaveCount(0);
  });
});
