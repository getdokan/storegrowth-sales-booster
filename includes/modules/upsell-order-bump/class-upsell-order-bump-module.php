<?php
/**
 * File for Upsell_Order_Bump class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Upsell_Order_Bump;

use STOREGROWTH\SPSB\Interfaces\Module_Skeleton;
use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Modules\Upsell_Order_Bump\Order_Bump;
use STOREGROWTH\SPSB\Modules\Upsell_Order_Bump\Ajax\Ajax;
use STOREGROWTH\SPSB\Modules\Order_Bump\Enqueue_Script;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module initiator class.
 */
class Upsell_Order_Bump_Module implements Module_Skeleton {


	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'upsell-order-bump';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'upsell-order-bump/assets/images/upsell-order-bump.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'upsell-order-bump/assets/images/upsell-order-bump-module-img.svg' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Upsell Order Bump';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Effortlessly boost sales. Offer relevant add-ons at checkout for increased order values and profit.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Upsell';
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
		require_once __DIR__ . '/includes/class-order-bump.php';
		require_once __DIR__ . '/includes/class-ajax.php';
		require_once __DIR__ . '/includes/class-enqueue-script.php';

		Order_Bump::instance();
		Ajax::instance();
		Enqueue_Script::instance();
	}
}

// Create object and return.
return Upsell_Order_Bump_Module::instance();
