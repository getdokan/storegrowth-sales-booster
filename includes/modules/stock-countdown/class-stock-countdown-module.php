<?php
/**
 * File for Stock_Countdown_Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Stock_Countdown;

use STOREGROWTH\SPSB\Interfaces\Module_Skeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Stock Countdown` module initiator class.
 */
class Stock_Countdown_Module implements Module_Skeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'stock-countdown';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'stock-countdown/assets/images/stock-countdown.svg' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Stock Countdown';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Easily add stock status bar and Countdown timer to your products.';
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
		// Include necessary classes for stock countdown module.
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
		do_action( 'stock_countdown_module_init' );
	}

}

// Create object and return.
return Stock_Countdown_Module::instance();
