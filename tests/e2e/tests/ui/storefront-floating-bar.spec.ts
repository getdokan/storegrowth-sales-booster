import { test, expect } from '../../fixtures/test';
import { setModuleActive, moduleAjax, getIsPro } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import {
  gotoModuleSettings,
  openTab,
  saveForm,
  setTextField,
  setColor,
  setSelect,
  setNumber,
  setGroupCheckbox,
  setBannerIcon,
} from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';

/**
 * Floating Bar — full module spec, driven END-TO-END through the real admin
 * Settings form (Banner Setting + Design tabs), then validated on the storefront.
 *
 * Each test changes a setting via the actual Ant Design control (textarea, color
 * picker, select), clicks the form's Save button, then asserts the guest-facing
 * bar reflects it. The bar is a "promotion" (guest/customer only,
 * Helper::is_current_user_allowed_to_view_promotions), so storefront checks use
 * the logged-out `guestPage`.
 *
 * Markers (verified live): `.spsg-floating-notification-bar-wrapper`,
 * `.spsg-floating-notification-bar-text`, `.spsg-floating-notification-bar-icon svg`,
 * `a.fn-bar-action-button`. Colors come from injected CSS, so they are checked
 * via COMPUTED styles. Floating Bar is baseline-active.
 */
const ROUTE = 'floating-notification-bar';
const WRAP = '.spsg-floating-notification-bar-wrapper';
const TEXT = '.spsg-floating-notification-bar-text';
// Scope to the floating bar's wrapper — the Free Shipping banner reuses the
// `.fn-bar-action-button` class, so an unscoped selector collides when both are active.
const BTN = `${WRAP} a.fn-bar-action-button`;
const ICON = `${WRAP} .spsg-floating-notification-bar-icon svg`;

/** Reset the option to a clean base (setup only — not the thing under test). */
async function resetBar(page: any) {
  await moduleAjax(page, 'spsg_floating_notification_bar_save_settings', {
    form_data: JSON.stringify({
      shipping_bar_data: {
        default_banner_text: 'Default Bar Text',
        default_banner_icon_name: 'notify-bar-icon-1',
        button_action: 'ba-url-redirect',
        ac_button_text: 'Shop Now',
        redirect_url: '#',
      },
    }),
  });
}

/** Computed CSS property of the first match on the given page. */
async function computedOn(p: any, selector: string, prop: string): Promise<string> {
  return p
    .locator(selector)
    .first()
    .evaluate((el: Element, pr: string) => getComputedStyle(el).getPropertyValue(pr).trim(), prop);
}

