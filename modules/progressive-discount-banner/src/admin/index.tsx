/**
 * Free Shipping Rules admin bundle
 * (`modules/progressive-discount-banner/assets/js/admin.js`), loaded on the
 * StoreGrowth admin page before the app mounts. The app draws the settings
 * page (design `free-shipping-rules.html`) from the schema (PHP
 * `ProgressiveDiscountBannerSettings`: page, tabs, sections, fields) at
 * `#/settings?module=progressive-discount-banner`; this adds the live preview
 * and the controls that set more than one key: the icon picker, the Discount
 * Type select, the discount amount (currency or %) and the template picker.
 *
 * @since SPSG_VERSION
 */
import { Popover, PopoverContent, PopoverTrigger } from '@wedevs/plugin-ui';
import { addFilter } from '@wordpress/hooks';
import { createInterpolateElement, useId, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Info } from 'lucide-react';
import {
    barShowsOn,
    IconPicker,
    LivePreview,
    NumberField,
    SelectField,
    type SettingsPageParts,
    TemplatePicker,
    ToggleSwitch,
} from '@storegrowth/components';
import type { ModuleSettings } from '@storegrowth/hooks';
import { getHeaderData } from '@storegrowth/utilities';

import { FreeShippingBar, ICON_CHOICES } from './preview/free-shipping-bar';
import type { FreeShippingValues } from './types';

/** The store's price format (`AdminPage::data()`). */
const store = (
    window as unknown as {
        spsgFreeShippingData: {
            currency: string;
            currency_pos: 'left' | 'right' | 'left_space' | 'right_space';
            decimals: string;
            decimal_separator: string;
        };
    }
 ).spsgFreeShippingData;

/**
 * An amount as `wc_price()` prints it (without thousands separators).
 *
 * @param amount Amount.
 */
function price( amount: number ) {
    const number = amount
        .toFixed( Number( store.decimals ) )
        .replace( '.', store.decimal_separator );

    return {
        left: `${ store.currency }${ number }`,
        right: `${ number }${ store.currency }`,
        left_space: `${ store.currency } ${ number }`,
        right_space: `${ number } ${ store.currency }`,
    }[ store.currency_pos ];
}

/**
 * The banner text on an empty cart: the whole minimum is left to spend.
 *
 * @param values Current settings.
 */
function waitingText( values: FreeShippingValues ) {
    return ( values.progressive_banner_text ?? '' ).replace(
        /\[amount\]/g,
        price( values.cart_minimum_amount ?? 0 )
    );
}

/** The design's one Discount Type select over the two stored keys. */
const DISCOUNT_TYPES = [
    {
        value: 'free-shipping',
        label: __( 'Free Shipping', 'storegrowth-sales-booster' ),
    },
    {
        value: 'percentage',
        label: __( 'Percentage Discount', 'storegrowth-sales-booster' ),
    },
    {
        value: 'fixed-amount',
        label: __( 'Fixed Discount', 'storegrowth-sales-booster' ),
    },
];

/** The one template: the design's colours (the schema defaults keep #073b4c). */
const TEMPLATE = {
    background_color: '#0875FF',
    text_color: '#ffffff',
    icon_color: '#ffffff',
    close_icon_color: '#ffffff',
    btn_color: '#ffffff',
    btn_text_color: '#12303c',
};

/**
 * Discount Type label with the WooCommerce free-shipping help (design
 * `.tip-bubble--panel`).
 */
function DiscountTypeLabel() {
    const link = 'font-semibold text-sg-brand hover:underline';
    const shipping = 'admin.php?page=wc-settings&tab=shipping';

    return (
        <span className="flex items-center gap-2">
            { __( 'Discount Type', 'storegrowth-sales-booster' ) }
            <Popover>
                <PopoverTrigger
                    openOnHover
                    aria-label={ __(
                        'How to set up free shipping in WooCommerce',
                        'storegrowth-sales-booster'
                    ) }
                    className="inline-flex cursor-help items-center border-0 bg-transparent p-0 text-[#71717A] hover:text-sg-brand"
                >
                    <Info className="size-4" strokeWidth={ 1.5 } aria-hidden />
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="flex w-80 max-w-[78vw] flex-col gap-2 rounded-[6px] border border-sg-stroke bg-white px-3.5 py-3 text-xs font-normal leading-normal text-[#575757] shadow-[0_8px_24px_rgba(0,0,0,.10)]"
                >
                    <p>
                        { createInterpolateElement(
                            __(
                                'To set the free shipping method, go to <shipping>Shipping</shipping> in WooCommerce settings. Then add a <zone>Shipping Zone</zone>. In the zone, add the <b>Free Shipping</b> shipping method and set the minimum amount it needs.',
                                'storegrowth-sales-booster'
                            ),
                            {
                                // The text between the tags fills the links.
                                shipping: (
                                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                                    <a href={ shipping } className={ link } />
                                ),
                                zone: (
                                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                                    <a href={ shipping } className={ link } />
                                ),
                                b: <b className="font-semibold text-sg-text" />,
                            }
                        ) }
                    </p>
                    <p>
                        { createInterpolateElement(
                            __(
                                'For more, see the <docs>WooCommerce documentation</docs>.',
                                'storegrowth-sales-booster'
                            ),
                            {
                                docs: (
                                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                                    <a
                                        href="https://woocommerce.com/document/free-shipping/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className={ link }
                                    />
                                ),
                            }
                        ) }
                    </p>
                </PopoverContent>
            </Popover>
        </span>
    );
}

