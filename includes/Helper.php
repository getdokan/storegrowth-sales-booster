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
	 * Constrain a stored value to a valid CSS colour.
	 *
	 * Stored colour settings are interpolated into inline `<style>` blocks that
	 * are served to every visitor, so a value that closes the declaration would
	 * let an admin-authored option inject arbitrary CSS into the storefront.
	 * This validates against an allow-list of colour notations — hex, the
	 * `rgb()/rgba()/hsl()/hsla()` functions with numeric arguments only, and
	 * bare keywords such as `red` or `transparent` — and returns `$fallback`
	 * for anything else, so `url()`, `expression()`, braces, semicolons and
	 * angle brackets can never reach the CSS context.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed  $value    Stored colour value.
	 * @param string $fallback Value returned when `$value` is not a valid colour.
	 *
	 * @return string
	 */
	public static function sanitize_css_color( $value, string $fallback = '' ): string {
		$value = trim( (string) $value );

		// Hex notation: #rgb, #rgba, #rrggbb, #rrggbbaa.
		if ( preg_match( '/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $value ) ) {
			return $value;
		}

		// Functional notation with numeric arguments only (legacy comma and modern space syntax).
		if ( preg_match( '/^(?:rgba?|hsla?)\(\s*[0-9.,%\s\/-]+\)$/i', $value ) ) {
			return $value;
		}

		// Bare keywords: named colours, `transparent`, `currentColor`, `inherit`.
		if ( preg_match( '/^[a-z]+$/i', $value ) ) {
			return $value;
		}

		return $fallback;
	}

	/**
	 * Check whether one of the plugin's custom tables exists.
	 *
	 * Both custom tables are created from their module's `activate()` callback,
	 * so a site that had a module active before the release which introduced its
	 * table — and that updated in place without ever toggling the module off and
	 * on — never gets the table. Queries against it then return `null`, and code
	 * that maps or iterates over the result fatals on PHP 8. Callers use this to
	 * return an empty result instead.
	 *
	 * Only a positive answer is cached. A table that exists cannot disappear
	 * mid-request, while a missing one may be created by a migration during the
	 * same request, so the negative case is re-checked and self-heals.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $table Fully prefixed table name.
	 *
	 * @return bool
	 */
	public static function table_exists( string $table ): bool {
		static $known = [];

		if ( isset( $known[ $table ] ) ) {
			return true;
		}

		global $wpdb;

		// `_` and `%` are LIKE wildcards, and table names contain `_`.
		$found = $wpdb->get_var(
			$wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) )
		);

		if ( $found === $table ) {
			$known[ $table ] = true;

			return true;
		}

		return false;
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
		// `get_active_modules()` returns ModuleSkeleton objects, so a string ID
		// is never strictly equal to any element. Resolve by ID and read the
		// module's own state instead, which also returns false for unknown IDs.
		$modules = new ModuleManager();

		return $modules->is_active_module( $module_id );
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
