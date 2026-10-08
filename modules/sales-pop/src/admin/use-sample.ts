/**
 * What the Sales Notification preview and template thumbnails show: the
 * first name, location and chosen product of the current settings.
 *
 * @since SPSG_VERSION
 */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    assetUrl,
    fetchProductsByIds,
    type ProductOption,
} from '@storegrowth/utilities';

import { FALLBACK_IMAGE } from './data';
import type { ToastSample } from './preview/sales-pop-toast';
import type { SalesPopValues } from './types';

/** Products already asked for, so the preview and the picker share one request. */
const products = new Map< number, Promise< ProductOption | undefined > >();

/**
 * One product by id (cached; a failed request is asked again next time).
 *
 * @param id Product id.
 */
const loadProduct = ( id: number ) => {
    if ( ! products.has( id ) ) {
        products.set(
            id,
            fetchProductsByIds( [ id ] )
                .then( ( [ product ] ) => {
                    return product;
                } )
                .catch( () => {
                    products.delete( id );
                    return undefined;
                } )
        );
    }

    return products.get( id ) as Promise< ProductOption | undefined >;
};

/**
 * @since SPSG_VERSION
 *
 * @param values Current (unsaved) settings.
 */
export function useSample( values: SalesPopValues ): ToastSample {
    const [ product, setProduct ] = useState< ProductOption >();
    const firstId = ( values.popup_products ?? [] )[ 0 ];

    useEffect( () => {
        let current = true;

        if ( ! firstId ) {
            setProduct( undefined );
            return;
        }

        loadProduct( firstId ).then( ( next ) => {
            if ( current ) {
                setProduct( next );
            }
        } );

        return () => {
            current = false;
        };
    }, [ firstId ] );

    return {
        name:
            values.virtual_name?.[ 0 ] ||
            __( 'Someone', 'storegrowth-sales-booster' ),
        product:
            product?.name ||
            __( 'Your product name', 'storegrowth-sales-booster' ),
        // A chosen product without an image gets the storefront's fallback.
        image: product
            ? product.image || FALLBACK_IMAGE
            : assetUrl( 'images/preview/product.jpeg' ),
        location:
            values.virtual_locations?.[ 0 ] || 'New York City, New York, USA',
        minutes: 15,
    };
}
