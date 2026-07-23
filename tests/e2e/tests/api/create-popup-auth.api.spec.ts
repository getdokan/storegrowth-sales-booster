import { test, expect } from '../../fixtures/test';
import { env } from '../../helpers/env';

/**
 * Regression for the "Missing Authorization / unauthenticated options update via
 * `create_popup`" report (getdokan/storegrowth-sales-booster-pro#240), and the
 * related stored-XSS report (#239).
 *
 * The Sales Pop `create_popup` (write) and `popup_products` (read) admin-ajax
 * actions must reject unauthenticated callers. After the fix they are:
 *   - no longer registered for `wp_ajax_nopriv_*` (so a guest hits no handler),
 *   - guarded by `current_user_can( 'manage_options' )`, and
 *   - verified against the admin-only `spsg_admin_ajax_nonce` nonce, which is
 *     never emitted on the storefront — so the frontend `ajd_protected` nonce a
 *     visitor could scrape cannot authorize these actions.
 *
 * A rejected request never reaches `update_option`, so `spsg_popup_products`
 * stays unchanged. A successful write would instead echo the saved option back
 * (`wp_send_json_success`) and contain our marker — which we assert never happens.
 */
test.describe('API · sales-pop create_popup authorization', () => {
  const AJAX = '/wp-admin/admin-ajax.php';
  // If this string ever appears in a success response, an unauthorized write got through.
  const marker = 'sg-regression-marker-240';
  const payload = JSON.stringify({
    popup_data: { message_popup: marker, popup_products: [1] },
  });

  test('anonymous create_popup is rejected and persists nothing', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });

    // 1. No nonce — a logged-out caller has no valid admin nonce.
    const noNonce = await anon.post(AJAX, {
      form: { action: 'create_popup', data: payload },
    });
    const noNonceBody = (await noNonce.text()).trim();
    // `0` with HTTP 400 (no nopriv handler) or `-1`/403 (nonce failure) — both are rejections.
    expect([200, 400, 403], 'anon create_popup status').toContain(noNonce.status());
    expect(['0', '-1'], 'anon create_popup body').toContain(noNonceBody);
    expect(noNonceBody).not.toContain(marker);

    // 2. Forged nonce — a scraped/guessed value must not authorize the write.
    const forged = await anon.post(AJAX, {
      form: { action: 'create_popup', _ajax_nonce: 'deadbeef00', data: payload },
    });
    const forgedBody = (await forged.text()).trim();
    expect(['0', '-1'], 'forged-nonce create_popup body').toContain(forgedBody);
    expect(forgedBody).not.toContain(marker);
    expect(forgedBody).not.toContain('"success":true');

    await anon.dispose();
  });

  test('anonymous popup_products (read) is rejected', async ({ playwright }) => {
    const anon = await playwright.request.newContext({ baseURL: env.baseURL });

    const res = await anon.post(AJAX, { form: { action: 'popup_products', data: '[]' } });
    const body = (await res.text()).trim();
    expect([200, 400, 403]).toContain(res.status());
    expect(['0', '-1']).toContain(body);

    await anon.dispose();
  });
});
