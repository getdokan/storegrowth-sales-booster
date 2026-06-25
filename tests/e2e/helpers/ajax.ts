import { Page, expect } from '@playwright/test';
import { gotoModules } from './modules';

// `window.spsgAdmin = { ajax_url, nonce }` is localised on Modules/Settings admin screens; these
// helpers read it then POST via `page.request` so admin session cookies ride along.

type SpsgAdmin = { ajax_url: string; nonce: string };

// Falls back to opening the Modules screen if spsgAdmin isn't localised yet.
export async function getSpsgAdmin(page: Page): Promise<SpsgAdmin> {
  let cfg = await page.evaluate(() => (window as unknown as { spsgAdmin?: SpsgAdmin }).spsgAdmin);
  if (!cfg) {
    await gotoModules(page);
    cfg = await page.evaluate(() => (window as unknown as { spsgAdmin?: SpsgAdmin }).spsgAdmin);
  }
  expect(cfg, 'window.spsgAdmin should be localised on the StoreGrowth admin screen').toBeTruthy();
  return cfg as SpsgAdmin;
}

// Flatten a nested object into PHP-style form keys: { data: { a: 1 } } -> { 'data[a]': '1' }.
function toFormFields(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === 'object') {
      Object.assign(out, toFormFields(v as Record<string, unknown>, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

export async function spsgAdminAjax(
  page: Page,
  method: string,
  data: Record<string, unknown> = {},
): Promise<{ status: number; body: any }> {
  const { ajax_url, nonce } = await getSpsgAdmin(page);
  const res = await page.request.post(ajax_url, {
    form: {
      action: 'spsg_admin_ajax',
      method,
      _ajax_nonce: nonce,
      ...toFormFields({ data }),
    },
  });
  const text = await res.text();
  return { status: res.status(), body: text ? JSON.parse(text) : null };
}

// Read `window.spsgAdmin.isPro`; use to skip Pro-only tests on a lite environment (e.g. CI).
export async function getIsPro(page: Page): Promise<boolean> {
  let val = await page.evaluate(() => (window as any).spsgAdmin?.isPro);
  if (val === undefined) {
    await gotoModules(page);
    val = await page.evaluate(() => (window as any).spsgAdmin?.isPro);
  }
  return Boolean(val);
}

// Module state is one shared option; a single toggle can occasionally not be reflected by the next
// request, so verify by reading the catalog back and retry before the caller loads the storefront.
export async function setModuleActive(
  page: Page,
  moduleId: string,
  active: boolean,
): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt++) {
    await spsgAdminAjax(page, 'update_module_status', {
      module_id: moduleId,
      status: active ? 'true' : 'false',
    });
    const { body } = await spsgAdminAjax(page, 'get_all_modules');
    const entry = Array.isArray(body) ? body.find((m: any) => m.id === moduleId) : null;
    if (entry && Boolean(entry.status) === active) return;
    await page.waitForTimeout(150);
  }
  throw new Error(`module ${moduleId} did not reach active=${active}`);
}

export async function moduleAjax(
  page: Page,
  action: string,
  fields: Record<string, unknown> = {},
): Promise<{ status: number; body: any }> {
  const { ajax_url, nonce } = await getSpsgAdmin(page);
  const res = await page.request.post(ajax_url, {
    form: {
      action,
      _ajax_nonce: nonce,
      ...toFormFields(fields),
    },
  });
  const text = await res.text();
  return { status: res.status(), body: text ? JSON.parse(text) : null };
}
