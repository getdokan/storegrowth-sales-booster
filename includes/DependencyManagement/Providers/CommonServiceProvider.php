<?php
/**
 * Common service provider.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\DependencyManagement\Providers;

use StorePulse\StoreGrowth\DependencyManagement\BootableServiceProvider;
use StorePulse\StoreGrowth\Upgrader;
use StorePulse\StoreGrowth\REST\ProductController;

/**
 * CommonServiceProvider Class
 *
 * Registers the services that are shared across the plugin, regardless of
 * which modules are active.
 */
class CommonServiceProvider extends BootableServiceProvider {

	/**
	 * Services added to the container.
	 *
	 * @var string[]
	 */
	protected $services = array(
		ProductController::class,
		Upgrader::class,
	);

	/**
	 * Boot the provider.
	 *
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
