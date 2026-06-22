import { Page, expect } from '@playwright/test';

/**
 * StoreGrowth admin page slugs (see includes/Admin/AdminMenu.php).
 */
export const MODULES_PAGE = 'spsg-modules';
export const SETTINGS_PAGE = 'spsg-settings';

/**
 * Open the Modules screen and wait for the React app to mount.
 *
 * The catalog renders into `#sbooster-modules-page` (see modules_callback()).
 */
export async function gotoModules(page: Page): Promise<void> {
  await page.goto(`/wp-admin/admin.php?page=${MODULES_PAGE}`);
  await expect(page.locator('#sbooster-modules-page')).toBeVisible();
}

/**
 * Ensure a module is in the desired enabled/disabled state.
 *
 * The Modules UI is built with Ant Design, whose toggle renders as
 * `role="switch"` with an `aria-checked` attribute — so we locate the closest
 * card ancestor of the module title that owns a switch, then drive that.
 * Idempotent: a no-op when the module is already in the target state.
 *
 * @param moduleName Human-readable module name as shown on the card.
 * @param enabled    Desired state.
 */
export async function setModuleState(
  page: Page,
  moduleName: string,
  enabled: boolean,
): Promise<void> {
  await gotoModules(page);

  const card = page
    .getByText(moduleName, { exact: false })
    .locator('xpath=ancestor-or-self::*[.//*[@role="switch"]][1]')
    .first();

  const toggle = card.getByRole('switch');
  const isOn = (await toggle.getAttribute('aria-checked')) === 'true';

  if (isOn !== enabled) {
    await toggle.click();
    // State is persisted via admin-ajax; wait for the toggle to settle.
    await expect(toggle).toHaveAttribute('aria-checked', String(enabled));
  }
}
