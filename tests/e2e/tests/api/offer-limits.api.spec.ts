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
  smartCouponCode,
} from '../../helpers/cart-rewards';
import { PRODUCTS } from '../../data/products';

// Free offer limits (ADR-013, #304): `GET sales-booster/v1/offer-limits` lists
// each limited kind with its active everyday offers; over the limit, Free
// pauses the newest and `POST offer-limits/{kind}` `{ keep }` picks which stay
// on. Pro lifts every limit. Smart Coupons make the case: Free has one active
// automatic coupon (code and link coupons are unlimited); a second one that is
// switched on anyway (the admin asks to swap first) pauses, as when Pro lapses.

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

  test.describe('two active automatic Smart Coupons', () => {
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

    /** Two automatic coupons switched on (the older last): over the limit. */
    async function overLimit(api: Parameters<typeof createSmartCoupon>[0]): Promise<[number, number]> {
      const older = await createSmartCoupon(api, 'e2e-limit-older', 'automatic');
      made.push(older);
      await setSmartCouponActive(api, older, false);
      const newer = await createSmartCoupon(api, 'e2e-limit-newer', 'automatic');
      made.push(newer);
      await setSmartCouponActive(api, older, true);
      return [older, newer];
    }

    test('Free: code and link coupons are unlimited', async ({ api }) => {
      test.skip(await proActive(api), 'Free-only limit');

      for (const [code, method] of [
        ['e2e-limit-code-1', 'code'],
        ['e2e-limit-code-2', 'code'],
        ['e2e-limit-link-1', 'link'],
      ]) {
        const res = await api.post(`${NS}/smart-coupons`, {
          data: { method, code, title: code.toUpperCase(), amount: 10 },
        });
        expect(res.status(), code).toBe(201);
        made.push((await res.json()).id);
      }

      expect((await offerLimit(api, 'smart_coupon')).over_limit).toBe(false);
      const list = await api.get(`${NS}/smart-coupons`);
      expect(list.headers()['x-spsg-can-create']).toBe('1');
    });

    test('Free names the automatic coupon that is on, for the swap prompt', async ({ api }) => {
      test.skip(await proActive(api), 'Free-only limit');
      const first = await createSmartCoupon(api, 'e2e-limit-auto', 'automatic');
      made.push(first);

      const editor = await (await api.get(`${NS}/smart-coupons/editor`)).json();
      expect(editor.automatic_on).toEqual({ id: first, name: 'E2E-LIMIT-AUTO' });
    });

    test('Free pauses the newest automatic coupon; the shopper gets only the older', async ({ api, playwright }) => {
      test.skip(await proActive(api), 'Free-only limit');
      const [older, newer] = await overLimit(api);

      const limit = await offerLimit(api, 'smart_coupon');
      expect(limit.over_limit).toBe(true);
      expect(limit.offers).toEqual([
        { id: newer, name: 'E2E-LIMIT-NEWER', paused: true, chip: 'Paused: over Free limit' },
        { id: older, name: 'E2E-LIMIT-OLDER', paused: false, chip: '' },
      ]);

      // A guest's Store API cart: automatic coupons apply by themselves.
      const guest = await playwright.request.newContext({ baseURL: env.baseURL });
      const nonce = (await guest.get('/wp-json/wc/store/v1/cart')).headers()['nonce'];
      const added = await guest.post('/wp-json/wc/store/v1/cart/add-item', {
        headers: { Nonce: nonce },
        data: { id: PRODUCTS.b.id, quantity: 1 },
      });
      expect(added.ok()).toBeTruthy();
      const applied = ((await added.json()).coupons as { code: string }[]).map((c) => c.code);
      expect(applied).toContain(await smartCouponCode(api, older));
      expect(applied).not.toContain(await smartCouponCode(api, newer));
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
