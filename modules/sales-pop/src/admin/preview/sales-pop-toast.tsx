/**
 * Sales Notification preview (ADR-005 S10): the storefront popup's markup
 * and classes (`templates/popup.php`), with the inline styles
 * `templates/popup-style.php` prints and the message `popup-custom.js`
 * builds, styled by the real `popup-custom.css` (loaded on this admin page).
 *
 * `.spsg-storefront` keeps the admin's scoped reset out of this subtree.
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import type { CSSProperties, ReactNode } from 'react';

import type { SalesPopValues } from '../types';

/** The shopper-facing sample the preview shows. */
export interface ToastSample {
    name: string;
    product: string;
    image: string;
    location: string;
    minutes: number;
}

export interface SalesPopToastProps {
    values: SalesPopValues;
    sample: ToastSample;
    /** Pro is active (it draws the image on the right when asked). */
    isPro: boolean;
    /** Float in the chosen corner of the preview frame (else in the flow). */
    floating?: boolean;
}

const text = ( values: SalesPopValues, prefix: string, color: string ) =>
    ( {
        color: values[ color ] as string,
        fontSize: `${ values[ `${ prefix }_font_size` ] }px`,
        fontWeight: values[ `${ prefix }_font_weight` ] as string,
    } ) as CSSProperties;

const CORNERS: Record< SalesPopValues[ 'popup_position' ], CSSProperties > = {
    left_bottom: { left: 16, bottom: 16 },
    right_bottom: { right: 16, bottom: 16 },
    left_top: { left: 16, top: 36 },
    right_top: { right: 16, top: 36 },
};

/**
 * The message as the storefront builds it: one line per message line; each
 * token replaced once (its first occurrence), the rest left as typed.
 *
 * @param message Message template.
 * @param parts   Token → markup.
 */
function messageLines( message: string, parts: Record< string, ReactNode > ) {
    const used = new Set< string >();

    return message
        .split( /\r?\n/ )
        .map( ( line ) => line.replace( /\s+/g, ' ' ).trim() )
        .filter( Boolean )
        .map( ( line, index ) => (
            <span key={ index } className="spsg-sales-pop-line">
                { line.split( /(\{[a-z_]+\})/ ).map( ( piece, at ) => {
                    if ( parts[ piece ] && ! used.has( piece ) ) {
                        used.add( piece );
                        return <span key={ at }>{ parts[ piece ] }</span>;
                    }

                    return piece;
                } ) }
            </span>
        ) );
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.values   Current (unsaved) settings.
 * @param props.sample   Name, product, image, location, time shown.
 * @param props.isPro    Pro is active.
 * @param props.floating Float in the chosen corner.
 */
export function SalesPopToast( {
    values,
    sample,
    isPro,
    floating = false,
}: SalesPopToastProps ) {
    const name = text( values, 'name_text', 'name_text_color' );
    const time = text( values, 'time_text', 'time_text_color' );
    const [ city, state, country ] = sample.location
        .split( ',' )
        .map( ( part ) => part.trim() );
    const locationParts = [
        [ city, text( values, 'city_text', 'city_text_color' ) ],
        [ state, text( values, 'state_text', 'state_text_color' ) ],
        [ country, text( values, 'country_text', 'country_text_color' ) ],
    ].filter( ( [ part ] ) => part ) as Array< [ string, CSSProperties ] >;

    const parts: Record< string, ReactNode > = {
        '{virtual_name}': (
            <>
                <span style={ name }>{ sample.name }</span>{ ' ' }
                <span style={ name }>
                    { __( 'Just purchased', 'storegrowth-sales-booster' ) }
                </span>
            </>
        ),
        '{product_title}': (
            <a href="#preview" onClick={ ( event ) => event.preventDefault() }>
                <span
                    style={ text(
                        values,
                        'product_title',
                        'product_title_color'
                    ) }
                >
                    { sample.product }
                </span>
            </a>
        ),
        '{location}': locationParts.map( ( [ part, style ], index ) => (
            <span key={ part } style={ style }>
                { index ? ', ' : '' }
                { part }
            </span>
        ) ),
        '{time}': (
            <>
                <span style={ time }>{ sample.minutes }</span>{ ' ' }
                <span style={ time }>
                    { __( 'minutes ago', 'storegrowth-sales-booster' ) }
                </span>
            </>
        ),
    };

    const imageStyle = {
        width: `${ values.popup_image_width || 100 }px`,
        borderRadius: `${ values.popup_image_border_radius || 0 }px`,
    };

    return (
        <div className="spsg-storefront">
            <section
                className="custom-social-proof"
                style={ {
                    display: 'block',
                    ...( floating
                        ? {
                              position: 'absolute',
                              maxWidth: 'calc(100% - 32px)',
                              ...CORNERS[ values.popup_position ],
                          }
                        : { position: 'relative' } ),
                } }
            >
                <div
                    className="custom-notification"
                    style={ {
                        width: `${ values.popup_width || 400 }px`,
                        maxWidth: '100%',
                        borderRadius: `${ values.popup_border_radius || 0 }px`,
                        background: values.background_color || 'white',
                    } }
                >
                    <div
                        className="custom-notification-container"
                        style={
                            isPro && values.image_position === 'right'
                                ? { flexDirection: 'row-reverse' }
                                : undefined
                        }
                    >
                        <div
                            className="custom-notification-image-wrapper"
                            style={ {
                                padding: `${ values.spacing_around_image }px`,
                            } }
                        >
                            { values.template === '2' ? (
                                <span
                                    className="spsg-sales-pop-icon"
                                    style={ { width: imageStyle.width } }
                                    aria-hidden
                                >
                                    <ShoppingBagIcon />
                                </span>
                            ) : (
                                <img
                                    src={ sample.image }
                                    alt=""
                                    style={ imageStyle }
                                />
                            ) }
                        </div>
                        <div className="custom-notification-content-wrapper">
                            <div
                                className="custom-notification-content"
                                style={ text(
                                    values,
                                    'normal_text',
                                    'normal_text_color'
                                ) }
                            >
                                { messageLines( values.message_popup, parts ) }
                            </div>
                        </div>
                        { values.show_close_button && (
                            <div
                                className={ `custom-close template-${ values.template }` }
                            />
                        ) }
                    </div>
                </div>
            </section>
        </div>
    );
}

/** The storefront's bag icon (lucide `shopping-bag`, as in `popup.php`). */
function ShoppingBagIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 10a4 4 0 0 1-8 0" />
            <path d="M3.103 6.034h17.794" />
            <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
        </svg>
    );
}
