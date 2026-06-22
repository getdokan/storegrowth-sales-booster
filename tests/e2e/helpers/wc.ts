import { Page, expect } from '@playwright/test';

/**
 * WooCommerce REST helpers for arranging storefront test state from a UI test.
 *
 * These run through the authenticated `page` (admin cookie session) plus the
 * core REST nonce (`window.wpApiSettings.nonce`). NOTE: the browserless `api`
 * fixture can't be used here — in the `ui` project it inherits the admin
 * storageState cookies, and REST cookie-auth without a nonce is rejected. WC
 * REST also treats a Basic-auth header as consumer key/secret, so the cookie +
 * nonce path is the reliable one for the UI project.
 *
 * They set up the *preconditions* a merchant configures; assertions still happen
 * on the storefront.
 */

/** Read the core REST nonce, navigating to wp-admin first if it isn't localised. */
async function restNonce(page: Page): Promise<string> {
  let nonce = await page.evaluate(() => (window as any).wpApiSettings?.nonce ?? '');
  if (!nonce) {
    await page.goto('/wp-admin/');
    nonce = await page.evaluate(() => (window as any).wpApiSettings?.nonce ?? '');
  }
  expect(nonce, 'wpApiSettings.nonce should be available on a wp-admin page').toBeTruthy();
  return nonce;
}

/** Resolve a product's numeric id from its slug. */
export async function getProductIdBySlug(page: Page, slug: string): Promise<number> {
  const nonce = await restNonce(page);
  const res = await page.request.get('/wp-json/wc/v3/products', {
    params: { slug },
    headers: { 'X-WP-Nonce': nonce },
  });
  expect(res.ok(), `lookup product ${slug} (status ${res.status()})`).toBeTruthy();
  const list = await res.json();
  expect(list.length, `product "${slug}" should exist`).toBeGreaterThan(0);
  return list[0].id as number;
}

/** Write product meta (accepts protected `_`-prefixed keys). */
export async function setProductMeta(
  page: Page,
  id: number,
  meta: Record<string, string>,
): Promise<void> {
  const nonce = await restNonce(page);
  const meta_data = Object.entries(meta).map(([key, value]) => ({ key, value }));
  const res = await page.request.put(`/wp-json/wc/v3/products/${id}`, {
    headers: { 'X-WP-Nonce': nonce },
    data: { meta_data },
  });
  expect(res.ok(), `set meta on product ${id} (status ${res.status()})`).toBeTruthy();
}

/** Update arbitrary product fields (e.g. stock_status, regular_price). */
export async function updateProduct(
  page: Page,
  id: number,
  data: Record<string, unknown>,
): Promise<void> {
  const nonce = await restNonce(page);
  const res = await page.request.put(`/wp-json/wc/v3/products/${id}`, {
    headers: { 'X-WP-Nonce': nonce },
    data,
  });
  expect(res.ok(), `update product ${id} (status ${res.status()})`).toBeTruthy();
}

/**
 * Authenticated REST call through the admin cookie session + nonce. Use for
 * plugin REST namespaces (e.g. spsg/v1) from a UI test, where the browserless
 * `api` fixture can't be used (see note above).
 */
export async function apiFetch(
  page: Page,
  method: 'get' | 'post' | 'put' | 'delete',
  path: string,
  data?: unknown,
) {
  const nonce = await restNonce(page);
  const opts: Record<string, unknown> = { headers: { 'X-WP-Nonce': nonce } };
  if (data !== undefined) opts.data = data;
  return page.request[method](path, opts);
}

/** ISO date helper: `YYYY-MM-DD HH:MM:SS` offset from now by `days`. */
export function dateOffset(days: number, time = '00:00:00'): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.toISOString().slice(0, 10)} ${time}`;
}
