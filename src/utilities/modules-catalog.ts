/**
 * Design-level facts about each module that the PHP module list doesn't carry:
 * the label used in the new UI, its feature-menu order, its dashboard group and
 * dashboard copy. Keyed by module id. Icons live in `@storegrowth/components`
 * (`ModuleIcon`).
 *
 * @since SPSG_VERSION
 */

export type DashboardGroup = 'order-value' | 'checkout-path' | 'urgency';

export interface ModuleCatalogEntry {
    /** Label in the feature menu and page title (design wording). */
    label: string;
    /** Dashboard group, or null when the design doesn't list it there. */
    group: DashboardGroup | null;
    /** Dashboard description (design copy). Empty when not shown on the dashboard. */
    summary: string;
}

/** Feature menu order, as in the design. */
export const MODULE_ORDER = [
    'countdown-timer',
    'stock-bar',
    'sales-pop',
    'progressive-discount-banner',
    'floating-notification-bar',
    'bogo',
    'upsell-order-bump',
    'quick-view',
    'fly-cart',
    'direct-checkout',
] as const;

/** Dashboard groups in display order, with the design's headings and module order. */
export const DASHBOARD_GROUPS: Array< {
    id: DashboardGroup;
    title: string;
    modules: string[];
} > = [
    {
        id: 'order-value',
        title: 'Raise order value',
        modules: [ 'bogo', 'upsell-order-bump' ],
    },
    {
        id: 'checkout-path',
        title: 'Shorten the path to checkout',
        modules: [ 'fly-cart', 'direct-checkout', 'quick-view' ],
    },
    {
        id: 'urgency',
        title: 'Create urgency, carefully',
        modules: [
            'countdown-timer',
            'stock-bar',
            'floating-notification-bar',
        ],
    },
];

export const MODULE_CATALOG: Record< string, ModuleCatalogEntry > = {
    'countdown-timer': {
        label: 'Countdown Timer',
        group: 'urgency',
        summary: 'Count down to the end of an offer.',
    },
    'stock-bar': {
        label: 'Stock Bar',
        group: 'urgency',
        summary:
            'Show remaining stock as a bar. Credible only when the number is real.',
    },
    'sales-pop': {
        label: 'Sales Notification',
        group: null,
        summary: '',
    },
    'progressive-discount-banner': {
        label: 'Free Shipping Rules',
        group: null,
        summary: '',
    },
    'floating-notification-bar': {
        label: 'Floating Bar',
        group: 'urgency',
        summary: 'A persistent bar for one announcement or code.',
    },
    bogo: {
        label: 'BOGO',
        group: 'order-value',
        summary:
            'Buy one, get one. Pair a product with a free or discounted second item.',
    },
    'upsell-order-bump': {
        label: 'Upsell Order Bump',
        group: 'order-value',
        summary: 'Offer a relevant add-on at the moment of checkout.',
    },
    'quick-view': {
        label: 'Quick View',
        group: 'checkout-path',
        summary: 'Inspect a product in a dialog without opening its page.',
    },
    'fly-cart': {
        label: 'Fly Cart',
        group: 'checkout-path',
        summary:
            'A side cart shoppers can open and review without leaving the page.',
    },
    'direct-checkout': {
        label: 'Direct Checkout',
        group: 'checkout-path',
        summary: 'Send shoppers straight to checkout, skipping the cart page.',
    },
};

/**
 * Sort modules into the design's feature-menu order; unknown modules
 * (e.g. added through the `spsg_modules` filter) go last in their given order.
 *
 * @since SPSG_VERSION
 *
 * @param modules Modules from the API.
 */
export function sortModules( modules: SpsgModule[] ): SpsgModule[] {
    const rank = ( id: string ) => {
        const index = ( MODULE_ORDER as readonly string[] ).indexOf( id );
        return index === -1 ? MODULE_ORDER.length : index;
    };

    return [ ...modules ].sort( ( a, b ) => rank( a.id ) - rank( b.id ) );
}

/**
 * Display label for a module: design wording, falling back to the PHP name.
 *
 * @since SPSG_VERSION
 *
 * @param module Module.
 */
export function moduleLabel( module: SpsgModule ): string {
    return MODULE_CATALOG[ module.id ]?.label ?? module.name;
}
