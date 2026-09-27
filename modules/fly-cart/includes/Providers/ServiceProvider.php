<?php

namespace StorePulse\StoreGrowth\Modules\FlyCart\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\FlyCart\AdminPage;
use StorePulse\StoreGrowth\Modules\FlyCart\FlyCartModule;
use StorePulse\StoreGrowth\Modules\FlyCart\Settings\FlyCartSettings;

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
	    FlyCartModule::class,
	    FlyCartSettings::class,
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
        $this->add_with_implements_tags( FlyCartModule::get_id(), FlyCartModule::class, true );
        // Always loaded: the settings page works while the module is off.
        $this->add_with_implements_tags( FlyCartSettings::class, FlyCartSettings::class, true );
        $this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
    }
}
