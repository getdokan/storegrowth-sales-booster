import { test, expect } from '../../fixtures/test';
import type { APIRequestContext } from '@playwright/test';
import { createBogoOffer, deleteAllBogoOffers } from '../../helpers/records';
import { expectOk, hasPro, schemaDefaults, setModuleStatus, type SettingsField } from '../../helpers/rest';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// The BOGO routes' rules (docs/redesign/modules/bogo.md 10a, 10c, 10d;
// rest-api.md #18–24): the editor's validation as 400s, lite's cap of two
// global offers (403), the merge on PUT, batch delete, the status route and
// both offer types. Every test starts and ends with an empty offer table.
const BASE = '/wp-json/sales-booster/v1/bogo/offers';

/** A complete, valid create body (the editor's defaults + a Buy X Get Y deal). */
async function validBody(api: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const res = await api.get(`${BASE}/editor`);
  await expectOk(res, 'read BOGO editor');
  const { schema } = (await res.json()) as { schema: Record<string, SettingsField> };
  return {
    ...schemaDefaults(schema),
    name_of_order_bogo: 'E2E Rules',
    offered_products: [PRODUCTS.a.id],
    get_different_product_field: PRODUCTS.b.id,
    ...overrides,
  };
}

/** POST a create and return status + error code. */
async function create(api: APIRequestContext, body: Record<string, unknown>) {
  const res = await api.post(BASE, { data: body });
  const json = await res.json();
  return { status: res.status(), code: json.code as string | undefined, json };
}

