<?php

namespace STOREGROWTH\SPSB\Modules\StockBar\Includes\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BootableServiceProvider;
use STOREGROWTH\SPSB\Modules\StockBar\Includes\Ajax;
use STOREGROWTH\SPSB\Modules\StockBar\Includes\CommonHooks;
use STOREGROWTH\SPSB\Modules\StockBar\Includes\EnqueueScript;

/**
 * BootstrapServiceProvider for the module.
 *
 * Registers and boots supporting services for the module.
 *
 * @since 2.0.0
 *
 * @package STOREGROWTH\SPSB\Modules\CountdownTimer\Includes\Providers
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
        CommonHooks::class,
        Ajax::class,
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
