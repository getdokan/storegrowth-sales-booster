/**
 * Order bump editor (design `order-bump-edit.html`) at
 * `#/upsell-order-bump/create-bump` and `#/upsell-order-bump/<id>`: the
 * generated settings page (`ModuleSettingsPage`) drawn from the editor's
 * schema (PHP `OrderBumpFields`, ADR-010) and the bump's values
 * (`useOrderBump`), with the product and category pickers, the amount field
 * and the checkout preview drawn here.
 *
 * @since SPSG_VERSION
 */
import { Button } from '@wedevs/plugin-ui';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    CardHead,
    FeatureLayout,
    LivePreview,
    ModuleSettingsPage,
    MultiSelectField,
    type MultiSelectOption,
    NumberField,
    ProBadge,
} from '@storegrowth/components';
import {
    Navigate,
    useModules,
    useNavigate,
    useSearchParams,
} from '@storegrowth/hooks';
import {
    fetchProductCategories,
    fetchProductsByIds,
    getHeaderData,
    type ProductOption,
    searchProducts,
} from '@storegrowth/utilities';

import {
    fetchOfferProductsByIds,
    type OfferProduct,
    searchOfferProducts,
} from '../api';
import { BumpPreview } from './bump-preview';
import {
    MAX_PRICE,
    type OrderBumpEditor,
    useOrderBump,
} from './use-order-bump';

/**
 * @param products Products.
 */
function toOptions( products: Array< ProductOption | OfferProduct > ) {
    return products.map( ( product ) => {
        return { value: product.id, label: product.name };
    } );
}

const targetSearch = {
    onSearch: ( search: string ) => {
        return searchProducts( search ).then( toOptions );
    },
    resolve: ( ids: Array< string | number > ) => {
        return fetchProductsByIds( ids.map( Number ) ).then( toOptions );
    },
};

