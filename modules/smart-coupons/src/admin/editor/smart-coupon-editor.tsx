/**
 * Smart Coupon editor at `#/smart-coupons/new` and `#/smart-coupons/<id>`:
 * the generated settings page drawn from the editor's schema (PHP
 * `SmartCouponFields`, ADR-010), one card per section, with the method and
 * type cards, the product and category pickers and the right rail drawn here.
 *
 * @since SPSG_VERSION
 */
import { Button } from '@wedevs/plugin-ui';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
    Link2,
    Percent,
    Ticket,
    Trash2,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
    CardHead,
    FeatureLayout,
    ModuleSettingsPage,
    MultiSelectField,
    type MultiSelectOption,
    NumberField,
    CampaignBanner,
    type OfferTimelineData,
    PickerCards,
    ProBadge,
    SelectField,
    VersionHeader,
} from '@storegrowth/components';
import {
    Navigate,
    useCampaignVersion,
    useModules,
    useNavigate,
} from '@storegrowth/hooks';
import {
    fetchProductCategories,
    fetchProductsByIds,
    getHeaderData,
    type ProductOption,
    searchProducts,
} from '@storegrowth/utilities';

import { type CouponCampaign } from '../api';
import { CouponSummary } from './coupon-summary';
import { type SmartCouponEditor, useSmartCoupon } from './use-smart-coupon';

/** The BOGO module's id. */
const BOGO_ID = 'bogo';

/** Most quantity tiers a coupon can have. */
const MAX_TIERS = 6;

/**
 * @param products Products.
 */
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

/**
 * Every product category, as picker options (loaded once).
 */
function useCategoryOptions() {
    const [ options, setOptions ] = useState< MultiSelectOption[] >( [] );

    useEffect( () => {
        let cancelled = false;

        fetchProductCategories()
            .then( ( categories ) => {
                if ( ! cancelled ) {
                    setOptions(
                        categories.map( ( category ) => {
                            return {
                                value: Number( category.value ),
                                label: category.label,
                            };
                        } )
                    );
                }
            } )
            .catch( () => {
                // The picker stays empty; a save still checks the ids.
            } );

        return () => {
            cancelled = true;
        };
    }, [] );

    return options;
}

/**
 * A card's miniature: its icon.
 *
 * @param Icon Icon.
 */
function iconArt( Icon: LucideIcon ): ReactNode {
    return <Icon className="mx-auto size-5 text-sg-text" aria-hidden />;
}

interface TierRow {
    qty: number;
    percent: number;
}

/**
 * Tiers as the route stores them (`qty:percent` strings) and as the rows
 * below read them.
 *
 * @param tiers Stored tiers.
 */
function readTiers( tiers: string[] ): TierRow[] {
    return tiers.map( ( tier ) => {
        const [ qty, percent ] = tier.split( ':' ).map( Number );

        return { qty, percent };
    } );
}

/**
 * @param rows Tier rows.
 */
function writeTiers( rows: TierRow[] ): string[] {
    return rows.map( ( row ) => {
        return `${ row.qty }:${ row.percent }`;
    } );
}

/**
 * The rows of a Buy more save more coupon.
 *
 * @param props          Props.
 * @param props.tiers    Stored tiers.
 * @param props.onChange Change handler.
 * @param props.error    Error from the last save.
 */
function TierRows( {
    tiers,
    onChange,
    error,
}: {
    tiers: string[];
    onChange: ( tiers: string[] ) => void;
    error?: string;
} ) {
    const rows = readTiers( tiers );

    const update = ( index: number, next: TierRow ) => {
        onChange(
            writeTiers(
                rows.map( ( row, rowIndex ) => {
                    return rowIndex === index ? next : row;
                } )
            )
        );
    };

    return (
        <div className="flex w-full flex-col gap-2">
            { rows.map( ( row, index ) => {
                return (
                    <div key={ index } className="flex items-end gap-2">
                        <NumberField
                            label={ __(
                                'Quantity',
                                'storegrowth-sales-booster'
                            ) }
                            value={ row.qty }
                            min={ 1 }
                            onChange={ ( qty ) => {
                                update( index, { ...row, qty } );
                            } }
                        />
                        <NumberField
                            label={ __(
                                'Percent off',
                                'storegrowth-sales-booster'
                            ) }
                            value={ row.percent }
                            min={ 1 }
                            max={ 100 }
                            suffix="%"
                            onChange={ ( percent ) => {
                                update( index, { ...row, percent } );
                            } }
                        />
                        <Button
                            variant="ghost"
                            aria-label={ __(
                                'Remove tier',
                                'storegrowth-sales-booster'
                            ) }
                            onClick={ () => {
                                onChange(
                                    writeTiers(
                                        rows.filter( ( _row, rowIndex ) => {
                                            return rowIndex !== index;
                                        } )
                                    )
                                );
                            } }
                        >
                            <Trash2 className="size-4" aria-hidden />
                        </Button>
                    </div>
                );
            } ) }
            { rows.length < MAX_TIERS && (
                <Button
                    variant="outline"
                    onClick={ () => {
                        const last = rows[ rows.length - 1 ];

                        onChange(
                            writeTiers( [
                                ...rows,
                                {
                                    qty: ( last?.qty ?? 0 ) + 2,
                                    percent: ( last?.percent ?? 5 ) + 5,
                                },
                            ] )
                        );
                    } }
                >
                    { __( 'Add row', 'storegrowth-sales-booster' ) }
                </Button>
            ) }
            { error && (
                <p role="alert" className="m-0 text-xs text-destructive">
                    { error }
                </p>
            ) }
        </div>
    );
}

