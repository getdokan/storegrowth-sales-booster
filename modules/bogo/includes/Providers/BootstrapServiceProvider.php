<?php

namespace STOREGROWTH\SPSB\Modules\BoGo\Includes\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BootableServiceProvider;
use STOREGROWTH\SPSB\Modules\BoGo\Includes\Ajax;
use STOREGROWTH\SPSB\Modules\BoGo\Includes\Bogo;
use STOREGROWTH\SPSB\Modules\BoGo\Includes\OrderBogo;
use STOREGROWTH\SPSB\Modules\BoGo\Includes\EnqueueScript;
use STOREGROWTH\SPSB\Modules\BoGo\Includes\REST\BogoController;

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
        OrderBogo::class,
        Ajax::class,
        EnqueueScript::class,
        BogoController::class,
        Bogo::class,
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
        $this->getContainer()->add(Bogo::class);
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
