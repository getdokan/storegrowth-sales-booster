/**
 * Countdown Timer templates (design Design → Select Template). A template is
 * a preset: it fills the colour fields, which stay editable. Stored as
 * `selected_theme`; the two old layouts stay valid ids. The colours come from
 * PHP (`data.ts`); only the names and sample headings live here.
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import type { TemplateOption } from '@storegrowth/components';

import { templateColors } from './data';
import { CountdownWidget } from './preview/countdown-widget';
import type { CountdownTimerValues } from './types';

export interface CountdownPreset {
    id: string;
    label: string;
    /** Heading on the thumbnail. */
    sample: string;
}

/** The design's six templates. */
export const PRESETS: CountdownPreset[] = [
    {
        id: 'ct-blue',
        label: __( 'Blue template', 'storegrowth-sales-booster' ),
        sample: __( '50% OFF', 'storegrowth-sales-booster' ),
    },
    {
        id: 'ct-dark',
        label: __( 'Dark template', 'storegrowth-sales-booster' ),
        sample: __( 'Flash Sale', 'storegrowth-sales-booster' ),
    },
    {
        id: 'ct-red',
        label: __( 'Red template', 'storegrowth-sales-booster' ),
        sample: __( 'Limited Time', 'storegrowth-sales-booster' ),
    },
    {
        id: 'ct-gray',
        label: __( 'Gray template', 'storegrowth-sales-booster' ),
        sample: __( 'Ends In', 'storegrowth-sales-booster' ),
    },
    {
        id: 'ct-cyan',
        label: __( 'Cyan template', 'storegrowth-sales-booster' ),
        sample: __( 'MEGA DEAL', 'storegrowth-sales-booster' ),
    },
    {
        id: 'ct-orange',
        label: __( 'Orange template', 'storegrowth-sales-booster' ),
        sample: __( 'Special Offer', 'storegrowth-sales-booster' ),
    },
];

/**
 * The fields a preset writes.
 *
 * @since SPSG_VERSION
 *
 * @param id Template id.
 */
export function presetValues( id: string ): Partial< CountdownTimerValues > {
    return { ...templateColors( id ), selected_theme: id };
}

/** Thumbnail look (design): fixed type and spacing, the preset's colours. */
const THUMBNAIL: Partial< CountdownTimerValues > = {
    font_family: 'inter',
    heading_font_weight: '600',
    heading_letter_spacing: 0,
    heading_line_height: 14,
    widget_radius: 9,
    widget_alignment: 'center',
    widget_margin: { top: 0, right: 0, bottom: 0, left: 0 },
    widget_padding: { top: 13, right: 15, bottom: 13, left: 15 },
    counter_font_family: 'inter',
    counter_font_weight: '500',
    counter_letter_spacing: 0,
    counter_radius: 5,
    counter_alignment: 'center',
    counter_margin: { top: 0, right: 0, bottom: 0, left: 0 },
    counter_padding: { top: 5, right: 7, bottom: 5, left: 7 },
};

/**
 * Picker options: each preset drawn as the widget itself, at thumbnail size.
 *
 * @since SPSG_VERSION
 *
 * @param values Current settings (the thumbnails take everything else from the preset).
 */
export function templateOptions(
    values: CountdownTimerValues
): TemplateOption[] {
    return PRESETS.map( ( preset ) => ( {
        id: preset.id,
        label: preset.label,
        preview: (
            <CountdownWidget
                values={
                    {
                        ...values,
                        ...THUMBNAIL,
                        ...presetValues( preset.id ),
                        countdown_heading: preset.sample,
                    } as CountdownTimerValues
                }
                fontSize={ 7.5 }
            />
        ),
    } ) );
}
