/**
 * Floating Bar admin bundle
 * (`modules/floating-notification-bar/assets/js/admin.js`), loaded on the
 * StoreGrowth admin page before the app mounts. The app draws the Floating
 * Bar settings page (design `floating-bar.html`) from the schema (PHP
 * `FloatingNotificationBarSettings`: page, tabs, sections, fields) at
 * `#/settings?module=floating-notification-bar`; this adds the live preview
 * (the bar above or below the product) and the controls that set more than
 * one key or need runtime data: the icon picker, the coupon select and the
 * template picker.
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
    barShowsOn,
    IconPicker,
    isMobilePreview,
    LivePreview,
    SelectField,
    type SettingsPageParts,
    TemplatePicker,
} from '@storegrowth/components';
import { getHeaderData } from '@storegrowth/utilities';

import { FloatingBar, ICON_CHOICES } from './preview/floating-bar';
import type { FloatingBarValues } from './types';

/** The store's coupons, localized as before (`AdminPage::data()`). */
const COUPONS =
    (
        window as unknown as {
            spsg_fnb_coupon_data?: Array< { value: string; label: string } >;
        }
     ).spsg_fnb_coupon_data ?? [];

type Preset = Pick<
    FloatingBarValues,
    | 'background_color'
    | 'text_color'
    | 'icon_color'
    | 'button_color'
    | 'button_text_color'
    | 'close_icon_color'
>;

/** Templates are presets: they fill the six colour fields. */
const TEMPLATES: Array< {
    id: FloatingBarValues[ 'notify_template' ];
    label: string;
    colors: Preset;
} > = [
    {
        id: 'notify_bar_one',
        label: __( 'Blue template', 'storegrowth-sales-booster' ),
        colors: {
            background_color: '#0875ff',
            text_color: '#ffffff',
            icon_color: '#ffffff',
            button_color: '#ffffff',
            button_text_color: '#000000',
            close_icon_color: '#ffffff',
        },
    },
    {
        id: 'notify_bar_dark',
        label: __( 'Dark template', 'storegrowth-sales-booster' ),
        colors: {
            background_color: '#0f172a',
            text_color: '#ffffff',
            icon_color: '#94a3b8',
            button_color: '#ffffff',
            button_text_color: '#0f172a',
            close_icon_color: '#94a3b8',
        },
    },
    {
        id: 'notify_bar_red',
        label: __( 'Red template', 'storegrowth-sales-booster' ),
        colors: {
            background_color: '#e90f31',
            text_color: '#ffffff',
            icon_color: '#ffe4e6',
            button_color: '#ffffff',
            button_text_color: '#e90f31',
            close_icon_color: '#ffe4e6',
        },
    },
    {
        id: 'notify_bar_amber',
        label: __( 'Amber template', 'storegrowth-sales-booster' ),
        colors: {
            background_color: '#ffbd00',
            text_color: '#1f2938',
            icon_color: '#ad0000',
            button_color: '#1f2938',
            button_text_color: '#ffbd00',
            close_icon_color: '#1f2938',
        },
    },
];

/**
 * A miniature of the bar (design `.bar-tpl`): icon square, text line and
 * button in the preset's colours.
 *
 * @param colors Preset colours.
 */
const templatePreview = ( colors: Preset ) => {
    return (
        <span
            className="flex h-[34px] w-full items-center gap-1.5 px-2.5"
            style={ { background: colors.background_color } }
        >
            <span
                className="size-2.5 shrink-0 rounded-[2px] opacity-90"
                style={ { background: colors.icon_color } }
            />
            <span
                className="h-1.5 flex-auto rounded-[3px] opacity-55"
                style={ { background: colors.text_color } }
            />
            <span
                className="h-3 w-8 shrink-0 rounded-[3px]"
                style={ { background: colors.button_color } }
            />
        </span>
    );
};

const floatingBarPage: SettingsPageParts< FloatingBarValues > = {
    preview: ( { values, published } ) => {
        const isPro = Boolean( getHeaderData().header_info.is_pro_exists );

        return (
            <LivePreview
                banner={ ( { device } ) => {
                    return (
                        barShowsOn( values.banner_device_view, device ) && (
                            <FloatingBar
                                values={ values }
                                isPro={ isPro }
                                showButton={ (
                                    values.button_view ?? []
                                ).includes(
                                    isMobilePreview( device )
                                        ? 'button-mobile-enable'
                                        : 'button-desktop-enable'
                                ) }
                            />
                        )
                    );
                } }
                bannerPosition={ values.bar_position }
                footer={
                    ! published && (
                        <p className="text-center text-xs text-sg-help">
                            { __(
                                'The bar shows on your store once you save these settings.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    )
                }
            />
        );
    },

    controls: ( { values, setValue, setValues, isLocked, errors } ) => {
        const applyTemplate = ( id: string ) => {
            const template = TEMPLATES.find( ( item ) => {
                return item.id === id;
            } );

            if ( template ) {
                setValues( {
                    notify_template: template.id,
                    ...template.colors,
                } );
            }
        };

        return {
            // Sets the icon, or (pro) a custom icon URL.
            default_banner_icon_name: (
                <IconPicker
                    label={ __( 'Banner Icon', 'storegrowth-sales-booster' ) }
                    icons={ ICON_CHOICES }
                    value={ values.default_banner_icon_name }
                    onChange={ ( next ) => {
                        setValue( 'default_banner_icon_name', next );
                    } }
                    custom={ values.default_banner_custom_icon }
                    onCustomChange={ ( next ) => {
                        setValue( 'default_banner_custom_icon', next );
                    } }
                    locked={ isLocked( 'default_banner_icon_name' ) }
                    error={ errors.default_banner_custom_icon }
                />
            ),
            // The store's coupons, known only at runtime.
            cupon_code: (
                <SelectField
                    label={ __( 'Coupon Code', 'storegrowth-sales-booster' ) }
                    value={ values.cupon_code }
                    options={ COUPONS }
                    onChange={ ( next ) => {
                        setValue( 'cupon_code', next );
                    } }
                    locked={ isLocked( 'cupon_code' ) }
                    error={ errors.cupon_code }
                />
            ),
            notify_template: (
                <TemplatePicker
                    bare
                    templates={ TEMPLATES.map( ( template ) => {
                        return {
                            id: template.id,
                            label: template.label,
                            preview: templatePreview( template.colors ),
                        };
                    } ) }
                    value={ values.notify_template }
                    onSelect={ applyTemplate }
                    locked={ isLocked( 'notify_template' ) }
                />
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/floating-notification-bar',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'floating-notification-bar' !== moduleId ) {
            return parts;
        }

        return floatingBarPage as SettingsPageParts;
    }
);
