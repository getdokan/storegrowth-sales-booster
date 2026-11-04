import type { APIRequestContext, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { setModuleStatus } from '../../helpers/rest';
import { createOrderBump, deleteAllOrderBumps } from '../../helpers/records';
import { addToCart, emptyCart } from '../../helpers/storefront';
import { getCartTotals, lineFor } from '../../helpers/cart';
import { MODULES } from '../../data/modules';
import { PRODUCTS, STORE_PAGES } from '../../data/products';

// The bump on both checkouts: the classic `[woocommerce_checkout]` page
// (`woocommerce_review_order_before_submit`) and WooCommerce's Checkout block
// (`/e2e-block-checkout/`, the module's `storegrowth-upsell-order-bump`
// integration). Both draw the same `.offer-main-wrap` markup from
// `OrderBump::get_checkout_offers()`, and ticking the box posts the storefront
// ajax `upsell_offer_product_add_to_cart`, which prices the line server-side.
//
// Trigger: product A in the cart. Offer: product B (49.00).

const BUMP = '.offer-main-wrap';
const CHECKOUTS = [
  { name: 'classic checkout', path: STORE_PAGES.checkout, block: false },
  { name: 'block checkout', path: STORE_PAGES.blockCheckout, block: true },
] as const;

// The block checkout runs as the store's checkout page (WooCommerce › Advanced
// › Checkout page), as on a real store: the bump's storefront script and its
// `bump_save_url` nonce load only where `is_checkout()` is true
// (`spsg_order_bump_needs_front_assets`). A Checkout block on any other page
// draws the bump but ticking it throws (see "ticking fails off the checkout
// page" below).
const CHECKOUT_PAGE_SETTING = '/wp-json/wc/v3/settings/advanced/woocommerce_checkout_page_id';

async function setCheckoutPage(api: APIRequestContext, id: string): Promise<void> {
  const res = await api.put(CHECKOUT_PAGE_SETTING, { data: { value: id } });
  expect(res.ok(), `set the checkout page to ${id}: HTTP ${res.status()}`).toBeTruthy();
}

async function pageIdByPath(api: APIRequestContext, slug: string): Promise<string> {
  const res = await api.get('/wp-json/wp/v2/pages', { params: { slug, _fields: 'id' } });
  const [found] = await res.json();
  expect(found, `page ${slug}`).toBeTruthy();
  return String(found.id);
}

/** Open a checkout and wait for it to draw (the block one renders client-side). */
async function gotoCheckout(page: Page, path: string): Promise<void> {
  const res = await page.goto(path);
  expect(res?.status(), `${path} answers`).toBeLessThan(400);
  await expect(page.getByRole('button', { name: /place order/i })).toBeVisible({ timeout: 20000 });
  await expect(page.locator('body')).not.toContainText(/fatal error|critical error/i);
}

/** Tick (or untick) the first bump and wait for the ajax and the reload it triggers. */
async function toggleBump(page: Page): Promise<void> {
  const box = page.locator(`${BUMP} input[type="checkbox"]`).first();
  const ajax = page.waitForResponse((r) => r.url().includes('admin-ajax.php') && r.request().method() === 'POST');
  const reload = page.waitForEvent('load');
  await box.click();
  expect((await ajax).ok(), 'upsell_offer_product_add_to_cart').toBeTruthy();
  await reload;
}

test.describe('Storefront · Upsell Order Bump', { tag: '@ui' }, () => {
  test.beforeEach(async ({ api, page }) => {
    await setModuleStatus(api, MODULES.upsellOrderBump.id, true);
    await deleteAllOrderBumps(api);
    await emptyCart(page);
  });

  test.afterEach(async ({ api, page }) => {
    // On first: the bump routes exist only while the module is.
    await setModuleStatus(api, MODULES.upsellOrderBump.id, true);
    await deleteAllOrderBumps(api);
    await emptyCart(page);
  });

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.upsellOrderBump.name, false);
    await setModuleState(page, MODULES.upsellOrderBump.name, true);
    await expect(moduleToggle(page, MODULES.upsellOrderBump.name)).toHaveAttribute('aria-checked', 'true');
  });

  for (const checkout of CHECKOUTS) {
    test.describe(checkout.name, () => {
      if (checkout.block) {
        let original = '';
        test.beforeEach(async ({ api }) => {
          original = String((await (await api.get(CHECKOUT_PAGE_SETTING)).json()).value);
          await setCheckoutPage(api, await pageIdByPath(api, 'e2e-block-checkout'));
        });
        test.afterEach(async ({ api }) => {
          if (original) await setCheckoutPage(api, original);
        });
      }

      const offers = [
        { type: 'discount', amount: 10, label: '10% off only for you!', price: '$44.10', minor: 4410 },
        { type: 'price', amount: 5, label: '5.00$ Just Only', price: '$5.00', minor: 500 },
        { type: 'free', amount: 0, label: 'Free', price: '$0.00', minor: 0 },
      ] as const;

      for (const offer of offers) {
        test(`a ${offer.type} bump shows its label and price, and ticking adds it at ${offer.price}`, async ({
          api,
          page,
        }) => {
          await createOrderBump(api, {
            target_products: [PRODUCTS.a.id],
            offer_product_id: PRODUCTS.b.id,
            offer_type: offer.type,
            offer_amount: offer.amount,
          });

          await addToCart(page, PRODUCTS.a.id);
          await gotoCheckout(page, checkout.path);

          const bump = page.locator(BUMP).first();
          await expect(bump).toBeVisible();
          await expect(bump.locator('.dynamic-offer-text')).toHaveText(offer.label);
          await expect(bump.locator('.offer-product-title h3')).toHaveText(PRODUCTS.b.name);
          await expect(bump.locator('.offer-price')).toContainText(`$${PRODUCTS.b.price}`);
          await expect(bump.locator('.offer-price')).toContainText(offer.price);

          await toggleBump(page);
          const totals = await getCartTotals(page);
          const line = lineFor(totals, PRODUCTS.b.name);
          expect(line, 'the offer product is in the cart').toBeTruthy();
          expect(line!.quantity).toBe(1);
          expect(line!.lineTotal, 'charged at the bump price').toBe(offer.minor);
          expect(lineFor(totals, PRODUCTS.a.name)?.lineTotal, 'the trigger keeps its price').toBe(1999);

          // The box comes back ticked; unticking removes only the bump line.
          await gotoCheckout(page, checkout.path);
          await expect(page.locator(`${BUMP} input[type="checkbox"]`).first()).toBeChecked();
          await toggleBump(page);
          const after = await getCartTotals(page);
          expect(lineFor(after, PRODUCTS.b.name), 'unticked: the bump line is gone').toBeFalsy();
          expect(lineFor(after, PRODUCTS.a.name), 'the trigger stays').toBeTruthy();
        });
      }

      test('no bump when the cart lacks the target, or the bump is inactive', async ({ api, page }) => {
        const bump = await createOrderBump(api, {
          target_products: [PRODUCTS.a.id],
          offer_product_id: PRODUCTS.b.id,
        });

        await addToCart(page, PRODUCTS.c.id);
        await gotoCheckout(page, checkout.path);
        await expect(page.locator(BUMP)).toHaveCount(0);

        await addToCart(page, PRODUCTS.a.id);
        await api.post(`/wp-json/sales-booster/v1/order-bumps/${bump.id}/status`, { data: { status: 'no' } });
        await gotoCheckout(page, checkout.path);
        await expect(page.locator(BUMP)).toHaveCount(0);
      });

      test('module off: no bump, the checkout still works', async ({ api, page }) => {
        await createOrderBump(api, {
          target_products: [PRODUCTS.a.id],
          offer_product_id: PRODUCTS.b.id,
        });
        await addToCart(page, PRODUCTS.a.id);

        await setModuleStatus(api, MODULES.upsellOrderBump.id, false);
        await gotoCheckout(page, checkout.path);
        await expect(page.locator(BUMP)).toHaveCount(0);
      });

      test("Offer Days: shown on the site's day, hidden on another", async ({ api, page }) => {
        const settings = await (await api.get('/wp-json/wp/v2/settings')).json();
        const timeZone = settings.timezone || 'UTC';
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(new Date()).toLowerCase();
        const otherDay = days[(days.indexOf(today) + 3) % 7];

        const bump = await createOrderBump(api, {
          target_products: [PRODUCTS.a.id],
          offer_product_id: PRODUCTS.b.id,
          design_settings: { bump_schedule: [today] },
        });
        await addToCart(page, PRODUCTS.a.id);
        await gotoCheckout(page, checkout.path);
        await expect(page.locator(BUMP), `scheduled for ${today} (today)`).toHaveCount(1);

        await api.put(`/wp-json/sales-booster/v1/order-bumps/${bump.id}`, {
          data: { design_settings: { bump_schedule: [otherDay] } },
        });
        await gotoCheckout(page, checkout.path);
        await expect(page.locator(BUMP), `scheduled for ${otherDay} only`).toHaveCount(0);
      });
    });
  }

  test('every configured design field is reflected on the classic bump', async ({ api, page }) => {
    await createOrderBump(api, {
      target_products: [PRODUCTS.a.id],
      offer_product_id: PRODUCTS.b.id,
      offer_type: 'discount',
      offer_amount: 10,
      // A column (the editor sends it top-level; it wins over the design's copy).
      offer_discount_title: '% OFF TODAY',
      design_settings: {
        box_border_style: 'dashed',
        box_border_color: '#0000ff',
        discount_background_color: '#ff0000',
        discount_text_color: '#ffffff',
        discount_font_size: '16',
        product_description_text_color: '#333333',
        product_description_font_size: '13',
      },
    });

    await addToCart(page, PRODUCTS.a.id);
    await gotoCheckout(page, STORE_PAGES.checkout);

    const bump = page.locator(BUMP).first();
    await expect(bump.locator('.dynamic-offer-text')).toHaveText('10% OFF TODAY');
    // Retrying assertions: the classic checkout's order review refresh
    // replaces the box once after load (a one-shot read can hit the old one).
    const strip = bump.locator('.dynamic-offer-text');
    await expect(strip).toHaveCSS('background-color', 'rgb(255, 0, 0)');
    await expect(strip).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(strip).toHaveCSS('font-size', '16px');
    await expect(bump).toHaveCSS('border-top-color', 'rgb(0, 0, 255)');
    await expect(bump).toHaveCSS('border-top-style', 'dashed');
    await expect(bump.locator('.offer-product-title h3')).toHaveCSS('color', 'rgb(51, 51, 51)');
  });

  test('the ajax refuses an offer the cart does not qualify for', async ({ api, page }) => {
    await createOrderBump(api, {
      target_products: [PRODUCTS.a.id],
      offer_product_id: PRODUCTS.b.id,
    });
    await addToCart(page, PRODUCTS.c.id);
    await page.goto(STORE_PAGES.checkout);
    const nonce = await page.evaluate(() => (window as any).bump_save_url?.ajd_nonce);
    expect(nonce, 'bump_save_url is localised on the checkout').toBeTruthy();

    const res = await page.request.post('/wp-admin/admin-ajax.php', {
      form: {
        action: 'upsell_offer_product_add_to_cart',
        _ajax_nonce: nonce,
        'data[offer_product_id]': String(PRODUCTS.b.id),
        'data[offer_variation_id]': '0',
        'data[checked]': '',
        'data[bump_price]': '0',
      },
    });
    expect(res.status()).toBe(403);
    expect(lineFor(await getCartTotals(page), PRODUCTS.b.name), 'nothing was added').toBeFalsy();
  });

  test('a Checkout block off the store checkout page: ticking adds the bump', async ({ api, page }) => {
    // ISSUES #9: `blocks.js` posts with `window.bump_save_url`. The classic
    // script localises it only where `is_checkout()` is true; the block's
    // data (`OrderBumpCheckoutIntegration::get_script_data()`) now prints it
    // on the block script, so a Checkout block on any other page (here
    // /e2e-block-checkout/ while Checkout is the classic page) works too.
    await createOrderBump(api, { target_products: [PRODUCTS.a.id], offer_product_id: PRODUCTS.b.id });
    await addToCart(page, PRODUCTS.a.id);
    await gotoCheckout(page, STORE_PAGES.blockCheckout);
    await expect(page.locator(BUMP).first()).toBeVisible();
    const ajax = page.waitForResponse((r) => r.url().includes('admin-ajax.php'), { timeout: 5000 });
    await page.locator(`${BUMP} input[type="checkbox"]`).first().click();
    expect((await ajax).ok()).toBeTruthy();
  });
});
