import { Page, Locator, Response, expect } from '@playwright/test';
import { adminApp, gotoAppRoute } from './modules';

// The record LIST and EDITOR screens (BOGO offers, order bumps): the shared
// `RecordList` (DataViews table: search, status switch, row "Actions" menu,
// bulk delete with a confirm dialog) and the record editor drawn by
// `ModuleSettingsPage` (tabs, SaveBar; field setters from helpers/settings-ui.ts
// work there too, by label). For setup use helpers/records.ts (REST).

/** Open a record list (`'/bogo'`, `'/upsell-order-bump'`) and wait for its heading. */
export async function gotoRecordList(page: Page, route: string, heading: string): Promise<void> {
  await gotoAppRoute(page, route);
  await expect(adminApp(page).getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
}

/** The list table's body row for a record, by its name. */
export function recordRow(page: Page, name: string): Locator {
  return adminApp(page).getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) });
}

/** The list's search box (DataViews toolbar). */
export function listSearch(page: Page): Locator {
  return adminApp(page).getByRole('textbox', { name: 'Search' });
}

/** Run a row action ("Edit", "Delete") from a row's "Actions" menu. */
export async function rowAction(page: Page, name: string, action: string): Promise<void> {
  await recordRow(page, name).getByRole('button', { name: 'Actions' }).click();
  await page.getByRole('menuitem', { name: action, exact: true }).click();
}

/** The delete confirmation (an `alertdialog`). */
export function deleteDialog(page: Page): Locator {
  return page.getByRole('alertdialog').or(page.getByRole('dialog'));
}

/** Confirm the open delete dialog and wait for the `…/batch` delete. */
export async function confirmDelete(page: Page): Promise<Response> {
  const dialog = deleteDialog(page);
  await expect(dialog).toBeVisible();
  const deleted = page.waitForResponse((r) => r.url().includes('/batch') && r.request().method() === 'POST');
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  const res = await deleted;
  expect(res.ok(), `batch delete: HTTP ${res.status()}`).toBeTruthy();
  return res;
}

/**
 * Pick a product in a product picker (plugin-ui Combobox, `MultiSelectField`):
 * type to search, choose the option. A single-product picker replaces its pick.
 */
export async function pickProduct(page: Page, label: string, search: string, option: string): Promise<void> {
  const box = adminApp(page).getByRole('combobox', { name: label });
  // The chips sit beside the input, in its parent.
  const chips = box.locator('xpath=..');
  // The results come debounced from the server and re-render under the
  // pointer: retry until the pick shows as a chip.
  await expect(async () => {
    await box.click();
    await box.fill(search);
    await page.getByRole('option', { name: option, exact: true }).click({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(chips).toContainText(option, { timeout: 2000 });
  }).toPass({ timeout: 20_000 });
}

/**
 * Click the editor's Save and wait for the record save (`POST <route>` for a
 * new record, `PUT <route>/<id>` for an edit). `route` is a URL fragment such
 * as `bogo/offers` or `order-bumps`.
 */
export async function saveRecord(page: Page, route: string): Promise<Response> {
  const save = adminApp(page).getByRole('button', { name: 'Save', exact: true });
  await expect(save).toBeEnabled();
  const saved = page.waitForResponse(
    (r) => r.url().includes(route) && ['POST', 'PUT'].includes(r.request().method()) && !r.url().includes('/status'),
  );
  await save.click();
  const res = await saved;
  expect(res.ok(), `save ${route}: HTTP ${res.status()} ${await res.text()}`).toBeTruthy();
  return res;
}

/** The hash route of the admin app (`/bogo/12?tab=design`). */
export function appHash(page: Page): string {
  return decodeURIComponent(new URL(page.url()).hash.replace(/^#/, ''));
}
