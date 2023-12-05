<?php
/**
 * Sample_Ajax class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\SalesPop\Includes;

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
	 * Order bump creation
	 */
	public function create_popup() {
		check_ajax_referer( 'ajd_protected' );
		$popup_data     = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : array(); //phpcs:ignore
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
		// This method also needs to be refactored as 'country-state-city' package is removed.
		if ( ! isset( $popup_products['popup_products'] ) ) {
			$popup_products['popup_products'] = array();
		}

		if ( ! isset( $popup_products['virtual_locations'] ) ) {
			$popup_products['virtual_locations'] = array();
		}

		return $popup_products;
	}
}
