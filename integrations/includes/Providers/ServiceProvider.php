<?php

namespace STOREGROWTH\SPSB\Integrations\Providers;

use STOREGROWTH\SPSB\DependencyManagement\BootableServiceProvider;

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
     * Tag for services added to the container.
     */

    protected $services = [

    ];

    /**
     * @inheritDoc
     *
     * @return void
     */
    public function boot(): void {
        $this->getContainer()->addServiceProvider( new DokanServiceProvider() );
    }

    /**
     * Register the classes.
     */
    public function register(): void {
        foreach ( $this->services as $key => $class_name ) {
            $this->getContainer()->addShared( $key, $class_name );
        }
    }
}
