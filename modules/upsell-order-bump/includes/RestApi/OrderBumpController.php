<?php
/**
 * REST API Controller for Order Bumps.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi;

use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBump;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpDesign;
use WC_Product;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API Controller for Order Bumps.
 *
 * The same routes under `sales-booster/v1/order-bumps` and, kept for the
 * 2.x admin and any client of it, `spsg/v1/order-bumps`.
 */
class OrderBumpController extends WP_REST_Controller {

	/**
	 * The namespaces the routes are registered under.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const NAMESPACES = [ 'sales-booster/v1', 'spsg/v1' ];

	/**
	 * The namespace of this controller's route.
	 *
	 * @var string
	 */
	protected $namespace = 'spsg/v1';

	/**
	 * The base of this controller's route.
	 *
	 * @var string
	 */
	protected $rest_base = 'order-bumps';

	/**
	 * OrderBumpData instance.
	 *
	 * @var OrderBumpData
	 */
	private $order_bump_data;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->order_bump_data = new OrderBumpData();
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		foreach ( self::NAMESPACES as $route_namespace ) {
			$this->register_namespace_routes( $route_namespace );
		}
	}

	/**
	 * Register the routes under one namespace.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $route_namespace REST namespace.
	 *
	 * @return void
	 */
	protected function register_namespace_routes( $route_namespace ) {
		$id_arg = [
			'id' => [
				'description' => __( 'Unique identifier for the order bump.', 'storegrowth-sales-booster' ),
				'type'        => 'integer',
			],
		];

		register_rest_route(
			$route_namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'permission_callback' => [ $this, 'get_items_permissions_check' ],
					'args'                => $this->get_collection_params(),
				],
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'create_item' ],
					'permission_callback' => [ $this, 'create_item_permissions_check' ],
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
				],
			]
		);

		// Bulk actions from the list: `{ delete: [ ids ] }`.
		register_rest_route(
			$route_namespace,
			'/' . $this->rest_base . '/batch',
			[
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'batch_items' ],
					'permission_callback' => [ $this, 'delete_item_permissions_check' ],
					'args'                => [
						'delete' => [
							'type'     => 'array',
							'items'    => [ 'type' => 'integer' ],
							'required' => true,
						],
					],
				],
			]
		);

		// What the editor needs besides a bump.
		register_rest_route(
			$route_namespace,
			'/' . $this->rest_base . '/editor',
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_editor' ],
					'permission_callback' => [ $this, 'get_items_permissions_check' ],
				],
			]
		);

		register_rest_route(
			$route_namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			[
				'args' => $id_arg,
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_item' ],
					'permission_callback' => [ $this, 'get_item_permissions_check' ],
				],
				[
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_item' ],
					'permission_callback' => [ $this, 'update_item_permissions_check' ],
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				],
				[
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => [ $this, 'delete_item' ],
					'permission_callback' => [ $this, 'delete_item_permissions_check' ],
				],
			]
		);

		// The list's status switch (POST, PUT or PATCH).
		register_rest_route(
			$route_namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/status',
			[
				'args' => $id_arg,
				[
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_status' ],
					'permission_callback' => [ $this, 'update_item_permissions_check' ],
					'args'                => [
						'status' => [
							'description' => __( 'The new status; `yes` / `no` as the BOGO list sends it.', 'storegrowth-sales-booster' ),
							'type'        => 'string',
							'enum'        => [ 'active', 'inactive', 'yes', 'no' ],
							'required'    => true,
						],
					],
				],
			]
		);

		register_rest_route(
			$route_namespace,
			'/' . $this->rest_base . '/matching',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_matching_bumps' ],
				'permission_callback' => [ $this, 'get_items_permissions_check' ],
				'args'                => [
					'cart_products'   => [
						'description' => __( 'Array of product IDs in cart.', 'storegrowth-sales-booster' ),
						'type'        => 'array',
						'items'       => [ 'type' => 'integer' ],
						'required'    => true,
					],
					'cart_categories' => [
						'description' => __( 'Array of category IDs in cart.', 'storegrowth-sales-booster' ),
						'type'        => 'array',
						'items'       => [ 'type' => 'integer' ],
						'required'    => true,
					],
				],
			]
		);
	}

	/**
	 * Get a collection of order bumps: `status` and `search` filtered, paged,
	 * with `X-WP-Total` / `X-WP-TotalPages` (always, 0 included) and
	 * `X-SPSG-Can-Create` (whether a create would pass lite's limit).
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ) {
		$per_page = max( 1, (int) $request->get_param( 'per_page' ) );
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$filters  = [
			'status' => $request->get_param( 'status' ),
			// Not `sanitize_text_field()`: it strips `<…`, which a name can
			// hold. The query escapes it (`esc_like()` in a prepared LIKE).
			'search' => trim( wp_check_invalid_utf8( (string) $request->get_param( 'search' ) ) ),
		];

		$total = $this->order_bump_data->get_count( $filters );
		$bumps = $this->order_bump_data->get_all(
			array_merge(
				$filters,
				[
					'limit'    => $per_page,
					'offset'   => ( $page - 1 ) * $per_page,
					'order_by' => $request->get_param( 'orderby' ),
					'order'    => $request->get_param( 'order' ),
				]
			)
		);

		$data = [];
		foreach ( $bumps as $bump ) {
			$data[] = $this->prepare_response_for_collection( $this->prepare_item_for_response( $bump, $request ) );
		}

		$response = rest_ensure_response( $data );
		$response->header( 'X-WP-Total', (string) $total );
		$response->header( 'X-WP-TotalPages', (string) (int) ceil( $total / $per_page ) );
		$response->header( 'X-SPSG-Can-Create', $this->order_bump_data->can_create() ? '1' : '0' );

		return $response;
	}

	/**
	 * What the editor needs besides a bump: whether a new bump would pass
	 * lite's limit, and the store's price format for the preview. Its page
	 * and fields come with the editor.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_editor( $request ) {
		return rest_ensure_response(
			[
				'can_create' => $this->order_bump_data->can_create(),
				'currency'   => [
					'symbol'             => html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8' ),
					'position'           => get_option( 'woocommerce_currency_pos', 'left' ),
					'decimals'           => wc_get_price_decimals(),
					'decimal_separator'  => wc_get_price_decimal_separator(),
					'thousand_separator' => wc_get_price_thousand_separator(),
				],
			]
		);
	}

	/**
	 * Get a single order bump.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $request ) {
		$bump = $this->get_bump( $request );
		if ( is_wp_error( $bump ) ) {
			return $bump;
		}

		return $this->prepare_item_for_response( $bump, $request );
	}

	/**
	 * Create a single order bump. Lite keeps two bumps (any status): at the
	 * limit, a create gets 403 `salesbooster_limit_exceeded`.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function create_item( $request ) {
		if ( ! $this->order_bump_data->can_create() ) {
			return new WP_Error(
				'salesbooster_limit_exceeded',
				__( 'Order bump limit exceeded. Upgrade to PRO for unlimited order bumps.', 'storegrowth-sales-booster' ),
				[ 'status' => 403 ]
			);
		}

		$sent = $this->sent_params( $request );
		$data = array_merge(
			[
				'status'            => 'active',
				'target_type'       => 'products',
				'target_products'   => [],
				'target_categories' => [],
				'offer_type'        => 'discount',
				'offer_amount'      => 0,
			],
			$sent
		);

		$data['design_settings'] = array_merge( OrderBumpDesign::get_defaults(), $this->sent_design( $sent ) );

		$data = $this->prepare_bump_for_database( $data, $sent );

		$rules = $this->check_bump_rules( $data );
		if ( is_wp_error( $rules ) ) {
			return $rules;
		}

		$id = $this->order_bump_data->create( $data );

		if ( ! $id ) {
			return new WP_Error(
				'rest_order_bump_create_failed',
				__( 'Failed to create order bump.', 'storegrowth-sales-booster' ),
				[ 'status' => 500 ]
			);
		}

		$response = $this->prepare_item_for_response( $this->order_bump_data->get_by_id( $id ), $request );
		$response->set_status( 201 );

		return $response;
	}

	/**
	 * Update a single order bump: a merge of what the request sends over the
	 * stored bump, `design_settings` key by key (it used to replace the whole
	 * design, and a partial one wiped the rest).
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function update_item( $request ) {
		$bump = $this->get_bump( $request );
		if ( is_wp_error( $bump ) ) {
			return $bump;
		}

		$sent = $this->sent_params( $request );
		$data = array_merge( $this->to_request_data( $bump ), $sent );

		$data['design_settings'] = array_merge( $bump['design_settings'], $this->sent_design( $sent ) );

		$data = $this->prepare_bump_for_database( $data, $sent );

		// Only the rules about what the request changes: a bump stored before
		// them can still be renamed.
		$rules = $this->check_bump_rules( $data, $sent );
		if ( is_wp_error( $rules ) ) {
			return $rules;
		}

		if ( ! $this->order_bump_data->update( $bump['id'], $data ) ) {
			return new WP_Error(
				'rest_order_bump_update_failed',
				__( 'Failed to update order bump.', 'storegrowth-sales-booster' ),
				[ 'status' => 500 ]
			);
		}

		return $this->prepare_item_for_response( $this->order_bump_data->get_by_id( $bump['id'] ), $request );
	}

	/**
	 * Turn an order bump on or off (the list's switch). Lite's limit doesn't
	 * apply: it counts bumps of any status.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_status( $request ) {
		$bump = $this->get_bump( $request );
		if ( is_wp_error( $bump ) ) {
			return $bump;
		}

		$status = in_array( $request->get_param( 'status' ), [ 'active', 'yes' ], true ) ? 'active' : 'inactive';

		if ( ! $this->order_bump_data->update( $bump['id'], [ 'status' => $status ] ) ) {
			return new WP_Error(
				'rest_order_bump_update_failed',
				__( 'Failed to update order bump.', 'storegrowth-sales-booster' ),
				[ 'status' => 500 ]
			);
		}

		return rest_ensure_response(
			[
				'id'     => (int) $bump['id'],
				'status' => $status,
			]
		);
	}

	/**
	 * Delete a single order bump.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function delete_item( $request ) {
		$bump = $this->get_bump( $request );
		if ( is_wp_error( $bump ) ) {
			return $bump;
		}

		if ( ! $this->order_bump_data->delete( $bump['id'] ) ) {
			return new WP_Error(
				'rest_order_bump_delete_failed',
				__( 'Failed to delete order bump.', 'storegrowth-sales-booster' ),
				[ 'status' => 500 ]
			);
		}

		return new WP_REST_Response( null, 204 );
	}

	/**
	 * Bulk actions: delete the given bumps, each through the same checks as a
	 * single delete.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response
	 */
	public function batch_items( $request ) {
		$deleted = [];
		$failed  = [];

		foreach ( array_unique( array_map( 'absint', (array) $request->get_param( 'delete' ) ) ) as $id ) {
			$bump = $id ? $this->order_bump_data->get_by_id( $id ) : null;

			if ( ! $bump || is_wp_error( $this->check_item_permission( $bump, $request ) ) || ! $this->order_bump_data->delete( $id ) ) {
				$failed[] = $id;
				continue;
			}

			$deleted[] = $id;
		}

		return rest_ensure_response(
			[
				'deleted' => $deleted,
				'failed'  => $failed,
			]
		);
	}

	/**
	 * Get matching order bumps for cart products.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_matching_bumps( $request ) {
		$cart_products   = $request->get_param( 'cart_products' );
		$cart_categories = $request->get_param( 'cart_categories' );

		$matching_bumps = $this->order_bump_data->get_matching_bumps( $cart_products, $cart_categories );

		return rest_ensure_response( $matching_bumps );
	}

	/**
	 * The bump of the request's `id`, when it exists and the user may change
	 * it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return array|WP_Error
	 */
	protected function get_bump( $request ) {
		$bump = $this->order_bump_data->get_by_id( (int) $request->get_param( 'id' ) );

		if ( ! $bump ) {
			return new WP_Error(
				'rest_order_bump_not_found',
				__( 'Order bump not found.', 'storegrowth-sales-booster' ),
				[ 'status' => 404 ]
			);
		}

		$permission = $this->check_item_permission( $bump, $request );

		return is_wp_error( $permission ) ? $permission : $bump;
	}

	/**
	 * Whether the user may read or change this bump, past the route's
	 * capability check. Every administrator may; a subclass (e.g. per vendor)
	 * narrows it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array           $bump    Stored bump.
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return true|WP_Error
	 */
	protected function check_item_permission( $bump, $request ) {
		return true;
	}

	/**
	 * The values the request sends (body or JSON), without the route's
	 * defaults and the URL's `id`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return array
	 */
	protected function sent_params( $request ) {
		$sent = array_merge( (array) $request->get_body_params(), (array) $request->get_json_params() );
		unset( $sent['id'] );

		return $sent;
	}

	/**
	 * The `design_settings` a request sends, or none.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $sent What the request sends.
	 *
	 * @return array
	 */
	protected function sent_design( $sent ) {
		return isset( $sent['design_settings'] ) && is_array( $sent['design_settings'] ) ? $sent['design_settings'] : [];
	}

	/**
	 * A stored bump in the shape the routes take, so an update can start from
	 * it and change only what the request sends.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $bump Stored bump.
	 *
	 * @return array
	 */
	protected function to_request_data( $bump ) {
		return [
			'name'                 => $bump['name'],
			'status'               => $bump['status'],
			'target_type'          => $bump['target_type'],
			'target_products'      => $bump['target_products'],
			'target_categories'    => $bump['target_categories'],
			'offer_product_id'     => (int) $bump['offer_product_id'],
			'offer_type'           => $bump['offer_type'],
			'offer_amount'         => (float) $bump['offer_amount'],
			'offer_discount_title' => $bump['offer_discount_title'],
		];
	}

	/**
	 * Normalize a bump before it's checked and saved:
	 *
	 * - texts as plain text (the 2.x admin sent them entity-encoded);
	 * - `free` forces the amount to 0;
	 * - the discount title in the column and in `design_settings` (the
	 *   storefront reads the latter);
	 * - the offer product's title, image and regular price copied into
	 *   `design_settings`, which the checkout box reads;
	 * - `design_settings` sanitized key by key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $data Bump data: the stored bump (or defaults) merged with what is sent.
	 * @param array $sent What the request sends.
	 *
	 * @return array
	 */
	protected function prepare_bump_for_database( $data, $sent ) {
		$design = $data['design_settings'];

		$data['name']              = OrderBumpDesign::sanitize_text( $data['name'] ?? '' );
		$data['target_products']   = array_values( array_filter( array_map( 'absint', (array) $data['target_products'] ) ) );
		$data['target_categories'] = array_values( array_filter( array_map( 'absint', (array) $data['target_categories'] ) ) );
		$data['offer_product_id']  = absint( $data['offer_product_id'] ?? 0 );
		$data['offer_amount']      = 'free' === $data['offer_type'] ? 0 : (float) $data['offer_amount'];

		// Sent at the top level, else in the design (the 2.x admin), else stored.
		if ( array_key_exists( 'offer_discount_title', $sent ) ) {
			$title = $sent['offer_discount_title'];
		} elseif ( isset( $design['offer_discount_title'] ) ) {
			$title = $design['offer_discount_title'];
		} else {
			$title = $data['offer_discount_title'] ?? '';
		}
		$design['offer_discount_title'] = OrderBumpDesign::sanitize_text( $title );
		$data['offer_discount_title']   = $design['offer_discount_title'];

		$product = $data['offer_product_id'] ? wc_get_product( $data['offer_product_id'] ) : null;
		if ( $product ) {
			$image_url = $product->get_image_id() ? wp_get_attachment_url( $product->get_image_id() ) : '';

			$design['offer_product_title']         = $product->get_name();
			$design['offer_image_url']             = $image_url ? $image_url : '';
			$design['offer_product_regular_price'] = $product->get_regular_price();
		}

		$data['design_settings'] = OrderBumpDesign::sanitize( $design );

		return $data;
	}

	/**
	 * The editor's rules: a create checks them all, an update those about the
	 * keys it sends.
	 *
	 * - The bump has a name.
	 * - It targets at least one product or category, as its type says.
	 * - The offer product exists and can be a cart line of its own (not a
	 *   variable, grouped or external product).
	 * - A percentage discount is more than 0 and at most 100; a fixed price
	 *   isn't negative.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array      $data Normalized bump data.
	 * @param array|null $sent What an update sends; null for a create.
	 *
	 * @return true|WP_Error
	 */
	protected function check_bump_rules( $data, $sent = null ) {
		$sends = static function ( array $keys ) use ( $sent ) {
			return null === $sent || (bool) array_intersect_key( $sent, array_flip( $keys ) );
		};

		if ( $sends( [ 'name' ] ) && '' === trim( $data['name'] ) ) {
			return new WP_Error(
				'order_bump_missing_name',
				__( 'Enter a name for the order bump.', 'storegrowth-sales-booster' ),
				[ 'status' => 400 ]
			);
		}

		$targets = 'categories' === $data['target_type'] ? $data['target_categories'] : $data['target_products'];
		if ( $sends( [ 'target_type', 'target_products', 'target_categories' ] ) && empty( $targets ) ) {
			return new WP_Error(
				'order_bump_missing_target',
				'categories' === $data['target_type']
					? __( 'Select at least one target category.', 'storegrowth-sales-booster' )
					: __( 'Select at least one target product.', 'storegrowth-sales-booster' ),
				[ 'status' => 400 ]
			);
		}

		$product = $data['offer_product_id'] ? wc_get_product( $data['offer_product_id'] ) : null;
		if ( $sends( [ 'offer_product_id' ] ) && ( ! $product || $product->is_type( [ 'variable', 'grouped', 'external' ] ) ) ) {
			return new WP_Error(
				'order_bump_invalid_offer_product',
				__( 'Select the offer product (a simple product or a variation).', 'storegrowth-sales-booster' ),
				[ 'status' => 400 ]
			);
		}

		$amount = (float) $data['offer_amount'];
		if ( $sends( [ 'offer_type', 'offer_amount' ] ) && 'discount' === $data['offer_type'] && ( $amount <= 0 || $amount > 100 ) ) {
			return new WP_Error(
				'order_bump_invalid_discount',
				__( 'Enter a discount from 1 to 100%.', 'storegrowth-sales-booster' ),
				[ 'status' => 400 ]
			);
		}

		if ( $sends( [ 'offer_type', 'offer_amount' ] ) && 'price' === $data['offer_type'] && $amount < 0 ) {
			return new WP_Error(
				'order_bump_invalid_price',
				__( 'Enter a price of 0 or more.', 'storegrowth-sales-booster' ),
				[ 'status' => 400 ]
			);
		}

		return true;
	}

	/**
	 * A bump as the routes return it: the stored columns (texts decoded, ids
	 * and amounts typed, `design_settings` sanitized), plus what the list
	 * shows: `targets` (the target products or categories by name, with an
	 * image), `offer_product_info` and `offer_prices` (the regular and the
	 * bump price, as plain text in the store's price format).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array           $item    Stored bump.
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response
	 */
	public function prepare_item_for_response( $item, $request ) {
		$design = OrderBumpDesign::sanitize( (array) $item['design_settings'] );
		$title  = '' !== (string) $item['offer_discount_title'] ? $item['offer_discount_title'] : ( $design['offer_discount_title'] ?? '' );

		$data = [
			'id'                   => (int) $item['id'],
			'name'                 => OrderBumpDesign::sanitize_text( $item['name'] ),
			'status'               => $item['status'],
			'target_type'          => $item['target_type'],
			'target_products'      => array_map( 'intval', $item['target_products'] ),
			'target_categories'    => array_map( 'intval', $item['target_categories'] ),
			'offer_product_id'     => (int) $item['offer_product_id'],
			'offer_type'           => $item['offer_type'],
			'offer_amount'         => (float) $item['offer_amount'],
			'offer_discount_title' => OrderBumpDesign::sanitize_text( $title ),
			'design_settings'      => $design,
			'created_by'           => (int) $item['created_by'],
			'updated_by'           => (int) $item['updated_by'],
			'created_at'           => $item['created_at'],
			'updated_at'           => $item['updated_at'],
			'targets'              => $this->get_targets( $item ),
			'offer_product_info'   => null,
			'offer_prices'         => null,
		];

		$product = wc_get_product( (int) $item['offer_product_id'] );
		if ( $product ) {
			// Plain text: wc_price()'s markup and entities decoded.
			$as_text = static function ( $amount ) {
				return html_entity_decode( wp_strip_all_tags( wc_price( $amount ) ), ENT_QUOTES, 'UTF-8' );
			};

			$data['offer_product_info'] = $this->product_info( $product );
			$data['offer_prices']       = [
				'regular' => $as_text( OrderBump::get_regular_price( $product ) ),
				'offer'   => $as_text( OrderBump::calculate_offer_price( $item['offer_type'], OrderBump::get_current_price( $product ), $item['offer_amount'] ) ),
			];
		}

		$data = $this->add_additional_fields_to_object( $data, $request );

		return rest_ensure_response( $data );
	}

	/**
	 * A bump's targets by name, for the list: its products, or its
	 * categories. Deleted ones are left out.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $item Stored bump.
	 *
	 * @return array[] `{ id, name, image }` each; `image` null when there's none.
	 */
	protected function get_targets( $item ) {
		$targets = [];

		if ( 'categories' === $item['target_type'] ) {
			foreach ( $item['target_categories'] as $term_id ) {
				$term = get_term( (int) $term_id, 'product_cat' );
				if ( ! $term || is_wp_error( $term ) ) {
					continue;
				}

				$image_id  = (int) get_term_meta( $term->term_id, 'thumbnail_id', true );
				$targets[] = [
					'id'    => (int) $term->term_id,
					'name'  => html_entity_decode( $term->name, ENT_QUOTES, 'UTF-8' ),
					'image' => $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : null,
				];
			}

			return $targets;
		}

		foreach ( $item['target_products'] as $product_id ) {
			$product = wc_get_product( (int) $product_id );
			if ( $product ) {
				$info      = $this->product_info( $product );
				$targets[] = [
					'id'    => $info['id'],
					'name'  => $info['name'],
					'image' => $info['image'],
				];
			}
		}

		return $targets;
	}

	/**
	 * A product as the list and the editor show it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WC_Product $product Product.
	 *
	 * @return array
	 */
	protected function product_info( $product ) {
		$image_id = $product->get_image_id();

		return [
			'id'            => $product->get_id(),
			'parent_id'     => $product->get_parent_id(),
			'type'          => $product->get_type(),
			'name'          => html_entity_decode( $product->get_name(), ENT_QUOTES, 'UTF-8' ),
			'price'         => $product->get_price(),
			'regular_price' => $product->get_regular_price(),
			'image'         => $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : wc_placeholder_img_src( 'thumbnail' ),
		];
	}

	/**
	 * Check if a given request has access to get items.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has read access, WP_Error object otherwise.
	 */
	public function get_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if a given request has access to get a specific item.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has read access for the item, WP_Error object otherwise.
	 */
	public function get_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if a given request has access to create items.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access to create items, WP_Error object otherwise.
	 */
	public function create_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if a given request has access to update a specific item.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access to update the item, WP_Error object otherwise.
	 */
	public function update_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if a given request has access to delete a specific item.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access to delete the item, WP_Error object otherwise.
	 */
	public function delete_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get the query params for collections.
	 *
	 * @return array Collection parameters.
	 */
	public function get_collection_params() {
		return [
			'page'     => [
				'description'       => __( 'Current page of the collection.', 'storegrowth-sales-booster' ),
				'type'              => 'integer',
				'default'           => 1,
				'minimum'           => 1,
				'sanitize_callback' => 'absint',
			],
			'per_page' => [
				'description'       => __( 'Maximum number of items to be returned in result set.', 'storegrowth-sales-booster' ),
				'type'              => 'integer',
				'default'           => 10,
				'minimum'           => 1,
				'maximum'           => 100,
				'sanitize_callback' => 'absint',
			],
			'search'   => [
				'description' => __( 'Limit results to order bumps whose name contains the text.', 'storegrowth-sales-booster' ),
				'type'        => 'string',
			],
			'status'   => [
				'description'       => __( 'Limit result set to order bumps with a specific status.', 'storegrowth-sales-booster' ),
				'type'              => 'string',
				'enum'              => [ 'active', 'inactive' ],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'orderby'  => [
				'description'       => __( 'Sort collection by object attribute.', 'storegrowth-sales-booster' ),
				'type'              => 'string',
				'default'           => 'created_at',
				'enum'              => [ 'id', 'name', 'created_at', 'updated_at' ],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'order'    => [
				'description'       => __( 'Order sort attribute ascending or descending.', 'storegrowth-sales-booster' ),
				'type'              => 'string',
				'default'           => 'DESC',
				'enum'              => [ 'ASC', 'DESC' ],
				'sanitize_callback' => 'sanitize_text_field',
			],
		];
	}

	/**
	 * Get the Order Bump schema, conforming to JSON Schema.
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$schema = [
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'order-bump',
			'type'       => 'object',
			'properties' => [
				'id'                   => [
					'description' => __( 'Unique identifier for the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'context'     => [ 'view', 'edit' ],
					'readonly'    => true,
				],
				'name'                 => [
					'description' => __( 'Name of the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'context'     => [ 'view', 'edit' ],
					'required'    => true,
				],
				'status'               => [
					'description' => __( 'Status of the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'enum'        => [ 'active', 'inactive' ],
					'context'     => [ 'view', 'edit' ],
					'default'     => 'active',
				],
				'target_type'          => [
					'description' => __( 'Type of targeting (products or categories).', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'enum'        => [ 'products', 'categories' ],
					'context'     => [ 'view', 'edit' ],
					'default'     => 'products',
				],
				'target_products'      => [
					'description' => __( 'Array of target product IDs.', 'storegrowth-sales-booster' ),
					'type'        => 'array',
					'items'       => [ 'type' => 'integer' ],
					'context'     => [ 'view', 'edit' ],
					'default'     => [],
				],
				'target_categories'    => [
					'description' => __( 'Array of target category IDs.', 'storegrowth-sales-booster' ),
					'type'        => 'array',
					'items'       => [ 'type' => 'integer' ],
					'context'     => [ 'view', 'edit' ],
					'default'     => [],
				],
				'offer_product_id'     => [
					'description' => __( 'ID of the offer product (a simple product or a variation).', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'context'     => [ 'view', 'edit' ],
					'required'    => true,
				],
				'offer_type'           => [
					'description' => __( 'Type of offer: a percentage discount, a fixed price, or free.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'enum'        => [ 'discount', 'price', 'free' ],
					'context'     => [ 'view', 'edit' ],
					'default'     => 'discount',
				],
				'offer_amount'         => [
					'description' => __( 'Amount of the offer: the percentage (over 0, at most 100) or the price (0 or more); 0 for free.', 'storegrowth-sales-booster' ),
					'type'        => 'number',
					'context'     => [ 'view', 'edit' ],
					'default'     => 0,
				],
				'offer_discount_title' => [
					'description' => __( 'Title for the discount offer.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'context'     => [ 'view', 'edit' ],
					'default'     => '',
				],
				'created_by'           => [
					'description' => __( 'ID of the user who created the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'context'     => [ 'view', 'edit' ],
					'readonly'    => true,
				],
				'updated_by'           => [
					'description' => __( 'ID of the user who last updated the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'context'     => [ 'view', 'edit' ],
					'readonly'    => true,
				],
				'design_settings'      => [
					'description' => __( 'Design settings for the order bump; an update merges them key by key.', 'storegrowth-sales-booster' ),
					'type'        => 'object',
					'context'     => [ 'view', 'edit' ],
					'default'     => [],
				],
				'created_at'           => [
					'description' => __( 'The date the order bump was created.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'format'      => 'date-time',
					'context'     => [ 'view', 'edit' ],
					'readonly'    => true,
				],
				'updated_at'           => [
					'description' => __( 'The date the order bump was last updated.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'format'      => 'date-time',
					'context'     => [ 'view', 'edit' ],
					'readonly'    => true,
				],
			],
		];

		$this->schema = $schema;

		return $this->add_additional_fields_schema( $this->schema );
	}
}
