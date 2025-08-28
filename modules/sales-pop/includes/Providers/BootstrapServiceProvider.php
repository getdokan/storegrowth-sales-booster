<?php

namespace STOREGROWTH\SPSB\Modules\SalesPop\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BootableServiceProvider;
use STOREGROWTH\SPSB\Modules\SalesPop\Ajax;
use STOREGROWTH\SPSB\Modules\SalesPop\EnqueueScript;
use STOREGROWTH\SPSB\Modules\SalesPop\SalesPOP;

/**
 * BootstrapServiceProvider for the module.
 *
 * Registers and boots supporting services for the module.
 *
 * @since 2.0.0
 *
 * @package STOREGROWTH\SPSB\Modules\CountdownTimer\Providers
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
