<?php
/**
 * All necessary custom functions will be here.
 *
 * @package WPBP
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'sgsb_assets_url' ) ) {
	/**
	 * Get plugin assets url.
	 *
	 * @param string $path Plugin path.
	 */
	function sgsb_assets_url( $path ) {
		return STOREGROWTH_PLUGIN_DIR_URL . 'assets/' . $path;
	}
}

if ( ! function_exists( 'sgsb_modules_url' ) ) {
	/**
	 * Get Modules url.
	 *
	 * @param string $path Module internal path.
	 */
	function sgsb_modules_url( $path ) {
		return STOREGROWTH_PLUGIN_DIR_URL . 'Includes/Modules/' . $path;
	}
}

if ( ! function_exists( 'sgsb_modules_path' ) ) {
	/**
	 * Get Modules path.
	 *
	 * @param string $path Module internal path.
	 */
	function sgsb_modules_path( $path ) {
		return STOREGROWTH_PLUGIN_DIR_PATH . 'Includes/Modules/' . $path;
	}
}

if ( ! function_exists( 'sgsb_plugin_path' ) ) {
	/**
	 * Get plugin file path.
	 *
	 * @param string $path Plugin path.
	 */
	function sgsb_plugin_path( $path ) {
		return STOREGROWTH_PLUGIN_DIR_PATH . $path;
	}
}

if ( ! function_exists( 'sgsb_get_file_content' ) ) {
	/**
	 * Get plugin file path.
	 *
	 * @param string $path Plugin path.
	 */
	function sgsb_get_file_content( $path ) {
		ob_start();

		require STOREGROWTH_PLUGIN_DIR_PATH . $path;

		return ob_get_clean();
	}
}

if ( ! function_exists( 'sgsb_find_option_setting' ) ) {
	/**
	 * Find a settings value from array.
	 *
	 * @param array  $settings WP option array.
	 * @param string $key Key from option array.
	 * @param string $default1 Default value.
	 */
	function sgsb_find_option_setting( $settings, $key, $default1 = '' ) {
		if ( isset( $settings[ $key ] ) ) {
			return $settings[ $key ];
		}

		return $default1;
	}
}

if ( ! function_exists( 'sgsb_sanitize_form_fields' ) ) {
	/**
	 * Sanitize form text fields.
	 *
	 * @param string $value User input.
	 */
	function sgsb_sanitize_form_fields( $value ) {
		$value = sanitize_text_field( $value );

		if ( 'true' === $value ) {
			return true;
		}

		if ( 'false' === $value ) {
			return false;
		}

		return $value;
	}
}

if ( ! function_exists( 'sgsb_sanitize_svg_icon_fields' ) ) {
	/**
	 * Sanitize form SVG field xml.
	 *
	 * @param string $value SVG string.
	 */
	function sgsb_sanitize_svg_icon_fields( $value ) {
		$icon_allowed_html = array(
			'svg'  => array(
				'viewbox' => true,
				'height'  => true,
				'width'   => true,
			),
			'path' => array(
				'd' => true,
			),
			'g'    => array(),
		);

		return wp_kses( $value, $icon_allowed_html );
	}
}

if ( ! function_exists( 'sgsb_get_day_for_schedule' ) ) {
	/**
	 * Sanitize form SVG field xml.
	 *
	 * @since 1.0.2
	 *
	 * @return array
	 */
	function sgsb_get_day_for_schedule() {
		return array(
			'daily'     => __( 'Daily', 'storegrowth-sales-booster' ),
			'saturday'  => __( 'Saturday', 'storegrowth-sales-booster' ),
			'sunday'    => __( 'Sunday', 'storegrowth-sales-booster' ),
			'monday'    => __( 'Monday', 'storegrowth-sales-booster' ),
			'tuesday'   => __( 'Tuesday', 'storegrowth-sales-booster' ),
			'wednesday' => __( 'Wednesday', 'storegrowth-sales-booster' ),
			'thursday'  => __( 'Thursday', 'storegrowth-sales-booster' ),
			'friday'    => __( 'Friday', 'storegrowth-sales-booster' ),
		);
	}
}
