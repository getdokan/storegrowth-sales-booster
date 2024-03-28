<?php
/**
 * File for StockBarModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\StockBar;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Stock Bar` module initiator class.
 */
class StockBarModule implements ModuleSkeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'stock-bar';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'StockBar/assets/images/stock-bar-icon.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'StockBar/assets/images/stock-bar-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Stock Bar';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Drive FOMO effectively. Visually indicate low stock or scarcity to encourage immediate action.';
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
		// Include necessary classes for stock bar.
		Includes\EnqueueScript::instance();
		Includes\CommonHooks::instance();
		Includes\Ajax::instance();

		/**
		 * Module initialized.
		 *
		 * @since 1.0.0
		 */
		do_action( 'storegrowth_stock_bar_module_init' );
	}
}

// Create object and return.
return StockBarModule::instance();
