<?php

namespace StorePulse\StoreGrowth\Modules\StockBar\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\StockBar\AdminPage;
use StorePulse\StoreGrowth\Modules\StockBar\Settings\StockBarSettings;
use StorePulse\StoreGrowth\Modules\StockBar\StockBarModule;

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
	    StockBarModule::class,
	    StockBarSettings::class,
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
        $this->add_with_implements_tags( StockBarModule::get_id(), StockBarModule::class, true );
        // Always registered, so the settings route and page work while the module is off.
        $this->add_with_implements_tags( StockBarSettings::class, StockBarSettings::class, true );
        $this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
    }
}
