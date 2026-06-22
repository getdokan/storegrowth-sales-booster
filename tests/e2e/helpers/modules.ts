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
 * Locate a module's Ant Design toggle (`role="switch"`).
 *
 * Each module renders as an `.ant-card.spsg-module-card` whose body starts with
 * the module name; the activation toggle lives in that card's footer. We scope
 * to the card so the module name in the "Premium" docs sidebar (a second match
 * for names like "Quick View") can't hijack the locator.
 */
export function moduleToggle(page: Page, moduleName: string) {
  return page
    .locator('.spsg-module-card', { hasText: moduleName })
    .getByRole('switch');
}

/**
 * Ensure a module is in the desired enabled/disabled state.
 *
 * Idempotent: a no-op when the module is already in the target state. State is
 * persisted via admin-ajax; we wait for `aria-checked` to settle rather than a
 * fixed timeout.
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

  const toggle = moduleToggle(page, moduleName);
  await expect(toggle).toBeVisible();
  const isOn = (await toggle.getAttribute('aria-checked')) === 'true';

  if (isOn !== enabled) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', String(enabled));
  }
}
