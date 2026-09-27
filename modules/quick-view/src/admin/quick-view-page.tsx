/**
 * Quick View settings page (design `quick-view.html`): General Setting and
 * Design tabs beside a preview with the modal over the frame and a shop card
 * with the Quick View button below it.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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
    NumberField,
    SaveBar,
    SelectField,
    type SelectOption,
    SettingsSplit,
    SettingsTabs,
    SwitchField,
    TextField,
} from '@storegrowth/components';
import { useModuleSettings, useModules } from '@storegrowth/hooks';
import { errorMessage, getHeaderData } from '@storegrowth/utilities';

import {
    QUICK_VIEW_ICONS,
    QuickViewModal,
    ShopCard,
} from './preview/quick-view-preview';
import {
    CONTENT_KEYS,
    type QuickViewKey,
    type QuickViewValues,
    TAB_KEYS,
} from './types';

/** An option that needs pro. */
type Choice = SelectOption & { pro?: boolean };

/** Design labels over the stored values (spec §5: additive, no migration). */
const EFFECTS: SelectOption[] = [
    { value: 'mfp-fade', label: __( 'Fade', 'storegrowth-sales-booster' ) },
    {
        value: 'mfp-move-from-top',
        label: __( 'Slide', 'storegrowth-sales-booster' ),
    },
    { value: 'mfp-zoom-out', label: __( 'Zoom', 'storegrowth-sales-booster' ) },
    { value: 'mfp-none', label: __( 'None', 'storegrowth-sales-booster' ) },
];

const REDIRECTS: Choice[] = [
    {
        value: 'shop-page-redirection',
        label: __( 'Shop Page Redirect', 'storegrowth-sales-booster' ),
    },
    {
        value: 'legacy-cart-redirection',
        label: __( 'Cart Page Redirect', 'storegrowth-sales-booster' ),
    },
    {
        value: 'checkout-redirection',
        label: __( 'Checkout Redirect', 'storegrowth-sales-booster' ),
    },
    {
        value: 'add-to-cart-ajax',
        label: __( 'Stay On Page', 'storegrowth-sales-booster' ),
        pro: true,
    },
];

const POSITIONS: Choice[] = [
    {
        value: 'after_add_to_cart',
        label: __( 'After Add to Cart', 'storegrowth-sales-booster' ),
    },
    {
        value: 'before_add_to_cart',
        label: __( 'Before Add to Cart', 'storegrowth-sales-booster' ),
    },
    {
        value: 'center_on_the_image',
        label: __( 'Center On The Image', 'storegrowth-sales-booster' ),
        pro: true,
    },
    {
        value: 'top_right_of_the_image',
        label: __( 'Top Right Of The Image', 'storegrowth-sales-booster' ),
        pro: true,
    },
];

const CONTENT_LABELS: Record< ( typeof CONTENT_KEYS )[ number ], string > = {
    show_title: __( 'Show Title', 'storegrowth-sales-booster' ),
    show_description: __( 'Show Description', 'storegrowth-sales-booster' ),
    show_price: __( 'Show Price', 'storegrowth-sales-booster' ),
    show_image: __( 'Show Product Image', 'storegrowth-sales-booster' ),
    show_excerpt: __( 'Show Excerpt', 'storegrowth-sales-booster' ),
    show_meta: __( 'Show Product Meta', 'storegrowth-sales-booster' ),
    show_add_to_cart: __( 'Show Add to Cart', 'storegrowth-sales-booster' ),
};

