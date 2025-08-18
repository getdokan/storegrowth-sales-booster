<?php
/**
 * File for CountdownTimerModule class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\CountdownTimer;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\CountdownTimer\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Helper as PluginHelper;

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
		return PluginHelper::get_modules_url( 'countdown-timer/assets/images/countdown-timer.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'countdown-timer/assets/images/countdown-timer-thumbnail.png' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return __( 'Countdown Timer', 'storegrowth-sales-booster' );
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return __( 'Build anticipation. Countdown timers create excitement for upcoming sales events, enticing your audience.', 'storegrowth-sales-booster' );
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return __( 'Stock', 'storegrowth-sales-booster' );
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
