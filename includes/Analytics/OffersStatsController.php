<?php
/**
 * Offer revenue for WooCommerce Analytics' Overview (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics;

use StorePulse\StoreGrowth\Analytics\Reports\Offers\Stats\DataStore as OffersStatsDataStore;
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
 * `GET wc-analytics/reports/spsg-offers/stats`: StoreGrowth offer totals for
 * a range, in the shape WooCommerce's stats endpoints have.
 *
 * Listed among WooCommerce's reports (`WcAnalytics::add_report()`), its
 * `net_revenue` total is marked as an indicator, so "StoreGrowth offer
 * revenue" shows in the Overview's Performance section (the merchant can
 * hide it there). With Dokan, the data store reads only the vendor the user
 * may see: a vendor their own orders, an admin the vendor picked.
 *
 * @since 3.0.0
 */
class OffersStatsController extends WP_REST_Controller {

	/**
	 * Report slug in WooCommerce's reports list.
	 */
	const SLUG = 'spsg-offers/stats';

	/**
	 * Route namespace (WooCommerce Analytics').
	 *
	 * @var string
	 */
	protected $namespace = 'wc-analytics';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'reports/' . self::SLUG;

	/**
	 * Register the route.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'permission_callback' => [ $this, 'get_items_permissions_check' ],
					'args'                => [
						'after'  => [
							'description' => __( 'Start of the range, as WooCommerce Analytics sends it.', 'storegrowth-sales-booster' ),
							'type'        => 'string',
							'format'      => 'date-time',
						],
						'before' => [
							'description' => __( 'End of the range, as WooCommerce Analytics sends it.', 'storegrowth-sales-booster' ),
							'type'        => 'string',
							'format'      => 'date-time',
						],
					],
				],
				'schema' => [ $this, 'get_public_item_schema' ],
			]
		);
	}

	/**
	 * Who can read WooCommerce's reports.
	 *
	 * @since 3.0.0
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return bool|WP_Error
	 */
	public function get_items_permissions_check( $request ) {
		if ( ! wc_rest_check_manager_permissions( 'reports', 'read' ) ) {
			return new WP_Error( 'woocommerce_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'storegrowth-sales-booster' ), [ 'status' => rest_authorization_required_code() ] );
		}

		return true;
	}

	/**
	 * Offer totals for the range.
	 *
	 * @since 3.0.0
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items( $request ) {
		$args = [];
		foreach ( [ 'after', 'before' ] as $key ) {
			if ( $request->get_param( $key ) ) {
				$args[ $key ] = $request->get_param( $key );
			}
		}

		$stats = ( new OffersStatsDataStore() )->get_data( $args );
		if ( is_wp_error( $stats ) ) {
			return $stats;
		}

		return rest_ensure_response(
			[
				'totals' => [
					'net_revenue'  => round( (float) ( $stats->totals->net_revenue ?? 0 ), 2 ),
					'items_sold'   => (int) ( $stats->totals->items_sold ?? 0 ),
					'orders_count' => (int) ( $stats->totals->orders_count ?? 0 ),
				],
			]
		);
	}

	/**
	 * Schema: the totals WooCommerce reads, `net_revenue` as an indicator.
	 *
	 * @since 3.0.0
	 *
	 * @return array
	 */
	public function get_item_schema() {
		return $this->add_additional_fields_schema(
			[
				'$schema'    => 'http://json-schema.org/draft-04/schema#',
				'title'      => 'report_spsg_offers_stats',
				'type'       => 'object',
				'properties' => [
					'totals' => [
						'description' => __( 'Totals for the range.', 'storegrowth-sales-booster' ),
						'type'        => 'object',
						'context'     => [ 'view', 'edit' ],
						'readonly'    => true,
						'properties'  => [
							'net_revenue'  => [
								'title'       => __( 'StoreGrowth offer revenue', 'storegrowth-sales-booster' ),
								'description' => __( 'Revenue from StoreGrowth offers: order bumps, BOGO gifts and Countdown Timer sales.', 'storegrowth-sales-booster' ),
								'type'        => 'number',
								'context'     => [ 'view', 'edit' ],
								'readonly'    => true,
								'indicator'   => true,
								'format'      => 'currency',
							],
							'items_sold'   => [
								'description' => __( 'Offer items sold.', 'storegrowth-sales-booster' ),
								'type'        => 'integer',
								'context'     => [ 'view', 'edit' ],
								'readonly'    => true,
							],
							'orders_count' => [
								'description' => __( 'Orders with an offer.', 'storegrowth-sales-booster' ),
								'type'        => 'integer',
								'context'     => [ 'view', 'edit' ],
								'readonly'    => true,
							],
						],
					],
				],
			]
		);
	}
}
