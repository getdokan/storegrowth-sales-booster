<?php
/**
 * REST controller for the admin dashboard tiles.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\REST;

use StorePulse\StoreGrowth\ModuleManager;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * GET sales-booster/v1/dashboard/overview
 *
 * Revenue and template counts are `null` until their definitions are agreed;
 * the UI shows a dash for null.
 *
 * @since 3.0.0
 */
class DashboardController extends WP_REST_Controller {

	/**
	 * REST namespace.
	 *
	 * @since 3.0.0
	 *
	 * @var string
	 */
	protected $namespace = 'sales-booster/v1';

	/**
	 * REST base.
	 *
	 * @since 3.0.0
	 *
	 * @var string
	 */
	protected $rest_base = 'dashboard';

	/**
	 * Register the routes.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/overview',
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_overview' ],
					'permission_callback' => [ $this, 'permissions_check' ],
				],
			]
		);
	}

	/**
	 * Only administrators see the dashboard.
	 *
	 * @since 3.0.0
	 *
	 * @return bool
	 */
	public function permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Dashboard figures.
	 *
	 * @since 3.0.0
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function get_overview( $request ): WP_REST_Response {
		$manager = storegrowth_get_container()->get( ModuleManager::class );

		$overview = [
			'total_modules'  => count( $manager->get_all() ),
			'active_modules' => count( $manager->get_active_modules() ),
			'revenue'        => null,
			'templates'      => null,
		];

		/**
		 * Filters the admin dashboard figures.
		 *
		 * `revenue` is null or `[ 'amount' => float, 'formatted' => string ]`;
		 * `templates` is null or an integer.
		 *
		 * @since 3.0.0
		 *
		 * @param array           $overview Dashboard figures.
		 * @param WP_REST_Request $request  Request object.
		 */
		return rest_ensure_response( apply_filters( 'spsg_dashboard_overview', $overview, $request ) );
	}
}
