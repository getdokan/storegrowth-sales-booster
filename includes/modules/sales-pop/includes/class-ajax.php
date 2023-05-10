<?php
/**
 * Sample_Ajax class.
 *
 * @package SBFW
 */

namespace WPCodal\SBFW\Modules\Sales_Pop;

use WPCodal\SBFW\Traits\Singleton;

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

		add_action( 'wp_ajax_popup_products', array( $this, 'popup_products' ) );
		add_action( 'wp_ajax_nopriv_popup_products', array( $this, 'popup_products' ) );

		add_action( 'wp_ajax_create_popup', array( $this, 'create_popup' ) );
		add_action( 'wp_ajax_nopriv_create_popup', array( $this, 'create_popup' ) );
	}

	/**
	 * Order bump creation
	 */
	public function popup_products() {
		wp_send_json_success( maybe_unserialize( get_option( 'spsb_popup_products' ) ) );
	}

	/**
	 * Order bump creation
	 */
	public function create_popup() {
		check_ajax_referer( 'ajd_protected' );
		$popup_data         = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : array(); //phpcs:ignore
		$popup_products     = isset( $popup_data['popup_data'] ) ? $popup_data['popup_data'] : array();
		$popup_products     = $this->form_validation( $popup_products );
		$state_without_city = isset( $popup_data['state_without_city'] ) ? $popup_data['state_without_city'] : array();

		update_option( 'spsb_popup_products', maybe_serialize( $popup_products ) );

		update_option( 'spsb_state_without_city', maybe_serialize( $state_without_city ) );

		wp_send_json_success( maybe_unserialize( get_option( 'spsb_popup_products' ) ) );
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
