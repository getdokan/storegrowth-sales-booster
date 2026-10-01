/**
 * BOGO offer editor (design `bogo-edit.html`) at `#/bogo/create-bogo` and
 * `#/bogo/<id>`: the generated settings page (`ModuleSettingsPage`) drawn
 * from the editor's schema (PHP `BogoOfferFields`, ADR-010) and the offer's
 * values (`useBogoOffer`), with the product search, the badge picker and the
 * live preview drawn here. The Dokan vendor dashboard draws the same editor
 * (`vendor`, 10f2).
 *
 * @since SPSG_VERSION
 */
import { Button } from '@wedevs/plugin-ui';
import { useCallback, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { Gift } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    CardHead,
    FeatureLayout,
    IconPicker,
    LivePreview,
    ModuleSettingsPage,
    MultiSelectField,
    ProBadge,
} from '@storegrowth/components';
import {
    Navigate,
    useModules,
    useNavigate,
    useSearchParams,
} from '@storegrowth/hooks';
import {
    fetchProductsByIds,
    getHeaderData,
    type ProductOption,
    searchProducts,
} from '@storegrowth/utilities';

import { BOGO_BADGES } from '../badges';
import { OfferPreview } from './offer-preview';
import { type BogoOffer, useBogoOffer } from './use-bogo-offer';

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
 * Controls the page draws instead of the schema's: the product searches and
 * the badge picker (image badges and the upload, two keys).
 *
 * @param offer The editor's offer.
 */
function controls( offer: BogoOffer ) {
    const { values, schema, setValue, setValues, isLocked, errors } = offer;
    const offerProduct = Number( values.get_different_product_field ) || 0;

    // The storefront shows an upload over the icon, with pro only (locked
    // here without pro: it shows the icon).
    const locked = isLocked( 'default_badge_icon_name' );
    const custom = locked ? '' : String( values.default_custom_badge_icon );

    return {
        offered_products: (
            <MultiSelectField
                { ...productSearch }
                label={ schema.offered_products?.label ?? '' }
                placeholder={ schema.offered_products?.placeholder }
                value={ ( values.offered_products as number[] ) ?? [] }
                onChange={ ( next ) => {
                    setValue( 'offered_products', next.map( Number ) );
                } }
                error={ errors.offered_products }
            />
        ),
        // One product: a new pick replaces it.
        get_different_product_field: (
            <MultiSelectField
                { ...productSearch }
                label={ schema.get_different_product_field?.label ?? '' }
                placeholder={ schema.get_different_product_field?.placeholder }
                value={ offerProduct ? [ offerProduct ] : [] }
                onChange={ ( next ) => {
                    setValue(
                        'get_different_product_field',
                        Number( next[ next.length - 1 ] ?? 0 )
                    );
                } }
                error={ errors.get_different_product_field }
            />
        ),
        default_badge_icon_name: (
            <IconPicker
                label={ schema.default_badge_icon_name?.label ?? '' }
                icons={ BOGO_BADGES }
                iconSize="lg"
                value={ custom ? '' : String( values.default_badge_icon_name ) }
                clearable={ false }
                // An icon replaces the upload; an upload keeps the stored
                // icon (the picker would clear it).
                onChange={ ( next ) => {
                    if ( next ) {
                        setValues( {
                            default_badge_icon_name: next,
                            default_custom_badge_icon: '',
                        } );
                    }
                } }
                custom={ custom }
                onCustomChange={ ( url ) => {
                    setValues( { default_custom_badge_icon: url } );
                } }
                locked={ locked }
                error={ errors.default_custom_badge_icon }
            />
        ),
    };
}

/**
 * The editor for one offer (or a new one).
 *
 * @param props        Props.
 * @param props.id     Offer id, or null for a new offer.
 * @param props.vendor The Dokan vendor dashboard.
 */
