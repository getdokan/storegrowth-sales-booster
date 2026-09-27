/**
 * Fly Cart settings page (design `fly-cart.html`): General Setting (layout,
 * cart contents) and Design (icon position, icon, colours) tabs beside a
 * preview of the cart panel and its floating button.
 *
 * @since SPSG_VERSION
 */
import { cn, toast } from '@wedevs/plugin-ui';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import {
    Accordion,
    CardHead,
    CheckboxField,
    CheckboxGroup,
    ColorField,
    extensionKeys,
    FeatureLayout,
    FieldRenderer,
    IconPicker,
    LivePreview,
    type PickerCardOption,
    PickerCards,
    SaveBar,
    SettingsSplit,
    SettingsTabs,
} from '@storegrowth/components';
import { useModuleSettings } from '@storegrowth/hooks';
import { errorMessage, getHeaderData } from '@storegrowth/utilities';

import { CART_ICONS, FlyCartPreview } from './preview/fly-cart-preview';
import {
    CONTENT_KEYS,
    type FlyCartKey,
    type FlyCartValues,
    TAB_KEYS,
} from './types';

const CONTENT_LABELS: Record< ( typeof CONTENT_KEYS )[ number ], string > = {
    show_product_image: __( 'Show Product Image', 'storegrowth-sales-booster' ),
    show_remove_icon: __( 'Show Remove Icon', 'storegrowth-sales-booster' ),
    show_quantity_picker: __(
        'Show Quantity Picker',
        'storegrowth-sales-booster'
    ),
    show_product_price: __( 'Show product price', 'storegrowth-sales-booster' ),
    show_stock_status: __( 'Show Stock Status', 'storegrowth-sales-booster' ),
    fly_cart_badge_icon: __( 'Show BOGO Badge', 'storegrowth-sales-booster' ),
    show_free_shipping_message: __(
        'Show Free Shipping Message',
        'storegrowth-sales-booster'
    ),
    show_coupon: __( 'Show coupon', 'storegrowth-sales-booster' ),
    enable_add_to_cart_redirect: __(
        'Cart panel auto-opens',
        'storegrowth-sales-booster'
    ),
};

/**
 * Miniature of a storefront page (design `.pick-art`): four product tiles
 * and, on top, where the cart lands (`mark`).
 *
 * @param props      Props.
 * @param props.mark Classes placing the blue mark.
 */
function PickArt( { mark }: { mark: string } ) {
    const tile = 'rounded-[1px] bg-[#C9D8EE]';

    return (
        <span
            className="relative block h-[72px] rounded-md bg-[#EFF4FF]"
            aria-hidden
        >
            <span className="absolute inset-2.5 grid grid-cols-2 grid-rows-2 gap-x-[8%] gap-y-[12%]">
                <span className={ tile } />
                <span className={ tile } />
                <span className={ tile } />
                <span className={ tile } />
            </span>
            <span className={ cn( 'absolute bg-sg-brand', mark ) } />
        </span>
    );
}

const DOT = 'size-3.5 rounded-full';

