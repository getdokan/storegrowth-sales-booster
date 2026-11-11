import { test, expect } from '../../fixtures/test';
import { env } from '../../helpers/env';
import { isModuleActive, setModuleStatus } from '../../helpers/rest';
import {
  createSmartCoupon,
  deleteSmartCoupon,
  offerLimit,
  offerLimits,
  proActive,
  setSmartCouponActive,
} from '../../helpers/cart-rewards';
import { PRODUCTS } from '../../data/products';

// Free offer limits (ADR-013, #304): `GET sales-booster/v1/offer-limits` lists
// each limited kind with its active everyday offers; over the limit, Free
// pauses the newest and `POST offer-limits/{kind}` `{ keep }` picks which stay
// on. Pro lifts every limit. Smart Coupons (limit 1) make the case: Free
// refuses a second active coupon at creation, but switching an older one back
// on is allowed, which is how a store ends up over the limit (as when Pro
// lapses).

const NS = '/wp-json/sales-booster/v1';
const COUPONS = 'smart-coupons';

test.describe('API · offer limits', () => {
  test('anonymous callers are refused', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });
    expect((await anon.get(`${NS}/offer-limits`)).status()).toBe(401);
    expect((await anon.post(`${NS}/offer-limits/smart_coupon`, { data: { keep: [] } })).status()).toBe(401);
    await anon.dispose();
  });

  test('lists each limited kind with its Free limit', async ({ api }) => {
    const limits = await offerLimits(api);
    expect(limits.find((l) => l.kind === 'order_bump')?.limit).toBe(2);
    expect(limits.find((l) => l.kind === 'cart_reward')?.limit).toBe(1);
    for (const limit of limits) {
      expect(limit).toMatchObject({ kind: expect.any(String), over_limit: expect.any(Boolean), offers: expect.any(Array) });
    }
  });

  test('a kind without a limit is 404, a bad choice is 400', async ({ api }) => {
    const unknown = await api.post(`${NS}/offer-limits/nothing_here`, { data: { keep: [] } });
    expect(unknown.status()).toBe(404);
    expect((await unknown.json()).code).toBe('spsg_offer_limit_unknown_kind');

    const notActive = await api.post(`${NS}/offer-limits/cart_reward`, { data: { keep: [999999] } });
    expect(notActive.status()).toBe(400);
    expect((await notActive.json()).code).toBe('spsg_offer_limit_invalid_choice');

    const missing = await api.post(`${NS}/offer-limits/cart_reward`, { data: {} });
    expect(missing.status()).toBe(400);
  });

  test.describe('two active Smart Coupons', () => {
    let wasActive = false;
    const made: number[] = [];

    test.beforeEach(async ({ api }) => {
      wasActive = await isModuleActive(api, COUPONS);
      await setModuleStatus(api, COUPONS, true);
    });

    test.afterEach(async ({ api }) => {
      for (const id of made.splice(0)) await deleteSmartCoupon(api, id);
      // No choice kept: the same as never having chosen.
      await api.post(`${NS}/offer-limits/smart_coupon`, { data: { keep: [] } });
      await setModuleStatus(api, COUPONS, wasActive);
    });

    /** An older coupon switched back on after a newer one: two active. */
    async function overLimit(api: Parameters<typeof createSmartCoupon>[0]): Promise<[number, number]> {
      const older = await createSmartCoupon(api, 'e2e-limit-older');
      made.push(older);
      await setSmartCouponActive(api, older, false);
      const newer = await createSmartCoupon(api, 'e2e-limit-newer');
      made.push(newer);
      await setSmartCouponActive(api, older, true);
      return [older, newer];
    }

    test('Free refuses a second active coupon at creation', async ({ api }) => {
      test.skip(await proActive(api), 'Free-only limit');
      made.push(await createSmartCoupon(api, 'e2e-limit-first'));
      const res = await api.post(`${NS}/smart-coupons`, {
        data: { method: 'code', code: 'e2e-limit-second', title: 'Second', amount: 10 },
      });
      expect(res.status()).toBe(403);
      expect((await res.json()).code).toBe('salesbooster_limit_exceeded');
    });

    test('Free pauses the newest; the shopper cannot use it', async ({ api, playwright }) => {
      test.skip(await proActive(api), 'Free-only limit');
      const [older, newer] = await overLimit(api);

      const limit = await offerLimit(api, 'smart_coupon');
      expect(limit.over_limit).toBe(true);
      expect(limit.offers).toEqual([
        { id: newer, name: 'E2E-LIMIT-NEWER', paused: true, chip: 'Paused: over Free limit' },
        { id: older, name: 'E2E-LIMIT-OLDER', paused: false, chip: '' },
      ]);

      // A guest's Store API session (cookies kept by the context).
      const guest = await playwright.request.newContext({ baseURL: env.baseURL });
      const nonce = (await guest.get('/wp-json/wc/store/v1/cart')).headers()['nonce'];
      const store = (path: string, data: object) => guest.post(`/wp-json/wc/store/v1/cart/${path}`, { headers: { Nonce: nonce }, data });
      expect((await store('add-item', { id: PRODUCTS.b.id, quantity: 1 })).ok()).toBeTruthy();
      expect((await store('apply-coupon', { code: 'e2e-limit-newer' })).status()).toBe(400);
      expect((await store('apply-coupon', { code: 'e2e-limit-older' })).ok()).toBeTruthy();
      await guest.dispose();
    });

    test('Free keeps the offers the merchant chooses', async ({ api }) => {
      test.skip(await proActive(api), 'Free-only limit');
      const [older, newer] = await overLimit(api);

      const tooMany = await api.post(`${NS}/offer-limits/smart_coupon`, { data: { keep: [older, newer] } });
      expect(tooMany.status()).toBe(400);

      const res = await api.post(`${NS}/offer-limits/smart_coupon`, { data: { keep: [newer] } });
      expect(res.ok()).toBeTruthy();
      const limit = (await res.json()).find((l: { kind: string }) => l.kind === 'smart_coupon');
      expect(limit.offers.map((o: { id: number; paused: boolean }) => [o.id, o.paused])).toEqual([
        [older, true],
        [newer, false],
      ]);
    });

    test('Pro pauses nothing', async ({ api }) => {
      test.skip(!(await proActive(api)), 'StoreGrowth Pro required');
      const [older, newer] = await overLimit(api);
      const limit = await offerLimit(api, 'smart_coupon');
      expect(limit.over_limit).toBe(false);
      expect(limit.offers.filter((o) => [older, newer].includes(o.id)).every((o) => !o.paused)).toBe(true);
    });
  });
});
