import { Page } from '@playwright/test';
import { STORE_PAGES, productPath } from '../data/products';

/** Open a single product page by slug and wait for the DOM to settle. */
export async function gotoProduct(page: Page, slug: string): Promise<void> {
  await page.goto(productPath(slug));
  await page.waitForLoadState('domcontentloaded');
}

/** Open the shop (product archive) loop. */
export async function gotoShop(page: Page): Promise<void> {
  await page.goto(STORE_PAGES.shop);
  await page.waitForLoadState('domcontentloaded');
}

/** Open the cart page. */
export async function gotoCart(page: Page): Promise<void> {
  await page.goto(STORE_PAGES.cart);
  await page.waitForLoadState('domcontentloaded');
}

/** Computed CSS property of the first matching element on a page. */
export async function computedStyle(page: Page, selector: string, prop: string): Promise<string> {
  return page
    .locator(selector)
    .first()
    .evaluate((el: Element, p: string) => getComputedStyle(el).getPropertyValue(p).trim(), prop);
}

/** Add a product to the cart via the WooCommerce add-to-cart URL (server-side). */
export async function addToCart(page: Page, productId: number): Promise<void> {
  await page.goto(`/?add-to-cart=${productId}`);
  await page.waitForLoadState('domcontentloaded');
}

// Empty the cart via the Store API. A GET returns the write `Nonce` header that
// the DELETE needs; falls back silently if unavailable.
export async function emptyCart(page: Page): Promise<void> {
  const get = await page.request.get('/wp-json/wc/store/v1/cart');
  const nonce = get.headers()['nonce'];
  await page.request.delete('/wp-json/wc/store/v1/cart/items', {
    headers: nonce ? { Nonce: nonce } : {},
  });
}

/**
 * Complete the classic (shortcode) checkout with Cash on Delivery and return
 * the created order id. Requires the classic checkout page and an enabled COD
 * gateway. Fills the standard required billing fields defensively.
 */
export async function placeOrderClassicCOD(page: Page): Promise<number> {
  await page.goto(STORE_PAGES.checkout);
  await page.waitForLoadState('domcontentloaded');

  const fill = async (id: string, value: string) => {
    const el = page.locator(`#${id}`);
    if (await el.count()) await el.fill(value);
  };
  await fill('billing_first_name', 'E2E');
  await fill('billing_last_name', 'Buyer');
  await fill('billing_address_1', '123 Test Street');
  await fill('billing_city', 'Testville');
  await fill('billing_postcode', '12345');
  await fill('billing_phone', '5555555555');
  await fill('billing_email', 'e2e-buyer@example.com');

  const cod = page.locator('#payment_method_cod');
  if (await cod.count()) await cod.check();

  await Promise.all([
    page.waitForURL(/order-received\/(\d+)/, { timeout: 30000 }),
    page.locator('#place_order').click(),
  ]);

  const match = page.url().match(/order-received\/(\d+)/);
  if (!match) throw new Error(`Could not read order id from URL: ${page.url()}`);
  return Number(match[1]);
}
