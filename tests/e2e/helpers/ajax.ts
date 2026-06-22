import { Page, expect } from '@playwright/test';
import { gotoModules } from './modules';

/**
 * StoreGrowth admin-ajax helpers.
 *
 * The plugin localises `window.spsgAdmin = { ajax_url, nonce, ... }` on its
 * Modules and Settings admin screens (Assets::admin_enqueue_scripts). These
 * helpers read that object from the page, then POST to admin-ajax through
 * `page.request` so the admin session cookies ride along. The nonce action is
 * `spsg_ajax_nonce`, verified server-side via `check_ajax_referer()` (which
 * accepts the `_ajax_nonce` field).
 */

type SpsgAdmin = { ajax_url: string; nonce: string };

/**
 * Read the localised ajax config (`window.spsgAdmin`). If it is not present —
 * the test hasn't navigated to a StoreGrowth admin screen yet — we open the
 * Modules screen (where it is localised) and read it from there.
 */
export async function getSpsgAdmin(page: Page): Promise<SpsgAdmin> {
  let cfg = await page.evaluate(() => (window as unknown as { spsgAdmin?: SpsgAdmin }).spsgAdmin);
  if (!cfg) {
    await gotoModules(page);
    cfg = await page.evaluate(() => (window as unknown as { spsgAdmin?: SpsgAdmin }).spsgAdmin);
  }
  expect(cfg, 'window.spsgAdmin should be localised on the StoreGrowth admin screen').toBeTruthy();
  return cfg as SpsgAdmin;
}

/** Flatten a nested params object into PHP-style form keys: { data: { a: 1 } } -> { 'data[a]': '1' }. */
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

/**
 * Call the core ajax dispatcher (`action=spsg_admin_ajax`) with a `method` and
 * optional `data`. Returns the parsed JSON body.
 */
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

/**
 * Activate/deactivate a module via the core ajax dispatcher, then VERIFY it
 * settled by reading the catalog back — retrying the toggle if needed.
 *
 * Module state is one shared option; under a long run a single toggle can
 * occasionally not be reflected by the next storefront request, so we confirm
 * before the caller loads the storefront. Deterministic in place of a bare
 * update_module_status call.
 */
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

/**
 * Call a per-module settings ajax action directly (e.g.
 * `spsg_stock_bar_save_settings`). Extra fields (like `form_data`) are flattened
 * into PHP form keys.
 */
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
