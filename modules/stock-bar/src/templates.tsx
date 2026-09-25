/**
 * Stock Bar template presets (design Design → Template: Blue, Green,
 * Violet). The stored ids stay the existing `stock_bar_one/two/three`; a
 * preset writes the track ("Foreground") and fill ("Bar") colours.
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import type { TemplateOption } from '@storegrowth/components';

import type { StockBarValues } from './types';

export interface StockBarPreset {
    id: StockBarValues[ 'stockbar_template' ];
    label: string;
    /** Track colour (`stockbar_bg_color`). */
    track: string;
    /** Fill colour (`stockbar_fg_color`). */
    fill: string;
}

/** Palettes from the design's three template rows. */
export const PRESETS: StockBarPreset[] = [
    {
        id: 'stock_bar_one',
        label: __( 'Blue template', 'storegrowth-sales-booster' ),
        track: '#e3f2fd',
        fill: '#2ba5f0',
    },
    {
        id: 'stock_bar_two',
        label: __( 'Green template', 'storegrowth-sales-booster' ),
        track: '#e6f4ea',
        fill: '#16a34a',
    },
    {
        id: 'stock_bar_three',
        label: __( 'Violet template', 'storegrowth-sales-booster' ),
        track: '#efeff2',
        fill: '#8b5cf6',
    },
];

/**
 * Picker options: each preset drawn as a miniature stock bar (design
 * `.sb-tpl-*`).
 *
 * @since SPSG_VERSION
 */
export function templateOptions(): TemplateOption[] {
    return PRESETS.map( ( preset ) => ( {
        id: preset.id,
        label: preset.label,
        preview: (
            <>
                <span className="flex items-center justify-between text-[10px] text-sg-text">
                    <span>
                        { __( 'Total Sold', 'storegrowth-sales-booster' ) }:{ ' ' }
                        <b>247</b>
                    </span>
                    <span>
                        { __( 'Available Item', 'storegrowth-sales-booster' ) }:{ ' ' }
                        <b>123</b>
                    </span>
                </span>
                <span
                    className="block h-2 w-full overflow-hidden rounded-full"
                    style={ { background: preset.track } }
                >
                    <span
                        className="block h-full w-[63%] rounded-full"
                        style={ { background: preset.fill } }
                    />
                </span>
                <span className="text-left text-[10px] text-sg-text">
                    { __(
                        'Hurry! only {quantity} stocks left.',
                        'storegrowth-sales-booster'
                    ) }
                </span>
            </>
        ),
    } ) );
}
