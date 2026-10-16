import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { moduleAjax } from '../../helpers/ajax';
import { gotoProduct } from '../../helpers/storefront';
import { getModuleSettings, resetModuleSettings, setModuleStatus } from '../../helpers/rest';
import { getOptionRaw, hasWpCli, restoreOptionRaw, setOptionRaw } from '../../helpers/wp-cli';
import { dateOffset, setProductMeta } from '../../helpers/wc';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Regression guard for issue #257 — storefront defacement via CSS injection.
//
// Every module that emits an inline <style> block used to interpolate stored
// colour and size settings raw. A value that closes the declaration
// (`#fff} body{…`) appended arbitrary rules to a stylesheet served to every
// visitor.
//
// Two layers now stop it, and each is checked on its own:
//   1. Saving: the settings engine refuses a colour that isn't a hex colour, so
//      neither the legacy ajax save (ADR-004) nor REST stores the payload.
//   2. Rendering: a payload already in the option (stored before validation
//      existed) is still sanitised before it reaches a <style> (or a
//      `--spsg-*` CSS variable). Planted with WP-CLI, which bypasses the engine.
//
// Assertions read the text of every <style> element, not the whole document:
// the payload may legitimately appear in wp_localize_script() JSON or an
// esc_attr'd attribute, where it cannot escape into a stylesheet.

const CANARY = 'spsg-css-injection-canary';
const EVIL_HOST = 'evil.example';
const PAYLOAD = `#fff} body{display:none !important} .${CANARY}{background:url(https://${EVIL_HOST}/?leak=1)} .z{color:#fff`;

/** Concatenated text of every <style> element the page serves. */
async function servedCss(page: Page): Promise<string> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('style'))
      .map((el) => el.textContent || '')
      .join('\n'),
  );
}

type Target = {
  label: string;
  moduleId: string;
  option: string;
  /** Colour (and size) keys the module writes into CSS. */
  keys: string[];
  /** Extra stored values that make the CSS render (e.g. a template). */
  extra?: Record<string, unknown>;
  /** The legacy ajax save request for `values`. */
  legacy: (page: Page, values: Record<string, unknown>) => Promise<{ status: number; body: any }>;
};

/** Handlers taking `form_data` as a flat array. */
const arraySave = (action: string) => (page: Page, values: Record<string, unknown>) =>
  moduleAjax(page, action, { form_data: values });

/** Handlers taking one JSON string wrapping the values. */
const jsonSave = (action: string, field: string, wrapper: string) => (page: Page, values: Record<string, unknown>) =>
  moduleAjax(page, action, { [field]: JSON.stringify({ [wrapper]: values }) });

const TARGETS: Target[] = [
  {
    label: 'Free Shipping Rules',
    moduleId: MODULES.freeShipping.id,
    option: 'spsg_progressive_discount_banner_settings',
    keys: ['background_color', 'text_color', 'icon_color', 'close_icon_color', 'banner_height', 'font_size'],
    legacy: jsonSave('spsg_pd_banner_save_settings', 'form_data', 'shipping_bar_data'),
  },
  {
    label: 'Floating Bar',
    moduleId: MODULES.floatingBar.id,
    option: 'spsg_floating_notification_bar_settings',
    keys: [
      'background_color',
      'text_color',
      'icon_color',
      'close_icon_color',
      'button_color',
      'button_text_color',
      'banner_height',
      'font_size',
    ],
    legacy: jsonSave('spsg_floating_notification_bar_save_settings', 'form_data', 'shipping_bar_data'),
  },
  {
    label: 'Countdown Timer',
    moduleId: MODULES.countdownTimer.id,
    option: 'spsg_countdown_timer_settings',
    keys: ['widget_background_color', 'border_color', 'heading_text_color'],
    extra: { selected_theme: 'ct-layout-1' },
    legacy: arraySave('spsg_countdown_timer_save_settings'),
  },
  {
    label: 'Fly Cart',
    moduleId: MODULES.flyCart.id,
    option: 'spsg_fly_cart_settings',
    keys: ['icon_color', 'widget_bg_color', 'product_card_bg_color', 'buttons_bg_color', 'shopping_button_bg_color'],
    legacy: arraySave('spsg_fly_cart_save_settings'),
  },
  {
    label: 'Direct Checkout',
    moduleId: MODULES.directCheckout.id,
    option: 'spsg_direct_checkout_settings',
    keys: ['button_color', 'text_color', 'font_size', 'button_border_radius'],
    extra: { button_style: true },
    legacy: jsonSave('spsg_direct_checkout_save_settings', 'data', 'direct_checkout_data'),
  },
  {
    label: 'Stock Bar',
    moduleId: MODULES.stockBar.id,
    option: 'spsg_stock_bar_settings',
    keys: ['stockbar_bg_color', 'stockbar_fg_color', 'stockbar_border_color', 'stockbar_height'],
    extra: { product_page_stock_bar_enable: true },
    legacy: arraySave('spsg_stock_bar_save_settings'),
  },
  {
    label: 'Quick View',
    moduleId: MODULES.quickView.id,
    option: 'spsg_quick_view_settings',
    keys: ['modal_background_color', 'button_color', 'button_text_color', 'button_border_radius'],
    legacy: arraySave('spsg_quick_view_save_settings'),
  },
];

