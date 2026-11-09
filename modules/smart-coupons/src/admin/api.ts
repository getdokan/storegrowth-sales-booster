/**
 * Smart Coupons REST client: the coupons route
 * (`sales-booster/v1/smart-coupons`), read through the shared records client.
 *
 * @since SPSG_VERSION
 */
import { getAdminData, type RecordEditorData } from '@storegrowth/utilities';

/** A coupon as the list shows it (the route returns more). */
export interface SmartCouponRow {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    method: 'automatic' | 'code' | 'link';
    code: string;
    discount_type: 'percentage' | 'fixed' | 'tiers' | 'buy_x_get_y';
    /** Why a coupon that's on isn't running now; empty when it is. */
    chip: string;
    used_in: string;
    uses: number;
    /** In the store's price format. */
    discount_given: string;
}

/** The campaign that sets a coupon's dates. */
export interface CouponCampaign {
    id: number;
    name: string;
    starts_at: string;
    ends_at: string;
}

/** What the editor is drawn from (`GET /smart-coupons/editor`). */
export interface SmartCouponEditorData extends RecordEditorData {
    bogo_active: boolean;
    bogo_rules: Array< { id: number; name: string } >;
    /** The store's currency symbol. */
    currency: string;
}

/**
 * The coupons route.
 *
 * @since SPSG_VERSION
 */
export const couponsRoute = () => {
    return `/${ getAdminData().restNamespace }/smart-coupons`;
};
