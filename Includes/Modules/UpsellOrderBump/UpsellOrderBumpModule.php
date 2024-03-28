<?php
/**
 * File for Upsell_Order_Bump class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\UpsellOrderBump;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module initiator class.
 */
class UpsellOrderBumpModule implements ModuleSkeleton {


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
		return sgsb_modules_url( 'UpsellOrderBump/assets/images/upsell-order-bump.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'UpsellOrderBump/assets/images/upsell-order-bump-module-img.webp' );
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
		Includes\OrderBump::instance();
		Includes\Ajax::instance();
		Includes\EnqueueScript::instance();
	}
}

// Create object and return.
return UpsellOrderBumpModule::instance();