export default function FlyCartPage() {
    const settings = useModuleSettings< FlyCartValues >( 'fly-cart' );
    const { values, setValue, isLocked } = settings;
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );
    const [ cartOpen, setCartOpen ] = useState( true );

    /**
     * A pro choice is locked without pro, unless it's the current value
     * (a stored pro choice still shows as chosen).
     *
     * @param value   Choice.
     * @param current Stored value.
     */
    const proLocked = ( value: string, current: string ) =>
        ! isPro && value !== current;

    const layouts: PickerCardOption[] = [
        {
            value: 'side',
            label: __( 'Side Cart', 'storegrowth-sales-booster' ),
            art: (
                <PickArt mark="bottom-2.5 right-2.5 top-2.5 w-[34%] rounded opacity-85" />
            ),
        },
        {
            value: 'center',
            label: __( 'Centered Popup', 'storegrowth-sales-booster' ),
            art: (
                <PickArt mark="left-1/2 top-1/2 h-[46%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded opacity-85" />
            ),
            locked: proLocked( 'center', values.layout ),
        },
    ];

    const positions: PickerCardOption[] = [
        {
            value: 'bottom-right',
            label: __( 'Bottom Right', 'storegrowth-sales-booster' ),
            art: <PickArt mark={ `${ DOT } bottom-1.5 right-1.5` } />,
        },
        {
            value: 'top-right',
            label: __( 'Top Right', 'storegrowth-sales-booster' ),
            art: <PickArt mark={ `${ DOT } right-1.5 top-1.5` } />,
        },
        {
            value: 'center-right',
            label: __( 'Centre Right', 'storegrowth-sales-booster' ),
            art: <PickArt mark={ `${ DOT } right-1.5 top-1/2 -mt-[7px]` } />,
            locked: proLocked( 'center-right', values.icon_position ),
        },
        {
            value: 'top-left',
            label: __( 'Top Left', 'storegrowth-sales-booster' ),
            art: <PickArt mark={ `${ DOT } left-1.5 top-1.5` } />,
        },
        {
            value: 'bottom-left',
            label: __( 'Bottom Left', 'storegrowth-sales-booster' ),
            art: <PickArt mark={ `${ DOT } bottom-1.5 left-1.5` } />,
        },
        {
            value: 'center-left',
            label: __( 'Centre Left', 'storegrowth-sales-booster' ),
            art: <PickArt mark={ `${ DOT } left-1.5 top-1/2 -mt-[7px]` } />,
            locked: proLocked( 'center-left', values.icon_position ),
        },
    ];

    // The storefront prints the price inside the quantity picker, so the
    // price option only applies while the picker shows (as before).
    const contentKeys = CONTENT_KEYS.filter(
        ( key ) => key !== 'show_product_price' || values.show_quantity_picker
    );

    const save = async ( keys: FlyCartKey[] ) => {
        try {
            await settings.save( keys );
            toast.success(
                __( 'Settings saved.', 'storegrowth-sales-booster' )
            );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The settings could not be saved.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    // The tab's Save bar, after the fields extensions add to the tab.
    const saveBar = ( tab: keyof typeof TAB_KEYS ) => {
        const keys = [
            ...TAB_KEYS[ tab ],
            ...extensionKeys( settings.schema, tab ),
        ] as FlyCartKey[];

        return (
            <>
                <FieldRenderer tab={ tab } settings={ settings } />
                <SaveBar
                    saving={ settings.saving }
                    disabled={ ! settings.isDirty( keys ) }
                    onReset={ () => settings.reset( keys ) }
                    onSave={ () => save( keys ) }
                />
            </>
        );
    };

    const color = ( key: FlyCartKey, label: string ) => (
        <ColorField
            label={ label }
            value={ values[ key ] as string }
            onChange={ ( next ) => setValue( key, next ) }
            locked={ isLocked( key ) }
            error={ settings.errors[ key ] }
        />
    );

    const general = (
        <>
            <Accordion
                title={ __( 'Layout', 'storegrowth-sales-booster' ) }
                help={ __(
                    'How the cart opens on the storefront',
                    'storegrowth-sales-booster'
                ) }
            >
                <PickerCards
                    label={ __( 'Layout', 'storegrowth-sales-booster' ) }
                    options={ layouts }
                    value={ values.layout }
                    onChange={ ( next ) =>
                        setValue( 'layout', next as FlyCartValues[ 'layout' ] )
                    }
                    locked={ isLocked( 'layout' ) }
                />
            </Accordion>
            <Accordion
                title={ __( 'Cart Contents', 'storegrowth-sales-booster' ) }
                help={ __(
                    'What each line in the cart shows',
                    'storegrowth-sales-booster'
                ) }
            >
                <CheckboxGroup>
                    { contentKeys.map( ( key ) => (
                        <CheckboxField
                            key={ key }
                            label={ CONTENT_LABELS[ key ] }
                            checked={ values[ key ] }
                            onChange={ ( checked ) => setValue( key, checked ) }
                            locked={ isLocked( key ) }
                        />
                    ) ) }
                </CheckboxGroup>
            </Accordion>
            { saveBar( 'general' ) }
        </>
    );

    const design = (
        <>
            <Accordion
                title={ __(
                    'Cart Icon Position',
                    'storegrowth-sales-booster'
                ) }
                help={ __(
                    'Where the floating cart button sits',
                    'storegrowth-sales-booster'
                ) }
            >
                <PickerCards
                    label={ __(
                        'Cart Icon Position',
                        'storegrowth-sales-booster'
                    ) }
                    options={ positions }
                    columns={ 3 }
                    value={ values.icon_position }
                    onChange={ ( next ) =>
                        setValue(
                            'icon_position',
                            next as FlyCartValues[ 'icon_position' ]
                        )
                    }
                    locked={ isLocked( 'icon_position' ) }
                />
            </Accordion>
            <Accordion
                title={ __( 'Cart Icon', 'storegrowth-sales-booster' ) }
                help={ __(
                    'The glyph on the floating button',
                    'storegrowth-sales-booster'
                ) }
            >
                <IconPicker
                    label={ __( 'Cart Icon', 'storegrowth-sales-booster' ) }
                    icons={ CART_ICONS }
                    value={ values.icon_name }
                    onChange={ ( next ) => setValue( 'icon_name', next ) }
                    clearable={ false }
                    hideLabel
                    locked={ isLocked( 'icon_name' ) }
                />
            </Accordion>
            <Accordion
                title={ __( 'Colors', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Every colour on the cart',
                    'storegrowth-sales-booster'
                ) }
            >
                { color(
                    'buttons_bg_color',
                    __(
                        'Action Buttons Background',
                        'storegrowth-sales-booster'
                    )
                ) }
                { color(
                    'shopping_button_bg_color',
                    __(
                        'Shopping Button Background',
                        'storegrowth-sales-booster'
                    )
                ) }
                { color(
                    'icon_color',
                    __( 'Cart Icon Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'widget_bg_color',
                    __( 'Widget Background Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'product_card_bg_color',
                    __(
                        'Product Card Background Color',
                        'storegrowth-sales-booster'
                    )
                ) }
            </Accordion>
            { saveBar( 'design' ) }
        </>
    );

    return (
        <FeatureLayout moduleId="fly-cart">
            <CardHead title={ __( 'Fly Cart', 'storegrowth-sales-booster' ) } />
            { ( settings.loading || settings.loadError ) && (
                <div
                    role={ settings.loadError ? 'alert' : undefined }
                    className={ `w-full rounded-lg border border-sg-cardline bg-white p-6 text-sm ${
                        settings.loadError
                            ? 'text-destructive'
                            : 'text-sg-muted'
                    }` }
                >
                    { settings.loadError ||
                        __( 'Loading…', 'storegrowth-sales-booster' ) }
                </div>
            ) }
            { ! settings.loading && ! settings.loadError && (
                <SettingsSplit
                    preview={
                        <LivePreview
                            minHeight={ 500 }
                            overlay={ ( { device } ) =>
                                /**
                                 * Filters the Fly Cart preview, e.g. for pro
                                 * or an integration to add its parts.
                                 *
                                 * @since SPSG_VERSION
                                 *
                                 * @param {JSX.Element}   preview The preview.
                                 * @param {FlyCartValues} values  Current (unsaved) settings.
                                 */
                                applyFilters(
                                    'storegrowth.preview.fly-cart',
                                    <FlyCartPreview
                                        values={ values }
                                        isPro={ isPro }
                                        device={ device }
                                        open={ cartOpen }
                                        onOpenChange={ setCartOpen }
                                    />,
                                    values
                                ) as ReactNode
                            }
                        />
                    }
                >
                    <SettingsTabs
                        label={ __(
                            'Fly Cart settings',
                            'storegrowth-sales-booster'
                        ) }
                        tabs={ [
                            {
                                id: 'general',
                                label: __(
                                    'General Setting',
                                    'storegrowth-sales-booster'
                                ),
                                content: general,
                            },
                            {
                                id: 'design',
                                label: __(
                                    'Design',
                                    'storegrowth-sales-booster'
                                ),
                                content: design,
                            },
                        ] }
                    />
                </SettingsSplit>
            ) }
        </FeatureLayout>
    );
}
