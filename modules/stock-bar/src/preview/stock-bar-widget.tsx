/**
 * Stock Bar preview widget (ADR-005 S10): the storefront template's markup
 * and classes (`templates/simple-stock-status.php`), styled by the real
 * storefront stylesheet (`spsg-stockbar-style.css`, loaded on this admin
 * page), with the live form values fed the same way the storefront gets them:
 * the per-site inline CSS and jqMeter's bar as inline styles, the redesign's
 * new settings as `--spsg-stock-bar-*` variables.
 *
 * `.spsg-storefront` keeps the admin's scoped reset out of this subtree.
 *
 * @since SPSG_VERSION
 */
import type { CSSProperties } from 'react';

import type { StockBarValues } from '../types';

/** Sample numbers, as in the design. */
const SOLD = 247;
const AVAILABLE = 123;

export interface StockBarWidgetProps {
    values: StockBarValues;
}

/**
 * @since SPSG_VERSION
 *
 * @param props        Props.
 * @param props.values Current (unsaved) settings.
 */
export function StockBarWidget( { values }: StockBarWidgetProps ) {
    const format = values.stock_display_format;
    const height = `${ values.stockbar_height }px`;

    const variables = {
        '--spsg-stock-bar-card-bg': values.stockbar_card_bg_color,
        '--spsg-stock-bar-font-family':
            values.font_family === 'inherit'
                ? 'inherit'
                : `'${ values.font_family }'`,
        '--spsg-stock-bar-count-size': `${ values.count_text_size }px`,
        '--spsg-stock-bar-count-color': values.count_text_color,
        '--spsg-stock-bar-status-size': `${ values.status_text_size }px`,
    } as CSSProperties;

    const counts = (
        <div className="spsg-stock-progress-title">
            <span className="spsg-stock-progress-sold-title">
                { values.total_sell_count_text }:{ ' ' }
                <span className="spsg-stock-progress-count">{ SOLD }</span>
            </span>
            <span className="spsg-stock-progress-available-title">
                { values.available_item_count_text }:{ ' ' }
                <span className="spsg-stock-progress-count">{ AVAILABLE }</span>
            </span>
        </div>
    );

    return (
        <div className="spsg-storefront w-full">
            <div className="spsg-stock-bar" style={ variables }>
                <div
                    className={ `spsg-stock-progress-bar-section wpbsc_total_sale spsg-stock-stock-bar-format-${ format }` }
                    style={ {
                        border: `1px solid ${ values.stockbar_border_color }`,
                        marginBottom: 0,
                    } }
                >
                    { format === 'above' && counts }
                    <div className="jqmeter-container">
                        <div
                            className="therm outer-therm"
                            style={ {
                                width: '100%',
                                height,
                                backgroundColor: values.stockbar_bg_color,
                            } }
                        >
                            <div
                                className="therm inner-therm"
                                style={ {
                                    width: `${ Math.round(
                                        ( SOLD / ( SOLD + AVAILABLE ) ) * 100
                                    ) }%`,
                                    height,
                                    background: values.stockbar_fg_color,
                                } }
                            />
                        </div>
                    </div>
                    { format === 'below' && counts }
                    { values.show_stock_status && (
                        <p
                            className="stock-status-warning-msg"
                            style={ {
                                color: values.status_text_color,
                                margin: 0,
                                fontSize:
                                    'var(--spsg-stock-bar-status-size, 11px)',
                            } }
                        >
                            { values.stock_status_text.replace(
                                /\{quantity\}|\[quantity\]/g,
                                String( AVAILABLE )
                            ) }
                        </p>
                    ) }
                </div>
            </div>
        </div>
    );
}