/**
 * The locked Active dates panel of a campaign-only coupon.
 *
 * @param props          Props.
 * @param props.campaign Its campaign.
 * @param props.navigate Router.
 */
function CampaignDates( {
    campaign,
    navigate,
}: {
    campaign: CouponCampaign;
    navigate: ( path: string ) => void;
} ) {
    return (
        <div className="flex w-full items-center justify-between gap-3 rounded-lg bg-sg-chip px-3 py-2.5 text-sm text-sg-text">
            <span>
                { sprintf(
                    /* translators: 1: campaign name, 2: start, 3: end. */
                    __(
                        'Set by campaign: %1$s, %2$s to %3$s',
                        'storegrowth-sales-booster'
                    ),
                    campaign.name,
                    campaign.starts_at,
                    campaign.ends_at
                ) }
            </span>
            <Button
                variant="link"
                onClick={ () => {
                    navigate( `/campaigns/${ campaign.id }` );
                } }
            >
                { __( 'Open campaign', 'storegrowth-sales-booster' ) }
            </Button>
        </div>
    );
}

/**
 * Controls the page draws instead of the schema's.
 *
 * @param coupon     The editor's coupon.
 * @param categories Category options.
 * @param navigate   Router.
 * @param bogoOn     Whether the BOGO module is on.
 * @param enableBogo Turn the BOGO module on.
 */
