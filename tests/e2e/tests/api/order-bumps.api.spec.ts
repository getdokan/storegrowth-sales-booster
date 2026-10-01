import { test, expect } from '../../fixtures/test';
import { createOrderBump, deleteAllOrderBumps, deleteOrderBump } from '../../helpers/records';
import { PRODUCTS } from '../../data/products';

// Order bump CRUD on the 2.2.0 namespace (`spsg/v1`, kept permanently). The
// rules, the cap, both namespaces, status, batch and the schedule are in
// order-bump-rules.api.spec.ts. Payloads come from helpers/records.ts, which
// starts from the editor's schema defaults, so they are always complete.

const BASE = '/wp-json/spsg/v1/order-bumps';

test.describe('API · Upsell Order Bumps', () => {
  // Lite keeps two bumps of any status: start each test from an empty table.
  test.beforeEach(async ({ api }) => {
    await deleteAllOrderBumps(api);
  });

  // Leave nothing behind: the cap would block the next spec's creates.
  test.afterEach(async ({ api }) => {
    await deleteAllOrderBumps(api);
  });

  test('lists bumps as an array with the paging headers', async ({ api }) => {
    const res = await api.get(BASE, { params: { per_page: 10, page: 1 } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(res.headers()['x-wp-total']).toBe('0');
    expect(res.headers()['x-spsg-can-create']).toBe('1');
  });

  test('rejects a create missing required fields', async ({ api }) => {
    const res = await api.post(BASE, { data: { name: 'no product' } });
    expect(res.status()).toBe(400);
  });

  test('full lifecycle: create → read → update → delete', async ({ api }) => {
    let id: number | undefined;
    try {
      const bump = await createOrderBump(api, {
        name: 'E2E Bump Lifecycle',
        target_products: [PRODUCTS.a.id],
        offer_product_id: PRODUCTS.b.id,
      });
      id = bump.id;
      expect(bump.name).toBe('E2E Bump Lifecycle');
      expect(bump.status).toBe('active');
      expect(bump.target_products).toEqual([PRODUCTS.a.id]);
      expect(bump.offer_product_id).toBe(PRODUCTS.b.id);

      const read = await api.get(`${BASE}/${id}`);
      expect(read.status()).toBe(200);
      expect((await read.json()).id).toBe(id);

      const updated = await api.put(`${BASE}/${id}`, { data: { name: 'E2E Bump Updated' } });
      expect(updated.status()).toBe(200);
      const after = await updated.json();
      expect(after.name).toBe('E2E Bump Updated');
      // A partial update keeps everything it did not send.
      expect(after.offer_product_id).toBe(PRODUCTS.b.id);
      expect(after.target_products).toEqual([PRODUCTS.a.id]);

      const deleted = await api.delete(`${BASE}/${id}`);
      expect(deleted.status()).toBe(204);

      const gone = await api.get(`${BASE}/${id}`);
      expect(gone.status()).toBe(404);
      id = undefined;
    } finally {
      if (id) await deleteOrderBump(api, id);
    }
  });

  test('matching endpoint returns the bumps a cart qualifies for', async ({ api }) => {
    const bump = await createOrderBump(api, {
      target_products: [PRODUCTS.a.id],
      offer_product_id: PRODUCTS.b.id,
    });

    const hit = await api.get(`${BASE}/matching`, {
      params: { cart_products: PRODUCTS.a.id, cart_categories: 0 },
    });
    expect(hit.status()).toBe(200);
    // The route returns the stored rows (ids as the database gives them).
    expect((await hit.json()).map((b: { id: unknown }) => Number(b.id))).toContain(bump.id);

    const miss = await api.get(`${BASE}/matching`, {
      params: { cart_products: PRODUCTS.c.id, cart_categories: 0 },
    });
    expect(miss.status()).toBe(200);
    expect(await miss.json()).toEqual([]);
  });

  test('matching requires its cart params', async ({ api }) => {
    const res = await api.get(`${BASE}/matching`);
    expect(res.status()).toBe(400);
  });
});
