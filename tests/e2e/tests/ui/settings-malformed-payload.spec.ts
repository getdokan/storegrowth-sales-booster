import { test, expect } from '../../fixtures/test';
import { spsgAdminAjax, moduleAjax } from '../../helpers/ajax';
import { MODULES } from '../../data/modules';

// Regression guard for the settings-wipe reported on PR #550.
//
// Every module's save_settings() used to hand whatever arrived in the request
// straight to update_option(): the json_decode() handlers decoded a non-string
// (or a JSON string missing their key) to nothing, and the array_map() handlers
// mapped over a non-array to null. Either way the stored settings were replaced
// with an empty value and the response was still {"success":true} — options
// carry no revision history, so the real configuration was gone.
//
// Each case below saves a known payload, fires a malformed one, and asserts the
// saved payload is still readable afterwards.

type Malformed = Record<string, unknown>;

async function saveViaAjax(page: any, action: string, fields: Record<string, unknown>) {
  const res = await moduleAjax(page, action, fields);
  expect(res.status, `${action} should answer`).toBe(200);
  return res;
}

// moduleAjax() flattens objects into PHP-style form keys, so passing a string
// sends a string and passing an object sends an array — exactly the two shapes
// the handlers used to mishandle.
test.describe('Admin · settings survive a malformed payload', { tag: '@ui' }, () => {
  // --- json_decode() handlers: expect `form_data` to be a JSON *string*. ------
  const jsonHandlers = [
    {
      label: 'Floating Notification Bar',
      moduleId: MODULES.floatingBar.id,
      save: 'spsg_floating_notification_bar_save_settings',
      get: 'spsg_floating_notification_bar_get_settings',
      key: 'shipping_bar_data',
      field: 'form_data',
    },
    {
      label: 'Progressive Discount Banner',
      moduleId: MODULES.freeShipping.id,
      save: 'spsg_pd_banner_save_settings',
      get: 'spsg_pd_banner_get_settings',
      key: 'shipping_bar_data',
      field: 'form_data',
    },
  ];

  for (const h of jsonHandlers) {
    test(`${h.label} keeps its settings when form_data is malformed`, async ({ page }) => {
      await spsgAdminAjax(page, 'update_module_status', { module_id: h.moduleId, status: 'true' });

      const marker = `survives-${h.moduleId}`;
      await saveViaAjax(page, h.save, {
        [h.field]: JSON.stringify({ [h.key]: { e2e_marker: marker } }),
      });

      const malformed: Malformed[] = [
        { [h.field]: { some_key: 'value' } }, // an array, not a JSON string
        { [h.field]: '{}' }, // valid JSON, expected key missing
        { [h.field]: '{' }, // not valid JSON at all
        {}, // field absent entirely
      ];

      for (const payload of malformed) {
        const res = await moduleAjax(page, h.save, payload);
        expect(res.body?.success, `${h.save} must not report success for ${JSON.stringify(payload)}`).toBe(false);
      }

      const get = await moduleAjax(page, h.get);
      expect(get.body?.success).toBe(true);
      expect(get.body?.data, 'the saved settings must survive every malformed request').toMatchObject({
        e2e_marker: marker,
      });
    });
  }

  // --- array_map() handlers: expect `form_data` to be an *array*. ------------
  const arrayHandlers = [
    { label: 'Countdown Timer', moduleId: MODULES.countdownTimer.id, save: 'spsg_countdown_timer_save_settings', get: 'spsg_countdown_timer_get_settings' },
    { label: 'Stock Bar', moduleId: MODULES.stockBar.id, save: 'spsg_stock_bar_save_settings', get: 'spsg_stock_bar_get_settings' },
    { label: 'Quick View', moduleId: MODULES.quickView.id, save: 'spsg_quick_view_save_settings', get: 'spsg_quick_view_get_settings' },
    { label: 'Fly Cart', moduleId: MODULES.flyCart.id, save: 'spsg_fly_cart_save_settings', get: 'spsg_fly_cart_get_settings' },
  ];

  for (const h of arrayHandlers) {
    test(`${h.label} keeps its settings when form_data is not an array`, async ({ page }) => {
      await spsgAdminAjax(page, 'update_module_status', { module_id: h.moduleId, status: 'true' });

      const marker = `survives-${h.moduleId}`;
      await saveViaAjax(page, h.save, { form_data: { e2e_marker: marker } });

      // A scalar `form_data` is what array_map() choked on. The handler answers
      // 400, so read the body regardless of status.
      for (const scalar of ['not-an-array', '5']) {
        const res = await moduleAjax(page, h.save, { form_data: scalar });
        expect(res.body?.success, `${h.save} must not report success for form_data="${scalar}"`).toBe(false);
      }

      const get = await moduleAjax(page, h.get);
      expect(get.body?.success).toBe(true);
      expect(get.body?.data, 'the saved settings must survive every malformed request').toMatchObject({
        e2e_marker: marker,
      });
    });
  }
});