function controls(
    coupon: SmartCouponEditor,
    categories: MultiSelectOption[],
    navigate: ( path: string ) => void,
    bogoOn: boolean,
    enableBogo: () => void
) {
    const { values, schema, setValue, errors, editor, record } = coupon;
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );
    const currency = editor?.currency ?? '';
    const type = String( values.discount_type );
    const isFixed = type === 'fixed';
    const ruleId = Number( values.bogo_rule ) || 0;
    const rule = editor?.bogo_rules.find( ( item ) => {
        return item.id === ruleId;
    } );
    const campaign = record?.campaign as CouponCampaign | null | undefined;
    const usesCode = values.method !== 'automatic';

    return {
        method: (
            <PickerCards
                label={ schema.method?.label ?? '' }
                columns={ 3 }
                value={ String( values.method ) }
                onChange={ ( next ) => {
                    setValue( 'method', next );
                } }
                options={ [
                    {
                        value: 'automatic',
                        label: __( 'Automatic', 'storegrowth-sales-booster' ),
                        art: iconArt( Zap ),
                    },
                    {
                        value: 'code',
                        label: __(
                            'Discount code',
                            'storegrowth-sales-booster'
                        ),
                        art: iconArt( Ticket ),
                    },
                    {
                        value: 'link',
                        label: __( 'Link', 'storegrowth-sales-booster' ),
                        art: iconArt( Link2 ),
                        locked: ! isPro,
                    },
                ] }
            />
        ),
        discount_type: (
            <div className="flex w-full flex-col gap-3">
                <PickerCards
                    label={ schema.discount_type?.label ?? '' }
                    columns={ 2 }
                    value={ type }
                    onChange={ ( next ) => {
                        setValue( 'discount_type', next );
                    } }
                    options={ [
                        {
                            value: 'percentage',
                            label: __(
                                'Percentage',
                                'storegrowth-sales-booster'
                            ),
                            art: iconArt( Percent ),
                        },
                        {
                            value: 'fixed',
                            label: __(
                                'Fixed amount',
                                'storegrowth-sales-booster'
                            ),
                            art: iconArt( Ticket ),
                        },
                        {
                            value: 'tiers',
                            label: __(
                                'Buy more save more',
                                'storegrowth-sales-booster'
                            ),
                            art: iconArt( Percent ),
                            locked: ! isPro,
                        },
                        {
                            value: 'buy_x_get_y',
                            label: bogoOn
                                ? __(
                                      'Buy X get Y · uses the BOGO module',
                                      'storegrowth-sales-booster'
                                  )
                                : __(
                                      'Buy X get Y · BOGO module is off',
                                      'storegrowth-sales-booster'
                                  ),
                            art: iconArt( Zap ),
                            locked: ! bogoOn,
                            badge: false,
                        },
                    ] }
                />
                { ! bogoOn && (
                    <Button variant="outline" onClick={ enableBogo }>
                        { __( 'Enable BOGO', 'storegrowth-sales-booster' ) }
                    </Button>
                ) }
                { type === 'fixed' && (
                    <p className="m-0 text-xs text-sg-help">
                        { __(
                            'Taken off the cart, split across eligible products by price.',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                ) }
            </div>
        ),
        amount: (
            <NumberField
                label={
                    isFixed
                        ? __( 'Amount off', 'storegrowth-sales-booster' )
                        : __( 'Percent off', 'storegrowth-sales-booster' )
                }
                value={ Number( values.amount ) || 0 }
                onChange={ ( next ) => {
                    setValue( 'amount', next );
                } }
                min={ 0 }
                max={ isFixed ? undefined : 100 }
                step={ isFixed ? 0.01 : 1 }
                prefix={ isFixed ? currency : undefined }
                suffix={ isFixed ? undefined : '%' }
                error={ errors.amount }
            />
        ),
        tiers: (
            <TierRows
                tiers={ ( values.tiers as string[] ) ?? [] }
                onChange={ ( next ) => {
                    setValue( 'tiers', next );
                } }
                error={ errors.tiers }
            />
        ),
        bogo_rule: (
            <div className="flex w-full flex-col gap-2">
                <SelectField
                    label={ schema.bogo_rule?.label ?? '' }
                    placeholder={ __(
                        'Choose a BOGO rule',
                        'storegrowth-sales-booster'
                    ) }
                    value={ ruleId ? String( ruleId ) : '' }
                    options={ ( editor?.bogo_rules ?? [] ).map( ( item ) => {
                        return {
                            value: String( item.id ),
                            label: item.name,
                        };
                    } ) }
                    onChange={ ( next ) => {
                        setValue( 'bogo_rule', Number( next ) );
                    } }
                    error={ errors.bogo_rule }
                />
                { rule && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-sg-text">
                        <span>
                            { sprintf(
                                /* translators: %s: BOGO rule name. */
                                __(
                                    'Deal defined by BOGO rule: %s',
                                    'storegrowth-sales-booster'
                                ),
                                rule.name
                            ) }
                        </span>
                        <Button
                            variant="link"
                            onClick={ () => {
                                navigate( `/bogo/${ rule.id }` );
                            } }
                        >
                            { __( 'Edit deal', 'storegrowth-sales-booster' ) }
                        </Button>
                    </div>
                ) }
                { rule && usesCode && (
                    <p className="m-0 text-xs text-sg-help">
                        { __(
                            'This BOGO rule will only apply when shoppers use this coupon.',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                ) }
            </div>
        ),
        product_ids: (
            <MultiSelectField
                { ...productSearch }
                label={ schema.product_ids?.label ?? '' }
                placeholder={ schema.product_ids?.placeholder }
                value={ ( values.product_ids as number[] ) ?? [] }
                onChange={ ( next ) => {
                    setValue( 'product_ids', next.map( Number ) );
                } }
                error={ errors.product_ids }
            />
        ),
        category_ids: (
            <MultiSelectField
                options={ categories }
                label={ schema.category_ids?.label ?? '' }
                placeholder={ schema.category_ids?.placeholder }
                value={ ( values.category_ids as number[] ) ?? [] }
                onChange={ ( next ) => {
                    setValue( 'category_ids', next.map( Number ) );
                } }
                error={ errors.category_ids }
            />
        ),
        eligibility: (
            <SelectField
                label={ schema.eligibility?.label ?? '' }
                value={ String( values.eligibility ) }
                options={ [
                    {
                        value: 'all',
                        label: __(
                            'All customers',
                            'storegrowth-sales-booster'
                        ),
                    },
                    {
                        value: 'first_time',
                        label: isPro
                            ? __(
                                  'First-time customers',
                                  'storegrowth-sales-booster'
                              )
                            : __(
                                  'First-time customers (Pro)',
                                  'storegrowth-sales-booster'
                              ),
                        disabled: ! isPro,
                    },
                    {
                        value: 'returning',
                        label: isPro
                            ? __(
                                  'Returning customers',
                                  'storegrowth-sales-booster'
                              )
                            : __(
                                  'Returning customers (Pro)',
                                  'storegrowth-sales-booster'
                              ),
                        disabled: ! isPro,
                    },
                    {
                        value: 'roles',
                        label: isPro
                            ? __(
                                  'Specific roles',
                                  'storegrowth-sales-booster'
                              )
                            : __(
                                  'Specific roles (Pro)',
                                  'storegrowth-sales-booster'
                              ),
                        disabled: ! isPro,
                    },
                ] }
                onChange={ ( next ) => {
                    setValue( 'eligibility', next );
                } }
            />
        ),
        ...( record?.campaign_only && campaign
            ? {
                  date_start: (
                      <CampaignDates
                          campaign={ campaign }
                          navigate={ navigate }
                      />
                  ),
                  date_end: <></>,
              }
            : {} ),
    };
}

/**
 * The editor for one coupon (or a new one).
 *
 * @param props    Props.
 * @param props.id Coupon id, or null for a new coupon.
 */
function CouponEditor( { id }: { id: number | null } ) {
    const navigate = useNavigate();
    const categories = useCategoryOptions();
    const { getModule, setModuleStatus } = useModules();

    const onCreated = useCallback(
        ( created: number ) => {
            navigate( `/smart-coupons/${ created }`, { replace: true } );
        },
        [ navigate ]
    );
    const version = useCampaignVersion( 'smart_coupon' );
    const coupon = useSmartCoupon(
        version.row || id,
        ( created ) => {
            if ( version.campaignId ) {
                navigate( `/campaigns/${ version.campaignId }` );
                return;
            }

            onCreated( created );
        },
        version.route
    );
    const title = __( 'Smart Coupons', 'storegrowth-sales-booster' );
    const canCreate = coupon.editor?.can_create ?? true;
    const bogoOn = Boolean( getModule( BOGO_ID )?.status );

    const toList = (
        <Button
            variant="outline"
            onClick={ () => {
                navigate( '/smart-coupons' );
            } }
        >
            { __( 'Coupon list', 'storegrowth-sales-booster' ) }
        </Button>
    );

    if ( ! id && ! coupon.loading && ! canCreate ) {
        return (
            <div className="flex w-full flex-col">
                <CardHead
                    title={ title }
                    actions={ toList }
                    className="rounded-b-none"
                />
                <div className="flex w-full flex-col items-center gap-3 rounded-b-lg border border-t-0 border-sg-cardline bg-white p-10 text-center">
                    <ProBadge />
                    <p className="m-0 max-w-md text-sm text-sg-text">
                        { __(
                            'Upgrade to add more coupons.',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
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
            </div>
        );
    }

    const loaded = ! coupon.loading && ! coupon.loadError;

    return (
        <ModuleSettingsPage
            notice={
                <CampaignBanner
                    timeline={ coupon.record?.timeline as OfferTimelineData }
                />
            }
            title={ title }
            settings={ coupon }
            hasPreview
            hasTabs={ false }
            preview={
                loaded ? (
                    <CouponSummary
                        values={ coupon.values }
                        currency={ coupon.editor?.currency ?? '' }
                    />
                ) : null
            }
            controls={
                loaded
                    ? controls( coupon, categories, navigate, bogoOn, () => {
                          setModuleStatus( BOGO_ID, true );
                      } )
                    : undefined
            }
            actions={
                <>
                    <VersionHeader
                        campaign={
                            version.name ||
                            ( coupon.record?.campaign as CouponCampaign | null )
                                ?.name
                        }
                        campaignOnly={
                            version.only ||
                            Boolean( coupon.record?.campaign_only )
                        }
                    />
                    { toList }
                </>
            }
            savedMessage={
                id
                    ? __( 'Coupon saved.', 'storegrowth-sales-booster' )
                    : __( 'Coupon created.', 'storegrowth-sales-booster' )
            }
        />
    );
}

/**
 * @since SPSG_VERSION
 *
 * @param props    Props.
 * @param props.id Coupon id, or null for a new coupon.
 */
export default function SmartCouponEditorPage( { id }: { id: number | null } ) {
    const module = useModules().getModule( 'smart-coupons' );

    if ( ! module?.status ) {
        return <Navigate to="/smart-coupons" replace />;
    }

    return (
        <FeatureLayout moduleId="smart-coupons">
            <CouponEditor key={ id ?? 'new' } id={ id } />
        </FeatureLayout>
    );
}
