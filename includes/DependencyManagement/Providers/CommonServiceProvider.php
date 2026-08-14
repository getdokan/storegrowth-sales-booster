<?php

namespace StorePulse\StoreGrowth\DependencyManagement\Providers;

use StorePulse\StoreGrowth\Attribution\OfferAttribution;
use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;
use StorePulse\StoreGrowth\REST\ProductController;

class CommonServiceProvider extends BootableServiceProvider {

	/**
     * Tag for services added to the container.
     */

    protected $services = [
		ProductController::class,
		OfferAttribution::class,
    ];

    /**
     * @inheritDoc
     *
     * @return void
     */
    public function boot(): void {

    }

    /**
     * Register the classes.
     */
    public function register(): void {
		foreach ( $this->services as $service ) {
            $this->share_with_implements_tags( $service );
        }
    }
}
