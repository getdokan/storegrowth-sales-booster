/**
 * Analytics (`#/analytics`) without Pro: a blurred preview of the report
 * with a short pitch and an upgrade button. Pro replaces this route (id
 * `analytics`) with the full page; the data (ADR-012, `GET /analytics`) is
 * collected either way.
 *
 * @since 3.0.0
 */
import { Button } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import {
    Card,
    DailyChart,
    ProBadge,
    ReportFigure,
    ReportTable,
} from '@storegrowth/components';
import {
    MODULE_CATALOG,
    formatMoney,
    getHeaderData,
    type PriceFormat,
} from '@storegrowth/utilities';

/** The preview's made-up figures, in dollars. */
const SAMPLE_PRICE: PriceFormat = {
    symbol: '$',
    format: '%1$s%2$s',
    decimals: 2,
    decimal_separator: '.',
    thousand_separator: ',',
};

/** Two made-up weeks of revenue by module. */
const SAMPLE_DAYS = [ 3, 5, 4, 7, 6, 9, 8, 11, 9, 12, 10, 14, 13, 15 ].map(
    ( value, index ) => {
        return {
            date: `2026-10-${ String( index + 1 ).padStart( 2, '0' ) }`,
            modules: {
                'upsell-order-bump': value * 12,
                bogo: ( 16 - value ) * 7,
                'countdown-timer': value * 5,
            },
        };
    }
);

/** Made-up rows of the campaigns table. */
const SAMPLE_CAMPAIGNS = [
    { module: 'upsell-order-bump', revenue: 2140, orders: 61 },
    { module: 'bogo', revenue: 1530, orders: 38 },
    { module: 'countdown-timer', revenue: 1150, orders: 29 },
];

/**
 * A module's name.
 *
 * @param id Module id.
 */
function moduleName( id: string ): string {
    return MODULE_CATALOG[ id ]?.label ?? id;
}

/**
 * The report's shape with made-up figures, for the blurred preview.
 *
 * @since 3.0.0
 */
function SamplePreview() {
    const tiles = [
        {
            label: __( 'Revenue', 'storegrowth-sales-booster' ),
            value: formatMoney( 4820, SAMPLE_PRICE ),
        },
        {
            label: __( 'Discount given', 'storegrowth-sales-booster' ),
            value: formatMoney( 615, SAMPLE_PRICE ),
        },
        { label: __( 'Orders', 'storegrowth-sales-booster' ), value: '128' },
        {
            label: __( 'Items sold', 'storegrowth-sales-booster' ),
            value: '203',
        },
    ];

    return (
        <div className="pointer-events-none flex w-full select-none flex-col gap-6 blur-[3px]">
            <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
                { tiles.map( ( tile ) => (
                    <Card key={ tile.label }>
                        <ReportFigure { ...tile } />
                    </Card>
                ) ) }
            </div>
            <Card
                title={ __(
                    'Revenue per day by offer',
                    'storegrowth-sales-booster'
                ) }
                className="w-full"
            >
                <DailyChart
                    days={ SAMPLE_DAYS }
                    price={ SAMPLE_PRICE }
                    moduleName={ moduleName }
                />
            </Card>
            <Card
                title={ __( 'Campaigns', 'storegrowth-sales-booster' ) }
                className="w-full"
            >
                <ReportTable
                    columns={ [
                        { label: __( 'Module', 'storegrowth-sales-booster' ) },
                        {
                            label: __( 'Revenue', 'storegrowth-sales-booster' ),
                            end: true,
                        },
                        {
                            label: __( 'Orders', 'storegrowth-sales-booster' ),
                            end: true,
                        },
                    ] }
                    rows={ SAMPLE_CAMPAIGNS.map( ( campaign ) => {
                        return {
                            key: campaign.module,
                            cells: [
                                moduleName( campaign.module ),
                                formatMoney( campaign.revenue, SAMPLE_PRICE ),
                                String( campaign.orders ),
                            ],
                        };
                    } ) }
                />
            </Card>
        </div>
    );
}

export default function AnalyticsPage() {
    const upgradeUrl = getHeaderData().header_info.upgrade_url;

    return (
        <div className="spsg-page flex w-full flex-col items-center px-4 pb-12 pt-12 sm:px-8">
            <div className="flex w-full max-w-[1280px] flex-col items-start gap-6">
                <div className="flex flex-col items-start gap-1">
                    <h1 className="sg-display flex items-center gap-2 text-[24px] font-bold leading-[1.3] text-sg-text">
                        { __( 'Analytics', 'storegrowth-sales-booster' ) }
                        <ProBadge />
                    </h1>
                    <p className="text-[14px] leading-5 text-sg-muted">
                        { __(
                            'What your offers sold and what they gave away.',
                            'storegrowth-sales-booster'
                        ) }
                    </p>
                </div>
                <div className="relative w-full">
                    <div aria-hidden="true">
                        <SamplePreview />
                    </div>
                    <div className="absolute inset-0 flex items-start justify-center px-4 pt-16">
                        <Card className="w-full max-w-[440px] items-center text-center">
                            <h2 className="text-[18px] font-semibold leading-6 text-sg-ink">
                                { __(
                                    'See what your offers earn',
                                    'storegrowth-sales-booster'
                                ) }
                            </h2>
                            <p className="text-[14px] leading-5 text-sg-muted">
                                { __(
                                    'Revenue, discounts and orders from every offer, by day, module and campaign. Compare periods, filter by vendor and export to CSV with StoreGrowth Pro.',
                                    'storegrowth-sales-booster'
                                ) }
                            </p>
                            <Button
                                onClick={ () => {
                                    window.open(
                                        upgradeUrl,
                                        '_blank',
                                        'noopener,noreferrer'
                                    );
                                } }
                            >
                                { __(
                                    'Upgrade to Pro',
                                    'storegrowth-sales-booster'
                                ) }
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
