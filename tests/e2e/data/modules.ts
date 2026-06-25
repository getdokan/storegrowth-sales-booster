// `id` is the module slug in `spsg_active_module_ids`; `name` is the exact label
// on the Modules screen. Baseline (provisioned by bin/setup-docker.sh) is ALL
// modules active; negative tests deactivate one, assert, then restore it.
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

export const BASELINE_ACTIVE: string[] = Object.values(MODULES).map((m) => m.id);

/** Storefront DOM markers verified live (module active → marker present on the page). */
export const STOREFRONT_MARKERS = {
  stockBar: { module: MODULES.stockBar, page: 'product', selector: '.spsg-stock-bar' },
  flyCart: { module: MODULES.flyCart, page: 'any', selector: '.wfc-cart-icon' },
  quickView: { module: MODULES.quickView, page: 'shop', selector: '.spsgqcv-btn' },
} as const;
