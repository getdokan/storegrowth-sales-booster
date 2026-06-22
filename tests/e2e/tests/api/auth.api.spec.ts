import { test, expect } from '../../fixtures/test';
import { env } from '../../helpers/env';

test.describe('API · authentication', () => {
  test('authenticated request resolves to an administrator', async ({ api }) => {
    const res = await api.get('/wp-json/wp/v2/users/me', { params: { context: 'edit' } });
    expect(res.status()).toBe(200);

    const me = await res.json();
    expect(me?.capabilities?.manage_options).toBeTruthy();
  });

  test('protected endpoint rejects anonymous requests', async ({ playwright }) => {
    // A fresh context with NO Authorization header = anonymous caller.
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });
    const res = await anon.get('/wp-json/wp/v2/settings');

    expect(res.status()).toBe(401);
    await anon.dispose();
  });
});
