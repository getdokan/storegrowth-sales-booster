<?php

namespace STOREGROWTH\SPSB\Modules\QuickView\Includes\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BaseServiceProvider;
use STOREGROWTH\SPSB\Modules\QuickView\QuickViewModule;

/**
 * ServiceProvider for the module.
 *
 * Registers and boots the module.
 *
 * @since 2.0.0
 *
 * @package STOREGROWTH\SPSB\Modules\CountdownTimer\Includes\Providers
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
	    QuickViewModule::class,
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
        $this->add_with_implements_tags( QuickViewModule::get_id(), QuickViewModule::class, true );
    }
}
