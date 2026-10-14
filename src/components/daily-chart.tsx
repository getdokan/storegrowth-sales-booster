/**
 * Revenue per day by offer: one line per module (Order Bump, BOGO,
 * Countdown Timer) over the days of the range, with a legend and every
 * line's revenue on hover. plugin-ui's chart frame (`ChartContainer`, tooltip
 * and legend content) around a recharts line chart. BOGO's line counts the
 * products that unlocked a gift, so the lines don't add up to the total.
 * Screen readers get one summary of the chart (the module cards and the
 * campaigns table carry the figures). On the dashboard and Pro's Analytics
 * page.
 *
 * @since SPSG_VERSION
 */
import type { ComponentProps } from 'react';
import {
    ChartContainer,
    ChartLegendContent,
    ChartTooltipContent,
    recharts,
} from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';
import {
    formatDay,
    formatMoney,
    type PriceFormat,
} from '@storegrowth/utilities';

// plugin-ui's own recharts (one copy on the page, the one its chart frame
// uses); the bare `recharts` import is blocked in .eslintrc.js.
const {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Tooltip: RechartsTooltip,
    XAxis,
    YAxis,
} = recharts;

export interface DailyChartProps {
    days: Array< { date: string; modules: Record< string, number > } >;
    price: PriceFormat;
    /** Module name by id. */
    moduleName: ( id: string ) => string;
}

/**
 * The lines: chart key (a CSS-safe name for `--color-<key>`), module id and
 * color. Fixed order and colors (categorical slots, checked for color
 * vision deficiency and contrast on white): brand blue, orange, aqua.
 */
const SERIES = [
    {
        key: 'bump',
        module: 'upsell-order-bump',
        color: 'var(--color-sg-brand)',
    },
    { key: 'bogo', module: 'bogo', color: '#eb6834' },
    { key: 'countdown', module: 'countdown-timer', color: '#199e70' },
];

/**
 * @since SPSG_VERSION
 *
 * @param props            Props.
 * @param props.days       Days of the range, oldest first.
 * @param props.price      WooCommerce's price format.
 * @param props.moduleName Module name by id.
 */
export function DailyChart( { days, price, moduleName }: DailyChartProps ) {
    const data = days.map( ( day ) => {
        const row: Record< string, string | number > = { date: day.date };
        SERIES.forEach( ( series ) => {
            row[ series.key ] = day.modules?.[ series.module ] ?? 0;
        } );

        return row;
    } );

    const max = Math.max(
        0,
        ...data.flatMap( ( row ) => {
            return SERIES.map( ( series ) => {
                return Number( row[ series.key ] );
            } );
        } )
    );

    if ( ! days.length || max <= 0 ) {
        return (
            <p className="text-[14px] leading-5 text-sg-muted">
                { __(
                    'No offer revenue in this range yet.',
                    'storegrowth-sales-booster'
                ) }
            </p>
        );
    }

    // plugin-ui doesn't export its `ChartConfig` type.
    const config: ComponentProps< typeof ChartContainer >[ 'config' ] = {};
    SERIES.forEach( ( series ) => {
        config[ series.key ] = {
            label: moduleName( series.module ),
            color: series.color,
        };
    } );

    // Axis money without decimals, so the ticks stay short.
    const axisPrice = { ...price, decimals: 0 };

    const summary = sprintf(
        /* translators: 1: module names, 2: first day, 3: last day. */
        __(
            'Revenue per day of %1$s from %2$s to %3$s.',
            'storegrowth-sales-booster'
        ),
        SERIES.map( ( series ) => {
            return moduleName( series.module );
        } ).join( ', ' ),
        formatDay( days[ 0 ].date ),
        formatDay( days[ days.length - 1 ].date )
    );

    return (
        <div className="w-full" role="img" aria-label={ summary }>
            <ChartContainer
                config={ config }
                className="aspect-auto h-[260px] w-full"
                aria-hidden
            >
                <LineChart
                    data={ data }
                    margin={ { top: 8, right: 8, bottom: 0, left: 0 } }
                >
                    <CartesianGrid vertical={ false } strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickLine={ false }
                        axisLine={ false }
                        tickMargin={ 8 }
                        minTickGap={ 32 }
                        tickFormatter={ ( day: string ) => {
                            return formatDay( day );
                        } }
                    />
                    <YAxis
                        width={ 56 }
                        tickLine={ false }
                        axisLine={ false }
                        tickCount={ 4 }
                        tickFormatter={ ( value: number ) => {
                            return formatMoney( value, axisPrice );
                        } }
                    />
                    <RechartsTooltip
                        cursor={ { strokeDasharray: '3 3' } }
                        content={
                            <ChartTooltipContent
                                indicator="dot"
                                labelFormatter={ ( day: string ) => {
                                    return formatDay( day );
                                } }
                                formatter={ ( value, name ) => {
                                    const key = String( name );

                                    return (
                                        <div className="flex w-full items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                                style={ {
                                                    backgroundColor: `var(--color-${ key })`,
                                                } }
                                            />
                                            <span className="text-sg-muted">
                                                { config[ key ]?.label }
                                            </span>
                                            <span className="ms-auto ps-4 font-medium text-sg-ink">
                                                { formatMoney(
                                                    Number( value ),
                                                    price
                                                ) }
                                            </span>
                                        </div>
                                    );
                                } }
                            />
                        }
                    />
                    <Legend content={ <ChartLegendContent /> } />
                    { SERIES.map( ( series ) => {
                        return (
                            <Line
                                key={ series.key }
                                dataKey={ series.key }
                                // Straight segments: a curve would show
                                // values between days that don't exist.
                                type="linear"
                                stroke={ `var(--color-${ series.key })` }
                                strokeWidth={ 2 }
                                dot={ false }
                                activeDot={ { r: 4 } }
                                isAnimationActive={ false }
                            />
                        );
                    } ) }
                </LineChart>
            </ChartContainer>
        </div>
    );
}
