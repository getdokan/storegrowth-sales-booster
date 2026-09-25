/**
 * Stock Bar settings page (design `stock-bar.html`): Content, Configure and
 * Design tabs beside a live product-page preview.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import {
    Accordion,
    CardHead,
    CheckboxField,
    CheckboxGroup,
    ColorField,
    FeatureLayout,
    LivePreview,
    NumberField,
    SaveBar,
    SelectField,
    SettingsSplit,
    SettingsTabs,
    SwitchField,
    TemplatePicker,
    TextField,
} from '@storegrowth/components';
import { useModuleSettings } from '@storegrowth/hooks';
import { errorMessage } from '@storegrowth/utilities';

import { StockBarWidget } from './preview/stock-bar-widget';
import { PRESETS, templateOptions } from './templates';
import { type StockBarValues, TAB_KEYS } from './types';

const FONT_OPTIONS = [
    {
        value: 'inherit',
        label: __( 'Theme font', 'storegrowth-sales-booster' ),
    },
    { value: 'Inter', label: 'Inter' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
];

const FORMAT_OPTIONS = [
    {
        value: 'above',
        label: __( 'Above Stock Bar', 'storegrowth-sales-booster' ),
    },
    {
        value: 'below',
        label: __( 'Below Stock Bar', 'storegrowth-sales-booster' ),
    },
    { value: 'hide', label: __( 'Hide Counts', 'storegrowth-sales-booster' ) },
];

export default function StockBarPage() {
    const settings = useModuleSettings< StockBarValues >( 'stock-bar' );
    const { values, setValue, setValues, isLocked, errors } = settings;

    /**
     * Props shared by every field bound to a setting.
     *
     * @param key Setting key.
     */
    const bind = < K extends keyof StockBarValues >( key: K ) => ( {
        locked: isLocked( key ),
        error: errors[ key ],
    } );

    const save = async ( keys: Array< keyof StockBarValues > ) => {
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

    const saveBar = ( keys: Array< keyof StockBarValues > ) => (
        <SaveBar
            saving={ settings.saving }
            disabled={ ! settings.isDirty( keys ) }
            onReset={ () => settings.reset( keys ) }
            onSave={ () => save( keys ) }
        />
    );

    const applyPreset = ( id: string ) => {
        const preset = PRESETS.find( ( item ) => item.id === id );

        if ( ! preset ) {
            return;
        }

        setValues( {
            stockbar_template: preset.id,
            stockbar_bg_color: preset.track,
            // The fill colour is a pro setting.
            ...( isLocked( 'stockbar_fg_color' )
                ? {}
                : { stockbar_fg_color: preset.fill } ),
        } );
    };

    const content = (
        <>
            <TextField
                label={ __(
                    'Total Sold Count Text',
                    'storegrowth-sales-booster'
                ) }
                value={ values.total_sell_count_text }
                onChange={ ( value ) =>
                    setValue( 'total_sell_count_text', value )
                }
                { ...bind( 'total_sell_count_text' ) }
            />
            <TextField
                label={ __(
                    'Available Item Count Text',
                    'storegrowth-sales-booster'
                ) }
                value={ values.available_item_count_text }
                onChange={ ( value ) =>
                    setValue( 'available_item_count_text', value )
                }
                { ...bind( 'available_item_count_text' ) }
            />
            <TextField
                label={ __( 'Stock Status Text', 'storegrowth-sales-booster' ) }
                value={ values.stock_status_text }
                onChange={ ( value ) => setValue( 'stock_status_text', value ) }
                help={ __(
                    'Use {quantity} for the number of items left.',
                    'storegrowth-sales-booster'
                ) }
                { ...bind( 'stock_status_text' ) }
            />
            { saveBar( TAB_KEYS.content ) }
        </>
    );

    const configure = (
        <>
            <Accordion
                title={ __( 'Where It Shows', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Pages the stock bar appears on',
                    'storegrowth-sales-booster'
                ) }
            >
                <CheckboxGroup>
                    <CheckboxField
                        label={ __(
                            'Display on Shop Page',
                            'storegrowth-sales-booster'
                        ) }
                        checked={ values.shop_page_stock_bar_enable }
                        onChange={ ( checked ) =>
                            setValue( 'shop_page_stock_bar_enable', checked )
                        }
                        locked={ isLocked( 'shop_page_stock_bar_enable' ) }
                    />
                    <CheckboxField
                        label={ __(
                            'Display on Product Page',
                            'storegrowth-sales-booster'
                        ) }
                        checked={ values.product_page_stock_bar_enable }
                        onChange={ ( checked ) =>
                            setValue( 'product_page_stock_bar_enable', checked )
                        }
                        locked={ isLocked( 'product_page_stock_bar_enable' ) }
                    />
                    <CheckboxField
                        label={ __(
                            'Display on Variation Product Page',
                            'storegrowth-sales-booster'
                        ) }
                        checked={ values.variation_page_stock_bar_enable }
                        onChange={ ( checked ) =>
                            setValue(
                                'variation_page_stock_bar_enable',
                                checked
                            )
                        }
                        locked={ isLocked( 'variation_page_stock_bar_enable' ) }
                    />
                </CheckboxGroup>
            </Accordion>
            <SelectField
                label={ __(
                    'Stock Display Format',
                    'storegrowth-sales-booster'
                ) }
                value={ values.stock_display_format }
                options={ FORMAT_OPTIONS }
                onChange={ ( value ) =>
                    setValue(
                        'stock_display_format',
                        value as StockBarValues[ 'stock_display_format' ]
                    )
                }
                { ...bind( 'stock_display_format' ) }
            />
            <SwitchField
                label={ __( 'Stock Status', 'storegrowth-sales-booster' ) }
                checked={ values.show_stock_status }
                onChange={ ( checked ) =>
                    setValue( 'show_stock_status', checked )
                }
                { ...bind( 'show_stock_status' ) }
            />
            <NumberField
                label={ __(
                    'Minimum Quantity Required',
                    'storegrowth-sales-booster'
                ) }
                value={ values.status_quantity_required }
                min={ 0 }
                onChange={ ( value ) =>
                    setValue( 'status_quantity_required', value )
                }
                { ...bind( 'status_quantity_required' ) }
            />
            { saveBar( TAB_KEYS.configure ) }
        </>
    );

    const design = (
        <>
            <Accordion
                title={ __( 'Stock Bar', 'storegrowth-sales-booster' ) }
                help={ __(
                    'The progress bar itself',
                    'storegrowth-sales-booster'
                ) }
            >
                <ColorField
                    label={ __(
                        'Foreground Color',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.stockbar_bg_color }
                    onChange={ ( value ) =>
                        setValue( 'stockbar_bg_color', value )
                    }
                    { ...bind( 'stockbar_bg_color' ) }
                />
                <ColorField
                    label={ __( 'Bar Color', 'storegrowth-sales-booster' ) }
                    value={ values.stockbar_fg_color }
                    onChange={ ( value ) =>
                        setValue( 'stockbar_fg_color', value )
                    }
                    { ...bind( 'stockbar_fg_color' ) }
                />
                <NumberField
                    label={ __(
                        'Stock Bar Height',
                        'storegrowth-sales-booster'
                    ) }
                    suffix="px"
                    value={ values.stockbar_height }
                    min={ 1 }
                    max={ 100 }
                    onChange={ ( value ) =>
                        setValue( 'stockbar_height', value )
                    }
                    { ...bind( 'stockbar_height' ) }
                />
            </Accordion>
            <Accordion
                title={ __( 'Stock Bar Card', 'storegrowth-sales-booster' ) }
                help={ __(
                    'The container and the text around the bar',
                    'storegrowth-sales-booster'
                ) }
            >
                <ColorField
                    label={ __(
                        'Background Color',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.stockbar_card_bg_color }
                    onChange={ ( value ) =>
                        setValue( 'stockbar_card_bg_color', value )
                    }
                    { ...bind( 'stockbar_card_bg_color' ) }
                />
                <ColorField
                    label={ __( 'Border Color', 'storegrowth-sales-booster' ) }
                    value={ values.stockbar_border_color }
                    onChange={ ( value ) =>
                        setValue( 'stockbar_border_color', value )
                    }
                    { ...bind( 'stockbar_border_color' ) }
                />
                <SelectField
                    label={ __( 'Font Family', 'storegrowth-sales-booster' ) }
                    value={ values.font_family }
                    options={ FONT_OPTIONS }
                    onChange={ ( value ) => setValue( 'font_family', value ) }
                    { ...bind( 'font_family' ) }
                />
                <NumberField
                    label={ __(
                        'Count Text Size',
                        'storegrowth-sales-booster'
                    ) }
                    suffix="px"
                    value={ values.count_text_size }
                    min={ 8 }
                    max={ 40 }
                    onChange={ ( value ) =>
                        setValue( 'count_text_size', value )
                    }
                    { ...bind( 'count_text_size' ) }
                />
                <ColorField
                    label={ __(
                        'Count Text Color',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.count_text_color }
                    onChange={ ( value ) =>
                        setValue( 'count_text_color', value )
                    }
                    { ...bind( 'count_text_color' ) }
                />
                <NumberField
                    label={ __(
                        'Status Text Size',
                        'storegrowth-sales-booster'
                    ) }
                    suffix="px"
                    value={ values.status_text_size }
                    min={ 8 }
                    max={ 40 }
                    onChange={ ( value ) =>
                        setValue( 'status_text_size', value )
                    }
                    { ...bind( 'status_text_size' ) }
                />
                <ColorField
                    label={ __(
                        'Stock Status Color',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.status_text_color }
                    onChange={ ( value ) =>
                        setValue( 'status_text_color', value )
                    }
                    { ...bind( 'status_text_color' ) }
                />
            </Accordion>
            <Accordion
                title={ __( 'Template', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Presets that fill the colour fields above',
                    'storegrowth-sales-booster'
                ) }
            >
                <TemplatePicker
                    templates={ templateOptions() }
                    value={ values.stockbar_template }
                    onSelect={ applyPreset }
                    locked={ isLocked( 'stockbar_template' ) }
                />
            </Accordion>
            { saveBar( TAB_KEYS.design ) }
        </>
    );

    return (
        <FeatureLayout moduleId="stock-bar">
            <CardHead
                title={ __( 'Stock Bar', 'storegrowth-sales-booster' ) }
            />
            { settings.loading && (
                <div className="w-full rounded-b-lg border border-t-0 border-[#EAEAEA] bg-white p-6 text-sm text-sg-muted">
                    { __( 'Loading…', 'storegrowth-sales-booster' ) }
                </div>
            ) }
            { settings.loadError && (
                <div
                    role="alert"
                    className="w-full rounded-b-lg border border-t-0 border-[#EAEAEA] bg-white p-6 text-sm text-red-600"
                >
                    { settings.loadError }
                </div>
            ) }
            { ! settings.loading && ! settings.loadError && (
                <SettingsSplit
                    preview={
                        <LivePreview
                            widget={ <StockBarWidget values={ values } /> }
                        />
                    }
                >
                    <SettingsTabs
                        label={ __(
                            'Stock Bar settings',
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
