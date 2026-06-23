import { test, expect } from '../../fixtures/test';
import type { APIRequestContext } from '@playwright/test';

const BASE = '/wp-json/spsg/v1/order-bumps';

async function createBump(api: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const res = await api.post(BASE, {
    data: { name: 'E2E Bump', offer_product_id: 11, status: 'active', ...overrides },
  });
  return res;
}

test.describe('API · Upsell Order Bumps', () => {
  test('lists bumps as an array', async ({ api }) => {
    const res = await api.get(BASE, { params: { per_page: 10, page: 1 } });
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('rejects a create missing required fields', async ({ api }) => {
    const res = await api.post(BASE, { data: { name: 'no product' } });
    expect(res.status()).toBe(400);
  });

  test('full lifecycle: create → read → update → delete', async ({ api }) => {
    let id: string | number | undefined;
    try {
      const created = await createBump(api, { name: 'E2E Bump Lifecycle' });
      expect(created.status()).toBe(201);
      const bump = await created.json();
      id = bump.id;
      expect(bump.name).toBe('E2E Bump Lifecycle');

      const read = await api.get(`${BASE}/${id}`);
      expect(read.status()).toBe(200);
      expect(String((await read.json()).id)).toBe(String(id));

      const updated = await api.put(`${BASE}/${id}`, { data: { name: 'E2E Bump Updated' } });
      expect(updated.status()).toBe(200);
      expect((await updated.json()).name).toBe('E2E Bump Updated');

      const deleted = await api.delete(`${BASE}/${id}`);
      expect([200, 204]).toContain(deleted.status());
      id = undefined;

      const gone = await api.get(`${BASE}/${id}`);
      expect(gone.status()).toBe(404);
    } finally {
      if (id) await api.delete(`${BASE}/${id}`);
    }
  });

  test('matching endpoint returns an array for a given cart', async ({ api }) => {
    const res = await api.get(`${BASE}/matching`, {
      params: { cart_products: 11, cart_categories: 0 },
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('matching requires its cart params', async ({ api }) => {
    const res = await api.get(`${BASE}/matching`);
    expect(res.status()).toBe(400);
  });
});
