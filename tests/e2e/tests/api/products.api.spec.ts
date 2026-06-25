import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../data/products';

test.describe('API · StoreGrowth product picker', () => {
  test('lists seeded products', async ({ api }) => {
    const res = await api.get('/wp-json/sales-booster/v1/products', { params: { per_page: 20 } });
    expect(res.ok()).toBeTruthy();

    const products = await res.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThanOrEqual(3);

    for (const p of products) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
    }
  });

  test('respects per_page', async ({ api }) => {
    const res = await api.get('/wp-json/sales-booster/v1/products', { params: { per_page: 1 } });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).length).toBe(1);
  });

  test('search filters by name', async ({ api }) => {
    const res = await api.get('/wp-json/sales-booster/v1/products', {
      params: { search: PRODUCTS.a.name, per_page: 20 },
    });
    expect(res.ok()).toBeTruthy();
    const names = (await res.json()).map((p: any) => p.name);
    expect(names).toContain(PRODUCTS.a.name);
  });

  test('search for a non-existent product yields an empty list', async ({ api }) => {
    const res = await api.get('/wp-json/sales-booster/v1/products', {
      params: { search: 'no-such-product-xyz-000', per_page: 5 },
    });
    expect(res.ok()).toBeTruthy();
    expect(await res.json()).toEqual([]);
  });
});
