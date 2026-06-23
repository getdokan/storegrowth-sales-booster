import { test, expect } from '../../fixtures/test';
import { setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { addToCart, emptyCart, computedStyle } from '../../helpers/storefront';
import { getProductIdBySlug, apiFetch } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Requires the CLASSIC checkout: block checkout does not fire the hook (ISSUES.md #7).
const BUMP = '.offer-main-wrap';
const REST = '/wp-json/spsg/v1/order-bumps';

async function deleteAllBumps(page: any) {
  const res = await apiFetch(page, 'get', `${REST}?per_page=100&page=1`);
  const bumps = await res.json();
  for (const b of Array.isArray(bumps) ? bumps : []) {
    await apiFetch(page, 'delete', `${REST}/${b.id}`).catch(() => {});
  }
}

async function createBump(
  page: any,
  targetId: number,
  offerId: number,
  { design = {}, ...extra }: { design?: Record<string, any> } & Record<string, any> = {},
) {
  const res = await apiFetch(page, 'post', REST, {
    name: 'E2E Checkout Bump',
    status: 'active',
    target_type: 'products',
    target_products: [targetId],
    bump_schedule: ['daily'],
    offer_product_id: offerId,
    offer_type: 'discount',
    offer_amount: '10',
    offer_discount_title: '% OFF TODAY',
    design_settings: {
      box_border_style: 'solid',
      box_border_color: '#0000ff',
      box_top_margin: '10',
      box_bottom_margin: '10',
      discount_background_color: '#ff0000',
      discount_text_color: '#ffffff',
      discount_font_size: '16',
      product_description_text_color: '#333333',
      product_description_font_size: '13',
      ...design,
    },
    ...extra,
  });
  expect(res.status()).toBe(201);
  return (await res.json()).id as number | string;
}

test.describe('Storefront · Upsell Order Bump', () => {
  let createdBumpId: number | string | undefined;

  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.upsellOrderBump.id, true);
    await deleteAllBumps(page);
    await emptyCart(page);
  });

  test.afterEach(async ({ page }) => {
    if (createdBumpId) {
      await apiFetch(page, 'delete', `${REST}/${createdBumpId}`).catch(() => {});
      createdBumpId = undefined;
    }
    await emptyCart(page);
    await setModuleActive(page, MODULES.upsellOrderBump.id, true);
  });

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.upsellOrderBump.name, false);
    await setModuleState(page, MODULES.upsellOrderBump.name, true);
    await expect(moduleToggle(page, MODULES.upsellOrderBump.name)).toHaveAttribute('aria-checked', 'true');
  });

  test('shows the order bump on checkout when the cart matches', async ({ page }) => {
    const targetId = await getProductIdBySlug(page, PRODUCTS.a.slug);
    const offerId = await getProductIdBySlug(page, PRODUCTS.b.slug);
    createdBumpId = await createBump(page, targetId, offerId);

    await addToCart(page, targetId);
    await page.goto('/checkout/');

    await expect(page.locator(BUMP).first()).toBeVisible();
    await expect(page.locator(`${BUMP} input[type="checkbox"]`).first()).toBeVisible();
  });

  test('every configured Form & Design field is reflected on the checkout bump', async ({ page }) => {
    const targetId = await getProductIdBySlug(page, PRODUCTS.a.slug);
    const offerId = await getProductIdBySlug(page, PRODUCTS.b.slug);
    createdBumpId = await createBump(page, targetId, offerId, {
      design: { offer_product_title: PRODUCTS.b.name },
    });

    await addToCart(page, targetId);
    await page.goto('/checkout/');

    const bump = page.locator(BUMP).first();
    await expect(bump).toBeVisible();

    await expect(bump.locator('.offer-product-title')).toContainText(PRODUCTS.b.name);
    await expect(bump.locator('.dynamic-offer-text')).toContainText('10');
    await expect(bump.locator('.dynamic-offer-text')).toContainText('% OFF TODAY');

    expect(await computedStyle(page, `${BUMP} .dynamic-offer-text`, 'background-color')).toBe('rgb(255, 0, 0)');
    expect(await computedStyle(page, BUMP, 'border-top-color')).toBe('rgb(0, 0, 255)');
    expect(await computedStyle(page, BUMP, 'border-top-style')).toBe('solid');
    expect(await computedStyle(page, `${BUMP} .offer-product-title h3`, 'color')).toBe('rgb(51, 51, 51)');
  });

  test('the bump applies the offer product to the order when accepted', async ({ page }) => {
    const targetId = await getProductIdBySlug(page, PRODUCTS.a.slug);
    const offerId = await getProductIdBySlug(page, PRODUCTS.b.slug);
    createdBumpId = await createBump(page, targetId, offerId);

    await addToCart(page, targetId);
    await page.goto('/checkout/');

    await page.locator(`${BUMP} input[type="checkbox"]`).first().check();
    await expect(page.locator('.woocommerce-checkout-review-order, #order_review')).toContainText(PRODUCTS.b.name, {
      timeout: 15000,
    });
  });

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
