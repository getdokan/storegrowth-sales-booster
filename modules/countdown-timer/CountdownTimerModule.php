<?php
/**
 * File for CountdownTimerModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\CountdownTimer;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\CountdownTimer\Includes\Providers\BootstrapServiceProvider;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `Countdown Timer` module initiator class.
 */
class CountdownTimerModule extends BaseModule {

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'countdown-timer';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return Helper::get_modules_url( 'countdown-timer/assets/images/countdown-timer.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return Helper::get_modules_url( 'countdown-timer/assets/images/sales-countdown-module-img.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'Countdown Timer';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return 'Build anticipation. Countdown timers create excitement for upcoming sales events, enticing your audience.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return 'Stock';
	}

	/**
	 * Module activation method.
	 *
	 * @return bool
	 */
	public function activate(): bool {
		$activated = parent::activate();

		return $activated;
	}

	/**
	 * Module deactivation method.
	 *
	 * @return bool
	 */
	public function deactivate(): bool {
		$deactivated = parent::deactivate();

		return $deactivated;
	}

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function boot(): void {
		storegrowth_get_container()->addServiceProvider( new BootstrapServiceProvider() );

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
