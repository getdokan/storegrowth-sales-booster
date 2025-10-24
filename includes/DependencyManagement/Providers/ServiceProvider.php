<?php

namespace StorePulse\StoreGrowth\DependencyManagement\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;

/**
 * ServiceProvider Class
 *
 * Manages the registration and booting of Dokan's core services within the container.
 * This service provider handles the core services with the Dokan's
 * dependency injection container.
 */
class ServiceProvider extends BootableServiceProvider {
    /**
     * Tag for services added to the container.
     */
    public const TAG = 'container-service';

    protected $services = [

    ];

    /**
     * @inheritDoc
     *
     * @return void
     */
    public function boot(): void {
        $this->getContainer()->addServiceProvider( new AjaxServiceProvider() );
        $this->getContainer()->addServiceProvider( new ModuleServiceProvider() );
		$this->getContainer()->addServiceProvider( new CommonServiceProvider() );
    }

    /**
     * {@inheritDoc}
     *
     * Check if the service provider can provide the given service alias.
     *
     * @param string $alias The service alias to check.
     * @return bool True if the service provider can provide the service, false otherwise.
     */
    public function provides( string $alias ): bool {
        if ( isset( $this->services[ $alias ] ) ) {
            return true;
        }

        return parent::provides( $alias );
    }

    /**
     * Register the classes.
     */
    public function register(): void {
        foreach ( $this->services as $key => $class_name ) {
            $this->getContainer()->addShared( $key, $class_name )->addTag( self::TAG );
        }
    }
}
