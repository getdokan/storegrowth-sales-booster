/**
 * Sales Notification templates (design Design → Template, 2×2): each drawn
 * as the storefront popup itself, at thumbnail size, with its own radii.
 * Stored as `template` 1–4.
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import type { TemplateOption } from '@storegrowth/components';

import { templateRadii } from './data';
import { SalesPopToast, type ToastSample } from './preview/sales-pop-toast';
import type { SalesPopValues } from './types';

/** Design order: rounded photo, bag icon, sharp photo, avatar. */
const TEMPLATES: Array< { id: SalesPopValues[ 'template' ]; label: string } > =
    [
        {
            id: '4',
            label: __( 'Rounded photo template', 'storegrowth-sales-booster' ),
        },
        {
            id: '2',
            label: __( 'Bag icon template', 'storegrowth-sales-booster' ),
        },
        {
            id: '3',
            label: __( 'Sharp photo template', 'storegrowth-sales-booster' ),
        },
        {
            id: '1',
            label: __( 'Round image template', 'storegrowth-sales-booster' ),
        },
    ];

/** Thumbnail size: the popup at about half its size. */
const THUMBNAIL: Partial< SalesPopValues > = {
    popup_width: 260,
    popup_image_width: 44,
    spacing_around_image: 6,
    show_close_button: true,
    background_color: '#ffffff',
    normal_text_font_size: 8,
    name_text_font_size: 8,
    product_title_font_size: 11,
    time_text_font_size: 8,
    country_text_font_size: 8,
    state_text_font_size: 8,
    city_text_font_size: 8,
};

/**
 * Picker options.
 *
 * @since SPSG_VERSION
 *
 * @param values Current settings (colours and message come from them).
 * @param sample What the preview shows.
 * @param isPro  Pro is active.
 */
export function templateOptions(
    values: SalesPopValues,
    sample: ToastSample,
    isPro: boolean
): TemplateOption[] {
    return TEMPLATES.map( ( template ) => ( {
        id: template.id,
        label: template.label,
        preview: (
            <SalesPopToast
                values={ {
                    ...values,
                    ...THUMBNAIL,
                    ...templateRadii( template.id ),
                    template: template.id,
                } }
                sample={ sample }
                isPro={ isPro }
            />
        ),
    } ) );
}
