/**
 * The made-up campaigns a Free store previews (ADR-016).
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';

import type { CampaignList } from './api';

/** The list's preview. */
export const SAMPLE_LIST: CampaignList = {
    items: [
        {
            id: 1,
            name: __( 'Black Friday 2026', 'storegrowth-sales-booster' ),
            status: 'running',
            starts_at: '2026-11-27 00:00:00',
            ends_at: '2026-12-01 23:59:00',
            offers: 3,
            offer_modules: [ 'smart_coupon', 'bogo', 'order_bump' ],
            surfaces: 5,
            revenue: 12840,
            orders: 212,
            aov_lift: 18.4,
            module_off: false,
            licence_stopped: false,
        },
        {
            id: 2,
            name: __( 'Winter clearance', 'storegrowth-sales-booster' ),
            status: 'scheduled',
            starts_at: '2026-12-26 00:00:00',
            ends_at: '2027-01-04 23:59:00',
            offers: 1,
            offer_modules: [ 'smart_coupon' ],
            surfaces: 3,
            revenue: null,
            orders: null,
            aov_lift: null,
            module_off: false,
            licence_stopped: false,
        },
        {
            id: 3,
            name: __( 'Summer flash sale', 'storegrowth-sales-booster' ),
            status: 'ended',
            starts_at: '2026-07-10 00:00:00',
            ends_at: '2026-07-13 23:59:00',
            offers: 1,
            offer_modules: [ 'order_bump' ],
            surfaces: 4,
            revenue: 4320,
            orders: 88,
            aov_lift: -2.1,
            module_off: false,
            licence_stopped: false,
        },
    ],
    counts: { all: 3, running: 1, scheduled: 1, ended: 1 },
    summary: {
        revenue: 17160,
        orders: 300,
        store_share: 31.2,
        aov_lift: 12.6,
        best: { surface: 'floating_bar', share: 38 },
        weekly: [ 1280, 2140, 3010, 1660, 4220, 3050, 1800 ].map(
            ( revenue, index ) => {
                return {
                    date: `2026-11-${ String( index * 4 + 1 ).padStart(
                        2,
                        '0'
                    ) }`,
                    revenue,
                };
            }
        ),
    },
    window: 7,
    expired: false,
    price_format: {
        symbol: '$',
        format: '%1$s%2$s',
        decimals: 2,
        decimal_separator: '.',
        thousand_separator: ',',
    },
};
