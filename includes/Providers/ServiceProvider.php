<?php

namespace StorePulse\StoreGrowth\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;
use StorePulse\StoreGrowth\REST\ProductController;

class ServiceProvider extends BootableServiceProvider {

	/**
     * Tag for services added to the container.
     */

    protected $services = [
		ProductController::class => ProductController::class,
    ];

    /**
     * @inheritDoc
     *
     * @return void
     */
    public function boot(): void {
        foreach ( $this->services as $key => $service ) {
            $this->share_with_implements_tags( $service );
        }
    }

    /**
     * Register the classes.
     */
    public function register(): void {
		// register the services
    }
}
