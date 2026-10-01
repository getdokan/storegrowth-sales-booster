/**
 * BOGO offer list (design `bogo.html`): name, target product, the offer
 * with its price, type, a status switch and Edit / Delete, on the shared
 * record list (`RecordList`: search, bulk delete, pagination, empty state).
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
    type DataViewAction,
    type DataViewField,
    toast,
} from '@wedevs/plugin-ui';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import { Gift, MessageSquareText, Pencil, Plus, Settings } from 'lucide-react';
import {
    CardHead,
    FeatureLayout,
    ProBadge,
    ProductCell,
    RecordList,
} from '@storegrowth/components';
import {
    Navigate,
    useLocation,
    useModules,
    useNavigate,
} from '@storegrowth/hooks';
import { errorMessage } from '@storegrowth/utilities';

import { type BogoOffer, offersRoute } from '../api';

/** The list's texts. */
const MESSAGES = {
    loadError: __(
        'The offers could not be loaded.',
        'storegrowth-sales-booster'
    ),
    deleteTitle: __( 'Delete offers?', 'storegrowth-sales-booster' ),
    deleteMessage: __(
        'The selected BOGO offers will be deleted. This cannot be undone.',
        'storegrowth-sales-booster'
    ),
    deletePartial: __(
        'Some offers could not be deleted.',
        'storegrowth-sales-booster'
    ),
    deleteFailed: __(
        'The offers could not be deleted.',
        'storegrowth-sales-booster'
    ),
    searchLabel: __( 'Search offers', 'storegrowth-sales-booster' ),
    noResults: __( 'No offers match your search', 'storegrowth-sales-booster' ),
};

/**
 * The status switch's accessible name.
 *
 * @param offer Offer.
 */
function statusLabel( offer: BogoOffer ) {
    return sprintf(
        /* translators: %s: offer name. */
        __( 'Offer status: %s', 'storegrowth-sales-booster' ),
        decodeEntities( offer.name )
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
 * @param props             Props.
 * @param props.vendor      The Dokan vendor dashboard.
 * @param props.onCanCreate Called with whether another offer can be created.
 */
function OfferList( {
    vendor,
    onCanCreate,
}: {
    vendor: boolean;
    onCanCreate?: ( canCreate: boolean ) => void;
} ) {
    const navigate = useNavigate();

    const edit = ( offer: BogoOffer ) => {
        if ( offer.type === 'product' ) {
            // Its product's BOGO tab (the product page opens the tab).
            window.location.href = `${ offer.edit_url }#bogo_product_data`;
            return;
        }
        navigate( `/bogo/${ offer.id }` );
    };

    const fields: DataViewField< BogoOffer >[] = [
        {
            id: 'target',
            label: __( 'Target Product', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                // A category offer targets categories, not a product
                // (an admin's; vendors can't target categories).
                return ! vendor &&
                    ! item.get_offered_product_info &&
                    item.target_categories.length ? (
                    <span className="flex max-w-[200px] flex-wrap gap-1">
                        { item.target_categories.map( ( name ) => {
                            return (
                                <Badge key={ name } variant="secondary">
                                    { name }
                                </Badge>
                            );
                        } ) }
                    </span>
                ) : (
                    <ProductCell product={ item.get_offered_product_info } />
                );
            },
        },
        {
            id: 'offer',
            label: __( 'Offers', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                return (
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
                );
            },
        },
        {
            id: 'type',
            label: __( 'Type', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                return item.type === 'global' ? (
                    <Badge variant="success">
                        { __( 'Global', 'storegrowth-sales-booster' ) }
                    </Badge>
                ) : (
                    <Badge variant="secondary">
                        { __( 'Specific', 'storegrowth-sales-booster' ) }
                    </Badge>
                );
            },
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
            callback: ( [ item ] ) => {
                edit( item );
            },
        },
    ];

    const addNew = ( canCreate: boolean ) => {
        return (
            <Button
                onClick={ () => {
                    navigate( '/bogo/create-bogo' );
                } }
                disabled={ ! canCreate }
                className="gap-2"
            >
                <Plus className="size-4" aria-hidden />
                { __( 'Add New', 'storegrowth-sales-booster' ) }
            </Button>
        );
    };

    const headerActions = ( canCreate: boolean ) => {
        return (
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
                    onClick={ () => {
                        navigate( '/settings?module=bogo' );
                    } }
                    className="gap-2"
                >
                    <Settings className="size-4" aria-hidden />
                    { __( 'Settings', 'storegrowth-sales-booster' ) }
                </Button>
                { ! canCreate && <ProBadge /> }
                { addNew( canCreate ) }
            </span>
        );
    };

    // No offers at all (design `.zero-state`).
    const noOffers = ( canCreate: boolean ) => {
        return (
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
                { /* Dokan's header has "Create New Offer" on the vendor dashboard. */ }
                { ! vendor && (
                    <span className="flex items-center gap-2">
                        { ! canCreate && <ProBadge /> }
                        { addNew( canCreate ) }
                    </span>
                ) }
            </div>
        );
    };

    return (
        <RecordList< BogoOffer >
            route={ offersRoute( vendor ) }
            namespace="storegrowth-bogo"
            // Dokan's page header is the heading on the vendor dashboard:
            // the card is the table alone.
            title={
                vendor
                    ? undefined
                    : __( 'BOGO Offers', 'storegrowth-sales-booster' )
            }
            headerActions={ headerActions }
            fields={ fields }
            actions={ actions }
            icon={ Gift }
            empty={ noOffers }
            limitNotice={ __(
                'This store has reached its BOGO offer limit.',
                'storegrowth-sales-booster'
            ) }
            onCanCreate={ onCanCreate }
            statusLabel={ statusLabel }
            messages={ MESSAGES }
        />
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

    // Module off: its offers can't be listed until it's on. Turning it on
    // marks it on before the server answers, so the list also waits for
    // that answer (its REST routes load with the module).
    if ( ! getModule( 'bogo' )?.status || pendingModules.includes( 'bogo' ) ) {
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
                                    ( error ) => {
                                        toast.error(
                                            errorMessage(
                                                error,
                                                __(
                                                    'BOGO could not be turned on.',
                                                    'storegrowth-sales-booster'
                                                )
                                            )
                                        );
                                    }
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
 * @param props             Props.
 * @param props.vendor      The Dokan vendor dashboard: the vendor's offers, no
 *                          module frame (Dokan draws the page).
 * @param props.onCanCreate Vendor mode: called with whether another offer can
 *                          be created (for Dokan's header button).
 */
export default function BogoList( {
    vendor = false,
    onCanCreate,
}: {
    vendor?: boolean;
    onCanCreate?: ( canCreate: boolean ) => void;
} ) {
    return vendor ? (
        <OfferList vendor onCanCreate={ onCanCreate } />
    ) : (
        <AdminBogoList />
    );
}
