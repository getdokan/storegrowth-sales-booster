<?php

namespace StorePulse\StoreGrowth\Integrations\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;

/**
 * ServiceProvider for the module.
 *
 * Registers and boots the module.
 *
 * @since 2.0.0
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer\Providers
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
		if ( function_exists( 'dokan' ) ) {
			$this->getContainer()->addServiceProvider( new DokanServiceProvider() );
		}
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
