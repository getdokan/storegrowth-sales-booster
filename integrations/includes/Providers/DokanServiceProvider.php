<?php

namespace STOREGROWTH\SPSB\Integrations\Providers;

use STOREGROWTH\SPSB\Integrations\Dokan\Dokan;
use STOREGROWTH\SPSB\Interfaces\HookRegistry;
use STOREGROWTH\SPSB\Modules\BoGo\Providers\BootstrapServiceProvider;
use STOREGROWTH\SPSB\Integrations\Dokan\Ajax;
use STOREGROWTH\SPSB\Integrations\Dokan\Api;
use STOREGROWTH\SPSB\Integrations\Dokan\Frontend\Frontend;
use STOREGROWTH\SPSB\Integrations\Dokan\Admin\EnqueueScript as AdminEnqueueScript;
use STOREGROWTH\SPSB\Integrations\Dokan\Dashboard\Dashboard;
use STOREGROWTH\SPSB\Integrations\Dokan\Dashboard\Bogo;
use STOREGROWTH\SPSB\Integrations\Dokan\Dashboard\EnqueueScript as DashboardEnqueueScript;

/**
 * BootstrapServiceProvider for the module.
 *
 * Registers and boots supporting services for the module.
 *
 * @since 2.0.0
 *
 * @package STOREGROWTH\SPSB\Modules\CountdownTimer\Includes\Providers
 */
class DokanServiceProvider extends BootstrapServiceProvider {
    /**
     * List of services provided by this provider.
     *
     * @since 2.0.0
     *
     * @var array<class-string>
     */
    protected $services = [
        Dokan::class,
        // Ajax::class,
        // Api::class,
        // Frontend::class,
        // AdminEnqueueScript::class,
        // Dashboard::class,
        // DashboardEnqueueScript::class,
        // Bogo::class,
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
		    if ( $service === Dokan::class ) {
			    $this->getContainer()->add( $service )
			         ->addTag( HookRegistry::class )
			         ->setShared( true );
		    } else {
			    $this->getContainer()->add( $service )->setShared( true );
		    }
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

