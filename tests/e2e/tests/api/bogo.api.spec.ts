import { test, expect } from '../../fixtures/test';
import { createBogoOffer, deleteAllBogoOffers, listBogoOffers } from '../../helpers/records';
import { setModuleStatus } from '../../helpers/rest';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// BOGO offers CRUD (`sales-booster/v1/bogo/offers`, rest-api #18–24). Lite
// allows two global offers, so every test starts from an empty table.
// Validation rules, the lite cap, batch delete and status: bogo-rules.api.spec.ts.
const BASE = '/wp-json/sales-booster/v1/bogo/offers';

test.describe('API · BOGO offers', () => {
  test.beforeEach(async ({ api }) => {
    await setModuleStatus(api, MODULES.bogo.id, true);
    await deleteAllBogoOffers(api);
  });

  test.afterEach(async ({ api }) => {
    await deleteAllBogoOffers(api);
  });

  test('lists offers as an array with the paging headers', async ({ api }) => {
    const res = await api.get(BASE);
    expect(res.ok()).toBeTruthy();
    expect(await res.json()).toEqual([]);
    // Always sent, 0 included (10a, bug 3).
    expect(res.headers()['x-wp-total']).toBe('0');
    expect(res.headers()['x-wp-totalpages']).toBe('0');
    expect(res.headers()['x-spsg-can-create']).toBe('1');
  });

  test('rejects a create that is missing required fields', async ({ api }) => {
    const res = await api.post(BASE, { data: { name_of_order_bogo: 'incomplete' } });
    expect(res.status()).toBe(400);
  });

  test('full lifecycle: create → read → update → toggle status → delete', async ({ api }) => {
    const offer = await createBogoOffer(api, {
      name_of_order_bogo: 'E2E Lifecycle',
      offered_products: [PRODUCTS.a.id],
      get_different_product_field: PRODUCTS.b.id,
      box_border_color: '#123456',
    });
    expect(offer.name).toBe('E2E Lifecycle');
    expect(offer.status).toBe('active');
    expect(offer.type).toBe('global');
    expect(offer.offered_products.map(Number)).toEqual([PRODUCTS.a.id]);
    expect(Number(offer.get_different_product_field)).toBe(PRODUCTS.b.id);

    // GET returns the design keys and the schedule (10a, bug 1).
    const read = await api.get(`${BASE}/${offer.id}`);
    expect(read.status()).toBe(200);
    const body = await read.json();
    expect(body.id).toBe(offer.id);
    expect(body.box_border_color).toBe('#123456');
    expect(body.offer_schedule).toEqual(['daily']);

    // An update sends only what changes (a merge, 10a).
    const updated = await api.put(`${BASE}/${offer.id}`, { data: { name_of_order_bogo: 'E2E Lifecycle Renamed' } });
    expect(updated.status()).toBe(200);
    const after = await updated.json();
    expect(after.name).toBe('E2E Lifecycle Renamed');
    expect(after.box_border_color).toBe('#123456');
    expect(Number(after.get_different_product_field)).toBe(PRODUCTS.b.id);

    const status = await api.put(`${BASE}/${offer.id}/status`, { data: { status: 'no' } });
    expect(status.status()).toBe(200);
    expect((await status.json()).status).toBe('no');
    expect((await (await api.get(`${BASE}/${offer.id}`)).json()).status).toBe('inactive');

    const del = await api.delete(`${BASE}/${offer.id}`);
    expect(del.status()).toBe(200);
    expect(await del.json()).toEqual({ deleted: true });
    expect((await api.get(`${BASE}/${offer.id}`)).status()).toBe(404);
  });

  test('search, status and type filter the list and its total (10a, bugs 2–3)', async ({ api }) => {
    const apple = await createBogoOffer(api, {
      name_of_order_bogo: 'E2E Apple Deal',
      offered_products: [PRODUCTS.a.id],
      get_different_product_field: PRODUCTS.b.id,
    });
    const pear = await createBogoOffer(api, {
      name_of_order_bogo: 'E2E Pear Deal',
      offered_products: [PRODUCTS.c.id],
      get_different_product_field: PRODUCTS.b.id,
    });
    await api.put(`${BASE}/${pear.id}/status`, { data: { status: 'no' } });

    const all = await api.get(BASE);
    expect(all.headers()['x-wp-total']).toBe('2');

    const search = await api.get(BASE, { params: { search: 'Apple' } });
    expect((await search.json()).map((o: { id: number }) => o.id)).toEqual([apple.id]);
    expect(search.headers()['x-wp-total']).toBe('1');

    const inactive = await api.get(BASE, { params: { status: 'inactive' } });
    expect((await inactive.json()).map((o: { id: number }) => o.id)).toEqual([pear.id]);

    const product = await api.get(BASE, { params: { type: 'product' } });
    expect(await product.json()).toEqual([]);
    expect(product.headers()['x-wp-total']).toBe('0');

    const paged = await api.get(BASE, { params: { per_page: 1, page: 2 } });
    expect(await paged.json()).toHaveLength(1);
    expect(paged.headers()['x-wp-totalpages']).toBe('2');
  });

  test('list rows carry what the list shows: status, prices, product info', async ({ api }) => {
    await createBogoOffer(api, {
      offered_products: [PRODUCTS.a.id],
      get_different_product_field: PRODUCTS.b.id,
    });
    const [row] = await listBogoOffers(api);
    expect(row.status).toBe('active');
    expect(row.offer_prices).toEqual({ regular: '$49.00', offer: '$0.00' });
    expect((row.get_offered_product_info as { id: number }).id).toBe(PRODUCTS.a.id);
    expect((row.get_different_product_info as { id: number }).id).toBe(PRODUCTS.b.id);
  });

  test('reading, updating and deleting a non-existent offer 404s', async ({ api }) => {
    expect((await api.get(`${BASE}/99999999`)).status()).toBe(404);
    expect((await api.put(`${BASE}/99999999`, { data: { name_of_order_bogo: 'x' } })).status()).toBe(404);
    expect((await api.delete(`${BASE}/99999999`)).status()).toBe(404);
  });

  test('a guest is rejected (401)', async ({ playwright, baseURL }) => {
    const anon = await playwright.request.newContext({ baseURL });
    expect((await anon.get(BASE)).status()).toBe(401);
    expect((await anon.get(`${BASE}/editor`)).status()).toBe(401);
    await anon.dispose();
  });

  test('the routes are not registered while the module is off', async ({ api }) => {
    await setModuleStatus(api, MODULES.bogo.id, false);
    try {
      expect((await api.get(BASE)).status()).toBe(404);
    } finally {
      await setModuleStatus(api, MODULES.bogo.id, true);
    }
  });
});
