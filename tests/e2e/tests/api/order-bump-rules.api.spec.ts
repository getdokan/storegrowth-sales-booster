import { test, expect } from '../../fixtures/test';
import type { APIRequestContext } from '@playwright/test';
import { env } from '../../helpers/env';
import { expectOk, hasPro } from '../../helpers/rest';
import { createOrderBump, deleteAllOrderBumps, OrderBump } from '../../helpers/records';
import { PRODUCTS } from '../../data/products';

// The order-bump REST contract (docs/redesign/rest-api.md #26–31a): one
// controller under `sales-booster/v1` and the kept 2.2.0 `spsg/v1`, the save
// rules (400 per code), lite's 2-bump cap (403), design_settings merged and
// sanitized key by key, the Offer Days schedule checked in the site's
// timezone, status and batch.

const NEW = '/wp-json/sales-booster/v1/order-bumps';
const OLD = '/wp-json/spsg/v1/order-bumps';

/** A complete, valid create payload (the rule tests change one key). */
const valid = (overrides: Record<string, unknown> = {}) => ({
  name: 'E2E Rule Bump',
  target_type: 'products',
  target_products: [PRODUCTS.a.id],
  offer_product_id: PRODUCTS.b.id,
  offer_type: 'discount',
  offer_amount: 10,
  ...overrides,
});

async function expectError(res: Awaited<ReturnType<APIRequestContext['post']>>, status: number, code: string) {
  expect(res.status(), await res.text()).toBe(status);
  expect((await res.json()).code).toBe(code);
}

