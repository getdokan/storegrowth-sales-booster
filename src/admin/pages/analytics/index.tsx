/**
 * Analytics (ADR-012): what StoreGrowth offers earned and gave away in a
 * date range, per module and per campaign. Data: `GET /analytics`.
 *
 * No design reference yet; built from the dashboard's tiles and plugin-ui.
 *
 * @since SPSG_VERSION
 */
import {
    Badge,
    Notice,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Skeleton,
} from '@wedevs/plugin-ui';
import { useEffect, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __, sprintf } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import { Card, ProBadge } from '@storegrowth/components';
import {
    MODULE_CATALOG,
    fetchAnalytics,
    getHeaderData,
    type AnalyticsParams,
    type AnalyticsReport,
} from '@storegrowth/utilities';

import DailyChart from './daily-chart';
import { formatCount, formatMoney, formatRate } from './format';
import { LimitNote, ReportTable } from './report-table';

/** Range presets, in days; longer than 30 needs Pro. */
const RANGES = [ 7, 30, 90 ];

/** Lite's longest range, in days. */
const LITE_DAYS = 30;

/**
 * Labels, gathered so the markup stays short.
 *
 * @since SPSG_VERSION
 */
function labels() {
    return {
        title: __( 'Analytics', 'storegrowth-sales-booster' ),
        intro: __(
            'What your offers sold and what they gave away.',
            'storegrowth-sales-booster'
        ),
        range: __( 'Date range', 'storegrowth-sales-booster' ),
        revenue: __( 'Revenue', 'storegrowth-sales-booster' ),
        revenueHint: __(
            'Gifts, bumps and timer sales',
            'storegrowth-sales-booster'
        ),
        discount: __( 'Discount given', 'storegrowth-sales-booster' ),
        discountShort: __( 'Discount', 'storegrowth-sales-booster' ),
        orders: __( 'Orders', 'storegrowth-sales-booster' ),
        items: __( 'Items sold', 'storegrowth-sales-booster' ),
        perDay: __( 'Revenue per day by offer', 'storegrowth-sales-booster' ),
        takeRate: __( 'Take rate', 'storegrowth-sales-booster' ),
        takeRateHint: __(
            'Orders per checkout view, estimated',
            'storegrowth-sales-booster'
        ),
        views: __( 'Views', 'storegrowth-sales-booster' ),
        viewsHint: __(
            'Estimated, once per visit',
            'storegrowth-sales-booster'
        ),
        giftRevenue: __( 'Gift revenue', 'storegrowth-sales-booster' ),
        giftCost: __( 'Gift cost', 'storegrowth-sales-booster' ),
        giftOrders: __( 'Orders with a gift', 'storegrowth-sales-booster' ),
        giftTakeRateHint: __(
            'Orders with a gift per offer view, estimated',
            'storegrowth-sales-booster'
        ),
        triggerRevenue: __( 'Trigger revenue', 'storegrowth-sales-booster' ),
        triggerHint: __(
            'Products that unlocked a gift; not in the total',
            'storegrowth-sales-booster'
        ),
        timerRevenue: __(
            'Revenue during timers',
            'storegrowth-sales-booster'
        ),
        addToCartRate: __( 'Add-to-cart rate', 'storegrowth-sales-booster' ),
        addToCartRateHint: __(
            'Visits that added the product per timer view, estimated',
            'storegrowth-sales-booster'
        ),
        timerProducts: __( 'Products on a timer', 'storegrowth-sales-booster' ),
        product: __( 'Product', 'storegrowth-sales-booster' ),
        timerOnly: __( 'Timer only', 'storegrowth-sales-booster' ),
        noTimerProducts: __(
            'No timer views or sales in this range yet.',
            'storegrowth-sales-booster'
        ),
        helped: __( 'Helped', 'storegrowth-sales-booster' ),
        barNote: __(
            'Orders the bar helped. Its discount is an order fee, not counted in offer revenue.',
            'storegrowth-sales-booster'
        ),
        barOrders: __(
            'Orders with the discount',
            'storegrowth-sales-booster'
        ),
        barThreshold: __(
            'Orders over the threshold',
            'storegrowth-sales-booster'
        ),
        barThresholdHint: __(
            'With the discount or free shipping',
            'storegrowth-sales-booster'
        ),
        barReached: __( 'Carts that reached it', 'storegrowth-sales-booster' ),
        campaigns: __( 'Campaigns', 'storegrowth-sales-booster' ),
        campaign: __( 'Campaign', 'storegrowth-sales-booster' ),
        module: __( 'Module', 'storegrowth-sales-booster' ),
        noOrders: __(
            'No offer orders in this range yet.',
            'storegrowth-sales-booster'
        ),
        failed: __(
            'The report could not be loaded. Please reload the page.',
            'storegrowth-sales-booster'
        ),
        notInstalled: __(
            'Run the StoreGrowth database update (the notice above) to start offer reports.',
            'storegrowth-sales-booster'
        ),
        analyticsOff: __(
            'Offer revenue comes from WooCommerce Analytics, which is turned off. Views and clicks still count.',
            'storegrowth-sales-booster'
        ),
        analyticsSettings: __(
            'Turn on WooCommerce Analytics',
            'storegrowth-sales-booster'
        ),
    };
}

