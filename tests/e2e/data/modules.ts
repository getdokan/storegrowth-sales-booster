/**
 * Stable test data for StoreGrowth modules.
 *
 * `id` matches the module slug used in the `spsg_active_module_ids` option;
 * `name` is the label rendered on the Modules screen.
 */
export const MODULES = {
  bogo: { id: 'bogo', name: 'BOGO' },
  flyCart: { id: 'fly-cart', name: 'Fly Cart' },
  countdownTimer: { id: 'countdown-timer', name: 'Countdown Timer' },
  quickView: { id: 'quick-view', name: 'Quick View' },
  stockBar: { id: 'stock-bar', name: 'Stock Bar' },
} as const;

export type ModuleKey = keyof typeof MODULES;
