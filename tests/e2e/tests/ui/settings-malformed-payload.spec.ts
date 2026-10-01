import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { getSpsgAdmin } from '../../helpers/ajax';
import { gotoSettings } from '../../helpers/settings-ui';
import { getModuleSettings, resetModuleSettings, setModuleStatus } from '../../helpers/rest';
import { MODULES } from '../../data/modules';

// Regression guard for the settings-wipe reported on PR #550.
//
// Every module's save_settings() used to hand whatever arrived in the request
// straight to update_option(): a malformed payload replaced the stored settings
// with nothing and still answered {"success":true}. Since the redesign the
// ajax handlers are adapters over the settings engine (ADR-004); the REST save
// validates too and saves nothing when one value is invalid.
//
// Each case stores a known value (through REST), fires malformed requests, and
// asserts that each was refused cleanly (an error answer, never a PHP fatal)
// and that the stored value is still there.

/** POST an ajax action; tolerate a non-JSON body (a PHP fatal) so the test can report it. */
async function postAjax(
  page: Page,
  action: string,
  nonce: string,
  form: Record<string, string>,
): Promise<{ status: number; body: any; text: string }> {
  const res = await page.request.post('/wp-admin/admin-ajax.php', {
    form: { action, _ajax_nonce: nonce, ...form },
  });
  const text = await res.text();
  let body: any = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  return { status: res.status(), body, text };
}

function expectRefused(res: { status: number; body: any; text: string }, what: string): void {
  expect(res.status, `${what}: no PHP fatal (got ${res.status}: ${res.text.slice(0, 200)})`).toBeLessThan(500);
  expect(res.body?.success, `${what} must not report success`).toBe(false);
}

// A string field sends a string, `field[k]=v` sends an array — the two shapes
// the handlers used to mishandle.
const ARRAY_PAYLOAD = (field: string): Record<string, string> => ({ [`${field}[some_key]`]: 'value' });
const MALFORMED_JSON = (field: string): [string, Record<string, string>][] => [
  ['valid JSON, expected key missing', { [field]: '{}' }],
  ['not valid JSON at all', { [field]: '{' }],
  ['field absent entirely', {}],
];

