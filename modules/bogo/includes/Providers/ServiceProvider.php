<?php

namespace STOREGROWTH\SPSB\Modules\BoGo\Includes\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BootableServiceProvider;
use STOREGROWTH\SPSB\Modules\BoGo\BoGoModule;

/**
 * ServiceProvider for the module.
 *
 * Registers and boots the module.
 *
 * @since 2.0.0
 *
 * @package STOREGROWTH\SPSB\Modules\CountdownTimer\Includes\Providers
 */
class ServiceProvider extends BootableServiceProvider {

    /**
     * List of services provided by this provider.
     *
     * @since 2.0.0
     *
     * @var array<class-string>
     */
    protected $services = [
	    BoGoModule::class,
    ];

    /**
     * Check if the provider offers the given alias.
     *
     * @since 2.0.0
     *
     * @param string $alias
     *
     * @return bool
     */
    public function provides( string $alias ): bool {
        if ( isset( $this->services[ $alias ] ) ) {
            return true;
        }

        if ( $alias === BoGoModule::get_id() ) {
            return true;
        }

        return parent::provides( $alias );
    }

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
        $this->add_with_implements_tags( BoGoModule::get_id(), BoGoModule::class, true );
    }
}
