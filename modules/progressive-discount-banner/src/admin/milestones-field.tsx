/**
 * Cart Rewards milestones: one row per milestone (threshold, reward and the
 * reward's own setting), the zone warnings, and the upgrade card a second
 * milestone shows on the free plan.
 *
 * @since SPSG_VERSION
 */
import { Button, Notice } from '@wedevs/plugin-ui';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Plus, Trash2 } from 'lucide-react';
import {
    MultiSelectField,
    NumberField,
    SelectField,
} from '@storegrowth/components';
import {
    fetchProductsByIds,
    getHeaderData,
    type ProductOption,
    searchProducts,
} from '@storegrowth/utilities';

import type { Milestone, RewardType } from './types';

export interface ShippingZone {
    name: string;
    has_free_shipping: boolean;
}

/** What the page needs from PHP (`AdminPage::data()`). */
export interface MilestonesData {
    currency: string;
    shipping_zones: ShippingZone[];
    shipping_url: string;
    migrated: boolean;
}

interface WcCoupon {
    id: number;
    code: string;
    meta_data: Array< { key: string; value: unknown } >;
}

const REWARDS: Array< { value: RewardType | 'percentage'; label: string } > = [
    {
        value: 'free-shipping',
        label: __( 'Free shipping', 'storegrowth-sales-booster' ),
    },
    {
        value: 'coupon',
        label: __( 'Coupon', 'storegrowth-sales-booster' ),
    },
    {
        value: 'gift',
        label: __( 'Free gift', 'storegrowth-sales-booster' ),
    },
    {
        value: 'discount-amount',
        label: __( 'Fixed discount', 'storegrowth-sales-booster' ),
    },
    {
        value: 'percentage',
        label: __( 'Percentage discount', 'storegrowth-sales-booster' ),
    },
];

/**
 * A new row, after the last one's threshold.
 *
 * @param last Last row.
 */
function newMilestone( last?: Milestone ): Milestone {
    return {
        id: 0,
        threshold: ( last?.threshold ?? 50 ) + 50,
        reward: 'free-shipping',
        coupon_id: 0,
        gift_product_id: 0,
        discount_mode: 'fixed-amount',
        discount_value: 0,
    };
}

function toOptions( products: ProductOption[] ) {
    return products.map( ( product ) => {
        return { value: product.id, label: product.name };
    } );
}

const productSearch = {
    onSearch: ( search: string ) => {
        return searchProducts( search ).then( toOptions );
    },
    resolve: ( ids: Array< string | number > ) => {
        return fetchProductsByIds( ids.map( Number ) ).then( toOptions );
    },
};

/** Coupons a milestone can show: every code but automatic Smart Coupons. */
function useCoupons() {
    const [ coupons, setCoupons ] = useState<
        Array< { value: string; label: string } >
    >( [] );

    useEffect( () => {
        apiFetch< WcCoupon[] >( {
            path: '/wc/v3/coupons?per_page=100',
        } )
            .then( ( list ) => {
                setCoupons(
                    list
                        .filter( ( coupon ) => {
                            return ! coupon.meta_data.some( ( meta ) => {
                                return (
                                    meta.key === '_spsg_coupon_method' &&
                                    meta.value === 'automatic'
                                );
                            } );
                        } )
                        .map( ( coupon ) => {
                            return {
                                value: String( coupon.id ),
                                label: coupon.code.toUpperCase(),
                            };
                        } )
                );
            } )
            .catch( () => {
                setCoupons( [] );
            } );
    }, [] );

    return coupons;
}

interface RowProps {
    milestone: Milestone;
    index: number;
    currency: string;
    coupons: Array< { value: string; label: string } >;
    onChange: ( next: Milestone ) => void;
    onRemove: () => void;
    canRemove: boolean;
}