test.describe('API · Order Bump rules', () => {
  test.beforeEach(async ({ api }) => {
    await deleteAllOrderBumps(api);
  });

  test.afterEach(async ({ api }) => {
    await deleteAllOrderBumps(api);
  });

  test('both namespaces register every order-bump route', async ({ api }) => {
    for (const ns of ['sales-booster/v1', 'spsg/v1']) {
      const body = await (await api.get(`/wp-json/${ns}`)).json();
      const routes = Object.keys(body.routes ?? {});
      for (const suffix of ['', '/batch', '/editor', '/(?P<id>[\\d]+)', '/(?P<id>[\\d]+)/status', '/matching']) {
        expect(routes, `${ns} order-bumps${suffix}`).toContain(`/${ns}/order-bumps${suffix}`);
      }
    }
  });

  test('a bump created on one namespace is the same record on the other', async ({ api }) => {
    const res = await api.post(NEW, { data: valid() });
    expect(res.status()).toBe(201);
    const created = await res.json();

    const viaOld = await api.get(`${OLD}/${created.id}`);
    expect(viaOld.status()).toBe(200);
    expect((await viaOld.json()).name).toBe(created.name);

    const renamed = await api.put(`${OLD}/${created.id}`, { data: { name: 'Renamed on spsg/v1' } });
    expect(renamed.status()).toBe(200);
    expect((await (await api.get(`${NEW}/${created.id}`)).json()).name).toBe('Renamed on spsg/v1');
  });

  test('the editor route serves the page, schema, currency and the create flag', async ({ api }) => {
    const res = await api.get(`${NEW}/editor`);
    expect(res.status()).toBe(200);
    const editor = await res.json();

    expect(Object.keys(editor.page.tabs)).toEqual(['basic', 'design']);
    expect(Object.keys(editor.page.tabs.basic.sections)).toEqual(['setup', 'offer', 'advanced']);
    expect(editor.schema.offer_type.options).toEqual(['discount', 'price', 'free']);
    expect(editor.schema.bump_schedule).toMatchObject({ section: 'advanced', default: ['daily'] });
    expect(editor.can_create).toBe(true);
    expect(editor.currency).toMatchObject({ symbol: '$', decimals: 2 });
    expect(editor.fallback_image_url).toMatch(/bump-preview\.svg$/);
  });

  test('create rules answer 400 with their own code', async ({ api }) => {
    const cases: [string, Record<string, unknown>, string][] = [
      ['no target products', { target_products: [] }, 'order_bump_missing_target'],
      ['no target categories', { target_type: 'categories', target_categories: [] }, 'order_bump_missing_target'],
      ['an empty name', { name: '' }, 'order_bump_missing_name'],
      ['an unknown offer product', { offer_product_id: 999999 }, 'order_bump_invalid_offer_product'],
      ['a 0% discount', { offer_amount: 0 }, 'order_bump_invalid_discount'],
      ['a 101% discount', { offer_amount: 101 }, 'order_bump_invalid_discount'],
      ['a negative fixed price', { offer_type: 'price', offer_amount: -1 }, 'order_bump_invalid_price'],
      ['a fixed price above the maximum', { offer_type: 'price', offer_amount: 100000000 }, 'order_bump_invalid_price'],
    ];

    for (const [what, overrides, code] of cases) {
      await test.step(what, async () => {
        await expectError(await api.post(NEW, { data: valid(overrides) }), 400, code);
      });
    }

    // Nothing was stored by the rejected saves.
    expect(await (await api.get(NEW)).json()).toEqual([]);
  });

  test('an external product cannot be the offer', async ({ api }) => {
    const product = await api.post('/wp-json/wc/v3/products', {
      data: { name: 'E2E External Offer', type: 'external', regular_price: '10', product_url: 'https://example.com' },
    });
    await expectOk(product, 'create external product');
    const { id } = await product.json();
    try {
      await expectError(await api.post(NEW, { data: valid({ offer_product_id: id }) }), 400, 'order_bump_invalid_offer_product');
    } finally {
      await api.delete(`/wp-json/wc/v3/products/${id}`, { params: { force: true } });
    }
  });

  test('an update runs the rules only for the keys it sends', async ({ api }) => {
    const bump = await createOrderBump(api, valid());

    await expectError(await api.put(`${NEW}/${bump.id}`, { data: { offer_amount: 150 } }), 400, 'order_bump_invalid_discount');
    await expectError(await api.put(`${NEW}/${bump.id}`, { data: { name: '' } }), 400, 'order_bump_missing_name');

    // Switching to a fixed price makes the same amount valid.
    const priced = await api.put(`${NEW}/${bump.id}`, { data: { offer_type: 'price', offer_amount: 150 } });
    expect(priced.status()).toBe(200);
    expect(await priced.json()).toMatchObject({ offer_type: 'price', offer_amount: 150 });

    // Unknown ids answer 404.
    expect((await api.put(`${NEW}/999999`, { data: { name: 'x' } })).status()).toBe(404);
  });

  test('a free offer forces the amount to 0 and the bump price to nothing', async ({ api }) => {
    const bump = await createOrderBump(api, valid({ offer_type: 'free', offer_amount: 40 }));
    expect(bump.offer_type).toBe('free');
    expect(bump.offer_amount).toBe(0);
    expect(bump.offer_prices).toEqual({ regular: '$49.00', offer: '$0.00' });
  });

  test('list rows carry the cell data: targets, offer product and prices', async ({ api }) => {
    const bump = await createOrderBump(api, valid({ offer_amount: 10 }));
    expect(bump.targets).toEqual([expect.objectContaining({ id: PRODUCTS.a.id, name: PRODUCTS.a.name })]);
    expect(bump.offer_product_info).toMatchObject({ id: PRODUCTS.b.id, type: 'simple', regular_price: '49.00' });
    // 10% off 49.00.
    expect(bump.offer_prices).toEqual({ regular: '$49.00', offer: '$44.10' });

    const fixed = await (await api.put(`${NEW}/${bump.id}`, { data: { offer_type: 'price', offer_amount: 2 } })).json();
    expect(fixed.offer_prices).toEqual({ regular: '$49.00', offer: '$2.00' });
  });

  test('search matches the name; X-WP-Total counts the matches', async ({ api }) => {
    await createOrderBump(api, valid({ name: 'Alpha Search Bump' }));
    await createOrderBump(api, valid({ name: 'Beta Other Bump' }));

    const res = await api.get(NEW, { params: { search: 'Alpha' } });
    expect(res.status()).toBe(200);
    expect((await res.json()).map((b: OrderBump) => b.name)).toEqual(['Alpha Search Bump']);
    expect(res.headers()['x-wp-total']).toBe('1');

    const none = await api.get(NEW, { params: { search: 'no-such-bump-xyz' } });
    expect(await none.json()).toEqual([]);
    expect(none.headers()['x-wp-total']).toBe('0');
  });

  test('an update merges design_settings key by key and keeps unknown keys', async ({ api }) => {
    const bump = await createOrderBump(api, valid({ design_settings: { box_border_color: '#112233', e2e_extension_key: 'kept' } }));
    expect(bump.design_settings).toMatchObject({ box_border_color: '#112233', e2e_extension_key: 'kept' });
    const discountColor = (bump.design_settings as Record<string, unknown>).discount_text_color;

    const res = await api.put(`${NEW}/${bump.id}`, { data: { design_settings: { discount_background_color: '#abcdef' } } });
    expect(res.status()).toBe(200);
    const design = (await res.json()).design_settings;
    expect(design).toMatchObject({
      discount_background_color: '#abcdef',
      box_border_color: '#112233', // not sent: kept
      discount_text_color: discountColor,
      e2e_extension_key: 'kept', // unknown key: kept
    });
  });

  test('design_settings are sanitized per key', async ({ api }) => {
    // Posted as is (not through createOrderBump(), whose editor defaults send a
    // top-level `offer_discount_title`, which wins over the design's).
    const res = await api.post(NEW, {
      data: valid({
        design_settings: {
          box_border_color: 'red;}body{display:none',
          box_border_style: 'groove',
          box_top_margin: 500,
          discount_font_size: 250,
          offer_discount_title: '<b>Bold</b> deal',
        },
      }),
    });
    expect(res.status(), await res.text()).toBe(201);
    const bump = (await res.json()) as OrderBump;
    const design = bump.design_settings as Record<string, unknown>;
    const { schema } = await (await api.get(`${NEW}/editor`)).json();

    expect(design.box_border_color, 'an invalid colour falls back to the default').toBe(schema.box_border_color.default);
    expect(design.box_border_style, 'an unknown border falls back to the default').toBe(schema.box_border_style.default);
    expect(Number(design.box_top_margin), 'margins are clamped to 200').toBe(200);
    expect(Number(design.discount_font_size), 'font sizes are clamped to 100').toBe(100);
    expect(design.offer_discount_title).toBe('Bold deal');
  });

  test('status: active/inactive and yes/no; unknown ids 404', async ({ api }) => {
    const bump = await createOrderBump(api, valid());

    for (const [sent, stored] of [
      ['no', 'inactive'],
      ['yes', 'active'],
      ['inactive', 'inactive'],
      ['active', 'active'],
    ]) {
      const res = await api.post(`${NEW}/${bump.id}/status`, { data: { status: sent } });
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ id: bump.id, status: stored });
    }

    // The old namespace takes PATCH as 2.2.0's client would.
    const patched = await api.patch(`${OLD}/${bump.id}/status`, { data: { status: 'no' } });
    expect(await patched.json()).toEqual({ id: bump.id, status: 'inactive' });

    // An inactive bump is never matched.
    const matching = await api.get(`${NEW}/matching`, { params: { cart_products: PRODUCTS.a.id, cart_categories: 0 } });
    expect(await matching.json()).toEqual([]);

    expect((await api.post(`${NEW}/999999/status`, { data: { status: 'yes' } })).status()).toBe(404);
  });

  test('batch delete reports what it deleted and what failed', async ({ api }) => {
    const a = await createOrderBump(api, valid());
    const b = await createOrderBump(api, valid());

    const res = await api.post(`${NEW}/batch`, { data: { delete: [a.id, b.id, 999999] } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ deleted: [a.id, b.id], failed: [999999] });
    expect(await (await api.get(NEW)).json()).toEqual([]);
  });

  test('lite caps bumps at two of any status (creates only)', async ({ api }) => {
    test.skip(await hasPro(api), 'pro lifts the cap');

    const first = await createOrderBump(api, valid());
    await createOrderBump(api, valid());
    // An inactive bump still counts.
    await api.post(`${NEW}/${first.id}/status`, { data: { status: 'no' } });

    const list = await api.get(NEW);
    expect(list.headers()['x-spsg-can-create']).toBe('0');
    expect((await (await api.get(`${NEW}/editor`)).json()).can_create).toBe(false);

    for (const base of [NEW, OLD]) {
      await expectError(await api.post(base, { data: valid() }), 403, 'salesbooster_limit_exceeded');
    }

    // At the cap the existing bumps can still be edited and switched.
    expect((await api.put(`${NEW}/${first.id}`, { data: { name: 'Still editable' } })).status()).toBe(200);
    expect((await api.post(`${NEW}/${first.id}/status`, { data: { status: 'yes' } })).status()).toBe(200);

    // Deleting one frees a slot.
    await api.delete(`${NEW}/${first.id}`);
    expect((await api.post(NEW, { data: valid() })).status()).toBe(201);
  });

  test('anonymous callers are rejected on both namespaces', async ({ playwright, api }) => {
    const bump = await createOrderBump(api, valid());
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });
    try {
      for (const base of [NEW, OLD]) {
        for (const [method, path] of [
          ['get', base],
          ['get', `${base}/editor`],
          ['post', base],
          ['put', `${base}/${bump.id}`],
          ['delete', `${base}/${bump.id}`],
          ['post', `${base}/${bump.id}/status`],
          ['post', `${base}/batch`],
        ] as const) {
          // A valid body for each route: WordPress validates the args before
          // the permission check, so an invalid one would answer 400 first.
          const data = method === 'get' ? undefined : path.endsWith('/status') ? { status: 'no' } : path.endsWith('/batch') ? { delete: [bump.id] } : valid();
          const res = await anon[method](path, { data });
          expect([401, 403], `anon ${method.toUpperCase()} ${path}`).toContain(res.status());
        }
      }
    } finally {
      await anon.dispose();
    }
    expect((await api.get(`${NEW}/${bump.id}`)).status(), 'the bump survived').toBe(200);
  });
});

