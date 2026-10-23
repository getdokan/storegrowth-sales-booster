import { APIRequestContext, APIResponse, expect } from '@playwright/test';

// Browserless REST helpers for test SETUP and assertions. They take the `api`
// fixture (HTTP Basic as the admin, from fixtures/test.ts), so a storefront
// spec's beforeEach never has to drive the admin UI:
//
//   test.beforeEach(async ({ api }) => {
//     await setModuleStatus(api, MODULES.stockBar.id, true);
//     await resetModuleSettings(api, MODULES.stockBar.id, { show_stock_status: true });
//   });

const NS = '/wp-json/sales-booster/v1';

/** One field of a settings schema (`GET sales-booster/v1/settings/{module}`). */
export type SettingsField = {
  type: string;
  default: unknown;
  pro?: boolean;
  variant?: string;
  tab?: string;
  section?: string;
  label?: string;
  options?: string[];
  labels?: Record<string, string>;
  [key: string]: unknown;
};

/** `GET sales-booster/v1/settings/{module}`. */
export type ModuleSettings = {
  page: { title: string; tabs?: Record<string, { label: string; sections?: Record<string, unknown> }> };
  schema: Record<string, SettingsField>;
  /** Typed values (bool for toggles, numbers for numbers, …). */
  values: Record<string, unknown>;
  published: boolean;
};

/** A module in `GET sales-booster/v1/modules`. */
export type ModuleInfo = { id: string; name: string; status: boolean; [key: string]: unknown };

/** Fail with the response body in the message, so a 400 explains itself. */
export async function expectOk(res: APIResponse, what: string): Promise<void> {
  if (!res.ok()) {
    throw new Error(`${what} failed: HTTP ${res.status()} ${await res.text()}`);
  }
}

/* -- Modules ---------------------------------------------------------------- */

/** Every module with its status. */
export async function listModules(api: APIRequestContext): Promise<ModuleInfo[]> {
  const res = await api.get(`${NS}/modules`);
  await expectOk(res, 'list modules');
  return res.json();
}

/** Whether a module is active. */
export async function isModuleActive(api: APIRequestContext, moduleId: string): Promise<boolean> {
  const res = await api.get(`${NS}/modules/${moduleId}`);
  await expectOk(res, `read module ${moduleId}`);
  return Boolean((await res.json()).status);
}

/** Activate / deactivate a module (`PUT sales-booster/v1/modules/{id}`); asserts the new state. */
export async function setModuleStatus(
  api: APIRequestContext,
  moduleId: string,
  active: boolean,
): Promise<void> {
  const res = await api.put(`${NS}/modules/${moduleId}`, { data: { status: active } });
  await expectOk(res, `set module ${moduleId} status=${active}`);
  expect(Boolean((await res.json()).status), `module ${moduleId} status`).toBe(active);
}

/* -- Module settings ------------------------------------------------------- */

/** Page, schema, typed values and `published` of a module's settings. */
export async function getModuleSettings(
  api: APIRequestContext,
  moduleId: string,
): Promise<ModuleSettings> {
  const res = await api.get(`${NS}/settings/${moduleId}`);
  await expectOk(res, `read ${moduleId} settings`);
  return res.json();
}

/** Every settings page at once, keyed by module id (plus `general`). */
export async function getAllSettingsPages(
  api: APIRequestContext,
): Promise<Record<string, ModuleSettings>> {
  const res = await api.get(`${NS}/admin/settings`);
  await expectOk(res, 'read all settings pages');
  return res.json();
}

/**
 * Save some keys (`POST sales-booster/v1/settings/{module}` `{ values }`). The
 * engine merges them into the stored option; pro keys are ignored without
 * pro; an invalid value makes the whole save fail (this throws). Returns the
 * stored state after the save.
 */
export async function saveModuleSettings(
  api: APIRequestContext,
  moduleId: string,
  values: Record<string, unknown>,
): Promise<ModuleSettings> {
  const res = await api.post(`${NS}/settings/${moduleId}`, { data: { values } });
  await expectOk(res, `save ${moduleId} settings`);
  return res.json();
}

/** The schema defaults of a module (what the admin's Reset button fills in). */
export function schemaDefaults(schema: Record<string, SettingsField>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(schema).map(([key, field]) => [key, field.default]));
}

/**
 * Save every key back to its schema default, then apply `overrides`. Use it in a
 * storefront `beforeEach` so each test starts from known settings. On lite, pro
 * keys keep their stored value (the engine ignores them) — which, on a
 * provisioned stack, is the default anyway.
 */
export async function resetModuleSettings(
  api: APIRequestContext,
  moduleId: string,
  overrides: Record<string, unknown> = {},
): Promise<ModuleSettings> {
  const { schema } = await getModuleSettings(api, moduleId);
  return saveModuleSettings(api, moduleId, { ...schemaDefaults(schema), ...overrides });
}

/* -- Environment ------------------------------------------------------------ */

/**
 * Whether the StoreGrowth Pro PLUGIN is active on the stack under test (not
 * whether it is licensed: an unlicensed Pro would read true while its fields
 * stay locked). The default Docker stack is lite (false); the Pro variant
 * (PRO_DIR + LICENSE_KEY) and CI with the Pro secrets activate it together
 * with its license. Throws when the lookup fails, rather than guessing lite.
 */
export async function hasPro(api: APIRequestContext): Promise<boolean> {
  const res = await api.get('/wp-json/wp/v2/plugins', { params: { search: 'storegrowth-sales-booster-pro' } });
  await expectOk(res, 'list plugins (hasPro)');
  const plugins: { plugin: string; status: string }[] = await res.json();
  return plugins.some((p) => p.plugin.startsWith('storegrowth-sales-booster-pro/') && p.status === 'active');
}

/** Resolve a product id from its slug (WooCommerce REST). */
export async function productIdBySlug(api: APIRequestContext, slug: string): Promise<number> {
  const res = await api.get('/wp-json/wc/v3/products', { params: { slug, _fields: 'id' } });
  await expectOk(res, `look up product ${slug}`);
  const list: { id: number }[] = await res.json();
  expect(list.length, `product "${slug}" should exist`).toBeGreaterThan(0);
  return list[0].id;
}
