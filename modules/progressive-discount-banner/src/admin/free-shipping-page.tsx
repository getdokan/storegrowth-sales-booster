/**
 * Free Shipping Rules settings page (design `free-shipping-rules.html`):
 * Content, Configure and Design tabs beside a preview with the bar above
 * (or below) the product.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { useState } from '@wordpress/element';
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
    ColorField,
    extensionKeys,
    FeatureLayout,
    FieldRenderer,
    LivePreview,
    NumberField,
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

import { BAR_ICONS, FreeShippingBar } from './preview/free-shipping-bar';
import {
    type FreeShippingKey,
    type FreeShippingValues,
    TAB_KEYS,
} from './types';

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

/** The one template: the default colours. */
const TEMPLATE = {
    background_color: '#0875FF',
    text_color: '#ffffff',
    icon_color: '#ffffff',
    close_icon_color: '#ffffff',
    btn_color: '#ffffff',
    btn_text_color: '#073b4c',
};

export default function FreeShippingPage() {
    const settings = useModuleSettings< FreeShippingValues >(
        'progressive-discount-banner'
    );
    const { values, setValue, setValues, isLocked, errors } = settings;
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );
    const [ goalReached, setGoalReached ] = useState( false );

    /**
     * Props shared by every field bound to a setting.
     *
     * @param key Setting key.
     */
    const bind = ( key: FreeShippingKey ) => ( {
        locked: isLocked( key ),
        error: errors[ key ],
    } );

    const barProps: BarFieldsProps = {
        values,
        setValue: ( key, value ) =>
            setValue( key, value as FreeShippingValues[ typeof key ] ),
        isLocked,
        errors,
    };

    const save = async ( keys: FreeShippingKey[] ) => {
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
        ] as FreeShippingKey[];

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

    const color = ( key: FreeShippingKey, label: string ) => (
        <ColorField
            label={ label }
            value={ values[ key ] as string }
            onChange={ ( next ) => setValue( key, next ) }
            { ...bind( key ) }
        />
    );

    // An empty cart: the whole minimum is left to spend.
    const waitingText = ( values.progressive_banner_text ?? '' ).replace(
        /\[amount\]/g,
        // Undefined until the settings load.
        price( values.cart_minimum_amount ?? 0 )
    );

    const discountType =
        values.discount_type === 'free-shipping'
            ? 'free-shipping'
            : values.discount_amount_mode;

    const content = (
        <>
            <TextareaField
                label={ __( 'Banner Text', 'storegrowth-sales-booster' ) }
                value={ values.progressive_banner_text }
                rows={ 3 }
                onChange={ ( next ) =>
                    setValue( 'progressive_banner_text', next )
                }
                help={ __(
                    '[amount] is replaced with what is left to spend.',
                    'storegrowth-sales-booster'
                ) }
                { ...bind( 'progressive_banner_text' ) }
            />
            <TextareaField
                label={ __(
                    'Goal Completion Text',
                    'storegrowth-sales-booster'
                ) }
                value={ values.goal_completion_text }
                rows={ 3 }
                onChange={ ( next ) =>
                    setValue( 'goal_completion_text', next )
                }
                { ...bind( 'goal_completion_text' ) }
            />
            <BarIconPicker
                label={ __( 'Banner Icon', 'storegrowth-sales-booster' ) }
                icons={ BAR_ICONS }
                value={ values.progressive_banner_icon_name }
                onChange={ ( next ) =>
                    setValue( 'progressive_banner_icon_name', next )
                }
                custom={ values.progressive_banner_custom_icon }
                onCustomChange={ ( next ) =>
                    setValue( 'progressive_banner_custom_icon', next )
                }
                locked={ isLocked( 'progressive_banner_icon_name' ) }
                error={ errors.progressive_banner_custom_icon }
            />
            <OptionCard
                title={ __(
                    'Display CTA Button',
                    'storegrowth-sales-booster'
                ) }
                help={ __(
                    'A button on the bar, e.g. to the cart',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.btn_style }
                onChange={ ( checked ) => setValue( 'btn_style', checked ) }
                locked={ isLocked( 'btn_style' ) }
            >
                <TextField
                    label={ __( 'CTA Name', 'storegrowth-sales-booster' ) }
                    value={ values.btn_text }
                    onChange={ ( next ) => setValue( 'btn_text', next ) }
                    { ...bind( 'btn_text' ) }
                />
                <TextField
                    label={ __(
                        'CTA Target URI',
                        'storegrowth-sales-booster'
                    ) }
                    type="url"
                    value={ values.btn_target }
                    onChange={ ( next ) => setValue( 'btn_target', next ) }
                    placeholder="https://"
                    { ...bind( 'btn_target' ) }
                />
            </OptionCard>
            { saveBar( 'content' ) }
        </>
    );

    const configure = (
        <>
            <BarPlacementFields { ...barProps } />
            <SelectField
                label={ __( 'Discount Type', 'storegrowth-sales-booster' ) }
                value={ discountType }
                options={ DISCOUNT_TYPES }
                onChange={ ( next ) =>
                    next === 'free-shipping'
                        ? setValue( 'discount_type', 'free-shipping' )
                        : setValues( {
                              discount_type: 'discount-amount',
                              discount_amount_mode:
                                  next as FreeShippingValues[ 'discount_amount_mode' ],
                          } )
                }
                help={
                    discountType === 'free-shipping' && (
                        <>
                            { __(
                                'Free shipping comes from WooCommerce: in WooCommerce → Settings → Shipping, add a Free Shipping method to a shipping zone and set it to need a minimum order amount.',
                                'storegrowth-sales-booster'
                            ) }{ ' ' }
                            <a
                                href="https://woocommerce.com/document/free-shipping/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-sg-brand underline"
                            >
                                { __(
                                    'WooCommerce documentation',
                                    'storegrowth-sales-booster'
                                ) }
                            </a>
                        </>
                    )
                }
                { ...bind( 'discount_type' ) }
            />
            { discountType !== 'free-shipping' && (
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
                    onChange={ ( next ) =>
                        setValue( 'discount_amount_value', next )
                    }
                    { ...bind( 'discount_amount_value' ) }
                />
            ) }
            <NumberField
                label={ __(
                    'Cart Minimum Amount',
                    'storegrowth-sales-booster'
                ) }
                prefix={ store.currency }
                min={ 0 }
                step={ 0.01 }
                value={ values.cart_minimum_amount }
                onChange={ ( next ) => setValue( 'cart_minimum_amount', next ) }
                { ...bind( 'cart_minimum_amount' ) }
            />
            <Accordion
                title={ __( 'Display Rules', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Who sees the banner, and when',
                    'storegrowth-sales-booster'
                ) }
            >
                <BarDeviceField
                    { ...barProps }
                    label={ __( 'Show Banner', 'storegrowth-sales-booster' ) }
                />
                <BarTriggerFields { ...barProps } />
                <TargetingFields { ...barProps } />
            </Accordion>
            { saveBar( 'configure' ) }
        </>
    );

    const design = (
        <>
            <Accordion
                title={ __( 'Banner', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Size and typography of the banner',
                    'storegrowth-sales-booster'
                ) }
            >
                <BarTypographyFields { ...barProps } />
            </Accordion>
            <Accordion
                title={ __( 'Colors', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Every colour on the banner',
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
                    'close_icon_color',
                    __( 'Close Button Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'btn_color',
                    __( 'CTA Background', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'btn_text_color',
                    __( 'CTA Text Color', 'storegrowth-sales-booster' )
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
                                    text={ waitingText }
                                    isPro={ isPro }
                                />
                            ),
                        },
                    ] }
                    value={ values.bar_template }
                    onSelect={ () =>
                        setValues( {
                            bar_template: 'shipping_bar_one',
                            ...TEMPLATE,
                        } )
                    }
                    locked={ isLocked( 'bar_template' ) }
                />
            </Accordion>
            { saveBar( 'design' ) }
        </>
    );

    return (
        <FeatureLayout moduleId="progressive-discount-banner">
            <CardHead
                title={ __(
                    'Free Shipping Rules',
                    'storegrowth-sales-booster'
                ) }
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
                                    <FreeShippingBar
                                        values={ values }
                                        text={
                                            goalReached
                                                ? values.goal_completion_text
                                                : waitingText
                                        }
                                        isPro={ isPro }
                                    />
                                )
                            }
                            bannerPosition={ values.bar_position }
                            footer={
                                <div className="flex w-full max-w-[360px] flex-col gap-3">
                                    <SwitchField
                                        label={ __(
                                            'Preview with the goal reached',
                                            'storegrowth-sales-booster'
                                        ) }
                                        checked={ goalReached }
                                        onChange={ setGoalReached }
                                    />
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
                    }
                >
                    <SettingsTabs
                        label={ __(
                            'Free Shipping Rules settings',
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
