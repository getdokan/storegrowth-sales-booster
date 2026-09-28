/**
 * BOGO offer list (design `bogo.html`): name, target product, the offer
 * with its price, type, a status switch and Edit / Delete, over plugin-ui
 * DataViews (search, bulk delete, pagination, empty state).
 *
 * Global offers open the editor; product offers ("Specific", made on a
 * product's BOGO tab) open that tab. While the module is off the page asks
 * to turn it on (its REST routes aren't loaded).
 *
 * The Dokan vendor dashboard draws the same list (`vendor`, 10f2).
 *
 * @since SPSG_VERSION
 */
import {
    Badge,
    Button,
    DataViews,
    type DataViewAction,
    type DataViewField,
    type DataViewState,
    Switch,
    toast,
} from '@wedevs/plugin-ui';
import { SlotFillProvider } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import {
    Gift,
    MessageSquareText,
    Pencil,
    Plus,
    Settings,
    Trash2,
} from 'lucide-react';
import { CardHead, FeatureLayout, ProBadge } from '@storegrowth/components';
import {
    Navigate,
    useLocation,
    useModules,
    useNavigate,
} from '@storegrowth/hooks';
import { errorMessage } from '@storegrowth/utilities';

import {
    type BogoOffer,
    deleteOffers,
    fetchOffers,
    type OfferPage,
    type OfferProduct,
    setOfferStatus,
} from '../api';

const DEFAULT_VIEW: DataViewState = {
    type: 'table',
    page: 1,
    perPage: 10,
    search: '',
    // `status` is plugin-ui's tab key, so the column is `active`.
    fields: [ 'target', 'offer', 'type', 'active' ],
    titleField: 'name',
    layout: {},
};

/**
 * Thumbnail and name of a product.
 *
 * @param props         Props.
 * @param props.product Product.
 * @param props.after   Under the name (prices).
 */
function ProductCell( {
    product,
    after,
}: {
    product?: OfferProduct;
    after?: React.ReactNode;
} ) {
    if ( ! product ) {
        return <span className="text-sg-help">—</span>;
    }

    return (
        // Capped so a long product name can't push the table sideways.
        <span className="flex min-w-0 max-w-[200px] items-center gap-3">
            <img
                src={ product.image }
                alt=""
                className="size-[42px] shrink-0 rounded-full object-cover"
            />
            <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-sg-heading">
                    { decodeEntities( product.name ) }
                </span>
                { after }
            </span>
        </span>
    );
}

/**
 * The offers card: title, header buttons and the table.
 *
 * On the Dokan vendor dashboard (`vendor`) it lists the vendor's own offers
 * (`/bogo/offers/vendor`), without the admin-only parts: the Settings and
 * Category Messages buttons (Dokan's header has "Create New Offer"), the
 * category targets and Edit for product offers (their BOGO tab is in
 * wp-admin).
 *
 * @param props        Props.
 * @param props.vendor The Dokan vendor dashboard.
 */