const COUNTDOWN_DISCOUNT = {
  _spsg_countdown_timer_discount_amount: '20',
  _spsg_countdown_timer_discount_start: dateOffset(-1, '00:00:00'),
  _spsg_countdown_timer_discount_end: dateOffset(30, '23:59:59'),
};

const payloadFor =(t: Target) => Object.fromEntries(t.keys.map((k) => [k, PAYLOAD]));

test.describe('Storefront · stored settings cannot inject CSS', { tag: '@ui' }, () => {
  for (const t of TARGETS) {
    test.describe(t.label, () => {
      test.beforeEach(async ({ api }) => {
        await setModuleStatus(api, t.moduleId, true);
        await resetModuleSettings(api, t.moduleId, t.extra ?? {});
      });

      test.afterEach(async ({ api }) => {
        await resetModuleSettings(api, t.moduleId);
      });

      test('the legacy ajax save and REST refuse the payload', async ({ page, api }) => {
        const before = (await getModuleSettings(api, t.moduleId)).values;

        const legacy = await t.legacy(page, payloadFor(t));
        expect(legacy.status, JSON.stringify(legacy.body)).toBeLessThan(500);
        expect(legacy.body?.success, 'legacy save must refuse the payload').toBe(false);

        const rest = await api.post(`/wp-json/sales-booster/v1/settings/${t.moduleId}`, {
          data: { values: payloadFor(t) },
        });
        expect(rest.status()).toBe(400);

        const after = (await getModuleSettings(api, t.moduleId)).values;
        for (const k of t.keys) expect(after[k], k).toEqual(before[k]);
      });

      test('a payload already in the option never reaches a <style> block', async ({ page, guestPage }) => {
        test.skip(!hasWpCli(), 'needs E2E_WP_CLI to plant a value the engine refuses');
        // The timer (and its styles) only render on a product with a running discount.
        const countdown = t.moduleId === MODULES.countdownTimer.id;
        if (countdown) await setProductMeta(page, PRODUCTS.a.id, COUNTDOWN_DISCOUNT);
        const original = getOptionRaw(t.option);
        try {
          setOptionRaw(t.option, { ...((original as Record<string, unknown>) ?? {}), ...payloadFor(t) });
          await gotoProduct(guestPage, PRODUCTS.a.slug);

          const css = await servedCss(guestPage);
          expect(css, `${t.label} leaked the injected selector into a <style> block`).not.toContain(CANARY);
          expect(css, `${t.label} leaked the injected url() into a <style> block`).not.toContain(EVIL_HOST);
          expect(css, `${t.label} leaked a declaration breakout into a <style> block`).not.toContain('body{display:none');

          const display = await guestPage.evaluate(() => getComputedStyle(document.body).display);
          expect(display, `${t.label} blanked the storefront`).not.toBe('none');
          if (countdown) await expect(guestPage.locator('.spsg-countdown-timer')).toHaveCount(1);
        } finally {
          restoreOptionRaw(t.option, original);
          if (countdown) {
            await setProductMeta(page, PRODUCTS.a.id, Object.fromEntries(Object.keys(COUNTDOWN_DISCOUNT).map((k) => [k, ''])));
          }
        }
      });
    });
  }
});
