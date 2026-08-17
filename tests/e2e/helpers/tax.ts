import { Page, expect } from '@playwright/test';
import { apiFetch } from './wc';

// Every pricing characterisation runs twice: once with prices entered EXCLUDING
// tax and once INCLUDING tax. WooCommerce takes a different code path for each,
// and the plugin's discounts and fees behave differently between them, so a
// single-mode test would miss half of what 2.2 can break.

export type TaxMode = 'excl' | 'incl';

const RATE_NAME = 'E2E Characterisation Rate';

/** Write a WooCommerce setting through the REST settings API. */
async function setSetting(page: Page, group: string, id: string, value: string): Promise<void> {
  const res = await apiFetch(page, 'put', `/wp-json/wc/v3/settings/${group}/${id}`, { value });
  expect(res.ok(), `set ${group}.${id}=${value} (status ${res.status()})`).toBeTruthy();
}

/**
 * Turn tax on and install a single flat rate, so the expected numbers in the
 * specs stay arithmetic the reader can check by hand.
 */
export async function enableTax(page: Page, ratePercent = 10): Promise<void> {
  await setSetting(page, 'general', 'woocommerce_calc_taxes', 'yes');
  await setSetting(page, 'general', 'woocommerce_default_customer_address', 'base');

  // Remove any rate a previous run installed so rates never stack up.
  await removeTaxRates(page);

  const res = await apiFetch(page, 'post', '/wp-json/wc/v3/taxes', {
    country: '',
    state: '',
    rate: String(ratePercent),
    name: RATE_NAME,
    shipping: false,
    compound: false,
  });
  expect(res.ok(), `create tax rate (status ${res.status()})`).toBeTruthy();
}

/** Delete every tax rate this helper created. */
export async function removeTaxRates(page: Page): Promise<void> {
  const list = await apiFetch(page, 'get', '/wp-json/wc/v3/taxes?per_page=100');
  if (!list.ok()) return;

  for (const rate of await list.json()) {
    if (rate.name === RATE_NAME) {
      await apiFetch(page, 'delete', `/wp-json/wc/v3/taxes/${rate.id}?force=true`);
    }
  }
}

/**
 * Switch whether catalogue prices are treated as tax-inclusive.
 *
 * The product's stored price string does not change; only WooCommerce's reading
 * of it does. At 10% tax a 20.00 price is 20.00 + 2.00 in `excl` mode and
 * 18.18 + 1.82 in `incl` mode.
 */
export async function setTaxMode(page: Page, mode: TaxMode): Promise<void> {
  await setSetting(page, 'tax', 'woocommerce_prices_include_tax', mode === 'incl' ? 'yes' : 'no');
  await setSetting(page, 'tax', 'woocommerce_tax_display_cart', 'excl');
}

/** Turn tax off and clean up, so other specs see the store as they expect it. */
export async function disableTax(page: Page): Promise<void> {
  await removeTaxRates(page);
  await setSetting(page, 'tax', 'woocommerce_prices_include_tax', 'no');
  await setSetting(page, 'general', 'woocommerce_calc_taxes', 'no');
}
