/**
 * Free Shipping bar preview (ADR-005 S10): the storefront bar's markup and
 * classes (`templates/bar.php`) with the inline CSS `EnqueueScript` prints,
 * styled by the real `storefront-bar.css` and module stylesheet (loaded on
 * this admin page). The wrapper is put in the page flow here; on the
 * storefront it is positioned and revealed by `banner-bar-remove.js`.
 *
 * `.spsg-storefront` keeps the admin's scoped reset out of this subtree.
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import { BAR_FONTS } from '@storegrowth/components';
import { Bus, Caravan, Truck, X, type LucideIcon } from 'lucide-react';

import type { FreeShippingValues } from '../types';

/** Stored icon slug → the icon the storefront draws. */
export const BAR_ICONS: Record< string, LucideIcon > = {
    'shipping-bar-icon-1': Truck,
    'shipping-bar-icon-2': Caravan,
    'shipping-bar-icon-3': Bus,
};

/** The icons as the picker offers them (design order). */
export const ICON_CHOICES = [
    {
        value: 'shipping-bar-icon-2',
        label: __( 'Caravan', 'storegrowth-sales-booster' ),
        Icon: Caravan,
    },
    {
        value: 'shipping-bar-icon-1',
        label: __( 'Truck', 'storegrowth-sales-booster' ),
        Icon: Truck,
    },
    {
        value: 'shipping-bar-icon-3',
        label: __( 'Bus', 'storegrowth-sales-booster' ),
        Icon: Bus,
    },
];

export interface FreeShippingBarProps {
    values: FreeShippingValues;
    /** The text with `[amount]` already replaced. */
    text: string;
    /** Pro is active (it draws the custom icon). */
    isPro: boolean;
}

/**
 * @since SPSG_VERSION
 *
 * @param props        Props.
 * @param props.values Current (unsaved) settings.
 * @param props.text   Banner text.
 * @param props.isPro  Pro is active.
 */
export function FreeShippingBar( {
    values,
    text,
    isPro,
}: FreeShippingBarProps ) {
    const Icon = BAR_ICONS[ values.progressive_banner_icon_name ];
    const custom = isPro && ! Icon ? values.progressive_banner_custom_icon : '';

    return (
        <div className="spsg-storefront">
            <div
                className="spsg-pd-banner-bar-wrapper"
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
                    className="spsg-pd-banner-bar"
                    style={ { padding: '8px 16px' } }
                >
                    <div
                        className="spsg-pd-banner-bar-icon"
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
                    <div className="spsg-fn-bar-data-content">
                        <span
                            className="spsg-pd-banner-text"
                            style={ {
                                fontSize: values.font_size,
                                fontFamily: BAR_FONTS[ values.font_family ],
                            } }
                        >
                            { text }
                        </span>
                        { values.btn_style && (
                            <span
                                className="fn-bar-action-button"
                                style={ {
                                    background: values.btn_color,
                                    color: values.btn_text_color,
                                } }
                            >
                                { values.btn_text }
                            </span>
                        ) }
                    </div>
                    <div
                        className="spsg-pd-banner-bar-remove"
                        style={ { color: values.close_icon_color } }
                    >
                        <X size={ 18 } aria-hidden />
                    </div>
                </div>
            </div>
        </div>
    );
}
