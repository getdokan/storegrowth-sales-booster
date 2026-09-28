/**
 * Countdown Timer admin bundle (`modules/countdown-timer/assets/js/admin.js`),
 * loaded on the StoreGrowth admin page before the app mounts. The app draws
 * the Countdown Timer settings page (design `countdown-timer.html`) from the
 * schema (PHP `CountdownTimerSettings`: page, tabs, sections, fields) at
 * `#/settings?module=countdown-timer`; this adds the live, ticking
 * product-page preview, the template picker and the counter colour fields.
 *
 * @since SPSG_VERSION
 */
import { addFilter, applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
import {
    ColorField,
    LivePreview,
    type SettingsPageParts,
    TemplatePicker,
} from '@storegrowth/components';
import { type ModuleSettings, usePreviewFont } from '@storegrowth/hooks';

import { counterColors, fontFamily } from './data';
import { CountdownPreview } from './preview/countdown-widget';
import { PRESETS, presetValues, templateOptions } from './templates';
import {
    type CountdownKey,
    type CountdownTimerValues,
    DIGIT_KEYS,
} from './types';

/** Preview root font size per device; every widget size follows it. */
const PREVIEW_FONT_SIZE = { desktop: 12, tablet: 12, mobile: 9 };

/** Counter colours the page draws (besides the digits' one field). */
const COUNTER_COLOR_KEYS: CountdownKey[] = [
    'counter_label_color',
    'counter_separator_color',
    'counter_background_color',
    'counter_border_color',
];

/**
 * Settings as the storefront applies them: in lite the counter colours need
 * pro and the storefront draws the template's, so the preview and the locked
 * swatches show those.
 *
 * @param settings Module settings.
 */
const shownValues = (
    settings: ModuleSettings< CountdownTimerValues >
): CountdownTimerValues => {
    const { values, isLocked } = settings;

    if ( ! isLocked( 'counter_background_color' ) ) {
        return values;
    }

    return {
        ...values,
        ...counterColors( values.selected_theme ),
    } as CountdownTimerValues;
};

/**
 * The live preview, with the chosen fonts loaded.
 *
 * @param props          Props.
 * @param props.settings Module settings.
 */
const CountdownTimerPreview = ( {
    settings,
}: {
    settings: ModuleSettings< CountdownTimerValues >;
} ) => {
    const { values, isLocked } = settings;
    const shown = shownValues( settings );

    usePreviewFont( fontFamily( values.font_family ?? '' ) );
    usePreviewFont( fontFamily( values.counter_font_family ?? '' ) );

    const visible =
        values.product_page_countdown_enable ||
        ( values.shop_page_countdown_enable &&
            ! isLocked( 'shop_page_countdown_enable' ) );

    return (
        <LivePreview
            widget={ ( { device } ) => {
                if ( ! visible ) {
                    return (
                        <p className="w-full rounded-[8px] border border-dashed border-[#D4D4D4] px-4 py-6 text-center text-[12px] leading-[1.4] text-sg-help">
                            { __(
                                'Not shown on any page. Turn on Shop or Product page display.',
                                'storegrowth-sales-booster'
                            ) }
                        </p>
                    );
                }

                /**
                 * Filters the Countdown Timer preview widget, e.g. for pro to
                 * add its parts.
                 *
                 * @since SPSG_VERSION
                 *
                 * @param {JSX.Element}          widget The preview widget.
                 * @param {CountdownTimerValues} values Current (unsaved) settings.
                 */
                return applyFilters(
                    'storegrowth.preview.countdown-timer',
                    <CountdownPreview
                        values={ shown }
                        fontSize={ PREVIEW_FONT_SIZE[ device ] }
                    />,
                    values
                ) as ReactNode;
            } }
        />
    );
};

const countdownTimerPage: SettingsPageParts< CountdownTimerValues > = {
    preview: ( settings ) => {
        return <CountdownTimerPreview settings={ settings } />;
    },

    controls: ( settings ) => {
        const { values, schema, errors, setValue, setValues, isLocked } =
            settings;
        const shown = shownValues( settings );

        // Shows the template's colour while locked (see `shownValues`).
        const color = ( key: CountdownKey ) => {
            return (
                <ColorField
                    label={ schema[ key ]?.label }
                    help={ schema[ key ]?.help }
                    value={ String( shown[ key ] ) }
                    onChange={ ( value ) => {
                        setValue( key, value );
                    } }
                    locked={ isLocked( key ) }
                    error={ errors[ key ] }
                />
            );
        };

        // A preset fills the colour fields it can (in lite, not the counter's).
        const presetFields = ( id: string ) => {
            return Object.fromEntries(
                Object.entries( presetValues( id ) ).filter( ( [ key ] ) => {
                    return ! isLocked( key );
                } )
            ) as Partial< CountdownTimerValues >;
        };

        // Highlight a preset only while the colours are still its colours.
        const activePreset =
            PRESETS.find( ( preset ) => {
                return Object.entries( presetFields( preset.id ) ).every(
                    ( [ key, value ] ) => {
                        return (
                            String( values[ key ] ).toLowerCase() ===
                            String( value ).toLowerCase()
                        );
                    }
                );
            } )?.id ?? '';

        return {
            // One "Digit Text Color" field writes the four per-unit keys.
            day_text_color: (
                <ColorField
                    label={ schema.day_text_color?.label }
                    value={ shown.day_text_color }
                    onChange={ ( value ) => {
                        setValues(
                            Object.fromEntries(
                                DIGIT_KEYS.map( ( key ) => {
                                    return [ key, value ];
                                } )
                            )
                        );
                    } }
                    locked={ isLocked( 'day_text_color' ) }
                    error={ errors.day_text_color }
                />
            ),
            ...Object.fromEntries(
                COUNTER_COLOR_KEYS.map( ( key ) => {
                    return [ key, color( key ) ];
                } )
            ),
            selected_theme: (
                <TemplatePicker
                    columns={ 2 }
                    templates={ templateOptions( values ) }
                    value={ activePreset }
                    onSelect={ ( id ) => {
                        setValues( presetFields( id ) );
                    } }
                    locked={ isLocked( 'selected_theme' ) }
                />
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/countdown-timer',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'countdown-timer' !== moduleId ) {
            return parts;
        }

        return countdownTimerPage as SettingsPageParts;
    }
);