/**
 * A module's name.
 *
 * @param id Module id.
 */
function moduleName( id: string ): string {
    return MODULE_CATALOG[ id ]?.label ?? id;
}

interface FigureProps {
    label: string;
    value: string;
    hint?: string;
    /** Percent change from the previous period (Pro's comparison); null when that was 0. */
    change?: number | null;
}

/**
 * The change from the previous period: an arrow and the percentage, in text
 * colors (the arrow and sign carry the direction, not a color).
 *
 * @param props        Props.
 * @param props.change Percent change.
 */
function Change( { change }: { change: number | null } ) {
    if ( null === change ) {
        return (
            <span className="text-[12px] leading-4 text-sg-help">
                { __( 'New this period', 'storegrowth-sales-booster' ) }
            </span>
        );
    }

    const arrow = change > 0 ? '↑' : '↓';

    return (
        <span className="text-[12px] font-medium leading-4 text-sg-muted">
            { 0 === change ? '' : `${ arrow } ` }
            { sprintf(
                /* translators: %s: percent change, e.g. 12.5. */
                __( '%s%% vs previous period', 'storegrowth-sales-booster' ),
                String( Math.abs( change ) )
            ) }
        </span>
    );
}

/** A module card's figure; `money: false` still shows without Analytics. */
interface CardFigure extends FigureProps {
    money?: boolean;
}

/**
 * One figure of a tile or card.
 *
 * @param props        Props.
 * @param props.label  Label.
 * @param props.value  Value.
 * @param props.hint   Short explanation under the value.
 * @param props.change Percent change from the previous period.
 */
function Figure( { label, value, hint, change }: FigureProps ) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[13px] leading-5 text-sg-muted">
                { label }
            </span>
            <span className="text-[20px] font-bold leading-[1.3] text-sg-ink">
                { value }
            </span>
            { undefined !== change && <Change change={ change } /> }
            { hint && (
                <span className="text-[12px] leading-4 text-sg-help">
                    { hint }
                </span>
            ) }
        </div>
    );
}

interface ReportProps {
    report: AnalyticsReport;
    upgradeUrl: string;
}

/**
 * The report: totals, the daily chart, per module and per campaign. With
 * WooCommerce Analytics off, only the counts (views).
 *
 * @param props            Props.
 * @param props.report     Report.
 * @param props.upgradeUrl Upgrade link for Lite.
 */
