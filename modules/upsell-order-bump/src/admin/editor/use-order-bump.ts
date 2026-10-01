/**
 * Load, edit and save one order bump for the editor (ADR-010): the shared
 * record editor (`useRecordEditor`) on the order bump routes, with the bump's
 * rules and what the preview and the page need.
 *
 * The editor's keys are flat; the routes keep the design in
 * `design_settings` (merged key by key on update), so a key that isn't a
 * column is read from and sent in it.
 *
 * @since SPSG_VERSION
 */
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    type RecordEditor,
    type RecordRule,
    type RecordValues,
    useRecordEditor,
} from '@storegrowth/hooks';
import {
    type Currency,
    NO_CURRENCY,
    type RecordData,
} from '@storegrowth/utilities';

import { type BumpEditor, bumpsRoute } from '../api';

export interface OrderBumpEditor extends RecordEditor< BumpEditor > {
    /** False while lite's limit stops a new bump (the server decides). */
    canCreate: boolean;
    /** The store's price format, for the preview. */
    currency: Currency;
    /** The cart adjusts prices for tax (the preview doesn't). */
    taxAdjusted: boolean;
    /** The checkout box's image for a product without one. */
    fallbackImage: string;
}

/** Largest fixed price (the `offer_amount` column, as the routes check). */
export const MAX_PRICE = 99999999.99;

/** The bump's columns; any other key lives in `design_settings`. */
const COLUMNS = [
    'name',
    'status',
    'target_type',
    'target_products',
    'target_categories',
    'offer_product_id',
    'offer_type',
    'offer_amount',
    'offer_discount_title',
];

/**
 * A bump from the routes with its design keys beside the columns.
 *
 * @param record Bump as the routes return it.
 */
function fromRecord( record: RecordData ): RecordData {
    return {
        ...( ( record.design_settings as RecordData | undefined ) ?? {} ),
        ...Object.fromEntries(
            COLUMNS.filter( ( key ) => {
                return key in record;
            } ).map( ( key ) => {
                return [ key, record[ key ] ];
            } )
        ),
    };
}

/**
 * Changed values as the routes take them: the design keys in
 * `design_settings`.
 *
 * @param values Changed values.
 */
function toRecord( values: RecordValues ): RecordData {
    const data: RecordData = {};
    const design: RecordData = {};

    Object.entries( values ).forEach( ( [ key, value ] ) => {
        if ( COLUMNS.includes( key ) ) {
            data[ key ] = value;
        } else {
            design[ key ] = value;
        }
    } );

    if ( Object.keys( design ).length ) {
        data.design_settings = design;
    }

    return data;
}

/**
 * The routes' rules (`check_bump_rules()`), checked before saving, each with
 * the keys it reads; the first is the field it marks.
 */
const RULES: RecordRule[] = [
    {
        keys: [ 'name' ],
        broken: ( values ) => {
            return ! String( values.name ?? '' ).trim();
        },
        message: __(
            'Enter a name for the order bump.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'target_products', 'target_type' ],
        broken: ( values ) => {
            return (
                values.target_type === 'products' &&
                ! ( values.target_products as number[] )?.length
            );
        },
        message: __(
            'Select at least one target product.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'target_categories', 'target_type' ],
        broken: ( values ) => {
            return (
                values.target_type === 'categories' &&
                ! ( values.target_categories as number[] )?.length
            );
        },
        message: __(
            'Select at least one target category.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'offer_product_id' ],
        broken: ( values ) => {
            return ! Number( values.offer_product_id );
        },
        message: __( 'Select the offer product.', 'storegrowth-sales-booster' ),
    },
    {
        keys: [ 'offer_amount', 'offer_type' ],
        broken: ( values ) => {
            const amount = Number( values.offer_amount );

            return (
                values.offer_type === 'discount' &&
                ( ! ( amount > 0 ) || amount > 100 )
            );
        },
        message: __(
            'Enter a discount of more than 0 and at most 100%.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'offer_amount', 'offer_type' ],
        broken: ( values ) => {
            const amount = Number( values.offer_amount );

            return (
                values.offer_type === 'price' &&
                ! ( amount >= 0 && amount <= MAX_PRICE )
            );
        },
        message: __(
            'Enter a price from 0 to 99,999,999.99.',
            'storegrowth-sales-booster'
        ),
    },
];

/**
 * A route's error code → the field it's about; a missing target is the
 * picker of the bump's type.
 */
const ERROR_FIELDS: Record<
    string,
    string | ( ( values: RecordValues ) => string )
> = {
    order_bump_missing_name: 'name',
    order_bump_missing_target: ( values ) => {
        return values.target_type === 'categories'
            ? 'target_categories'
            : 'target_products';
    },
    order_bump_invalid_offer_product: 'offer_product_id',
    order_bump_invalid_discount: 'offer_amount',
    order_bump_invalid_price: 'offer_amount',
};

const LOAD_ERROR = __(
    'The order bump could not be loaded.',
    'storegrowth-sales-booster'
);

/**
 * @since SPSG_VERSION
 *
 * @param id        Bump id, or null for a new bump.
 * @param onCreated Called with the new bump's id after it's created.
 */
export function useOrderBump(
    id: number | null,
    onCreated: ( id: number ) => void
): OrderBumpEditor {
    const bump = useRecordEditor< BumpEditor >( {
        route: bumpsRoute(),
        id,
        onCreated,
        rules: RULES,
        errorFields: ERROR_FIELDS,
        loadErrorMessage: LOAD_ERROR,
        fromRecord,
        toRecord,
    } );

    return useMemo( () => {
        return {
            ...bump,
            canCreate: bump.editor?.can_create ?? true,
            currency: bump.editor?.currency ?? NO_CURRENCY,
            taxAdjusted: Boolean( bump.editor?.tax_adjusted ),
            fallbackImage: bump.editor?.fallback_image_url ?? '',
        };
    }, [ bump ] );
}
