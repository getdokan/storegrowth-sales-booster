import { test, expect } from '../../fixtures/test';
import { env } from '../../helpers/env';

test.describe('API · authentication', () => {
  test('authenticated request resolves to an administrator', async ({ api }) => {
    const res = await api.get('/wp-json/wp/v2/users/me', { params: { context: 'edit' } });
    expect(res.status()).toBe(200);
    const me = await res.json();
    expect(me?.capabilities?.manage_options).toBeTruthy();
  });

  test('protected core endpoint rejects anonymous requests', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });
    const res = await anon.get('/wp-json/wp/v2/settings');
    expect(res.status()).toBe(401);
    await anon.dispose();
  });

  test('every plugin route rejects anonymous callers (manage_options)', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });

    const protectedRoutes = [
      '/wp-json/sales-booster/v1/products',
      '/wp-json/sales-booster/v1/bogo/offers',
      '/wp-json/spsg/v1/order-bumps',
    ];

    for (const route of protectedRoutes) {
      const res = await anon.get(route);
      expect([401, 403], `anon ${route} should be unauthorized`).toContain(res.status());
    }

    await anon.dispose();
  });
});
