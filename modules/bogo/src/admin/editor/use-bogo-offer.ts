/**
 * Load, edit and save one BOGO offer for the editor (ADR-010): the shared
 * record editor (`useRecordEditor`) on the BOGO routes, with the offer's
 * rules, the vendor's deal types and what the preview and the page need.
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
import { type Currency, NO_CURRENCY } from '@storegrowth/utilities';

import { offersRoute, type OfferEditor } from '../api';

export type OfferValues = RecordValues;

export interface BogoOffer extends RecordEditor< OfferEditor > {
    /** False while lite's limit stops a new offer (the server decides). */
    canCreate: boolean;
    /** The store's price format, for the preview. */
    currency: Currency;
    /** A product offer ("Specific"): its product's edit screen. */
    productEditUrl: string;
    /** The offer is a product offer ("Specific"). */
    productOffer: boolean;
    /** The global "Show Regular Price" setting, for the preview. */
    showRegularPrice: boolean;
}

/**
 * Rules the routes don't check (the old editor checked them before saving),
 * each with the keys it reads; the first is the field it marks.
 */
const RULES: RecordRule[] = [
    {
        keys: [ 'name_of_order_bogo' ],
        broken: ( values ) => {
            return ! String( values.name_of_order_bogo ?? '' ).trim();
        },
        message: __(
            'Enter a name for the offer.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'offered_products' ],
        broken: ( values ) => {
            return ! ( values.offered_products as number[] )?.length;
        },
        message: __(
            'Select at least one target product.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'get_different_product_field', 'bogo_deal_type' ],
        broken: ( values ) => {
            return (
                values.bogo_deal_type === 'different' &&
                ! values.get_different_product_field
            );
        },
        message: __( 'Select the offer product.', 'storegrowth-sales-booster' ),
    },
    {
        keys: [ 'discount_amount', 'offer_type' ],
        broken: ( values ) => {
            const amount = Number( values.discount_amount );

            return (
                values.offer_type === 'discount' &&
                ( ! ( amount > 0 ) || amount > 100 )
            );
        },
        message: __(
            'Enter a discount from 1 to 100%.',
            'storegrowth-sales-booster'
        ),
    },
    {
        keys: [ 'offer_end', 'offer_start' ],
        broken: ( values ) => {
            return Boolean(
                values.offer_start &&
                    values.offer_end &&
                    values.offer_end < values.offer_start
            );
        },
        message: __(
            'The end date is before the start date.',
            'storegrowth-sales-booster'
        ),
    },
];

/** A route's error code → the field it's about. */
const ERROR_FIELDS: Record< string, string > = {
    missing_name_of_order_bogo: 'name_of_order_bogo',
    bogo_same_product: 'get_different_product_field',
    bogo_offer_exists: 'offered_products',
    bogo_missing_target: 'offered_products',
    bogo_missing_offer_product: 'get_different_product_field',
    bogo_invalid_discount: 'discount_amount',
    bogo_invalid_dates: 'offer_end',
};

const LOAD_ERROR = __(
    'The offer could not be loaded.',
    'storegrowth-sales-booster'
);

/**
 * A Dokan vendor chooses Buy X Get X only while the admin allows it; an
 * offer that already is one keeps it.
 *
 * @param editor The editor route's response.
 * @param values The offer's values.
 */
function vendorSchema( editor: OfferEditor, values: OfferValues ) {
    const deal = editor.schema.bogo_deal_type;

    if (
        editor.buy_x_get_x !== false ||
        ! deal?.options ||
        values.bogo_deal_type === 'same'
    ) {
        return editor.schema;
    }

    return {
        ...editor.schema,
        bogo_deal_type: {
            ...deal,
            options: deal.options.filter( ( option ) => {
                return option !== 'same';
            } ),
        },
    };
}

/**
 * @since SPSG_VERSION
 *
 * @param id        Offer id, or null for a new offer.
 * @param onCreated Called with the new offer's id after it's created.
 * @param vendor    The Dokan vendor's offer (`/bogo/offers/vendor`).
 */
export function useBogoOffer(
    id: number | null,
    onCreated: ( id: number ) => void,
    vendor = false
): BogoOffer {
    const offer = useRecordEditor< OfferEditor >( {
        route: offersRoute( vendor ),
        id,
        onCreated,
        rules: RULES,
        errorFields: ERROR_FIELDS,
        loadErrorMessage: LOAD_ERROR,
        schema: vendorSchema,
    } );

    return useMemo( () => {
        const productOffer = offer.record?.type === 'product';

        return {
            ...offer,
            canCreate: offer.editor?.can_create ?? true,
            currency: offer.editor?.currency ?? NO_CURRENCY,
            productEditUrl: productOffer
                ? String( offer.record?.edit_url ?? '' )
                : '',
            productOffer,
            showRegularPrice: Boolean( offer.editor?.show_regular_price ),
        };
    }, [ offer ] );
}
