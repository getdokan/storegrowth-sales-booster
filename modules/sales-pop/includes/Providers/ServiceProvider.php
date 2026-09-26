<?php

namespace StorePulse\StoreGrowth\Modules\SalesPop\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\SalesPop\AdminPage;
use StorePulse\StoreGrowth\Modules\SalesPop\REST\SourceProductsController;
use StorePulse\StoreGrowth\Modules\SalesPop\SalesPopModule;
use StorePulse\StoreGrowth\Modules\SalesPop\Settings\SalesPopSettings;

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
	    SalesPopModule::class,
	    SalesPopSettings::class,
	    AdminPage::class,
	    SourceProductsController::class,
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
        $this->add_with_implements_tags( SalesPopModule::get_id(), SalesPopModule::class, true );
        // Always registered: the settings page and its routes work while the module is off.
        $this->add_with_implements_tags( SalesPopSettings::class, SalesPopSettings::class, true );
        $this->add_with_implements_tags( AdminPage::class, AdminPage::class, true );
        $this->add_with_implements_tags( SourceProductsController::class, SourceProductsController::class, true );
    }
}
