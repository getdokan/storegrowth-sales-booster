/**
 * Smart Coupons list: title, type, method, status (the switch and, when a
 * coupon that's on isn't running, why), where it's used, uses and discount
 * given, on the shared record list. While the module is off the page asks to
 * turn it on (its REST routes aren't loaded).
 *
 * @since SPSG_VERSION
 */
import {
    Alert,
    AlertDescription,
    Badge,
    Button,
    type DataViewAction,
    type DataViewField,
    toast,
} from '@wedevs/plugin-ui';
import { useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import { Pencil, Plus, TicketPercent } from 'lucide-react';
import {
    CardHead,
    FeatureLayout,
    ProBadge,
    RecordList,
} from '@storegrowth/components';
import { useModules, useNavigate } from '@storegrowth/hooks';
import { errorMessage, getHeaderData } from '@storegrowth/utilities';

import { couponsRoute, type SmartCouponRow } from '../api';

/** The module id. */
const MODULE_ID = 'smart-coupons';

/** The list's texts. */
const MESSAGES = {
    loadError: __(
        'The coupons could not be loaded.',
        'storegrowth-sales-booster'
    ),
    deleteTitle: __( 'Delete coupons?', 'storegrowth-sales-booster' ),
    deleteMessage: __(
        'The selected coupons will be deleted. This cannot be undone.',
        'storegrowth-sales-booster'
    ),
    deletePartial: __(
        'Some coupons could not be deleted.',
        'storegrowth-sales-booster'
    ),
    deleteFailed: __(
        'The coupons could not be deleted.',
        'storegrowth-sales-booster'
    ),
    searchLabel: __( 'Search coupons', 'storegrowth-sales-booster' ),
    noResults: __(
        'No coupons match your search',
        'storegrowth-sales-booster'
    ),
};

const TYPE_LABELS: Record< SmartCouponRow[ 'discount_type' ], string > = {
    percentage: __( 'Percentage', 'storegrowth-sales-booster' ),
    fixed: __( 'Fixed amount', 'storegrowth-sales-booster' ),
    tiers: __( 'Buy more save more', 'storegrowth-sales-booster' ),
    buy_x_get_y: __( 'Buy X get Y', 'storegrowth-sales-booster' ),
};

const METHOD_LABELS: Record< SmartCouponRow[ 'method' ], string > = {
    automatic: __( 'Automatic', 'storegrowth-sales-booster' ),
    code: __( 'Discount code', 'storegrowth-sales-booster' ),
    link: __( 'Link', 'storegrowth-sales-booster' ),
};

/**
 * The status switch's accessible name.
 *
 * @param coupon Coupon.
 */
function statusLabel( coupon: SmartCouponRow ) {
    return sprintf(
        /* translators: %s: coupon title. */
        __( 'Coupon status: %s', 'storegrowth-sales-booster' ),
        decodeEntities( coupon.name )
    );
}

/**
 * What a licence needs to add more coupons: an upgrade or a renewal.
 */
function LimitCard() {
    const { upgrade_url: upgradeUrl, renew_url: renewUrl } =
        getHeaderData().header_info;
    const expired = getHeaderData().header_info.license_state === 'expired';

    return (
        <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-dashed border-sg-stroke bg-white px-4 py-3">
            <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-sg-heading">
                    <ProBadge />
                    { expired
                        ? __(
                              'Renew licence to add more coupons',
                              'storegrowth-sales-booster'
                          )
                        : __(
                              'Upgrade to add more coupons',
                              'storegrowth-sales-booster'
                          ) }
                </span>
                <span className="text-xs text-sg-text">
                    { __(
                        'Free includes one active Smart Coupon. Pro removes the limit.',
                        'storegrowth-sales-booster'
                    ) }
                </span>
            </div>
            <Button
                variant="outline"
                onClick={ () => {
                    window.open(
                        expired && renewUrl ? renewUrl : upgradeUrl,
                        '_blank',
                        'noopener,noreferrer'
                    );
                } }
            >
                { expired
                    ? __( 'Renew licence', 'storegrowth-sales-booster' )
                    : __( 'Upgrade to Pro', 'storegrowth-sales-booster' ) }
            </Button>
        </div>
    );
}

/**
 * The coupons card: heading, New coupon and the table.
 */
function CouponList() {
    const navigate = useNavigate();
    // The server knows the limit; the list reports what it read.
    const [ canCreate, setCanCreate ] = useState( true );

    const fields: DataViewField< SmartCouponRow >[] = [
        {
            id: 'type',
            label: __( 'Type', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                return (
                    <span className="flex flex-wrap items-center gap-1.5">
                        { TYPE_LABELS[ item.discount_type ] }
                        { item.discount_type === 'buy_x_get_y' && (
                            <Badge variant="secondary">
                                { __(
                                    'BOGO module',
                                    'storegrowth-sales-booster'
                                ) }
                            </Badge>
                        ) }
                    </span>
                );
            },
        },
        {
            id: 'method',
            label: __( 'Method', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            render: ( { item } ) => {
                return (
                    <span className="flex flex-wrap items-center gap-1.5">
                        { METHOD_LABELS[ item.method ] }
                        { item.method !== 'automatic' && (
                            <code className="rounded bg-sg-chip px-1 text-xs">
                                { item.code.toUpperCase() }
                            </code>
                        ) }
                    </span>
                );
            },
        },
        {
            id: 'used_in',
            label: __( 'Used in', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            getValue: ( { item } ) => {
                return item.used_in;
            },
        },
        {
            id: 'uses',
            label: __( 'Uses', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            getValue: ( { item } ) => {
                return item.uses;
            },
        },
        {
            id: 'discount_given',
            label: __( 'Discount given', 'storegrowth-sales-booster' ),
            enableHiding: false,
            enableSorting: false,
            getValue: ( { item } ) => {
                return item.discount_given;
            },
        },
    ];

    const actions: DataViewAction< SmartCouponRow >[] = [
        {
            id: 'edit',
            label: __( 'Edit', 'storegrowth-sales-booster' ),
            icon: <Pencil size={ 16 } />,
            callback: ( [ item ] ) => {
                navigate( `/smart-coupons/${ item.id }` );
            },
        },
    ];

    const addNew = ( allowed: boolean ) => {
        return (
            <Button
                onClick={ () => {
                    navigate( '/smart-coupons/new' );
                } }
                disabled={ ! allowed }
                className="gap-2"
            >
                <Plus className="size-4" aria-hidden />
                { __( 'New coupon', 'storegrowth-sales-booster' ) }
            </Button>
        );
    };

    const noCoupons = ( allowed: boolean ) => {
        return (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <TicketPercent className="size-10 text-sg-help" aria-hidden />
                <p className="m-0 text-base font-semibold text-sg-heading">
                    { __( 'No coupons yet', 'storegrowth-sales-booster' ) }
                </p>
                <p className="m-0 max-w-md text-sm text-sg-text">
                    { __(
                        'Create a coupon that applies by itself, or one shoppers type at checkout.',
                        'storegrowth-sales-booster'
                    ) }
                </p>
                { addNew( allowed ) }
            </div>
        );
    };

    return (
        <div className="flex w-full flex-col gap-3">
            { ! window.spsgSmartCoupons?.couponsEnabled && (
                <Alert variant="destructive">
                    <AlertDescription>
                        { __(
                            'Coupons are turned off in WooCommerce > Settings > General. Automatic coupons won’t apply and codes can’t be entered until they’re on.',
                            'storegrowth-sales-booster'
                        ) }
                    </AlertDescription>
                </Alert>
            ) }
            <RecordList< SmartCouponRow >
                route={ couponsRoute() }
                namespace="storegrowth-smart-coupons"
                title={ __( 'Smart Coupons', 'storegrowth-sales-booster' ) }
                headerActions={ addNew }
                fields={ fields }
                actions={ actions }
                icon={ TicketPercent }
                empty={ noCoupons }
                onCanCreate={ setCanCreate }
                statusLabel={ statusLabel }
                statusAfter="method"
                statusNote={ ( item ) => {
                    return (
                        item.chip && (
                            <span className="text-xs text-sg-help">
                                { item.chip }
                            </span>
                        )
                    );
                } }
                messages={ MESSAGES }
            />
            <p className="m-0 text-xs text-sg-help">
                { __(
                    'Code and link coupons also appear in WooCommerce > Coupons, marked Managed by Smart Coupons.',
                    'storegrowth-sales-booster'
                ) }
            </p>
            { ! canCreate && <LimitCard /> }
        </div>
    );
}

/**
 * The list page, in the module frame.
 *
 * @since SPSG_VERSION
 */
export default function SmartCouponList() {
    const {
        getModule,
        setModuleStatus,
        pending: pendingModules,
    } = useModules();

    if (
        ! getModule( MODULE_ID )?.status ||
        pendingModules.includes( MODULE_ID )
    ) {
        return (
            <FeatureLayout moduleId={ MODULE_ID }>
                <div className="flex w-full flex-col">
                    <CardHead
                        title={ __(
                            'Smart Coupons',
                            'storegrowth-sales-booster'
                        ) }
                        className="rounded-b-none"
                    />
                    <div className="flex w-full flex-col items-center gap-4 rounded-b-lg border border-t-0 border-sg-cardline bg-white p-10 text-center">
                        <p className="m-0 text-sm text-sg-text">
                            { __(
                                'Smart Coupons is turned off. While it’s off, its coupons are invalid. Turn it on to create and manage coupons.',
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
                                                    'Smart Coupons could not be turned on.',
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
                                'Turn on Smart Coupons',
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
            <CouponList />
        </FeatureLayout>
    );
}
