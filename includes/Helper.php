<?php

namespace StorePulse\StoreGrowth;

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
		return STOREGROWTH_DIR_URL . 'assets/' . $path;
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
		return STOREGROWTH_DIR_URL . 'modules/' . $path;
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
		return STOREGROWTH_DIR_PATH . 'modules/' . $path;
	}

	/**
	 * Get Integrations Path.
	 *
	 * @since 2.0.0
	 *
	 * @param string $path Module internal path.
	 *
	 * @return string
	 */
	public static function get_integrations_path( string $path ): string {
		return STOREGROWTH_DIR_URL . 'integrations/' . $path;
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
		return STOREGROWTH_DIR_PATH . $path;
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

		require STOREGROWTH_DIR_PATH . $path;

		return ob_get_clean();
	}

	/**
	 * Get settings by the key.
	 *
	 * @since 2.0.0
	 *
	 * @param string $key     The option key to retrieve.
	 * @param mixed  $default Default value to return if option doesn't exist.
	 *
	 * @return array
	 */
	public static function get_settings( string $key, $default = array() ): array {
		return (array) get_option( $key, $default );
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

	/**
	 * Check if The Module is Active.
	 *
	 * @since 1.28.14
	 *
	 * @param string $module_id The module ID to check.
	 *
	 * @return \WP_REST_Request The request object.
	 */
	public static function get_rest_request(): \WP_REST_Request {
		// Get the request object.
		$server  = rest_get_server();
		$request = new \WP_REST_Request( $_SERVER['REQUEST_METHOD'] );

		// Set the request parameters.
		$request->set_query_params( wp_unslash( $_GET ) );
		$request->set_body_params( wp_unslash( $_POST ) );
		$request->set_file_params( $_FILES );
		$request->set_headers( $server->get_headers( wp_unslash( $_SERVER ) ) );
		$request->set_body( $server::get_raw_data() );

		return $request;
	}

    /**
     * Check if The Current User Allowed to View Promotions.
     *
     * @since 2.0.0
     *
     * @return bool
     */
    public static function is_current_user_allowed_to_view_promotions(): bool {
        if ( ! is_user_logged_in() ) {
            return true;
        }

        $allowed_roles = apply_filters(
            'spsg_allowed_roles_for_promotions',
            [
                'customer',
                'wholesale_customer',
                'subscriber'
            ]
        );

        foreach ( $allowed_roles as $role ) {
            if ( current_user_can( $role ) ) {
                return true;
            }
        }

        return apply_filters( 'spsg_current_user_allowed_to_view_promotions', false );
    }
}
