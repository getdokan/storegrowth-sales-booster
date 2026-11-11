import { APIRequestContext, expect } from '@playwright/test';
import { expectOk } from './rest';

// REST helpers for Smart Coupons (`sales-booster/v1/smart-coupons`). A coupon
// is a real `shop_coupon` post with StoreGrowth's meta (ADR-014). Payloads use
// the editor's keys; anything left out takes the editor's default.
//
// Leftover coupons change every later cart (an automatic coupon switches the
// referee on), so a spec tracks what it creates and deletes only those ids:
//
//   const made = trackCoupons();
//   test.afterEach(async ({ api }) => { await made.cleanup(api); });
//   const coupon = await made.create(api, { code: 'save10' });

const NS = '/wp-json/sales-booster/v1';
export const SMART_COUPONS = `${NS}/smart-coupons`;

/** The Smart Coupons module id (off in the baseline, `data/modules.ts`). */
export const SMART_COUPONS_MODULE = 'smart-coupons';

/** A Smart Coupon as the REST routes return it (the fields specs read). */
export type SmartCoupon = {
  id: number;
  name: string;
  title: string;
  code: string;
  method: 'automatic' | 'code' | 'link';
  discount_type: 'percentage' | 'fixed' | 'tiers' | 'buy_x_get_y';
  amount: number;
  status: 'active' | 'inactive';
  combines: boolean;
  allow_others: boolean;
  date_start: string;
  date_end: string;
  [key: string]: unknown;
};

let seq = 0;
/** A unique, lowercase coupon code. */
export function uniqueCode(prefix = 'e2e'): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}${seq}`;
}

/** `Y-m-d\TH:i` in UTC, `hours` from now. The stack's site timezone is UTC. */
export function siteDate(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString().slice(0, 16);
}

/** A complete, valid payload: an active 10% code coupon for the whole store, started an hour ago. */
export function couponPayload(values: Record<string, unknown> = {}): Record<string, unknown> {
  const method = values.method ?? 'code';
  const code = method === 'automatic' ? '' : uniqueCode();
  return {
    method,
    code,
    title: `E2E ${code || uniqueCode('auto')}`,
    discount_type: 'percentage',
    amount: 10,
    apply_to: 'store',
    minimum_type: 'none',
    eligibility: 'all',
    combines: false,
    allow_others: false,
    status: 'active',
    date_start: siteDate(-1),
    date_end: '',
    ...values,
  };
}

/** `POST smart-coupons`: the raw response (for status checks). */
export async function postCoupon(api: APIRequestContext, values: Record<string, unknown> = {}) {
  return api.post(SMART_COUPONS, { data: couponPayload(values) });
}

/** Create a coupon; asserts 201. */
export async function createCoupon(
  api: APIRequestContext,
  values: Record<string, unknown> = {},
): Promise<SmartCoupon> {
  const res = await postCoupon(api, values);
  await expectOk(res, 'create Smart Coupon');
  expect(res.status()).toBe(201);
  return res.json();
}

/** One coupon. */
export async function getCoupon(api: APIRequestContext, id: number): Promise<SmartCoupon> {
  const res = await api.get(`${SMART_COUPONS}/${id}`);
  await expectOk(res, `read Smart Coupon ${id}`);
  return res.json();
}

/** `PUT smart-coupons/{id}`: what is sent goes over what is stored. */
export async function updateCoupon(
  api: APIRequestContext,
  id: number,
  values: Record<string, unknown>,
): Promise<SmartCoupon> {
  const res = await api.put(`${SMART_COUPONS}/${id}`, { data: values });
  await expectOk(res, `update Smart Coupon ${id}`);
  return res.json();
}

/** Turn a coupon on or off (the list's switch). */
export async function setCouponStatus(api: APIRequestContext, id: number, active: boolean): Promise<void> {
  const res = await api.put(`${SMART_COUPONS}/${id}/status`, { data: { status: active ? 'active' : 'inactive' } });
  await expectOk(res, `set Smart Coupon ${id} status`);
}

/** Delete one coupon (a missing one is fine). */
export async function deleteCoupon(api: APIRequestContext, id: number): Promise<void> {
  const res = await api.delete(`${SMART_COUPONS}/${id}`);
  if (res.status() !== 404) await expectOk(res, `delete Smart Coupon ${id}`);
}

/** Every Smart Coupon on the site (first 100). */
export async function listCoupons(api: APIRequestContext, search = ''): Promise<SmartCoupon[]> {
  const res = await api.get(SMART_COUPONS, { params: { per_page: 100, ...(search ? { search } : {}) } });
  await expectOk(res, 'list Smart Coupons');
  return res.json();
}

/**
 * Coupons a spec made, deleted by id in `afterEach` (also after a failure).
 * `adopt()` tracks a coupon made some other way (the admin editor).
 */
export function trackCoupons() {
  const ids = new Set<number>();
  return {
    async create(api: APIRequestContext, values: Record<string, unknown> = {}): Promise<SmartCoupon> {
      const coupon = await createCoupon(api, values);
      ids.add(coupon.id);
      return coupon;
    },
    adopt(id: number): void {
      ids.add(id);
    },
    async cleanup(api: APIRequestContext): Promise<void> {
      for (const id of ids) {
        await deleteCoupon(api, id);
      }
      ids.clear();
    },
  };
}

/**
 * Whether StoreGrowth's `has_pro()` is true: Pro active AND licensed. Probed
 * by capability: a Campaigns write refuses without it (403
 * `spsg_campaigns_need_pro`) before looking for the campaign, and a delete
 * of a campaign that can't exist changes nothing either way (404 with Pro).
 * `hasPro()` in helpers/rest.ts only says the Pro plugin is active.
 */
export async function proActive(api: APIRequestContext): Promise<boolean> {
  const res = await api.delete(`${NS}/campaigns/999999999`);
  const body = await res.json().catch(() => ({}));
  if (res.status() === 403 && body?.code === 'spsg_campaigns_need_pro') return false;
  expect(res.status(), `probe has_pro (DELETE campaigns/999999999): ${JSON.stringify(body)}`).toBe(404);
  return true;
}
