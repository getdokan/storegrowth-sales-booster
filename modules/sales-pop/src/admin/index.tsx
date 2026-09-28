/**
 * Sales Notification admin bundle (`modules/sales-pop/assets/js/admin.js`),
 * loaded on the StoreGrowth admin page before the app mounts. The app draws
 * the Sales Notification settings page (design `sales-notification.html`)
 * from the schema (PHP `SalesPopSettings`: page, tabs, sections, fields) at
 * `#/settings?module=sales-pop`; this adds the product-page preview with the
 * popup in its corner, and the controls the schema can't describe: the
 * product source (which fills the products), the product search, the name
 * and location lists, the message with its token legend, the template
 * picker, the radii (the template's in lite) and the Text Style rows.
 *
 * @since SPSG_VERSION
 */
import { toast } from '@wedevs/plugin-ui';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import {
    LivePreview,
    MultiSelectField,
    NumberField,
    SelectField,
    type SettingsPageParts,
    TemplatePicker,
    TextStyleHeader,
    TextStyleRow,
    TextareaField,
} from '@storegrowth/components';
import type { ModuleSettings } from '@storegrowth/hooks';
import {
    errorMessage,
    fetchProductsByIds,
    getHeaderData,
    type ProductOption,
    searchProducts,
} from '@storegrowth/utilities';

import { fetchSourceProducts, templateRadii } from './data';
import { ListTextarea } from './list-textarea';
import { SalesPopToast } from './preview/sales-pop-toast';
import { templateOptions } from './templates';
import {
    type SalesPopKey,
    type SalesPopValues,
    TEXT_ROWS,
    type TextRow,
} from './types';
import { useSample } from './use-sample';

type Settings = ModuleSettings< SalesPopValues >;

/** Product sources in the design's order. */
const SOURCES: Array< SalesPopValues[ 'product_source' ] > = [ '1', '0', '2' ];

const WEIGHTS = [
    { value: '400', label: __( 'Normal', 'storegrowth-sales-booster' ) },
    { value: '500', label: __( 'Medium', 'storegrowth-sales-booster' ) },
    { value: '700', label: __( 'Bold', 'storegrowth-sales-booster' ) },
];

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

const isPro = () => {
    return Boolean( getHeaderData().header_info.is_pro_exists );
};

const toOptions = ( products: ProductOption[] ) => {
    return products.map( ( product ) => {
        return { value: product.id, label: product.name };
    } );
};

/**
 * Settings as the storefront applies them: in lite the radius fields need
 * pro and the storefront draws the template's radii, so the preview and the
 * locked fields show those.
 *
 * @param settings Module settings.
 */
const shownValues = ( settings: Settings ): SalesPopValues => {
    const { values, isLocked } = settings;

    if ( ! isLocked( 'popup_border_radius' ) ) {
        return values;
    }

    return { ...values, ...templateRadii( values.template ) };
};

/**
 * The product-page preview with the popup in its corner.
 *
 * @param props          Props.
 * @param props.settings Module settings.
 */
const SalesPopPreview = ( { settings }: { settings: Settings } ) => {
    const { values } = settings;
    const sample = useSample( values );

    // Off → nothing on the storefront; on phones only with "Popup in Mobile".
    const overlay = ( { device }: { device: string } ) => {
        if (
            ! values.enable ||
            ( device === 'mobile' && ! values.mobile_view )
        ) {
            return null;
        }

        /**
         * Filters the Sales Notification preview, e.g. for pro to add its
         * parts.
         *
         * @since SPSG_VERSION
         *
         * @param {JSX.Element}    popup  The preview popup.
         * @param {SalesPopValues} values Current (unsaved) settings.
         */
        return applyFilters(
            'storegrowth.preview.sales-pop',
            <SalesPopToast
                values={ shownValues( settings ) }
                sample={ sample }
                isPro={ isPro() }
                floating
            />,
            values
        ) as ReactNode;
    };

    return (
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
    );
};

/**
 * The template picker: each template drawn as the popup itself. Picking one
 * also sets its radii, where they can be edited.
 *
 * @param props          Props.
 * @param props.settings Module settings.
 */
const SalesPopTemplates = ( { settings }: { settings: Settings } ) => {
    const { values, setValues, isLocked } = settings;
    const sample = useSample( values );

    return (
        <TemplatePicker
            columns={ 2 }
            templates={ templateOptions( values, sample, isPro() ) }
            value={ values.template }
            onSelect={ ( id ) => {
                setValues( {
                    template: id as SalesPopValues[ 'template' ],
                    ...( isLocked( 'popup_border_radius' )
                        ? {}
                        : templateRadii( id ) ),
                } );
            } }
            locked={ isLocked( 'template' ) }
        />
    );
};

