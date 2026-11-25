/**
 * Which version of an offer a record editor is editing. StoreGrowth has only
 * the everyday version; an extension (StoreGrowth Pro's campaigns) supplies
 * other versions through the `storegrowth.offer.useVersion` filter: a hook
 * that reads the editor's URL and loads and saves through its own routes.
 *
 * @since 3.1.0
 */
import type { ReactNode } from 'react';
import { applyFilters } from '@wordpress/hooks';

/** The version of an offer an editor is on. */
export interface OfferVersion {
    /** Record to load instead of the route's id (e.g. a campaign's offer row); 0 for none. */
    row: number;
    /** Records route to load and save through, or null for the module's own. */
    route: string | null;
    /** Where to go after creating a record, or null for the new record's page. */
    returnTo: string | null;
    /** Shown next to the editor's actions (e.g. "Black Friday version"). */
    header: ReactNode;
}

const EVERYDAY: OfferVersion = {
    row: 0,
    route: null,
    returnTo: null,
    header: null,
};

/**
 * The everyday version: the module's own routes.
 *
 * @since 3.1.0
 */
function useEverydayVersion(): OfferVersion {
    return EVERYDAY;
}

/**
 * The version of an offer the editor is on.
 *
 * The filter returns a hook, called on every render, so it must be the same
 * hook each time (register it before the admin app renders).
 *
 * @since 3.1.0
 *
 * @param kind Offer kind: `bogo`, `order_bump` or `smart_coupon`.
 */
export function useOfferVersion( kind: string ): OfferVersion {
    const useVersion = applyFilters(
        'storegrowth.offer.useVersion',
        useEverydayVersion,
        kind
    ) as ( offerKind: string ) => OfferVersion;

    return useVersion( kind );
}
