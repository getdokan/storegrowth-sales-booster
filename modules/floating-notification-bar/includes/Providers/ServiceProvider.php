<?php

namespace StorePulse\StoreGrowth\Modules\FloatingNotificationBar\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\FloatingNotificationBar\AdminPage;
use StorePulse\StoreGrowth\Modules\FloatingNotificationBar\FloatingNotificationBarModule;
use StorePulse\StoreGrowth\Modules\FloatingNotificationBar\Settings\FloatingNotificationBarSettings;

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
		FloatingNotificationBarModule::class,
		FloatingNotificationBarSettings::class,
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
		$this->add_with_implements_tags( FloatingNotificationBarModule::get_id(), FloatingNotificationBarModule::class, true );
		// Always registered: the settings page and route work while the module is off.
		$this->add_with_implements_tags( FloatingNotificationBarSettings::class, FloatingNotificationBarSettings::class, true );
		$this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
	}
}