test.describe('Admin · settings survive a malformed payload', { tag: '@ui' }, () => {
  // --- JSON handlers: one JSON string wrapping the values. -------------------
  type JsonHandler = {
    label: string;
    moduleId: string;
    save: string;
    field: string;
    key: string;
    value?: unknown;
  };
  const jsonHandlers: JsonHandler[] = [
    {
      label: 'Floating Bar',
      moduleId: MODULES.floatingBar.id,
      save: 'spsg_floating_notification_bar_save_settings',
      field: 'form_data',
      key: 'default_banner_text',
    },
    {
      label: 'Free Shipping Rules',
      moduleId: MODULES.freeShipping.id,
      save: 'spsg_pd_banner_save_settings',
      field: 'form_data',
      key: 'progressive_banner_text',
    },
    {
      label: 'Direct Checkout',
      moduleId: MODULES.directCheckout.id,
      save: 'spsg_direct_checkout_save_settings',
      field: 'data',
      key: 'buy_now_button_setting',
      value: 'default-add-to-cart',
    },
    {
      label: 'BOGO general',
      moduleId: MODULES.bogo.id,
      save: 'spsg_bogo_general_save_settings',
      field: 'data',
      key: 'offer_remove_from_cart',
      value: true,
    },
  ];

  for (const h of jsonHandlers) {
    test(`${h.label} keeps its settings when ${h.field} is malformed`, async ({ page, api }) => {
      await setModuleStatus(api, h.moduleId, true);
      const value = h.value ?? `survives-${h.moduleId}`;
      await resetModuleSettings(api, h.moduleId, { [h.key]: value });

      const { nonce } = await getSpsgAdmin(page);
      for (const [what, form] of MALFORMED_JSON(h.field)) {
        await test.step(what, async () => {
          expectRefused(await postAjax(page, h.save, nonce, form), `${h.save} (${what})`);
        });
      }

      expect((await getModuleSettings(api, h.moduleId)).values[h.key], 'the stored value survives').toEqual(value);
      await resetModuleSettings(api, h.moduleId);
    });

    test(`${h.label} refuses ${h.field} sent as an array (no PHP fatal)`, async ({ page, api }) => {
      // ISSUES.md #8 (resolved): Direct Checkout's and BOGO's handlers threw a
      // json_decode() TypeError (HTTP 500) on an array; now a 400.
      await setModuleStatus(api, h.moduleId, true);
      const value = h.value ?? `survives-${h.moduleId}`;
      await resetModuleSettings(api, h.moduleId, { [h.key]: value });

      const { nonce } = await getSpsgAdmin(page);
      try {
        expectRefused(await postAjax(page, h.save, nonce, ARRAY_PAYLOAD(h.field)), `${h.save} (array)`);
        expect((await getModuleSettings(api, h.moduleId)).values[h.key], 'the stored value survives').toEqual(value);
      } finally {
        await resetModuleSettings(api, h.moduleId);
      }
    });
  }

  test('Sales Notification keeps its settings when create_popup data is malformed', async ({ page, api }) => {
    const id = MODULES.salesPop.id;
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id, { product_title_color: '#123456' });

    await gotoSettings(page, id);
    const nonce: string = await page.evaluate(() => (window as any).sales_pop_data?.ajd_nonce);
    expect(nonce).toBeTruthy();

    for (const [what, form] of [['an array, not a JSON string', ARRAY_PAYLOAD('data')], ...MALFORMED_JSON('data')] as [
      string,
      Record<string, string>,
    ][]) {
      await test.step(what, async () => {
        expectRefused(await postAjax(page, 'create_popup', nonce, form), `create_popup (${what})`);
      });
    }

    expect((await getModuleSettings(api, id)).values.product_title_color).toBe('#123456');
    await resetModuleSettings(api, id);
  });

  // --- Array handlers: `form_data` must be an array. -------------------------
  const arrayHandlers = [
    { label: 'Countdown Timer', moduleId: MODULES.countdownTimer.id, save: 'spsg_countdown_timer_save_settings', key: 'countdown_heading' },
    { label: 'Stock Bar', moduleId: MODULES.stockBar.id, save: 'spsg_stock_bar_save_settings', key: 'count_text_color', value: '#123456' },
    { label: 'Quick View', moduleId: MODULES.quickView.id, save: 'spsg_quick_view_save_settings', key: 'button_label' },
    { label: 'Fly Cart', moduleId: MODULES.flyCart.id, save: 'spsg_fly_cart_save_settings', key: 'icon_color', value: '#123456' },
  ];

  for (const h of arrayHandlers) {
    test(`${h.label} keeps its settings when form_data is not an array`, async ({ page, api }) => {
      await setModuleStatus(api, h.moduleId, true);
      const value = h.value ?? `survives-${h.moduleId}`;
      await resetModuleSettings(api, h.moduleId, { [h.key]: value });

      const { nonce } = await getSpsgAdmin(page);
      for (const [what, form] of [
        ['a string', { form_data: 'not-an-array' }],
        ['a number', { form_data: '5' }],
        ['absent', {}],
      ] as [string, Record<string, string>][]) {
        await test.step(what, async () => {
          expectRefused(await postAjax(page, h.save, nonce, form), `${h.save} (${what})`);
        });
      }

      expect((await getModuleSettings(api, h.moduleId)).values[h.key], 'the stored value survives').toEqual(value);
      await resetModuleSettings(api, h.moduleId);
    });
  }

  test('an invalid value through a legacy adapter saves nothing', async ({ page, api }) => {
    const id = MODULES.countdownTimer.id;
    await setModuleStatus(api, id, true);
    await resetModuleSettings(api, id);
    const before = (await getModuleSettings(api, id)).values;

    const { nonce } = await getSpsgAdmin(page);
    const res = await postAjax(page, 'spsg_countdown_timer_save_settings', nonce, {
      'form_data[countdown_heading]': 'Should not be saved',
      'form_data[selected_theme]': 'ct-not-a-theme',
    });
    expectRefused(res, 'invalid selected_theme');

    const after = (await getModuleSettings(api, id)).values;
    expect(after.countdown_heading).toBe(before.countdown_heading);
    expect(after.selected_theme).toBe(before.selected_theme);
  });

  // --- REST: same engine, same rules. ----------------------------------------
  test.describe('REST settings save', () => {
    const id = MODULES.countdownTimer.id;
    const url = `/wp-json/sales-booster/v1/settings/${id}`;

    test.beforeEach(async ({ api }) => {
      await setModuleStatus(api, id, true);
      await resetModuleSettings(api, id);
    });

    test('one invalid value fails the whole save; nothing is written', async ({ api }) => {
      const before = (await getModuleSettings(api, id)).values;
      const res = await api.post(url, {
        data: { values: { countdown_heading: 'Should not be saved', selected_theme: 'ct-not-a-theme' } },
      });
      expect(res.status()).toBe(400);

      const after = (await getModuleSettings(api, id)).values;
      expect(after.countdown_heading).toBe(before.countdown_heading);
      expect(after.selected_theme).toBe(before.selected_theme);
    });

    test('`values` that is not an object is refused', async ({ api }) => {
      const before = (await getModuleSettings(api, id)).values;
      for (const values of ['a string', 5, null]) {
        const res = await api.post(url, { data: { values } });
        expect(res.status(), `values=${JSON.stringify(values)}`).toBeGreaterThanOrEqual(400);
        expect(res.status(), `values=${JSON.stringify(values)}: no PHP fatal`).toBeLessThan(500);
      }
      expect((await getModuleSettings(api, id)).values).toEqual(before);
    });

    test('an unknown key is dropped, the known keys are saved', async ({ api }) => {
      const res = await api.post(url, { data: { values: { e2e_marker: 'x', countdown_heading: 'E2E kept' } } });
      expect(res.ok(), await res.text()).toBeTruthy();

      const { values } = await getModuleSettings(api, id);
      expect(values.countdown_heading).toBe('E2E kept');
      expect(values).not.toHaveProperty('e2e_marker');
      await resetModuleSettings(api, id);
    });
  });
});