/**
 * @param props           Props.
 * @param props.milestone Milestone.
 * @param props.index     Row position.
 * @param props.currency  Currency symbol.
 * @param props.coupons   Coupon choices.
 * @param props.onChange  Change handler.
 * @param props.onRemove  Remove handler.
 * @param props.canRemove Whether the row can be removed.
 */
function MilestoneRow( {
    milestone,
    index,
    currency,
    coupons,
    onChange,
    onRemove,
    canRemove,
}: RowProps ) {
    const isDiscount = milestone.reward === 'discount-amount';
    const rewardValue =
        isDiscount && milestone.discount_mode === 'percentage'
            ? 'percentage'
            : milestone.reward;

    return (
        <div className="flex flex-col gap-3 border-t border-sg-line pt-4 first:border-0 first:pt-0">
            <div className="flex flex-wrap items-end gap-3">
                <span className="pb-2 text-xs text-sg-help">{ index + 1 }</span>
                <div className="min-w-[120px] flex-1">
                    <NumberField
                        label={ __( 'Threshold', 'storegrowth-sales-booster' ) }
                        prefix={ currency }
                        min={ 0 }
                        step={ 0.01 }
                        value={ milestone.threshold }
                        onChange={ ( threshold ) => {
                            onChange( { ...milestone, threshold } );
                        } }
                    />
                </div>
                <div className="min-w-[180px] flex-1">
                    <SelectField
                        label={ __( 'Reward', 'storegrowth-sales-booster' ) }
                        value={ rewardValue }
                        options={ REWARDS }
                        onChange={ ( next ) => {
                            onChange(
                                next === 'percentage'
                                    ? {
                                          ...milestone,
                                          reward: 'discount-amount',
                                          discount_mode: 'percentage',
                                      }
                                    : {
                                          ...milestone,
                                          reward: next as RewardType,
                                          discount_mode: 'fixed-amount',
                                      }
                            );
                        } }
                    />
                </div>
                <Button
                    variant="ghost"
                    disabled={ ! canRemove }
                    aria-label={ __(
                        'Remove milestone',
                        'storegrowth-sales-booster'
                    ) }
                    onClick={ onRemove }
                >
                    <Trash2 className="size-4" aria-hidden />
                </Button>
            </div>

            { milestone.reward === 'gift' && (
                <MultiSelectField
                    label={ __( 'Gift product', 'storegrowth-sales-booster' ) }
                    max={ 1 }
                    value={
                        milestone.gift_product_id
                            ? [ milestone.gift_product_id ]
                            : []
                    }
                    onChange={ ( values ) => {
                        onChange( {
                            ...milestone,
                            gift_product_id: Number( values[ 0 ] ?? 0 ),
                        } );
                    } }
                    { ...productSearch }
                />
            ) }

            { milestone.reward === 'coupon' && (
                <SelectField
                    label={ __( 'Coupon', 'storegrowth-sales-booster' ) }
                    placeholder={ __(
                        'Choose a coupon',
                        'storegrowth-sales-booster'
                    ) }
                    value={
                        milestone.coupon_id ? String( milestone.coupon_id ) : ''
                    }
                    options={ coupons }
                    onChange={ ( next ) => {
                        onChange( {
                            ...milestone,
                            coupon_id: Number( next ),
                        } );
                    } }
                />
            ) }

            { isDiscount && (
                <NumberField
                    label={ __( 'Amount', 'storegrowth-sales-booster' ) }
                    prefix={
                        milestone.discount_mode === 'fixed-amount'
                            ? currency
                            : undefined
                    }
                    suffix={
                        milestone.discount_mode === 'percentage'
                            ? '%'
                            : undefined
                    }
                    min={ 0 }
                    step={ 0.01 }
                    value={ milestone.discount_value }
                    onChange={ ( amount ) => {
                        onChange( { ...milestone, discount_value: amount } );
                    } }
                />
            ) }
        </div>
    );
}

