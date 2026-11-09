/**
 * Campaigns list (`#/campaigns`): stat cards, revenue by week, the status
 * tabs and the table. Free stores see sample data with every control off;
 * expired stores their own campaigns read-only (ADR-016).
 *
 * @since SPSG_VERSION
 */
import {
    Badge,
    Button,
    ChartContainer,
    ChartTooltipContent,
    Input,
    Notice,
    recharts,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsList,
    TabsTrigger,
} from '@wedevs/plugin-ui';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { AlertTriangle, Plus } from 'lucide-react';
import { Card, ReportFigure, ReportTable } from '@storegrowth/components';
import { useNavigate } from '@storegrowth/hooks';
import {
    errorMessage,
    formatMoney,
    getHeaderData,
} from '@storegrowth/utilities';

import { campaignMode, licenceAction } from './licence';
import { fetchCampaigns, type CampaignList, type CampaignRow } from './api';
import { NewCampaignDialog } from './new-campaign-dialog';
import { OFFER_LABELS, STATUS_LABELS, surfaceLabel } from './labels';
import { SAMPLE_LIST } from './sample-data';

const { Bar, BarChart, CartesianGrid, ReferenceArea, Tooltip, XAxis, YAxis } =
    recharts;

const RANGES = [
    { value: '30', label: __( 'Last 30 days', 'storegrowth-sales-booster' ) },
    { value: '90', label: __( 'Last 90 days', 'storegrowth-sales-booster' ) },
    { value: 'year', label: __( 'This year', 'storegrowth-sales-booster' ) },
];

const TABS = [
    { value: 'all', label: __( 'All', 'storegrowth-sales-booster' ) },
    { value: 'running', label: STATUS_LABELS.running },
    { value: 'scheduled', label: STATUS_LABELS.scheduled },
    { value: 'ended', label: STATUS_LABELS.ended },
];

const COLUMNS = [
    { label: __( 'Campaign', 'storegrowth-sales-booster' ) },
    { label: __( 'Status', 'storegrowth-sales-booster' ) },
    { label: __( 'Runs', 'storegrowth-sales-booster' ) },
    { label: __( 'Offers', 'storegrowth-sales-booster' ) },
    { label: __( 'Surfaces', 'storegrowth-sales-booster' ) },
    { label: __( 'Revenue', 'storegrowth-sales-booster' ), end: true },
    { label: __( 'Orders', 'storegrowth-sales-booster' ), end: true },
    { label: __( 'AOV lift', 'storegrowth-sales-booster' ), end: true },
];

/**
 * The window a row runs, as the table says it.
 *
 * @param row Row.
 */
function runsLabel( row: CampaignRow ): string {
    if ( ! row.starts_at ) {
        return __( 'Not set', 'storegrowth-sales-booster' );
    }

    return row.ends_at
        ? `${ row.starts_at.slice( 0, 10 ) } – ${ row.ends_at.slice( 0, 10 ) }`
        : sprintf(
              /* translators: %s: start date. */
              __( 'From %s, always on', 'storegrowth-sales-booster' ),
              row.starts_at.slice( 0, 10 )
          );
}

/**
 * An AOV lift, signed.
 *
 * @param value Percent.
 */
function signed( value: number ): string {
    return `${ value > 0 ? '+' : '' }${ value }%`;
}

/**
 * The first and last week each campaign ran in. The chart's axis is
 * categorical: a shaded area only draws between dates that are on the axis,
 * so a window is snapped to the weeks it touches.
 *
 * @param weeks The chart's weeks.
 * @param items Campaigns.
 */
function campaignWindows(
    weeks: CampaignList[ 'summary' ][ 'weekly' ],
    items: CampaignRow[]
) {
    return items.flatMap( ( item ) => {
        if ( ! item.starts_at || item.status === 'draft' ) {
            return [];
        }

        const start = item.starts_at.slice( 0, 10 );
        const end = item.ends_at ? item.ends_at.slice( 0, 10 ) : '9999-12-31';
        const touched = weeks.filter( ( week, index ) => {
            const next =
                weeks[ index + 1 ]?.date ??
                new Date( Date.parse( week.date ) + 7 * 86400000 )
                    .toISOString()
                    .slice( 0, 10 );

            return week.date <= end && start < next;
        } );

        return touched.length
            ? [
                  {
                      id: item.id,
                      first: touched[ 0 ].date,
                      last: touched[ touched.length - 1 ].date,
                  },
              ]
            : [];
    } );
}

/**
 * A campaign's name with its warning badges, linked to its page.
 *
 * @param props        Props.
 * @param props.item   Campaign.
 * @param props.linked Whether the name opens the campaign.
 */
