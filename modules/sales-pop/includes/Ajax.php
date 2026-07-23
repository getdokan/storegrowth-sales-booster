<?php
/**
 * Sample_Ajax class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add ajax actions inside this class.
 */
class Ajax implements HookRegistry {

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_ajax_popup_products', array( $this, 'popup_products' ) );

		add_action( 'wp_ajax_create_popup', array( $this, 'create_popup' ) );
	}

	/**
	 * Return the saved popup configuration for the settings UI.
	 *
	 * Admin-only: reads plugin configuration and must not be exposed to
	 * unauthenticated visitors.
	 */
	public function popup_products() {
		check_ajax_referer( 'spsg_admin_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		wp_send_json_success( get_option( 'spsg_popup_products' ) );
	}

	/**
	 * Persist the popup configuration from the settings UI.
	 *
	 * Admin-only and sanitized on save so no HTML/script can be stored in
	 * fields that are later rendered on the storefront.
	 */
	public function create_popup() {
		check_ajax_referer( 'spsg_admin_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( __( 'You are not allowed to perform this action.', 'storegrowth-sales-booster' ), 403 );
		}

		$popup_data     = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : array(); //phpcs:ignore
		$popup_products = isset( $popup_data['popup_data'] ) ? $popup_data['popup_data'] : array();
		$popup_products = $this->form_validation( $popup_products );
		$popup_products = self::sanitize_popup_data( $popup_products );
		update_option( 'spsg_popup_products', $popup_products );
		wp_send_json_success( get_option( 'spsg_popup_products' ) );
	}

	/**
	 * Validate input field data
	 *
	 * @param array $popup_products product list.
	 */
	public function form_validation( $popup_products ) {
		// This method also needs to be refactored as 'country-state-city' package is removed.
		if ( ! isset( $popup_products['popup_products'] ) ) {
			$popup_products['popup_products'] = array();
		}

		if ( ! isset( $popup_products['virtual_locations'] ) ) {
			$popup_products['virtual_locations'] = array();
		}

		return $popup_products;
	}

	/**
	 * Recursively sanitize the popup configuration.
	 *
	 * Strips any HTML/script from every string value while preserving
	 * newlines (needed for the `virtual_locations` / `message_popup`
	 * textarea fields) and leaving booleans, numbers and null untouched.
	 * Product id lists are cast with `absint()` so the strict `in_array()`
	 * lookup in EnqueueScript can never miss on a numeric string.
	 * Used both on save and before the data is localized to the storefront,
	 * so previously stored payloads are neutralized on render too.
	 *
	 * @since 2.1.1
	 *
	 * @param mixed  $data Raw popup configuration value.
	 * @param string $key  Key the value was stored under, when recursing.
	 *
	 * @return mixed Sanitized value.
	 */
	public static function sanitize_popup_data( $data, $key = '' ) {
		if ( in_array( $key, self::get_id_list_fields(), true ) ) {
			return array_values( array_map( 'absint', (array) $data ) );
		}

		if ( is_array( $data ) ) {
			$sanitized = array();
			foreach ( $data as $data_key => $value ) {
				$data_key               = is_string( $data_key ) ? sanitize_text_field( $data_key ) : $data_key;
				$sanitized[ $data_key ] = self::sanitize_popup_data( $value, (string) $data_key );
			}

			return $sanitized;
		}

		if ( is_string( $data ) ) {
			return sanitize_textarea_field( $data );
		}

		return $data;
	}

	/**
	 * Popup configuration keys that hold a list of product ids.
	 *
	 * Values under these keys are cast to positive integers instead of being
	 * treated as free text.
	 *
	 * @since 2.1.1
	 *
	 * @return string[]
	 */
	protected static function get_id_list_fields(): array {
		/**
		 * Filters the popup configuration keys treated as product id lists.
		 *
		 * @since 2.1.1
		 *
		 * @param string[] $fields Configuration keys holding product ids.
		 */
		return apply_filters( 'spsg_sales_pop_id_list_fields', array( 'popup_products' ) );
	}
}
