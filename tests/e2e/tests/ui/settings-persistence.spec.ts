import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { moduleAjax } from '../../helpers/ajax';
import { gotoSettings } from '../../helpers/settings-ui';
import {
  getModuleSettings,
  resetModuleSettings,
  saveModuleSettings,
  setModuleStatus,
} from '../../helpers/rest';
import { MODULES } from '../../data/modules';

// The old admin's ajax save/get pairs stay as adapters (ADR-004): they save
// through the settings engine like `POST sales-booster/v1/settings/{module}`.
// So, for every pair:
//   - a save round-trips through the legacy get AND the REST get;
//   - a key outside the schema (`e2e_marker`) is dropped, not stored;
//   - a save merges: a key it doesn't send keeps its stored value;
//   - a REST save is visible through the legacy get.

type Handler = {
  label: string;
  moduleId: string;
  /** Save request fields (the old admin's payload shape) for `values`. */
  payload: (values: Record<string, unknown>) => Record<string, unknown>;
  save: string;
  get: string;
  /** The key the legacy save changes, and its new (typed) value. */
  key: string;
  value: unknown;
  /** A key set by REST first, which the legacy save must leave alone. */
  keep: string;
  keepValue: unknown;
};

/** The array handlers: `form_data[key]=value`. */
const formData = (values: Record<string, unknown>) => ({ form_data: values });
/** The JSON handlers: one JSON string wrapping the values under `wrapper`. */
const json = (field: string, wrapper: string) => (values: Record<string, unknown>) => ({
  [field]: JSON.stringify({ [wrapper]: values }),
});

const HANDLERS: Handler[] = [
  {
    label: 'Countdown Timer',
    moduleId: MODULES.countdownTimer.id,
    payload: formData,
    save: 'spsg_countdown_timer_save_settings',
    get: 'spsg_countdown_timer_get_settings',
    key: 'countdown_heading',
    value: 'E2E [discount]% heading',
    keep: 'heading_text_color',
    keepValue: '#123456',
  },
  {
    label: 'Stock Bar',
    moduleId: MODULES.stockBar.id,
    payload: formData,
    save: 'spsg_stock_bar_save_settings',
    get: 'spsg_stock_bar_get_settings',
    key: 'stockbar_template',
    value: 'stock_bar_two',
    keep: 'count_text_color',
    keepValue: '#123456',
  },
  {
    label: 'Quick View',
    moduleId: MODULES.quickView.id,
    payload: formData,
    save: 'spsg_quick_view_save_settings',
    get: 'spsg_quick_view_get_settings',
    key: 'button_label',
    value: 'E2E Quick Look',
    keep: 'button_color',
    keepValue: '#123456',
  },
  {
    label: 'Fly Cart',
    moduleId: MODULES.flyCart.id,
    payload: formData,
    save: 'spsg_fly_cart_save_settings',
    get: 'spsg_fly_cart_get_settings',
    // Not `layout`: its `center` option is pro (ignored on lite).
    key: 'icon_name',
    value: 'shopping-cart-icon-2',
    keep: 'icon_color',
    keepValue: '#123456',
  },
  {
    label: 'Direct Checkout',
    moduleId: MODULES.directCheckout.id,
    payload: json('data', 'direct_checkout_data'),
    save: 'spsg_direct_checkout_save_settings',
    get: 'spsg_direct_checkout_get_settings',
    // Not `checkout_redirect`: its `quick-cart-checkout` option is pro.
    key: 'buy_now_button_setting',
    value: 'default-add-to-cart',
    keep: 'button_color',
    keepValue: '#123456',
  },
  {
    label: 'Floating Bar',
    moduleId: MODULES.floatingBar.id,
    payload: json('form_data', 'shipping_bar_data'),
    save: 'spsg_floating_notification_bar_save_settings',
    get: 'spsg_floating_notification_bar_get_settings',
    key: 'default_banner_text',
    value: 'E2E floating bar text',
    keep: 'background_color',
    keepValue: '#123456',
  },
  {
    label: 'Free Shipping Rules',
    moduleId: MODULES.freeShipping.id,
    payload: json('form_data', 'shipping_bar_data'),
    save: 'spsg_pd_banner_save_settings',
    get: 'spsg_pd_banner_get_settings',
    key: 'progressive_banner_text',
    value: 'E2E add [amount] more',
    keep: 'background_color',
    keepValue: '#123456',
  },
  {
    label: 'BOGO general',
    moduleId: MODULES.bogo.id,
    payload: json('data', 'bogo_general_settings_data'),
    save: 'spsg_bogo_general_save_settings',
    get: 'spsg_bogo_general_get_settings',
    key: 'offer_remove_from_cart',
    value: true,
    keep: 'regular_price_show',
    keepValue: true,
  },
];