function CampaignName( {
    item,
    linked,
}: {
    item: CampaignRow;
    linked: boolean;
} ) {
    const navigate = useNavigate();

    return (
        <span className="flex flex-wrap items-center gap-2">
            { linked ? (
                <Button
                    variant="link"
                    className="h-auto p-0 font-medium"
                    onClick={ () => {
                        navigate( `/campaigns/${ item.id }` );
                    } }
                >
                    { item.name }
                </Button>
            ) : (
                item.name
            ) }
            { item.licence_stopped && (
                <Badge variant="secondary">
                    { __(
                        'Stopped: licence expired',
                        'storegrowth-sales-booster'
                    ) }
                </Badge>
            ) }
            { item.module_off && (
                <Badge variant="secondary" className="gap-1">
                    <AlertTriangle className="size-3" aria-hidden />
                    { __( 'Module off', 'storegrowth-sales-booster' ) }
                </Badge>
            ) }
        </span>
    );
}

/**
 * Revenue by week, the windows shaded.
 *
 * @param props        Props.
 * @param props.list   Campaign list.
 * @param props.format Money formatter.
 */
function WeeklyChart( {
    list,
    format,
}: {
    list: CampaignList;
    format: ( amount: number ) => string;
} ) {
    const config = {
        revenue: {
            label: __( 'Revenue', 'storegrowth-sales-booster' ),
            color: 'var(--color-sg-brand)',
        },
    };
    const weeks = list.summary.weekly;

    return (
        <ChartContainer config={ config } className="h-[220px] w-full">
            <BarChart data={ weeks }>
                <CartesianGrid vertical={ false } />
                <XAxis dataKey="date" tickLine={ false } axisLine={ false } />
                <YAxis
                    tickLine={ false }
                    axisLine={ false }
                    tickFormatter={ format }
                    width={ 72 }
                />
                <Tooltip content={ <ChartTooltipContent /> } />
                { campaignWindows( weeks, list.items ).map( ( range ) => {
                    return (
                        <ReferenceArea
                            key={ range.id }
                            x1={ range.first }
                            x2={ range.last }
                            fill="var(--color-sg-brand-soft)"
                        />
                    );
                } ) }
                <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={ 4 }
                />
            </BarChart>
        </ChartContainer>
    );
}

/**
 * @since SPSG_VERSION
 */
