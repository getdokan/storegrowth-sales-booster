import { APIRequestContext, Page, expect } from '@playwright/test';
import { expectOk, resetModuleSettings, saveModuleSettings, setModuleStatus } from './rest';
import { MODULES } from '../data/modules';

// Cart Rewards (the `progressive-discount-banner` module's milestones) and the
// Free offer limits (ADR-013): REST setup, the Store API cart, a shipping zone
// and a shortcode cart page. Every helper that creates something returns its id
// so the spec deletes exactly what it made.

const NS = '/wp-json/sales-booster/v1';

export const CART_REWARDS = MODULES.freeShipping.id;

/** The bar on the cart page (classic and block) and in the block mini-cart. */
export const BAR = '.spsg-cart-rewards';
export const BAR_MESSAGE = `${BAR} .spsg-cart-rewards__message`;
export const BAR_FILL = `${BAR} .spsg-cart-rewards__fill`;
export const BAR_CHIP = `${BAR} .spsg-cart-rewards__chip`;

/** One milestone as `POST settings/progressive-discount-banner` takes it. */
export type Milestone = {
  threshold: number;
  reward: 'free-shipping' | 'coupon' | 'gift' | 'discount-amount';
  coupon_id?: number;
  gift_product_id?: number;
  discount_mode?: 'fixed-amount' | 'percentage';
  discount_value?: number;
};

/* -- Pro ------------------------------------------------------------------ */

/** Whether `has_pro()` is true on the stack (helpers/rest.ts). */
export { proActive } from './rest';

/* -- Settings ------------------------------------------------------------- */

/**
 * Turn the module on and give it exactly these milestones (the first save
 * also publishes it, ADR-007). Other keys go back to their defaults.
 */
export async function setMilestones(
  api: APIRequestContext,
  milestones: Milestone[],
  values: Record<string, unknown> = {},
): Promise<void> {
  await setModuleStatus(api, CART_REWARDS, true);
  await resetModuleSettings(api, CART_REWARDS, values);
  await saveModuleSettings(api, CART_REWARDS, { milestones });
}

/** Back to the provisioned state: module on, defaults, no milestones saved. */
export async function resetCartRewards(api: APIRequestContext): Promise<void> {
  await setModuleStatus(api, CART_REWARDS, true);
  await resetModuleSettings(api, CART_REWARDS);
}

/* -- Store API cart ------------------------------------------------------- */

export type StoreCart = {
  items: { name: string; quantity: number; total: string; gift: boolean }[];
  fees: { name: string; total: string }[];
  /** Rate ids (`free_shipping:3`) of the first package, `selected` marked. */
  rates: { id: string; method: string; selected: boolean }[];
  total: string;
  rewards: { message: string; percent: number; milestones: { text: string; reached: boolean }[] } | null;
};

/** The session's cart through the Store API (money in minor units). */
export async function storeCart(page: Page): Promise<StoreCart> {
  const res = await page.request.get('/wp-json/wc/store/v1/cart');
  expect(res.ok(), `Store API cart: HTTP ${res.status()}`).toBeTruthy();
  const cart = await res.json();
  const pkg = cart.shipping_rates?.[0];
  return {
    items: cart.items.map((i: any) => ({
      name: i.name,
      quantity: i.quantity,
      total: i.totals.line_total,
      gift: (i.item_data ?? []).some((d: { name?: string; key?: string }) => /gift|reward/i.test(`${d.name ?? d.key}`)),
    })),
    fees: cart.fees.map((f: any) => ({ name: f.name, total: f.totals.total })),
    rates: (pkg?.shipping_rates ?? []).map((r: any) => ({ id: r.rate_id, method: r.method_id, selected: r.selected })),
    total: cart.totals.total_price,
    rewards: cart.extensions?.storegrowth?.rewards ?? null,
  };
}

/** Store API write nonce for this page's session. */
async function nonce(page: Page): Promise<string> {
  const res = await page.request.get('/wp-json/wc/store/v1/cart');
  const value = res.headers()['nonce'];
  expect(value, 'Store API Nonce header').toBeTruthy();
  return value;
}

/** Add a product through the Store API; returns the line key. */
export async function addItem(page: Page, productId: number, quantity = 1): Promise<string> {
  const res = await page.request.post('/wp-json/wc/store/v1/cart/add-item', {
    headers: { Nonce: await nonce(page) },
    data: { id: productId, quantity },
  });
  expect(res.ok(), `add ${productId}: HTTP ${res.status()} ${await res.text()}`).toBeTruthy();
  const cart = await res.json();
  return cart.items.find((i: any) => i.id === productId && i.quantity === quantity)?.key
    ?? cart.items.find((i: any) => i.id === productId).key;
}

/** Remove a line through the Store API. */
export async function removeItem(page: Page, key: string): Promise<void> {
  const res = await page.request.post('/wp-json/wc/store/v1/cart/remove-item', {
    headers: { Nonce: await nonce(page) },
    data: { key },
  });
  expect(res.ok(), `remove ${key}: HTTP ${res.status()}`).toBeTruthy();
}

