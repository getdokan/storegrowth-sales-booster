import { Page, expect } from '@playwright/test';

/**
 * Helpers to drive the StoreGrowth Settings SPA (Ant Design) end-to-end — i.e.
 * change settings through the REAL admin form controls and Save, rather than
 * posting to the ajax endpoint. Use these when a test must prove the full
 * admin-UI → storefront chain.
 */
const ROOT = '#sbooster-settings-page';

/** Open a module's settings page by its hash route and wait for the SPA to mount. */
export async function gotoModuleSettings(page: Page, route: string): Promise<void> {
  await page.goto(`/wp-admin/admin.php?page=spsg-settings#/${route}`);
  await expect(page.locator(ROOT)).toBeVisible();
  // Let the form hydrate with saved values.
  await page.waitForTimeout(800);
}

/** Switch to a tab by its visible label (e.g. "Design", "Banner Setting"). */
export async function openTab(page: Page, label: string): Promise<void> {
  await page.locator(`${ROOT} [role="tab"]`, { hasText: label }).first().click();
  await page.waitForTimeout(300);
}

/** Click the form's Save button and wait for the save request to complete. */
export async function saveForm(page: Page): Promise<void> {
  await Promise.all([
    page
      .waitForResponse(
        (r) => r.url().includes('admin-ajax.php') && r.request().method() === 'POST',
        { timeout: 15000 },
      )
      .catch(() => {}),
    page.locator(`${ROOT} button:visible`).filter({ hasText: /^Save$/ }).first().click(),
  ]);
  await page.waitForTimeout(300);
}

/** Click the form's (visible) Reset button. Reverts fields to defaults; persist with Save. */
export async function resetForm(page: Page): Promise<void> {
  await page.locator(`${ROOT} .spsg-settings-reset-button:visible`).first().click();
  await page.waitForTimeout(300);
}

/** Reset a module's design to defaults via the Reset button + Save (cleanup + exercises Reset). */
export async function resetAndSave(page: Page, route: string, tab = 'Design'): Promise<void> {
  await gotoModuleSettings(page, route);
  await openTab(page, tab).catch(() => {});
  await resetForm(page);
  await saveForm(page);
}

/** The field control following a given card-heading label (heading is in one column, control the next). */
function controlAfter(page: Page, label: string, controlSelectorClass: string) {
  return page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator(
      `xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ${controlSelectorClass} ")][1]`,
    );
}

/** Fill a text input / textarea found by its card-heading label. */
export async function setTextField(page: Page, label: string, value: string): Promise<void> {
  const field = page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::textarea[1] | following::input[@type="text"][1]');
  await field.first().fill(value);
}

/** Set an Ant ColorPicker (by card-heading label) to a hex value via its popover hex input. */
export async function setColor(page: Page, label: string, hex: string): Promise<void> {
  await controlAfter(page, label, 'ant-color-picker-trigger').first().click();
  const hexInput = page.locator('.ant-color-picker .ant-input').first();
  await expect(hexInput).toBeVisible();
  await hexInput.fill(hex.replace('#', ''));
  await hexInput.press('Enter');
  await page.keyboard.press('Escape'); // close the popover
  // Let the ColorPicker onChange propagate into the form state before Save.
  await page.waitForTimeout(400);
}

/** Choose an option in an Ant Select (by card-heading label). */
export async function setSelect(page: Page, label: string, optionText: string): Promise<void> {
  await controlAfter(page, label, 'ant-select').first().click();
  await page
    .locator('.ant-select-dropdown')
    .locator('.ant-select-item-option', { hasText: optionText })
    .first()
    .click();
}

/** Set an Ant InputNumber (by card-heading label). */
export async function setNumber(page: Page, label: string, value: number | string): Promise<void> {
  const input = page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::input[contains(concat(" ", normalize-space(@class), " "), " ant-input-number-input ")][1]');
  await input.fill(String(value));
  await input.press('Enter');
  await page.waitForTimeout(200);
}

/** Set an Ant Switch (by card-heading label) to the desired on/off state. */
export async function setSwitch(page: Page, label: string, on: boolean): Promise<void> {
  const sw = page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::button[@role="switch"][1]');
  const isOn = (await sw.getAttribute('aria-checked')) === 'true';
  if (isOn !== on) {
    await sw.click();
    await page.waitForTimeout(200);
  }
}

/** The Ant Switch control following a card-heading label (for assertions). */
export function switchControl(page: Page, label: string) {
  return page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::button[@role="switch"][1]');
}

/**
 * Set a "content group" checkbox (e.g. Quick View / Fly Cart "Show X" options).
 * These render the checkbox BEFORE the heading label, with the label `htmlFor`
 * bound to the checkbox id — so we toggle by clicking the label (matched by its
 * exact text), which is the only reliable target.
 */
export async function setContentCheckbox(page: Page, labelText: string, checked: boolean): Promise<void> {
  const label = page
    .locator(`${ROOT} label.content-field-heading`)
    .filter({ hasText: new RegExp(`^${labelText}$`) })
    .first();
  const forName = await label.getAttribute('for');
  const input = page.locator(`${ROOT} #${forName}`);
  if ((await input.isChecked()) !== checked) {
    await label.click();
    await page.waitForTimeout(400);
  }
}

/** Set an Ant Checkbox (by card-heading label) to the desired checked state. */
export async function setCheckbox(page: Page, label: string, checked: boolean): Promise<void> {
  const wrapper = page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::label[contains(concat(" ", normalize-space(@class), " "), " ant-checkbox-wrapper ")][1]');
  const isOn = await wrapper.evaluate((el) => !!el.querySelector('.ant-checkbox-checked'));
  if (isOn !== checked) {
    await wrapper.click();
    await page.waitForTimeout(200);
  }
}
