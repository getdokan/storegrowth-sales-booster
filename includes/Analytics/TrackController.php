<?php
/**
 * Storefront tracker endpoint (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Analytics;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `POST sales-booster/v1/analytics/track`: counts from the storefront tracker.
 *
 * Open to visitors, with no nonce: cached pages can't carry one. So it only
 * adds counts, takes known module / metric pairs for objects that exist,
 * caps a batch, and rate-limits per IP where a persistent object cache makes
 * that cheap. Counts it takes are estimates.
 *
 * @since 3.0.0
 */
class TrackController extends WP_REST_Controller {

	/**
	 * Route namespace.
	 */
	const NAMESPACE = 'sales-booster/v1';

	/**
	 * Route.
	 */
	const ROUTE = 'analytics/track';

	/**
	 * Most events in one request.
	 */
	const MAX_EVENTS = 50;

	/**
	 * Most a single event can add.
	 */
	const MAX_COUNT = 5;

	/**
	 * Most counts per IP per minute (with a persistent object cache).
	 */
	const RATE_LIMIT = 300;

	/**
	 * Register the route.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/' . self::ROUTE,
			[
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'track' ],
					'permission_callback' => '__return_true',
					'args'                => [
						'events' => [
							'type'     => 'array',
							'required' => true,
							'maxItems' => self::MAX_EVENTS,
						],
					],
				],
			]
		);
	}

	/**
	 * Metrics the storefront may count, by module, with the object they count.
	 *
	 * @since 3.0.0
	 *
	 * @return array<string, array<string, string>> Module id => [ metric => object type ].
	 */
	protected function allowed(): array {
		return [
			UpsellOrderBumpModule::get_id()           => [ 'view' => Counter::CAMPAIGN ],
			BoGoModule::get_id()                      => [ 'view' => Counter::CAMPAIGN ],
			CountdownTimerModule::get_id()            => [
				'view'        => Counter::PRODUCT,
				'add_to_cart' => Counter::PRODUCT,
			],
			ProgressiveDiscountBannerModule::get_id() => [
				'view'    => Counter::MODULE,
				'click'   => Counter::MODULE,
				'dismiss' => Counter::MODULE,
			],
		];
	}

	/**
	 * Add the counts.
	 *
	 * @since 3.0.0
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function track( $request ) {
		// Nothing is counted before the database update.
		if ( ! Schema::is_installed() ) {
			return new WP_REST_Response( [ 'accepted' => 0 ], 200 );
		}

		$counts = [];

		foreach ( (array) $request->get_param( 'events' ) as $event ) {
			$event = $this->valid_event( $event );
			if ( null === $event ) {
				continue;
			}

			$key            = implode( '|', array_slice( $event, 0, 4 ) );
			$counts[ $key ] = min( self::MAX_COUNT, ( $counts[ $key ] ?? 0 ) + $event['count'] );
		}

		if ( ! $this->within_rate_limit( (int) array_sum( $counts ) ) ) {
			return new WP_REST_Response( [ 'accepted' => 0 ], 429 );
		}

		foreach ( $counts as $key => $count ) {
			list( $module, $metric, $object_type, $object_id ) = explode( '|', $key );
			Counter::bump( $module, $metric, $object_type, (int) $object_id, $count );
		}

		return new WP_REST_Response( [ 'accepted' => count( $counts ) ], 200 );
	}

	/**
	 * An event the tracker may send, or null.
	 *
	 * @since 3.0.0
	 *
	 * @param mixed $event Raw event.
	 *
	 * @return array{module: string, metric: string, object_type: string, object_id: int, count: int}|null
	 */
	protected function valid_event( $event ): ?array {
		if ( ! is_array( $event ) ) {
			return null;
		}

		foreach ( [ 'module', 'metric', 'object_type', 'object_id', 'count' ] as $field ) {
			if ( isset( $event[ $field ] ) && ! is_scalar( $event[ $field ] ) ) {
				return null;
			}
		}

		$module      = sanitize_key( (string) ( $event['module'] ?? '' ) );
		$metric      = sanitize_key( (string) ( $event['metric'] ?? '' ) );
		$object_type = sanitize_key( (string) ( $event['object_type'] ?? '' ) );
		$object_id   = absint( $event['object_id'] ?? 0 );
		$count       = min( self::MAX_COUNT, max( 1, (int) ( $event['count'] ?? 1 ) ) );
		$allowed     = $this->allowed();

		if ( ( $allowed[ $module ][ $metric ] ?? '' ) !== $object_type || ! $this->object_exists( $module, $object_type, $object_id ) ) {
			return null;
		}

		return [
			'module'      => $module,
			'metric'      => $metric,
			'object_type' => $object_type,
			'object_id'   => $object_id,
			'count'       => $count,
		];
	}

	/**
	 * Whether the counted object exists.
	 *
	 * @since 3.0.0
	 *
	 * @param string $module      Module id.
	 * @param string $object_type `campaign` or `product`.
	 * @param int    $object_id   Object id.
	 *
	 * @return bool
	 */
	protected function object_exists( string $module, string $object_type, int $object_id ): bool {
		static $checked = [];

		$key = "{$module}|{$object_type}|{$object_id}";
		if ( isset( $checked[ $key ] ) ) {
			return $checked[ $key ];
		}

		$exists = false;

		if ( Counter::PRODUCT === $object_type ) {
			$product = $object_id ? wc_get_product( $object_id ) : null;
			$exists  = $product && 'publish' === get_post_status( $product->get_parent_id() ? $product->get_parent_id() : $product->get_id() );
		} elseif ( Counter::CAMPAIGN === $object_type && UpsellOrderBumpModule::get_id() === $module ) {
			$exists = $object_id && ! empty( ( new OrderBumpData() )->get_by_id( $object_id ) );
		} elseif ( Counter::CAMPAIGN === $object_type && BoGoModule::get_id() === $module ) {
			$exists = $object_id && ! empty( BogoDataManager::get_bogo_offer( $object_id ) );
		} elseif ( Counter::MODULE === $object_type ) {
			$exists = 0 === $object_id;
		}

		$checked[ $key ] = (bool) $exists;

		return $checked[ $key ];
	}

	/**
	 * Per-IP rate limit, only with a persistent object cache: without one
	 * each check would be an options-table write, and behind a CDN every
	 * visitor can share an IP.
	 *
	 * @since 3.0.0
	 *
	 * @param int $count Counts in this request.
	 *
	 * @return bool
	 */
	protected function within_rate_limit( int $count ): bool {
		if ( ! wp_using_ext_object_cache() || $count < 1 ) {
			return true;
		}

		$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		$key = 'spsg_track_' . md5( $ip . '|' . gmdate( 'YmdHi' ) );

		wp_cache_add( $key, 0, 'spsg_analytics', MINUTE_IN_SECONDS );
		$used = (int) wp_cache_incr( $key, $count, 'spsg_analytics' );

		return $used <= self::RATE_LIMIT;
	}
}
