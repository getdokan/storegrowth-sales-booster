<?php
/**
 * File for Direct_Checkout_Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Direct_Checkout;

use STOREGROWTH\SPSB\Interfaces\Module_Skeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Stock Bar` module initiator class.
 */
class Direct_Checkout_Module implements Module_Skeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'direct-checkout';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'direct-checkout/assets/images/direct-checkout.svg' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Direct Checkout';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Easily add stock status bar to your products.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Stock';
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
		// Include necessary classes for countdown timer module.
		require_once __DIR__ . '/includes/functions.php';
		require_once __DIR__ . '/includes/class-enqueue-script.php';
		require_once __DIR__ . '/includes/class-common-hooks.php';
		require_once __DIR__ . '/includes/class-ajax.php';

		Enqueue_Script::instance();
		Common_Hooks::instance();
		Ajax::instance();

		/**
		 * Module initialized.
		 *
		 * @since 1.0.0
		 */
	}
}

// Create object and return.
return Direct_Checkout_Module::instance();