test.describe('API · Order Bump schedule (Offer Days)', () => {
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  test.beforeEach(async ({ api }) => {
    await deleteAllOrderBumps(api);
  });

  test.afterEach(async ({ api }) => {
    await deleteAllOrderBumps(api);
  });

  test('bump_schedule is sanitized: known days in week order, daily wins, empty means daily', async ({ api }) => {
    const cases: [unknown, string[]][] = [
      [['sunday', 'monday'], ['monday', 'sunday']],
      [['funday', 'tuesday'], ['tuesday']],
      [['monday', 'daily'], ['daily']],
      [[], ['daily']],
      [['funday'], ['daily']],
      ['wednesday,friday', ['wednesday', 'friday']],
    ];

    const bump = await createOrderBump(api, valid());
    expect((bump.design_settings as Record<string, unknown>).bump_schedule, 'a new bump runs daily').toEqual(['daily']);

    for (const [sent, stored] of cases) {
      const res = await api.put(`${NEW}/${bump.id}`, { data: { design_settings: { bump_schedule: sent } } });
      expect(res.status()).toBe(200);
      expect((await res.json()).design_settings.bump_schedule, JSON.stringify(sent)).toEqual(stored);
    }
  });

  test("a scheduled bump matches only on its days, in the site's timezone", async ({ api }) => {
    // UTC+14 and UTC−11 are always on different dates, so a bump set to the
    // UTC+14 day must match there and not under UTC−11, whatever the time is
    // when the test runs. This proves the check reads the site's day, not the
    // server's.
    const AHEAD = 'Pacific/Kiritimati'; // UTC+14
    const BEHIND = 'Pacific/Pago_Pago'; // UTC−11
    const dayIn = (timeZone: string) =>
      new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(new Date()).toLowerCase();

    const settings = await api.get('/wp-json/wp/v2/settings');
    await expectOk(settings, 'read site settings');
    const original: string = (await settings.json()).timezone || 'UTC';

    const setTimezone = async (timezone: string) => {
      const res = await api.post('/wp-json/wp/v2/settings', { data: { timezone } });
      await expectOk(res, `set timezone ${timezone}`);
    };
    const matched = async () => {
      const res = await api.get(`${NEW}/matching`, { params: { cart_products: PRODUCTS.a.id, cart_categories: 0 } });
      expect(res.status()).toBe(200);
      return (await res.json()).map((b: { id: unknown }) => Number(b.id));
    };

    try {
      await setTimezone(AHEAD);
      const day = dayIn(AHEAD);
      expect(DAYS).toContain(day);
      expect(dayIn(BEHIND)).not.toBe(day);

      const scheduled = await createOrderBump(api, valid({ design_settings: { bump_schedule: [day] } }));
      const daily = await createOrderBump(api, valid({ offer_product_id: PRODUCTS.c.id }));

      expect(await matched(), `site day ${day}: both bumps run`).toEqual(expect.arrayContaining([scheduled.id, daily.id]));

      await setTimezone(BEHIND);
      const other = await matched();
      expect(other, `site day ${dayIn(BEHIND)}: the ${day} bump is hidden`).not.toContain(scheduled.id);
      expect(other, 'a daily bump runs every day').toContain(daily.id);
    } finally {
      await setTimezone(original);
    }
  });
});
