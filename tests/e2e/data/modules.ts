/**
 * Stable test data for StoreGrowth modules.
 *
 * `id`   — module slug stored in the `spsg_active_module_ids` option.
 * `name` — exact label rendered on the Modules screen (from each *Module::get_name()).
 *
 * Baseline state provisioned by bin/setup-docker.sh: ALL modules are active.
 * Specs treat "all active" as the baseline — negative tests deactivate a module,
 * assert, then restore it to active. Keeping everything active mirrors a fully
 * configured store and keeps module state stable across the run.
 */
export const MODULES = {
  bogo: { id: 'bogo', name: 'BOGO' },
  countdownTimer: { id: 'countdown-timer', name: 'Countdown Timer' },
  directCheckout: { id: 'direct-checkout', name: 'Direct Checkout' },
  floatingBar: { id: 'floating-notification-bar', name: 'Floating Bar' },
  flyCart: { id: 'fly-cart', name: 'Fly Cart' },
  freeShipping: { id: 'progressive-discount-banner', name: 'Free Shipping Rules' },
  quickView: { id: 'quick-view', name: 'Quick View' },
  salesPop: { id: 'sales-pop', name: 'Sales Notification' },
  stockBar: { id: 'stock-bar', name: 'Stock Bar' },
  upsellOrderBump: { id: 'upsell-order-bump', name: 'Upsell Order Bump' },
} as const;

export type ModuleKey = keyof typeof MODULES;

/** Provisioning activates every module; tests restore modules to active. */
export const BASELINE_ACTIVE: string[] = Object.values(MODULES).map((m) => m.id);

/**
 * Storefront DOM markers that were *verified live* (module active → marker
 * present on the listed page). Each is the strongest, least-flaky selector for
 * that module. Used by the storefront behavior specs.
 */
export const STOREFRONT_MARKERS = {
  stockBar: { module: MODULES.stockBar, page: 'product', selector: '.spsg-stock-bar' },
  flyCart: { module: MODULES.flyCart, page: 'any', selector: '.wfc-cart-icon' },
  quickView: { module: MODULES.quickView, page: 'shop', selector: '.spsgqcv-btn' },
} as const;
