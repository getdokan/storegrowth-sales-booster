<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\AdminPage;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;

/**
 * ServiceProvider for the module.
 *
 * Registers and boots the module.
 *
 * @since 2.0.0
 *
 * @package StorePulse\StoreGrowth\Modules\UpsellOrderBump\Providers
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
		UpsellOrderBumpModule::class,
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
		$this->add_with_implements_tags( UpsellOrderBumpModule::get_id(), UpsellOrderBumpModule::class, true );
		// Always loaded: the list page asks to turn the module on while it's off.
		$this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
	}
}
