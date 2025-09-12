<?php
/**
 * File for Sales Pop Module class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SalesPop;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Modules\SalesPop\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sales Pop module class.
 * 
 * This module provides functionality for displaying real-time sales
 * notifications to build trust and create urgency.
 * 
 * @since 1.0.0
 */
class SalesPopModule extends BaseModule {

	/**
	 * Module icon identifier.
	 *
	 * @var string
	 */
	protected $icon = 'sales-pop';

	/**
	 * Get the unique identifier for this module.
	 *
	 * @since 1.0.0
	 * @return string The module ID.
	 */
	public static function get_id(): string {
		return 'sales-pop';
	}

	/**
	 * Get the module icon URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module icon.
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'sales-pop/assets/images/sales-pop.svg' );
	}

	/**
	 * Get the module banner image URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module banner image.
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'sales-pop/assets/images/sales-pop-thumbnail.png' );
	}

	/**
	 * Get the module display name.
	 *
	 * @since 1.0.0
	 * @return string The module name.
	 */
	public function get_name(): string {
		return __( 'Sales Notification', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 * @return string The module description.
	 */
	public function get_description(): string {
		return __( 'Build trust, create urgency. Real-time sales notifications enhance credibility and drive conversions.', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module category.
	 *
	 * @since 1.0.0
	 * @return string The module category.
	 */
	public function get_module_category(): string {
		return __( 'Sales', 'storegrowth-sales-booster' );
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
		return 'https://storegrowth.io/docs/storegrowth-helpcenter/modules/sales-notification/';
	}
}
