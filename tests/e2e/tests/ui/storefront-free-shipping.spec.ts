import { test, expect } from '../../fixtures/test';
import { setModuleActive, moduleAjax } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import {
  gotoModuleSettings, openTab, saveForm, setTextField, setNumber, setColor, resetForm,
} from '../../helpers/settings-ui';
import { MODULES } from '../../data/modules';

/**
 * Free Shipping Rules (progressive-discount-banner) — full module spec, design
 * driven END-TO-END through the real admin Settings form (helpers/settings-ui).
 *
 * NOTE (ISSUES.md #5): the banner is server-rendered but removed at runtime by
 * the module's JS without a configured free-shipping threshold, so the
 * `.spsg-pd-banner-bar-wrapper` is not reliably in the live DOM. The reliable
 * storefront signal is the body class `show_discount_banner`; every design value
 * is validated by round-tripping through the admin GET (form persistence).
 * Promotion module → storefront checks use the logged-out `guestPage`.
 */
const ROUTE = 'progressive-discount-banner';
const GET = 'spsg_pd_banner_get_settings';

async function getSettings(page: any) {
  return (await moduleAjax(page, GET)).body?.data ?? {};
}

test.describe('Storefront · Free Shipping Rules', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.freeShipping.id, true);
  });

  test.afterEach(async ({ page }) => {
    await setModuleActive(page, MODULES.freeShipping.id, true);
    // Reset design to defaults via the Reset button so settings don't leak.
    await gotoModuleSettings(page, ROUTE);
    await openTab(page, 'Design').catch(() => {});
    await resetForm(page);
    await saveForm(page);
  });

  // ===== Settings via the real admin form (persistence) ======================

  test.describe('Banner settings', () => {
    test('Banner Text saved via the form persists', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'Banner Text', 'Free shipping over $50!');
      await saveForm(page);
      expect((await getSettings(page)).progressive_banner_text).toBe('Free shipping over $50!');
    });

    test('Cart Minimum Amount saved via the form persists', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setNumber(page, 'Cart Minimum Amount', 150);
      await saveForm(page);
      expect(String((await getSettings(page)).cart_minimum_amount)).toBe('150');
    });

    test('Goal Completion Text saved via the form persists', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'Goal Completion Text', 'You unlocked free shipping!');
      await saveForm(page);
      expect((await getSettings(page)).goal_completion_text).toBe('You unlocked free shipping!');
    });
  });

  test.describe('Design', () => {
    test('Background Color saved via the form persists', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Background Color', '#112233');
      await saveForm(page);
      expect((await getSettings(page)).background_color).toMatch(/rgb\(\s*17,\s*34,\s*51\s*\)|#112233/i);
    });

    test('Text Color saved via the form persists', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await openTab(page, 'Design');
      await setColor(page, 'Text Color', '#445566');
      await saveForm(page);
      expect((await getSettings(page)).text_color).toMatch(/rgb\(\s*68,\s*85,\s*102\s*\)|#445566/i);
    });
  });

  // ===== Storefront (guest) ==================================================

  test.describe('Storefront', () => {
    test('marks the storefront as showing the discount banner for a guest', async ({ guestPage }) => {
      await guestPage.goto('/shop/');
      await expect(guestPage.locator('body')).toHaveClass(/show_discount_banner/);
    });

    test('no discount-banner flag when the module is inactive', async ({ page, guestPage }) => {
      await setModuleActive(page, MODULES.freeShipping.id, false);
      await guestPage.goto('/shop/');
      await expect(guestPage.locator('body')).not.toHaveClass(/show_discount_banner/);
    });
  });

  // ===== Reset button ========================================================

  test.describe('Reset', () => {
    test('the Reset button reverts a changed banner text', async ({ page }) => {
      await gotoModuleSettings(page, ROUTE);
      await setTextField(page, 'Banner Text', 'Temporary text 999');
      await saveForm(page);
      expect((await getSettings(page)).progressive_banner_text).toBe('Temporary text 999');

      await gotoModuleSettings(page, ROUTE);
      await resetForm(page);
      await saveForm(page);
      expect((await getSettings(page)).progressive_banner_text).not.toBe('Temporary text 999');
    });
  });

  // ===== Enable ==============================================================

  test.describe('Enable', () => {
    test('can be enabled from the Modules screen', async ({ page }) => {
      await setModuleState(page, MODULES.freeShipping.name, false);
      await setModuleState(page, MODULES.freeShipping.name, true);
      await expect(moduleToggle(page, MODULES.freeShipping.name)).toHaveAttribute('aria-checked', 'true');
    });
  });
});
