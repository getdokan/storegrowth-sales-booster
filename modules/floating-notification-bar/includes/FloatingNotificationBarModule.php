<?php
/**
 * File for Floating_Notification_Bar_Module class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\FloatingNotificationBar;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Modules\FloatingNotificationBar\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Floating Notification Bar module class.
 * 
 * This module provides functionality for displaying customizable
 * floating notification bars to draw attention to special offers.
 * 
 * @since 1.0.0
 */
class FloatingNotificationBarModule extends BaseModule {

	/**
	 * Module icon identifier.
	 *
	 * @var string
	 */
	protected $icon = 'floating-bar-icon';

	/**
	 * Get the unique identifier for this module.
	 *
	 * @since 1.0.0
	 * @return string The module ID.
	 */
	public static function get_id(): string {
		return 'floating-notification-bar';
	}

	/**
	 * Get the module icon URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module icon.
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'floating-notification-bar/assets/images/floating-bar-icon.svg' );
	}

	/**
	 * Get the module banner image URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module banner image.
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'floating-notification-bar/assets/images/floating-bar-thumbnail.png' );
	}

	/**
	 * Get the module display name.
	 *
	 * @since 1.0.0
	 * @return string The module name.
	 */
	public function get_name(): string {
		return __( 'Floating Bar', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 * @return string The module description.
	 */
	public function get_description(): string {
		return __( 'Captivate with announcements. Customizable bars draw attention to special offers, discounts, and important news.', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module category.
	 *
	 * @since 1.0.0
	 * @return string The module category.
	 */
	public function get_module_category(): string {
		return __( 'Discount Banner', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the bootstrap service provider for this module.
	 * 
	 * @since 1.0.0
	 * @return BootstrapServiceProvider The service provider instance for this module.
	 */
	protected function get_bootstrap_service_provider(): BootstrapServiceProvider {
		return new BootstrapServiceProvider();
	}

	public function get_doc_link(): string {
		return 'https://storegrowth.io/docs/storegrowth-helpcenter/modules/floating-bar/';
	}
}