<?php
/**
 * This css is for styling popup message
 *
 * @package Popup style
 */

// Main popup div style.
$main_div_width         = $popup_properties['popup_width'];
$main_div_width         = $main_div_width ? $main_div_width : 400;
$main_div_height        = $main_div_width * 20 / 100;
$main_div_border_radius = $popup_properties['popup_border_radius'] ? $popup_properties['popup_border_radius'] : 0;
$main_div_background    = $popup_properties['background_color'] ? $popup_properties['background_color'] : 'white';
$main_div_style         = 'width: ' . $main_div_width . 'px; border-radius: ' . $main_div_border_radius . 'px; background: ' . $main_div_background;

// Normal Text style.
$normal_text_color       = $popup_properties['normal_text_color'];
$normal_text_font_size   = $popup_properties['normal_text_font_size'] . 'px';
$normal_text_font_weight = $popup_properties['normal_text_font_weight'];
$normal_text_style       = "color:$normal_text_color;font-size:$normal_text_font_size;font-weight:$normal_text_font_weight";

// First name style.
$name_color       = $popup_properties['name_text_color'];
$name_font_size   = $popup_properties['name_text_font_size'] . 'px';
$name_font_weight = $popup_properties['name_text_font_weight'];
$name_style       = "color:$name_color;font-size:$name_font_size;font-weight:$name_font_weight";

// Image style.
$image_width         = $popup_properties['popup_image_width'];
$image_width         = $image_width ? $image_width : 100;
$image_border_radius = $popup_properties['popup_image_border_radius'] ? $popup_properties['popup_image_border_radius'] : 0;
$image_style         = "width:{$image_width}px; border-radius:$image_border_radius" . 'px';

// Time style.
$time_color       = $popup_properties['time_text_color'];
$time_font_size   = $popup_properties['time_text_font_size'] . 'px';
$time_font_weight = $popup_properties['time_text_font_weight'];
$time_style       = "color:$time_color;font-size:$time_font_size;font-weight:$time_font_weight";

// Image spacing.
$image_spacing = $popup_properties['spacing_around_image'];
