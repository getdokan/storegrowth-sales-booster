<?php
/**
 * File for CountdownTimerModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\CountdownTimer;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Countdown Timer` module initiator class.
 */
class CountdownTimerModule implements ModuleSkeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'countdown-timer';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'CountdownTimer/assets/images/countdown-timer.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'CountdownTimer/assets/images/sales-countdown-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Countdown Timer';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Build anticipation. Countdown timers create excitement for upcoming sales events, enticing your audience.';
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
		// Initialize necessary classes instance for countdown timer module.
		Includes\EnqueueScript::instance();
		Includes\CommonHooks::instance();
		Includes\Ajax::instance();

		/**
		 * Module initialized.
		 *
		 * @since 1.0.0
		 */
		do_action( 'storegrowth_countdown_timer_module_init' );
	}
}

// Create object and return.
return CountdownTimerModule::instance();
