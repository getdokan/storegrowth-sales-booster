/**
 * Stock Bar admin bundle (`modules/stock-bar/assets/js/admin.js`), loaded on
 * the StoreGrowth admin page before the app mounts. The app draws the Stock
 * Bar settings page (design `stock-bar.html`) from the schema (PHP
 * `StockBarSettings`: page, tabs, sections, fields) at
 * `#/settings?module=stock-bar`; this adds the live product-page preview and
 * the template picker.
 *
 * @since SPSG_VERSION
 */
import { addFilter, applyFilters } from '@wordpress/hooks';
import type { ReactNode } from 'react';
import {
    LivePreview,
    type SettingsPageParts,
    TemplatePicker,
} from '@storegrowth/components';

import { StockBarWidget } from './preview/stock-bar-widget';
import { PRESETS, templateOptions } from './templates';
import type { StockBarValues } from './types';

const stockBarPage: SettingsPageParts< StockBarValues > = {
    preview: ( { values } ) => {
        return (
            <LivePreview
                widget={
                    /**
                     * Filters the Stock Bar preview widget, e.g. for pro to
                     * add its parts.
                     *
                     * @since SPSG_VERSION
                     *
                     * @param {JSX.Element}    widget The preview widget.
                     * @param {StockBarValues} values Current (unsaved) settings.
                     */
                    applyFilters(
                        'storegrowth.preview.stock-bar',
                        <StockBarWidget values={ values } />,
                        values
                    ) as ReactNode
                }
            />
        );
    },

    controls: ( { values, setValues, isLocked } ) => {
        // A preset sets both bar colours, in lite too (the Bar Color field
        // itself needs pro).
        const applyPreset = ( id: string ) => {
            const preset = PRESETS.find( ( item ) => {
                return item.id === id;
            } );

            if ( preset ) {
                setValues( {
                    stockbar_template: preset.id,
                    stockbar_bg_color: preset.track,
                    stockbar_fg_color: preset.fill,
                } );
            }
        };

        // Highlight a preset only while the colours are still its colours.
        const activePreset =
            PRESETS.find( ( preset ) => {
                return (
                    preset.id === values.stockbar_template &&
                    preset.track === values.stockbar_bg_color.toLowerCase() &&
                    preset.fill === values.stockbar_fg_color.toLowerCase()
                );
            } )?.id ?? '';

        return {
            stockbar_template: (
                <TemplatePicker
                    templates={ templateOptions() }
                    value={ activePreset }
                    onSelect={ applyPreset }
                    locked={ isLocked( 'stockbar_template' ) }
                />
            ),
        };
    },
};

addFilter(
    'storegrowth.settings.page',
    'storegrowth/stock-bar',
    ( parts: SettingsPageParts, moduleId: string ) => {
        if ( 'stock-bar' !== moduleId ) {
            return parts;
        }

        return stockBarPage as SettingsPageParts;
    }
);
