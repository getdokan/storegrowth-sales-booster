import { test, expect } from '../../fixtures/test';
import { env } from '../../helpers/env';

/**
 * Regression for CVE-2026-13110 — unauthenticated settings modification via the
 * `bogo_category_msg_create` ajax action (getdokan/storegrowth-sales-booster-pro#241).
 *
 * The BOGO category-message handlers write/read the `spsg_bogo_general_settings`
 * option and must reject unauthenticated callers. After the class fix they are:
 *   - no longer registered for `wp_ajax_nopriv_*` (a guest hits no handler),
 *   - guarded by `current_user_can( 'manage_options' )`, and
 *   - verified against the admin-only `spsg_admin_protected` nonce, which is
 *     never emitted on the storefront. The frontend now emits only the
 *     unprivileged `spsg_frontend_protected` cart nonce, so the `ajd_protected`
 *     nonce a visitor used to scrape is gone entirely.
 *
 * A rejected request never reaches `update_option`, so the option is unchanged.
 * A successful write would echo a truthy `wp_send_json_success` — asserted never
 * to happen, and our marker never to appear.
 */
test.describe('API · bogo category-message authorization', () => {
  const AJAX = '/wp-admin/admin-ajax.php';
  const marker = 'sg-regression-marker-241';
  const writePayload = {
    action: 'bogo_category_msg_create',
    'data[id]': '999999',
    'data[message]': marker,
    'data[categoryStatus]': 'true',
  };

  test('anonymous bogo_category_msg_create is rejected and persists nothing', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });

    // 1. No nonce.
    const noNonce = await anon.post(AJAX, { form: writePayload });
    const noNonceBody = (await noNonce.text()).trim();
    expect([200, 400, 403], 'anon create status').toContain(noNonce.status());
    expect(['0', '-1'], 'anon create body').toContain(noNonceBody);
    expect(noNonceBody).not.toContain(marker);

    // 2. Forged nonce.
    const forged = await anon.post(AJAX, {
      form: { ...writePayload, _ajax_nonce: 'deadbeef00' },
    });
    const forgedBody = (await forged.text()).trim();
    expect(['0', '-1'], 'forged create body').toContain(forgedBody);
    expect(forgedBody).not.toContain(marker);
    expect(forgedBody).not.toContain('"success":true');

    await anon.dispose();
  });

  test('anonymous bogo_category_msg_list (read) is rejected', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });

    const res = await anon.post(AJAX, { form: { action: 'bogo_category_msg_list' } });
    const body = (await res.text()).trim();
    expect([200, 400, 403]).toContain(res.status());
    expect(['0', '-1']).toContain(body);
    expect(body).not.toContain(marker);

    await anon.dispose();
  });
});
