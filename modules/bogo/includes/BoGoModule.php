<?php
/**
 * File for BoGo class.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo;

use STOREGROWTH\SPSB\BaseModule;
use STOREGROWTH\SPSB\Modules\BoGo\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * BOGO (Buy One Get One) module class.
 * 
 * This module provides functionality for creating buy-one-get-one offers
 * to boost sales and increase order values.
 * 
 * @since 1.0.0
 */
class BoGoModule extends BaseModule {

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
		return 'bogo';
	}

	/**
	 * Get the module icon URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module icon.
	 */
	public function get_icon(): string {
		return PluginHelper::get_modules_url( 'bogo/assets/images/upsell-order-bump.svg' );
	}

	/**
	 * Get the module banner image URL.
	 *
	 * @since 1.0.0
	 * @return string The URL to the module banner image.
	 */
	public function get_banner(): string {
		return PluginHelper::get_modules_url( 'bogo/assets/images/bogo-thumbnail.png' );
	}

	/**
	 * Get the module display name.
	 *
	 * @since 1.0.0
	 * @return string The module name.
	 */
	public function get_name(): string {
		return __( 'BOGO', 'storegrowth-sales-booster' );
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
}
