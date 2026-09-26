/**
 * Sales Notification settings page (design `sales-notification.html`):
 * Notification Setting and Design tabs beside a product-page preview with the
 * popup in its corner.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { useEffect, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import {
    Accordion,
    CardHead,
    ColorField,
    FeatureLayout,
    LivePreview,
    MultiSelectField,
    NumberField,
    OptionCard,
    SaveBar,
    SelectField,
    SettingsSplit,
    SettingsTabs,
    SwitchField,
    TemplatePicker,
    TextStyleHeader,
    TextStyleRow,
    TextareaField,
} from '@storegrowth/components';
import { useModuleSettings } from '@storegrowth/hooks';
import {
    assetUrl,
    errorMessage,
    fetchProductsByIds,
    getHeaderData,
    type ProductOption,
    searchProducts,
} from '@storegrowth/utilities';

import { FALLBACK_IMAGE, fetchSourceProducts, templateRadii } from './data';
import { ListTextarea } from './list-textarea';
import { SalesPopToast, type ToastSample } from './preview/sales-pop-toast';
import { templateOptions } from './templates';
import {
    type SalesPopKey,
    type SalesPopValues,
    TAB_KEYS,
    TEXT_ROWS,
    type TextRow,
} from './types';

const SOURCES = [
    {
        value: '1',
        label: __( 'Select Products', 'storegrowth-sales-booster' ),
    },
    { value: '0', label: __( 'Recent Orders', 'storegrowth-sales-booster' ) },
    { value: '2', label: __( 'Best Sellers', 'storegrowth-sales-booster' ) },
];

const PAGE_CONDITIONS = [
    {
        value: 'is_front_page',
        label: __( 'Front page', 'storegrowth-sales-booster' ),
    },
    { value: 'is_home', label: __( 'Blog page', 'storegrowth-sales-booster' ) },
    {
        value: 'is_singular',
        label: __(
            'Any single post, page or product',
            'storegrowth-sales-booster'
        ),
    },
    { value: 'is_page', label: __( 'Pages', 'storegrowth-sales-booster' ) },
    {
        value: 'is_attachment',
        label: __( 'Attachment pages', 'storegrowth-sales-booster' ),
    },
    {
        value: 'is_search',
        label: __( 'Search results', 'storegrowth-sales-booster' ),
    },
    { value: 'is_404', label: __( '404 page', 'storegrowth-sales-booster' ) },
    {
        value: 'is_archive',
        label: __( 'Archives', 'storegrowth-sales-booster' ),
    },
    {
        value: 'is_category',
        label: __( 'Category archives', 'storegrowth-sales-booster' ),
    },
    {
        value: 'is_tag',
        label: __( 'Tag archives', 'storegrowth-sales-booster' ),
    },
];

const WEIGHTS = [
    { value: '400', label: __( 'Normal', 'storegrowth-sales-booster' ) },
    { value: '500', label: __( 'Medium', 'storegrowth-sales-booster' ) },
    { value: '700', label: __( 'Bold', 'storegrowth-sales-booster' ) },
];

const TEXT_LABELS: Record< TextRow, string > = {
    normal_text: __( 'Normal Text', 'storegrowth-sales-booster' ),
    product_title: __( 'Product Name', 'storegrowth-sales-booster' ),
    time_text: __( 'Time', 'storegrowth-sales-booster' ),
    country_text: __( 'Country', 'storegrowth-sales-booster' ),
    state_text: __( 'State', 'storegrowth-sales-booster' ),
    city_text: __( 'City', 'storegrowth-sales-booster' ),
};

/** Message tokens (design legend); each message line is a popup line. */
const TOKENS = [
    [
        '{virtual_name}',
        __( 'Buyer name + "Just purchased"', 'storegrowth-sales-booster' ),
    ],
    [
        '{product_title}',
        __( 'Title of product', 'storegrowth-sales-booster' ),
    ],
    [ '{location}', __( 'City, state, country', 'storegrowth-sales-booster' ) ],
    [ '{time}', __( 'Time of the purchase', 'storegrowth-sales-booster' ) ],
];

const toOptions = ( products: ProductOption[] ) =>
    products.map( ( product ) => ( {
        value: product.id,
        label: product.name,
    } ) );

