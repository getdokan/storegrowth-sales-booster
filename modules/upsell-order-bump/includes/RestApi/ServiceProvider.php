<?php
/**
 * REST API Service Provider for Order Bump module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi;

use StorePulse\StoreGrowth\DependencyManagement\BaseServiceProvider;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API Service Provider for Order Bump module.
 */
class ServiceProvider extends BaseServiceProvider implements HookRegistry {

	/**
	 * Register services.
	 */
	public function register(): void {
		// Services are registered in the main ServiceProvider
	}

	/**
	 * Boot services.
	 */
	public function boot() {
		// Register REST API routes
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Register REST API routes.
	 */
	public function register_rest_routes() {
		$controller = new OrderBumpController();
		$controller->register_routes();
	}

	/**
	 * Register hooks.
	 */
	public function register_hooks(): void {
		$this->boot();
	}
}
