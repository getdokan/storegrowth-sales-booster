<?php
/**
 * File for Sales Pop Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\SalesPop;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module initiator class.
 */
class SalesPopModule implements ModuleSkeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'sales-pop';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'SalesPop/assets/images/sales-pop.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'SalesPop/assets/images/sales-pop-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Sales Notification';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Build trust, create urgency. Real-time sales notifications enhance credibility and drive conversions.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Sales';
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
		Includes\SalesPOP::instance();
		Includes\Ajax::instance();

		do_action( 'storegrowth_sales_pop_module_init' );
	}
}

// Create object and return.
return SalesPopModule::instance();
