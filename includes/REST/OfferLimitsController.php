<?php
/**
 * REST routes behind "Choose offers".
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\REST;

use StorePulse\StoreGrowth\Offers\OfferLimits;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lists the offers under each Free limit and saves which ones stay on.
 *
 * @since 3.1.0
 */
class OfferLimitsController extends WP_REST_Controller {

	/**
	 * Route namespace.
	 *
	 * @since 3.1.0
	 *
	 * @var string
	 */
	protected $namespace = 'sales-booster/v1';

	/**
	 * Route base.
	 *
	 * @since 3.1.0
	 *
	 * @var string
	 */
	protected $rest_base = 'offer-limits';

	/**
	 * Register the routes.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'permission_callback' => [ $this, 'get_items_permissions_check' ],
				],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<kind>[a-z_]+)',
			[
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'choose_offers' ],
					'permission_callback' => [ $this, 'get_items_permissions_check' ],
					'args'                => [
						'keep' => [
							'description' => __( 'Ids of the offers that stay on.', 'storegrowth-sales-booster' ),
							'type'        => 'array',
							'items'       => [ 'type' => 'integer' ],
							'required'    => true,
						],
					],
				],
			]
		);
	}

	/**
	 * Each limited kind with its offers and chips.
	 *
	 * @since 3.1.0
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		return rest_ensure_response( OfferLimits::overview() );
	}

	/**
	 * Save which offers of a kind stay on.
	 *
	 * @since 3.1.0
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function choose_offers( $request ) {
		$saved = OfferLimits::choose( (string) $request['kind'], (array) $request['keep'] );

		return is_wp_error( $saved ) ? $saved : rest_ensure_response( OfferLimits::overview() );
	}

	/**
	 * Whether the user may see and choose offers.
	 *
	 * @since 3.1.0
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return bool
	 */
	public function get_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}
}
