<?php
/**
 * File for FlyCartModule class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\FlyCart;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Modules\FlyCart\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fly Cart module class.
 * 
 * This module provides functionality for displaying a fly cart
 * that allows users to add and review items without leaving the page.
 * 
 * @since 1.0.0
 */
class FlyCartModule extends BaseModule {

	/**
	 * Module icon identifier.
	 *
	 * @var string
	 */
	protected $icon = 'icon-fast-cart-module';

	/**
	 * Get the unique identifier for this module.
	 *
	 * @since 1.0.0
	 * @return string The module ID.
	 */
	public static function get_id(): string {
		return 'fly-cart';
	}

	/**
	 * Get the module icon URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module icon.
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'fly-cart/assets/images/icon-fast-cart-module.svg' );
	}

	/**
	 * Get the module banner image URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module banner image.
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'fly-cart/assets/images/fly-cart-thumbnail.png' );
	}

	/**
	 * Get the module display name.
	 *
	 * @since 1.0.0
	 * @return string The module name.
	 */
	public function get_name(): string {
		return __( 'Fly Cart', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 * @return string The module description.
	 */
	public function get_description(): string {
		return __( 'Streamline shopping effortlessly. Add and review items without leaving your page, simplifying the experience.', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module category.
	 *
	 * @since 1.0.0
	 * @return string The module category.
	 */
	public function get_module_category(): string {
		return __( 'Fly Cart', 'storegrowth-sales-booster' );
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
