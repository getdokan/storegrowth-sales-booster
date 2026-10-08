import { APIRequestContext, expect } from '@playwright/test';
import { expectOk, schemaDefaults, SettingsField } from './rest';

// REST helpers for the module RECORDS (a table row with its own editor): BOGO
// offers and Upsell Order Bumps. A payload starts from the record editor's
// schema defaults (`GET …/editor`, ADR-010) so it is always complete and valid;
// the caller passes only what the test is about.
//
// Lite allows 2 global BOGO offers and a limited number of order bumps, and the
// stack seeds none: create what a test needs, delete it in afterEach/afterAll
// (or call deleteAll*() first when a test needs an empty table).

const BOGO = '/wp-json/sales-booster/v1/bogo/offers';
const BUMPS = '/wp-json/spsg/v1/order-bumps';

let seq = 0;
/** A unique record name, so parallel or repeated runs never collide. */
function uniqueName(prefix: string): string {
  seq += 1;
  return `${prefix} ${Date.now()}-${seq}`;
}

async function editorDefaults(api: APIRequestContext, base: string): Promise<Record<string, unknown>> {
  const res = await api.get(`${base}/editor`);
  await expectOk(res, `read ${base}/editor`);
  const { schema } = (await res.json()) as { schema: Record<string, SettingsField> };
  return schemaDefaults(schema);
}

/* -- BOGO ------------------------------------------------------------------- */

/** A BOGO offer as the REST routes return it (the fields specs usually read). */
export type BogoOffer = {
  id: number;
  name: string;
  status: string;
  bogo_deal_type: string;
  offer_type: string;
  offered_products: number[];
  offer_product_id: number;
  [key: string]: unknown;
};

/**
 * Create an active global BOGO offer. Required by the validator:
 * `offered_products` (the "Buy" products) and, for the default Buy X Get Y deal
 * (`bogo_deal_type: 'different'`), `get_different_product_field` — the "Get"
 * product, which must not be one of the offered products. For Buy X Get X pass
 * `bogo_deal_type: 'same'`. `offer_type`: 'free' (default) | 'percentage'
 * (+ `discount_amount` 1–100).
 *
 *   await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });
 */
export async function createBogoOffer(
  api: APIRequestContext,
  overrides: Record<string, unknown>,
): Promise<BogoOffer> {
  const data = {
    ...(await editorDefaults(api, BOGO)),
    name_of_order_bogo: uniqueName('E2E BOGO'),
    status: 'active',
    ...overrides,
  };
  const res = await api.post(BOGO, { data });
  await expectOk(res, 'create BOGO offer');
  expect(res.status()).toBe(201);
  return res.json();
}

/** Every BOGO offer. */
export async function listBogoOffers(api: APIRequestContext): Promise<BogoOffer[]> {
  const res = await api.get(BOGO, { params: { per_page: 100 } });
  await expectOk(res, 'list BOGO offers');
  return res.json();
}

/** Delete one BOGO offer (a missing one is fine). */
export async function deleteBogoOffer(api: APIRequestContext, id: number | string): Promise<void> {
  const res = await api.delete(`${BOGO}/${id}`);
  if (res.status() !== 404) await expectOk(res, `delete BOGO offer ${id}`);
}

/** Delete every BOGO offer (frees lite's two slots). */
export async function deleteAllBogoOffers(api: APIRequestContext): Promise<void> {
  for (const offer of await listBogoOffers(api)) {
    await deleteBogoOffer(api, offer.id);
  }
}

/* -- Upsell Order Bump ------------------------------------------------------ */

/** An order bump as the REST routes return it. */
export type OrderBump = {
  id: number;
  name: string;
  status: string;
  target_type: 'products' | 'categories';
  target_products: number[];
  target_categories: number[];
  offer_product_id: number;
  offer_type: string;
  offer_amount: number;
  [key: string]: unknown;
};

/**
 * Create an active order bump. Required: `offer_product_id` and targets —
 * `target_type: 'products'` (default) with `target_products`, or
 * `target_type: 'categories'` with `target_categories`. `offer_type`:
 * 'discount' (default, `offer_amount` %) | 'price' | 'free'.
 *
 *   await createOrderBump(api, { target_products: [PRODUCTS.a.id], offer_product_id: PRODUCTS.c.id });
 */
export async function createOrderBump(
  api: APIRequestContext,
  overrides: Record<string, unknown>,
): Promise<OrderBump> {
  const data = {
    ...(await editorDefaults(api, BUMPS)),
    name: uniqueName('E2E Bump'),
    status: 'active',
    ...overrides,
  };
  const res = await api.post(BUMPS, { data });
  await expectOk(res, 'create order bump');
  expect(res.status()).toBe(201);
  return res.json();
}

/** Every order bump. */
export async function listOrderBumps(api: APIRequestContext): Promise<OrderBump[]> {
  const res = await api.get(BUMPS, { params: { per_page: 100, page: 1 } });
  await expectOk(res, 'list order bumps');
  return res.json();
}

/** Delete one order bump (a missing one is fine). The route answers with no body. */
export async function deleteOrderBump(api: APIRequestContext, id: number | string): Promise<void> {
  const res = await api.delete(`${BUMPS}/${id}`);
  if (res.status() !== 404) await expectOk(res, `delete order bump ${id}`);
}

/** Delete every order bump. */
export async function deleteAllOrderBumps(api: APIRequestContext): Promise<void> {
  for (const bump of await listOrderBumps(api)) {
    await deleteOrderBump(api, bump.id);
  }
}
