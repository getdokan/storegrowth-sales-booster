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
// `shop_coupon` posts with StoreGrowth's meta, behind `manage_options`. Free
// has unlimited code and link coupons, one active automatic coupon, specific
// roles, total uses and one use per customer; Pro lifts the automatic limit
// and adds tiers, first-time / returning / specific customers and more uses
// per customer.

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
    expect(Object.keys(editor.schema)).toEqual(expect.arrayContaining(['usage_limit', 'one_per_customer']));
    // The Pro options' fields are StoreGrowth Pro's (it adds them when it runs them).
    const proFields = ['tier_basis', 'tiers', 'customer_emails', 'customer_uses'];
    const pro = await proActive(api);
    expect(editor.pro_options).toBe(pro);
    for (const key of proFields) {
      expect(Object.keys(editor.schema).includes(key), key).toBe(pro);
    }
    expect(editor.schema.eligibility.options).toEqual(['all', 'roles', 'first_time', 'returning', 'customers']);
    expect(editor.can_create).toBe(true);
    expect(editor).toHaveProperty('automatic_on');
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

  test('the list shows uses, discount given and revenue', async ({ api }) => {
    const coupon = await made.create(api);
    const list = await api.get(SMART_COUPONS, { params: { search: coupon.code } });
    const [row] = await list.json();

    expect(row).toMatchObject({ id: coupon.id, uses: 0 });
    expect(typeof row.discount_given).toBe('string');
    expect(typeof row.revenue).toBe('string');
  });

  test('total uses, uses per customer and specific customers are WooCommerce’s limits', async ({ api }) => {
    const pro = await proActive(api);
    const coupon = await made.create(api, {
      usage_limit: 25,
      one_per_customer: true,
      ...(pro ? { customer_uses: 2, eligibility: 'customers', customer_emails: 'jane@example.com' } : {}),
    });

    const wc = await (await api.get(`/wp-json/wc/v3/coupons/${coupon.id}`)).json();
    expect(wc.usage_limit).toBe(25);
    expect(wc.usage_limit_per_user).toBe(pro ? 2 : 1);
    expect(wc.email_restrictions).toEqual(pro ? ['jane@example.com'] : []);
  });

  test('batch delete removes the ids it can and reports the rest', async ({ api }) => {
    const one = await made.create(api);
    const two = await made.create(api);

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

    test('code and link coupons are unlimited; the editor names the automatic one that is on', async ({ api }) => {
      await made.create(api);
      await made.create(api);
      const link = await made.create(api, { method: 'link' });
      expect(link.link).toContain(env.baseURL.replace(/\/$/, ''));
      expect((await api.get(SMART_COUPONS)).headers()['x-spsg-can-create']).toBe('1');

      const automatic = await made.create(api, { method: 'automatic', title: 'E2E Auto on' });
      const editor = await (await api.get(`${SMART_COUPONS}/editor`)).json();
      expect(editor.automatic_on).toEqual({ id: automatic.id, name: 'E2E Auto on' });
    });

    test('specific roles are Free', async ({ api }) => {
      const coupon = await made.create(api, { eligibility: 'roles', roles: ['customer'] });
      expect(coupon).toMatchObject({ eligibility: 'roles', roles: ['customer'] });
    });

    test('Pro options are refused (tiers, first-time, returning, specific customers, uses per customer)', async ({ api }) => {
      for (const values of [
        { discount_type: 'tiers', tiers: ['2:10'] },
        { eligibility: 'first_time' },
        { eligibility: 'returning' },
        { eligibility: 'customers', customer_emails: 'jane@example.com' },
        { one_per_customer: true, customer_uses: 2 },
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

    test('no limit on active automatic coupons', async ({ api }) => {
      await made.create(api, { method: 'automatic', title: 'E2E Auto one' });
      await made.create(api, { method: 'automatic', title: 'E2E Auto two' });
      expect((await (await api.get(`${SMART_COUPONS}/editor`)).json()).automatic_on).toBeNull();
    });
  });
});
