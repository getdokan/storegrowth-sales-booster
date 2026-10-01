import { Page, Locator, Response, expect } from '@playwright/test';
import { adminApp, gotoAppRoute } from './modules';
import type { SettingsField } from './rest';

// Drive a GENERATED settings page (ADR-009: `#/settings?module=<id>&tab=<tab>`)
// through its real controls + the SaveBar, to prove the admin UI → REST →
// storefront chain. For test SETUP use the REST helpers in helpers/rest.ts.
//
// Every control is found by its field label (the schema's `label`). A pro field
// on lite carries a "Pro" badge in its accessible name and is disabled; the
// locators below accept the badge, and the setters fail loudly on a disabled
// control instead of silently doing nothing.
//
// Control per schema `type` / `variant`:
//   text, url, textarea, text+textarea  → textbox
//   number                              → spinbutton
//   toggle                              → switch;   toggle+checkbox → checkbox
//   select                              → combobox; select+radio    → radiogroup of radios
//   color                               → button that opens a dialog with textbox "Hex color"
//   others (date, list, box, alignment, device, switch_card) → use settingsField()
//   with the role and drive it in the spec.

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Accessible name of a field: its label, optionally followed by the "Pro" badge. */
export function fieldName(label: string): RegExp {
  return new RegExp(`^${escape(label)}(\\s*Pro)?$`);
}

/** URL route of a module's settings page. */
export function settingsRoute(moduleId: string, tab?: string): string {
  return `/settings?module=${moduleId}${tab ? `&tab=${tab}` : ''}`;
}

/**
 * Open a module's generated settings page (optionally on a tab, by tab KEY such
 * as 'design') and wait until the form has drawn: the h1, then the tab list
 * (tabbed pages) or the SaveBar (single-section pages). On lite a tab holding
 * only pro fields has no SaveBar, so don't expect Save on every tab.
 * `general` opens the plugin-wide Settings page.
 */