export default function QuickViewPage() {
    const settings = useModuleSettings< QuickViewValues >( 'quick-view' );
    const { values, setValue, isLocked, errors } = settings;
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );
    const flyCartOn = Boolean( useModules().getModule( 'fly-cart' )?.status );
    const [ modalOpen, setModalOpen ] = useState( true );

    /**
     * Props shared by every field bound to a setting.
     *
     * @param key Setting key.
     */
    const bind = ( key: QuickViewKey ) => ( {
        locked: isLocked( key ),
        error: errors[ key ],
    } );

    /**
     * The options on offer: pro values only with pro, except one that is
     * already stored (so it still shows).
     *
     * @param choices Options.
     * @param current Stored value.
     */
    const offered = ( choices: Choice[], current: string ) =>
        choices
            .filter(
                ( choice ) => isPro || ! choice.pro || choice.value === current
            )
            .map( ( { value, label } ) => ( { value, label } ) );

    const save = async ( keys: QuickViewKey[] ) => {
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
        ] as QuickViewKey[];

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

    const toggle = ( key: QuickViewKey, label: string ) => (
        <SwitchField
            label={ label }
            checked={ values[ key ] as boolean }
            onChange={ ( checked ) => setValue( key, checked ) }
            { ...bind( key ) }
        />
    );

    const color = ( key: QuickViewKey, label: string ) => (
        <ColorField
            label={ label }
            value={ values[ key ] as string }
            onChange={ ( next ) => setValue( key, next ) }
            { ...bind( key ) }
        />
    );

    const general = (
        <>
            { toggle(
                'enable_in_mobile',
                __( 'Enable In Mobile', 'storegrowth-sales-booster' )
            ) }
            { toggle(
                'enable_zoom_box',
                __( 'Enable Zoom Box', 'storegrowth-sales-booster' )
            ) }
            <SelectField
                label={ __( 'Modal Effects', 'storegrowth-sales-booster' ) }
                value={ values.modal_animation_effect }
                options={ EFFECTS }
                onChange={ ( next ) =>
                    setValue(
                        'modal_animation_effect',
                        next as QuickViewValues[ 'modal_animation_effect' ]
                    )
                }
                { ...bind( 'modal_animation_effect' ) }
            />
            <SelectField
                label={ __(
                    'Add To Cart Redirection',
                    'storegrowth-sales-booster'
                ) }
                value={ values.cart_url_redirection }
                options={ offered( REDIRECTS, values.cart_url_redirection ) }
                onChange={ ( next ) =>
                    setValue(
                        'cart_url_redirection',
                        next as QuickViewValues[ 'cart_url_redirection' ]
                    )
                }
                { ...bind( 'cart_url_redirection' ) }
            />
            { values.cart_url_redirection === 'add-to-cart-ajax' &&
                flyCartOn &&
                toggle(
                    'auto_open_fly_cart',
                    __( 'Auto Open Fly Cart', 'storegrowth-sales-booster' )
                ) }

            <Accordion
                title={ __( 'Button Settings', 'storegrowth-sales-booster' ) }
                help={ __(
                    "The Quick View button and the modal's own controls",
                    'storegrowth-sales-booster'
                ) }
            >
                <TextField
                    label={ __(
                        'Quick View Button label',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.button_label }
                    maxLength={ 15 }
                    onChange={ ( next ) => setValue( 'button_label', next ) }
                    { ...bind( 'button_label' ) }
                />
                <SelectField
                    label={ __(
                        'Button Position',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.button_position }
                    options={ offered( POSITIONS, values.button_position ) }
                    onChange={ ( next ) =>
                        setValue(
                            'button_position',
                            next as QuickViewValues[ 'button_position' ]
                        )
                    }
                    { ...bind( 'button_position' ) }
                />
                { toggle(
                    'enable_qucik_view_icon',
                    __( 'Enable Quick View Icon', 'storegrowth-sales-booster' )
                ) }
                { values.enable_qucik_view_icon && (
                    <IconPicker
                        label={ __(
                            'Button Icon',
                            'storegrowth-sales-booster'
                        ) }
                        icons={ QUICK_VIEW_ICONS }
                        value={ values.quick_view_icon }
                        onChange={ ( next ) =>
                            setValue( 'quick_view_icon', next )
                        }
                        clearable={ false }
                        locked={ isLocked( 'quick_view_icon' ) }
                    />
                ) }
                { toggle(
                    'enable_close_button',
                    __( 'Enable Close Button', 'storegrowth-sales-booster' )
                ) }
                { toggle(
                    'show_view_details_button',
                    __(
                        'Enable View Details Button',
                        'storegrowth-sales-booster'
                    )
                ) }
            </Accordion>

            <Accordion
                title={ __(
                    'Quick View Contents',
                    'storegrowth-sales-booster'
                ) }
                help={ __(
                    'What the modal shows',
                    'storegrowth-sales-booster'
                ) }
            >
                <CheckboxGroup>
                    { CONTENT_KEYS.map( ( key ) => (
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
            <NumberField
                label={ __(
                    'Button Border Radius',
                    'storegrowth-sales-booster'
                ) }
                suffix="px"
                min={ 0 }
                value={ values.button_border_radius }
                onChange={ ( next ) =>
                    setValue( 'button_border_radius', next )
                }
                { ...bind( 'button_border_radius' ) }
            />
            { color(
                'button_color',
                __( 'Button Color', 'storegrowth-sales-booster' )
            ) }
            { color(
                'button_text_color',
                __( 'Button Text Color', 'storegrowth-sales-booster' )
            ) }
            { color(
                'modal_background_color',
                __( 'Modal Background Color', 'storegrowth-sales-booster' )
            ) }
            { color(
                'navigation_background',
                __( 'Navigation Background Color', 'storegrowth-sales-booster' )
            ) }
            { saveBar( 'design' ) }
        </>
    );

    return (
        <FeatureLayout moduleId="quick-view">
            <CardHead
                title={ __( 'Quick View', 'storegrowth-sales-booster' ) }
            />
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
                            // Phones: nothing when it's off there.
                            overlay={ ( { device } ) =>
                                modalOpen &&
                                ( device !== 'mobile' ||
                                    values.enable_in_mobile ) && (
                                    <QuickViewModal
                                        values={ values }
                                        isPro={ isPro }
                                        onClose={ () => setModalOpen( false ) }
                                    />
                                )
                            }
                            footer={ ( { device } ) => (
                                <div className="flex w-full flex-col items-center gap-2">
                                    <ShopCard
                                        values={ values }
                                        isPro={ isPro }
                                        onClick={ () => setModalOpen( true ) }
                                        hideButton={
                                            device === 'mobile' &&
                                            ! values.enable_in_mobile
                                        }
                                    />
                                    <p className="text-center text-xs text-sg-help">
                                        { __(
                                            'The button on a shop card; click it to open the modal.',
                                            'storegrowth-sales-booster'
                                        ) }
                                    </p>
                                </div>
                            ) }
                        />
                    }
                >
                    <SettingsTabs
                        label={ __(
                            'Quick View settings',
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
