<?php
/**
 * Sample_Ajax class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Sales_Pop;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load sample ajax functionality inside this class.
 */
class Ajax {

	use Singleton;

	/**
	 * Constructor of Bootstrap class.
	 */
	private function __construct() {
		add_action( 'wp_ajax_fetch_popup_flags', array( $this, 'fetch_popup_flags' ) );
		add_action( 'wp_ajax_set_states_without_cities_data', array( $this, 'set_states_without_cities_data' ) );
		add_action( 'wp_ajax_popup_products', array( $this, 'popup_products' ) );
		add_action( 'wp_ajax_nopriv_popup_products', array( $this, 'popup_products' ) );

		add_action( 'wp_ajax_create_popup', array( $this, 'create_popup' ) );
		add_action( 'wp_ajax_nopriv_create_popup', array( $this, 'create_popup' ) );
	}

	/**
	 * Order bump creation
	 */
	public function popup_products() {
		wp_send_json_success( maybe_unserialize( get_option( 'sgsb_popup_products' ) ) );
	}

	/**
	 * Fetch Popup Flags
	 */
	public function fetch_popup_flags() {
		check_ajax_referer( 'ajd_protected' );
		$flags = maybe_unserialize( get_option( 'sgsb_popup_flags' ) );
		wp_send_json_success( $flags );
	}

	/**
	 * Update states without cities data
	 */
	public function set_states_without_cities_data() {
		// this method will run 'only once' in the entire lifetime of this plugin.
		check_ajax_referer( 'ajd_protected' );
		$data                = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : array(); //phpcs:ignore
		$states_without_city = isset( $data['states_without_city'] ) ? $data['states_without_city'] : null;
		$current_popup_flags = maybe_unserialize( get_option( 'sgsb_popup_flags', array() ) );
		$response            = array();
		if ( $states_without_city ) {
			delete_option( 'sgsb_states_without_city' );
			$response['is_done_setting_states_without_cities'] = update_option( 'sgsb_states_without_city', maybe_serialize( $states_without_city ) );
		}
		if ( isset( $response['is_done_setting_states_without_cities'] ) && $response['is_done_setting_states_without_cities'] ) {
			$current_popup_flags['isStatesWithoutCitiesInDb'] = true;
		}
		$response['updated_popup_flags'] = update_option( 'sgsb_popup_flags', maybe_serialize( $current_popup_flags ) );
		$response['flags']               = $current_popup_flags;
		wp_send_json_success( $response );
	}

	/**
	 * Order bump creation
	 */
	public function create_popup() {
		check_ajax_referer( 'ajd_protected' );
		$popup_data         = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : array(); //phpcs:ignore
		$popup_products = isset( $popup_data['popup_data'] ) ? $popup_data['popup_data'] : array();
		$popup_products = $this->form_validation( $popup_products );
		update_option( 'sgsb_popup_products', maybe_serialize( $popup_products ) );
		wp_send_json_success( maybe_unserialize( get_option( 'sgsb_popup_products' ) ) );
	}

	/**
	 * Validate input field data
	 *
	 * @param array $popup_products product list.
	 */
	public function form_validation( $popup_products ) {
		if ( ! isset( $popup_products['popup_products'] ) ) {
			$popup_products['popup_products'] = array();
		}

		if ( ! isset( $popup_products['popup_products'] ) ) {
			$popup_products['popup_products'] = array();
		}

		if ( ! isset( $popup_products['state_by_country'] ) ) {
			$popup_products['state_by_country'] = array();
		}

		if ( ! isset( $popup_products['virtual_countries'] ) ) {
			$popup_products['virtual_countries'] = array();
			$popup_products['state_by_country']  = array();
		}

		if ( ! isset( $popup_products['city_by_state'] ) ) {
			$popup_products['city_by_state'] = array();
		}

		if ( ! isset( $popup_products['virtual_state'] ) ) {
			$popup_products['virtual_state'] = array();
			$popup_products['city_by_state'] = array();
		}

		if ( ! isset( $popup_products['virtual_city'] ) ) {
			$popup_products['virtual_city'] = array();
		}
		return $popup_products;
	}
}
