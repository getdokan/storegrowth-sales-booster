<?php
/**
 * File for Floating_Notification_Bar_Module class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FloatingNotificationBar;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Floating notification bar module initiator class.
 */
class FloatingNotificationBarModule implements ModuleSkeleton {

	use Singleton;

	/**
	 * Unique ID for a module.
	 *
	 * @return string
	 */
	public function get_id() {
		return 'floating-notification-bar';
	}

	/**
	 * Icon for a module.
	 *
	 * @return string
	 */
	public function get_icon() {
		return sgsb_modules_url( 'FloatingNotificationBar/assets/images/floating-bar-icon.svg' );
	}

	/**
	 * Banner for a module.
	 *
	 * @return string
	 */
	public function get_banner() {
		return sgsb_modules_url( 'FloatingNotificationBar/assets/images/floating-bar-feature-image.webp' );
	}

	/**
	 * Unique name for a module.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'Floating Bar';
	}

	/**
	 * Description for the module.
	 *
	 * @return string
	 */
	public function get_description() {
		return 'Captivate with announcements. Customizable bars draw attention to special offers, discounts, and important news.';
	}

	/**
	 * Category for a module.
	 *
	 * @return string
	 */
	public function get_module_category() {
		return 'Discount Banner';
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
	 * Setting Initial Banner Data.
	 *
	 * @return void
	 */
	public function set_initial_banner_data() {
		$flags = get_option( 'sgsb_discount_banner_flags', array() );
		if ( isset( $flags['done_setting_initial_banner_data'] ) ) {
			return;
		}
		$default_data = array(
			'default_banner_text' => 'Shop more than $100 to get free shipping.',
		);
		delete_option( 'sgsb_floating_notification_bar_settings' );
		$result = update_option( 'sgsb_floating_notification_bar_settings', $default_data );
		if ( $result ) {
			update_option( 'sgsb_discount_banner_flags', array( 'done_setting_initial_banner_data' => true ) );
		}
	}

	/**
	 * Starting point of the module.
	 *
	 * @return void
	 */
	public function init() {
		Includes\Ajax::instance();
		Includes\CommonHooks::instance();
		Includes\EnqueueScript::instance();

		do_action( 'storegrowth_floating_bar_module_init' );
	}
}

// Create object and return.
return FloatingNotificationBarModule::instance();
