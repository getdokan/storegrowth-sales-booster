import { test, expect } from '../../fixtures/test';

test.describe('API · REST health', () => {
  test('core REST root is reachable and exposes the plugin namespace', async ({ api }) => {
    const res = await api.get('/wp-json/');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body).toHaveProperty('namespaces');
    // The plugin registers ProductController under sales-booster/v1.
    expect(body.namespaces).toContain('sales-booster/v1');
  });
});
