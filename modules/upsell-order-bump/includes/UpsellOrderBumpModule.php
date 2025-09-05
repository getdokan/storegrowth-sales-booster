<?php
/**
 * File for Upsell_Order_Bump class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\Migration;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Upsell Order Bump module class.
 * 
 * This module provides functionality for displaying upsell offers
 * at checkout to increase order values and profit.
 * 
 * @since 1.0.0
 */
class UpsellOrderBumpModule extends BaseModule {

	/**
	 * Module icon identifier.
	 *
	 * @var string
	 */
	protected $icon = 'upsell-order-bump';

	/**
	 * Get the unique identifier for this module.
	 *
	 * @since 1.0.0
	 * @return string The module ID.
	 */
	public static function get_id(): string {
		return 'upsell-order-bump';
	}

	/**
	 * Get the module icon URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module icon.
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'upsell-order-bump/assets/images/upsell-order-bump.svg' );
	}

	/**
	 * Get the module banner image URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module banner image.
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'upsell-order-bump/assets/images/upsell-order-bump-thumbnail.png' );
	}

	/**
	 * Get the module display name.
	 *
	 * @since 1.0.0
	 * @return string The module name.
	 */
	public function get_name(): string {
		return __( 'Upsell Order Bump', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 * @return string The module description.
	 */
	public function get_description(): string {
		return __( 'Effortlessly boost sales. Offer relevant add-ons at checkout for increased order values and profit.', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module category.
	 *
	 * @since 1.0.0
	 * @return string The module category.
	 */
	public function get_module_category(): string {
		return __( 'Upsell', 'storegrowth-sales-booster' );
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

	public function activate(): bool
	{
        Migration::run_migration();

		return parent::activate();
	}
}
