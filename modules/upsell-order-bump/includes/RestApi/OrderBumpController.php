<?php
/**
 * REST API Controller for Order Bumps.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi;

use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
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
 */
class OrderBumpController extends WP_REST_Controller {

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
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				'args' => array(
					'id' => array(
						'description' => __( 'Unique identifier for the order bump.', 'storegrowth-sales-booster' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'delete_item_permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/matching',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_matching_bumps' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => array(
					'cart_products' => array(
						'description' => __( 'Array of product IDs in cart.', 'storegrowth-sales-booster' ),
						'type'        => 'array',
						'items'       => array( 'type' => 'integer' ),
						'required'    => true,
					),
					'cart_categories' => array(
						'description' => __( 'Array of category IDs in cart.', 'storegrowth-sales-booster' ),
						'type'        => 'array',
						'items'       => array( 'type' => 'integer' ),
						'required'    => true,
					),
				),
			)
		);
	}

	/**
	 * Get a collection of order bumps.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ) {
		$args = array(
			'status'   => $request->get_param( 'status' ),
			'limit'    => $request->get_param( 'per_page' ),
			'offset'   => ( $request->get_param( 'page' ) - 1 ) * $request->get_param( 'per_page' ),
			'order_by' => $request->get_param( 'orderby' ),
			'order'    => $request->get_param( 'order' ),
		);

		$bumps = $this->order_bump_data->get_all( $args );

		return rest_ensure_response( $bumps );
	}

	/**
	 * Get a single order bump.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $request ) {
		$id = $request->get_param( 'id' );
		$bump = $this->order_bump_data->get_by_id( $id );

		if ( ! $bump ) {
			return new WP_Error(
				'rest_order_bump_not_found',
				__( 'Order bump not found.', 'storegrowth-sales-booster' ),
				array( 'status' => 404 )
			);
		}

		return rest_ensure_response( $bump );
	}

	/**
	 * Create a single order bump.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function create_item( $request ) {
		$data = $request->get_json_params();

		// Validate required fields
		$required_fields = array( 'name', 'offer_product_id' );
		foreach ( $required_fields as $field ) {
			if ( empty( $data[ $field ] ) ) {
				return new WP_Error(
					'rest_missing_field',
					sprintf( __( 'Field %s is required.', 'storegrowth-sales-booster' ), $field ),
					array( 'status' => 400 )
				);
			}
		}

		$id = $this->order_bump_data->create( $data );

		if ( ! $id ) {
			return new WP_Error(
				'rest_order_bump_create_failed',
				__( 'Failed to create order bump.', 'storegrowth-sales-booster' ),
				array( 'status' => 500 )
			);
		}

		$bump = $this->order_bump_data->get_by_id( $id );

		$response = rest_ensure_response( $bump );
		$response->set_status( 201 );

		return $response;
	}

	/**
	 * Update a single order bump.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function update_item( $request ) {
		$id = $request->get_param( 'id' );
		$data = $request->get_json_params();

		$bump = $this->order_bump_data->get_by_id( $id );
		if ( ! $bump ) {
			return new WP_Error(
				'rest_order_bump_not_found',
				__( 'Order bump not found.', 'storegrowth-sales-booster' ),
				array( 'status' => 404 )
			);
		}

		$result = $this->order_bump_data->update( $id, $data );

		if ( ! $result ) {
			return new WP_Error(
				'rest_order_bump_update_failed',
				__( 'Failed to update order bump.', 'storegrowth-sales-booster' ),
				array( 'status' => 500 )
			);
		}

		$updated_bump = $this->order_bump_data->get_by_id( $id );

		return rest_ensure_response( $updated_bump );
	}

	/**
	 * Delete a single order bump.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function delete_item( $request ) {
		$id = $request->get_param( 'id' );

		$bump = $this->order_bump_data->get_by_id( $id );
		if ( ! $bump ) {
			return new WP_Error(
				'rest_order_bump_not_found',
				__( 'Order bump not found.', 'storegrowth-sales-booster' ),
				array( 'status' => 404 )
			);
		}

		$result = $this->order_bump_data->delete( $id );

		if ( ! $result ) {
			return new WP_Error(
				'rest_order_bump_delete_failed',
				__( 'Failed to delete order bump.', 'storegrowth-sales-booster' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( null, 204 );
	}

	/**
	 * Get matching order bumps for cart products.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_matching_bumps( $request ) {
		$cart_products = $request->get_param( 'cart_products' );
		$cart_categories = $request->get_param( 'cart_categories' );

		$matching_bumps = $this->order_bump_data->get_matching_bumps( $cart_products, $cart_categories );

		return rest_ensure_response( $matching_bumps );
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
		return array(
			'page'     => array(
				'description'       => __( 'Current page of the collection.', 'storegrowth-sales-booster' ),
				'type'              => 'integer',
				'default'           => 1,
				'sanitize_callback' => 'absint',
			),
			'per_page' => array(
				'description'       => __( 'Maximum number of items to be returned in result set.', 'storegrowth-sales-booster' ),
				'type'              => 'integer',
				'default'           => 10,
				'minimum'           => 1,
				'maximum'           => 100,
				'sanitize_callback' => 'absint',
			),
			'status'   => array(
				'description'       => __( 'Limit result set to order bumps with a specific status.', 'storegrowth-sales-booster' ),
				'type'              => 'string',
				'enum'              => array( 'active', 'inactive' ),
				'sanitize_callback' => 'sanitize_text_field',
			),
			'orderby'  => array(
				'description'       => __( 'Sort collection by object attribute.', 'storegrowth-sales-booster' ),
				'type'              => 'string',
				'default'           => 'created_at',
				'enum'              => array( 'id', 'name', 'created_at', 'updated_at' ),
				'sanitize_callback' => 'sanitize_text_field',
			),
			'order'    => array(
				'description'       => __( 'Order sort attribute ascending or descending.', 'storegrowth-sales-booster' ),
				'type'              => 'string',
				'default'           => 'DESC',
				'enum'              => array( 'ASC', 'DESC' ),
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
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

		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'order-bump',
			'type'       => 'object',
			'properties' => array(
				'id'                => array(
					'description' => __( 'Unique identifier for the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'name'              => array(
					'description' => __( 'Name of the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'required'    => true,
				),
				'status'            => array(
					'description' => __( 'Status of the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'enum'        => array( 'active', 'inactive' ),
					'context'     => array( 'view', 'edit' ),
					'default'     => 'active',
				),
				'target_type'       => array(
					'description' => __( 'Type of targeting (products or categories).', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'enum'        => array( 'products', 'categories' ),
					'context'     => array( 'view', 'edit' ),
					'default'     => 'products',
				),
				'target_products'   => array(
					'description' => __( 'Array of target product IDs.', 'storegrowth-sales-booster' ),
					'type'        => 'array',
					'items'       => array( 'type' => 'integer' ),
					'context'     => array( 'view', 'edit' ),
					'default'     => array(),
				),
				'target_categories' => array(
					'description' => __( 'Array of target category IDs.', 'storegrowth-sales-booster' ),
					'type'        => 'array',
					'items'       => array( 'type' => 'integer' ),
					'context'     => array( 'view', 'edit' ),
					'default'     => array(),
				),
				'offer_product_id'  => array(
					'description' => __( 'ID of the offer product.', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'required'    => true,
				),
				'offer_type'        => array(
					'description' => __( 'Type of offer (discount or price).', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'enum'        => array( 'discount', 'price' ),
					'context'     => array( 'view', 'edit' ),
					'default'     => 'discount',
				),
				'offer_amount'      => array(
					'description' => __( 'Amount of the offer.', 'storegrowth-sales-booster' ),
					'type'        => 'number',
					'context'     => array( 'view', 'edit' ),
					'default'     => 0,
				),
				'offer_discount_title' => array(
					'description' => __( 'Title for the discount offer.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'default'     => '',
				),
				'created_by'        => array(
					'description' => __( 'ID of the user who created the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'updated_by'        => array(
					'description' => __( 'ID of the user who last updated the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'design_settings'   => array(
					'description' => __( 'Design settings for the order bump.', 'storegrowth-sales-booster' ),
					'type'        => 'object',
					'context'     => array( 'view', 'edit' ),
					'default'     => array(),
				),
				'created_at'        => array(
					'description' => __( 'The date the order bump was created.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'format'      => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'updated_at'        => array(
					'description' => __( 'The date the order bump was last updated.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'format'      => 'date-time',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
			),
		);

		$this->schema = $schema;

		return $this->add_additional_fields_schema( $this->schema );
	}
}