function OfferList( { vendor }: { vendor: boolean } ) {
    const navigate = useNavigate();
    const [ view, setView ] = useState< DataViewState >( DEFAULT_VIEW );
    const [ page, setPage ] = useState< OfferPage | null >( null );
    const [ loading, setLoading ] = useState( true );
    // Status switches waiting for the server.
    const [ pending, setPending ] = useState< number[] >( [] );
    // Ticked rows (ids) for bulk delete.
    const [ selection, setSelection ] = useState< string[] >( [] );
    // The latest request: an older, slower one doesn't overwrite it.
    const latest = useRef( 0 );

    const load = useCallback( async () => {
        const request = ++latest.current;
        setLoading( true );
        try {
            const next = await fetchOffers(
                {
                    page: view.page ?? 1,
                    per_page: view.perPage ?? 10,
                    search: view.search || undefined,
                },
                vendor
            );

            if ( request !== latest.current ) {
                return;
            }

            // Past the last page (e.g. after deleting its rows): go back.
            if ( next.totalPages > 0 && ( view.page ?? 1 ) > next.totalPages ) {
                setView( { ...view, page: next.totalPages } );
                return;
            }

            setPage( next );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The offers could not be loaded.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        } finally {
            if ( request === latest.current ) {
                setLoading( false );
            }
        }
    }, [ vendor, view ] );

    useEffect( () => {
        load();
    }, [ load ] );

    const edit = ( offer: BogoOffer ) => {
        if ( offer.type === 'product' ) {
            // Its product's BOGO tab (the product page opens the tab).
            window.location.href = `${ offer.edit_url }#bogo_product_data`;
            return;
        }
        navigate( `/bogo/${ offer.id }` );
    };

    const toggle = async ( offer: BogoOffer, active: boolean ) => {
        setPending( ( ids ) => [ ...ids, offer.id ] );
        try {
            await setOfferStatus( offer.id, active, vendor );
            setPage( ( current ) =>
                current
                    ? {
                          ...current,
                          items: current.items.map( ( item ) =>
                              item.id === offer.id
                                  ? {
                                        ...item,
                                        status: active ? 'active' : 'inactive',
                                    }
                                  : item
                          ),
                      }
                    : current
            );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The status could not be changed.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        } finally {
            setPending( ( ids ) => ids.filter( ( id ) => id !== offer.id ) );
        }
    };

    const fields: DataViewField< BogoOffer >[] = [
        {
            id: 'name',
            label: __( 'Name', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            getValue: ( { item } ) => decodeEntities( item.name ),
            render: ( { item } ) => (
                <span className="font-semibold text-sg-heading">
                    { decodeEntities( item.name ) }
                </span>
            ),
        },
        {
            id: 'target',
            label: __( 'Target Product', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) =>
                // A category offer targets categories, not a product
                // (an admin's; vendors can't target categories).
                ! vendor &&
                ! item.get_offered_product_info &&
                item.target_categories.length ? (
                    <span className="flex max-w-[200px] flex-wrap gap-1">
                        { item.target_categories.map( ( name ) => (
                            <Badge key={ name } variant="secondary">
                                { name }
                            </Badge>
                        ) ) }
                    </span>
                ) : (
                    <ProductCell product={ item.get_offered_product_info } />
                ),
        },
        {
            id: 'offer',
            label: __( 'Offers', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => (
                <ProductCell
                    // Buy X Get X gives the target product itself.
                    product={
                        item.bogo_deal_type === 'same'
                            ? item.get_offered_product_info
                            : item.get_different_product_info
                    }
                    after={
                        item.offer_prices && (
                            <span className="flex items-center gap-1.5 text-xs">
                                <s className="text-sg-help">
                                    { item.offer_prices.regular }
                                </s>
                                <span className="font-semibold text-sg-heading">
                                    { item.offer_prices.offer }
                                </span>
                            </span>
                        )
                    }
                />
            ),
        },
        {
            id: 'type',
            label: __( 'Type', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) =>
                item.type === 'global' ? (
                    <Badge variant="success">
                        { __( 'Global', 'storegrowth-sales-booster' ) }
                    </Badge>
                ) : (
                    <Badge variant="secondary">
                        { __( 'Specific', 'storegrowth-sales-booster' ) }
                    </Badge>
                ),
        },
        {
            id: 'active',
            label: __( 'Status', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => (
                <Switch
                    checked={ item.status === 'active' }
                    disabled={ pending.includes( item.id ) }
                    onCheckedChange={ ( checked ) => toggle( item, checked ) }
                    aria-label={ sprintf(
                        /* translators: %s: offer name. */
                        __( 'Offer status: %s', 'storegrowth-sales-booster' ),
                        decodeEntities( item.name )
                    ) }
                />
            ),
        },
    ];

    const actions: DataViewAction< BogoOffer >[] = [
        {
            id: 'edit',
            label: __( 'Edit', 'storegrowth-sales-booster' ),
            icon: <Pencil size={ 16 } />,
            // A product offer is edited on its product's BOGO tab, in
            // wp-admin: not from the vendor dashboard.
            isEligible: ( item ) => {
                return ! vendor || item.type !== 'product';
            },
            callback: ( [ item ] ) => edit( item ),
        },
        {
            id: 'delete',
            label: __( 'Delete', 'storegrowth-sales-booster' ),
            icon: <Trash2 size={ 16 } />,
            isDestructive: true,
            supportsBulk: true,
            confirmTitle: __( 'Delete offers?', 'storegrowth-sales-booster' ),
            confirmMessage: __(
                'The selected BOGO offers will be deleted. This cannot be undone.',
                'storegrowth-sales-booster'
            ),
            callback: async ( items ) => {
                try {
                    const result = await deleteOffers(
                        items.map( ( item ) => item.id ),
                        vendor
                    );
                    if ( result.failed.length ) {
                        toast.error(
                            __(
                                'Some offers could not be deleted.',
                                'storegrowth-sales-booster'
                            )
                        );
                    } else {
                        toast.success(
                            __( 'Deleted.', 'storegrowth-sales-booster' )
                        );
                    }
                } catch ( error ) {
                    toast.error(
                        errorMessage(
                            error,
                            __(
                                'The offers could not be deleted.',
                                'storegrowth-sales-booster'
                            )
                        )
                    );
                }
                setSelection( [] );
                load();
            },
        },
    ];

    const canCreate = page?.canCreate ?? true;
    const addNew = (
        <Button
            onClick={ () => navigate( '/bogo/create-bogo' ) }
            disabled={ ! canCreate }
            className="gap-2"
        >
            <Plus className="size-4" aria-hidden />
            { __( 'Add New', 'storegrowth-sales-booster' ) }
        </Button>
    );

    const headerActions = (
        <span className="flex flex-wrap items-center gap-3">
            <Button
                variant="outline"
                onClick={ () => {
                    navigate( '/bogo/messages' );
                } }
                className="gap-2"
            >
                <MessageSquareText className="size-4" aria-hidden />
                { __( 'Category Messages', 'storegrowth-sales-booster' ) }
            </Button>
            <Button
                variant="outline"
                onClick={ () => navigate( '/settings?module=bogo' ) }
                className="gap-2"
            >
                <Settings className="size-4" aria-hidden />
                { __( 'Settings', 'storegrowth-sales-booster' ) }
            </Button>
            { ! canCreate && <ProBadge /> }
            { addNew }
        </span>
    );

    // No offers at all (design `.zero-state`).
    const noOffers = (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Gift className="size-10 text-sg-help" aria-hidden />
            <p className="m-0 text-base font-semibold text-sg-heading">
                { __( 'No BOGO offers yet', 'storegrowth-sales-booster' ) }
            </p>
            <p className="m-0 max-w-md text-sm text-sg-text">
                { __(
                    'Create a buy-one-get-one rule to pair a product with a free or discounted second item.',
                    'storegrowth-sales-booster'
                ) }
            </p>
            <span className="flex items-center gap-2">
                { ! canCreate && <ProBadge /> }
                { addNew }
            </span>
        </div>
    );

    const table = (
        <SlotFillProvider>
            <DataViews< BogoOffer >
                namespace="storegrowth-bogo"
                data={ page?.items ?? [] }
                fields={ fields }
                view={ view }
                onChangeView={ ( next ) => {
                    // Another page or search: its rows aren't ticked.
                    setSelection( [] );
                    setView( next );
                } }
                selection={ selection }
                onChangeSelection={ setSelection }
                actions={ actions }
                isLoading={ loading }
                search
                searchLabel={ __(
                    'Search offers',
                    'storegrowth-sales-booster'
                ) }
                searchPlaceholder={ __(
                    'Search',
                    'storegrowth-sales-booster'
                ) }
                getItemId={ ( item ) => String( item.id ) }
                paginationInfo={ {
                    totalItems: page?.totalItems ?? 0,
                    totalPages: page?.totalPages ?? 0,
                } }
                empty={ view.search ? undefined : noOffers }
                emptyIcon={ <Gift className="size-10" aria-hidden /> }
                emptyTitle={ __(
                    'No offers match your search',
                    'storegrowth-sales-booster'
                ) }
                emptyDescription={ __(
                    'Try another name.',
                    'storegrowth-sales-booster'
                ) }
            />
        </SlotFillProvider>
    );

    // Dokan's page header is the heading on the vendor dashboard: the card
    // is the table alone.
    if ( vendor ) {
        return (
            <div className="w-full overflow-hidden rounded-lg border border-sg-cardline bg-white *:border-none!">
                { table }
            </div>
        );
    }

    // One card, as the settings pages: the title on top, the table below.
    return (
        <div className="flex w-full flex-col">
            <CardHead
                title={ __( 'BOGO Offers', 'storegrowth-sales-booster' ) }
                className="rounded-b-none"
                actions={ headerActions }
            />
            <div className="w-full overflow-hidden rounded-b-lg border border-t-0 border-sg-cardline bg-white *:rounded-t-none! *:border-none!">
                { table }
            </div>
        </div>
    );
}

/**
 * The admin's list page, in the module frame. While the module is off it
 * asks to turn it on (its REST routes aren't loaded).
 */
function AdminBogoList() {
    const location = useLocation();
    const {
        getModule,
        setModuleStatus,
        pending: pendingModules,
    } = useModules();

    // 2.2.0's `#/bogo?tab_name=…` opened its tabs: the messages, or the
    // global settings.
    const tabName = new URLSearchParams( location.search ).get( 'tab_name' );
    if ( tabName === 'messages' ) {
        return <Navigate to="/bogo/messages" replace />;
    }
    if ( tabName !== null ) {
        return <Navigate to="/settings?module=bogo" replace />;
    }

    // Module off: its offers can't be listed until it's on.
    if ( ! getModule( 'bogo' )?.status ) {
        return (
            <FeatureLayout moduleId="bogo">
                <div className="flex w-full flex-col">
                    <CardHead
                        title={ __(
                            'BOGO Offers',
                            'storegrowth-sales-booster'
                        ) }
                        className="rounded-b-none"
                    />
                    <div className="flex w-full flex-col items-center gap-4 rounded-b-lg border border-t-0 border-sg-cardline bg-white p-10 text-center">
                        <p className="m-0 text-sm text-sg-text">
                            { __(
                                'BOGO is turned off. Turn it on to create and manage offers.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                        <Button
                            onClick={ () => {
                                setModuleStatus( 'bogo', true ).catch(
                                    ( error ) =>
                                        toast.error(
                                            errorMessage(
                                                error,
                                                __(
                                                    'BOGO could not be turned on.',
                                                    'storegrowth-sales-booster'
                                                )
                                            )
                                        )
                                );
                            } }
                            disabled={ pendingModules.includes( 'bogo' ) }
                        >
                            { __(
                                'Turn on BOGO',
                                'storegrowth-sales-booster'
                            ) }
                        </Button>
                    </div>
                </div>
            </FeatureLayout>
        );
    }

    return (
        <FeatureLayout moduleId="bogo">
            <OfferList vendor={ false } />
        </FeatureLayout>
    );
}

/**
 * @since SPSG_VERSION
 *
 * @param props        Props.
 * @param props.vendor The Dokan vendor dashboard: the vendor's offers, no
 *                     module frame (Dokan draws the page).
 */
export default function BogoList( { vendor = false }: { vendor?: boolean } ) {
    return vendor ? <OfferList vendor /> : <AdminBogoList />;
}
