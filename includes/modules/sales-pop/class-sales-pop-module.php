<?php
/**
 * File for Sales_Pop_Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\Sales_Pop;

use STOREGROWTH\SPSB\Interfaces\Module_Skeleton;
use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Modules\Sales_Pop\Sales_Pop;
use STOREGROWTH\SPSB\Modules\Sales_Pop\Enqueue;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module initiator class.
 */
class Sales_Pop_Module implements Module_Skeleton {

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
		return sgsb_modules_url( 'sales-pop/assets/images/sales-pop.svg' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Sales Pop';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Sales Pop convinces visitors to start buying from your brand with confidence and trust.';
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
		require_once __DIR__ . '/includes/class-sales-pop.php';
		require_once __DIR__ . '/includes/class-enqueue.php';
		require_once __DIR__ . '/includes/class-ajax.php';
		Sales_POP::instance();
		Ajax::instance();
	}

}

// Create object and return.
return Sales_Pop_Module::instance();