/** Loose equality for the stored shape: the legacy get returns strings for non-toggles. */
function sameStored(stored: unknown, typed: unknown): boolean {
  if (typeof typed === 'boolean') return stored === typed || stored === String(typed) || stored === (typed ? '1' : '');
  return String(stored) === String(typed);
}

test.describe('Admin · settings persistence through the legacy ajax adapters', { tag: '@ui' }, () => {
  for (const h of HANDLERS) {
    test.describe(h.label, () => {
      test.beforeEach(async ({ api }) => {
        await setModuleStatus(api, h.moduleId, true);
        await resetModuleSettings(api, h.moduleId, { [h.keep]: h.keepValue });
      });

      test.afterEach(async ({ api }) => {
        await resetModuleSettings(api, h.moduleId);
      });

      test('save round-trips, drops unknown keys and merges', async ({ page, api }) => {
        const save = await moduleAjax(page, h.save, h.payload({ [h.key]: h.value, e2e_marker: 'dropped-123' }));
        expect(save.status, JSON.stringify(save.body)).toBe(200);
        expect(save.body?.success).toBe(true);

        // REST sees the typed value; the unknown key is not stored; the
        // unsent key keeps the value REST saved before.
        const rest = await getModuleSettings(api, h.moduleId);
        expect(rest.values[h.key]).toEqual(h.value);
        expect(rest.values[h.keep]).toEqual(h.keepValue);
        expect(rest.values).not.toHaveProperty('e2e_marker');

        // The legacy get reads the same stored option.
        const get = await moduleAjax(page, h.get);
        expect(get.status).toBe(200);
        expect(get.body?.success).toBe(true);
        const stored = get.body?.data ?? {};
        expect(sameStored(stored[h.key], h.value), `${h.key} stored as ${JSON.stringify(stored[h.key])}`).toBe(true);
        expect(sameStored(stored[h.keep], h.keepValue), `${h.keep} kept as ${JSON.stringify(stored[h.keep])}`).toBe(true);
        expect(stored).not.toHaveProperty('e2e_marker');
      });

      test('a REST save is visible through the legacy get', async ({ page, api }) => {
        await saveModuleSettings(api, h.moduleId, { [h.key]: h.value });
        const get = await moduleAjax(page, h.get);
        expect(get.body?.success).toBe(true);
        expect(sameStored(get.body?.data?.[h.key], h.value)).toBe(true);
      });
    });
  }

  test.describe('Sales Notification (create_popup / popup_products)', () => {
    const id = MODULES.salesPop.id;

    /** `sales_pop_data.ajd_nonce` (nonce `spsg_admin_ajax_nonce`), localized on the StoreGrowth page. */
    async function salesPopNonce(page: Page): Promise<string> {
      await gotoSettings(page, id);
      const nonce = await page.evaluate(() => (window as any).sales_pop_data?.ajd_nonce);
      expect(nonce, 'sales_pop_data.ajd_nonce is localized for the old ajax callers').toBeTruthy();
      return nonce;
    }

    test.beforeEach(async ({ api }) => {
      await setModuleStatus(api, id, true);
      await resetModuleSettings(api, id, { product_title_color: '#123456' });
    });

    test.afterEach(async ({ api }) => {
      await resetModuleSettings(api, id);
    });

    test('create_popup round-trips, drops unknown keys and merges', async ({ page, api }) => {
      const nonce = await salesPopNonce(page);
      const save = await page.request.post('/wp-admin/admin-ajax.php', {
        form: {
          action: 'create_popup',
          _ajax_nonce: nonce,
          data: JSON.stringify({ popup_data: { template: '2', e2e_marker: 'dropped-123' } }),
        },
      });
      expect(save.status()).toBe(200);
      expect((await save.json()).success).toBe(true);

      const rest = await getModuleSettings(api, id);
      expect(rest.values.template).toBe('2');
      expect(rest.values.product_title_color).toBe('#123456');
      expect(rest.values).not.toHaveProperty('e2e_marker');

      const get = await page.request.post('/wp-admin/admin-ajax.php', {
        form: { action: 'popup_products', _ajax_nonce: nonce },
      });
      const body = await get.json();
      expect(body.success).toBe(true);
      expect(String(body.data.template)).toBe('2');
      expect(body.data.product_title_color).toBe('#123456');
      expect(body.data).not.toHaveProperty('e2e_marker');
    });
  });

  test('the legacy get rejects a bad nonce', async ({ page, api }) => {
    await setModuleStatus(api, MODULES.countdownTimer.id, true);
    await page.goto('/wp-admin/admin.php?page=storegrowth#/modules');
    const res = await page.request.post('/wp-admin/admin-ajax.php', {
      form: { action: 'spsg_countdown_timer_get_settings', _ajax_nonce: 'bogus' },
    });
    expect(res.status()).toBe(403);
  });
});
