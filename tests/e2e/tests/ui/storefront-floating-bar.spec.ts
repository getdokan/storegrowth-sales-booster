import { test, expect } from '../../fixtures/test';
import { setModuleActive, moduleAjax } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import {
  gotoModuleSettings,
  openTab,
  saveForm,
  setTextField,
  setColor,
  setSelect,
  setNumber,
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

  test.describe('Banner Setting', () => {
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
  });

  // ===== Layout (Design tab numeric settings) ================================

  test.describe('Layout', () => {
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

  test.describe('Design', () => {
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

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.floatingBar.name, false);
      await setModuleState(page, MODULES.floatingBar.name, true);
      await expect(moduleToggle(page, MODULES.floatingBar.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
