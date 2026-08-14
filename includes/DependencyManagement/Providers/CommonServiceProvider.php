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
	protected $services = [
		ProductController::class,
		Upgrader::class,
	];

	/**
	 * Whether the services have already been registered.
	 *
	 * @since 2.1.2
	 *
	 * @var bool
	 */
	protected $is_registered = false;

	/**
	 * Boot the provider.
	 *
	 * Registration cannot be left to the container's lazy resolution: it only falls
	 * through to a service provider when no definition already carries the requested
	 * tag, and the module providers register their own `WP_REST_Controller` /
	 * `HookRegistry` definitions first, so this provider would never be asked.
	 *
	 * It also cannot run right now: `ProductController` extends a WooCommerce class,
	 * and the tags are derived from the parent chain, so WooCommerce must have
	 * declared its classes first.
	 *
	 * @inheritDoc
	 *
	 * @return void
	 */
	public function boot(): void {
		if ( did_action( 'woocommerce_loaded' ) ) {
			$this->register();

			return;
		}

		add_action( 'woocommerce_loaded', [ $this, 'register' ], 0 );
	}

	/**
	 * Register the classes.
	 */
	public function register(): void {
		if ( $this->is_registered ) {
			return;
		}

		$this->is_registered = true;

		foreach ( $this->services as $service ) {
			$this->share_with_implements_tags( $service );
		}
	}
}
