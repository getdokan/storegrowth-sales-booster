<?php

namespace STOREGROWTH\SPSB\Integrations\Dokan\REST;

use WP_Error;
use WP_HTTP_Response;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use STOREGROWTH\SPSB\Modules\BoGo\REST\BogoController;

defined( 'ABSPATH' ) || exit();

/**
 * BogoController Class.
 *
 * @package SBFW
 */
class VendorBogoController extends BogoController {

    /**
     * Class Constructor.
     *
     * @return void
     */
    public function __construct() {
        parent::__construct();
        $this->rest_base = 'bogo/offers/vendor';
    }

    /**
     * Register Rest Routes.
     *
     * @return void
     */
    public function register_routes(): void {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)',
            [
                'args' => [
                    'id' => [
                        'description' => __( 'Vendor ID', 'storegrowth-sales-booster' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_items' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_collection_params(),
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [ $this, 'create_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => $this->get_endpoint_args_for_create_item(),
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
             '/bogo/vendor-offers/(?P<id>\d+)',
            [
                'args' => [
                    'id' => [
                        'description' => __( 'Bogo offer ID', 'storegrowth-sales-booster' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [ $this, 'get_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'delete_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                ],
            ]
        );
    }

    /**
     * Permission Checker.
     *
     * @since 1.12.0
     *
     * @param WP_REST_Request $request Rest Request.
     *
     * @return bool|WP_Error
     */
    public function check_permission( $request ) {
        if ( current_user_can( 'dokandar' ) ) {
            return true;
        }

        return new WP_Error(
            'salesbooster_permission_failure',
            __( 'Sorry! You are not permitted to do the current action.', 'storegrowth-sales-booster' ),
            [ 'status' => 403 ]
        );
    }

    /**
     * Get Items.
     *
     * @since 1.12.0
     *
     * @param WP_REST_Request $request Rest Request.
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_items( $request ) {
        $params = $request->get_params();

        $args = [
            'posts_per_page' => $params['per_page'],
            'paged'          => $params['page'],
            'meta_query'   => [
                [
                    'key'     => 'bogo_vendor_id',
                    'value'   => $params['id'],
                    'compare' => '=',
                ],
            ],
        ];

        $items = $this->get_bogo()->get_items( $args );

        $data = [];
        foreach ( $items['data'] as $item ) {
            $item_data = $this->prepare_item_for_response( $item, $request );
            $data[]    = $this->prepare_response_for_collection( $item_data );
        }

        $response = rest_ensure_response( $data );

        return $this->format_collection_response( $response, $request, $items['total_items'] );
    }

    /**
     * Get Item.
     *
     * @since 1.12.0
     *
     * @param WP_REST_Request $request Rest Request.
     *
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_item( $request ) {
        $id   = $request->get_param( 'id' );
        $item = $this->get_bogo()->get_item( $id );

        if ( ! $item || is_wp_error( $item ) ) {
            return new WP_REST_Response( [ 'error' => __( 'No item found for the given ID.', 'storegrowth-sales-booster' ) ], 200 );
        }

        $offer_vendor_id = (int) get_post_meta( $item['id'], 'bogo_vendor_id', true );

        if ( ! $offer_vendor_id || dokan_get_current_user_id() !== $offer_vendor_id ) {
            return new WP_Error(
                'salesbooster_permission_failure',
                __( 'Sorry! You are not permitted to do the current action.', 'storegrowth-sales-booster' ),
                [ 'status' => 403 ]
            );
        }

        $response = $this->prepare_item_for_response( $item, $request );
        $response->set_status( 200 );

        return $response;
    }

    /**
     * Create item.
     *
     * @since 1.12.0
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return WP_REST_Response
     */
    public function create_item( $request ) {
        $data = $request->get_params();

        if ( empty( $data ) || ! is_array( $data ) ) {
            return new WP_REST_Response( [ 'error' => __( 'No data provided', 'storegrowth-sales-booster' ) ], 400 );
        }

        $target_product_vendor  = dokan_get_vendor_by_product( $data['offered_products'] ?? 0, true );

        if ( ! $target_product_vendor ) {
            return new WP_REST_Response( [ 'error' => __( 'Invalid product data provided.', 'storegrowth-sales-booster' ) ], 400 );
        }

        if ( dokan_get_current_user_id() !== $target_product_vendor ) {
            return new WP_REST_Response( [ 'error' => __( 'You are not allowed to create a BOGO offer for another seller.', 'storegrowth-sales-booster' ) ], 403 );
        }

        $result = $this->get_bogo()->create( $data );

        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response( [ 'error' => $result->get_error_message() ], 400 );
        }

        if ( empty( $result ) || ! is_int( $result ) ) {
            // Likely due to free version restriction, return appropriate message.
            return new WP_REST_Response(
                [ 'error' => __( 'BOGO limit exceeded. Upgrade to PRO for unlimited offers.', 'storegrowth-sales-booster' ) ],
                403
            );
        }

        $post = get_post( $result );

        update_post_meta( $post->ID, 'bogo_vendor_id', dokan_get_current_user_id() );

        $created_data = $this->get_bogo()->get_item( $post->ID );
        $response     = $this->prepare_item_for_response( $created_data, $request );

        $response->set_status( 201 );

        return $response;
    }

    /**
     * Update item.
     *
     * @since 1.12.0
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return WP_REST_Response
     */
    public function update_item( $request ) {
        $id   = $request->get_param( 'id' );
        $data = $request->get_params();
        $item = $this->get_bogo()->get_item( $id );

        if ( ! $item || is_wp_error( $item ) ) {
            return new WP_REST_Response( [ 'error' => __( 'No item found for the given ID.', 'storegrowth-sales-booster' ) ], 200 );
        }

        $offer_vendor_id   = (int) get_post_meta( $item['id'], 'bogo_vendor_id', true );
        $current_vendor_id = dokan_get_current_user_id();

        if ( ! $offer_vendor_id || $current_vendor_id !== $offer_vendor_id ) {
            return new WP_REST_Response( [ 'error' => __( 'Sorry! You are not permitted to do the current action', 'storegrowth-sales-booster' ) ], 403 );
        }

        if ( empty( $data ) || ! is_array( $data ) ) {
            return new WP_REST_Response( [ 'error' => __( 'No data provided', 'storegrowth-sales-booster' ) ], 400 );
        }

	    $target_product_vendor  = dokan_get_vendor_by_product( $data['offered_products'] ?? 0, true );

	    if ( ! $target_product_vendor ) {
		    return new WP_REST_Response( [ 'error' => __( 'Invalid product data provided.', 'storegrowth-sales-booster' ) ], 400 );
	    }

	    if ( dokan_get_current_user_id() !== $target_product_vendor ) {
		    return new WP_REST_Response( [ 'error' => __( 'You are not allowed to create a BOGO offer for another seller.', 'storegrowth-sales-booster' ) ], 403 );
	    }

        $result = $this->get_bogo()->update( $id, $data );

        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response( [ 'error' => $result->get_error_message() ], 400 );
        }

        $post         = get_post( $result );
        $created_data = $this->get_bogo()->get_item( $post->ID );
        $response     = $this->prepare_item_for_response( $created_data, $request );

        $response->set_status( 201 );

        return $response;
    }

    /**
     * Delete item.
     *
     * @since 1.12.0
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return WP_REST_Response
     */
    public function delete_item( $request ) {
        $id   = $request->get_param( 'id' );
        $item = $this->get_bogo()->get_item( $id );

        if ( ! $item || is_wp_error( $item ) ) {
            return new WP_REST_Response( [ 'error' => __( 'No item found for the given ID.', 'storegrowth-sales-booster' ) ], 200 );
        }

        $offer_vendor_id = (int) get_post_meta( $item['id'], 'bogo_vendor_id', true );

        if ( ! $offer_vendor_id || dokan_get_current_user_id() !== $offer_vendor_id ) {
            return new WP_REST_Response( [ 'error' => __( 'Sorry! You are not permitted to do the current action', 'storegrowth-sales-booster' ) ], 403 );
        }

        $result = $this->get_bogo()->delete( $id );

        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response( [ 'error' => $result->get_error_message() ], 400 );
        }

        return new WP_REST_Response( [ 'deleted' => true ], 200 );
    }
}
