<?php
/**
 * File for Bo_Go class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;
// use STOREGROWTH\SPSB\Modules\Bo_Go\Bo_Go;
// use STOREGROWTH\SPSB\Modules\Bo_Go\Ajax\Ajax;
// use STOREGROWTH\SPSB\Modules\Order_Bump\Enqueue_Script;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module initiator class.
 */
class BoGoModule implements ModuleSkeleton {


	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'bogo';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'BoGo/assets/images/upsell-order-bump.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'BoGo/assets/images/upsell-order-bump-module-img.svg' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'BOGO';
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
		Includes\OrderBogo::instance();
		Includes\Ajax::instance();
		Includes\EnqueueScript::instance();
	}
}

// Create object and return.
return BoGoModule::instance();
