/**
 * Sales Notification admin data: what PHP prints (`AdminPage`,
 * `window.sales_pop_data`) and the product-source route.
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import type { ProductOption } from '@storegrowth/utilities';

interface SalesPopData {
    fallback_image: string;
    /** `template` → [ popup radius, image radius ] (PHP `TEMPLATE_RADII`). */
    template_radii: Record< string, [ number, number ] >;
}

declare global {
    interface Window {
        sales_pop_data?: Partial< SalesPopData >;
    }
}

export const FALLBACK_IMAGE = window.sales_pop_data?.fallback_image ?? '';

/**
 * The radius settings a template draws with.
 *
 * @since SPSG_VERSION
 *
 * @param template Template id.
 */
export function templateRadii( template: string ) {
    const [ popup, image ] = window.sales_pop_data?.template_radii?.[
        template
    ] ?? [ 8, 8 ];

    return { popup_border_radius: popup, popup_image_border_radius: image };
}

/**
 * The products a source offers (`GET sales-pop/source-products`).
 *
 * @since SPSG_VERSION
 *
 * @param source `orders` or `best_sellers`.
 * @param limit  Most products.
 */
export function fetchSourceProducts(
    source: 'orders' | 'best_sellers',
    limit: number
): Promise< ProductOption[] > {
    return apiFetch< ProductOption[] >( {
        path: addQueryArgs( '/sales-booster/v1/sales-pop/source-products', {
            source,
            limit,
        } ),
    } );
}
