<?php

namespace StorePulse\StoreGrowth\Modules\CountdownTimer\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\CountdownTimer\AdminPage;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Modules\CountdownTimer\Settings\CountdownTimerSettings;

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
        CountdownTimerModule::class,
        CountdownTimerSettings::class,
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
        $this->add_with_implements_tags( CountdownTimerModule::get_id(), CountdownTimerModule::class, true );
        // Always registered, so the settings route works while the module is off.
        $this->add_with_implements_tags( CountdownTimerSettings::class, CountdownTimerSettings::class, true );
        // Always registered: the settings page works while the module is off.
        $this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
    }
}
