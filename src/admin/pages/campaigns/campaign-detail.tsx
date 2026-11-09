/**
 * One campaign (`#/campaigns/<id>`): readiness or report in the main area,
 * the right rail (Runs, Products, Offers, Campaign price, Surfaces, Link).
 * Expired stores see it read-only (ADR-016).
 *
 * @since SPSG_VERSION
 */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    Notice,
    Switch,
    toast,
} from '@wedevs/plugin-ui';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { ArrowLeft } from 'lucide-react';
import {
    Card,
    MultiSelectField,
    ReportFigure,
    SaveBar,
} from '@storegrowth/components';
import {
    Navigate,
    useModules,
    useNavigate,
    useParams,
} from '@storegrowth/hooks';
import {
    errorMessage,
    fetchProductCategories,
    fetchProductsByIds,
    formatMoney,
    getHeaderData,
    searchProducts,
} from '@storegrowth/utilities';

import {
    deleteCampaign,
    deletePreview,
    fetchCampaign,
    removeOffer,
    runAction,
    saveCampaign,
    type CampaignDetail,
    type CampaignOffer,
    type CampaignSettings,
    type OfferKind,
    type ReadinessLine,
} from './api';
import { AttachDrawer } from './attach-drawer';
import { OFFER_LABELS, STATUS_LABELS, SURFACES, surfaceLabel } from './labels';
import { campaignMode } from './licence';
import { NewCampaignDialog } from './new-campaign-dialog';

type Draft = Pick<
    CampaignDetail,
    'name' | 'starts_at' | 'ends_at' | 'settings'
>;

/** A readiness line's button. */
interface Fix {
    label: string;
    run: () => void;
}

/** Each kind's editor route. */
const EDITOR_ROUTES: Record< OfferKind, string > = {
    smart_coupon: '/smart-coupons',
    bogo: '/bogo',
    order_bump: '/upsell-order-bump',
};

const productSearch = {
    onSearch: ( search: string ) => {
        return searchProducts( search ).then( ( products ) => {
            return products.map( ( product ) => {
                return { value: product.id, label: product.name };
            } );
        } );
    },
    resolve: ( ids: Array< string | number > ) => {
        return fetchProductsByIds( ids.map( Number ) ).then( ( products ) => {
            return products.map( ( product ) => {
                return { value: product.id, label: product.name };
            } );
        } );
    },
};

/**
 * A datetime-local value from a stored `Y-m-d H:i:s`.
 *
 * @param value Stored value.
 */
function toInput( value: string | null ): string {
    return value ? value.slice( 0, 16 ).replace( ' ', 'T' ) : '';
}

/**
 * A stored value from a datetime-local one.
 *
 * @param value Input value.
 */
function fromInput( value: string ): string | null {
    return value ? `${ value.replace( 'T', ' ' ) }:00` : null;
}

/**
 * The categories, for the Products card's picker.
 */
function useCategoryOptions() {
    const [ options, setOptions ] = useState<
        Array< { value: number; label: string } >
    >( [] );

    useEffect( () => {
        fetchProductCategories()
            .then( ( categories ) => {
                setOptions(
                    categories.map( ( category ) => {
                        return {
                            value: Number( category.value ),
                            label: category.label,
                        };
                    } )
                );
            } )
            .catch( () => {
                setOptions( [] );
            } );
    }, [] );

    return options;
}

/**
 * The readiness lines and overlap notes.
 *
 * @param props        Props.
 * @param props.checks Lines.
 * @param props.fixes  A line's fix buttons.
 */
function Checks( {
    checks,
    fixes,
}: {
    checks: ReadinessLine[];
    fixes: ( line: ReadinessLine ) => Fix[];
} ) {
    if ( ! checks.length ) {
        return null;
    }

    return (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
            { checks.map( ( line ) => {
                return (
                    <li
                        key={ line.code + line.message }
                        className="flex flex-col gap-2 text-sm text-sg-text"
                    >
                        <span className="flex items-start gap-2">
                            <Badge
                                variant={
                                    line.kind === 'blocking'
                                        ? 'destructive'
                                        : 'secondary'
                                }
                            >
                                { line.kind }
                            </Badge>
                            { line.message }
                        </span>
                        { fixes( line ).length > 0 && (
                            <span className="flex flex-wrap gap-2">
                                { fixes( line ).map( ( fix ) => {
                                    return (
                                        <Button
                                            key={ fix.label }
                                            size="sm"
                                            variant="outline"
                                            onClick={ fix.run }
                                        >
                                            { fix.label }
                                        </Button>
                                    );
                                } ) }
                            </span>
                        ) }
                    </li>
                );
            } ) }
        </ul>
    );
}

/**
 * What happens when a draft's campaign ends.
 *
 * @param props          Props.
 * @param props.campaign Campaign.
 */
