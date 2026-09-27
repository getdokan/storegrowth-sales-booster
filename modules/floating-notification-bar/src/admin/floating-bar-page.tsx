/**
 * Floating Bar settings page (design `floating-bar.html`): Content,
 * Configure and Design tabs beside a preview with the bar above (or below)
 * the product.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import {
    Accordion,
    BarDeviceField,
    type BarFieldsProps,
    BarIconPicker,
    BarPlacementFields,
    BarTriggerFields,
    BarTypographyFields,
    barShowsOn,
    CardHead,
    CheckboxField,
    ColorField,
    extensionKeys,
    FeatureLayout,
    FieldRenderer,
    FieldLabel,
    LivePreview,
    OptionCard,
    SaveBar,
    SelectField,
    SettingsSplit,
    SettingsTabs,
    SwitchField,
    TargetingFields,
    TemplatePicker,
    TextField,
    TextareaField,
} from '@storegrowth/components';
import { useModuleSettings } from '@storegrowth/hooks';
import { errorMessage, getHeaderData } from '@storegrowth/utilities';

import { BAR_ICONS, FloatingBar } from './preview/floating-bar';
import { type FloatingBarKey, type FloatingBarValues, TAB_KEYS } from './types';

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

export default function FloatingBarPage() {
    const settings = useModuleSettings< FloatingBarValues >(
        'floating-notification-bar'
    );
    const { values, setValue, setValues, isLocked, errors } = settings;
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );

    /**
     * Props shared by every field bound to a setting.
     *
     * @param key Setting key.
     */
    const bind = ( key: FloatingBarKey ) => ( {
        locked: isLocked( key ),
        error: errors[ key ],
    } );

    const barProps: BarFieldsProps = {
        values,
        setValue: ( key, value ) =>
            setValue( key, value as FloatingBarValues[ typeof key ] ),
        isLocked,
        errors,
    };

    const save = async ( keys: FloatingBarKey[] ) => {
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
        ] as FloatingBarKey[];

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

    const color = ( key: FloatingBarKey, label: string ) => (
        <ColorField
            label={ label }
            value={ values[ key ] as string }
            onChange={ ( next ) => setValue( key, next ) }
            { ...bind( key ) }
        />
    );

    const buttonViews = values.button_view ?? [];
    const buttonView = ( view: string, label: string ) => (
        <div>
            <CheckboxField
                label={ label }
                checked={ buttonViews.includes( view ) }
                onChange={ ( on ) =>
                    setValue(
                        'button_view',
                        on
                            ? [
                                  ...buttonViews.filter(
                                      ( item ) => item !== view
                                  ),
                                  view,
                              ]
                            : buttonViews.filter( ( item ) => item !== view )
                    )
                }
                locked={ isLocked( 'button_view' ) }
            />
        </div>
    );

    const content = (
        <>
            <TextareaField
                label={ __(
                    'Default Banner Text',
                    'storegrowth-sales-booster'
                ) }
                value={ values.default_banner_text }
                rows={ 3 }
                onChange={ ( next ) => setValue( 'default_banner_text', next ) }
                { ...bind( 'default_banner_text' ) }
            />
            <BarIconPicker
                label={ __( 'Banner Icon', 'storegrowth-sales-booster' ) }
                icons={ BAR_ICONS }
                value={ values.default_banner_icon_name }
                onChange={ ( next ) =>
                    setValue( 'default_banner_icon_name', next )
                }
                custom={ values.default_banner_custom_icon }
                onCustomChange={ ( next ) =>
                    setValue( 'default_banner_custom_icon', next )
                }
                locked={ isLocked( 'default_banner_icon_name' ) }
                error={ errors.default_banner_custom_icon }
            />
            { saveBar( 'content' ) }
        </>
    );

    const configure = (
        <>
            <BarPlacementFields { ...barProps } />
            <OptionCard
                title={ __( 'Button', 'storegrowth-sales-booster' ) }
                help={ __(
                    'A button beside the text',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.button_enable }
                onChange={ ( checked ) => setValue( 'button_enable', checked ) }
                locked={ isLocked( 'button_enable' ) }
            >
                <SelectField
                    label={ __( 'Button Action', 'storegrowth-sales-booster' ) }
                    value={ values.button_action }
                    options={ [
                        {
                            value: 'ba-close',
                            label: __(
                                'Banner Close',
                                'storegrowth-sales-booster'
                            ),
                        },
                        {
                            value: 'ba-url-redirect',
                            label: __(
                                'Open Link',
                                'storegrowth-sales-booster'
                            ),
                        },
                    ] }
                    onChange={ ( next ) =>
                        setValue(
                            'button_action',
                            next as FloatingBarValues[ 'button_action' ]
                        )
                    }
                    { ...bind( 'button_action' ) }
                />
                <div className="flex w-full flex-col items-start gap-3">
                    <FieldLabel locked={ isLocked( 'button_view' ) }>
                        { __( 'Show Button', 'storegrowth-sales-booster' ) }
                    </FieldLabel>
                    <div className="flex w-full gap-6">
                        { buttonView(
                            'button-desktop-enable',
                            __( 'Desktop', 'storegrowth-sales-booster' )
                        ) }
                        { buttonView(
                            'button-mobile-enable',
                            __( 'Mobile', 'storegrowth-sales-booster' )
                        ) }
                    </div>
                </div>
                <TextField
                    label={ __( 'Button Text', 'storegrowth-sales-booster' ) }
                    value={ values.ac_button_text }
                    onChange={ ( next ) => setValue( 'ac_button_text', next ) }
                    { ...bind( 'ac_button_text' ) }
                />
                { values.button_action === 'ba-url-redirect' && (
                    <>
                        <TextField
                            label={ __(
                                'Button Link',
                                'storegrowth-sales-booster'
                            ) }
                            type="url"
                            value={ values.redirect_url }
                            onChange={ ( next ) =>
                                setValue( 'redirect_url', next )
                            }
                            placeholder="https://"
                            { ...bind( 'redirect_url' ) }
                        />
                        <SwitchField
                            label={ __(
                                'Open in a New Tab',
                                'storegrowth-sales-booster'
                            ) }
                            checked={ values.new_tab_enable }
                            onChange={ ( checked ) =>
                                setValue( 'new_tab_enable', checked )
                            }
                            { ...bind( 'new_tab_enable' ) }
                        />
                    </>
                ) }
            </OptionCard>
            <OptionCard
                title={ __( 'Countdown', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Time left until the end date',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.countdown_show_enable }
                onChange={ ( checked ) =>
                    setValue( 'countdown_show_enable', checked )
                }
                locked={ isLocked( 'countdown_show_enable' ) }
            >
                <div className="flex w-full flex-wrap items-start gap-3 *:min-w-[180px] *:flex-1">
                    <TextField
                        label={ __(
                            'Start Date',
                            'storegrowth-sales-booster'
                        ) }
                        type="date"
                        value={ values.countdown_start_date }
                        onChange={ ( next ) =>
                            setValue( 'countdown_start_date', next )
                        }
                        { ...bind( 'countdown_start_date' ) }
                    />
                    <TextField
                        label={ __( 'End Date', 'storegrowth-sales-booster' ) }
                        type="date"
                        value={ values.countdown_end_date }
                        onChange={ ( next ) =>
                            setValue( 'countdown_end_date', next )
                        }
                        { ...bind( 'countdown_end_date' ) }
                    />
                </div>
            </OptionCard>
            <OptionCard
                title={ __( 'Coupon', 'storegrowth-sales-booster' ) }
                help={ __(
                    'A coupon code shoppers can copy',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.show_cupon }
                onChange={ ( checked ) => setValue( 'show_cupon', checked ) }
                locked={ isLocked( 'show_cupon' ) }
            >
                <SelectField
                    label={ __( 'Coupon Code', 'storegrowth-sales-booster' ) }
                    value={ values.cupon_code }
                    options={ COUPONS }
                    onChange={ ( next ) => setValue( 'cupon_code', next ) }
                    { ...bind( 'cupon_code' ) }
                />
            </OptionCard>
            <Accordion
                title={ __( 'Trigger', 'storegrowth-sales-booster' ) }
                help={ __(
                    'When the bar appears',
                    'storegrowth-sales-booster'
                ) }
            >
                <BarTriggerFields { ...barProps } />
            </Accordion>
            <Accordion
                title={ __( 'Page Targeting', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Where the bar shows, and to whom',
                    'storegrowth-sales-booster'
                ) }
            >
                <BarDeviceField
                    { ...barProps }
                    label={ __( 'Show Bar', 'storegrowth-sales-booster' ) }
                />
                <TargetingFields { ...barProps } />
            </Accordion>
            { saveBar( 'configure' ) }
        </>
    );

    const design = (
        <>
            <Accordion
                title={ __( 'Bar', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Size and typography of the floating bar',
                    'storegrowth-sales-booster'
                ) }
            >
                <BarTypographyFields { ...barProps } />
            </Accordion>
            <Accordion
                title={ __( 'Colors', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Every colour on the floating bar',
                    'storegrowth-sales-booster'
                ) }
            >
                { color(
                    'background_color',
                    __( 'Background Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'text_color',
                    __( 'Text Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'icon_color',
                    __( 'Icon Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'button_color',
                    __( 'Button Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'button_text_color',
                    __( 'Button Text Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'close_icon_color',
                    __( 'Close Icon Color', 'storegrowth-sales-booster' )
                ) }
            </Accordion>
            <Accordion
                title={ __( 'Template', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Presets that fill the colour fields above',
                    'storegrowth-sales-booster'
                ) }
            >
                <TemplatePicker
                    templates={ TEMPLATES.map( ( template ) => ( {
                        id: template.id,
                        label: template.label,
                        preview: (
                            <FloatingBar
                                values={ {
                                    ...values,
                                    ...template.colors,
                                    banner_height: 44,
                                    font_size: 13,
                                } }
                                isPro={ false }
                                showButton
                            />
                        ),
                    } ) ) }
                    value={ values.notify_template }
                    onSelect={ ( id ) => {
                        const template = TEMPLATES.find(
                            ( item ) => item.id === id
                        );
                        if ( template ) {
                            setValues( {
                                notify_template: template.id,
                                ...template.colors,
                            } );
                        }
                    } }
                    locked={ isLocked( 'notify_template' ) }
                />
            </Accordion>
            { saveBar( 'design' ) }
        </>
    );

    return (
        <FeatureLayout moduleId="floating-notification-bar">
            <CardHead
                title={ __( 'Floating Bar', 'storegrowth-sales-booster' ) }
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
                            banner={ ( { device } ) =>
                                barShowsOn(
                                    values.banner_device_view,
                                    device
                                ) && (
                                    <FloatingBar
                                        values={ values }
                                        isPro={ isPro }
                                        showButton={ buttonViews.includes(
                                            device === 'mobile'
                                                ? 'button-mobile-enable'
                                                : 'button-desktop-enable'
                                        ) }
                                    />
                                )
                            }
                            bannerPosition={ values.bar_position }
                            footer={
                                ! settings.published && (
                                    <p className="text-center text-xs text-sg-help">
                                        { __(
                                            'The bar shows on your store once you save these settings.',
                                            'storegrowth-sales-booster'
                                        ) }
                                    </p>
                                )
                            }
                        />
                    }
                >
                    <SettingsTabs
                        label={ __(
                            'Floating Bar settings',
                            'storegrowth-sales-booster'
                        ) }
                        tabs={ [
                            {
                                id: 'content',
                                label: __(
                                    'Content',
                                    'storegrowth-sales-booster'
                                ),
                                content,
                            },
                            {
                                id: 'configure',
                                label: __(
                                    'Configure',
                                    'storegrowth-sales-booster'
                                ),
                                content: configure,
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
