import { APIRequestContext, Locator, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { addToCartApi, getCartTotals, lineFor } from '../../helpers/cart';
import { createBogoOffer, deleteBogoOffer } from '../../helpers/records';
import { expectOk, isModuleActive, setModuleStatus } from '../../helpers/rest';
import { SMART_COUPONS_MODULE, siteDate, trackCoupons, uniqueCode } from '../../helpers/smart-coupons';
import { MODULES } from '../../data/modules';
import { PRODUCTS, STORE_PAGES } from '../../data/products';

// Smart Coupons in the shopper's cart, on WooCommerce's Cart block (`/cart/`)
// and on the classic cart shortcode (a page this spec makes): a code coupon
// takes its discount, an unknown or ended one is refused with StoreGrowth's
// message, a Smart Coupon that doesn't allow other coupons keeps only the
// larger saving, an automatic coupon shows its name, and a BOGO deal that
// saves more wins over a coupon (ADR-014) — said once, not again on reload.
//
// Money is read from the Store API (helpers/cart.ts), in minor units.

const CLASSIC_CART_SLUG = 'e2e-classic-cart';
const CLASSIC_CART = `/${CLASSIC_CART_SLUG}/`;

/** Product B's price in minor units. */
const B = 4900;

/** A plain WooCommerce coupon (not a Smart Coupon), `percent` off. */
async function createPlainCoupon(api: APIRequestContext, code: string, amount: number): Promise<number> {
  const res = await api.post('/wp-json/wc/v3/coupons', { data: { code, discount_type: 'percent', amount: String(amount) } });
  await expectOk(res, `create plain coupon ${code}`);
  return (await res.json()).id;
}

async function deletePlainCoupon(api: APIRequestContext, id: number): Promise<void> {
  const res = await api.delete(`/wp-json/wc/v3/coupons/${id}`, { params: { force: true } });
  if (res.status() !== 404) await expectOk(res, `delete plain coupon ${id}`);
}

/* -- The two carts ---------------------------------------------------------- */

type Cart = {
  name: string;
  path: string;
  /** Apply a code; resolves once the cart has answered. */
  apply(page: Page, code: string): Promise<void>;
  /** Where the cart says a coupon was refused or another was kept. */
  notices(page: Page): Locator;
  /** The cart totals' discount rows. */
  totals(page: Page): Locator;
};

const blockCart: Cart = {
  name: 'Cart block',
  path: STORE_PAGES.cart,
  async apply(page, code) {
    // The panel may close itself after the previous coupon, a moment later:
    // open it, type and click Apply again until the click lands.
    const open = page.getByRole('button', { name: 'Add coupons' });
    const field = page.getByRole('textbox', { name: 'Enter code' });
    const answered = page.waitForResponse(
      (r) => r.request().method() === 'POST' && /\/wc\/store\/v1\/(batch|cart\/apply-coupon)/.test(decodeURIComponent(r.url())),
    );
    await expect(async () => {
      if (!(await field.isVisible())) await open.click();
      await field.fill(code, { timeout: 2000 });
      await page.getByRole('button', { name: 'Apply', exact: true }).click({ timeout: 2000 });
    }).toPass({ timeout: 15_000 });
    await answered;
    await expect(page.locator('.wc-block-components-totals-coupon__button.is-loading')).toHaveCount(0);
  },
  notices(page) {
    // Notices above the cart, and the coupon field's own error (an `alert`).
    return page.locator('.wc-block-components-notice-banner, [role="alert"]');
  },
  totals(page) {
    return page.locator('.wc-block-components-totals-discount, .wc-block-components-totals-coupon__content, .wc-block-cart__totals-title ~ *');
  },
};

const classicCart: Cart = {
  name: 'classic cart',
  path: CLASSIC_CART,
  async apply(page, code) {
    await page.getByPlaceholder('Coupon code').fill(code);
    const answered = page.waitForResponse((r) => r.url().includes('wc-ajax=apply_coupon'));
    await page.getByRole('button', { name: 'Apply coupon' }).click();
    await answered;
    await expect(page.locator('.blockUI')).toHaveCount(0);
  },
  notices(page) {
    // Notices above the cart, and the coupon field's own error (an `alert`).
    return page.locator('.woocommerce-error, .woocommerce-message, .woocommerce-info, .wc-block-components-notice-banner, [role="alert"]');
  },
  totals(page) {
    return page.locator('.cart_totals');
  },
};

/** Open a cart and wait until it is drawn. */
async function openCart(page: Page, cart: Cart): Promise<void> {
  await page.goto(cart.path);
  if (cart === blockCart) {
    await expect(page.locator('.wc-block-cart, .wc-block-components-totals-wrapper').first()).toBeVisible();
    await expect(page.locator('.wc-block-components-skeleton, .wc-block-components-loading-mask')).toHaveCount(0);
  } else {
    // WooCommerce's cart script answers the coupon form over ajax once loaded.
    await page.waitForLoadState('load');
    await expect(page.locator('.woocommerce-cart-form, .cart-empty').first()).toBeVisible();
  }
}

test.describe('Storefront · Smart Coupons', { tag: '@ui' }, () => {
  const made = trackCoupons();
  const plain: number[] = [];
  let classicPage = 0;
  let wasActive = false;

  test.beforeAll(async ({ api }) => {
    wasActive = await isModuleActive(api, SMART_COUPONS_MODULE);
    const page = await api.post('/wp-json/wp/v2/pages', {
      data: { title: 'E2E Classic Cart', slug: CLASSIC_CART_SLUG, status: 'publish', content: '<!-- wp:shortcode -->[woocommerce_cart]<!-- /wp:shortcode -->' },
    });
    await expectOk(page, 'create the classic cart page');
    classicPage = (await page.json()).id;
  });

  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, SMART_COUPONS_MODULE, true);
  });

  test.afterEach(async ({ api }) => {
    await made.cleanup(api);
    for (const id of plain.splice(0)) await deletePlainCoupon(api, id);
  });

  test.afterAll(async ({ api }) => {
    await setModuleStatus(api, SMART_COUPONS_MODULE, wasActive);
    if (classicPage) await api.delete(`/wp-json/wp/v2/pages/${classicPage}`, { params: { force: true } });
  });

  for (const cart of [blockCart, classicCart]) {
    test.describe(cart.name, () => {
      test('a code coupon takes its discount', async ({ guestPage: page, api }) => {
        const coupon = await made.create(api, { amount: 10 });
        await addToCartApi(page, PRODUCTS.b.id);

        await openCart(page, cart);
        await cart.apply(page, coupon.code);

        await expect(cart.notices(page).filter({ hasText: /applied/i }).first()).toBeVisible();
        expect((await getCartTotals(page)).discount).toBe(490);
      });

      test('an unknown code and an ended coupon are refused with StoreGrowth’s message', async ({ guestPage: page, api }) => {
        const ended = await made.create(api, { date_start: siteDate(-48), date_end: siteDate(-24) });
        await addToCartApi(page, PRODUCTS.b.id);
        await openCart(page, cart);

        const unknown = uniqueCode('nope');
        await cart.apply(page, unknown);
        await expect(cart.notices(page).filter({ hasText: `${unknown.toUpperCase()} isn't a valid coupon right now.` }).first()).toBeVisible();

        await cart.apply(page, ended.code);
        await expect(cart.notices(page).filter({ hasText: `${ended.code.toUpperCase()} isn't a valid coupon right now.` }).first()).toBeVisible();

        expect((await getCartTotals(page)).discount).toBe(0);
      });

      test('a Smart Coupon that allows no other coupon keeps only the larger saving', async ({ guestPage: page, api }) => {
        const smart = await made.create(api, { amount: 20, allow_others: false });
        const other = uniqueCode('plain');
        plain.push(await createPlainCoupon(api, other, 5));
        await addToCartApi(page, PRODUCTS.b.id);
        await openCart(page, cart);

        await cart.apply(page, smart.code);
        await cart.apply(page, other);

        await expect(
          cart.notices(page).filter({ hasText: `Only one of these coupons can be used. We kept ${smart.code.toUpperCase()}, which saves you more.` }).first(),
        ).toBeVisible();
        expect((await getCartTotals(page)).discount).toBe(980);
      });

      test('an automatic coupon applies itself and shows its name, not its code', async ({ guestPage: page, api }) => {
        const auto = await made.create(api, { method: 'automatic', title: 'E2E Store-wide deal', amount: 10 });
        await addToCartApi(page, PRODUCTS.b.id);
        await openCart(page, cart);

        await expect(cart.totals(page).getByText('E2E Store-wide deal').first()).toBeVisible();
        await expect(page.getByText(auto.code)).toHaveCount(0);
        expect((await getCartTotals(page)).discount).toBe(490);
      });
    });
  }

  test.describe('BOGO against a Smart Coupon (Cart block)', () => {
    let offerId = 0;
    let bogoWasActive = true;

    test.beforeEach(async ({ api }) => {
      bogoWasActive = await isModuleActive(api, MODULES.bogo.id);
      await setModuleStatus(api, MODULES.bogo.id, true);
    });

    test.afterEach(async ({ api }) => {
      if (offerId) await deleteBogoOffer(api, offerId);
      offerId = 0;
      await setModuleStatus(api, MODULES.bogo.id, bogoWasActive);
    });

    test('the larger BOGO deal wins and the cart says so once', async ({ guestPage: page, api }) => {
      // Buy A, get B at 50% off ($24.50 saved, counted on A's line) against
      // 10% off A ($2.00): a coupon never reaches a gift line, and on A's
      // line the BOGO deal saves more, so the coupon is turned away.
      const offer = await createBogoOffer(api, {
        offer_type: 'discount',
        discount_amount: 50,
        offered_products: [PRODUCTS.a.id],
        get_different_product_field: PRODUCTS.b.id,
        bogo_deal_type: 'different',
        minimum_quantity_required: 1,
      });
      offerId = offer.id;
      const coupon = await made.create(api, { amount: 10, apply_to: 'products', product_ids: [PRODUCTS.a.id] });

      await addToCartApi(page, PRODUCTS.a.id);
      await openCart(page, blockCart);
      const before = await getCartTotals(page);
      expect(lineFor(before, PRODUCTS.b.name), 'the BOGO gift is in the cart').toBeTruthy();

      await blockCart.apply(page, coupon.code);

      const notice = blockCart.notices(page).filter({ hasText: `${coupon.code.toUpperCase()} wasn't applied because` });
      await expect(notice.first()).toBeVisible();
      const after = await getCartTotals(page);
      expect(after.total, 'the coupon takes nothing off').toBe(before.total);
      expect(lineFor(after, PRODUCTS.b.name)!.lineTotal, 'the gift keeps its BOGO price').toBe(B / 2);

      await page.reload();
      await openCart(page, blockCart);
      await expect(page.getByText(/wasn't applied because/)).toHaveCount(0);
    });
  });
});
