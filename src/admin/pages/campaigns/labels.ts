/**
 * Campaign wording shared by the list and the campaign page (ADR-016).
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';

import type { CampaignStatus, OfferKind } from './api';

/** Status labels. */
export const STATUS_LABELS: Record< CampaignStatus, string > = {
    draft: __( 'Draft', 'storegrowth-sales-booster' ),
    scheduled: __( 'Scheduled', 'storegrowth-sales-booster' ),
    running: __( 'Running', 'storegrowth-sales-booster' ),
    paused: __( 'Paused', 'storegrowth-sales-booster' ),
    ended: __( 'Ended', 'storegrowth-sales-booster' ),
};

/** Offer kind chips. */
export const OFFER_LABELS: Record< OfferKind, string > = {
    smart_coupon: __( 'Smart Coupon', 'storegrowth-sales-booster' ),
    bogo: __( 'BOGO', 'storegrowth-sales-booster' ),
    order_bump: __( 'Order Bump', 'storegrowth-sales-booster' ),
};

/** Surface ids in rail order, with their labels. */
export const SURFACES: Array< { id: string; label: string; help?: string } > = [
    {
        id: 'countdown',
        label: __( 'Countdown Timer', 'storegrowth-sales-booster' ),
    },
    {
        id: 'floating_bar',
        label: __( 'Floating Notification Bar', 'storegrowth-sales-booster' ),
    },
    {
        id: 'stock_bar',
        label: __( 'Stock Count Bar', 'storegrowth-sales-booster' ),
    },
    {
        id: 'sales_pop',
        label: __( 'Live Sales Notification', 'storegrowth-sales-booster' ),
    },
    {
        id: 'fly_cart',
        label: __( 'Fly Cart message', 'storegrowth-sales-booster' ),
    },
    {
        id: 'cart_rewards',
        label: __( 'Cart Rewards bar', 'storegrowth-sales-booster' ),
        help: __(
            'Uses your Cart Rewards milestones. Shows campaign copy on the bar.',
            'storegrowth-sales-booster'
        ),
    },
    { id: 'badge', label: __( 'Product Badge', 'storegrowth-sales-booster' ) },
];

/**
 * A surface's label.
 *
 * @param id Surface id.
 */
export function surfaceLabel( id: string ): string {
    const surface = SURFACES.find( ( item ) => {
        return item.id === id;
    } );

    if ( surface ) {
        return surface.label;
    }

    return id === 'direct' ? __( 'Direct', 'storegrowth-sales-booster' ) : id;
}
