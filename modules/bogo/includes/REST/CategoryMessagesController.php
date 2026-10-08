<?php
/**
 * BOGO category messages REST controller.
 *
 * @package StorePulse\StoreGrowth\Modules\BoGo
 */

namespace StorePulse\StoreGrowth\Modules\BoGo\REST;

use StorePulse\StoreGrowth\Modules\BoGo\CategoryMessages;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * `sales-booster/v1/bogo/category-messages` (step 10e, R2): the messages pro
 * shows on a product category page, over the same stored rows as the ajax
 * actions (`bogo_category_msg_*`, kept).
 *
 * Administrators only (not `spsg_bogo_check_permission`: vendors don't
 * manage store-wide messages). Reading works without pro, so a store that
 * had pro still sees its messages; every change needs pro, as the old
 * screen and pro's status/delete handlers did.
 *
 * @since SPSG_VERSION
 */
class CategoryMessagesController extends WP_REST_Controller {

	/**
	 * Route namespace and base.
	 *
	 * @since SPSG_VERSION
	 */
	public function __construct() {
		$this->namespace = 'sales-booster/v1';
		$this->rest_base = 'bogo/category-messages';
	}

	/**
	 * Register the routes.
	 *
	 * @since SPSG_VERSION
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
				],
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'create_item' ],
					'permission_callback' => [ $this, 'create_item_permissions_check' ],
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
				],
				'schema' => [ $this, 'get_public_item_schema' ],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>\d+)',
			[
				'args'   => [
					'id' => [
						'description' => __( 'Category (term) id.', 'storegrowth-sales-booster' ),
						'type'        => 'integer',
					],
				],
				[
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_item' ],
					'permission_callback' => [ $this, 'create_item_permissions_check' ],
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				],
				[
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => [ $this, 'delete_item' ],
					'permission_callback' => [ $this, 'create_item_permissions_check' ],
				],
				'schema' => [ $this, 'get_public_item_schema' ],
			]
		);
	}

	/**
	 * Administrators read the messages.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return true|WP_Error
	 */
	public function get_items_permissions_check( $request ) {
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		return new WP_Error(
			'salesbooster_permission_failure',
			__( 'Sorry! You are not permitted to do the current action.', 'storegrowth-sales-booster' ),
			// 401 for a guest, 403 for a user without the capability.
			[ 'status' => rest_authorization_required_code() ]
		);
	}

	/**
	 * Changes need an administrator and pro (it shows the messages).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return true|WP_Error
	 */
	public function create_item_permissions_check( $request ) {
		$allowed = $this->get_items_permissions_check( $request );

		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		if ( ! sp_store_growth()->has_pro() ) {
			return new WP_Error(
				'salesbooster_pro_required',
				__( 'Category messages need StoreGrowth Pro.', 'storegrowth-sales-booster' ),
				[ 'status' => 403 ]
			);
		}

		return true;
	}

	/**
	 * Every message.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$rows = CategoryMessages::all();

		// One query for every category's name.
		_prime_term_caches( array_map( 'absint', wp_list_pluck( $rows, 'id' ) ) );

		$items = array_map(
			function ( $row ) use ( $request ) {
				return $this->prepare_response_for_collection( $this->prepare_item_for_response( $row, $request ) );
			},
			$rows
		);

		return rest_ensure_response( $items );
	}

	/**
	 * Add a category's message.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$row = CategoryMessages::create(
			(int) $request['category'],
			$request['message'],
			(bool) $request['status']
		);

		if ( is_wp_error( $row ) ) {
			return $row;
		}

		$response = $this->prepare_item_for_response( $row, $request );
		$response->set_status( 201 );

		return $response;
	}

	/**
	 * Change a category's message (only the keys sent; `{ status }` alone
	 * is the list's switch).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$changes = [];

		foreach ( [ 'category', 'message', 'status' ] as $key ) {
			if ( null !== $request[ $key ] ) {
				$changes[ $key ] = $request[ $key ];
			}
		}

		$row = CategoryMessages::update( (int) $request['id'], $changes );

		if ( is_wp_error( $row ) ) {
			return $row;
		}

		return $this->prepare_item_for_response( $row, $request );
	}

	/**
	 * Delete a category's message.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item( $request ) {
		$deleted = CategoryMessages::delete( (int) $request['id'] );

		if ( is_wp_error( $deleted ) ) {
			return $deleted;
		}

		return rest_ensure_response(
			[
				'deleted' => true,
				'id'      => (int) $request['id'],
			]
		);
	}

	/**
	 * A stored row as the API returns it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array           $item    Row as stored.
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function prepare_item_for_response( $item, $request ) {
		$id   = absint( $item['id'] );
		$term = get_term( $id, 'product_cat' );

		return rest_ensure_response(
			[
				'id'      => $id,
				// Null when the category was deleted (the message can still be).
				'name'    => $term && ! is_wp_error( $term ) ? html_entity_decode( $term->name, ENT_QUOTES, 'UTF-8' ) : null,
				'message' => (string) ( $item['message'] ?? '' ),
				'status'  => CategoryMessages::is_active( $item ),
			]
		);
	}

	/**
	 * A message's schema.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	public function get_item_schema() {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$this->schema = [
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'bogo_category_message',
			'type'       => 'object',
			'properties' => [
				'id'       => [
					'description' => __( 'Category (term) id; the message is found by it.', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'readonly'    => true,
				],
				'name'     => [
					'description' => __( 'Category name, null when the category was deleted.', 'storegrowth-sales-booster' ),
					'type'        => [ 'string', 'null' ],
					'readonly'    => true,
				],
				'category' => [
					'description' => __( 'Category (term) id to give the message (request only; an update moves the message).', 'storegrowth-sales-booster' ),
					'type'        => 'integer',
					'required'    => true,
				],
				'message'  => [
					'description' => __( 'Message on the category page.', 'storegrowth-sales-booster' ),
					'type'        => 'string',
					'required'    => true,
					'arg_options' => [
						// The ajax action's value domain (`wc_clean()`).
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => [ $this, 'validate_message' ],
					],
				],
				'status'   => [
					'description' => __( 'Shown on the category page.', 'storegrowth-sales-booster' ),
					'type'        => 'boolean',
					'default'     => true,
				],
			],
		];

		return $this->add_additional_fields_schema( $this->schema );
	}

	/**
	 * A message has text.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Value.
	 *
	 * @return true|WP_Error
	 */
	public function validate_message( $value ) {
		if ( is_string( $value ) && '' !== trim( sanitize_text_field( $value ) ) ) {
			return true;
		}

		return new WP_Error(
			'bogo_missing_message',
			__( 'Enter a message.', 'storegrowth-sales-booster' ),
			[ 'status' => 400 ]
		);
	}
}
