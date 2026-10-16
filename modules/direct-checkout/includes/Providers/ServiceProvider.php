<?php
/**
 * File for the Direct Checkout module ServiceProvider class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\DirectCheckout\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\DirectCheckout\AdminPage;
use StorePulse\StoreGrowth\Modules\DirectCheckout\DirectCheckoutModule;
use StorePulse\StoreGrowth\Modules\DirectCheckout\Settings\DirectCheckoutSettings;

/**
 * ServiceProvider for the module.
 *
 * Registers and boots the module.
 *
 * @since 2.0.0
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer\Providers
 */
class ServiceProvider extends BaseServiceProvider {

	/**
	 * List of services provided by this provider.
	 *
	 * @since 2.0.0
	 *
	 * @var array<class-string>
	 */
	protected $services = [
		DirectCheckoutModule::class,
		DirectCheckoutSettings::class,
		AdminPage::class,
	];

	/**
	 * Boot the service provider.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function boot(): void {
	}

	/**
	 * Register the service provider.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register(): void {
		$this->add_with_implements_tags( DirectCheckoutModule::get_id(), DirectCheckoutModule::class, true );
		// Always loaded: the settings page works while the module is off.
		$this->add_with_implements_tags( DirectCheckoutSettings::class, DirectCheckoutSettings::class, true );
		$this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
	}
}
