<?php
/**
 * REST routes of Smart Coupons.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons\REST;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\SmartCoupons\Settings\SmartCouponFields;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponRepository;
use StorePulse\StoreGrowth\Offers\OfferLimits;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use WC_Coupon;
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
 * `sales-booster/v1/smart-coupons`: the record routes every record list and
 * editor read (`X-WP-Total`, `X-SPSG-Can-Create`, `/editor`, `/status`,
 * `/batch`).
 *
 * @since SPSG_VERSION
 */
class SmartCouponsController extends WP_REST_Controller {

	/**
	 * Namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'sales-booster/v1';

	/**
	 * Base route.
	 *
	 * @var string
	 */
	protected $rest_base = 'smart-coupons';

	/**
	 * Register the routes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_routes(): void {
		$manage = [ $this, 'can_manage' ];

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'permission_callback' => $manage,
				],
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'create_item' ],
					'permission_callback' => $manage,
				],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/batch',
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'batch_items' ],
				'permission_callback' => $manage,
				'args'                => [
					'delete' => [
						'type'     => 'array',
						'items'    => [ 'type' => 'integer' ],
						'required' => true,
					],
				],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/editor',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_editor' ],
				'permission_callback' => $manage,
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>\d+)',
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_item' ],
					'permission_callback' => $manage,
				],
				[
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_item' ],
					'permission_callback' => $manage,
				],
				[
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => [ $this, 'delete_item' ],
					'permission_callback' => $manage,
				],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>\d+)/status',
			[
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => [ $this, 'update_status' ],
				'permission_callback' => $manage,
				'args'                => [
					'status' => [
						'description' => __( 'The new status; `yes` / `no` as the record list sends it.', 'storegrowth-sales-booster' ),
						'type'        => 'string',
						'enum'        => [ 'active', 'inactive', 'yes', 'no' ],
						'required'    => true,
					],
				],
			]
		);
	}

	/**
	 * Whether the user may manage coupons.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public function can_manage(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * A page of coupons.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ) );
		$per_page = $request->get_param( 'per_page' ) ? $per_page : 10;
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$result   = SmartCouponRepository::page( $page, $per_page, sanitize_text_field( (string) $request->get_param( 'search' ) ) );

		$ids = array_map(
			static function ( WC_Coupon $coupon ): int {
				return $coupon->get_id();
			},
			$result['coupons']
		);

		$given   = SmartCouponRepository::discount_given( $ids );
		$revenue = SmartCouponRepository::revenue( $ids );

		// Money as plain text in the store's price format, as the order bump list.
		$money = static function ( float $amount ): string {
			return html_entity_decode( wp_strip_all_tags( wc_price( $amount ) ), ENT_QUOTES, 'UTF-8' );
		};

		$items = array_map(
			static function ( WC_Coupon $coupon ) use ( $given, $revenue, $money ): array {
				return array_merge(
					SmartCouponRepository::to_response( $coupon ),
					[
						'discount_given' => $money( $given[ $coupon->get_id() ] ?? 0 ),
						'revenue'        => $money( $revenue[ $coupon->get_id() ] ?? 0 ),
					]
				);
			},
			$result['coupons']
		);

		$response = rest_ensure_response( $items );
		$response->header( 'X-WP-Total', (string) $result['total'] );
		$response->header( 'X-WP-TotalPages', (string) (int) ceil( $result['total'] / $per_page ) );
		// Code and link coupons are unlimited; a second automatic one asks to swap.
		$response->header( 'X-SPSG-Can-Create', '1' );

		return $response;
	}

	/**
	 * The editor: its page and fields, whether a coupon can be added, and
	 * the BOGO rules a Buy X get Y coupon can use.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_editor( $request ) {
		$rules = [];

		foreach ( BogoDataManager::get_bogo_offers( [], [ 'limit' => 100 ] ) as $rule ) {
			$rules[] = [
				'id'   => (int) $rule['id'],
				'name' => (string) ( $rule['name_of_order_bogo'] ?? $rule['name'] ?? '' ),
			];
		}

		return rest_ensure_response(
			array_merge(
				( new SmartCouponFields() )->get_editor(),
				[
					'can_create'   => true,
					// Whether the Pro options run (licence AND StoreGrowth Pro answering).
					'pro_options'  => SmartCoupon::pro_options_available(),
					// Free: the automatic coupon a second one would be swapped with.
					'automatic_on' => SmartCouponRepository::automatic_switched_on(),
					'bogo_active'  => Helper::is_module_active( BoGoModule::get_id() ),
					'bogo_rules'   => $rules,
					'currency'     => html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8' ),
				]
			)
		);
	}

	/**
	 * One coupon.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$coupon = $this->get_coupon( $request );

		return is_wp_error( $coupon ) ? $coupon : rest_ensure_response( SmartCouponRepository::to_response( $coupon ) );
	}

	/**
	 * Create a coupon. Free has no cap on code and link coupons; a second
	 * active automatic one pauses live (the editor asks to swap first).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$coupon = SmartCouponRepository::save( $this->sent_params( $request ) );

		if ( is_wp_error( $coupon ) ) {
			return $coupon;
		}

		$response = rest_ensure_response( SmartCouponRepository::to_response( $coupon ) );
		$response->set_status( 201 );

		return $response;
	}

	/**
	 * Change a coupon: what is sent, over what is stored.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$coupon = $this->get_coupon( $request );

		if ( is_wp_error( $coupon ) ) {
			return $coupon;
		}

		$saved = SmartCouponRepository::save( $this->sent_params( $request ), $coupon );

		return is_wp_error( $saved ) ? $saved : rest_ensure_response( SmartCouponRepository::to_response( $saved ) );
	}

	/**
	 * Turn a coupon on or off (the list's switch).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_status( $request ) {
		$coupon = $this->get_coupon( $request );

		if ( is_wp_error( $coupon ) ) {
			return $coupon;
		}

		$active = in_array( $request->get_param( 'status' ), [ 'active', 'yes' ], true );

		SmartCouponRepository::set_active( $coupon, $active );

		return rest_ensure_response(
			[
				'id'     => $coupon->get_id(),
				'status' => $active ? 'active' : 'inactive',
			]
		);
	}

	/**
	 * Delete a coupon.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item( $request ) {
		$coupon = $this->get_coupon( $request );

		if ( is_wp_error( $coupon ) ) {
			return $coupon;
		}

		if ( ! SmartCouponRepository::delete( $coupon ) ) {
			return new WP_Error( 'smart_coupon_delete_failed', __( 'The coupon could not be deleted.', 'storegrowth-sales-booster' ), [ 'status' => 500 ] );
		}

		return new WP_REST_Response( null, 204 );
	}

	/**
	 * Delete several coupons.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function batch_items( $request ) {
		$deleted = [];
		$failed  = [];

		foreach ( array_unique( array_map( 'absint', (array) $request->get_param( 'delete' ) ) ) as $id ) {
			$coupon = SmartCouponRepository::find( $id );

			if ( $coupon && SmartCouponRepository::delete( $coupon ) ) {
				$deleted[] = $id;
			} else {
				$failed[] = $id;
			}
		}

		return rest_ensure_response(
			[
				'deleted' => $deleted,
				'failed'  => $failed,
			]
		);
	}

	/**
	 * The coupon of the request's `id`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WC_Coupon|WP_Error
	 */
	private function get_coupon( $request ) {
		$coupon = SmartCouponRepository::find( (int) $request->get_param( 'id' ) );

		return $coupon ?? new WP_Error( 'smart_coupon_not_found', __( 'Coupon not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
	}

	/**
	 * The values the request sends.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return array
	 */
	private function sent_params( $request ): array {
		$sent = array_merge( (array) $request->get_body_params(), (array) $request->get_json_params() );

		unset( $sent['id'] );

		return $sent;
	}
}
