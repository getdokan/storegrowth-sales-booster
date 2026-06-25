import { test, expect } from '../../fixtures/test';

test.describe('API · REST health', () => {
  test('core REST root is reachable', async ({ api }) => {
    const res = await api.get('/wp-json/');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('namespaces');
  });

  test('exposes both StoreGrowth namespaces', async ({ api }) => {
    const body = await (await api.get('/wp-json/')).json();
    expect(body.namespaces).toContain('sales-booster/v1');
    // spsg/v1 is registered by the upsell-order-bump module.
    expect(body.namespaces).toContain('spsg/v1');
  });

  test('lists the plugin routes under sales-booster/v1', async ({ api }) => {
    const body = await (await api.get('/wp-json/sales-booster/v1')).json();
    const routes = Object.keys(body.routes ?? {});
    expect(routes.some((r) => r.includes('/products'))).toBeTruthy();
    expect(routes.some((r) => r.includes('/bogo/offers'))).toBeTruthy();
  });
});
