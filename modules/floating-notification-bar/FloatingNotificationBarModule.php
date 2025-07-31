<?php
/**
 * File for Floating_Notification_Bar_Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FloatingNotificationBar;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\FloatingNotificationBar\Includes\Providers\BootstrapServiceProvider;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Floating notification bar module initiator class.
 */
class FloatingNotificationBarModule extends BaseModule {

	protected $icon = 'floating-bar-icon';

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public static function get_id(): string {
		return 'floating-notification-bar';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon(): string {
		return sgsb_modules_url( 'floating-notification-bar/assets/images/floating-bar-icon.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner(): string {
		return sgsb_modules_url( 'floating-notification-bar/assets/images/floating-bar-feature-image.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return 'Floating Bar';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return 'Captivate with announcements. Customizable bars draw attention to special offers, discounts, and important news.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category(): string {
		return 'Discount Banner';
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

		do_action( 'storegrowth_floating_bar_module_init' );
	}
}

// Create object and return.
return FloatingNotificationBarModule::instance();