function Report( { report, upgradeUrl }: ReportProps ) {
    const l = labels();
    const price = report.status.price_format;
    const withMoney = report.status.analytics_enabled;
    const money = ( amount: number | undefined ) => {
        return formatMoney( amount ?? 0, price );
    };
    const totals = report.totals;
    const bump = report.modules?.[ 'upsell-order-bump' ];
    const bogo = report.modules?.bogo;
    const countdown = report.modules?.[ 'countdown-timer' ];
    const bar = report.modules?.[ 'progressive-discount-banner' ];
    const campaigns = report.campaigns ?? [];
    const products = report.products ?? [];

    // Pro's comparison with the previous period, when asked for.
    const change = report.comparison?.change.totals;

    const tiles = [
        {
            label: l.revenue,
            value: money( totals?.revenue ),
            hint: l.revenueHint,
            change: change?.revenue,
        },
        {
            label: l.discount,
            value: money( totals?.discount ),
            change: change?.discount,
        },
        {
            label: l.orders,
            value: formatCount( totals?.orders ?? 0 ),
            change: change?.orders,
        },
        {
            label: l.items,
            value: formatCount( totals?.items ?? 0 ),
            change: change?.items,
        },
    ];

    // `money: false` figures still show with WooCommerce Analytics off.
    const allCards: Array< {
        id: string;
        figures: CardFigure[];
        /** Free Shipping Bar: marked "Helped" with this note. */
        note?: string;
    } > = [
        {
            id: 'upsell-order-bump',
            figures: [
                { label: l.revenue, value: money( bump?.revenue ) },
                {
                    label: l.takeRate,
                    value: formatRate( bump?.take_rate ),
                    hint: l.takeRateHint,
                },
                {
                    label: l.views,
                    value: formatCount( bump?.counts?.view ?? 0 ),
                    hint: l.viewsHint,
                    money: false,
                },
                { label: l.discount, value: money( bump?.discount ) },
            ],
        },
        {
            id: 'bogo',
            figures: [
                { label: l.giftRevenue, value: money( bogo?.revenue ) },
                {
                    label: l.takeRate,
                    value: formatRate( bogo?.take_rate ),
                    hint: l.giftTakeRateHint,
                },
                {
                    label: l.views,
                    value: formatCount( bogo?.counts?.view ?? 0 ),
                    hint: l.viewsHint,
                    money: false,
                },
                { label: l.giftCost, value: money( bogo?.discount ) },
                {
                    label: l.giftOrders,
                    value: formatCount( bogo?.orders ?? 0 ),
                },
                {
                    label: l.triggerRevenue,
                    value: money( bogo?.trigger_revenue ),
                    hint: l.triggerHint,
                },
            ],
        },
        {
            id: 'countdown-timer',
            figures: [
                { label: l.timerRevenue, value: money( countdown?.revenue ) },
                { label: l.discount, value: money( countdown?.discount ) },
                {
                    label: l.views,
                    value: formatCount( countdown?.counts?.view ?? 0 ),
                    hint: l.viewsHint,
                    money: false,
                },
                {
                    label: l.addToCartRate,
                    value: formatRate( countdown?.add_to_cart_rate ),
                    hint: l.addToCartRateHint,
                    money: false,
                },
                {
                    label: l.orders,
                    value: formatCount( countdown?.orders ?? 0 ),
                },
                {
                    label: l.items,
                    value: formatCount( countdown?.items ?? 0 ),
                },
            ],
        },
        {
            id: 'progressive-discount-banner',
            note: l.barNote,
            figures: [
                {
                    label: l.barOrders,
                    value: formatCount( bar?.orders ?? 0 ),
                },
                { label: l.discount, value: money( bar?.discount ) },
                {
                    label: l.barThreshold,
                    value: formatCount( bar?.threshold_orders ?? 0 ),
                    hint: l.barThresholdHint,
                },
                {
                    label: l.views,
                    value: formatCount( bar?.counts?.view ?? 0 ),
                    hint: l.viewsHint,
                    money: false,
                },
                {
                    label: l.barReached,
                    value: formatCount( bar?.counts?.reached ?? 0 ),
                    hint: l.viewsHint,
                    money: false,
                },
            ],
        },
    ];
    const cards = allCards
        .map( ( card ) => {
            return {
                ...card,
                figures: card.figures.filter( ( figure ) => {
                    return withMoney || false === figure.money;
                } ),
            };
        } )
        .filter( ( card ) => {
            return card.figures.length > 0;
        } );

    const columns = [
        { label: l.campaign, end: false },
        { label: l.module, end: false },
        { label: l.revenue, end: true },
        { label: l.discountShort, end: true },
        { label: l.orders, end: true },
        { label: l.takeRate, end: true },
    ];

    const productColumns = [
        { label: l.product, end: false },
        { label: l.revenue, end: true },
        { label: l.discountShort, end: true },
        { label: l.orders, end: true },
        { label: l.views, end: true },
        { label: l.addToCartRate, end: true },
    ];

    return (
        <>
            { withMoney && (
                <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
                    { tiles.map( ( tile ) => (
                        <Card key={ tile.label }>
                            <Figure { ...tile } />
                        </Card>
                    ) ) }
                </div>
            ) }

            { withMoney && (
                <Card title={ l.perDay } className="w-full">
                    <DailyChart
                        days={ report.intervals ?? [] }
                        price={ price }
                        moduleName={ moduleName }
                    />
                </Card>
            ) }

            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                { cards.map( ( card ) => (
                    <Card key={ card.id } title={ moduleName( card.id ) }>
                        { card.note && (
                            <p className="flex flex-wrap items-center gap-2 text-[12px] leading-4 text-sg-help">
                                <Badge variant="secondary">{ l.helped }</Badge>
                                { card.note }
                            </p>
                        ) }
                        <div className="grid grid-cols-2 gap-4">
                            { card.figures.map( ( figure ) => (
                                <Figure
                                    key={ figure.label }
                                    label={ figure.label }
                                    value={ figure.value }
                                    hint={ figure.hint }
                                />
                            ) ) }
                        </div>
                    </Card>
                ) ) }
            </div>

            { withMoney && (
                <Card title={ l.campaigns } className="w-full">
                    { campaigns.length ? (
                        <ReportTable
                            columns={ columns }
                            rows={ campaigns.map( ( campaign ) => {
                                return {
                                    key: campaign.id,
                                    cells: [
                                        campaign.name || campaign.id,
                                        moduleName( campaign.module ),
                                        money( campaign.revenue ),
                                        money( campaign.discount ),
                                        formatCount( campaign.orders ),
                                        formatRate( campaign.take_rate ),
                                    ],
                                };
                            } ) }
                        />
                    ) : (
                        <p className="text-[14px] leading-5 text-sg-muted">
                            { l.noOrders }
                        </p>
                    ) }
                    { report.campaigns_limited && (
                        <LimitNote
                            upgradeUrl={ upgradeUrl }
                            message={ sprintf(
                                /* translators: 1: campaigns shown, 2: all campaigns. */
                                __(
                                    'Showing %1$d of %2$d campaigns.',
                                    'storegrowth-sales-booster'
                                ),
                                campaigns.length,
                                report.campaigns_total ?? 0
                            ) }
                        />
                    ) }
                </Card>
            ) }

            { withMoney && (
                <Card title={ l.timerProducts } className="w-full">
                    { products.length ? (
                        <ReportTable
                            columns={ productColumns }
                            rows={ products.map( ( product ) => {
                                return {
                                    key: String( product.id ),
                                    cells: [
                                        <span
                                            key="name"
                                            className="inline-flex flex-wrap items-center gap-2"
                                        >
                                            { product.name ||
                                                `#${ product.id }` }
                                            { product.timer_only && (
                                                <Badge variant="secondary">
                                                    { l.timerOnly }
                                                </Badge>
                                            ) }
                                        </span>,
                                        money( product.revenue ),
                                        money( product.discount ),
                                        formatCount( product.orders ),
                                        formatCount( product.counts.view ?? 0 ),
                                        formatRate( product.add_to_cart_rate ),
                                    ],
                                };
                            } ) }
                        />
                    ) : (
                        <p className="text-[14px] leading-5 text-sg-muted">
                            { l.noTimerProducts }
                        </p>
                    ) }
                    { report.products_limited && (
                        <LimitNote
                            upgradeUrl={ upgradeUrl }
                            message={ sprintf(
                                /* translators: 1: products shown, 2: all products. */
                                __(
                                    'Showing %1$d of %2$d products.',
                                    'storegrowth-sales-booster'
                                ),
                                products.length,
                                report.products_total ?? 0
                            ) }
                        />
                    ) }
                </Card>
            ) }
        </>
    );
}

