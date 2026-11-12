/**
 * Smart Coupons REST client: the coupons route
 * (`sales-booster/v1/smart-coupons`), read through the shared records client.
 *
 * @since SPSG_VERSION
 */
import type { OfferTimelineData } from '@storegrowth/components';
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
    timeline?: OfferTimelineData;
    used_in: string;
    uses: number;
    /** In the store's price format. */
    discount_given: string;
    /** Net sales of the orders that used it, in the store's price format. */
    revenue: string;
}

/** A coupon by id and name. */
export interface CouponRef {
    id: number;
    name: string;
}

/** The campaign that sets a coupon's dates (StoreGrowth Pro). */
export interface CouponCampaign {
    id: number;
    name: string;
    starts_at: string;
    ends_at: string;
    /** Admin route of the campaign. */
    route: string;
}

/** What the editor is drawn from (`GET /smart-coupons/editor`). */
export interface SmartCouponEditorData extends RecordEditorData {
    bogo_active: boolean;
    bogo_rules: Array< { id: number; name: string } >;
    /** The store's currency symbol. */
    currency: string;
    /** Free: the automatic coupon already on (a second one asks to swap). */
    automatic_on: CouponRef | null;
    /** Whether Pro's coupon options run (licence AND StoreGrowth Pro). */
    pro_options: boolean;
}

/**
 * The coupons route.
 *
 * @since SPSG_VERSION
 */
export const couponsRoute = () => {
    return `/${ getAdminData().restNamespace }/smart-coupons`;
};
