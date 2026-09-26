/**
 * Countdown Timer preview widget (ADR-005 S10): the storefront template's
 * markup and classes (`templates/countdown-timer.php`), styled by the real
 * storefront stylesheet (`wpbs-style.css`, loaded on this admin page), with
 * the live form values as the same `--spsg-countdown-timer-*` variables the
 * storefront prints.
 *
 * `.spsg-storefront` keeps the admin's scoped reset out of this subtree.
 *
 * @since SPSG_VERSION
 */
import { Fragment, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { CSSProperties } from 'react';
import type { BoxValue } from '@storegrowth/utilities';

import { ALIGNMENT_FLEX } from '@storegrowth/components';

import { fontFamily } from '../data';
import type { CountdownTimerValues } from '../types';

/** Sample discount for `[discount]`. */
const DISCOUNT = '20';

/** The time the design shows: 3d 21h 02m 33s. */
const SAMPLE_SECONDS = ( ( 3 * 24 + 21 ) * 60 + 2 ) * 60 + 33;

const pad = ( value: number ) => String( value ).padStart( 2, '0' );

const digitsOf = ( seconds: number ) => [
    pad( Math.floor( seconds / 86400 ) ),
    pad( Math.floor( seconds / 3600 ) % 24 ),
    pad( Math.floor( seconds / 60 ) % 60 ),
    pad( seconds % 60 ),
];

const box = ( value: BoxValue ) =>
    `${ value.top }px ${ value.right }px ${ value.bottom }px ${ value.left }px`;

const font = ( slug: string ) => `'${ fontFamily( slug ) }', sans-serif`;

export interface CountdownWidgetProps {
    /** Settings as the storefront applies them. */
    values: CountdownTimerValues;
    /** Day, hour, minute, second. */
    digits?: string[];
    /** Root font size in px; the widget's type and boxes follow it. */
    fontSize?: number;
}

/**
 * The live preview: the widget counting down from the sample time. The clock
 * lives here, so only the preview re-renders each second.
 *
 * @since SPSG_VERSION
 *
 * @param props Widget props (without digits).
 */
export function CountdownPreview(
    props: Omit< CountdownWidgetProps, 'digits' >
) {
    const [ left, setLeft ] = useState( SAMPLE_SECONDS );

    useEffect( () => {
        const timer = window.setInterval(
            () => setLeft( ( value ) => Math.max( 0, value - 1 ) ),
            1000
        );

        return () => window.clearInterval( timer );
    }, [] );

    return <CountdownWidget { ...props } digits={ digitsOf( left ) } />;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.values   Settings as the storefront applies them.
 * @param props.digits   Digits to show.
 * @param props.fontSize Root font size.
 */
export function CountdownWidget( {
    values,
    digits = digitsOf( SAMPLE_SECONDS ),
    fontSize = 16,
}: CountdownWidgetProps ) {
    const unitColors = [
        values.day_text_color,
        values.hour_text_color,
        values.minute_text_color,
        values.second_text_color,
    ];

    let layout = values.selected_theme;

    // As the template: boxes with their own background drop the old gradient strip.
    if (
        layout === 'ct-layout-2' &&
        values.counter_background_color !== 'transparent'
    ) {
        layout = '';
    }

    const headingClass =
        values.selected_theme === 'ct-layout-2' &&
        values.heading_text_color === 'transparent'
            ? 'default'
            : '';

    const variables = {
        fontSize: `${ fontSize }px`,
        '--spsg-countdown-timer-bg': values.widget_background_color,
        '--spsg-countdown-timer-border': values.border_color,
        '--spsg-countdown-timer-radius': `${ values.widget_radius }px`,
        '--spsg-countdown-timer-margin': box( values.widget_margin ),
        '--spsg-countdown-timer-padding': box( values.widget_padding ),
        '--spsg-countdown-timer-align':
            ALIGNMENT_FLEX[ values.widget_alignment ],
        '--spsg-countdown-timer-text-align': values.widget_alignment,
        '--spsg-countdown-timer-heading-color': values.heading_text_color,
        '--spsg-countdown-timer-heading-font': font( values.font_family ),
        '--spsg-countdown-timer-heading-weight': values.heading_font_weight,
        '--spsg-countdown-timer-heading-tracking': `${ values.heading_letter_spacing }px`,
        '--spsg-countdown-timer-heading-leading': `${ values.heading_line_height }px`,
        '--spsg-countdown-timer-counter-radius': `${ values.counter_radius }px`,
        '--spsg-countdown-timer-counter-margin': box( values.counter_margin ),
        '--spsg-countdown-timer-counter-padding': box( values.counter_padding ),
        '--spsg-countdown-timer-counter-align':
            ALIGNMENT_FLEX[ values.counter_alignment ],
        '--spsg-countdown-timer-counter-font': font(
            values.counter_font_family
        ),
        '--spsg-countdown-timer-counter-weight': values.counter_font_weight,
        '--spsg-countdown-timer-counter-tracking': `${ values.counter_letter_spacing }px`,
        '--spsg-countdown-timer-counter-bg': values.counter_background_color,
        '--spsg-countdown-timer-counter-border': values.counter_border_color,
        '--spsg-countdown-timer-label-color': values.counter_label_color,
        '--spsg-countdown-timer-separator-color':
            values.counter_separator_color,
    } as CSSProperties;

    const labels = [
        __( 'Days', 'storegrowth-sales-booster' ),
        __( 'Hours', 'storegrowth-sales-booster' ),
        __( 'Min', 'storegrowth-sales-booster' ),
        __( 'Sec', 'storegrowth-sales-booster' ),
    ];

    const heading = values.countdown_heading.replace(
        /\[discount\]|\{discount\}/g,
        DISCOUNT
    );

    return (
        <div className="spsg-storefront w-full">
            <div
                className={ `spsg-countdown-timer ${ layout }` }
                style={ variables }
            >
                <div className="spsg-countdown-timer-wrapper">
                    { heading && (
                        <p
                            className={ `spsg-countdown-timer-heading ${ layout } ${ headingClass }` }
                        >
                            { heading }
                        </p>
                    ) }
                    <div className={ `spsg-countdown-timer-items ${ layout }` }>
                        { digits.map( ( digit, index ) => (
                            <Fragment key={ labels[ index ] }>
                                { index > 0 && (
                                    <span
                                        className={ `spsg-colon ${ layout }` }
                                    >
                                        :
                                    </span>
                                ) }
                                <div
                                    className={ `spsg-countdown-timer-item ${ layout }` }
                                    style={
                                        {
                                            '--spsg-countdown-timer-digit-color':
                                                unitColors[ index ],
                                        } as CSSProperties
                                    }
                                >
                                    <strong>{ digit }</strong>
                                    <span>{ labels[ index ] }</span>
                                </div>
                            </Fragment>
                        ) ) }
                    </div>
                </div>
            </div>
        </div>
    );
}