export default function SalesPopPage() {
    const settings = useModuleSettings< SalesPopValues >( 'sales-pop' );
    const { values, setValue, setValues, isLocked, errors, schema } = settings;
    const isPro = Boolean( getHeaderData().header_info.is_pro_exists );
    // Lite caps products picked by hand at 5 (as the old admin did).
    const maxProducts = isPro ? undefined : 5;
    const [ firstProduct, setFirstProduct ] = useState< ProductOption >();

    // The first chosen product, for the preview.
    const firstId = ( values.popup_products ?? [] )[ 0 ];
    useEffect( () => {
        if ( ! firstId ) {
            setFirstProduct( undefined );
            return;
        }

        fetchProductsByIds( [ firstId ] )
            .then( ( [ product ] ) => setFirstProduct( product ) )
            .catch( () => setFirstProduct( undefined ) );
    }, [ firstId ] );

    /**
     * Props shared by every field bound to a setting.
     *
     * @param key Setting key.
     */
    const bind = ( key: SalesPopKey ) => ( {
        locked: isLocked( key ),
        error: errors[ key ],
    } );

    const save = async ( keys: SalesPopKey[] ) => {
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

    const saveBar = ( keys: SalesPopKey[] ) => (
        <SaveBar
            saving={ settings.saving }
            disabled={ ! settings.isDirty( keys ) }
            onReset={ () => settings.reset( keys ) }
            onSave={ () => save( keys ) }
        />
    );

    // Recent Orders and Best Sellers fill the products when picked (as the
    // old admin did for recent orders); Select Products starts empty.
    const fillFromSource = async (
        source: SalesPopValues[ 'product_source' ],
        count: number
    ) => {
        if ( source === '1' ) {
            setValue( 'popup_products', [] );
            return;
        }

        const limit = Math.min( count || 5, 100 );

        try {
            const products = await fetchSourceProducts(
                source === '0' ? 'orders' : 'best_sellers',
                limit
            );
            setValue(
                'popup_products',
                products.map( ( product ) => product.id )
            );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The products could not be loaded.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    // Lite: the radius fields need pro; the storefront uses the template's.
    const shownValues = isLocked( 'popup_border_radius' )
        ? { ...values, ...templateRadii( values.template ) }
        : values;

    const sample: ToastSample = {
        name:
            values.virtual_name?.[ 0 ] ||
            __( 'Someone', 'storegrowth-sales-booster' ),
        product:
            firstProduct?.name ||
            __( 'Your product name', 'storegrowth-sales-booster' ),
        // A chosen product without an image gets the storefront's fallback.
        image: firstProduct
            ? firstProduct.image || FALLBACK_IMAGE
            : assetUrl( 'images/preview/product.jpeg' ),
        location:
            values.virtual_locations?.[ 0 ] || 'New York City, New York, USA',
        minutes: 15,
    };

    const switchField = ( key: SalesPopKey, label: string ) => (
        <SwitchField
            label={ label }
            checked={ values[ key ] as boolean }
            onChange={ ( checked ) => setValue( key, checked ) }
            { ...bind( key ) }
        />
    );

    const number = ( key: SalesPopKey, label: string, suffix?: string ) => (
        <NumberField
            label={ label }
            suffix={ suffix }
            value={ shownValues[ key ] as number }
            min={ schema[ key ]?.min }
            max={ schema[ key ]?.max }
            onChange={ ( next ) => setValue( key, next ) }
            { ...bind( key ) }
        />
    );

    const settingsTab = (
        <>
            <Accordion
                title={ __( 'General', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Whether the popup shows at all, and where',
                    'storegrowth-sales-booster'
                ) }
            >
                { switchField(
                    'enable',
                    __( 'Enable Popup', 'storegrowth-sales-booster' )
                ) }
                { switchField(
                    'enble_visibility',
                    __(
                        'Stop Popup Visibility On Close',
                        'storegrowth-sales-booster'
                    )
                ) }
                { switchField(
                    'mobile_view',
                    __( 'Popup in Mobile', 'storegrowth-sales-booster' )
                ) }
                { switchField(
                    'show_close_button',
                    __( 'Show Close Button', 'storegrowth-sales-booster' )
                ) }
            </Accordion>

            <Accordion
                title={ __( 'Products', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Which products the popup notifies about, and how they link',
                    'storegrowth-sales-booster'
                ) }
                defaultOpen={ false }
            >
                { switchField(
                    'product_random',
                    __( 'Product Show Random', 'storegrowth-sales-booster' )
                ) }
                { switchField(
                    'external_link',
                    __( 'External Link', 'storegrowth-sales-booster' )
                ) }
                { switchField(
                    'open_product_link_in_new_tab',
                    __(
                        'Open Product Link in New Tab',
                        'storegrowth-sales-booster'
                    )
                ) }
                { switchField(
                    'link_image_to_product',
                    __(
                        'Link Image to Product Page',
                        'storegrowth-sales-booster'
                    )
                ) }
                <SelectField
                    label={ __(
                        'Product Source',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.product_source }
                    options={ SOURCES }
                    onChange={ ( next ) => {
                        const source =
                            next as SalesPopValues[ 'product_source' ];
                        setValue( 'product_source', source );
                        fillFromSource( source, values.number_of_orders );
                    } }
                    { ...bind( 'product_source' ) }
                />
                { values.product_source !== '1' && (
                    <NumberField
                        label={ __(
                            'Number of Products',
                            'storegrowth-sales-booster'
                        ) }
                        value={ values.number_of_orders }
                        min={ 0 }
                        onChange={ ( next ) => {
                            setValue( 'number_of_orders', next );
                            fillFromSource( values.product_source, next );
                        } }
                        { ...bind( 'number_of_orders' ) }
                    />
                ) }
                <MultiSelectField
                    label={ __(
                        'Select Popup Products',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.popup_products }
                    onChange={ ( next ) =>
                        setValue( 'popup_products', next as number[] )
                    }
                    onSearch={ ( search ) =>
                        searchProducts( search ).then( toOptions )
                    }
                    resolve={ ( ids ) =>
                        fetchProductsByIds( ids as number[] ).then( toOptions )
                    }
                    max={
                        values.product_source === '1' ? maxProducts : undefined
                    }
                    placeholder={ __(
                        'Search products…',
                        'storegrowth-sales-booster'
                    ) }
                    help={
                        values.product_source === '1'
                            ? undefined
                            : __(
                                  'Filled from the source when you pick it; you can still change them.',
                                  'storegrowth-sales-booster'
                              )
                    }
                    { ...bind( 'popup_products' ) }
                />
                <ListTextarea
                    label={ __(
                        'Virtual First Name',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.virtual_name }
                    separator=","
                    onChange={ ( next ) => setValue( 'virtual_name', next ) }
                    placeholder={ __(
                        'Name1, Name2, Name3',
                        'storegrowth-sales-booster'
                    ) }
                    help={ __(
                        'Separate names with commas.',
                        'storegrowth-sales-booster'
                    ) }
                    { ...bind( 'virtual_name' ) }
                />
                <ListTextarea
                    label={ __(
                        'Virtual Location',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.virtual_locations }
                    separator={ '\n' }
                    onChange={ ( next ) =>
                        setValue( 'virtual_locations', next )
                    }
                    help={ __(
                        'One per line: City, State, Country.',
                        'storegrowth-sales-booster'
                    ) }
                    { ...bind( 'virtual_locations' ) }
                />
                <SelectField
                    label={ __(
                        'Visibility Control',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.banner_show_option }
                    options={ [
                        {
                            value: 'banner-show-everywhere',
                            label: __(
                                'Show Everywhere',
                                'storegrowth-sales-booster'
                            ),
                        },
                        {
                            value: 'banner-show-selected',
                            label: __(
                                'Show on Specific Pages',
                                'storegrowth-sales-booster'
                            ),
                        },
                    ] }
                    onChange={ ( next ) =>
                        setValue(
                            'banner_show_option',
                            next as SalesPopValues[ 'banner_show_option' ]
                        )
                    }
                    { ...bind( 'banner_show_option' ) }
                />
                { values.banner_show_option === 'banner-show-selected' && (
                    <MultiSelectField
                        label={ __( 'Pages', 'storegrowth-sales-booster' ) }
                        value={ values.slected_page_option }
                        options={ PAGE_CONDITIONS }
                        onChange={ ( next ) =>
                            setValue( 'slected_page_option', next as string[] )
                        }
                        { ...bind( 'slected_page_option' ) }
                    />
                ) }
                <SelectField
                    label={ __( 'Show To', 'storegrowth-sales-booster' ) }
                    value={ values.user_type }
                    options={ [
                        {
                            value: 'both',
                            label: __(
                                'Everyone',
                                'storegrowth-sales-booster'
                            ),
                        },
                        {
                            value: 'logged_in',
                            label: __(
                                'Logged-in Users',
                                'storegrowth-sales-booster'
                            ),
                        },
                        {
                            value: 'not_logged_in',
                            label: __( 'Guests', 'storegrowth-sales-booster' ),
                        },
                    ] }
                    onChange={ ( next ) =>
                        setValue(
                            'user_type',
                            next as SalesPopValues[ 'user_type' ]
                        )
                    }
                    { ...bind( 'user_type' ) }
                />
            </Accordion>

            <Accordion
                title={ __( 'Message', 'storegrowth-sales-booster' ) }
                help={ __(
                    'The copy shown inside the popup',
                    'storegrowth-sales-booster'
                ) }
                defaultOpen={ false }
            >
                <TextareaField
                    label={ __( 'Message Popup', 'storegrowth-sales-booster' ) }
                    value={ values.message_popup }
                    rows={ 4 }
                    onChange={ ( next ) => setValue( 'message_popup', next ) }
                    help={
                        <span className="flex flex-col gap-0.5">
                            { TOKENS.map( ( [ token, meaning ] ) => (
                                <span key={ token }>
                                    <code>{ token }</code> = { meaning }
                                </span>
                            ) ) }
                        </span>
                    }
                    { ...bind( 'message_popup' ) }
                />
            </Accordion>

            <Accordion
                title={ __( 'Timing', 'storegrowth-sales-booster' ) }
                help={ __(
                    'How often and how long each popup shows',
                    'storegrowth-sales-booster'
                ) }
                defaultOpen={ false }
            >
                { switchField(
                    'loop',
                    __( 'Loop', 'storegrowth-sales-booster' )
                ) }
                { number(
                    'notification_per_page',
                    __( 'Notification Per Page', 'storegrowth-sales-booster' )
                ) }
                { number(
                    'next_time_display',
                    __( 'Next Time Display', 'storegrowth-sales-booster' ),
                    __( 'sec', 'storegrowth-sales-booster' )
                ) }
                { number(
                    'initial_time_delay',
                    __( 'Initial Time Delay', 'storegrowth-sales-booster' ),
                    __( 'sec', 'storegrowth-sales-booster' )
                ) }
                { number(
                    'dispaly_time',
                    __( 'Display Time', 'storegrowth-sales-booster' ),
                    __( 'sec', 'storegrowth-sales-booster' )
                ) }
            </Accordion>
            { saveBar( TAB_KEYS.settings ) }
        </>
    );

    const designTab = (
        <>
            <Accordion
                title={ __( 'Template', 'storegrowth-sales-booster' ) }
                help={ __(
                    'What shows on the left of the popup',
                    'storegrowth-sales-booster'
                ) }
            >
                <TemplatePicker
                    columns={ 2 }
                    templates={ templateOptions( values, sample, isPro ) }
                    value={ values.template }
                    onSelect={ ( id ) =>
                        setValues( {
                            template: id as SalesPopValues[ 'template' ],
                            // The template's radii, where they can be edited.
                            ...( isLocked( 'popup_border_radius' )
                                ? {}
                                : templateRadii( id ) ),
                        } )
                    }
                    locked={ isLocked( 'template' ) }
                />
            </Accordion>

            <OptionCard
                title={ __( 'Image Style', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Size and shape of the template image',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.image_style }
                onChange={ ( checked ) => setValue( 'image_style', checked ) }
                locked={ isLocked( 'image_style' ) }
            >
                { number(
                    'spacing_around_image',
                    __( 'Image Spacing', 'storegrowth-sales-booster' ),
                    'px'
                ) }
                { number(
                    'popup_image_border_radius',
                    __( 'Image Radius', 'storegrowth-sales-booster' ),
                    'px'
                ) }
                <SelectField
                    label={ __(
                        'Image Position',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.image_position }
                    options={ [
                        {
                            value: 'left',
                            label: __( 'Left', 'storegrowth-sales-booster' ),
                        },
                        {
                            value: 'right',
                            label: __( 'Right', 'storegrowth-sales-booster' ),
                        },
                    ] }
                    onChange={ ( next ) =>
                        setValue(
                            'image_position',
                            next as SalesPopValues[ 'image_position' ]
                        )
                    }
                    { ...bind( 'image_position' ) }
                />
                { number(
                    'popup_image_width',
                    __( 'Image Width', 'storegrowth-sales-booster' ),
                    'px'
                ) }
            </OptionCard>

            <OptionCard
                title={ __( 'Popup Style', 'storegrowth-sales-booster' ) }
                help={ __(
                    'The container the popup sits in',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.popup_style }
                onChange={ ( checked ) => setValue( 'popup_style', checked ) }
                locked={ isLocked( 'popup_style' ) }
            >
                <ColorField
                    label={ __(
                        'Background Color',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.background_color }
                    onChange={ ( next ) =>
                        setValue( 'background_color', next )
                    }
                    { ...bind( 'background_color' ) }
                />
                <SelectField
                    label={ __(
                        'Popup Position',
                        'storegrowth-sales-booster'
                    ) }
                    value={ values.popup_position }
                    options={ [
                        {
                            value: 'left_bottom',
                            label: __(
                                'Left Bottom',
                                'storegrowth-sales-booster'
                            ),
                        },
                        {
                            value: 'right_bottom',
                            label: __(
                                'Right Bottom',
                                'storegrowth-sales-booster'
                            ),
                        },
                        {
                            value: 'left_top',
                            label: __(
                                'Left Top',
                                'storegrowth-sales-booster'
                            ),
                        },
                        {
                            value: 'right_top',
                            label: __(
                                'Right Top',
                                'storegrowth-sales-booster'
                            ),
                        },
                    ] }
                    onChange={ ( next ) =>
                        setValue(
                            'popup_position',
                            next as SalesPopValues[ 'popup_position' ]
                        )
                    }
                    { ...bind( 'popup_position' ) }
                />
                { number(
                    'popup_border_radius',
                    __( 'Border Radius', 'storegrowth-sales-booster' ),
                    'px'
                ) }
                { number(
                    'popup_width',
                    __( 'Popup Width', 'storegrowth-sales-booster' ),
                    'px'
                ) }
            </OptionCard>

            <OptionCard
                title={ __( 'Text Style', 'storegrowth-sales-booster' ) }
                help={ __(
                    'Colour, size and weight for every line of copy',
                    'storegrowth-sales-booster'
                ) }
                checked={ values.text_style }
                onChange={ ( checked ) => setValue( 'text_style', checked ) }
                locked={ isLocked( 'text_style' ) }
            >
                <TextStyleHeader />
                { ( Object.keys( TEXT_ROWS ) as TextRow[] ).map( ( row ) => (
                    <TextStyleRow
                        key={ row }
                        label={ TEXT_LABELS[ row ] }
                        color={ values[ TEXT_ROWS[ row ] ] as string }
                        size={ values[ `${ row }_font_size` ] as number }
                        weight={ values[ `${ row }_font_weight` ] as string }
                        weights={ WEIGHTS }
                        locked={ isLocked( TEXT_ROWS[ row ] ) }
                        onChange={ ( part, next ) => {
                            if ( part === 'color' ) {
                                setValue( TEXT_ROWS[ row ], next );
                            } else if ( part === 'size' ) {
                                setValue(
                                    `${ row }_font_size`,
                                    Number( next )
                                );
                            } else {
                                setValue( `${ row }_font_weight`, next );
                            }
                        } }
                    />
                ) ) }
            </OptionCard>
            { saveBar( TAB_KEYS.design ) }
        </>
    );

    // Off → nothing on the storefront; on phones only with "Popup in Mobile".
    const overlay = ( { device }: { device: string } ) =>
        values.enable && ( device !== 'mobile' || values.mobile_view )
            ? ( applyFilters(
                  /**
                   * Filters the Sales Notification preview, e.g. for pro to
                   * add its parts.
                   *
                   * @since SPSG_VERSION
                   *
                   * @param {JSX.Element}    popup  The preview popup.
                   * @param {SalesPopValues} values Current (unsaved) settings.
                   */
                  'storegrowth.preview.sales-pop',
                  <SalesPopToast
                      values={ shownValues }
                      sample={ sample }
                      isPro={ isPro }
                      floating
                  />,
                  values
              ) as ReactNode )
            : null;

    return (
        <FeatureLayout moduleId="sales-pop">
            <CardHead
                title={ __(
                    'Sales Notification',
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
                            overlay={ overlay }
                            footer={
                                ! values.enable && (
                                    <p className="text-center text-xs text-sg-help">
                                        { __(
                                            'The popup is off. Turn on Enable Popup to see it here.',
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
                            'Sales Notification settings',
                            'storegrowth-sales-booster'
                        ) }
                        tabs={ [
                            {
                                id: 'settings',
                                label: __(
                                    'Notification Setting',
                                    'storegrowth-sales-booster'
                                ),
                                content: settingsTab,
                            },
                            {
                                id: 'design',
                                label: __(
                                    'Design',
                                    'storegrowth-sales-booster'
                                ),
                                content: designTab,
                            },
                        ] }
                    />
                </SettingsSplit>
            ) }
        </FeatureLayout>
    );
}
