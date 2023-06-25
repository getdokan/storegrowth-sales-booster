<?php
/**
 * File for Fly_Cart_Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Fly_Cart;

use STOREGROWTH\SPSB\Interfaces\Module_Skeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fly Cart module initiator class.
 */
class Fly_Cart_Module implements Module_Skeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'fly-cart';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'fly-cart/assets/images/icon-fast-cart-module.svg' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Quick Cart';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Empowers your site with the superpower of adding products to the cart without reloading the page.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Quick Cart';
	}

	/**
	 * Module activation function.
	 *
	 * @return void
	 */
	public function activate() {
		// TODO: Implement activate() method.
	}

	/**
	 * Module deactivation function.
	 *
	 * @return void
	 */
	public function deactivate() {
		// TODO: Implement deactivate() method.
	}

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function init() {
		// Include necessary classes for fly cart module.
		require_once __DIR__ . '/includes/functions.php';
		require_once __DIR__ . '/includes/class-enqueue-script.php';
		require_once __DIR__ . '/includes/class-common-hooks.php';
		require_once __DIR__ . '/includes/class-ajax.php';

		Enqueue_Script::instance();
		Common_Hooks::instance();
		Ajax::instance();

		/**
		 * Fast fly cart module init.
		 *
		 * @since 1.0.0
		 */
		do_action( 'storegrowth_quick_cart_module_init' );
	}

}

// Create object and return.
return Fly_Cart_Module::instance();
