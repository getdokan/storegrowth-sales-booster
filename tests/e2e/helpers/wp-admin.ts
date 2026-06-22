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
 */
export async function gotoAdminPage(page: Page, slug: string): Promise<void> {
  await page.goto(`/wp-admin/admin.php?page=${slug}`);
}
