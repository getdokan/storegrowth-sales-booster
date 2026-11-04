import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test';
import { adminApp } from '../../helpers/modules';
import {
  gotoSettings,
  resetSettings,
  saveButton,
  saveSettings,
  setField,
  settingsField,
} from '../../helpers/settings-ui';
import {
  getAllSettingsPages,
  getModuleSettings,
  hasPro,
  ModuleSettings,
  resetModuleSettings,
  SettingsField,
  setModuleStatus,
} from '../../helpers/rest';
import { MODULES } from '../../data/modules';

// Every generated settings page (ADR-009), driven from its own PHP schema
// (`GET sales-booster/v1/admin/settings`): on each tab, change one lite field
// through its real control, Save, reload — the value persists in the form and
// in REST; Reset + Save brings the default back. On lite every drawn pro field
// is locked (disabled, "Pro" badge).
//
// The field per tab is the first one the generic drivers (helpers/settings-ui)
// can set without page-specific knowledge: drawn by default (no `show_when`,
// not `hidden`), a label unique on the page, a type with a plain control.

// Types in order of preference: plain controls with an unambiguous value.
const DRIVABLE: Record<string, number> = { toggle: 0, text: 1, number: 2, color: 3, select: 4 };

type Entry = [string, SettingsField];

/** An accessible name with the "Pro" badge (a switch card adds its help after it). */
const PRO_NAME = /\sPro(\s|$)/;
const FORM_ROLES = ['switch', 'checkbox', 'spinbutton', 'combobox', 'textbox', 'radio'] as const;

function labelCounts(schema: Record<string, SettingsField>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const f of Object.values(schema)) {
    if (f.label) counts.set(String(f.label), (counts.get(String(f.label)) ?? 0) + 1);
  }
  return counts;
}

/** Fields drawn on `tab` (null: a page without tabs) when the values are the defaults. */
function fieldsOn(data: ModuleSettings, tab: string | null): Entry[] {
  const counts = labelCounts(data.schema);
  return Object.entries(data.schema).filter(
    ([, f]) =>
      (tab === null || f.tab === tab) &&
      f.label &&
      !f.hidden &&
      !f.show_when &&
      counts.get(String(f.label)) === 1,
  );
}

/**
 * A field with a plain control. A select without `labels` is a custom picker
 * (icons, templates, positions), and `alignment` a button group: skipped.
 */
function plainControl(f: SettingsField): boolean {
  if (!(f.type in DRIVABLE)) return false;
  return f.type !== 'select' || (Boolean(f.labels) && (f.options ?? []).length > 1 && f.variant !== 'alignment');
}

/** The lite field this test changes on a tab, or undefined. */
function pickField(fields: Entry[]): Entry | undefined {
  return fields
    .filter(([, f]) => !f.pro && plainControl(f))
    .sort(([, a], [, b]) => DRIVABLE[a.type] - DRIVABLE[b.type])[0];
}

/** A valid value that differs from the default. */
function newValue(f: SettingsField): unknown {
  switch (f.type) {
    case 'toggle':
      return !f.default;
    case 'text':
      return 'E2E settings page';
    case 'number': {
      const min = typeof f.min === 'number' ? f.min : 0;
      const max = typeof f.max === 'number' ? f.max : Infinity;
      const base = typeof f.default === 'number' ? f.default : min;
      return base + 1 <= max ? base + 1 : base - 1;
    }
    case 'color':
      return String(f.default).toLowerCase() === '#123456' ? '#654321' : '#123456';
    case 'select': {
      const pro = (f.pro_options as string[] | undefined) ?? [];
      return (f.options ?? []).find((o) => o !== f.default && !pro.includes(o));
    }
    default:
      throw new Error(`no value for ${f.type}`);
  }
}

/** The control of a field, by its role. */
function control(page: Page, f: SettingsField) {
  const label = String(f.label);
  switch (f.type) {
    case 'toggle':
      return settingsField(
        page,
        f.variant === 'checkbox' ? 'checkbox' : 'switch',
        label,
        f.variant === 'switch_card' && f.help ? String(f.help) : undefined,
      );
    case 'number':
      return settingsField(page, 'spinbutton', label);
    case 'color':
      return settingsField(page, 'button', label);
    case 'select':
      return settingsField(page, f.variant === 'radio' ? 'radiogroup' : 'combobox', label);
    default:
      return settingsField(page, 'textbox', label);
  }
}

/** Assert the form shows `value` after a reload (types with a readable control state). */
async function expectControlValue(page: Page, f: SettingsField, value: unknown): Promise<void> {
  const c = control(page, f);
  if (f.type === 'toggle') await expect(c).toHaveAttribute('aria-checked', String(value));
  else if (f.type === 'number' || f.type === 'text') await expect(c).toHaveValue(String(value));
  else await expect(c).toBeVisible();
}

