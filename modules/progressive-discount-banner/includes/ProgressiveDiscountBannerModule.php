<?php
/**
 * File for Progressive Discount Banner Module class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Progressive Discount Banner module class.
 * 
 * This module provides functionality for displaying progressive discount
 * banners to encourage larger orders and free shipping thresholds.
 * 
 * @since 1.0.0
 */
class ProgressiveDiscountBannerModule extends BaseModule {

	/**
	 * Module icon identifier.
	 *
	 * @var string
	 */
	protected $icon = 'free-shipping-bar-icon';

	/**
	 * Get the unique identifier for this module.
	 *
	 * @since 1.0.0
	 * @return string The module ID.
	 */
	public static function get_id(): string {
		return 'progressive-discount-banner';
	}

	/**
	 * Get the module icon URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module icon.
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'progressive-discount-banner/assets/images/free-shipping-bar-icon.svg' );
	}

	/**
	 * Get the module banner image URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module banner image.
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'progressive-discount-banner/assets/images/free-shipping-bar-thumbnail.png' );
	}

	/**
	 * Get the module display name.
	 *
	 * @since 1.0.0
	 * @return string The module name.
	 */
	public function get_name(): string {
		return __( 'Free Shipping Rules', 'storegrowth-sales-booster' );
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 * @return string The module description.
	 */
	public function get_description(): string {
		return __( 'Entice larger orders. Prominently display progress toward free shipping, encouraging customers to add more.', 'storegrowth-sales-booster' );
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
		return 'https://storegrowth.io/docs/storegrowth-helpcenter/modules/free-shipping-rules/';
	}
}
