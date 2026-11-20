/**
 * Cart Rewards admin bundle
 * (`modules/progressive-discount-banner/assets/js/admin.js`), loaded on the
 * StoreGrowth admin page before the app mounts. The app draws the settings
 * page from the schema (PHP `ProgressiveDiscountBannerSettings`: page, tabs,
 * sections, fields) at `#/settings?module=progressive-discount-banner`; this
 * adds the live preview and the controls that set more than one key: the
 * milestones, the icon picker and the template picker.
 *
 * @since 3.0.0
 */
import { addFilter } from '@wordpress/hooks';
import { useId, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    barShowsOn,
    IconPicker,
    LivePreview,
    type SettingsPageParts,
    TemplatePicker,
    ToggleSwitch,
} from '@storegrowth/components';
import type { ModuleSettings } from '@storegrowth/hooks';
import { getHeaderData } from '@storegrowth/utilities';

import { MilestonesField, type MilestonesData } from './milestones-field';
import { FreeShippingBar, ICON_CHOICES } from './preview/free-shipping-bar';
import type { FreeShippingValues } from './types';

/** The store's price format and the milestones' data (`AdminPage::data()`). */
const store = (
    window as unknown as {
        spsgFreeShippingData: MilestonesData & {
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
 * The banner text on an empty cart: the first milestone is the next one, and
 * all of it is left to spend. Its reward is named as the storefront names it
 * only for free shipping; a product or coupon needs the shop's data.
 *
 * @param values Current settings.
 */
function waitingText( values: FreeShippingValues ) {
    const first = values.milestones[ 0 ];
    const remaining = price( first?.threshold ?? 0 );

    return ( values.progressive_banner_text ?? '' )
        .replace( /\[amount\]|\{remaining\}/g, remaining )
        .replace(
            /\{reward\}/g,
            first?.reward === 'free-shipping'
                ? __( 'free shipping', 'storegrowth-sales-booster' )
                : __( 'your reward', 'storegrowth-sales-booster' )
        );
}

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

        return {
            milestones: (
                <MilestonesField
                    value={ values.milestones }
                    onChange={ ( next ) => {
                        setValue( 'milestones', next );
                    } }
                    data={ store }
                    isPro={ isPro }
                    error={ errors.milestones }
                />
            ),

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
