import { Page, expect } from '@playwright/test';
import { env } from './env';

/** Log into wp-admin via the login form. Used once by the `setup` project. */
export async function login(
  page: Page,
  user: string = env.adminUser,
  password: string = env.adminPassword,
): Promise<void> {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', user);
  await page.fill('#user_pass', password);
  await page.click('#wp-submit');
  await page.waitForURL(/wp-admin/);
  await expect(page.locator('#wpadminbar')).toBeVisible();
}

/** Navigate to a wp-admin `?page=` slug, with an optional HashRouter hash route. */
export async function gotoAdminPage(page: Page, slug: string, hash = ''): Promise<void> {
  await page.goto(`/wp-admin/admin.php?page=${slug}${hash}`);
}

// Navigate via the hash route, so the test doesn't depend on the default route.
export async function gotoSettings(page: Page): Promise<void> {
  await gotoAdminPage(page, 'storegrowth', '#/dashboard/overview');
  await expect(page.locator('#sbooster-settings-page')).toBeVisible();
}
