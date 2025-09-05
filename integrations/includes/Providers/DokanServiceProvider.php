<?php

namespace StorePulse\StoreGrowth\Integrations\Providers;

use StorePulse\StoreGrowth\Integrations\Dokan\Dokan;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\BoGo\Providers\BootstrapServiceProvider;
use StorePulse\StoreGrowth\Integrations\Dokan\Ajax;
use StorePulse\StoreGrowth\Integrations\Dokan\Api;
use StorePulse\StoreGrowth\Integrations\Dokan\Frontend\Frontend;
use StorePulse\StoreGrowth\Integrations\Dokan\Admin\EnqueueScript as AdminEnqueueScript;
use StorePulse\StoreGrowth\Integrations\Dokan\Dashboard\Dashboard;
use StorePulse\StoreGrowth\Integrations\Dokan\Dashboard\Bogo;
use StorePulse\StoreGrowth\Integrations\Dokan\Dashboard\EnqueueScript as DashboardEnqueueScript;

/**
 * BootstrapServiceProvider for the module.
 *
 * Registers and boots supporting services for the module.
 *
 * @since 2.0.0
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer\Providers
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

