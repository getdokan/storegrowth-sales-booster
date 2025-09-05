<?php
/**
 * File for Direct_Checkout_Module class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\DirectCheckout;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Modules\DirectCheckout\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Direct Checkout module class.
 * 
 * This module provides functionality for enabling direct checkout
 * to simplify the purchase process and reduce cart abandonment.
 * 
 * @since 1.0.0
 */
class DirectCheckoutModule extends BaseModule {

	/**
	 * Module icon identifier.
	 *
	 * @var string
	 */
	protected $icon = 'direct-checkout';

	/**
	 * Get the unique identifier for this module.
	 *
	 * @since 1.0.0
	 * @return string The module ID.
	 */
	public static function get_id(): string {
		return 'direct-checkout';
	}

	/**
	 * Get the module icon URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module icon.
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'direct-checkout/assets/images/direct-checkout.svg' );
	}

	/**
	 * Get the module banner image URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module banner image.
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'direct-checkout/assets/images/direct-checkout-thumbnail.png' );
	}

	/**
	 * Get the module display name.
	 *
	 * @since 1.0.0
	 * @return string The module name.
	 */
	public function get_name(): string {
		return __( 'Direct Checkout', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 * @return string The module description.
	 */
	public function get_description(): string {
		return __( 'Simplify the purchase process. Enable customers to check out directly, reducing cart abandonment and enhancing convenience', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module category.
	 *
	 * @since 1.0.0
	 * @return string The module category.
	 */
	public function get_module_category(): string {
		return __( 'Stock', 'storegrowth-sales-booster' );
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
}