/**
 * The bar above (or below) the product, with a switch to preview the goal
 * reached.
 *
 * @param props          Props.
 * @param props.settings The page's settings.
 */
function FreeShippingPreview( {
    settings,
}: {
    settings: ModuleSettings< FreeShippingValues >;
} ) {
    const { values } = settings;
    const [ goalReached, setGoalReached ] = useState( false );
    const goalId = useId();
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );

    return (
        <LivePreview
            banner={ ( { device } ) => {
                return (
                    barShowsOn( values.banner_device_view, device ) && (
                        <FreeShippingBar
                            values={ values }
                            text={
                                goalReached
                                    ? values.goal_completion_text
                                    : waitingText( values )
                            }
                            isPro={ isPro }
                        />
                    )
                );
            } }
            bannerPosition={ values.bar_position }
            footer={
                <div className="flex w-full max-w-[360px] flex-col gap-3">
                    <span className="flex items-center justify-center gap-2 text-sm text-sg-text">
                        <ToggleSwitch
                            id={ goalId }
                            checked={ goalReached }
                            onCheckedChange={ setGoalReached }
                        />
                        <label htmlFor={ goalId }>
                            { __(
                                'Preview with the goal reached',
                                'storegrowth-sales-booster'
                            ) }
                        </label>
                    </span>
                    { ! settings.published && (
                        <p className="text-center text-xs text-sg-help">
                            { __(
                                'The bar shows on your store once you save these settings.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    ) }
                </div>
            }
        />
    );
}

const freeShippingPage: SettingsPageParts< FreeShippingValues > = {
    preview: ( settings ) => {
        return <FreeShippingPreview settings={ settings } />;
    },

    controls: ( { values, setValue, setValues, isLocked, errors } ) => {
        const isPro = Boolean( getHeaderData().header_info.is_pro_exists );
        const discountType =
            values.discount_type === 'free-shipping'
                ? 'free-shipping'
                : values.discount_amount_mode;

        return {
            progressive_banner_icon_name: (
                <IconPicker
                    label={ __( 'Banner Icon', 'storegrowth-sales-booster' ) }
                    icons={ ICON_CHOICES }
                    value={ values.progressive_banner_icon_name }
                    onChange={ ( next ) => {
                        setValue( 'progressive_banner_icon_name', next );
                    } }
                    custom={ values.progressive_banner_custom_icon }
                    onCustomChange={ ( next ) => {
                        setValue( 'progressive_banner_custom_icon', next );
                    } }
                    locked={ isLocked( 'progressive_banner_icon_name' ) }
                    error={ errors.progressive_banner_custom_icon }
                />
            ),

            discount_type: (
                <SelectField
                    label={ <DiscountTypeLabel /> }
                    value={ discountType }
                    options={ DISCOUNT_TYPES }
                    onChange={ ( next ) => {
                        if ( next === 'free-shipping' ) {
                            setValue( 'discount_type', 'free-shipping' );
                            return;
                        }

                        setValues( {
                            discount_type: 'discount-amount',
                            discount_amount_mode:
                                next as FreeShippingValues[ 'discount_amount_mode' ],
                        } );
                    } }
                    locked={ isLocked( 'discount_type' ) }
                    error={ errors.discount_type }
                />
            ),

            // Shown for a discount only (`show_when`); the unit follows the mode.
            discount_amount_value: (
                <NumberField
                    label={ __(
                        'Discount Amount',
                        'storegrowth-sales-booster'
                    ) }
                    allowEmpty
                    prefix={
                        discountType === 'fixed-amount'
                            ? store.currency
                            : undefined
                    }
                    suffix={ discountType === 'percentage' ? '%' : undefined }
                    min={ 0 }
                    step={ 0.01 }
                    value={ values.discount_amount_value }
                    onChange={ ( next ) => {
                        setValue( 'discount_amount_value', next );
                    } }
                    locked={ isLocked( 'discount_amount_value' ) }
                    error={ errors.discount_amount_value }
                />
            ),

            bar_template: (
                <TemplatePicker
                    bare
                    templates={ [
                        {
                            id: 'shipping_bar_one',
                            label: __(
                                'Blue template',
                                'storegrowth-sales-booster'
                            ),
                            preview: (
                                <FreeShippingBar
                                    values={ {
                                        ...values,
                                        ...TEMPLATE,
                                        banner_height: 44,
                                        font_size: 13,
                                    } }
                                    text={ waitingText( values ) }
                                    isPro={ isPro }
                                />
                            ),
                        },
                    ] }
                    value={ values.bar_template }
                    onSelect={ () => {
                        setValues( {
                            bar_template: 'shipping_bar_one',
                            ...TEMPLATE,
                        } );
                    } }
                    locked={ isLocked( 'bar_template' ) }
                />
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/progressive-discount-banner',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'progressive-discount-banner' !== moduleId ) {
            return parts;
        }

        return freeShippingPage as SettingsPageParts;
    }
);
