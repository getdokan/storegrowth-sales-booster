import { test, expect } from '../../fixtures/test';

/**
 * Exercises the plugin's own REST surface: the product picker used by the
 * settings UI (includes/REST/ProductController.php, namespace sales-booster/v1).
 */
test.describe('API · StoreGrowth product picker', () => {
  test('lists products for the settings UI', async ({ api }) => {
    const res = await api.get('/wp-json/sales-booster/v1/products', {
      params: { per_page: 5 },
    });

    expect(res.ok()).toBeTruthy();
    const products = await res.json();
    expect(Array.isArray(products)).toBeTruthy();
  });

  test('supports search filtering', async ({ api }) => {
    const res = await api.get('/wp-json/sales-booster/v1/products', {
      params: { search: 'no-such-product-xyz', per_page: 5 },
    });

    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(await res.json())).toBeTruthy();
  });
});
