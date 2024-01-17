<?php
/**
 * Ajax class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\QuickView\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add ajax actions inside this class.
 */
class Ajax {

	use Singleton;

	/**
	 * Constructor of Ajax class.
	 */
	private function __construct() {
		add_action( 'wp_ajax_sgsb_quick_view_save_settings', array( $this, 'save_settings' ) );
		add_action( 'wp_ajax_sgsb_quick_view_get_settings', array( $this, 'get_settings' ) );
		add_action( 'wp_ajax_get_product_data', array( $this, 'get_product_data_callback' ) );
		add_action( 'wp_ajax_nopriv_get_product_data', array( $this, 'get_product_data_callback' ) );
		add_action( 'wp_ajax_load_modal_template', array( $this, 'load_modal_template_callback' ) );
		add_action( 'wp_ajax_nopriv_load_modal_template', array( $this, 'load_modal_template_callback' ) );
	}

	/**
	 * Ajax action for save settings
	 */
	public function save_settings() {
		check_ajax_referer( 'sgsb_ajax_nonce' );

		if ( ! isset( $_POST['form_data'] ) ) {
			wp_send_json_error();
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitizing via `sgsb_sanitize_form_fields`.
		$form_data = array_map( 'sgsb_sanitize_form_fields', wp_unslash( $_POST['form_data'] ) );

		update_option( 'sgsb_quick_view_settings', $form_data );

		wp_send_json_success();
	}

	/**
	 * Ajax action for get settings.
	 */
	public function get_settings() {
		check_ajax_referer( 'sgsb_ajax_nonce' );

		$form_data = get_option( 'sgsb_quick_view_settings', array() );

		wp_send_json_success( $form_data );
	}

	public function get_product_data_callback() {
		error_log( 'Runnign' );
		$product_id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;

		// Get the WooCommerce product object
		$product = wc_get_product( $product_id );

		if ( $product ) {
			// Get relevant product data
			$product_data = array(
				'name'  => $product->get_name(),
				'price' => $product->get_price(),
			// Add more product data as needed
			);

			// Send the response back to the JavaScript
			echo json_encode( $product_data );
		} else {
			// If product not found, send an error response
			echo json_encode( array( 'error' => 'Product not found.' ) );
		}

		// Always exit to prevent extra output
		wp_die();
	}



	public function load_modal_template_callback() {
		echo $this->load_quick_view_modal_template(); // This function loads your modal template
		wp_die();
	}

	public function load_quick_view_modal_template() {
		ob_start();
		include __DIR__ . '/../templates/quick-view-modal.php';
		return ob_get_clean();
	}
}