export async function gotoSettings(page: Page, moduleId: string, tab?: string): Promise<void> {
  await gotoAppRoute(page, settingsRoute(moduleId, tab));
  const app = adminApp(page);
  await expect(app.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(app.getByRole('tablist').or(saveButton(page)).first()).toBeVisible();
}

/** Switch tab by its visible label ('Design', 'Configure', …). */
export async function openTab(page: Page, label: string): Promise<void> {
  const tab = adminApp(page).getByRole('tab', { name: label, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
}

/** The SaveBar's Save button (disabled until something changed). */
export function saveButton(page: Page): Locator {
  return adminApp(page).getByRole('button', { name: 'Save', exact: true });
}

/** The SaveBar's Reset button. */
export function resetButton(page: Page): Locator {
  return adminApp(page).getByRole('button', { name: 'Reset', exact: true });
}

/** A field's control by role + label (pro badge allowed). Scoped to the open tab. */
export function settingsField(
  page: Page,
  role: 'textbox' | 'spinbutton' | 'switch' | 'checkbox' | 'combobox' | 'button' | 'radiogroup',
  label: string,
): Locator {
  return adminApp(page).getByRole(role, { name: fieldName(label) });
}

async function enabled(control: Locator, label: string): Promise<Locator> {
  await expect(control, `field "${label}"`).toBeVisible();
  await expect(control, `field "${label}" is disabled (a pro field on lite?)`).toBeEnabled();
  return control;
}

export async function setText(page: Page, label: string, value: string): Promise<void> {
  await (await enabled(settingsField(page, 'textbox', label), label)).fill(value);
}

export async function setNumber(page: Page, label: string, value: number | string): Promise<void> {
  const input = await enabled(settingsField(page, 'spinbutton', label), label);
  await input.fill(String(value));
  await input.press('Tab'); // commit on blur
}

/** A toggle: `switch` by default, `checkbox` for the checkbox variant. */
export async function setToggle(
  page: Page,
  label: string,
  on: boolean,
  variant: 'switch' | 'checkbox' = 'switch',
): Promise<void> {
  const control = await enabled(settingsField(page, variant, label), label);
  await control.setChecked(on);
  await expect(control).toHaveAttribute('aria-checked', String(on));
}

/** A dropdown select, by the visible option text. */
export async function setSelect(page: Page, label: string, optionText: string): Promise<void> {
  await (await enabled(settingsField(page, 'combobox', label), label)).click();
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

/**
 * A radio-variant select, by the option's visible text (an "About …" help
 * suffix is fine). On lite the schema's `pro_options` are not drawn, and a
 * module's page may relabel options, so prefer the text you see on screen.
 */
export async function setRadio(page: Page, label: string, optionText: string): Promise<void> {
  const group = settingsField(page, 'radiogroup', label);
  await expect(group, `radio group "${label}"`).toBeVisible();
  const radio = group.getByRole('radio', { name: new RegExp(`^${escape(optionText)}`) });
  await (await enabled(radio, `${label} › ${optionText}`)).check();
}

/** A color field: open its picker, type the hex, close. */
export async function setColor(page: Page, label: string, hex: string): Promise<void> {
  await (await enabled(settingsField(page, 'button', label), label)).click();
  const hexInput = page.getByRole('dialog').getByRole('textbox', { name: 'Hex color' });
  await expect(hexInput).toBeVisible();
  await hexInput.fill(hex.replace('#', ''));
  await hexInput.press('Enter');
  await page.keyboard.press('Escape');
  await expect(hexInput).toBeHidden();
}

/**
 * Set a field from its schema entry (from `getModuleSettings(api, id).schema[key]`),
 * so specs don't hand-pick roles. Switches to the field's tab first when the
 * page has tabs. `value` is the typed API value (bool, number, string key of
 * a select).
 */
export async function setField(page: Page, field: SettingsField, value: unknown, tabLabel?: string): Promise<void> {
  if (tabLabel) await openTab(page, tabLabel);
  const label = String(field.label);
  switch (field.type) {
    case 'text':
    case 'url':
    case 'textarea':
      return setText(page, label, String(value));
    case 'number':
      return setNumber(page, label, value as number);
    case 'toggle':
      return setToggle(page, label, Boolean(value), field.variant === 'checkbox' ? 'checkbox' : 'switch');
    case 'color':
      return setColor(page, label, String(value));
    case 'select': {
      const text = field.labels?.[String(value)] ?? String(value);
      return field.variant === 'radio' ? setRadio(page, label, text) : setSelect(page, label, text);
    }
    default:
      throw new Error(`setField: no driver for type "${field.type}" variant "${field.variant}" — use settingsField()`);
  }
}

/** Wait for the module's settings save (`POST sales-booster/v1/settings/<id>`). */
export function waitForSettingsSave(page: Page, moduleId: string): Promise<Response> {
  return page.waitForResponse(
    (r) =>
      r.url().includes(`sales-booster/v1/settings/${moduleId}`) && r.request().method() === 'POST',
  );
}

/**
 * Click Save and wait for a successful settings save; returns the saved state.
 * The SaveBar belongs to the open TAB: it saves that tab's changes only (a
 * change on another tab leaves this tab's Save disabled). Save on each tab you
 * changed, before switching away.
 */
export async function saveSettings(page: Page, moduleId: string): Promise<{ values: Record<string, unknown> }> {
  const save = saveButton(page);
  await expect(save, 'Save is enabled only after a change').toBeEnabled();
  const saved = waitForSettingsSave(page, moduleId);
  await save.click();
  const res = await saved;
  expect(res.ok(), `save ${moduleId} settings: HTTP ${res.status()}`).toBeTruthy();
  await expect(save).toBeDisabled();
  return res.json();
}

/**
 * Reset: the button fills the form with the schema defaults (no dialog); it
 * persists only on Save. Pass `save: false` to inspect the unsaved form.
 */
export async function resetSettings(page: Page, moduleId: string, save = true): Promise<void> {
  await resetButton(page).click();
  if (save && (await saveButton(page).isEnabled())) {
    await saveSettings(page, moduleId);
  }
}