const salesPopPage: SettingsPageParts< SalesPopValues > = {
    preview: ( settings ) => {
        return <SalesPopPreview settings={ settings } />;
    },

    controls: ( settings ) => {
        const { values, schema, errors, setValue, isLocked } = settings;
        const shown = shownValues( settings );

        // Label, help and state of a field, from its schema.
        const bind = ( key: SalesPopKey ) => {
            return {
                label: schema[ key ]?.label,
                help: schema[ key ]?.help,
                locked: isLocked( key ),
                error: errors[ key ],
            };
        };

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

            try {
                const products = await fetchSourceProducts(
                    source === '0' ? 'orders' : 'best_sellers',
                    Math.min( count || 5, 100 )
                );
                setValue(
                    'popup_products',
                    products.map( ( product ) => {
                        return product.id;
                    } )
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

        // Lite shows the template's radius (see `shownValues`).
        const radius = ( key: SalesPopKey ) => {
            return (
                <NumberField
                    { ...bind( key ) }
                    suffix={ schema[ key ]?.suffix }
                    value={ shown[ key ] as number }
                    min={ schema[ key ]?.min }
                    max={ schema[ key ]?.max }
                    onChange={ ( next ) => {
                        setValue( key, next );
                    } }
                />
            );
        };

        // One row per line of copy: colour, size and weight.
        const textRow = ( row: TextRow ) => {
            const color = TEXT_ROWS[ row ];

            return (
                <TextStyleRow
                    label={ schema[ color ]?.label ?? row }
                    color={ values[ color ] as string }
                    size={ values[ `${ row }_font_size` ] as number }
                    weight={ values[ `${ row }_font_weight` ] as string }
                    weights={ WEIGHTS }
                    locked={ isLocked( color ) }
                    onChange={ ( part, next ) => {
                        if ( part === 'color' ) {
                            setValue( color, next );
                        } else if ( part === 'size' ) {
                            setValue( `${ row }_font_size`, Number( next ) );
                        } else {
                            setValue( `${ row }_font_weight`, next );
                        }
                    } }
                />
            );
        };

        const rows = Object.keys( TEXT_ROWS ) as TextRow[];

        return {
            product_source: (
                <SelectField
                    { ...bind( 'product_source' ) }
                    value={ values.product_source }
                    options={ SOURCES.map( ( value ) => {
                        return {
                            value,
                            label:
                                schema.product_source?.labels?.[ value ] ??
                                value,
                        };
                    } ) }
                    onChange={ ( next ) => {
                        const source =
                            next as SalesPopValues[ 'product_source' ];
                        setValue( 'product_source', source );
                        fillFromSource( source, values.number_of_orders );
                    } }
                />
            ),
            number_of_orders: (
                <NumberField
                    { ...bind( 'number_of_orders' ) }
                    value={ values.number_of_orders }
                    min={ schema.number_of_orders?.min }
                    onChange={ ( next ) => {
                        setValue( 'number_of_orders', next );
                        fillFromSource( values.product_source, next );
                    } }
                />
            ),
            popup_products: (
                <MultiSelectField
                    { ...bind( 'popup_products' ) }
                    value={ values.popup_products }
                    onChange={ ( next ) => {
                        setValue( 'popup_products', next as number[] );
                    } }
                    onSearch={ ( search ) => {
                        return searchProducts( search ).then( toOptions );
                    } }
                    resolve={ ( ids ) => {
                        return fetchProductsByIds( ids as number[] ).then(
                            toOptions
                        );
                    } }
                    // Lite caps products picked by hand at 5 (as the old
                    // admin did).
                    max={
                        values.product_source === '1' && ! isPro()
                            ? 5
                            : undefined
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
                />
            ),
            virtual_name: (
                <ListTextarea
                    { ...bind( 'virtual_name' ) }
                    value={ values.virtual_name }
                    separator=","
                    placeholder={ schema.virtual_name?.placeholder }
                    onChange={ ( next ) => {
                        setValue( 'virtual_name', next );
                    } }
                />
            ),
            virtual_locations: (
                <ListTextarea
                    { ...bind( 'virtual_locations' ) }
                    value={ values.virtual_locations }
                    separator={ '\n' }
                    onChange={ ( next ) => {
                        setValue( 'virtual_locations', next );
                    } }
                />
            ),
            message_popup: (
                <TextareaField
                    { ...bind( 'message_popup' ) }
                    value={ values.message_popup }
                    rows={ schema.message_popup?.rows }
                    onChange={ ( next ) => {
                        setValue( 'message_popup', next );
                    } }
                    help={
                        <span className="flex flex-col gap-0.5">
                            { TOKENS.map( ( [ token, meaning ] ) => {
                                return (
                                    <span key={ token }>
                                        <code>{ token }</code> = { meaning }
                                    </span>
                                );
                            } ) }
                        </span>
                    }
                />
            ),
            template: <SalesPopTemplates settings={ settings } />,
            popup_image_border_radius: radius( 'popup_image_border_radius' ),
            popup_border_radius: radius( 'popup_border_radius' ),
            // The column header sits above the first row.
            ...Object.fromEntries(
                rows.map( ( row, index ) => {
                    return [
                        TEXT_ROWS[ row ],
                        <>
                            { index === 0 && <TextStyleHeader /> }
                            { textRow( row ) }
                        </>,
                    ];
                } )
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/sales-pop',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'sales-pop' !== moduleId ) {
            return parts;
        }

        return salesPopPage as SettingsPageParts;
    }
);
