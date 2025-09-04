<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\Migration;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi\ServiceProvider as RestApiServiceProvider;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi\OrderBumpAjax;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi\OrderBumpController;

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
        OrderBumpData::class,
        RestApiServiceProvider::class,
        OrderBumpAjax::class,
        OrderBumpController::class,
    ];

    /**
     * Boot the service provider.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function boot(): void {
        // Run database migration
        Migration::run_migration();
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
        
        // Register data access class
        $this->container->addShared( OrderBumpData::class );
        
        // Register REST API service provider
        $this->container->addShared( RestApiServiceProvider::class );
        
        // Register AJAX handler for frontend operations
        $this->container->addShared( OrderBumpAjax::class );
        
        // Register REST API controller
        $this->container->addShared( OrderBumpController::class );
    }
}
