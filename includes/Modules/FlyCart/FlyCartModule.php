<?php
/**
 * File for FlyCartModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FlyCart;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fly Cart module initiator class.
 */
class FlyCartModule implements ModuleSkeleton {

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
		return sgsb_modules_url( 'FlyCart/assets/images/icon-fast-cart-module.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'FlyCart/assets/images/quick-cart-module-img.svg' );
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
		return 'Streamline shopping effortlessly. Add and review items without leaving your page, simplifying the experience.';
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
		// Initialize necessary classes instance for fly cart module.
		Includes\EnqueueScript::instance();
		Includes\CommonHooks::instance();
		Includes\Ajax::instance();

		/**
		 * Fast fly cart module init.
		 *
		 * @since 1.0.0
		 */
		do_action( 'storegrowth_quick_cart_module_init' );
	}

}

// Create object and return.
return FlyCartModule::instance();
