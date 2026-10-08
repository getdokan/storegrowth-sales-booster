/**
 * Countdown Timer settings as the settings API returns them
 * (`sales-booster/v1/settings/countdown-timer`, PHP `CountdownTimerSettings`).
 *
 * @since SPSG_VERSION
 */
import type { Alignment } from '@storegrowth/components';
import type { BoxValue, SettingValue } from '@storegrowth/utilities';

export interface CountdownTimerValues extends Record< string, SettingValue > {
    // Configure.
    countdown_heading: string;
    shop_page_countdown_enable: boolean;
    product_page_countdown_enable: boolean;

    // Design → Heading.
    font_family: string;
    heading_font_weight: string;
    heading_letter_spacing: number;
    heading_line_height: number;
    heading_text_color: string;

    // Design → Container and Layout.
    widget_background_color: string;
    border_color: string;
    widget_radius: number;
    widget_alignment: Alignment;
    widget_margin: BoxValue;
    widget_padding: BoxValue;

    // Design → Counter/Timer (Box).
    day_text_color: string;
    hour_text_color: string;
    minute_text_color: string;
    second_text_color: string;
    counter_label_color: string;
    counter_separator_color: string;
    counter_background_color: string;
    counter_border_color: string;
    counter_radius: number;
    counter_alignment: Alignment;
    counter_margin: BoxValue;
    counter_padding: BoxValue;

    // Design → Counter Text.
    counter_font_family: string;
    counter_font_weight: string;
    counter_letter_spacing: number;

    // Design → Select Template.
    selected_theme: string;
}

export type CountdownKey = keyof CountdownTimerValues;

/** The one "Digit Text Color" field writes all four (pro's filter reads them). */
export const DIGIT_KEYS: CountdownKey[] = [
    'day_text_color',
    'hour_text_color',
    'minute_text_color',
    'second_text_color',
];