test.describe('Storefront · Floating Bar', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.floatingBar.id, true);
    await resetBar(page); // known clean base
  });

  test.afterEach(async ({ page }) => {
    await moduleAjax(page, 'spsg_floating_notification_bar_save_settings', {
      form_data: JSON.stringify({ shipping_bar_data: {} }),
    });
    await setModuleActive(page, MODULES.floatingBar.id, true);
  });

  // ===== Banner Setting tab (admin UI → storefront) ==========================

  test.describe('Banner Setting', { tag: '@admin' }, () => {
    test('editing Default Banner Text updates the bar text', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'Default Banner Text', 'Mega Flash Sale 50% Off');
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(TEXT)).toContainText('Mega Flash Sale 50% Off');
    });

    test('editing Button Text updates the action button label', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'Button Text', 'Grab It Now');
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(BTN)).toContainText('Grab It Now');
    });

    test('Bar Type "Sticky" makes the bar position fixed', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Bar Type', 'Sticky');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'position')).toBe('fixed');
    });

    test('Bar Type "Normal" leaves the bar absolutely positioned', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Bar Type', 'Normal');
      await saveForm(page);

      await guestPage.goto('/shop/');
      // bar_type=normal + bar_position=top (default) → position: absolute (EnqueueScript inline CSS).
      expect(await computedOn(guestPage, WRAP, 'position')).toBe('absolute');
    });

    test('editing Redirect URL updates the action button link', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      // The Redirect URL field is the Button Action's plain text input (placeholder
      // "http://example.com"); it only renders while Button Action is "URL Redirect",
      // which resetBar() guarantees. The value is run through esc_url() into the href.
      //
      // The control validates the URL one change BEHIND (ButtonAction passes the
      // *previous* value's validity to onFieldChange, which gates Save). So we fill
      // all-but-the-last char, then type the last one: that final onChange sees an
      // already-valid value and flips the form's isValidURL true so Save persists.
      const url = 'https://example.com/flash-sale';
      const input = page.locator('#sbooster-settings-page').getByPlaceholder('http://example.com');
      await input.fill(url.slice(0, -1));
      await input.pressSequentially(url.slice(-1));
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(BTN)).toHaveAttribute('href', url);
    });

    test('Button Action "Banner Close" turns the action button into a dismiss control', async ({
      page,
      guestPage,
    }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Button Action', 'Banner Close');
      await saveForm(page);

      await guestPage.goto('/shop/');
      // ba-close renders `<a class="fn-bar-action-button spsg-floating-notification-bar-remove">`
      // with NO href (vs. the URL-redirect anchor that always has one).
      const btn = guestPage.locator(BTN);
      await expect(btn).toHaveClass(/spsg-floating-notification-bar-remove/);
      await expect(btn).not.toHaveAttribute('href', /.*/);
    });

    test('Bar Position "Bottom" pins the bar to the bottom of the viewport', async ({
      page,
      guestPage,
    }) => {
      await gotoModuleSettings(page, ROUTE);
      await setSelect(page, 'Bar Position', 'Bottom');
      await saveForm(page);

      await guestPage.goto('/shop/');
      // bar_position=bottom → inline CSS sets `top: auto; bottom: 0` on the wrapper.
      expect(await computedOn(guestPage, WRAP, 'bottom')).toBe('0px');
    });

    test('selecting a Banner Icon renders an icon in the bar', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await setBannerIcon(page, 1); // 2nd preset (notify-bar-icon-2)
      await saveForm(page);

      await guestPage.goto('/shop/');
      // bar.php emits the matching inline <svg> inside the icon container.
      await expect(guestPage.locator(ICON)).toHaveCount(1);
    });

    test('Show Banner: unchecking Desktop removes the whole bar on desktop', async ({
      page,
      guestPage,
    }) => {
      await gotoModuleSettings(page, ROUTE);
      // Default banner_device_view is ['banner-show-desktop']; clearing Desktop empties
      // it, and the server (CommonHooks::wp_footer) renders nothing for an empty view.
      await setGroupCheckbox(page, 'Show Banner', 'Desktop', false);
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });

    test('Show Button: unchecking Desktop removes the action button on desktop', async ({
      page,
      guestPage,
    }) => {
      await gotoModuleSettings(page, ROUTE);
      // button_view drives a client-side removal: with Desktop off, banner-bar-remove.js
      // strips `.fn-bar-action-button` on desktop while the bar itself stays.
      await setGroupCheckbox(page, 'Show Button', 'Desktop', false);
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(WRAP)).toHaveCount(1); // bar still present…
      await expect(guestPage.locator(BTN)).toHaveCount(0); // …but its button is gone
    });

    test('Trigger "After a few Seconds" reveals the hidden bar on load', async ({
      page,
      guestPage,
    }) => {
      await gotoModuleSettings(page, ROUTE);
      // The bar ships display:none and banner-bar-remove.js fadeIn()s it after
      // banner_delay (default 1s) when the trigger is the timed one.
      await page
        .locator('#sbooster-settings-page')
        .getByText('After a few Seconds', { exact: true })
        .click();
      await saveForm(page);

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(WRAP)).toBeVisible({ timeout: 8000 });
    });
  });

  // ===== Banner Setting · Pro-only fields ====================================
  // Coupon Code, Countdown and Page Targeting are rendered/gated by StoreGrowth
  // Pro. Each sets the field through the module's save-ajax — the Coupon picker
  // needs a seeded coupon and Countdown uses a DatePicker, both awkward to drive
  // reliably via the admin UI — then asserts the resulting guest-facing marker.
  // Tagged @pro and skipped when Pro is inactive (e.g. the lite CI environment).
  test.describe('Banner Setting · Pro', { tag: ['@pro', '@admin'] }, () => {
    const proSave = (page: any, extra: Record<string, unknown>) =>
      moduleAjax(page, 'spsg_floating_notification_bar_save_settings', {
        form_data: JSON.stringify({
          shipping_bar_data: {
            default_banner_text: 'Default Bar Text',
            banner_device_view: ['banner-show-desktop'],
            button_view: ['button-desktop-enable'],
            button_action: 'ba-url-redirect',
            ac_button_text: 'Shop Now',
            redirect_url: '#',
            ...extra,
          },
        }),
      });

    test('Coupon Code renders the coupon inside the bar', async ({ page, guestPage }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      await proSave(page, { show_cupon: true, cupon_code: 'E2E10' });

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(`${WRAP} .spsg-coupon-code`)).toContainText('E2E10');
    });

    test('Countdown renders a four-part live timer in the bar', async ({ page, guestPage }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      // Dates straddle "now" so banner-bar-remove.js keeps (doesn't strip) the timer.
      await proSave(page, {
        countdown_show_enable: true,
        countdown_start_date: '2020-01-01',
        countdown_end_date: '2099-12-31',
      });

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(`${WRAP} .spsg-fn-bar-countdown`)).toHaveCount(1);
      await expect(guestPage.locator(`${WRAP} .spsg-countdown-value`)).toHaveCount(4); // d/h/m/s
    });

    test('Page Targeting "Show on Selected" hides the bar on non-targeted pages', async ({
      page,
      guestPage,
    }) => {
      test.skip(!(await getIsPro(page)), 'StoreGrowth Pro required');
      // Restrict to an (empty) page set → the bar must not render on the shop page.
      await proSave(page, { banner_show_option: 'banner-show-selected', slected_page_option: [] });

      await guestPage.goto('/shop/');
      await expect(guestPage.locator(WRAP)).toHaveCount(0);
    });
  });

  // ===== Layout (Design tab numeric settings) ================================

  test.describe('Layout', { tag: '@admin' }, () => {
    test('Banner Height applies to the bar wrapper', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setNumber(page, 'Banner Height', 70);
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'height')).toBe('70px');
    });

    test('Font Size applies to the bar text', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setNumber(page, 'Font Size', 24);
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, TEXT, 'font-size')).toBe('24px');
    });
  });

  // ===== Design tab (admin UI → storefront, computed styles) =================

  test.describe('Design', { tag: '@admin' }, () => {
    test('Background Color applies to the bar', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Background Color', '#112233');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'background-color')).toBe('rgb(17, 34, 51)');
    });

    test('Text Color applies to the bar text', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Text Color', '#445566');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, WRAP, 'color')).toBe('rgb(68, 85, 102)');
    });

    test('Button Color applies to the action button', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Button Color', '#aa0000');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, BTN, 'background-color')).toBe('rgb(170, 0, 0)');
    });

    test('Button Text Color applies to the action button text', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Button Text Color', '#00bb00');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, BTN, 'color')).toBe('rgb(0, 187, 0)');
    });

    test('Font Family applies to the bar text', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setSelect(page, 'Font Family', 'Roboto');
      await saveForm(page);

      await guestPage.goto('/shop/');
      expect(await computedOn(guestPage, TEXT, 'font-family')).toContain('Roboto');
    });

    test('Icon Color applies to the bar icon (svg fill)', async ({ page, guestPage }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Icon Color', '#123456');
      await saveForm(page);

      await guestPage.goto('/shop/');
      // Inline CSS targets `.spsg-…-icon svg { fill: <icon_color> }`.
      expect(await computedOn(guestPage, ICON, 'fill')).toBe('rgb(18, 52, 86)');
    });

    test('Close Icon Color applies to the dismiss (X) icon (svg fill)', async ({
      page,
      guestPage,
    }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Close Icon Color', '#654321');
      await saveForm(page);

      await guestPage.goto('/shop/');
      // The X lives in `.spsg-…-remove svg`; resetBar uses ba-url-redirect so the
      // action button does NOT carry that class — only the close icon matches.
      expect(
        await computedOn(guestPage, `${WRAP} .spsg-floating-notification-bar-remove svg`, 'fill'),
      ).toBe('rgb(101, 67, 33)');
    });
  });

  // ===== Visibility ==========================================================

  test.describe('Visibility', () => {
    test('bar content is not shown to a logged-in admin (promotions are guest-only)', async ({ page }) => {
      await page.goto('/shop/');
      await expect(page.locator(TEXT)).toHaveCount(0);
      await expect(page.locator(BTN)).toHaveCount(0);
    });

    test('no bar when the module is inactive', async ({ page, guestPage }) => {
      await setModuleActive(page, MODULES.floatingBar.id, false);
      await guestPage.goto('/shop/');
      await expect(guestPage.locator(TEXT)).toHaveCount(0);
    });
  });

  // ===== Module enable (last) ================================================

  test.describe('Enable', { tag: '@admin' }, () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.floatingBar.name, false);
      await setModuleState(page, MODULES.floatingBar.name, true);
      await expect(moduleToggle(page, MODULES.floatingBar.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
