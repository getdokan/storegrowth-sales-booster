/**
 * Countdown Timer settings page (design `countdown-timer.html`): Configure
 * and Design tabs beside a live, ticking product-page preview.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import {
    Accordion,
    AlignmentField,
    BoxModelField,
    CardHead,
    ColorField,
    FeatureLayout,
    LivePreview,
    NumberField,
    SaveBar,
    SelectField,
    SettingsSplit,
    SettingsTabs,
    SwitchCard,
    TemplatePicker,
    TextField,
} from '@storegrowth/components';
import { useModuleSettings, usePreviewFont } from '@storegrowth/hooks';
import { errorMessage } from '@storegrowth/utilities';

import { counterColors, FONT_FAMILIES, fontFamily } from './data';
import { CountdownPreview } from './preview/countdown-widget';
import { PRESETS, presetValues, templateOptions } from './templates';
import {
    type CountdownKey,
    type CountdownTimerValues,
    DIGIT_KEYS,
    TAB_KEYS,
} from './types';

const FONT_OPTIONS = Object.entries( FONT_FAMILIES ).map(
    ( [ value, label ] ) => ( { value, label } )
);

const WEIGHT_OPTIONS = [
    { value: '400', label: __( 'Regular', 'storegrowth-sales-booster' ) },
    { value: '500', label: __( 'Medium', 'storegrowth-sales-booster' ) },
    { value: '600', label: __( 'Semi Bold', 'storegrowth-sales-booster' ) },
    { value: '700', label: __( 'Bold', 'storegrowth-sales-booster' ) },
];

/** Preview root font size per device; every widget size follows it. */
const PREVIEW_FONT_SIZE = { desktop: 12, tablet: 12, mobile: 9 };

