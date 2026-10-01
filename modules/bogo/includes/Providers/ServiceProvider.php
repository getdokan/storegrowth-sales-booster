<?php

namespace StorePulse\StoreGrowth\Modules\BoGo\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\BoGo\AdminPage;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\BoGo\Settings\BogoSettings;

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
		BoGoModule::class,
		BogoSettings::class,
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
		$this->add_with_implements_tags( BoGoModule::get_id(), BoGoModule::class, true );
		// Always loaded: the settings page works while the module is off.
		$this->add_with_implements_tags( BogoSettings::class, BogoSettings::class, true );
		$this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
	}
}