function WhenItEnds( { campaign }: { campaign: CampaignDetail } ) {
    let text: string = __(
        'No dates yet. Set the start and end in Runs to schedule this campaign.',
        'storegrowth-sales-booster'
    );

    if ( campaign.starts_at && ! campaign.ends_at ) {
        text = __(
            'This campaign is always on. It runs until you pause or end it, and the report keeps counting.',
            'storegrowth-sales-booster'
        );
    } else if ( campaign.starts_at && campaign.ends_at ) {
        text = sprintf(
            /* translators: %s: end date. */
            __(
                'On %s the offers go back to their everyday versions, the surfaces hide and the report freezes. The countdown ends with the campaign.',
                'storegrowth-sales-booster'
            ),
            campaign.ends_at.slice( 0, 16 )
        );

        if ( campaign.settings.campaign_price?.percent ) {
            text = `${ text } ${ __(
                "Products' own Countdown settings return.",
                'storegrowth-sales-booster'
            ) }`;
        }
    }

    return <p className="m-0 text-sm text-sg-text">{ text }</p>;
}

/**
 * The main area's report: revenue, orders, surfaces, store context.
 *
 * @param props          Props.
 * @param props.campaign Campaign.
 */
function Report( { campaign }: { campaign: CampaignDetail } ) {
    const { report } = campaign;
    const money = ( amount: number ) => {
        return formatMoney( amount, campaign.price_format );
    };
    const surfaces = Object.entries( report.surfaces );

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Card>
                    <ReportFigure
                        label={ __(
                            'Attributed revenue',
                            'storegrowth-sales-booster'
                        ) }
                        value={ money( report.revenue ) }
                        hint={ sprintf(
                            /* translators: %d: attribution window days. */
                            __(
                                'Orders where a campaign offer applied, plus orders within %d days of a link visit',
                                'storegrowth-sales-booster'
                            ),
                            campaign.window
                        ) }
                    />
                </Card>
                <Card>
                    <ReportFigure
                        label={ __( 'Orders', 'storegrowth-sales-booster' ) }
                        value={ String( report.orders ) }
                        hint={ __(
                            'Same rule as revenue',
                            'storegrowth-sales-booster'
                        ) }
                    />
                </Card>
                <Card>
                    <ReportFigure
                        label={ __(
                            'Offer acceptance',
                            'storegrowth-sales-booster'
                        ) }
                        value={
                            report.acceptance === null
                                ? '--'
                                : `${ report.acceptance }%`
                        }
                        hint={ __(
                            'Carts that qualified and checked out (estimated)',
                            'storegrowth-sales-booster'
                        ) }
                    />
                </Card>
                <Card>
                    <ReportFigure
                        label={ __(
                            'AOV change',
                            'storegrowth-sales-booster'
                        ) }
                        value={
                            report.aov_change === null
                                ? '--'
                                : `${ report.aov_change > 0 ? '+' : '' }${
                                      report.aov_change
                                  }%`
                        }
                        hint={ __(
                            'Campaign orders vs the 30 days before',
                            'storegrowth-sales-booster'
                        ) }
                    />
                </Card>
            </div>
            { report.store && (
                <p className="m-0 text-sm text-sg-text">
                    { sprintf(
                        /* translators: 1: revenue, 2: signed percent change per day. */
                        __(
                            'Store during campaign: %1$s, %2$s%% a day vs the 30 days before',
                            'storegrowth-sales-booster'
                        ),
                        money( report.store.revenue ),
                        report.store.change === null
                            ? '--'
                            : `${ report.store.change > 0 ? '+' : '' }${
                                  report.store.change
                              }`
                    ) }
                    <br />
                    <span className="text-xs text-sg-help">
                        { __(
                            'All store orders in the window. Context only, not credited to the campaign.',
                            'storegrowth-sales-booster'
                        ) }
                    </span>
                </p>
            ) }
            <Card
                title={ __(
                    'Which surface led to the sale',
                    'storegrowth-sales-booster'
                ) }
            >
                { surfaces.length ? (
                    <ul className="m-0 list-none p-0">
                        { surfaces.map( ( [ id, orders ] ) => {
                            return (
                                <li
                                    key={ id }
                                    className="flex justify-between py-1 text-sm"
                                >
                                    <span>{ surfaceLabel( id ) }</span>
                                    <span>{ orders }</span>
                                </li>
                            );
                        } ) }
                    </ul>
                ) : (
                    <p className="m-0 text-sm text-sg-muted">
                        { __(
                            "Orders from before 3.1 can't be credited to a campaign.",
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                ) }
            </Card>
            <Card title={ __( 'Revenue by day', 'storegrowth-sales-booster' ) }>
                <ul className="m-0 list-none p-0">
                    { Object.entries( report.daily ).map(
                        ( [ day, revenue ] ) => {
                            return (
                                <li
                                    key={ day }
                                    className="flex justify-between py-1 text-sm"
                                >
                                    <span>{ day }</span>
                                    <span>{ money( revenue ) }</span>
                                </li>
                            );
                        }
                    ) }
                </ul>
            </Card>
        </div>
    );
}

/**
 * The offers card of the rail.
 *
 * @param props           Props.
 * @param props.campaign  Campaign.
 * @param props.readOnly  No edits.
 * @param props.onChanged Reload the campaign.
 * @param props.drawer    Whether the Add offer drawer is open.
 * @param props.setDrawer Open or close the drawer.
 */
function OffersCard( {
    campaign,
    readOnly,
    onChanged,
    drawer,
    setDrawer,
}: {
    campaign: CampaignDetail;
    readOnly: boolean;
    onChanged: ( next: CampaignDetail ) => void;
    drawer: boolean;
    setDrawer: ( open: boolean ) => void;
} ) {
    const navigate = useNavigate();
    const [ confirmRow, setConfirmRow ] = useState< CampaignOffer | null >(
        null
    );

    const remove = async ( offer: CampaignOffer, keep: boolean ) => {
        try {
            onChanged( await removeOffer( campaign.id, offer.row, keep ) );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The offer could not be removed.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
        setConfirmRow( null );
    };

    return (
        <Card title={ __( 'Offers', 'storegrowth-sales-booster' ) }>
            <div className="flex flex-col gap-2">
                { ! campaign.offers.length && (
                    <p className="m-0 text-sm text-sg-muted">
                        { __(
                            'No offer attached. A campaign without an offer is allowed; attribution then uses the link and surface clicks.',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                ) }
                { campaign.offers.map( ( offer ) => {
                    return (
                        <div
                            key={ offer.row }
                            className="flex flex-col gap-1 border-b border-sg-stroke pb-2"
                        >
                            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-sg-heading">
                                { offer.name ||
                                    __(
                                        '(no name)',
                                        'storegrowth-sales-booster'
                                    ) }
                                <Badge variant="secondary">
                                    { OFFER_LABELS[ offer.kind ] }
                                </Badge>
                                <Badge variant="outline">
                                    { offer.attached
                                        ? __(
                                              'Attached',
                                              'storegrowth-sales-booster'
                                          )
                                        : __(
                                              'Campaign-only',
                                              'storegrowth-sales-booster'
                                          ) }
                                </Badge>
                            </span>
                            { ! readOnly && (
                                <span className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={ () => {
                                            if ( offer.coupon_id ) {
                                                navigate(
                                                    `/smart-coupons/${ offer.coupon_id }`
                                                );
                                                return;
                                            }

                                            navigate(
                                                `${
                                                    EDITOR_ROUTES[ offer.kind ]
                                                }/${
                                                    offer.attached
                                                        ? offer.offer_id
                                                        : offer.row
                                                }?campaign=${
                                                    campaign.id
                                                }&row=${ offer.row }${
                                                    offer.attached
                                                        ? ''
                                                        : '&only=1'
                                                }`
                                            );
                                        } }
                                    >
                                        { __(
                                            'Edit',
                                            'storegrowth-sales-booster'
                                        ) }
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={ () => {
                                            setConfirmRow( offer );
                                        } }
                                    >
                                        { __(
                                            'Remove',
                                            'storegrowth-sales-booster'
                                        ) }
                                    </Button>
                                </span>
                            ) }
                        </div>
                    );
                } ) }
                { ! readOnly && (
                    <Button
                        variant="outline"
                        onClick={ () => {
                            setDrawer( true );
                        } }
                    >
                        { __( 'Add offer', 'storegrowth-sales-booster' ) }
                    </Button>
                ) }
                <p className="m-0 text-xs text-sg-help">
                    { __(
                        "Deals created by vendors can't be added to campaigns.",
                        'storegrowth-sales-booster'
                    ) }
                </p>
            </div>
            { drawer && (
                <AttachDrawer
                    campaign={ campaign }
                    onClose={ () => {
                        setDrawer( false );
                    } }
                    onChanged={ onChanged }
                />
            ) }
            <AlertDialog
                open={ !! confirmRow }
                onOpenChange={ ( open: boolean ) => {
                    if ( ! open ) {
                        setConfirmRow( null );
                    }
                } }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            { __(
                                'Remove this offer?',
                                'storegrowth-sales-booster'
                            ) }
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            { confirmRow?.attached
                                ? __(
                                      'It goes back to its everyday version.',
                                      'storegrowth-sales-booster'
                                  )
                                : __(
                                      'A campaign-only offer is deleted, unless you keep it as an everyday offer.',
                                      'storegrowth-sales-booster'
                                  ) }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            { __( 'Cancel', 'storegrowth-sales-booster' ) }
                        </AlertDialogCancel>
                        { confirmRow && ! confirmRow.attached && (
                            <AlertDialogAction
                                onClick={ () => {
                                    remove( confirmRow, true );
                                } }
                            >
                                { __(
                                    'Keep as everyday offer',
                                    'storegrowth-sales-booster'
                                ) }
                            </AlertDialogAction>
                        ) }
                        <AlertDialogAction
                            onClick={ () => {
                                if ( confirmRow ) {
                                    remove( confirmRow, false );
                                }
                            } }
                        >
                            { confirmRow?.attached
                                ? __( 'Remove', 'storegrowth-sales-booster' )
                                : __(
                                      'Delete it',
                                      'storegrowth-sales-booster'
                                  ) }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

/**
 * @since SPSG_VERSION
 */
export default function CampaignDetailPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const campaignId = Number( id );
    const mode = campaignMode();
    const [ campaign, setCampaign ] = useState< CampaignDetail | null >( null );
    const [ draft, setDraft ] = useState< Draft | null >( null );
    const [ busy, setBusy ] = useState( false );
    const [ error, setError ] = useState( '' );
    const [ deleting, setDeleting ] = useState< string[] | null >( null );
    const [ drawer, setDrawer ] = useState( false );
    const [ templates, setTemplates ] = useState( false );
    const [ listed, setListed ] = useState< string[] | null >( null );
    const { getModule, setModuleStatus } = useModules();
    const categories = useCategoryOptions();

    const apply = useCallback( ( next: CampaignDetail ) => {
        setCampaign( next );
        setDraft( {
            name: next.name,
            starts_at: next.starts_at,
            ends_at: next.ends_at,
            settings: next.settings,
        } );
    }, [] );

    useEffect( () => {
        fetchCampaign( campaignId )
            .then( apply )
            .catch( ( problem ) => {
                setError(
                    errorMessage(
                        problem,
                        __(
                            'The campaign could not be loaded.',
                            'storegrowth-sales-booster'
                        )
                    )
                );
            } );
    }, [ campaignId, apply ] );

    if ( mode === 'free' ) {
        return <Navigate to="/campaigns" replace />;
    }

    if ( error ) {
        return <Notice variant="destructive">{ error }</Notice>;
    }

    if ( ! campaign || ! draft ) {
        return null;
    }

    // An ended campaign's report and settings are frozen.
    const readOnly = campaign.read_only || campaign.status === 'ended';
    const settings = draft.settings;
    const set = ( next: Partial< Draft > ) => {
        setDraft( { ...draft, ...next } );
    };
    const setSettings = ( next: Partial< Draft[ 'settings' ] > ) => {
        set( { settings: { ...settings, ...next } } );
    };

    const act = async ( action: string ) => {
        setBusy( true );
        try {
            const next = await runAction( campaign.id, action );

            if ( next.id !== campaign.id ) {
                navigate( `/campaigns/${ next.id }` );
                return;
            }
            apply( next );
        } catch ( problem ) {
            toast.error(
                errorMessage(
                    problem,
                    __( 'That action failed.', 'storegrowth-sales-booster' )
                )
            );
        }
        setBusy( false );
    };

    /**
     * Save a fix's answer; unsaved edits on the page stay.
     *
     * @param changes Settings the fix changes.
     */
    const decide = async ( changes: CampaignSettings ) => {
        try {
            setCampaign(
                await saveCampaign( campaign.id, { settings: changes } )
            );
            setSettings( changes );
        } catch ( problem ) {
            toast.error(
                errorMessage(
                    problem,
                    __( 'That action failed.', 'storegrowth-sales-booster' )
                )
            );
        }
    };

    const decided = ( code: string, extra: CampaignSettings = {} ) => {
        decide( {
            ...extra,
            decisions: { ...settings.decisions, [ code ]: true },
        } );
    };

    const removeRow = async ( row: number ) => {
        try {
            const next = await removeOffer( campaign.id, row, false );

            setCampaign( next );
        } catch ( problem ) {
            toast.error(
                errorMessage(
                    problem,
                    __(
                        'The offer could not be removed.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    const enableModule = async ( module: string ) => {
        try {
            await setModuleStatus( module, true );
            setCampaign( await fetchCampaign( campaign.id ) );
        } catch ( problem ) {
            toast.error(
                errorMessage(
                    problem,
                    __( 'That action failed.', 'storegrowth-sales-booster' )
                )
            );
        }
    };

    /**
     * The buttons of a readiness line.
     *
     * @param line Readiness line.
     */
    const fixes = ( line: ReadinessLine ): Fix[] => {
        if ( readOnly ) {
            return [];
        }

        const products = line.data.products ?? [];
        const list = () => {
            setListed( products );
        };

        if ( line.fix === 'dates' ) {
            return [
                {
                    label: __( 'Edit dates', 'storegrowth-sales-booster' ),
                    run: () => {
                        document
                            .getElementById( 'spsg-campaign-start' )
                            ?.focus();
                    },
                },
            ];
        }

        if ( line.fix === 'on_sale' ) {
            return [
                {
                    label: __( 'Exclude', 'storegrowth-sales-booster' ),
                    run: () => {
                        decided( line.code, { exclude_on_sale: true } );
                    },
                },
                {
                    label: __( 'Stack', 'storegrowth-sales-booster' ),
                    run: () => {
                        decided( line.code, { exclude_on_sale: false } );
                    },
                },
            ];
        }

        if ( line.fix === 'see_products' ) {
            return [
                {
                    label: __( 'See products', 'storegrowth-sales-booster' ),
                    run: list,
                },
            ];
        }

        if ( line.fix === 'review_products' ) {
            return [
                {
                    label: __( 'Review products', 'storegrowth-sales-booster' ),
                    run: list,
                },
                {
                    label: __( 'OK', 'storegrowth-sales-booster' ),
                    run: () => {
                        decided( line.code );
                    },
                },
            ];
        }

        if ( line.fix === 'bogo_coupon' ) {
            return [
                {
                    label: __( 'Remove rule', 'storegrowth-sales-booster' ),
                    run: () => {
                        removeRow( Number( line.data.rule_row ) );
                    },
                },
                {
                    label: __( 'Remove coupon', 'storegrowth-sales-booster' ),
                    run: () => {
                        removeRow( Number( line.data.coupon_row ) );
                    },
                },
                {
                    label: __( 'Keep both', 'storegrowth-sales-booster' ),
                    run: () => {
                        decided( line.code );
                    },
                },
            ];
        }

        if ( line.fix === 'attach_offer' ) {
            return [
                {
                    label: __( 'Attach offer', 'storegrowth-sales-booster' ),
                    run: () => {
                        setDrawer( true );
                    },
                },
            ];
        }

        if ( line.fix === 'renew' ) {
            const info = getHeaderData().header_info;

            return [
                {
                    label: __( 'Renew licence', 'storegrowth-sales-booster' ),
                    run: () => {
                        window.open(
                            info.renew_url || info.upgrade_url,
                            '_blank',
                            'noopener,noreferrer'
                        );
                    },
                },
            ];
        }

        if ( line.fix.startsWith( 'enable_module:' ) ) {
            const module = line.fix.replace( 'enable_module:', '' );

            return [
                {
                    label: sprintf(
                        /* translators: %s: module name. */
                        __( 'Enable %s', 'storegrowth-sales-booster' ),
                        getModule( module )?.name ?? module
                    ),
                    run: () => {
                        enableModule( module );
                    },
                },
            ];
        }

        return [];
    };

    const save = async () => {
        setBusy( true );
        try {
            apply( await saveCampaign( campaign.id, draft ) );
            toast.success( __( 'Saved.', 'storegrowth-sales-booster' ) );
        } catch ( problem ) {
            toast.error(
                errorMessage(
                    problem,
                    __(
                        'The campaign could not be saved.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
        setBusy( false );
    };

    const remove = async () => {
        try {
            await deleteCampaign( campaign.id );
            navigate( '/campaigns' );
        } catch ( problem ) {
            toast.error(
                errorMessage(
                    problem,
                    __(
                        'The campaign could not be deleted.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    const startDelete = async () => {
        try {
            setDeleting( ( await deletePreview( campaign.id ) ).campaign_only );
        } catch ( problem ) {
            toast.error(
                errorMessage(
                    problem,
                    __( 'That action failed.', 'storegrowth-sales-booster' )
                )
            );
        }
    };

    const actions: Record< string, Array< { id: string; label: string } > > = {
        draft: [
            { id: 'clone', label: __( 'Clone', 'storegrowth-sales-booster' ) },
        ],
        scheduled: [
            { id: 'clone', label: __( 'Clone', 'storegrowth-sales-booster' ) },
            {
                id: 'unpublish',
                label: __( 'Unpublish', 'storegrowth-sales-booster' ),
            },
        ],
        running: [
            { id: 'pause', label: __( 'Pause', 'storegrowth-sales-booster' ) },
            { id: 'end', label: __( 'End now', 'storegrowth-sales-booster' ) },
            { id: 'clone', label: __( 'Clone', 'storegrowth-sales-booster' ) },
        ],
        paused: [
            {
                id: 'resume',
                label: __( 'Resume', 'storegrowth-sales-booster' ),
            },
        ],
        ended: [
            { id: 'clone', label: __( 'Clone', 'storegrowth-sales-booster' ) },
        ],
    };

    const { report } = campaign;
    const aovText =
        report.aov_change === null
            ? '--'
            : `${ report.aov_change > 0 ? '+' : '' }${ report.aov_change }%`;

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={ __(
                            'Back to campaigns',
                            'storegrowth-sales-booster'
                        ) }
                        onClick={ () => {
                            navigate( '/campaigns' );
                        } }
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                    </Button>
                    <h1 className="m-0 text-xl font-semibold text-sg-heading">
                        { campaign.name }
                    </h1>
                    <Badge variant="secondary">
                        { STATUS_LABELS[ campaign.status ] }
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                    { ! readOnly && campaign.status === 'draft' && (
                        <>
                            <Button
                                variant="outline"
                                disabled={ busy }
                                onClick={ () => {
                                    setTemplates( true );
                                } }
                            >
                                { __(
                                    'Use template',
                                    'storegrowth-sales-booster'
                                ) }
                            </Button>
                            <Button
                                disabled={ busy || ! campaign.can_publish }
                                onClick={ () => {
                                    act( 'publish' );
                                } }
                            >
                                { __( 'Publish', 'storegrowth-sales-booster' ) }
                            </Button>
                        </>
                    ) }
                    { ! campaign.read_only &&
                        ( actions[ campaign.status ] ?? [] ).map(
                            ( action ) => {
                                return (
                                    <Button
                                        key={ action.id }
                                        variant="outline"
                                        disabled={ busy }
                                        onClick={ () => {
                                            act( action.id );
                                        } }
                                    >
                                        { action.label }
                                    </Button>
                                );
                            }
                        ) }
                    { ! campaign.read_only && (
                        <Button variant="outline" onClick={ startDelete }>
                            { __( 'Delete', 'storegrowth-sales-booster' ) }
                        </Button>
                    ) }
                </div>
            </div>
            { campaign.status === 'paused' && campaign.paused_at && (
                <Notice>
                    { sprintf(
                        /* translators: %s: pause date. */
                        __(
                            'Paused since %s. Offers are back to their everyday versions and surfaces are off.',
                            'storegrowth-sales-booster'
                        ),
                        campaign.paused_at.slice( 0, 10 )
                    ) }
                </Notice>
            ) }
            { campaign.status === 'scheduled' && campaign.starts_at && (
                <Notice>
                    { sprintf(
                        /* translators: 1: days until the start, 2: start date and time. */
                        __(
                            'Starts in %1$d days, on %2$s',
                            'storegrowth-sales-booster'
                        ),
                        Math.max(
                            0,
                            Math.ceil(
                                ( new Date(
                                    campaign.starts_at.replace( ' ', 'T' )
                                ).getTime() -
                                    Date.now() ) /
                                    86400000
                            )
                        ),
                        campaign.starts_at
                    ) }
                </Notice>
            ) }
            { campaign.status === 'ended' && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sg-stroke bg-white p-4 text-sm text-sg-text">
                    <span>
                        { sprintf(
                            /* translators: 1: campaign name, 2: revenue, 3: orders, 4: AOV change, 5: end date. */
                            __(
                                '%1$s earned %2$s from %3$d orders, with AOV %4$s vs the 30 days before. Ended %5$s.',
                                'storegrowth-sales-booster'
                            ),
                            campaign.name,
                            formatMoney(
                                report.revenue,
                                campaign.price_format
                            ),
                            report.orders,
                            aovText,
                            ( campaign.ends_at ?? '' ).slice( 0, 10 )
                        ) }
                    </span>
                    { ! campaign.read_only && (
                        <Button
                            disabled={ busy }
                            onClick={ () => {
                                act( 'clone' );
                            } }
                        >
                            { __( 'Run again', 'storegrowth-sales-booster' ) }
                        </Button>
                    ) }
                </div>
            ) }
            { campaign.status === 'running' && ! readOnly && (
                <p className="m-0 text-sm text-sg-muted">
                    { __(
                        'Changes apply immediately',
                        'storegrowth-sales-booster'
                    ) }
                </p>
            ) }

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
                <div className="flex flex-col gap-4">
                    { campaign.status === 'draft' ? (
                        <>
                            <Card
                                title={ __(
                                    'Readiness',
                                    'storegrowth-sales-booster'
                                ) }
                            >
                                <Checks
                                    checks={ campaign.checks }
                                    fixes={ fixes }
                                />
                            </Card>
                            <Card
                                title={ __(
                                    'When it ends',
                                    'storegrowth-sales-booster'
                                ) }
                            >
                                <WhenItEnds campaign={ campaign } />
                            </Card>
                        </>
                    ) : (
                        <Report campaign={ campaign } />
                    ) }
                </div>

                <div className="flex flex-col gap-4">
                    <Card title={ __( 'Runs', 'storegrowth-sales-booster' ) }>
                        <div className="flex flex-col gap-2">
                            { campaign.status !== 'draft' && (
                                <Checks
                                    checks={ campaign.checks }
                                    fixes={ fixes }
                                />
                            ) }
                            <label
                                className="text-xs text-sg-muted"
                                htmlFor="spsg-campaign-name"
                            >
                                { __( 'Name', 'storegrowth-sales-booster' ) }
                            </label>
                            <Input
                                id="spsg-campaign-name"
                                value={ draft.name }
                                disabled={ readOnly }
                                onChange={ ( event ) => {
                                    set( { name: event.target.value } );
                                } }
                            />
                            <label
                                className="text-xs text-sg-muted"
                                htmlFor="spsg-campaign-start"
                            >
                                { __( 'Start', 'storegrowth-sales-booster' ) }
                            </label>
                            <Input
                                id="spsg-campaign-start"
                                type="datetime-local"
                                value={ toInput( draft.starts_at ) }
                                disabled={ readOnly }
                                onChange={ ( event ) => {
                                    set( {
                                        starts_at: fromInput(
                                            event.target.value
                                        ),
                                    } );
                                } }
                            />
                            <label
                                className="text-xs text-sg-muted"
                                htmlFor="spsg-campaign-end"
                            >
                                { __( 'End', 'storegrowth-sales-booster' ) }
                            </label>
                            <Input
                                id="spsg-campaign-end"
                                type="datetime-local"
                                value={ toInput( draft.ends_at ) }
                                disabled={ readOnly }
                                onChange={ ( event ) => {
                                    set( {
                                        ends_at: fromInput(
                                            event.target.value
                                        ),
                                    } );
                                } }
                            />
                            <span className="text-xs text-sg-help">
                                { campaign.timezone }
                            </span>
                            { ! draft.ends_at && (
                                <Badge variant="secondary">
                                    { __(
                                        'Always on',
                                        'storegrowth-sales-booster'
                                    ) }
                                </Badge>
                            ) }
                        </div>
                    </Card>

                    <Card
                        title={ __( 'Products', 'storegrowth-sales-booster' ) }
                    >
                        { campaign.scope.derived ? (
                            <div className="text-sm text-sg-text">
                                <p className="m-0">
                                    { campaign.scope.all
                                        ? __(
                                              'Entire store',
                                              'storegrowth-sales-booster'
                                          )
                                        : sprintf(
                                              /* translators: 1: products, 2: categories. */ __(
                                                  '%1$d products, %2$d categories',
                                                  'storegrowth-sales-booster'
                                              ),
                                              campaign.scope.products.length,
                                              campaign.scope.categories.length
                                          ) }
                                </p>
                                <p className="m-0 text-xs text-sg-help">
                                    { __(
                                        'From attached offers and campaign price',
                                        'storegrowth-sales-booster'
                                    ) }
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <MultiSelectField
                                    label={ __(
                                        'Categories',
                                        'storegrowth-sales-booster'
                                    ) }
                                    options={ categories }
                                    value={ settings.categories ?? [] }
                                    locked={ readOnly }
                                    onChange={ ( next ) => {
                                        setSettings( {
                                            categories: next.map( Number ),
                                        } );
                                    } }
                                />
                                <MultiSelectField
                                    { ...productSearch }
                                    label={ __(
                                        'Products',
                                        'storegrowth-sales-booster'
                                    ) }
                                    value={ settings.products ?? [] }
                                    locked={ readOnly }
                                    onChange={ ( next ) => {
                                        setSettings( {
                                            products: next.map( Number ),
                                        } );
                                    } }
                                />
                            </div>
                        ) }
                    </Card>

                    <OffersCard
                        campaign={ campaign }
                        readOnly={ readOnly }
                        onChanged={ apply }
                        drawer={ drawer }
                        setDrawer={ setDrawer }
                    />

                    <Card
                        title={ __(
                            'Campaign price',
                            'storegrowth-sales-booster'
                        ) }
                    >
                        <div className="flex flex-col gap-2">
                            <span className="flex items-center justify-between text-sm">
                                { __(
                                    '% off these products',
                                    'storegrowth-sales-booster'
                                ) }
                                <Badge variant="secondary">
                                    { __(
                                        'Countdown',
                                        'storegrowth-sales-booster'
                                    ) }
                                </Badge>
                            </span>
                            <Input
                                type="number"
                                min={ 0 }
                                max={ 100 }
                                aria-label={ __(
                                    'Percent off',
                                    'storegrowth-sales-booster'
                                ) }
                                value={ settings.campaign_price?.percent ?? 0 }
                                disabled={ readOnly }
                                onChange={ ( event ) => {
                                    setSettings( {
                                        campaign_price: {
                                            ...settings.campaign_price,
                                            percent: Number(
                                                event.target.value
                                            ),
                                        },
                                    } );
                                } }
                            />
                            <MultiSelectField
                                { ...productSearch }
                                label={ __(
                                    'Campaign price products',
                                    'storegrowth-sales-booster'
                                ) }
                                value={
                                    settings.campaign_price?.products ?? []
                                }
                                locked={ readOnly }
                                onChange={ ( next ) => {
                                    setSettings( {
                                        campaign_price: {
                                            ...settings.campaign_price,
                                            products: next.map( Number ),
                                        },
                                    } );
                                } }
                            />
                            <p className="m-0 text-xs text-sg-help">
                                { __(
                                    "Products' own Countdown settings are kept and return after the campaign.",
                                    'storegrowth-sales-booster'
                                ) }
                            </p>
                        </div>
                    </Card>

                    <Card
                        title={ __( 'Surfaces', 'storegrowth-sales-booster' ) }
                    >
                        <div className="flex flex-col gap-3">
                            { SURFACES.map( ( surface ) => {
                                const current = settings.surfaces?.[
                                    surface.id
                                ] ?? { enabled: false, copy: '' };
                                const update = (
                                    next: Partial< typeof current >
                                ) => {
                                    setSettings( {
                                        surfaces: {
                                            ...settings.surfaces,
                                            [ surface.id ]: {
                                                ...current,
                                                ...next,
                                            },
                                        },
                                    } );
                                };

                                return (
                                    <div
                                        key={ surface.id }
                                        className="flex flex-col gap-1"
                                    >
                                        <span className="flex items-center justify-between text-sm text-sg-heading">
                                            { surface.label }
                                            <Switch
                                                checked={ current.enabled }
                                                disabled={ readOnly }
                                                aria-label={ surface.label }
                                                onCheckedChange={ (
                                                    enabled: boolean
                                                ) => {
                                                    update( { enabled } );
                                                } }
                                            />
                                        </span>
                                        { current.enabled &&
                                            surface.id !== 'countdown' &&
                                            surface.id !== 'sales_pop' && (
                                                <Input
                                                    aria-label={ __(
                                                        'Copy',
                                                        'storegrowth-sales-booster'
                                                    ) }
                                                    placeholder={ __(
                                                        'Campaign copy',
                                                        'storegrowth-sales-booster'
                                                    ) }
                                                    value={ current.copy }
                                                    disabled={ readOnly }
                                                    onChange={ ( event ) => {
                                                        update( {
                                                            copy: event.target
                                                                .value,
                                                        } );
                                                    } }
                                                />
                                            ) }
                                        { surface.help && (
                                            <span className="text-xs text-sg-help">
                                                { surface.help }
                                            </span>
                                        ) }
                                    </div>
                                );
                            } ) }
                        </div>
                    </Card>

                    <Card
                        title={ __(
                            'Campaign link',
                            'storegrowth-sales-booster'
                        ) }
                    >
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={ `${ campaign.home_url }?sg=${ campaign.slug }` }
                                aria-label={ __(
                                    'Campaign link',
                                    'storegrowth-sales-booster'
                                ) }
                            />
                            <Button
                                variant="outline"
                                onClick={ () => {
                                    window.navigator.clipboard.writeText(
                                        `${ campaign.home_url }?sg=${ campaign.slug }`
                                    );
                                    toast.success(
                                        __(
                                            'Copied.',
                                            'storegrowth-sales-booster'
                                        )
                                    );
                                } }
                            >
                                { __( 'Copy', 'storegrowth-sales-booster' ) }
                            </Button>
                        </div>
                        <p className="m-0 mt-2 text-xs text-sg-help">
                            { __(
                                'Applies the offer and credits this campaign. Use it in ads, email, Texty.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    </Card>

                    { ! readOnly && (
                        <SaveBar onSave={ save } saving={ busy } />
                    ) }
                </div>
            </div>

            { templates && (
                <NewCampaignDialog
                    campaignId={ campaign.id }
                    onApplied={ apply }
                    onClose={ () => {
                        setTemplates( false );
                    } }
                />
            ) }

            <Dialog
                open={ listed !== null }
                onOpenChange={ ( open: boolean ) => {
                    if ( ! open ) {
                        setListed( null );
                    }
                } }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            { __( 'Products', 'storegrowth-sales-booster' ) }
                        </DialogTitle>
                    </DialogHeader>
                    <ul className="m-0 list-none p-0 text-sm text-sg-text">
                        { ( listed ?? [] ).map( ( name ) => {
                            return (
                                <li key={ name } className="py-1">
                                    { name }
                                </li>
                            );
                        } ) }
                    </ul>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={ deleting !== null }
                onOpenChange={ ( open: boolean ) => {
                    if ( ! open ) {
                        setDeleting( null );
                    }
                } }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            { sprintf(
                                /* translators: %s: campaign name. */ __(
                                    'Delete %s?',
                                    'storegrowth-sales-booster'
                                ),
                                campaign.name
                            ) }
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            { __(
                                'Attached offers go back to their everyday versions.',
                                'storegrowth-sales-booster'
                            ) }
                            { deleting?.length
                                ? ` ${ sprintf(
                                      /* translators: %s: comma-separated offer names. */ __(
                                          'These campaign-only offers will be deleted: %s.',
                                          'storegrowth-sales-booster'
                                      ),
                                      deleting.join( ', ' )
                                  ) }`
                                : '' }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            { __( 'Cancel', 'storegrowth-sales-booster' ) }
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={ remove }>
                            { __( 'Delete', 'storegrowth-sales-booster' ) }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