export default function CountdownTimerPage() {
    const settings =
        useModuleSettings< CountdownTimerValues >( 'countdown-timer' );
    const { values, setValue, setValues, isLocked, errors } = settings;

    // Lite: the counter colours need pro, and the storefront draws the
    // template's; the preview and the locked swatches show those.
    const counterLocked = isLocked( 'counter_background_color' );
    const shownValues = counterLocked
        ? ( {
              ...values,
              ...counterColors( values.selected_theme ),
          } as CountdownTimerValues )
        : values;

    usePreviewFont( fontFamily( values.font_family ?? '' ) );
    usePreviewFont( fontFamily( values.counter_font_family ?? '' ) );

    /**
     * Props shared by every field bound to a setting.
     *
     * @param key Setting key.
     */
    const bind = ( key: CountdownKey ) => ( {
        locked: isLocked( key ),
        error: errors[ key ],
    } );

    const save = async ( keys: CountdownKey[] ) => {
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

    const saveBar = ( keys: CountdownKey[] ) => (
        <SaveBar
            saving={ settings.saving }
            disabled={ ! settings.isDirty( keys ) }
            onReset={ () => settings.reset( keys ) }
            onSave={ () => save( keys ) }
        />
    );

    // A preset fills the colour fields it can (in lite, not the counter's).
    const presetFields = ( id: string ): Partial< CountdownTimerValues > =>
        Object.fromEntries(
            Object.entries( presetValues( id ) ).filter(
                ( [ key ] ) => ! isLocked( key )
            )
        );

    // Highlight a preset only while the colours are still its colours.
    const activePreset =
        PRESETS.find( ( preset ) =>
            Object.entries( presetFields( preset.id ) ).every(
                ( [ key, value ] ) =>
                    String( values[ key ] ).toLowerCase() ===
                    String( value ).toLowerCase()
            )
        )?.id ?? '';

    const shown =
        values.product_page_countdown_enable ||
        ( values.shop_page_countdown_enable &&
            ! isLocked( 'shop_page_countdown_enable' ) );

    const configure = (
        <>
            <TextField
                label={ __( 'Countdown Heading', 'storegrowth-sales-booster' ) }
                value={ values.countdown_heading }
                onChange={ ( value ) => setValue( 'countdown_heading', value ) }
                help={ __(
                    "Use [discount] for the product's discount.",
                    'storegrowth-sales-booster'
                ) }
                { ...bind( 'countdown_heading' ) }
            />
            <SwitchCard
                title={ __( 'Shop Page Display', 'storegrowth-sales-booster' ) }
                help={ __(
                    'The sales countdown will show on the shop page',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.shop_page_countdown_enable }
                onChange={ ( checked ) =>
                    setValue( 'shop_page_countdown_enable', checked )
                }
                locked={ isLocked( 'shop_page_countdown_enable' ) }
            />
            <SwitchCard
                title={ __(
                    'Product Page Display',
                    'storegrowth-sales-booster'
                ) }
                help={ __(
                    'The sales countdown will show on the product page',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.product_page_countdown_enable }
                onChange={ ( checked ) =>
                    setValue( 'product_page_countdown_enable', checked )
                }
                locked={ isLocked( 'product_page_countdown_enable' ) }
            />
            { saveBar( TAB_KEYS.configure ) }
        </>
    );

    const color = ( key: CountdownKey, label: ReactNode, help?: string ) => (
        <ColorField
            label={ label }
            value={ shownValues[ key ] as string }
            onChange={ ( value ) => setValue( key, value ) }
            help={ help }
            { ...bind( key ) }
        />
    );

    const design = (
        <>
            <Accordion
                title={ __( 'Heading', 'storegrowth-sales-booster' ) }
                help={ __(
                    'The line above the timer',
                    'storegrowth-sales-booster'
                ) }
            >
                <SelectField
                    label={ __( 'Font Family', 'storegrowth-sales-booster' ) }
                    value={ values.font_family }
                    options={ FONT_OPTIONS }
                    onChange={ ( value ) => setValue( 'font_family', value ) }
                    { ...bind( 'font_family' ) }
                />
                <SelectField
                    label={ __( 'Font Weight', 'storegrowth-sales-booster' ) }
                    value={ values.heading_font_weight }
                    options={ WEIGHT_OPTIONS }
                    onChange={ ( value ) =>
                        setValue( 'heading_font_weight', value )
                    }
                    { ...bind( 'heading_font_weight' ) }
                />
                <div className="flex w-full flex-wrap items-start gap-3 *:min-w-[180px] *:flex-1">
                    <NumberField
                        label={ __(
                            'Letter Spacing',
                            'storegrowth-sales-booster'
                        ) }
                        suffix="px"
                        value={ values.heading_letter_spacing }
                        min={ -5 }
                        max={ 20 }
                        onChange={ ( value ) =>
                            setValue( 'heading_letter_spacing', value )
                        }
                        { ...bind( 'heading_letter_spacing' ) }
                    />
                    <NumberField
                        label={ __(
                            'Line Height',
                            'storegrowth-sales-booster'
                        ) }
                        suffix="px"
                        value={ values.heading_line_height }
                        min={ 10 }
                        max={ 80 }
                        onChange={ ( value ) =>
                            setValue( 'heading_line_height', value )
                        }
                        { ...bind( 'heading_line_height' ) }
                    />
                </div>
                { color(
                    'heading_text_color',
                    __( 'Heading Color', 'storegrowth-sales-booster' )
                ) }
            </Accordion>

            <Accordion
                title={ __(
                    'Container and Layout',
                    'storegrowth-sales-booster'
                ) }
                help={ __(
                    'The box around the countdown',
                    'storegrowth-sales-booster'
                ) }
                defaultOpen={ false }
            >
                { color(
                    'widget_background_color',
                    __( 'Widget Background Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'border_color',
                    __( 'Border Color', 'storegrowth-sales-booster' )
                ) }
                <NumberField
                    label={ __( 'Widget Radius', 'storegrowth-sales-booster' ) }
                    suffix="px"
                    value={ values.widget_radius }
                    min={ 0 }
                    max={ 60 }
                    onChange={ ( value ) => setValue( 'widget_radius', value ) }
                    { ...bind( 'widget_radius' ) }
                />
                <AlignmentField
                    label={ __( 'Alignment', 'storegrowth-sales-booster' ) }
                    name={ __(
                        'Container alignment',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.widget_alignment }
                    onChange={ ( value ) =>
                        setValue( 'widget_alignment', value )
                    }
                    { ...bind( 'widget_alignment' ) }
                />
                <BoxModelField
                    label={ __( 'Margin', 'storegrowth-sales-booster' ) }
                    value={ values.widget_margin }
                    onChange={ ( value ) => setValue( 'widget_margin', value ) }
                    { ...bind( 'widget_margin' ) }
                />
                <BoxModelField
                    label={ __( 'Padding', 'storegrowth-sales-booster' ) }
                    value={ values.widget_padding }
                    onChange={ ( value ) =>
                        setValue( 'widget_padding', value )
                    }
                    { ...bind( 'widget_padding' ) }
                />
            </Accordion>

            <Accordion
                title={ __(
                    'Counter/Timer (Box)',
                    'storegrowth-sales-booster'
                ) }
                help={ __(
                    'The day, hour, minute and second boxes',
                    'storegrowth-sales-booster'
                ) }
                defaultOpen={ false }
            >
                <ColorField
                    label={ __(
                        'Digit Text Color',
                        'storegrowth-sales-booster'
                    ) }
                    value={ shownValues.day_text_color }
                    onChange={ ( value ) =>
                        setValues(
                            Object.fromEntries(
                                DIGIT_KEYS.map( ( key ) => [ key, value ] )
                            )
                        )
                    }
                    { ...bind( 'day_text_color' ) }
                />
                { color(
                    'counter_label_color',
                    __( 'Label Text Color', 'storegrowth-sales-booster' ),
                    __(
                        'The DAYS / HOURS / MIN / SEC captions.',
                        'storegrowth-sales-booster'
                    )
                ) }
                { color(
                    'counter_separator_color',
                    __( 'Separator Color', 'storegrowth-sales-booster' )
                ) }
                <div className="h-px w-full bg-sg-line" />
                { color(
                    'counter_background_color',
                    __( 'Background Color', 'storegrowth-sales-booster' )
                ) }
                { color(
                    'counter_border_color',
                    __( 'Border Color', 'storegrowth-sales-booster' )
                ) }
                <NumberField
                    label={ __( 'Box Radius', 'storegrowth-sales-booster' ) }
                    suffix="px"
                    value={ values.counter_radius }
                    min={ 0 }
                    max={ 40 }
                    onChange={ ( value ) =>
                        setValue( 'counter_radius', value )
                    }
                    { ...bind( 'counter_radius' ) }
                />
                <AlignmentField
                    label={ __( 'Alignment', 'storegrowth-sales-booster' ) }
                    name={ __(
                        'Counter alignment',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.counter_alignment }
                    onChange={ ( value ) =>
                        setValue( 'counter_alignment', value )
                    }
                    { ...bind( 'counter_alignment' ) }
                />
                <BoxModelField
                    label={ __( 'Margin', 'storegrowth-sales-booster' ) }
                    name={ __( 'Counter margin', 'storegrowth-sales-booster' ) }
                    value={ values.counter_margin }
                    onChange={ ( value ) =>
                        setValue( 'counter_margin', value )
                    }
                    { ...bind( 'counter_margin' ) }
                />
                <BoxModelField
                    label={ __( 'Padding', 'storegrowth-sales-booster' ) }
                    name={ __(
                        'Counter padding',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.counter_padding }
                    onChange={ ( value ) =>
                        setValue( 'counter_padding', value )
                    }
                    { ...bind( 'counter_padding' ) }
                />
            </Accordion>

            <Accordion
                title={ __( 'Counter Text', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Font of the numbers and their labels',
                    'storegrowth-sales-booster'
                ) }
                defaultOpen={ false }
            >
                <SelectField
                    label={ __( 'Font Family', 'storegrowth-sales-booster' ) }
                    value={ values.counter_font_family }
                    options={ FONT_OPTIONS }
                    onChange={ ( value ) =>
                        setValue( 'counter_font_family', value )
                    }
                    { ...bind( 'counter_font_family' ) }
                />
                <SelectField
                    label={ __( 'Font Weight', 'storegrowth-sales-booster' ) }
                    value={ values.counter_font_weight }
                    options={ WEIGHT_OPTIONS }
                    onChange={ ( value ) =>
                        setValue( 'counter_font_weight', value )
                    }
                    { ...bind( 'counter_font_weight' ) }
                />
                <NumberField
                    label={ __(
                        'Letter Spacing',
                        'storegrowth-sales-booster'
                    ) }
                    suffix="px"
                    value={ values.counter_letter_spacing }
                    min={ -5 }
                    max={ 20 }
                    onChange={ ( value ) =>
                        setValue( 'counter_letter_spacing', value )
                    }
                    { ...bind( 'counter_letter_spacing' ) }
                />
            </Accordion>

            <Accordion
                title={ __( 'Select Template', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Presets that fill the colour fields above',
                    'storegrowth-sales-booster'
                ) }
                defaultOpen={ false }
            >
                <TemplatePicker
                    columns={ 2 }
                    templates={ templateOptions( values ) }
                    value={ activePreset }
                    onSelect={ ( id ) => setValues( presetFields( id ) ) }
                    locked={ isLocked( 'selected_theme' ) }
                />
            </Accordion>
            { saveBar( TAB_KEYS.design ) }
        </>
    );

    const widget = ( fontSize: number ) =>
        /**
         * Filters the Countdown Timer preview widget, e.g. for pro to add its
         * parts.
         *
         * @since SPSG_VERSION
         *
         * @param {JSX.Element}          widget The preview widget.
         * @param {CountdownTimerValues} values Current (unsaved) settings.
         */
        applyFilters(
            'storegrowth.preview.countdown-timer',
            <CountdownPreview values={ shownValues } fontSize={ fontSize } />,
            values
        ) as ReactNode;

    return (
        <FeatureLayout moduleId="countdown-timer">
            <CardHead
                title={ __( 'Countdown Timer', 'storegrowth-sales-booster' ) }
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
                            widget={ ( { device } ) =>
                                shown ? (
                                    widget( PREVIEW_FONT_SIZE[ device ] )
                                ) : (
                                    <p className="w-full rounded-[8px] border border-dashed border-[#D4D4D4] px-4 py-6 text-center text-[12px] leading-[1.4] text-sg-help">
                                        { __(
                                            'Not shown on any page. Turn on Shop or Product page display.',
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
                            'Countdown Timer settings',
                            'storegrowth-sales-booster'
                        ) }
                        tabs={ [
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