function OfferEditor( { id, vendor }: { id: number | null; vendor: boolean } ) {
    const navigate = useNavigate();
    const [ searchParams ] = useSearchParams();

    // A new offer opens as itself once created, on the same tab.
    const onCreated = useCallback(
        ( created: number ) => {
            const query = searchParams.toString();

            navigate( `/bogo/${ created }${ query ? `?${ query }` : '' }`, {
                replace: true,
            } );
        },
        [ navigate, searchParams ]
    );
    const offer = useBogoOffer( id, onCreated, vendor );

    const title = __( 'BOGO', 'storegrowth-sales-booster' );
    // Dokan's page header has its own Back button.
    const toList = vendor ? undefined : (
        <Button
            variant="outline"
            onClick={ () => {
                navigate( '/bogo' );
            } }
        >
            { __( 'BOGO List', 'storegrowth-sales-booster' ) }
        </Button>
    );

    // A product offer ("Specific") is edited on its product's BOGO tab
    // (this editor would rewrite it as a global offer); that tab is in
    // wp-admin, so the vendor dashboard goes back to the list.
    const leave = vendor ? offer.productOffer : Boolean( offer.productEditUrl );
    useEffect( () => {
        if ( vendor && offer.productOffer ) {
            navigate( '/bogo', { replace: true } );
        } else if ( ! vendor && offer.productEditUrl ) {
            window.location.href = `${ offer.productEditUrl }#bogo_product_data`;
        }
    }, [ vendor, offer.productOffer, offer.productEditUrl, navigate ] );

    if ( leave ) {
        return null;
    }

    // At lite's limit a new offer can't be saved (the route says 403 too).
    // A vendor can't upgrade the store: no Pro badge or Upgrade button.
    if ( vendor && ! id && ! offer.loading && ! offer.canCreate ) {
        return (
            <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-sg-cardline bg-white p-10 text-center">
                <Gift className="size-10 text-sg-help" aria-hidden />
                <p className="m-0 max-w-md text-sm text-sg-text">
                    { __(
                        'This store has reached its BOGO offer limit.',
                        'storegrowth-sales-booster'
                    ) }
                </p>
            </div>
        );
    }

    if ( ! id && ! offer.loading && ! offer.canCreate ) {
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
                            'You’ve reached the free version’s BOGO offer limit. Upgrade to Pro for unlimited offers, or edit an existing one.',
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

    const loaded = ! offer.loading && ! offer.loadError;
    const preview = loaded ? (
        <LivePreview
            // Under Dokan's page heading (an `h3`) on the vendor dashboard.
            headingTag={ vendor ? 'h4' : 'h2' }
            currency={ offer.currency }
            widget={
                /**
                 * Filters the BOGO offer preview, e.g. for pro to add its
                 * parts.
                 *
                 * @since SPSG_VERSION
                 *
                 * @param {JSX.Element} widget The preview widget.
                 * @param {Object}      values Current (unsaved) offer values.
                 */
                applyFilters(
                    'storegrowth.preview.bogo',
                    <OfferPreview
                        values={ offer.values }
                        currency={ offer.currency }
                        uploadLocked={ offer.isLocked(
                            'default_custom_badge_icon'
                        ) }
                        showRegularPrice={ offer.showRegularPrice }
                    />,
                    offer.values
                ) as ReactNode
            }
        />
    ) : null;

    return (
        <ModuleSettingsPage
            title={ title }
            settings={ offer }
            preview={ preview }
            hasPreview
            controls={ loaded ? controls( offer ) : undefined }
            actions={ toList }
            // Dokan's page header is the heading on the vendor dashboard.
            hideTitle={ vendor }
            savedMessage={
                id
                    ? __( 'Offer saved.', 'storegrowth-sales-booster' )
                    : __( 'Offer created.', 'storegrowth-sales-booster' )
            }
        />
    );
}

/**
 * The admin's editor, in the module frame.
 *
 * @param props    Props.
 * @param props.id Offer id, or null for a new offer.
 */
function AdminBogoEditor( { id }: { id: number | null } ) {
    const bogo = useModules().getModule( 'bogo' );

    // Its REST routes load only while the module is on: the list asks to
    // turn it on.
    if ( ! bogo?.status ) {
        return <Navigate to="/bogo" replace />;
    }

    return (
        <FeatureLayout moduleId="bogo">
            { /* Keyed: another offer starts with fresh state. */ }
            <OfferEditor key={ id ?? 'new' } id={ id } vendor={ false } />
        </FeatureLayout>
    );
}

/**
 * @since SPSG_VERSION
 *
 * @param props        Props.
 * @param props.id     Offer id, or null for a new offer.
 * @param props.vendor The Dokan vendor dashboard: the vendor's offer
 *                     (`/bogo/offers/vendor`), no module frame (Dokan draws
 *                     the page).
 */
export default function BogoEditor( {
    id,
    vendor = false,
}: {
    id: number | null;
    vendor?: boolean;
} ) {
    if ( vendor ) {
        // Keyed: another offer starts with fresh state.
        return <OfferEditor key={ id ?? 'new' } id={ id } vendor />;
    }

    return <AdminBogoEditor id={ id } />;
}
