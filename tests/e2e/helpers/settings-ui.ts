import { Page, expect } from '@playwright/test';

// Drive the Settings SPA through the real admin form controls + Save, to prove the
// full admin-UI → storefront chain (rather than posting to the ajax endpoint directly).
const ROOT = '#sbooster-settings-page';

export async function gotoModuleSettings(page: Page, route: string): Promise<void> {
  await page.goto(`/wp-admin/admin.php?page=spsg-settings#/${route}`);
  await expect(page.locator(ROOT)).toBeVisible();
  await page.waitForTimeout(800); // let the form hydrate with saved values
}

export async function openTab(page: Page, label: string): Promise<void> {
  await page.locator(`${ROOT} [role="tab"]`, { hasText: label }).first().click();
  await page.waitForTimeout(300);
}

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

// Reverts fields to defaults; persist with Save.
export async function resetForm(page: Page): Promise<void> {
  await page.locator(`${ROOT} .spsg-settings-reset-button:visible`).first().click();
  await page.waitForTimeout(300);
}

export async function resetAndSave(page: Page, route: string, tab = 'Design'): Promise<void> {
  await gotoModuleSettings(page, route);
  await openTab(page, tab).catch(() => {});
  await resetForm(page);
  await saveForm(page);
}

function controlAfter(page: Page, label: string, controlSelectorClass: string) {
  return page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator(
      `xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ${controlSelectorClass} ")][1]`,
    );
}

export async function setTextField(page: Page, label: string, value: string): Promise<void> {
  const field = page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::textarea[1] | following::input[@type="text"][1]');
  await field.first().fill(value);
}

export async function setColor(page: Page, label: string, hex: string): Promise<void> {
  await controlAfter(page, label, 'ant-color-picker-trigger').first().click();
  const hexInput = page.locator('.ant-color-picker .ant-input').first();
  await expect(hexInput).toBeVisible();
  await hexInput.fill(hex.replace('#', ''));
  await hexInput.press('Enter');
  await page.keyboard.press('Escape'); // close the popover
  await page.waitForTimeout(400); // let ColorPicker onChange propagate into form state before Save
}

export async function setSelect(page: Page, label: string, optionText: string): Promise<void> {
  await controlAfter(page, label, 'ant-select').first().click();
  // Scope to the OPEN dropdown — sibling selects may keep hidden dropdowns in the
  // DOM that list the same option text (e.g. two product pickers).
  await page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .locator('.ant-select-item-option', { hasText: optionText })
    .first()
    .click();
}

export async function setDate(page: Page, label: string, dateStr: string): Promise<void> {
  const input = page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::input[1]')
    .first();
  await input.click();
  await input.fill(dateStr);
  await input.press('Enter');
  await page.waitForTimeout(200);
}

export async function setNumber(page: Page, label: string, value: number | string): Promise<void> {
  const input = page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::input[contains(concat(" ", normalize-space(@class), " "), " ant-input-number-input ")][1]');
  await input.fill(String(value));
  await input.press('Enter');
  await page.waitForTimeout(200);
}

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

export function switchControl(page: Page, label: string) {
  return page
    .locator(ROOT)
    .locator('.card-heading', { hasText: label })
    .locator('xpath=following::button[@role="switch"][1]');
}

// "Content group" checkboxes render BEFORE the heading label, so toggle via the label
// (htmlFor-bound to the checkbox id) — the only reliable target.
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

export async function setGroupCheckbox(
  page: Page,
  heading: string,
  optionLabel: string,
  checked: boolean,
): Promise<void> {
  const wrapper = page
    .locator(ROOT)
    .locator('.card-heading', { hasText: heading })
    .locator(
      `xpath=following::label[contains(concat(" ", normalize-space(@class), " "), " ant-checkbox-wrapper ")][normalize-space(.)="${optionLabel}"][1]`,
    );
  const isOn = await wrapper.evaluate((el) => !!el.querySelector('.ant-checkbox-checked'));
  if (isOn !== checked) {
    await wrapper.click();
    await page.waitForTimeout(200);
  }
}

export async function setRadioInField(page: Page, fieldClass: string, index: number): Promise<void> {
  await page.locator(`${ROOT} .${fieldClass} .ant-radio-button-wrapper`).nth(index).click();
  await page.waitForTimeout(200);
}

export async function setBannerIcon(page: Page, index: number): Promise<void> {
  await page
    .locator(ROOT)
    .locator('.card-heading', { hasText: 'Banner Icon' })
    .locator('xpath=following::label[contains(concat(" ", normalize-space(@class), " "), " ant-radio-button-wrapper ")]')
    .nth(index)
    .click();
  await page.waitForTimeout(200);
}

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