export default function AnalyticsPage() {
    const l = labels();
    const info = getHeaderData().header_info;
    const isPro = !! info.is_pro_exists;
    // `days` for a preset; Pro sets `after` / `before`, `vendor`, `compare`.
    const [ params, setParams ] = useState< AnalyticsParams >( {
        days: LITE_DAYS,
    } );
    const [ report, setReport ] = useState< AnalyticsReport | null >( null );
    const [ failed, setFailed ] = useState( false );

    useEffect( () => {
        // A newer range wins over a slower answer for an older one.
        let current = true;

        setReport( null );
        setFailed( false );
        fetchAnalytics( params )
            .then( ( next ) => {
                if ( current ) {
                    setReport( next );
                }
            } )
            .catch( () => {
                if ( current ) {
                    setFailed( true );
                }
            } );

        return () => {
            current = false;
        };
    }, [ params ] );

    const rangeItems: Array< {
        value: string;
        label: string;
        locked: boolean;
    } > = RANGES.map( ( value ) => {
        return {
            value: String( value ),
            label: sprintf(
                /* translators: %d: number of days. */
                __( 'Last %d days', 'storegrowth-sales-booster' ),
                value
            ),
            locked: value > LITE_DAYS && ! isPro,
        };
    } );

    // A range set by Pro (`after` / `before`) shows as "Custom".
    if ( ! params.days ) {
        rangeItems.push( {
            value: 'custom',
            label: __( 'Custom', 'storegrowth-sales-booster' ),
            locked: false,
        } );
    }

    /**
     * Extra controls next to the range (Pro: custom range, comparison,
     * vendor, export).
     *
     * @since SPSG_VERSION
     *
     * @param {ReactNode[]} controls Controls.
     * @param {Object}      context  `params`, `setParams`, `report`.
     */
    const controls = applyFilters( 'storegrowth.analytics.controls', [], {
        params,
        setParams,
        report,
    } ) as ReactNode[];

    let body: ReactNode;

    if ( failed ) {
        body = <Notice variant="destructive">{ l.failed }</Notice>;
    } else if ( ! report ) {
        body = <Skeleton className="h-[320px] w-full rounded-[16px]" />;
    } else if ( ! report.status.installed ) {
        body = <Notice variant="warning">{ l.notInstalled }</Notice>;
    } else {
        body = (
            <>
                { ! report.status.analytics_enabled && (
                    <Notice variant="warning">
                        { l.analyticsOff }{ ' ' }
                        <a
                            href="admin.php?page=wc-settings&tab=advanced&section=features"
                            className="font-medium text-sg-brand"
                        >
                            { l.analyticsSettings }
                        </a>
                    </Notice>
                ) }
                <Report report={ report } upgradeUrl={ info.upgrade_url } />
            </>
        );
    }

    return (
        <div className="spsg-page flex w-full flex-col items-center px-4 pb-12 pt-12 sm:px-8">
            <div className="flex w-full max-w-[1280px] flex-col items-start gap-6">
                <div className="flex w-full flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col items-start gap-1">
                        <h1 className="sg-display text-[24px] font-bold leading-[1.3] text-sg-text">
                            { l.title }
                        </h1>
                        <p className="text-[14px] leading-5 text-sg-muted">
                            { l.intro }
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        { controls }
                        <Select
                            items={ rangeItems }
                            value={
                                params.days ? String( params.days ) : 'custom'
                            }
                            onValueChange={ ( next ) => {
                                if ( null !== next && 'custom' !== next ) {
                                    // A preset replaces a custom range; the rest stays.
                                    setParams( {
                                        ...params,
                                        days: Number( next ),
                                        after: undefined,
                                        before: undefined,
                                    } );
                                }
                            } }
                        >
                            <SelectTrigger
                                aria-label={ l.range }
                                className="h-10 min-w-[180px] border bg-white ps-4 pe-4"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                { rangeItems.map( ( item ) => (
                                    <SelectItem
                                        key={ item.value }
                                        value={ item.value }
                                        disabled={
                                            item.locked ||
                                            'custom' === item.value
                                        }
                                        className="cursor-pointer"
                                    >
                                        <span className="flex items-center gap-2 whitespace-nowrap">
                                            { item.label }
                                            { item.locked && <ProBadge /> }
                                        </span>
                                    </SelectItem>
                                ) ) }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                { body }
            </div>
        </div>
    );
}
