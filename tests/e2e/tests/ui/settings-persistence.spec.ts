import { test, expect } from '../../fixtures/test';
import { spsgAdminAjax, moduleAjax } from '../../helpers/ajax';
import { MODULES } from '../../data/modules';

test.describe('Admin · settings persistence (Countdown Timer)', { tag: '@ui' }, () => {
  const id = MODULES.countdownTimer.id;

  test.afterEach(async ({ page }) => {
    await spsgAdminAjax(page, 'update_module_status', { module_id: id, status: 'true' });
  });

  test('save then get round-trips the settings payload', async ({ page }) => {
    // Module must be active for its settings ajax to be registered.
    await spsgAdminAjax(page, 'update_module_status', { module_id: id, status: 'true' });

    const payload = { e2e_marker: 'roundtrip-123', layout: 'ct-layout-1' };
    const save = await moduleAjax(page, 'spsg_countdown_timer_save_settings', {
      form_data: payload,
    });
    expect(save.status).toBe(200);
    expect(save.body?.success).toBe(true);

    const get = await moduleAjax(page, 'spsg_countdown_timer_get_settings');
    expect(get.status).toBe(200);
    expect(get.body?.success).toBe(true);
    expect(get.body?.data).toMatchObject(payload);
  });

  test('get_settings rejects a bad nonce', async ({ page }) => {
    await spsgAdminAjax(page, 'update_module_status', { module_id: id, status: 'true' });
    await page.goto('/wp-admin/admin.php?page=spsg-modules');
    const res = await page.request.post('/wp-admin/admin-ajax.php', {
      form: { action: 'spsg_countdown_timer_get_settings', _ajax_nonce: 'bogus' },
    });
    expect(res.status()).toBe(403);
  });
});
