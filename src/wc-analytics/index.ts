/**
 * StoreGrowth inside WooCommerce Analytics (ADR-012): a "StoreGrowth offer"
 * filter on the Orders and Products reports (`spsg_offer`, read by
 * `Analytics\WcAnalytics` on the server) and an "Offer" column on the Orders
 * report. Loaded on WooCommerce's admin pages only; WooCommerce's own
 * components draw the filter and table, so no plugin-ui here.
 *
 * @since SPSG_VERSION
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

declare global {
    interface Window {
        spsgWcAnalytics?: { modules: Record< string, string > };
    }
}

/** WooCommerce report filter config (the "Show" style dropdown). */
interface ReportFilter {
    label: string;
    staticParams: string[];
    param: string;
    showFilters: () => boolean;
    defaultValue: string;
    filters: Array< { label: string; value: string } >;
}

/** A table cell. */
interface Cell {
    display: string;
    value: string;
}

/** What `woocommerce_admin_report_table` passes. */
interface ReportTable {
    endpoint: string;
    headers: Array< Record< string, unknown > >;
    rows: Cell[][];
    items?: { data?: Array< Record< string, unknown > > };
}

const PARAM = 'spsg_offer';
const modules = window.spsgWcAnalytics?.modules ?? {};

/**
 * The filter, with the label of its "no filter" choice.
 *
 * @param allLabel Label of the choice that shows everything.
 */
function offerFilter( allLabel: string ): ReportFilter {
    return {
        label: __( 'StoreGrowth offer', 'storegrowth-sales-booster' ),
        // Kept when the filter changes, as WooCommerce's own filters do.
        staticParams: [ 'chartType', 'paged', 'per_page' ],
        param: PARAM,
        showFilters: () => {
            return true;
        },
        defaultValue: 'all',
        filters: [
            { label: allLabel, value: 'all' },
            {
                label: __( 'Any offer', 'storegrowth-sales-booster' ),
                value: 'any',
            },
            ...Object.entries( modules ).map( ( [ value, label ] ) => {
                return { label, value };
            } ),
        ],
    };
}

addFilter(
    'woocommerce_admin_orders_report_filters',
    'storegrowth/offer-filter',
    ( filters: ReportFilter[] ) => {
        return [
            ...filters,
            offerFilter( __( 'All orders', 'storegrowth-sales-booster' ) ),
        ];
    }
);

addFilter(
    'woocommerce_admin_products_report_filters',
    'storegrowth/offer-filter',
    ( filters: ReportFilter[] ) => {
        return [
            ...filters,
            offerFilter( __( 'All products', 'storegrowth-sales-booster' ) ),
        ];
    }
);

addFilter(
    'woocommerce_admin_report_table',
    'storegrowth/offer-column',
    ( table: ReportTable ) => {
        if ( 'orders' !== table.endpoint || ! table.items?.data ) {
            return table;
        }

        const orders = table.items.data;

        return {
            ...table,
            headers: [
                ...table.headers,
                {
                    label: __( 'Offer', 'storegrowth-sales-booster' ),
                    key: PARAM,
                    required: false,
                    isSortable: false,
                },
            ],
            rows: table.rows.map( ( row, index ) => {
                const ids = ( orders[ index ]?.[ PARAM ] ?? [] ) as string[];
                const names = ids
                    .map( ( id ) => {
                        return modules[ id ] ?? id;
                    } )
                    .join( ', ' );

                return [ ...row, { display: names || '—', value: names } ];
            } ),
        };
    }
);
