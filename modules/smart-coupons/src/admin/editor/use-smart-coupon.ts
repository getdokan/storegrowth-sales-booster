/**
 * Load, edit and save one Smart Coupon: the shared record editor on the
 * coupons routes.
 *
 * @since 3.1.0
 */
import { __ } from '@wordpress/i18n';
import { type RecordEditor, useRecordEditor } from '@storegrowth/hooks';

import { couponsRoute, type SmartCouponEditorData } from '../api';

export type SmartCouponEditor = RecordEditor< SmartCouponEditorData >;

/** A route's error code → the field it's about. */
const ERROR_FIELDS: Record< string, string > = {
    smart_coupon_missing_title: 'title',
    smart_coupon_missing_code: 'code',
    smart_coupon_code_taken: 'code',
    smart_coupon_invalid_amount: 'amount',
    smart_coupon_missing_tiers: 'tiers',
    smart_coupon_missing_rule: 'bogo_rule',
    smart_coupon_missing_products: 'product_ids',
    smart_coupon_missing_categories: 'category_ids',
    smart_coupon_invalid_minimum_amount: 'minimum_amount',
    smart_coupon_invalid_minimum_quantity: 'minimum_quantity',
    smart_coupon_invalid_dates: 'date_end',
};

const LOAD_ERROR = __(
    'The coupon could not be loaded.',
    'storegrowth-sales-booster'
);

/**
 * @since 3.1.0
 *
 * @param id            Coupon id, or null for a new coupon.
 * @param onCreated     Called with the new coupon's id after it's created.
 * @param campaignRoute A campaign's records route, when editing its version.
 */
export function useSmartCoupon(
    id: number | null,
    onCreated: ( id: number ) => void,
    campaignRoute: string | null = null
): SmartCouponEditor {
    return useRecordEditor< SmartCouponEditorData >( {
        route: campaignRoute ?? couponsRoute(),
        id,
        onCreated,
        errorFields: ERROR_FIELDS,
        loadErrorMessage: LOAD_ERROR,
    } );
}
