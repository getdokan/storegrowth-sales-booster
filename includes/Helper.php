<?php

namespace STOREGROWTH\SPSB;

defined( 'ABSPATH' ) || exit;

/**
 * Helper Class.
 *
 * @since 2.0.0
 */
class Helper {

	/**
	 * Get Plugin Assets URL.
	 *
	 * @since 2.0.0
	 *
	 * @param string $path Plugin path.
	 *
	 * @return string
	 */
	public static function get_plugin_assets_url( string $path ): string {
		return STOREGROWTH_PLUGIN_DIR_URL . 'assets/' . $path;
	}

	/**
	 * Get Modules URL.
	 *
	 * @since 2.0.0
	 *
	 * @param string $path Module internal path.
	 *
	 * @return string
	 */
	public static function get_modules_url( string $path ): string {
		return STOREGROWTH_PLUGIN_DIR_URL . 'modules/' . $path;
	}

	/**
	 * Get Modules Path.
	 *
	 * @since 2.0.0
	 *
	 * @param string $path Module internal path.
	 *
	 * @return string
	 */
	public static function get_modules_path( string $path ): string {
		return STOREGROWTH_PLUGIN_DIR_PATH . 'modules/' . $path;
	}

	/**
	 * Get Plugin File Path.
	 *
	 * @since 2.0.0
	 *
	 * @param string $path Plugin path.
	 *
	 * @return string
	 */
	public static function get_plugin_path( string $path ): string {
		return STOREGROWTH_PLUGIN_DIR_PATH . $path;
	}

	/**
	 * Get Plugin File Content.
	 *
	 * @since 2.0.0
	 *
	 * @param string $path Plugin path.
	 *
	 * @return string
	 */
	public static function get_file_content( string $path ): string {
		ob_start();

		require STOREGROWTH_PLUGIN_DIR_PATH . $path;

		return ob_get_clean();
	}

	/**
	 * Find Options Settings Value.
	 *
	 * @since 2.0.0
	 *
	 * @param array $settings WP option array.
	 * @param string $key      Key from option array.
	 * @param mixed  $default  Default value.
	 *
	 * @return mixed
	 */
	public static function find_option_settings( array $settings, string $key, $default = '' ) {
		if ( isset( $settings[ $key ] ) ) {
			return $settings[ $key ];
		}

		return $default;
	}

	/**
	 * Sanitize Form Text Fields.
	 *
	 * @since 2.0.0
	 *
	 * @param string $value User input.
	 *
	 * @return string|bool
	 */
	public static function sanitize_form_fields( string $value ) {
		$value = sanitize_text_field( $value );

		if ( 'true' === $value ) {
			return true;
		}

		if ( 'false' === $value ) {
			return false;
		}

		return $value;
	}

	/**
	 * Sanitize form SVG Icon Fields XML.
	 *
	 * @since 2.0.0
	 *
	 * @param string $value SVG string.
	 *
	 * @return string
	 */
	public static function sanitize_svg_icon_fields( string $value ): string {
		$icon_allowed_html = [
			'svg' => [
				'viewbox' => true,
				'height'  => true,
				'width'   => true,
			],
			'path' => [
				'd' => true,
			],
			'g' => [],
		];

		return wp_kses( $value, $icon_allowed_html );
	}

	/**
	 * Get Days for Schedule.
	 *
	 * @since 2.0.0
	 *
	 * @return array
	 */
	public static function get_days_for_schedule(): array {
		return [
			'daily'     => __( 'Daily', 'storegrowth-sales-booster' ),
			'saturday'  => __( 'Saturday', 'storegrowth-sales-booster' ),
			'sunday'    => __( 'Sunday', 'storegrowth-sales-booster' ),
			'monday'    => __( 'Monday', 'storegrowth-sales-booster' ),
			'tuesday'   => __( 'Tuesday', 'storegrowth-sales-booster' ),
			'wednesday' => __( 'Wednesday', 'storegrowth-sales-booster' ),
			'thursday'  => __( 'Thursday', 'storegrowth-sales-booster' ),
			'friday'    => __( 'Friday', 'storegrowth-sales-booster' ),
		];
	}

	/**
	 * Check if The Module is Active.
	 *
	 * @since 2.0.0
	 *
	 * @param string $module_id The module ID to check.
	 *
	 * @return boolean True if the module is active, false otherwise.
	 */
	public static function is_module_active( string $module_id ): bool {
		$modules        = new ModuleManager();
		$active_modules = $modules->get_active_modules();

		return in_array( $module_id, $active_modules, true );
	}
}
