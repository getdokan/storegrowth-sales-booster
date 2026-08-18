import { Page, expect } from '@playwright/test';

// Cart totals are read from the WooCommerce Store API rather than scraped from
// the cart page. The API answers exact integers in the currency's minor unit, so
// assertions never depend on locale formatting, on the theme, or on whether the
// store renders the block cart or the shortcode cart.

export type CartLine = {
  name: string;
  quantity: number;
  /** Line total excluding tax, in minor units. */
  lineSubtotal: number;
  /** Line total including tax, in minor units. */
  lineTotal: number;
  /** Tax on the line, in minor units. */
  lineTax: number;
};

export type CartTotals = {
  /** Sum of line items excluding tax. */
  itemsSubtotal: number;
  /** Tax on the line items. */
  itemsTax: number;
  /** Total tax across the cart. */
  totalTax: number;
  /** Grand total the customer pays. */
  total: number;
  /** Total discount applied, if any. */
  discount: number;
  /** Minor units per major unit (100 for a 2-decimal currency). */
  minorUnit: number;
  lines: CartLine[];
};

/** Read the Store API write nonce, needed for any mutating call. */
async function storeNonce(page: Page): Promise<string> {
  const res = await page.request.get('/wp-json/wc/store/v1/cart');
  const nonce = res.headers()['nonce'];
  expect(nonce, 'Store API should return a write Nonce header').toBeTruthy();
  return nonce;
}

/** Add a product to the cart through the Store API. */
export async function addToCartApi(page: Page, productId: number, quantity = 1): Promise<void> {
  const nonce = await storeNonce(page);
  const res = await page.request.post('/wp-json/wc/store/v1/cart/add-item', {
    headers: { Nonce: nonce },
    data: { id: productId, quantity },
  });
  expect(res.ok(), `add product ${productId} to cart (status ${res.status()})`).toBeTruthy();
}

/** Snapshot the cart's money values, all in minor units. */
export async function getCartTotals(page: Page): Promise<CartTotals> {
  const res = await page.request.get('/wp-json/wc/store/v1/cart');
  expect(res.ok(), `read cart (status ${res.status()})`).toBeTruthy();
  const cart = await res.json();

  const n = (v: unknown) => Number(v ?? 0);

  return {
    itemsSubtotal: n(cart.totals?.total_items),
    itemsTax: n(cart.totals?.total_items_tax),
    totalTax: n(cart.totals?.total_tax),
    total: n(cart.totals?.total_price),
    discount: n(cart.totals?.total_discount),
    minorUnit: n(cart.totals?.currency_minor_unit) || 2,
    lines: (cart.items ?? []).map((i: any) => ({
      name: i.name,
      quantity: i.quantity,
      lineSubtotal: n(i.totals?.line_subtotal),
      lineTotal: n(i.totals?.line_total),
      lineTax: n(i.totals?.line_total_tax),
    })),
  };
}

/** Find a cart line by product name, or undefined when it is absent. */
export function lineFor(totals: CartTotals, name: string): CartLine | undefined {
  return totals.lines.find((l) => l.name === name);
}

/** Format minor units as a readable major-unit string, for assertion messages. */
export function money(minor: number, minorUnit = 2): string {
  return (minor / 10 ** minorUnit).toFixed(minorUnit);
}
