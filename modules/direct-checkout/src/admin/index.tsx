/**
 * Direct Checkout admin bundle (`modules/direct-checkout/assets/js/admin.js`),
 * loaded on the StoreGrowth admin page before the app mounts. The app draws
 * the settings page (design `direct-checkout.html`) from the schema (PHP
 * `DirectCheckoutSettings`) at `#/settings?module=direct-checkout`; this adds
 * the shop-grid preview and the controls the schema can't describe:
 * - Button Layout, whose choices quote the button label;
 * - Checkout Redirect, whose Fly Cart choice needs the Fly Cart module;
 * - Padding, one control for `paddingYaxis` and `paddingXaxis`.
 *
 * @since SPSG_VERSION
 */
import { addFilter, applyFilters } from '@wordpress/hooks';
import { __, sprintf } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import {
    BoxModelField,
    LivePreview,
    RadioField,
    type RadioOption,
    type SettingsPageParts,
} from '@storegrowth/components';
import {
    type ModuleSettings,
    useModules,
    usePreviewFont,
} from '@storegrowth/hooks';
import { getHeaderData } from '@storegrowth/utilities';

import { DirectCheckoutButton } from './preview/direct-checkout-button';
import type { DirectCheckoutValues } from './types';

type Settings = ModuleSettings< DirectCheckoutValues >;

const isPro = () => {
    return Boolean( getHeaderData().header_info.is_pro_exists );
};

/**
 * The choices of a select drawn as radios: pro choices only with pro, or
 * while stored (as the page's own fields), with their info tips.
 *
 * @param settings Module settings.
 * @param key      Setting key.
 * @param label    Label of a choice.
 */
function choices(
    settings: Settings,
    key: 'buy_now_button_setting' | 'checkout_redirect',
    label: ( value: string ) => string
): RadioOption[] {
    const field = settings.schema[ key ];

    return ( field?.options ?? [] )
        .filter( ( value ) => {
            return (
                isPro() ||
                ! field?.pro_options?.includes( value ) ||
                value === settings.values[ key ]
            );
        } )
        .map( ( value ) => {
            return {
                value,
                label: label( value ),
                help: field?.option_help?.[ value ],
            };
        } );
}

/**
 * The preview (a component: it loads the chosen font).
 *
 * @param props          Props.
 * @param props.settings Module settings.
 */
function DirectCheckoutPreview( { settings }: { settings: Settings } ) {
    const { values, schema } = settings;
    const family = isPro()
        ? schema.font_family?.labels?.[ values.font_family ] ?? ''
        : '';

    usePreviewFont( family );

    /**
     * Filters the Direct Checkout preview widget, e.g. for pro to add its
     * parts.
     *
     * @since SPSG_VERSION
     *
     * @param {JSX.Element}          widget The button(s) in a shop card.
     * @param {DirectCheckoutValues} values Current (unsaved) settings.
     */
    // Where the button shows: lite prints it on product pages only; pro on
    // the shop too, unless it's turned off there.
    const page =
        isPro() && values.shop_page_checkout_enable ? 'shop' : 'product';
    const widget = applyFilters(
        'storegrowth.preview.direct-checkout',
        <DirectCheckoutButton
            values={ values }
            isPro={ isPro() }
            fontFamily={ family || 'inherit' }
            page={ page }
        />,
        values
    ) as ReactNode;

    return <LivePreview layout={ page } widget={ widget } />;
}

/**
 * Checkout Redirect: Fly Cart Checkout opens the Fly Cart panel, so it needs
 * that module (a component: it reads the modules).
 *
 * @param props          Props.
 * @param props.settings Module settings.
 */
