import { test, expect } from '../../fixtures/test';
import { moduleAjax, setModuleActive } from '../../helpers/ajax';
import { setModuleState, moduleToggle } from '../../helpers/modules';
import { MODULES } from '../../data/modules';

/**
 * Floating Bar — a site-wide notification bar injected in wp_footer.
 *
 * Only shown to guests/customers, never to admins
 * (Helper::is_current_user_allowed_to_view_promotions) — so storefront checks
 * use the logged-out `guestPage`. Renders with default content when active
 * (default device view = desktop).
 *
 * Markers (verified live): `.spsg-floating-notification-bar-text` (default
 * "Shop More Than $100 to get Free Shipping"), `a.fn-bar-action-button`, and
 * the body class `show_floating_notification_bar`. Owns the
 * `floating-notification-bar` module.
 */
const TEXT = '.spsg-floating-notification-bar-text';
const ACTION = 'a.fn-bar-action-button';

async function saveBar(page: any, data: Record<string, unknown>) {
  return moduleAjax(page, 'spsg_floating_notification_bar_save_settings', {
    form_data: JSON.stringify({ shipping_bar_data: data }),
  });
}

test.describe('Storefront · Floating Bar', () => {
  test.beforeEach(async ({ page }) => {
    await setModuleActive(page, MODULES.floatingBar.id, true);
  });

  test.afterEach(async ({ page }) => {
    await saveBar(page, {}); // reset to defaults
    await setModuleActive(page, MODULES.floatingBar.id, true);
  });

  // ---- Enable ----------------------------------------------------------------

  test('can be enabled from the Modules screen', async ({ page }) => {
    await setModuleState(page, MODULES.floatingBar.name, false);
    await setModuleState(page, MODULES.floatingBar.name, true);
    await expect(moduleToggle(page, MODULES.floatingBar.name)).toHaveAttribute('aria-checked', 'true');
  });

  // ---- Positive (guest) ------------------------------------------------------

  test('shows the bar with default content to a guest', async ({ guestPage }) => {
    await guestPage.goto('/shop/');
    // Default banner text from Helper::get_banner_text().
    await expect(guestPage.locator(TEXT)).toContainText('Free Shipping');
    await expect(guestPage.locator(ACTION)).toHaveCount(1);
    await expect(guestPage.locator('body')).toHaveClass(/show_floating_notification_bar/);
  });

  test('renders a custom banner message', async ({ page, guestPage }) => {
    await saveBar(page, { default_banner_text: 'Mega Sale — 50% Off Everything' });

    await guestPage.goto('/shop/');
    await expect(guestPage.locator(TEXT)).toContainText('Mega Sale — 50% Off Everything');
  });

  // ---- Negative --------------------------------------------------------------

  test('bar content not shown to a logged-in admin (promotions are guest/customer only)', async ({
    page,
  }) => {
    // `page` carries the admin session. The body class is still added, but the
    // actual bar content is withheld from admins.
    await page.goto('/shop/');
    await expect(page.locator(TEXT)).toHaveCount(0);
    await expect(page.locator(ACTION)).toHaveCount(0);
  });

  test('no bar when the module is inactive', async ({ page, guestPage }) => {
    await setModuleActive(page, MODULES.floatingBar.id, false);

    await guestPage.goto('/shop/');
    await expect(guestPage.locator(TEXT)).toHaveCount(0);
    await expect(guestPage.locator(ACTION)).toHaveCount(0);
  });
});