/**
 * Open every collapsed settings group (Accordion: a plain button with
 * `aria-expanded=false`; not a select, whose trigger has a role, nor a
 * colour / popover trigger, which has `aria-haspopup`).
 */
async function expandSections(page: Page): Promise<void> {
  const collapsed = adminApp(page).locator('button[aria-expanded="false"]:not([aria-haspopup]):not([role])');
  for (let i = 0; i < 20 && (await collapsed.count()) > 0; i++) {
    await collapsed.first().click();
  }
  await expect(collapsed).toHaveCount(0);
}

const tabsOf =(data: ModuleSettings): (string | null)[] => {
  const keys = Object.keys(data.page.tabs ?? {});
  return keys.length ? keys : [null];
};

test.describe('Admin · every settings page saves, persists and resets', { tag: ['@ui', '@admin'] }, () => {
  let pages: Record<string, ModuleSettings> = {};

  test.beforeEach(async ({ api }) => {
    pages = await getAllSettingsPages(api);
  });

  const ids = ['general', ...Object.values(MODULES).map((m) => m.id)];

  for (const id of ids) {
    test(`${id}: change a field on each tab, save, reload, reset`, async ({ page, api }) => {
      const data = pages[id];
      test.skip(!data, `${id} has no generated settings page`);
      if (id !== 'general') await setModuleStatus(api, id, true);
      await resetModuleSettings(api, id);

      try {
        let changed = 0;
        for (const tab of tabsOf(data)) {
          const picked = pickField(fieldsOn(data, tab));
          if (!picked) continue;
          const [key, field] = picked;
          const value = newValue(field);

          await test.step(`${tab ?? 'page'} › ${key} = ${JSON.stringify(value)}`, async () => {
            await gotoSettings(page, id, tab ?? undefined);
            await expandSections(page);
            await expect(saveButton(page), 'Save is disabled before a change').toBeDisabled();
            await setField(page, field, value);
            const saved = await saveSettings(page, id);
            expect(saved.values[key], `${key} saved (not ignored)`).toEqual(value);

            await page.reload();
            await gotoSettings(page, id, tab ?? undefined);
            await expandSections(page);
            await expectControlValue(page, field, value);
            expect((await getModuleSettings(api, id)).values[key], `${key} stored`).toEqual(value);

            await resetSettings(page, id);
            expect((await getModuleSettings(api, id)).values[key], `${key} back to its default after Reset`).toEqual(
              field.default,
            );
          });
          changed += 1;
        }
        // Pages whose every tab is pro-only or custom-drawn still mount (settings.spec.ts).
        test.info().annotations.push({ type: 'fields changed', description: String(changed) });
      } finally {
        await resetModuleSettings(api, id);
      }
    });

    test(`${id}: pro fields are locked on lite`, async ({ page, api }) => {
      const data = pages[id];
      test.skip(!data, `${id} has no generated settings page`);
      test.skip(await hasPro(api), 'lite-only check');
      if (id !== 'general') await setModuleStatus(api, id, true);

      for (const tab of tabsOf(data)) {
        const pro = fieldsOn(data, tab).filter(([, f]) => f.pro && plainControl(f));
        if (!pro.length) continue;
        await test.step(`${tab ?? 'page'}: ${pro.map(([k]) => k).join(', ')}`, async () => {
          await gotoSettings(page, id, tab ?? undefined);
          await expandSections(page);

          // 1. Every form control carrying the Pro badge is disabled. (Buttons
          //    are left out: an "Upgrade to Pro" link-button is meant to work.)
          let locked = 0;
          for (const role of FORM_ROLES) {
            for (const c of await adminApp(page).getByRole(role, { name: PRO_NAME }).all()) {
              await expect(c, `${role} "${await c.getAttribute('aria-label')}" carries Pro`).toBeDisabled();
              locked += 1;
            }
          }

          // 2. Each pro field drawn with its own label (colour buttons too) is
          //    a locked control. A module page may draw some as one multi-key
          //    control, or only when another field is on; 1 covers those.
          for (const [key, f] of pro) {
            const c = control(page, f);
            if ((await c.count()) === 0) continue;
            await expect(c, `${key} is disabled`).toBeDisabled();
            await expect(c, `${key} carries the Pro badge`).toHaveAccessibleName(PRO_NAME);
            locked += 1;
          }
          expect(locked, 'the tab draws its pro fields locked').toBeGreaterThan(0);
        });
      }
    });
  }
});