test.describe('API · BOGO rules', () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, MODULES.bogo.id, true);
    await deleteAllBogoOffers(api);
  });

  test.afterEach(async ({ api }) => {
    await deleteAllBogoOffers(api);
  });

  test.describe('validation (400)', () => {
    const cases: [string, Record<string, unknown>, string][] = [
      ['an empty name', { name_of_order_bogo: '   ' }, 'missing_name_of_order_bogo'],
      ['no offer type', { offer_type: '' }, 'missing_offer_type'],
      ['a missing design field', { box_border_style: '' }, 'missing_design_field'],
      ['a 0% discount', { offer_type: 'discount', discount_amount: 0 }, 'bogo_invalid_discount'],
      ['a 150% discount', { offer_type: 'discount', discount_amount: 150 }, 'bogo_invalid_discount'],
      ['an end before the start', { offer_start: '2030-05-10', offer_end: '2030-05-01' }, 'bogo_invalid_dates'],
      ['no target product', { offered_products: [] }, 'bogo_missing_target'],
      ['Buy X Get Y without an offer product', { get_different_product_field: 0 }, 'bogo_missing_offer_product'],
      ['the offer product among the targets', { get_different_product_field: PRODUCTS.a.id }, 'bogo_same_product'],
    ];

    for (const [what, overrides, code] of cases) {
      test(`${what} → ${code}`, async ({ api }) => {
        const res = await create(api, await validBody(api, overrides));
        expect(res.status, JSON.stringify(res.json)).toBe(400);
        expect(res.code).toBe(code);
      });
    }

    // ISSUES #11: `bogo_deal_type` is `same` | `different`, `offer_type`
    // `free` | `discount` (an unknown offer type was stored, and the cart gave
    // the gift free).
    for (const [what, overrides] of [
      ['an unknown deal type', { bogo_deal_type: 'other' }],
      ['an unknown offer type', { offer_type: 'percentage' }],
    ] as [string, Record<string, unknown>][]) {
      test(`${what} → rest_invalid_param`, async ({ api }) => {
        const res = await create(api, await validBody(api, overrides));
        expect(res.status, JSON.stringify(res.json)).toBe(400);
        expect(res.code).toBe('rest_invalid_param');
      });
    }

    test('an update that sends an unknown type → rest_invalid_param; the offer is unchanged', async ({ api }) => {
      const offer = await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });
      for (const data of [{ offer_type: 'percentage' }, { bogo_deal_type: 'other' }]) {
        const res = await api.put(`${BASE}/${offer.id}`, { data });
        expect(res.status()).toBe(400);
        expect((await res.json()).code).toBe('rest_invalid_param');
      }
      const stored = await (await api.get(`${BASE}/${offer.id}`)).json();
      expect(stored.offer_type).toBe(offer.offer_type);
      expect(stored.bogo_deal_type).toBe(offer.bogo_deal_type);
    });

    test('a missing name key is WordPress\'s required-param error', async ({ api }) => {
      const body = await validBody(api);
      delete (body as Record<string, unknown>).name_of_order_bogo;
      const res = await create(api, body);
      expect(res.status).toBe(400);
      expect(res.code).toBe('rest_missing_callback_param');
    });

    test('a second active offer on the same target → bogo_offer_exists', async ({ api }) => {
      await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });
      const res = await create(api, await validBody(api, { get_different_product_field: PRODUCTS.c.id }));
      expect(res.status).toBe(400);
      expect(res.code).toBe('bogo_offer_exists');
    });

    test('an inactive offer on the same target does not block a new one', async ({ api }) => {
      const first = await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });
      await api.put(`${BASE}/${first.id}/status`, { data: { status: 'no' } });
      const res = await create(api, await validBody(api, { get_different_product_field: PRODUCTS.c.id }));
      expect(res.status, JSON.stringify(res.json)).toBe(201);
    });

    test('an update checks only the rules about the keys it sends', async ({ api }) => {
      const offer = await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });

      const badDiscount = await api.put(`${BASE}/${offer.id}`, { data: { offer_type: 'discount', discount_amount: 101 } });
      expect(badDiscount.status()).toBe(400);
      expect((await badDiscount.json()).code).toBe('bogo_invalid_discount');

      const noTarget = await api.put(`${BASE}/${offer.id}`, { data: { offered_products: [] } });
      expect((await noTarget.json()).code).toBe('bogo_missing_target');

      const badDates = await api.put(`${BASE}/${offer.id}`, { data: { offer_start: '2030-05-10', offer_end: '2030-05-01' } });
      expect((await badDates.json()).code).toBe('bogo_invalid_dates');

      // A rename sends none of those keys.
      const rename = await api.put(`${BASE}/${offer.id}`, { data: { name_of_order_bogo: 'E2E Renamed' } });
      expect(rename.status()).toBe(200);
    });
  });

  test.describe('lite: the cap of two global offers (403) and pro-only values', () => {
    test.beforeEach(async ({ api }) => {
      test.skip(await hasPro(api), 'lite-only rules');
    });

    test('a third offer is refused, inactive offers count, and the list/editor say so', async ({ api }) => {
      const first = await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });
      await api.put(`${BASE}/${first.id}/status`, { data: { status: 'no' } });
      await createBogoOffer(api, { offered_products: [PRODUCTS.c.id], get_different_product_field: PRODUCTS.b.id });

      const third = await create(api, await validBody(api, { offered_products: [PRODUCTS.b.id], get_different_product_field: PRODUCTS.c.id }));
      expect(third.status).toBe(403);
      expect(third.code).toBe('salesbooster_limit_exceeded');

      // WordPress checks the route's required args first: a body missing them
      // gets 400 even at the cap (bogo.md 10a note).
      expect((await create(api, {})).status).toBe(400);

      const list = await api.get(BASE);
      expect(list.headers()['x-spsg-can-create']).toBe('0');
      expect((await (await api.get(`${BASE}/editor`)).json()).can_create).toBe(false);

      // Editing an existing offer still works at the cap.
      expect((await api.put(`${BASE}/${first.id}`, { data: { name_of_order_bogo: 'E2E At Cap' } })).status()).toBe(200);

      // Freeing a slot lifts it.
      expect((await api.delete(`${BASE}/${first.id}`)).ok()).toBeTruthy();
      expect((await api.get(BASE)).headers()['x-spsg-can-create']).toBe('1');
      expect((await (await api.get(`${BASE}/editor`)).json()).can_create).toBe(true);
    });

    test('pro-only values are ignored without pro (R3)', async ({ api }) => {
      const res = await create(
        api,
        await validBody(api, {
          minimum_quantity_required: 3,
          product_page_message: 'E2E custom message',
          offer_schedule: ['monday'],
          default_badge_icon_name: 'bogo-icons-3',
        }),
      );
      expect(res.status).toBe(201);
      const offer = await (await api.get(`${BASE}/${res.json.id}`)).json();
      expect(Number(offer.minimum_quantity_required)).toBe(1);
      expect(offer.product_page_message).toBe('Free Gift');
      expect(offer.offer_schedule).toEqual(['daily']);
      expect(offer.default_badge_icon_name).toBe('bogo-icons-1');

      // An update keeps the stored value.
      const updated = await (await api.put(`${BASE}/${res.json.id}`, { data: { minimum_quantity_required: 5 } })).json();
      expect(Number(updated.minimum_quantity_required)).toBe(1);
    });

    test('an update cannot switch a lite offer to Buy X Get X', async ({ api }) => {
      const offer = await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });
      const res = await api.put(`${BASE}/${offer.id}`, { data: { bogo_deal_type: 'same' } });
      expect(res.status()).toBe(200);
      expect((await res.json()).bogo_deal_type).toBe('different');
    });
  });

  test('PUT merges: one key changes, every design and badge key is kept', async ({ api }) => {
    const design = {
      box_border_style: 'dashed',
      box_border_color: '#111111',
      box_top_margin: 7,
      box_bottom_margin: 9,
      discount_background_color: '#222222',
      discount_text_color: '#333333',
      discount_font_size: 15,
      product_description_text_color: '#444444',
      product_description_font_size: 16,
      enable_custom_badge_image: true,
    };
    const offer = await createBogoOffer(api, {
      offered_products: [PRODUCTS.a.id],
      get_different_product_field: PRODUCTS.b.id,
      offer_type: 'discount',
      discount_amount: 30,
      offer_start: '2030-01-01',
      offer_end: '2030-12-31',
      ...design,
    });

    const res = await api.put(`${BASE}/${offer.id}`, { data: { name_of_order_bogo: 'E2E Merge' } });
    expect(res.status()).toBe(200);
    const after = await (await api.get(`${BASE}/${offer.id}`)).json();

    expect(after.name).toBe('E2E Merge');
    for (const [key, value] of Object.entries(design)) {
      // Numbers may come back as strings (the design JSON keeps what was sent).
      expect(String(after[key]), key).toBe(String(value));
    }
    expect(after.offer_type).toBe('discount');
    expect(Number(after.discount_amount)).toBe(30);
    expect(String(after.offer_start)).toContain('2030-01-01');
    expect(String(after.offer_end)).toContain('2030-12-31');
    expect(after.offered_products.map(Number)).toEqual([PRODUCTS.a.id]);
    expect(Number(after.get_different_product_field)).toBe(PRODUCTS.b.id);
  });

  test('batch delete deletes what exists and reports the rest', async ({ api }) => {
    const a = await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });
    const b = await createBogoOffer(api, { offered_products: [PRODUCTS.c.id], get_different_product_field: PRODUCTS.b.id });

    const res = await api.post(`${BASE}/batch`, { data: { delete: [a.id, b.id, 99999999] } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.deleted.sort()).toEqual([a.id, b.id].sort());
    expect(body.failed).toEqual([99999999]);
    expect(await (await api.get(BASE)).json()).toEqual([]);

    // `delete` is required.
    expect((await api.post(`${BASE}/batch`, { data: {} })).status()).toBe(400);
  });

  test('status: yes/no only; echoed as sent, stored as active/inactive', async ({ api }) => {
    const offer = await createBogoOffer(api, { offered_products: [PRODUCTS.a.id], get_different_product_field: PRODUCTS.b.id });
    const url = `${BASE}/${offer.id}/status`;

    const off = await api.post(url, { data: { status: 'no' } });
    expect(off.status()).toBe(200);
    expect(await off.json()).toEqual({ status: 'no' });
    expect((await (await api.get(`${BASE}/${offer.id}`)).json()).status).toBe('inactive');

    const on = await api.put(url, { data: { status: 'yes' } });
    expect(await on.json()).toEqual({ status: 'yes' });
    expect((await (await api.get(`${BASE}/${offer.id}`)).json()).status).toBe('active');

    const bad = await api.put(url, { data: { status: 'maybe' } });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).code).toBe('rest_invalid_param');

    expect((await api.put(`${BASE}/99999999/status`, { data: { status: 'yes' } })).status()).toBe(404);
  });

  test.describe('both offer types price the offer product', () => {
    test('free: the offer product costs nothing', async ({ api }) => {
      const offer = await createBogoOffer(api, {
        offered_products: [PRODUCTS.a.id],
        get_different_product_field: PRODUCTS.b.id,
        offer_type: 'free',
      });
      expect(offer.offer_type).toBe('free');
      expect(offer.offer_prices).toEqual({ regular: '$49.00', offer: '$0.00' });
    });

    test('percentage: 50% off the offer product', async ({ api }) => {
      const offer = await createBogoOffer(api, {
        offered_products: [PRODUCTS.a.id],
        get_different_product_field: PRODUCTS.b.id,
        offer_type: 'discount',
        discount_amount: 50,
      });
      expect(offer.offer_type).toBe('discount');
      expect(Number(offer.discount_amount)).toBe(50);
      expect(offer.offer_prices).toEqual({ regular: '$49.00', offer: '$24.50' });
    });
  });

  test('the editor route serves the page, schema and lite state', async ({ api }) => {
    const res = await api.get(`${BASE}/editor`);
    expect(res.ok()).toBeTruthy();
    const editor = await res.json();
    expect(Object.keys(editor.page.tabs)).toEqual(['basic', 'content', 'design']);
    expect(editor.schema.bogo_deal_type.options).toEqual(['different', 'same']);
    expect(editor.schema.offer_type.options).toEqual(['free', 'discount']);
    expect(editor.schema.minimum_quantity_required.pro).toBe(true);
    expect(editor.can_create).toBe(true);
    expect(editor.currency.symbol).toBe('$');
    expect(typeof editor.show_regular_price).toBe('boolean');
  });
});
