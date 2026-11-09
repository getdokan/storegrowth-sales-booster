/**
 * Campaigns REST client (`sales-booster/v1/campaigns`, ADR-016).
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { getAdminData, type PriceFormat } from '@storegrowth/utilities';

export type CampaignStatus =
    | 'draft'
    | 'scheduled'
    | 'running'
    | 'paused'
    | 'ended';

export type OfferKind = 'smart_coupon' | 'bogo' | 'order_bump';

/** A campaign in the list. */
export interface CampaignRow {
    id: number;
    name: string;
    status: CampaignStatus;
    starts_at: string | null;
    ends_at: string | null;
    offers: number;
    offer_modules: OfferKind[];
    surfaces: number;
    revenue: number | null;
    orders: number | null;
    aov_lift: number | null;
    module_off: boolean;
    licence_stopped: boolean;
}

/** The list response. */
export interface CampaignList {
    items: CampaignRow[];
    counts: Record< string, number >;
    summary: {
        revenue: number;
        orders: number;
        store_share: number;
        aov_lift: number | null;
        best: { surface: string; share: number };
        weekly: Array< { date: string; revenue: number } >;
    };
    window: number;
    expired: boolean;
    price_format: PriceFormat;
}

/** One readiness line. */
export interface ReadinessLine {
    kind: 'blocking' | 'warning' | 'info';
    code: string;
    message: string;
    fix: string;
}

/** An offer on a campaign's rail. */
export interface CampaignOffer {
    row: number;
    kind: OfferKind;
    offer_id: number;
    name: string;
    attached: boolean;
    customised: boolean;
    /** A campaign-only Smart Coupon's real coupon, edited as a coupon. */
    coupon_id: number;
}

/** A surface's saved state. */
export interface SurfaceSetting {
    enabled: boolean;
    copy: string;
}

/** A campaign's settings. */
export interface CampaignSettings {
    campaign_price?: {
        percent?: number;
        products?: number[];
        categories?: number[];
    };
    surfaces?: Record< string, SurfaceSetting >;
    products?: number[];
    categories?: number[];
    baseline?: Record< string, number >;
}

/** The report card's figures. */
export interface CampaignReport {
    revenue: number;
    orders: number;
    aov: number;
    aov_change: number | null;
    acceptance: number | null;
    daily: Record< string, number >;
    surfaces: Record< string, number >;
    store: { revenue: number; change: number | null } | null;
}

/** One campaign, as its page loads it. */
export interface CampaignDetail {
    id: number;
    name: string;
    status: CampaignStatus;
    starts_at: string | null;
    ends_at: string | null;
    paused_at: string | null;
    slug: string;
    settings: CampaignSettings;
    offers: CampaignOffer[];
    scope: {
        all: boolean;
        products: number[];
        categories: number[];
        derived: boolean;
    };
    checks: ReadinessLine[];
    report: CampaignReport;
    can_publish: boolean;
    timezone: string;
    home_url: string;
    window: number;
    read_only: boolean;
    price_format: PriceFormat;
}

/** A template in the New campaign dialog. */
export interface CampaignTemplate {
    name: string;
    percent: number;
    coupon: boolean;
    surfaces: string[];
}

/** An attachable offer. */
export interface AttachableOffer {
    id: number;
    name: string;
    in: string;
    disabled: boolean;
}

/** The base REST path. */
function base(): string {
    return `/${ getAdminData().restNamespace }/campaigns`;
}

/**
 * The list and its figures.
 *
 * @param range `30`, `90` or `year`.
 */
export function fetchCampaigns( range: string ): Promise< CampaignList > {
    return apiFetch( { path: addQueryArgs( base(), { range } ) } );
}

/** The templates. */
export function fetchTemplates(): Promise<
    Record< string, CampaignTemplate >
> {
    return apiFetch( { path: `${ base() }/templates` } );
}

/**
 * Create a draft.
 *
 * @param template Template id, empty for blank.
 * @param name     Name.
 */
export function createCampaign(
    template: string,
    name: string
): Promise< CampaignDetail > {
    return apiFetch( {
        path: base(),
        method: 'POST',
        data: { template, name },
    } );
}

/**
 * One campaign.
 *
 * @param id Campaign id.
 */
export function fetchCampaign( id: number ): Promise< CampaignDetail > {
    return apiFetch( { path: `${ base() }/${ id }` } );
}

/**
 * Save name, dates or settings.
 *
 * @param id   Campaign id.
 * @param data Values.
 */
export function saveCampaign(
    id: number,
    data: Partial<
        Pick< CampaignDetail, 'name' | 'starts_at' | 'ends_at' | 'settings' >
    >
): Promise< CampaignDetail > {
    return apiFetch( { path: `${ base() }/${ id }`, method: 'POST', data } );
}

/**
 * Publish, unpublish, pause, resume, end or clone.
 *
 * @param id     Campaign id.
 * @param action Action.
 */
export function runAction(
    id: number,
    action: string
): Promise< CampaignDetail > {
    return apiFetch( {
        path: `${ base() }/${ id }/${ action }`,
        method: 'POST',
    } );
}

/**
 * What a delete would remove.
 *
 * @param id Campaign id.
 */
export function deletePreview(
    id: number
): Promise< { campaign_only: string[] } > {
    return apiFetch( { path: `${ base() }/${ id }/delete-preview` } );
}

/**
 * Delete a campaign.
 *
 * @param id Campaign id.
 */
export function deleteCampaign( id: number ): Promise< unknown > {
    return apiFetch( { path: `${ base() }/${ id }`, method: 'DELETE' } );
}

/**
 * Offers that can be attached, by kind.
 *
 * @param id Campaign id.
 */
export function fetchAttachable(
    id: number
): Promise< Record< OfferKind, AttachableOffer[] > > {
    return apiFetch( { path: `${ base() }/${ id }/attachable` } );
}

/**
 * Attach an everyday offer.
 *
 * @param id      Campaign id.
 * @param kind    Offer kind.
 * @param offerId Offer id.
 */
export function attachOffer(
    id: number,
    kind: OfferKind,
    offerId: number
): Promise< CampaignDetail > {
    return apiFetch( {
        path: `${ base() }/${ id }/offers`,
        method: 'POST',
        data: { kind, offer_id: offerId },
    } );
}

/**
 * Remove an offer; a campaign-only one can be kept as everyday.
 *
 * @param id   Campaign id.
 * @param row  Offer row.
 * @param keep Keep a campaign-only offer as everyday.
 */
export function removeOffer(
    id: number,
    row: number,
    keep: boolean
): Promise< CampaignDetail > {
    return apiFetch( {
        path: addQueryArgs( `${ base() }/${ id }/offers/${ row }`, {
            keep: keep ? 1 : 0,
        } ),
        method: 'DELETE',
    } );
}

/**
 * The records route an editor uses for a campaign's version of an offer.
 *
 * @param id   Campaign id.
 * @param kind Offer kind.
 */
export function campaignRecordRoute( id: number, kind: OfferKind ): string {
    return `${ base() }/${ id }/records/${ kind }`;
}
