<?php

namespace StorePulse\StoreGrowth\Modules\SalesPop\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;
use StorePulse\StoreGrowth\Modules\SalesPop\Ajax;
use StorePulse\StoreGrowth\Modules\SalesPop\EnqueueScript;
use StorePulse\StoreGrowth\Modules\SalesPop\SalesPOP;

/**
 * BootstrapServiceProvider for the module.
 *
 * Registers and boots supporting services for the module.
 *
 * @since 2.0.0
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer\Providers
 */
class BootstrapServiceProvider extends BootableServiceProvider {

    /**
     * List of services provided by this provider.
     *
     * @since 2.0.0
     *
     * @var array<class-string>
     */
    protected $services = [
        EnqueueScript::class,
        Ajax::class,
        SalesPOP::class
    ];

    /**
     * Boot the service provider and supporting services.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function boot(): void {
        foreach ( $this->services as $service ) {
            $this->share_with_implements_tags( $service );
        }
    }

    /**
     * Register the service provider.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function register(): void {

    }
}
