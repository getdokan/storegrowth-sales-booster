<?php
/**
 * Post type class.
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
 * Load post type related functionality inside this class.
 */
class Sales_POP {

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
		Enqueue::instance();
	}

	/**
	 * Popup for frontend
	 */
	public function footer_files() {
		$popup_properties = maybe_unserialize( get_option( 'spsb_popup_products', true ) );

		if ( isset( $popup_properties['enable'] ) && $popup_properties['enable'] ) {
			include __DIR__ . '/../templates/popup.php';
		}
	}

}
