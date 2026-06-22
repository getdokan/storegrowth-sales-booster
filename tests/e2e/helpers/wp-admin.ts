import { Page, expect } from '@playwright/test';
import { env } from './env';

/**
 * Log into wp-admin through the standard login form.
 *
 * Used once by the `setup` project to capture a reusable session; individual
 * tests never log in themselves.
 */
export async function login(
  page: Page,
  user: string = env.adminUser,
  password: string = env.adminPassword,
): Promise<void> {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', user);
  await page.fill('#user_pass', password);
  await page.click('#wp-submit');
  // The dashboard / any admin screen confirms a successful login.
  await page.waitForURL(/wp-admin/);
  await expect(page.locator('#wpadminbar')).toBeVisible();
}

/**
 * Navigate to a wp-admin page by its `?page=` slug, e.g. `spsg-settings`.
 *
 * Pass an optional hash route (e.g. `#/dashboard/overview`) for HashRouter SPAs.
 */
export async function gotoAdminPage(page: Page, slug: string, hash = ''): Promise<void> {
  await page.goto(`/wp-admin/admin.php?page=${slug}${hash}`);
}

/**
 * Open the Settings SPA and wait for it to mount.
 *
 * The bare `?page=spsg-settings` URL bounces to the Modules screen — the app
 * only stays put when deep-linked to a hash route (the plugin's own menu link
 * uses `#/dashboard/overview`). So always navigate via the hash route.
 */
export async function gotoSettings(page: Page): Promise<void> {
  await gotoAdminPage(page, 'spsg-settings', '#/dashboard/overview');
  await expect(page.locator('#sbooster-settings-page')).toBeVisible();
}
