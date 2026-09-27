/**
 * Floating Bar preview (ADR-005 S10): the storefront bar's markup and
 * classes (`templates/bar.php`, with pro's countdown and coupon parts) and
 * the inline CSS `EnqueueScript` prints, styled by the real
 * `storefront-bar.css` and module stylesheet (loaded on this admin page).
 * The wrapper is put in the page flow here; on the storefront it is
 * positioned and revealed by `banner-bar-remove.js`.
 *
 * `.spsg-storefront` keeps the admin's scoped reset out of this subtree.
 *
 * @since SPSG_VERSION
 */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { BAR_FONTS } from '@storegrowth/components';
import {
    BadgePercent,
    Gift,
    HandCoins,
    X,
    type LucideIcon,
} from 'lucide-react';

import type { FloatingBarValues } from '../types';

/** Stored icon slug → the icon the storefront draws. */
export const BAR_ICONS: Record< string, LucideIcon > = {
    'notify-bar-icon-1': Gift,
    'notify-bar-icon-2': BadgePercent,
    'notify-bar-icon-3': HandCoins,
};

/** The icons as the picker offers them. */
export const ICON_CHOICES = [
    {
        value: 'notify-bar-icon-1',
        label: __( 'Gift', 'storegrowth-sales-booster' ),
        Icon: Gift,
    },
    {
        value: 'notify-bar-icon-2',
        label: __( 'Discount badge', 'storegrowth-sales-booster' ),
        Icon: BadgePercent,
    },
    {
        value: 'notify-bar-icon-3',
        label: __( 'Coins in hand', 'storegrowth-sales-booster' ),
        Icon: HandCoins,
    },
];

const UNITS = [ 'DAY', 'HRS', 'MIN', 'SEC' ];

/**
 * Time left until the end date's last second, as the storefront counts it:
 * nothing before the start date, zeros after the end.
 *
 * @param start `Y-m-d` or `''`.
 * @param end   `Y-m-d` or `''`.
 */
function remaining( start: string, end: string ): string[] | null {
    const now = Date.now();

    if ( start && now < new Date( `${ start }T00:00:00` ).getTime() ) {
        return null;
    }

    const left = end
        ? Math.max( 0, new Date( `${ end }T23:59:59` ).getTime() - now )
        : 0;
    const seconds = Math.floor( left / 1000 );

    return [
        Math.floor( seconds / 86400 ),
        Math.floor( seconds / 3600 ) % 24,
        Math.floor( seconds / 60 ) % 60,
        seconds % 60,
    ].map( ( part ) => String( part ).padStart( 2, '0' ) );
}

export interface FloatingBarProps {
    values: FloatingBarValues;
    /** Pro is active (it draws the custom icon, countdown and coupon). */
    isPro: boolean;
    /** Show the button (its device setting allows this width). */
    showButton: boolean;
}

/**
 * @since SPSG_VERSION
 *
 * @param props            Props.
 * @param props.values     Current (unsaved) settings.
 * @param props.isPro      Pro is active.
 * @param props.showButton Button shown at this width.
 */
export function FloatingBar( { values, isPro, showButton }: FloatingBarProps ) {
    const Icon = BAR_ICONS[ values.default_banner_icon_name ];
    const custom = isPro && ! Icon ? values.default_banner_custom_icon : '';
    const countdown = isPro && values.countdown_show_enable;

    // Tick every second while the countdown shows.
    const [ , setTick ] = useState( 0 );
    useEffect( () => {
        if ( ! countdown ) {
            return;
        }

        const timer = setInterval(
            () => setTick( ( tick ) => tick + 1 ),
            1000
        );
        return () => clearInterval( timer );
    }, [ countdown ] );

    const time = countdown
        ? remaining( values.countdown_start_date, values.countdown_end_date )
        : null;

    return (
        <div className="spsg-storefront">
            <div
                className="spsg-floating-notification-bar-wrapper"
                style={ {
                    display: 'flex',
                    position: 'static',
                    top: 'auto',
                    backgroundColor: values.background_color,
                    color: values.text_color,
                    // Grows when the copy wraps, as on narrow screens.
                    height: 'auto',
                    minHeight: values.banner_height,
                } }
            >
                { /* Room above and below wrapped rows, as on narrow screens. */ }
                <div
                    className="spsg-floating-notification-bar"
                    style={ { padding: '8px 16px' } }
                >
                    <div
                        className="spsg-floating-notification-bar-icon"
                        style={ { color: values.icon_color } }
                    >
                        { Icon && (
                            <Icon className="spsg-bar-icon" aria-hidden />
                        ) }
                        { custom && (
                            <img
                                width={ 32 }
                                height={ 32 }
                                src={ custom }
                                alt=""
                            />
                        ) }
                    </div>
                    <div className="spsg-floating-notification-bar-text-container">
                        <span
                            className="spsg-floating-notification-bar-text"
                            style={ {
                                fontSize: values.font_size,
                                fontFamily: BAR_FONTS[ values.font_family ],
                            } }
                        >
                            { values.default_banner_text }
                        </span>
                        { time && (
                            <div className="spsg-fn-bar-countdown">
                                { time.map( ( value, index ) => (
                                    <div
                                        key={ UNITS[ index ] }
                                        className="spsg-fn-bar-countdown-value"
                                    >
                                        <span className="spsg-countdown-value">
                                            { value }
                                        </span>
                                        <span className="spsg-countdown-content">
                                            { UNITS[ index ] }
                                        </span>
                                    </div>
                                ) ) }
                            </div>
                        ) }
                        { isPro && values.show_cupon && values.cupon_code && (
                            <div className="spsg-coupon-container">
                                <div className="spsg-coupon-code">
                                    { values.cupon_code.toUpperCase() }
                                </div>
                            </div>
                        ) }
                        { values.button_enable && showButton && (
                            <span
                                className="fn-bar-action-button"
                                style={ {
                                    backgroundColor: values.button_color,
                                    color: values.button_text_color,
                                } }
                            >
                                { values.ac_button_text }
                            </span>
                        ) }
                    </div>
                    <div
                        className="spsg-floating-notification-bar-remove"
                        style={ { color: values.close_icon_color } }
                    >
                        <X size={ 18 } aria-hidden />
                    </div>
                </div>
            </div>
        </div>
    );
}