// Simple products and variations with every attribute set (the routes'
// rule); a stored one still resolves by id.
const offerSearch = {
    onSearch: ( search: string ) => {
        return searchOfferProducts( search ).then( toOptions );
    },
    resolve: ( ids: Array< string | number > ) => {
        return fetchOfferProductsByIds( ids.map( Number ) ).then( toOptions );
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
 * Controls the page draws instead of the schema's: the product and category
 * pickers, and the amount, labelled and bounded by the offer type.
 *
 * @param bump       The editor's bump.
 * @param categories Category options.
 */
function controls( bump: OrderBumpEditor, categories: MultiSelectOption[] ) {
    const { values, schema, setValue, errors, currency } = bump;
    const offerProduct = Number( values.offer_product_id ) || 0;
    const isPrice = values.offer_type === 'price';
    // `%`, or the currency symbol where the store puts it.
    const unit = ( isPrice ? currency.symbol : '%' ) || undefined;
    const unitFirst = isPrice && currency.position.startsWith( 'left' );

    return {
        target_products: (
            <MultiSelectField
                { ...targetSearch }
                label={ schema.target_products?.label ?? '' }
                placeholder={ schema.target_products?.placeholder }
                value={ ( values.target_products as number[] ) ?? [] }
                onChange={ ( next ) => {
                    setValue( 'target_products', next.map( Number ) );
                } }
                error={ errors.target_products }
            />
        ),
        target_categories: (
            <MultiSelectField
                options={ categories }
                label={ schema.target_categories?.label ?? '' }
                placeholder={ schema.target_categories?.placeholder }
                value={ ( values.target_categories as number[] ) ?? [] }
                onChange={ ( next ) => {
                    setValue( 'target_categories', next.map( Number ) );
                } }
                error={ errors.target_categories }
            />
        ),
        // One product: a new pick replaces it.
        offer_product_id: (
            <MultiSelectField
                { ...offerSearch }
                label={ schema.offer_product_id?.label ?? '' }
                placeholder={ schema.offer_product_id?.placeholder }
                value={ offerProduct ? [ offerProduct ] : [] }
                onChange={ ( next ) => {
                    setValue(
                        'offer_product_id',
                        Number( next[ next.length - 1 ] ?? 0 )
                    );
                } }
                error={ errors.offer_product_id }
            />
        ),
        offer_amount: (
            <NumberField
                label={
                    isPrice
                        ? __( 'Price', 'storegrowth-sales-booster' )
                        : __( 'Discount', 'storegrowth-sales-booster' )
                }
                value={ Number( values.offer_amount ) || 0 }
                onChange={ ( next ) => {
                    setValue( 'offer_amount', next );
                } }
                min={ 0 }
                max={ isPrice ? MAX_PRICE : 100 }
                step={ isPrice ? 0.01 : 1 }
                prefix={ unitFirst ? unit : undefined }
                suffix={ unitFirst ? undefined : unit }
                error={ errors.offer_amount }
            />
        ),
    };
}

/**
 * The editor for one bump (or a new one).
 *
 * @param props    Props.
 * @param props.id Bump id, or null for a new bump.
 */
function BumpEditor( { id }: { id: number | null } ) {
    const navigate = useNavigate();
    const [ searchParams ] = useSearchParams();
    const categories = useCategoryOptions();

    // A new bump opens as itself once created, on the same tab.
    const onCreated = useCallback(
        ( created: number ) => {
            const query = searchParams.toString();

            navigate(
                `/upsell-order-bump/${ created }${
                    query ? `?${ query }` : ''
                }`,
                { replace: true }
            );
        },
        [ navigate, searchParams ]
    );
    const bump = useOrderBump( id, onCreated );

    const title = __( 'Upsell Order Bump', 'storegrowth-sales-booster' );
    const toList = (
        <Button
            variant="outline"
            onClick={ () => {
                navigate( '/upsell-order-bump' );
            } }
        >
            { __( 'Bump List', 'storegrowth-sales-booster' ) }
        </Button>
    );

    // At lite's limit a new bump can't be saved (the route says 403 too).
    if ( ! id && ! bump.loading && ! bump.canCreate ) {
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
                            'You’ve reached the free version’s order bump limit. Upgrade to Pro for unlimited order bumps, or edit an existing one.',
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

    const loaded = ! bump.loading && ! bump.loadError;
    const preview = loaded ? (
        <LivePreview
            layout="checkout"
            currency={ bump.currency }
            widget={ <BumpPreview bump={ bump } /> }
            footer={
                bump.taxAdjusted ? (
                    <p className="m-0 text-xs text-sg-muted">
                        { __(
                            'Prices are shown as entered; the checkout adds or removes tax as your store’s settings say.',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                ) : undefined
            }
        />
    ) : null;

    return (
        <ModuleSettingsPage
            title={ title }
            settings={ bump }
            preview={ preview }
            hasPreview
            controls={ loaded ? controls( bump, categories ) : undefined }
            actions={ toList }
            savedMessage={
                id
                    ? __( 'Order bump saved.', 'storegrowth-sales-booster' )
                    : __( 'Order bump created.', 'storegrowth-sales-booster' )
            }
        />
    );
}

/**
 * @since SPSG_VERSION
 *
 * @param props    Props.
 * @param props.id Bump id, or null for a new bump.
 */
export default function OrderBumpEditorPage( { id }: { id: number | null } ) {
    const [ searchParams ] = useSearchParams();
    const orderBump = useModules().getModule( 'upsell-order-bump' );

    // Its REST routes load only while the module is on: the list asks to
    // turn it on.
    if ( ! orderBump?.status ) {
        return <Navigate to="/upsell-order-bump" replace />;
    }

    // 2.2.0's `?tab_name=basic|design` opened the editor's tabs.
    const tabName = searchParams.get( 'tab_name' );
    if ( tabName !== null ) {
        const next = new URLSearchParams( searchParams );
        next.delete( 'tab_name' );
        if ( [ 'basic', 'design' ].includes( tabName ) ) {
            next.set( 'tab', tabName );
        }
        const query = next.toString();

        return (
            <Navigate
                to={ `/upsell-order-bump/${ id ?? 'create-bump' }${
                    query ? `?${ query }` : ''
                }` }
                replace
            />
        );
    }

    return (
        <FeatureLayout moduleId="upsell-order-bump">
            { /* Keyed: another bump starts with fresh state. */ }
            <BumpEditor key={ id ?? 'new' } id={ id } />
        </FeatureLayout>
    );
}
