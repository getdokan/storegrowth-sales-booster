import { test, expect } from '../../fixtures/test';
import { env } from '../../helpers/env';
import { isModuleActive, setModuleStatus } from '../../helpers/rest';
import {
  SMART_COUPONS,
  SMART_COUPONS_MODULE,
  couponPayload,
  getCoupon,
  postCoupon,
  proActive,
  setCouponStatus,
  siteDate,
  trackCoupons,
  uniqueCode,
  updateCoupon,
} from '../../helpers/smart-coupons';

// Smart Coupons REST (`sales-booster/v1/smart-coupons`, ADR-014): real
// `shop_coupon` posts with StoreGrowth's meta, behind `manage_options`. The
// Free plan keeps one active everyday coupon; Pro lifts that and unlocks the
// link method, tiers and eligibility rules.

test.describe('API · Smart Coupons', () => {
  const made = trackCoupons();
  let wasActive = false;

  test.beforeAll(async ({ api }) => {
    wasActive = await isModuleActive(api, SMART_COUPONS_MODULE);
    if (!wasActive) await setModuleStatus(api, SMART_COUPONS_MODULE, true);
  });

  test.afterEach(async ({ api }) => {
    await made.cleanup(api);
  });

  test.afterAll(async ({ api }) => {
    if (!wasActive) await setModuleStatus(api, SMART_COUPONS_MODULE, false);
  });

  test('an anonymous caller can read and change nothing', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });
    try {
      for (const res of [
        await anon.get(SMART_COUPONS),
        await anon.get(`${SMART_COUPONS}/editor`),
        await anon.post(SMART_COUPONS, { data: couponPayload() }),
        await anon.post(`${SMART_COUPONS}/batch`, { data: { delete: [1] } }),
      ]) {
        expect([401, 403], `${res.url()} → ${res.status()}`).toContain(res.status());
      }
    } finally {
      await anon.dispose();
    }
  });

  test('the editor gives its fields and what a new coupon may use', async ({ api }) => {
    const res = await api.get(`${SMART_COUPONS}/editor`);
    expect(res.ok()).toBeTruthy();
    const editor = await res.json();

    expect(Object.keys(editor.schema)).toEqual(
      expect.arrayContaining(['method', 'code', 'title', 'discount_type', 'amount', 'apply_to', 'combines', 'date_start', 'date_end']),
    );
    expect(typeof editor.can_create).toBe('boolean');
    expect(editor.bogo_active).toBe(true);
    expect(Array.isArray(editor.bogo_rules)).toBeTruthy();
    expect(editor.currency).toBeTruthy();
  });

  test('create, read, list, search, change the code, switch off and delete', async ({ api }) => {
    const code = uniqueCode('crud');
    const coupon = await made.create(api, { code, title: 'E2E CRUD', amount: 15 });

    expect(coupon).toMatchObject({ code, title: 'E2E CRUD', name: 'E2E CRUD', method: 'code', amount: 15, status: 'active' });

    // It is a real WooCommerce coupon.
    const wc = await api.get(`/wp-json/wc/v3/coupons/${coupon.id}`);
    expect(wc.ok()).toBeTruthy();
    expect(await wc.json()).toMatchObject({ code, discount_type: 'percent', amount: '15.00', individual_use: false });

    const list = await api.get(SMART_COUPONS, { params: { search: code } });
    expect(list.ok()).toBeTruthy();
    expect((await list.json()).map((c: { id: number }) => c.id)).toEqual([coupon.id]);
    expect(Number(list.headers()['x-wp-total'])).toBe(1);

    // The merchant's own code replaces the old one; the rest stays.
    const renamed = uniqueCode('renamed');
    const updated = await updateCoupon(api, coupon.id, { code: renamed });
    expect(updated).toMatchObject({ id: coupon.id, code: renamed, title: 'E2E CRUD', amount: 15 });
    expect((await (await api.get(`/wp-json/wc/v3/coupons/${coupon.id}`)).json()).code).toBe(renamed);

    await setCouponStatus(api, coupon.id, false);
    expect((await getCoupon(api, coupon.id)).status).toBe('inactive');
    await setCouponStatus(api, coupon.id, true);
    expect((await getCoupon(api, coupon.id)).status).toBe('active');

    const deleted = await api.delete(`${SMART_COUPONS}/${coupon.id}`);
    expect(deleted.status()).toBe(204);
    expect((await api.get(`${SMART_COUPONS}/${coupon.id}`)).status()).toBe(404);
  });

  test('an automatic coupon gets its own code and keeps it on save', async ({ api }) => {
    const coupon = await made.create(api, { method: 'automatic', title: 'E2E Auto deal' });

    expect(coupon.code).toMatch(/^sg-automatic-[a-z0-9]{12}$/);
    expect((await updateCoupon(api, coupon.id, { amount: 12 })).code).toBe(coupon.code);
  });

  test('batch delete removes the ids it can and reports the rest', async ({ api }) => {
    const pro = await proActive(api);
    // Inactive, so two fit under the Free limit too.
    const one = await made.create(api, { status: 'inactive' });
    const two = await made.create(api, { status: pro ? 'active' : 'inactive' });

    const res = await api.post(`${SMART_COUPONS}/batch`, { data: { delete: [one.id, two.id, 999999999] } });
    expect(res.ok()).toBeTruthy();
    expect(await res.json()).toEqual({ deleted: [one.id, two.id], failed: [999999999] });
    expect((await api.get(`${SMART_COUPONS}/${one.id}`)).status()).toBe(404);
  });

  test('invalid values are refused with 400 and the field’s code', async ({ api }) => {
    const taken = await made.create(api, { status: 'inactive' });
    const cases: [Record<string, unknown>, string][] = [
      [{ title: '' }, 'smart_coupon_missing_title'],
      [{ code: '' }, 'smart_coupon_missing_code'],
      [{ code: taken.code }, 'smart_coupon_code_taken'],
      [{ amount: 150 }, 'smart_coupon_invalid_amount'],
      [{ discount_type: 'fixed', amount: 0 }, 'smart_coupon_invalid_amount'],
      [{ apply_to: 'products', product_ids: [] }, 'smart_coupon_missing_products'],
      [{ date_start: siteDate(2), date_end: siteDate(1) }, 'smart_coupon_invalid_dates'],
    ];

    for (const [values, code] of cases) {
      const res = await postCoupon(api, { status: 'inactive', ...values });
      expect(res.status(), `${JSON.stringify(values)} → ${code}`).toBe(400);
      expect((await res.json()).code).toBe(code);
    }

    expect((await api.get(`${SMART_COUPONS}/999999999`)).status()).toBe(404);
    expect((await api.put(`${SMART_COUPONS}/${taken.id}/status`, { data: { status: 'paused' } })).status()).toBe(400);
  });

  test.describe('Free plan', () => {
    test.beforeEach(async ({ api }) => {
      test.skip(await proActive(api), 'Free-plan limits: has_pro() is true on this stack');
    });

    test('one active everyday coupon; the next is refused and the list says so', async ({ api }) => {
      const before = await api.get(SMART_COUPONS);
      expect(before.headers()['x-spsg-can-create'], 'the stack should start with no active Smart Coupon').toBe('1');

      await made.create(api);

      const after = await api.get(SMART_COUPONS);
      expect(after.headers()['x-spsg-can-create']).toBe('0');
      expect((await (await api.get(`${SMART_COUPONS}/editor`)).json()).can_create).toBe(false);

      const refused = await postCoupon(api);
      expect(refused.status()).toBe(403);
      expect((await refused.json()).code).toBe('salesbooster_limit_exceeded');
    });

    test('an inactive coupon does not count toward the limit', async ({ api }) => {
      await made.create(api, { status: 'inactive' });
      expect((await api.get(SMART_COUPONS)).headers()['x-spsg-can-create']).toBe('1');
    });

    test('Pro options are refused (link, tiers, eligibility)', async ({ api }) => {
      for (const values of [
        { method: 'link' },
        { discount_type: 'tiers', tiers: ['2:10'] },
        { eligibility: 'first_time' },
      ]) {
        const res = await postCoupon(api, { status: 'inactive', ...values });
        expect(res.status(), JSON.stringify(values)).toBe(403);
        expect((await res.json()).code).toBe('smart_coupon_needs_pro');
      }
    });
  });

  test.describe('Pro', () => {
    test.beforeEach(async ({ api }) => {
      test.skip(!(await proActive(api)), 'needs has_pro()');
    });

    test('no limit on active coupons, and a link coupon gets its link', async ({ api }) => {
      await made.create(api);
      await made.create(api);
      expect((await api.get(SMART_COUPONS)).headers()['x-spsg-can-create']).toBe('1');

      const link = await made.create(api, { method: 'link' });
      expect(link.method).toBe('link');
      expect(link.link).toContain(env.baseURL.replace(/\/$/, ''));
    });
  });
});
