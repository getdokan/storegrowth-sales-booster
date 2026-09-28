<?php
/**
 * File for BoGo class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\BoGo;

use StorePulse\StoreGrowth\BaseModule;
use StorePulse\StoreGrowth\Modules\BoGo\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Helper as PluginHelper;

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

	/**
	 * Activate the module: create the BOGO table and bring over 1.x offers
	 * (once), then activate.
	 *
	 * @since 2.0.0
	 * @return bool True if activation was successful, false otherwise.
	 */
	public function activate(): bool {
		BogoDataManager::create_table();
		BogoMigration::maybe_migrate();

		return parent::activate();
	}

	/**
	 * Boot the module. A site already on 2.x with BOGO active never activates
	 * it again, so the one-time 1.x migration also runs from the admin, for an
	 * administrator only (Dokan credits offers saved by anyone without
	 * `manage_options` to that user).
	 *
	 * @since SPSG_VERSION
	 * @return void
	 */
	public function boot(): void {
		parent::boot();

		add_action(
			'admin_init',
			static function () {
				if ( current_user_can( 'manage_options' ) ) {
					BogoMigration::maybe_migrate();
				}
			}
		);
	}
}
