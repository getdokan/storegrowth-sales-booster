<?php
/**
 * This css is for styling popup message
 *
 * The values go into `style=""` attributes: numbers are numeric (the
 * settings fill invalid ones with defaults), colours and weights are
 * sanitized for the CSS context here.
 *
 * @package Popup style
 */

use StorePulse\StoreGrowth\Helper as PluginHelper;

$css_color  = static function ( $value, string $fallback ): string {
	return PluginHelper::sanitize_css_color( $value, $fallback );
};
$css_weight = static function ( $value ): int {
	return absint( $value ) ? absint( $value ) : 400;
};

// Main popup div style.
$main_div_width         = (float) $popup_properties['popup_width'];
$main_div_width         = $main_div_width ? $main_div_width : 400;
$main_div_height        = $main_div_width * 20 / 100;
$main_div_border_radius = (float) $popup_properties['popup_border_radius'];
$main_div_background    = $css_color( $popup_properties['background_color'], 'white' );
$main_div_style         = 'width: ' . $main_div_width . 'px; border-radius: ' . $main_div_border_radius . 'px; background: ' . $main_div_background;

// Normal Text style.
$normal_text_color       = $css_color( $popup_properties['normal_text_color'], '#1B1B50' );
$normal_text_font_size   = (float) $popup_properties['normal_text_font_size'] . 'px';
$normal_text_font_weight = $css_weight( $popup_properties['normal_text_font_weight'] );
$normal_text_style       = "color:$normal_text_color;font-size:$normal_text_font_size;font-weight:$normal_text_font_weight";

// First name style.
$name_color       = $css_color( $popup_properties['name_text_color'], '#000000' );
$name_font_size   = (float) $popup_properties['name_text_font_size'] . 'px';
$name_font_weight = $css_weight( $popup_properties['name_text_font_weight'] );
$name_style       = "color:$name_color;font-size:$name_font_size;font-weight:$name_font_weight";

// Product title style.
$product_title_color = $css_color( $popup_properties['product_title_color'], '#1B1B50' );
$product_title_size  = (float) $popup_properties['product_title_font_size'];

// Image style.
$image_width         = (float) $popup_properties['popup_image_width'];
$image_width         = $image_width ? $image_width : 100;
$image_border_radius = (float) $popup_properties['popup_image_border_radius'];
$image_style         = "width:{$image_width}px; border-radius:$image_border_radius" . 'px';

// Time style.
$time_color       = $css_color( $popup_properties['time_text_color'], '#989FAB' );
$time_font_size   = (float) $popup_properties['time_text_font_size'] . 'px';
$time_font_weight = $css_weight( $popup_properties['time_text_font_weight'] );
$time_style       = "color:$time_color;font-size:$time_font_size;font-weight:$time_font_weight";

// Image spacing.
$image_spacing = (float) $popup_properties['spacing_around_image'];