function CheckoutRedirect( { settings }: { settings: Settings } ) {
    const { values, schema, setValue, isLocked } = settings;
    const flyCartOn = Boolean( useModules().getModule( 'fly-cart' )?.status );
    const options = choices( settings, 'checkout_redirect', ( value ) => {
        return schema.checkout_redirect?.labels?.[ value ] ?? value;
    } ).map( ( option ) => {
        if ( option.value !== 'quick-cart-checkout' || flyCartOn ) {
            return option;
        }

        // Stored while Fly Cart is off: kept, but the storefront uses the
        // checkout page until Fly Cart is active.
        const stored = option.value === values.checkout_redirect;

        return {
            ...option,
            disabled: ! stored,
            help: stored
                ? __(
                      'The Fly Cart module is inactive, so the Buy Now button goes to the checkout page. Activate Fly Cart to use this.',
                      'storegrowth-sales-booster'
                  )
                : __(
                      'Activate the Fly Cart module to use this.',
                      'storegrowth-sales-booster'
                  ),
        };
    } );

    return (
        <RadioField
            label={ schema.checkout_redirect?.label ?? '' }
            hideLabel
            inline
            value={ values.checkout_redirect }
            options={ options }
            onChange={ ( next ) => {
                setValue(
                    'checkout_redirect',
                    next as DirectCheckoutValues[ 'checkout_redirect' ]
                );
            } }
            locked={ isLocked( 'checkout_redirect' ) }
        />
    );
}

const directCheckoutPage: SettingsPageParts< DirectCheckoutValues > = {
    preview: ( settings ) => {
        return <DirectCheckoutPreview settings={ settings } />;
    },

    controls: ( settings ) => {
        const { values, schema, setValue, isLocked } = settings;
        const button =
            values.buy_now_button_label ||
            __( 'Buy Now', 'storegrowth-sales-booster' );
        // The design quotes the current label in the layout choices.
        const layouts: Record< string, string > = {
            'cart-to-buy-now': sprintf(
                /* translators: %s: the Buy Now button label. */
                __( '“Add to cart” as “%s”', 'storegrowth-sales-booster' ),
                button
            ),
            'cart-with-buy-now': sprintf(
                /* translators: %s: the Buy Now button label. */
                __( '“%s” with “Add to cart”', 'storegrowth-sales-booster' ),
                button
            ),
            'specific-buy-now': sprintf(
                /* translators: %s: the Buy Now button label. */
                __( '“%s” for specific product', 'storegrowth-sales-booster' ),
                button
            ),
        };

        return {
            buy_now_button_setting: (
                <RadioField
                    label={ schema.buy_now_button_setting?.label ?? '' }
                    hideLabel
                    spacious
                    value={ values.buy_now_button_setting }
                    options={ choices(
                        settings,
                        'buy_now_button_setting',
                        ( value ) => {
                            return (
                                layouts[ value ] ??
                                schema.buy_now_button_setting?.labels?.[
                                    value
                                ] ??
                                value
                            );
                        }
                    ) }
                    onChange={ ( next ) => {
                        setValue(
                            'buy_now_button_setting',
                            next as DirectCheckoutValues[ 'buy_now_button_setting' ]
                        );
                    } }
                    locked={ isLocked( 'buy_now_button_setting' ) }
                />
            ),
            checkout_redirect: <CheckoutRedirect settings={ settings } />,
            paddingYaxis: (
                <BoxModelField
                    label={ __( 'Padding', 'storegrowth-sales-booster' ) }
                    pairOnly
                    value={ {
                        top: values.paddingYaxis,
                        bottom: values.paddingYaxis,
                        left: values.paddingXaxis,
                        right: values.paddingXaxis,
                    } }
                    onChange={ ( next ) => {
                        settings.setValues( {
                            paddingYaxis: next.top,
                            paddingXaxis: next.left,
                        } );
                    } }
                    locked={ isLocked( 'paddingYaxis' ) }
                    error={
                        settings.errors.paddingYaxis ??
                        settings.errors.paddingXaxis
                    }
                />
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/direct-checkout',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'direct-checkout' !== moduleId ) {
            return parts;
        }

        return directCheckoutPage as SettingsPageParts;
    }
);
