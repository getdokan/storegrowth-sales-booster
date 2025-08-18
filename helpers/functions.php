<?php
/**
 * All necessary custom functions will be here.
 *
 * @package WPBP
 */

use STOREGROWTH\SPSB\Helper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'sgsb_assets_url' ) ) {
	/**
	 * Get plugin assets url.
	 *
	 * @deprecated Use Helper::get_plugin_assets_url() instead.
	 * @param string $path Plugin path.
	 */
	function sgsb_assets_url( $path ) {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::get_plugin_assets_url()' );
        return Helper::get_plugin_assets_url( $path );
	}
}

if ( ! function_exists( 'sgsb_modules_url' ) ) {
	/**
	 * Get Modules url.
	 *
	 * @deprecated Use Helper::get_modules_url() instead.
	 * @param string $path Module internal path.
	 */
	function sgsb_modules_url( $path ) {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::get_modules_url()' );
		return Helper::get_modules_url( $path );
	}
}

if ( ! function_exists( 'sgsb_modules_path' ) ) {
	/**
	 * Get Modules path.
	 *
	 * @deprecated Use Helper::get_modules_path() instead.
	 * @param string $path Module internal path.
	 */
	function sgsb_modules_path( $path ) {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::get_modules_path()' );
		return Helper::get_modules_path( $path );
	}
}

if ( ! function_exists( 'sgsb_plugin_path' ) ) {
	/**
	 * Get plugin file path.
	 *
	 * @deprecated Use Helper::get_plugin_path() instead.
	 * @param string $path Plugin path.
	 */
	function sgsb_plugin_path( $path ) {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::get_plugin_path()' );
		return Helper::get_plugin_path( $path );
	}
}

if ( ! function_exists( 'sgsb_get_file_content' ) ) {
	/**
	 * Get plugin file path.
	 *
	 * @deprecated Use Helper::get_file_content() instead.
	 * @param string $path Plugin path.
	 */
	function sgsb_get_file_content( $path ) {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::get_file_content()' );
		return Helper::get_file_content( $path );
	}
}

if ( ! function_exists( 'sgsb_find_option_setting' ) ) {
	/**
	 * Find a settings value from array.
	 *
	 * @deprecated Use Helper::find_option_settings() instead.
	 * @param array  $settings WP option array.
	 * @param string $key Key from option array.
	 * @param string $default1 Default value.
	 */
	function sgsb_find_option_setting( $settings, $key, $default1 = '' ) {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::find_option_settings()' );
		return Helper::find_option_settings( $settings, $key, $default1 );
	}
}

if ( ! function_exists( 'sgsb_sanitize_form_fields' ) ) {
	/**
	 * Sanitize form text fields.
	 *
	 * @deprecated Use Helper::sanitize_form_fields() instead.
	 * @param string $value User input.
	 */
	function sgsb_sanitize_form_fields( $value ) {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::sanitize_form_fields()' );
		return Helper::sanitize_form_fields( $value );
	}
}

if ( ! function_exists( 'sgsb_sanitize_svg_icon_fields' ) ) {
	/**
	 * Sanitize form SVG field xml.
	 *
	 * @deprecated Use Helper::sanitize_svg_icon_fields() instead.
	 * @param string $value SVG string.
	 */
	function sgsb_sanitize_svg_icon_fields( $value ) {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::sanitize_svg_icon_fields()' );
		return Helper::sanitize_svg_icon_fields( $value );
	}
}

if ( ! function_exists( 'sgsb_get_day_for_schedule' ) ) {
	/**
	 * Get days for schedule.
	 *
	 * @since 1.0.2
	 * @deprecated Use Helper::get_days_for_schedule() instead.
	 *
	 * @return array
	 */
	function sgsb_get_day_for_schedule() {
		_deprecated_function( __FUNCTION__, '1.5.0', 'Helper::get_days_for_schedule()' );
		return Helper::get_days_for_schedule();
	}
}