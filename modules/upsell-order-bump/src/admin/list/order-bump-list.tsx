/**
 * Order bump list (design `order-bump.html`): name, target, the offer with
 * its price, a status switch and Edit / Delete, on the shared record list
 * (`RecordList`: search, bulk delete, pagination, empty state), as BOGO's.
 *
 * While the module is off the page asks to turn it on (its REST routes
 * aren't loaded). There is no Settings button: the bumps have no global
 * settings.
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
import { CreditCard, Pencil, Plus } from 'lucide-react';
import {
    CardHead,
    FeatureLayout,
    ProBadge,
    ProductCell,
    RecordList,
} from '@storegrowth/components';
import { useModules, useNavigate } from '@storegrowth/hooks';
import { errorMessage } from '@storegrowth/utilities';

import { bumpsRoute, type OrderBump } from '../api';

/** The module id. */
const MODULE_ID = 'upsell-order-bump';

/** The list's texts. */
const MESSAGES = {
    loadError: __(
        'The order bumps could not be loaded.',
        'storegrowth-sales-booster'
    ),
    deleteTitle: __( 'Delete order bumps?', 'storegrowth-sales-booster' ),
    deleteMessage: __(
        'The selected order bumps will be deleted. This cannot be undone.',
        'storegrowth-sales-booster'
    ),
    deletePartial: __(
        'Some order bumps could not be deleted.',
        'storegrowth-sales-booster'
    ),
    deleteFailed: __(
        'The order bumps could not be deleted.',
        'storegrowth-sales-booster'
    ),
    searchLabel: __( 'Search order bumps', 'storegrowth-sales-booster' ),
    noResults: __(
        'No order bumps match your search',
        'storegrowth-sales-booster'
    ),
};

/**
 * The status switch's accessible name.
 *
 * @param bump Order bump.
 */
function statusLabel( bump: OrderBump ) {
    return sprintf(
        /* translators: %s: order bump name. */
        __( 'Bump status: %s', 'storegrowth-sales-booster' ),
        decodeEntities( bump.name )
    );
}

/**
 * A bump's targets: its categories, or its first product and how many more.
 *
 * @param props      Props.
 * @param props.bump Order bump.
 */
function TargetCell( { bump }: { bump: OrderBump } ) {
    const { targets } = bump;

    if ( bump.target_type === 'categories' && targets.length ) {
        return (
            <span className="flex max-w-[200px] flex-wrap gap-1">
                { targets.map( ( target ) => {
                    return (
                        <Badge key={ target.id } variant="secondary">
                            { decodeEntities( target.name ) }
                        </Badge>
                    );
                } ) }
            </span>
        );
    }

    return (
        <ProductCell
            product={ targets[ 0 ] }
            after={
                targets.length > 1 && (
                    <span className="text-xs text-sg-help">
                        { sprintf(
                            /* translators: %d: number of other target products. */
                            __( '+%d more', 'storegrowth-sales-booster' ),
                            targets.length - 1
                        ) }
                    </span>
                )
            }
        />
    );
}

/**
 * The bumps card: title, Add New and the table.
 */
function BumpList() {
    const navigate = useNavigate();

    const fields: DataViewField< OrderBump >[] = [
        {
            id: 'target',
            label: __( 'Target Product', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                return <TargetCell bump={ item } />;
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
                        product={ item.offer_product_info }
                        after={
                            item.offer_prices && (
                                <span className="flex flex-wrap items-center gap-x-1.5 text-xs">
                                    <s className="text-sg-help">
                                        { item.offer_prices.regular }
                                    </s>
                                    <span className="font-semibold text-sg-heading">
                                        { sprintf(
                                            /* translators: %s: the bump's price. */
                                            __(
                                                'Bump %s',
                                                'storegrowth-sales-booster'
                                            ),
                                            item.offer_prices.offer
                                        ) }
                                    </span>
                                </span>
                            )
                        }
                    />
                );
            },
        },
    ];

    const actions: DataViewAction< OrderBump >[] = [
        {
            id: 'edit',
            label: __( 'Edit', 'storegrowth-sales-booster' ),
            icon: <Pencil size={ 16 } />,
            callback: ( [ item ] ) => {
                navigate( `/upsell-order-bump/${ item.id }` );
            },
        },
    ];

    const addNew = ( canCreate: boolean ) => {
        return (
            <span className="flex items-center gap-3">
                { ! canCreate && <ProBadge /> }
                <Button
                    onClick={ () => {
                        navigate( '/upsell-order-bump/create-bump' );
                    } }
                    disabled={ ! canCreate }
                    className="gap-2"
                >
                    <Plus className="size-4" aria-hidden />
                    { __( 'Add New', 'storegrowth-sales-booster' ) }
                </Button>
            </span>
        );
    };

    // No bumps at all (design `.zero-state`).
    const noBumps = ( canCreate: boolean ) => {
        return (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <CreditCard className="size-10 text-sg-help" aria-hidden />
                <p className="m-0 text-base font-semibold text-sg-heading">
                    { __( 'No order bumps yet', 'storegrowth-sales-booster' ) }
                </p>
                <p className="m-0 max-w-md text-sm text-sg-text">
                    { __(
                        'Create a bump to offer one extra product at checkout, at a discount the shopper accepts in a single click.',
                        'storegrowth-sales-booster'
                    ) }
                </p>
                { addNew( canCreate ) }
            </div>
        );
    };

    return (
        <RecordList< OrderBump >
            route={ bumpsRoute() }
            namespace="storegrowth-order-bump"
            title={ __( 'Order Bumps', 'storegrowth-sales-booster' ) }
            headerActions={ addNew }
            fields={ fields }
            actions={ actions }
            icon={ CreditCard }
            empty={ noBumps }
            statusLabel={ statusLabel }
            messages={ MESSAGES }
        />
    );
}

/**
 * The list page, in the module frame. While the module is off it asks to
 * turn it on (its REST routes aren't loaded).
 *
 * @since SPSG_VERSION
 */
export default function OrderBumpList() {
    const {
        getModule,
        setModuleStatus,
        pending: pendingModules,
    } = useModules();

    // Module off: its bumps can't be listed until it's on.
    if ( ! getModule( MODULE_ID )?.status ) {
        return (
            <FeatureLayout moduleId={ MODULE_ID }>
                <div className="flex w-full flex-col">
                    <CardHead
                        title={ __(
                            'Order Bumps',
                            'storegrowth-sales-booster'
                        ) }
                        className="rounded-b-none"
                    />
                    <div className="flex w-full flex-col items-center gap-4 rounded-b-lg border border-t-0 border-sg-cardline bg-white p-10 text-center">
                        <p className="m-0 text-sm text-sg-text">
                            { __(
                                'Upsell Order Bump is turned off. Turn it on to create and manage order bumps.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                        <Button
                            onClick={ () => {
                                setModuleStatus( MODULE_ID, true ).catch(
                                    ( error ) => {
                                        toast.error(
                                            errorMessage(
                                                error,
                                                __(
                                                    'Upsell Order Bump could not be turned on.',
                                                    'storegrowth-sales-booster'
                                                )
                                            )
                                        );
                                    }
                                );
                            } }
                            disabled={ pendingModules.includes( MODULE_ID ) }
                        >
                            { __(
                                'Turn on Upsell Order Bump',
                                'storegrowth-sales-booster'
                            ) }
                        </Button>
                    </div>
                </div>
            </FeatureLayout>
        );
    }

    return (
        <FeatureLayout moduleId={ MODULE_ID }>
            <BumpList />
        </FeatureLayout>
    );
}