export interface MilestonesFieldProps {
    value: Milestone[];
    onChange: ( next: Milestone[] ) => void;
    data: MilestonesData;
    isPro: boolean;
    error?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.value    Milestones.
 * @param props.onChange Change handler.
 * @param props.data     Page data.
 * @param props.isPro    Pro is active.
 * @param props.error    Save error.
 */
export function MilestonesField( {
    value,
    onChange,
    data,
    isPro,
    error,
}: MilestonesFieldProps ) {
    const [ showUpgrade, setShowUpgrade ] = useState( false );
    const coupons = useCoupons();
    const usesFreeShipping = value.some( ( milestone ) => {
        return milestone.reward === 'free-shipping';
    } );
    const zonesWithout = data.shipping_zones.filter( ( zone ) => {
        return ! zone.has_free_shipping;
    } );

    const update = ( index: number, next: Milestone ) => {
        onChange(
            value.map( ( milestone, position ) => {
                return position === index ? next : milestone;
            } )
        );
    };

    return (
        <div className="flex w-full flex-col gap-4">
            { usesFreeShipping &&
                zonesWithout.map( ( zone ) => {
                    return (
                        <Notice key={ zone.name } variant="warning">
                            { sprintf(
                                /* translators: %s: shipping zone name. */
                                __(
                                    'Your %s zone has no Free shipping method, so this reward won’t apply there.',
                                    'storegrowth-sales-booster'
                                ),
                                zone.name
                            ) }{ ' ' }
                            <a href={ data.shipping_url }>
                                { __(
                                    'Open shipping settings',
                                    'storegrowth-sales-booster'
                                ) }
                            </a>
                        </Notice>
                    );
                } ) }

            <div className="flex flex-col gap-4">
                { value.map( ( milestone, index ) => {
                    return (
                        <MilestoneRow
                            key={ milestone.id || `new-${ index }` }
                            milestone={ milestone }
                            index={ index }
                            currency={ data.currency }
                            coupons={ coupons }
                            canRemove={ value.length > 1 }
                            onChange={ ( next ) => {
                                update( index, next );
                            } }
                            onRemove={ () => {
                                onChange(
                                    value.filter( ( _, position ) => {
                                        return position !== index;
                                    } )
                                );
                            } }
                        />
                    );
                } ) }
            </div>

            { error && <p className="m-0 text-xs text-red-600">{ error }</p> }

            <div>
                <Button
                    variant="outline"
                    onClick={ () => {
                        if ( ! isPro && value.length >= 1 ) {
                            setShowUpgrade( true );
                            return;
                        }

                        onChange( [
                            ...value,
                            newMilestone( value[ value.length - 1 ] ),
                        ] );
                    } }
                >
                    <Plus className="size-4" aria-hidden />
                    { __( 'Add milestone', 'storegrowth-sales-booster' ) }
                </Button>
            </div>

            { showUpgrade && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-sg-stroke p-4">
                    <div>
                        <p className="m-0 text-sm font-medium text-sg-text">
                            { __(
                                'More milestones',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                        <p className="m-0 text-xs text-sg-help">
                            { __(
                                'Stack free shipping, gifts and coupons at different cart totals.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    </div>
                    <Button
                        onClick={ () => {
                            window.open(
                                getHeaderData().header_info.upgrade_url,
                                '_blank',
                                'noopener,noreferrer'
                            );
                        } }
                    >
                        { __( 'Upgrade to Pro', 'storegrowth-sales-booster' ) }
                    </Button>
                </div>
            ) }

            <p className="m-0 text-xs text-sg-help">
                { __(
                    'Thresholds use the cart subtotal after discounts, with or without tax as your store shows prices.',
                    'storegrowth-sales-booster'
                ) }
            </p>
            { data.migrated && (
                <p className="m-0 text-xs text-sg-help">
                    { __(
                        'Existing Free Shipping Rules became milestone 1.',
                        'storegrowth-sales-booster'
                    ) }
                </p>
            ) }
        </div>
    );
}
