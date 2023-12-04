<?php
/**
 * Post type class.
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
 * Load post type related functionality inside this class.
 */
class SalesPOP {

	use Singleton;

	/**
	 * Constructor of Woocommerce_Functionality class.
	 */
	public function __construct() {
		add_action( 'plugins_loaded', array( $this, 'load_assets' ) );
		add_action( 'wp_footer', array( $this, 'footer_files' ) );
	}

	/**
	 * Text Domain and asset loaded
	 */
	public function load_assets() {
		EnqueueScript::instance();
	}

	/**
	 * Popup for frontend
	 */
	public function footer_files() {
		$popup_properties = maybe_unserialize( get_option( 'sgsb_popup_products', true ) );

		if ( ! empty( $popup_properties['enable'] ) && ! empty( $popup_properties['popup_products'] ) ) {
			include __DIR__ . '/../templates/popup-style.php';
			$path = apply_filters( 'sgsb_sales_pop_visbility_controller', __DIR__ . '/../templates/popup.php' );
			if ( ! $path ) {
				return;
			}

			include $path;
		}
	}
}