/** Apply a coupon through the Store API; returns the response for asserting. */
export async function applyCoupon(page: Page, code: string): Promise<{ status: number; body: any }> {
  const res = await page.request.post('/wp-json/wc/store/v1/cart/apply-coupon', {
    headers: { Nonce: await nonce(page) },
    data: { code },
  });
  return { status: res.status(), body: await res.json() };
}

/* -- Shipping zone -------------------------------------------------------- */

/**
 * A zone for the store's country with a flat rate and an unconditional Free
 * shipping method: only the milestone decides whether Free shipping shows.
 */
export async function createShippingZone(api: APIRequestContext): Promise<number> {
  const zone = await api.post('/wp-json/wc/v3/shipping/zones', { data: { name: 'E2E Cart Rewards' } });
  await expectOk(zone, 'create shipping zone');
  const id: number = (await zone.json()).id;
  await expectOk(
    await api.put(`/wp-json/wc/v3/shipping/zones/${id}/locations`, { data: [{ code: 'US', type: 'country' }] }),
    'set zone locations',
  );
  await expectOk(
    await api.post(`/wp-json/wc/v3/shipping/zones/${id}/methods`, {
      data: { method_id: 'flat_rate', settings: { cost: '5' } },
    }),
    'add flat rate',
  );
  await expectOk(
    await api.post(`/wp-json/wc/v3/shipping/zones/${id}/methods`, {
      data: { method_id: 'free_shipping', settings: { requires: '' } },
    }),
    'add free shipping',
  );
  return id;
}

export async function deleteShippingZone(api: APIRequestContext, id: number): Promise<void> {
  await expectOk(await api.delete(`/wp-json/wc/v3/shipping/zones/${id}`, { params: { force: true } }), 'delete zone');
}

/* -- Classic cart page ---------------------------------------------------- */

/**
 * A published page with the `[woocommerce_cart]` shortcode: the provisioned
 * cart page is the Cart block, and `is_cart()` is true on a page holding the
 * shortcode, so the classic bar renders here.
 */
export async function createClassicCartPage(api: APIRequestContext): Promise<{ id: number; path: string }> {
  const res = await api.post('/wp-json/wp/v2/pages', {
    data: { title: 'E2E Classic Cart', slug: 'e2e-classic-cart', status: 'publish', content: '[woocommerce_cart]' },
  });
  await expectOk(res, 'create classic cart page');
  const page = await res.json();
  return { id: page.id, path: new URL(page.link).pathname };
}

export async function deletePage(api: APIRequestContext, id: number): Promise<void> {
  await expectOk(await api.delete(`/wp-json/wp/v2/pages/${id}`, { params: { force: true } }), 'delete page');
}

/* -- Smart Coupons (offer limits) ----------------------------------------- */

/**
 * Create a Smart Coupon over REST, a code one by default; returns its id.
 * Free limits automatic coupons only (one active), so limit specs pass
 * `automatic` (the code is then only its title).
 */
export async function createSmartCoupon(
  api: APIRequestContext,
  code: string,
  method: 'code' | 'automatic' = 'code',
): Promise<number> {
  const res = await api.post(`${NS}/smart-coupons`, {
    data: { method, code, title: code.toUpperCase(), discount_type: 'percentage', amount: 10 },
  });
  await expectOk(res, `create smart coupon ${code}`);
  return (await res.json()).id;
}

/** A Smart Coupon's WooCommerce code (generated for an automatic coupon). */
export async function smartCouponCode(api: APIRequestContext, id: number): Promise<string> {
  const res = await api.get(`${NS}/smart-coupons/${id}`);
  await expectOk(res, `read smart coupon ${id}`);
  return (await res.json()).code;
}

export async function setSmartCouponActive(api: APIRequestContext, id: number, active: boolean): Promise<void> {
  await expectOk(
    await api.post(`${NS}/smart-coupons/${id}/status`, { data: { status: active ? 'active' : 'inactive' } }),
    `set smart coupon ${id} ${active ? 'active' : 'inactive'}`,
  );
}

export async function deleteSmartCoupon(api: APIRequestContext, id: number): Promise<void> {
  const res = await api.delete(`${NS}/smart-coupons/${id}`);
  if (res.status() !== 404) await expectOk(res, `delete smart coupon ${id}`);
}

/** One kind of `GET sales-booster/v1/offer-limits`. */
export type OfferLimit = {
  kind: string;
  limit: number;
  over_limit: boolean;
  offers: { id: number; name: string; paused: boolean; chip: string }[];
};

export async function offerLimits(api: APIRequestContext): Promise<OfferLimit[]> {
  const res = await api.get(`${NS}/offer-limits`);
  await expectOk(res, 'read offer limits');
  return res.json();
}

export async function offerLimit(api: APIRequestContext, kind: string): Promise<OfferLimit> {
  const found = (await offerLimits(api)).find((l) => l.kind === kind);
  expect(found, `offer limit kind ${kind}`).toBeTruthy();
  return found as OfferLimit;
}
