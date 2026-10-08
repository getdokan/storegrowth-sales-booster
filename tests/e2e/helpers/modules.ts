import { Page, Locator, expect } from '@playwright/test';

// One app page since ADR-008 (`admin.php?page=storegrowth#/<route>`); the old
// `spsg-settings` / `spsg-modules` slugs redirect to it.
export const APP_PAGE = 'storegrowth';
export const MODULES_PAGE = `${APP_PAGE}#/modules`;

/** The React app root on the StoreGrowth page. */
export function adminApp(page: Page): Locator {
  return page.locator('#spsg-admin-app');
}

/** Open a route of the app (`'/dashboard'`, `'/modules'`, …) without waiting for content. */
export async function gotoAppRoute(page: Page, route: string): Promise<void> {
  await page.goto(`/wp-admin/admin.php?page=${APP_PAGE}#${route}`);
}

/** Open the Dashboard and wait until the app has drawn it. */
export async function gotoDashboard(page: Page): Promise<void> {
  await gotoAppRoute(page, '/dashboard');
  await expect(
    adminApp(page).getByRole('heading', { level: 1, name: 'Dashboard', exact: true }),
  ).toBeVisible();
}

/** Open the Modules screen and wait until the catalog (cards + switches) has drawn. */
export async function gotoModules(page: Page): Promise<void> {
  await gotoAppRoute(page, '/modules');
  const app = adminApp(page);
  await expect(app.getByRole('heading', { level: 1, name: 'Modules', exact: true })).toBeVisible();
  await expect(app.getByRole('switch', { name: /^Enable (?!all modules)/ }).first()).toBeVisible();
}

/**
 * A module's switch on the Modules screen, by its catalog name (`MODULES.x.name`):
 * `switch "Enable <name>"`. Never matches the "Enable all modules" master switch.
 */
export function moduleToggle(page: Page, moduleName: string): Locator {
  return adminApp(page).getByRole('switch', { name: `Enable ${moduleName}`, exact: true });
}

/** A module's card link (title + description), which opens its page. */
export function moduleCardLink(page: Page, moduleName: string): Locator {
  return adminApp(page)
    .getByRole('link')
    .filter({ has: page.getByRole('heading', { level: 3, name: moduleName, exact: true }) });
}

/**
 * Enable/disable a module through the Modules screen UI. Idempotent; waits for
 * the `POST sales-booster/v1/modules/<id>` save and the switch to settle.
 * For test setup prefer the REST `setModuleStatus()` (helpers/rest.ts).
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
    const saved = page.waitForResponse(
      (r) => /sales-booster\/v1\/modules\/[a-z0-9-]+/.test(r.url()) && r.request().method() === 'POST',
    );
    await toggle.click();
    expect((await saved).ok(), `saving ${moduleName} status`).toBeTruthy();
  }
  await expect(toggle).toHaveAttribute('aria-checked', String(enabled));
}
