<?php
/**
 * File for Direct_Checkout_Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\DirectCheckout;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Direct Checkout` module initiator class.
 */
class DirectCheckoutModule implements ModuleSkeleton {

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
		return sgsb_modules_url( 'DirectCheckout/assets/images/direct-checkout.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'DirectCheckout/assets/images/direct-checkout-module-img.webp' );
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
		return 'Simplify the purchase process. Enable customers to check out directly, reducing cart abandonment and enhancing convenience';
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
		// Initialize necessary classes instance for direct checkout module.
		Includes\EnqueueScript::instance();
		Includes\CommonHooks::instance();
		Includes\Ajax::instance();

		/**
		 * Module initialized.
		 *
		 * @since 1.0.0
		 */
	}
}

// Create object and return.
return DirectCheckoutModule::instance();
