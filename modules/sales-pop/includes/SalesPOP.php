<?php
/**
 * Post type class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop;

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load post type related functionality inside this class.
 */
class SalesPOP implements HookRegistry {

	use Singleton;

	/**
	 * Constructor of Woocommerce_Functionality class.
	 */
	public function register_hooks(): void {
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
    if ( ! PluginHelper::is_current_user_allowed_to_view_promotions() ) {
        return;
    }

		$popup_properties = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_popup_products', true );

		if ( ! empty( $popup_properties['enable'] ) && ! empty( $popup_properties['popup_products'] ) ) {
			include __DIR__ . '/../templates/popup-style.php';
			$path = apply_filters( 'spsg_sales_pop_visbility_controller', __DIR__ . '/../templates/popup.php' );
			if ( ! $path ) {
				return;
			}

			include $path;
		}
	}
}
