import { Page, expect } from '@playwright/test';

export const MODULES_PAGE = 'spsg-modules';
export const SETTINGS_PAGE = 'spsg-settings';

/** Open the Modules screen and wait for the React app to mount. */
export async function gotoModules(page: Page): Promise<void> {
  await page.goto(`/wp-admin/admin.php?page=${MODULES_PAGE}`);
  await expect(page.locator('#sbooster-modules-page')).toBeVisible();
}

// Scope to the card so the module name in the "Premium" docs sidebar (a second
// match for names like "Quick View") can't hijack the locator.
export function moduleToggle(page: Page, moduleName: string) {
  return page
    .locator('.spsg-module-card', { hasText: moduleName })
    .getByRole('switch');
}

/** Ensure a module is enabled/disabled. Idempotent; waits for `aria-checked` to settle. */
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