export default function CampaignListPage() {
    const mode = campaignMode();
    const preview = mode === 'free';
    const readOnly = mode !== 'pro';
    const [ range, setRange ] = useState( '30' );
    const [ tab, setTab ] = useState( 'all' );
    const [ search, setSearch ] = useState( '' );
    const [ list, setList ] = useState< CampaignList | null >(
        preview ? SAMPLE_LIST : null
    );
    const [ error, setError ] = useState( '' );
    const [ dialog, setDialog ] = useState( false );

    useEffect( () => {
        if ( preview ) {
            return;
        }

        fetchCampaigns( range )
            .then( setList )
            .catch( ( problem ) => {
                setError(
                    errorMessage(
                        problem,
                        __(
                            'The campaigns could not be loaded.',
                            'storegrowth-sales-booster'
                        )
                    )
                );
            } );
    }, [ range, preview ] );

    const rows = useMemo( () => {
        return ( list?.items ?? [] ).filter( ( item ) => {
            return (
                ( tab === 'all' || item.status === tab ) &&
                item.name.toLowerCase().includes( search.toLowerCase() )
            );
        } );
    }, [ list, tab, search ] );

    if ( error ) {
        return <Notice variant="destructive">{ error }</Notice>;
    }

    if ( ! list ) {
        return null;
    }

    const money = ( amount: number ) => {
        return formatMoney( amount, list.price_format );
    };
    const { summary } = list;
    const licence = licenceAction( mode, getHeaderData().header_info );

    return (
        <div className="flex flex-col gap-4 p-4">
            { licence && (
                <Notice>
                    <div className="flex items-center justify-between gap-3">
                        <span>{ licence.text }</span>
                        <Button
                            variant="outline"
                            onClick={ () => {
                                window.open(
                                    licence.url,
                                    '_blank',
                                    'noopener,noreferrer'
                                );
                            } }
                        >
                            { licence.action }
                        </Button>
                    </div>
                </Notice>
            ) }
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="m-0 text-xl font-semibold text-sg-heading">
                        { __( 'Campaigns', 'storegrowth-sales-booster' ) }
                    </h1>
                    <p className="m-0 text-sm text-sg-text">
                        { __(
                            'Every promotion you have run, with what it earned',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        items={ RANGES }
                        value={ range }
                        disabled={ preview }
                        onValueChange={ ( value ) => {
                            setRange( String( value ?? '30' ) );
                        } }
                    >
                        <SelectTrigger
                            aria-label={ __(
                                'Date range',
                                'storegrowth-sales-booster'
                            ) }
                            className="w-44"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            { RANGES.map( ( option ) => {
                                return (
                                    <SelectItem
                                        key={ option.value }
                                        value={ option.value }
                                    >
                                        { option.label }
                                    </SelectItem>
                                );
                            } ) }
                        </SelectContent>
                    </Select>
                    <Button
                        disabled={ readOnly }
                        className="gap-2"
                        onClick={ () => {
                            setDialog( true );
                        } }
                    >
                        <Plus className="size-4" aria-hidden />
                        { __( 'New campaign', 'storegrowth-sales-booster' ) }
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Card>
                    <ReportFigure
                        label={ __(
                            'Campaign revenue',
                            'storegrowth-sales-booster'
                        ) }
                        value={ money( summary.revenue ) }
                        hint={ `${ sprintf(
                            /* translators: %s: percent of store revenue. */
                            __(
                                '%s%% of store revenue',
                                'storegrowth-sales-booster'
                            ),
                            String( summary.store_share )
                        ) } · ${ sprintf(
                            /* translators: %d: attribution window, in days. */
                            __(
                                'Orders where a campaign offer applied, plus orders within %d days of a link visit',
                                'storegrowth-sales-booster'
                            ),
                            list.window
                        ) }` }
                    />
                </Card>
                <Card>
                    <ReportFigure
                        label={ __(
                            'Campaign orders',
                            'storegrowth-sales-booster'
                        ) }
                        value={ String( summary.orders ) }
                        hint={ __(
                            'Same rule as revenue',
                            'storegrowth-sales-booster'
                        ) }
                    />
                </Card>
                <Card>
                    <ReportFigure
                        label={ __(
                            'AOV lift during campaigns',
                            'storegrowth-sales-booster'
                        ) }
                        value={
                            summary.aov_lift === null
                                ? '--'
                                : signed( summary.aov_lift )
                        }
                        hint={ __(
                            'Vs non-campaign days',
                            'storegrowth-sales-booster'
                        ) }
                    />
                </Card>
                <Card>
                    <ReportFigure
                        label={ __(
                            'Best surface',
                            'storegrowth-sales-booster'
                        ) }
                        value={
                            summary.best.surface
                                ? surfaceLabel( summary.best.surface )
                                : '--'
                        }
                        hint={ sprintf(
                            /* translators: %s: percent of campaign orders. */
                            __(
                                'Led %s%% of campaign orders',
                                'storegrowth-sales-booster'
                            ),
                            String( summary.best.share )
                        ) }
                    />
                </Card>
            </div>

            <Card
                title={ __(
                    'Campaign revenue by week',
                    'storegrowth-sales-booster'
                ) }
            >
                <WeeklyChart list={ list } format={ money } />
            </Card>

            <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                    <Tabs value={ tab } onValueChange={ setTab }>
                        <TabsList>
                            { TABS.map( ( item ) => {
                                return (
                                    <TabsTrigger
                                        key={ item.value }
                                        value={ item.value }
                                        disabled={ preview }
                                    >
                                        { item.label }{ ' ' }
                                        { list.counts[ item.value ] ?? 0 }
                                    </TabsTrigger>
                                );
                            } ) }
                        </TabsList>
                    </Tabs>
                    <Input
                        className="w-56"
                        placeholder={ __(
                            'Search',
                            'storegrowth-sales-booster'
                        ) }
                        aria-label={ __(
                            'Search campaigns',
                            'storegrowth-sales-booster'
                        ) }
                        value={ search }
                        disabled={ preview }
                        onChange={ ( event ) => {
                            setSearch( event.target.value );
                        } }
                    />
                </div>
                <ReportTable
                    columns={ COLUMNS }
                    rows={ rows.map( ( item ) => {
                        return {
                            key: String( item.id ),
                            cells: [
                                <CampaignName
                                    key="name"
                                    item={ item }
                                    linked={ ! preview }
                                />,
                                STATUS_LABELS[ item.status ],
                                runsLabel( item ),
                                <>
                                    { item.offers }{ ' ' }
                                    <span className="text-xs text-sg-help">
                                        { item.offer_modules
                                            .map( ( kind ) => {
                                                return OFFER_LABELS[ kind ];
                                            } )
                                            .join( ', ' ) }
                                    </span>
                                </>,
                                item.surfaces,
                                item.revenue === null
                                    ? '--'
                                    : money( item.revenue ),
                                item.orders ?? '--',
                                <span
                                    key="lift"
                                    className={
                                        ( item.aov_lift ?? 0 ) >= 0
                                            ? 'text-[#065f46]'
                                            : 'text-[#b91c1c]'
                                    }
                                >
                                    { item.aov_lift === null
                                        ? '--'
                                        : signed( item.aov_lift ) }
                                </span>,
                            ],
                        };
                    } ) }
                />
                { ! rows.length && (
                    <p className="m-0 py-8 text-center text-sm text-sg-muted">
                        { __(
                            'No campaigns match.',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                ) }
            </Card>
            { dialog && (
                <NewCampaignDialog
                    onClose={ () => {
                        setDialog( false );
                    } }
                />
            ) }
        </div>
    );
}
