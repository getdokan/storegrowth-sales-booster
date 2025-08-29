<?php

namespace STOREGROWTH\SPSB\Modules\BoGo\REST;

use WP_Error;
use WP_HTTP_Response;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use STOREGROWTH\SPSB\Modules\BoGo\Bogo;

defined( 'ABSPATH' ) || exit();

/**
 * BogoController Class.
 *
 * @package SBFW
 */
class BogoController extends WP_REST_Controller {

    /**
     * Class Constructor.
     *
     * @return void
     */
    public function __construct() {
        $this->namespace = 'sales-booster/v1';
        $this->rest_base = 'bogo/offers';
    }

    protected function get_bogo(): Bogo {
        return storegrowth_get_container()->get( Bogo::class );
    }

    /**
     * Register Rest Routes.
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
            '/' . $this->rest_base . '/(?P<id>\d+)',
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
                    'args'                => [
                        'id' => [
                            'type'     => 'integer',
                            'required' => true,
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'id' => [
                            'type'     => 'integer',
                            'required' => true,
                        ],
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [ $this, 'delete_item' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'id' => [
                            'type'     => 'integer',
                            'required' => true,
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * Permission Checker.
     *
     * @since 1.29.0
     *
     * @param WP_REST_Request $request Rest Request.
     *
     * @return bool|WP_Error
     */
    public function check_permission( $request ) {
        if ( current_user_can( 'manage_options' ) ) {
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
     * @since 1.29.0
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
        ];

        $items = $this->get_bogo()->get_items( $args );

        if ( ! $items['data'] ) {
            return new WP_REST_Response( [ 'error' => __( 'No item found.', 'storegrowth-sales-booster' ) ], 200 );
        }

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
     * @since 1.29.0
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

        $response = $this->prepare_item_for_response( $item, $request );
        $response->set_status( 200 );

        return $response;
    }

    /**
     * Create item.
     *
     * @since 1.29.0
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

        $post         = get_post( $result );
        $created_data = $this->get_bogo()->get_item( $post->ID );
        $response     = $this->prepare_item_for_response( $created_data, $request );

        $response->set_status( 201 );

        return $response;
    }

    /**
     * Update item.
     *
     * @since 1.29.0
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return WP_REST_Response
     */
    public function update_item( $request ) {
        $id   = $request->get_param( 'id' );
        $data = $request->get_params();

        if ( empty( $data ) || ! is_array( $data ) ) {
            return new WP_REST_Response( [ 'error' => __( 'No data provided', 'storegrowth-sales-booster' ) ], 400 );
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
     * @since 1.29.0
     *
     * @param WP_REST_Request $request The REST request.
     *
     * @return WP_REST_Response
     */
    public function delete_item( $request ) {
        $id     = $request->get_param( 'id' );
        $result = $this->get_bogo()->delete( $id );

        if ( is_wp_error( $result ) ) {
            return new WP_REST_Response( [ 'error' => $result->get_error_message() ], 400 );
        }

        return new WP_REST_Response( [ 'deleted' => true ], 200 );
    }

    /**
     * Get Endpoint Args for Create Item.
     *
     * @since 1.29.0
     *
     * @return array
     */
    public function get_endpoint_args_for_create_item() {
        return [
            'name_of_order_bogo' => [
                'type'              => 'string',
                'required'          => true,
                'description'       => __( 'Name of the BOGO offer.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offered_products' => [
                'type'              => 'integer',
                'required'          => true,
                'description'       => __( 'The ID of target product.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'absint',
            ],
            'get_different_product_field' => [
                'type'              => 'integer',
                'description'       => __( 'ID of the offered product.', 'storegrowth-sales-booster' ),
                'default'           => 0,
                'sanitize_callback' => 'absint',
            ],
            'bogo_status' => [
                'type'              => 'string',
                'default'           => 'yes',
                'enum'              => [ 'yes', 'no' ],
                'description'       => __( 'Whether the BOGO is enabled.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'bogo_deal_type' => [
                'type'              => 'string',
                'default'           => 'different',
                'enum'              => [ 'same', 'different' ],
                'description'       => __( 'Type of BOGO deal.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_type' => [
                'type'              => 'string',
                'required'          => true,
                'description'       => __( 'Offer types: free, discount.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'discount_amount' => [
                'type'              => 'string',
                'description'       => __( 'Discount value or percentage.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'bogo_type' => [
                'type'              => 'string',
                'default'           => 'products',
                'enum'              => [ 'products', 'categories' ],
                'description'       => __( 'Whether the BOGO applies to products or categories.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'minimum_quantity_required' => [
                'type'              => 'integer',
                'default'           => 1,
                'description'       => __( 'Minimum quantity required to trigger the offer.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'absint',
            ],
            'offer_start' => [
                'type'              => 'string',
                'format'            => 'date-time',
                'description'       => __( 'Offer start date.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_end' => [
                'type'              => 'string',
                'format'            => 'date-time',
                'description'       => __( 'Offer end date.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'default_badge_icon_name' => [
                'type'              => 'string',
                'default'           => 'bogo-icons-1',
                'description'       => __( 'Default badge icon name.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'enable_custom_badge_image' => [
                'type'              => 'boolean',
                'default'           => false,
                'description'       => __( 'Enable custom badge image.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'default_custom_badge_icon' => [
                'type'              => 'string',
                'description'       => __( 'Custom badge image URL or ID.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'esc_url_raw',
            ],
            'offered_products' => [
                'type'              => 'string',
                'description'       => __( 'Comma-separated target product IDs.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offered_categories' => [
                'type'        => 'array',
                'items'       => [ 'type' => 'integer' ],
                'description' => __( 'Target category IDs.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'get_alternate_products' => [
                'type'        => 'array',
                'items'       => [ 'type' => 'integer' ],
                'description' => __( 'Alternate product IDs for GET BOGO type.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'get_alternate_categories' => [
                'type'        => 'array',
                'items'       => [ 'type' => 'integer' ],
                'description' => __( 'Alternate category IDs for GET BOGO type.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'exclude_products' => [
                'type'        => 'array',
                'items'       => [ 'type' => 'integer' ],
                'description' => __( 'Product IDs to exclude.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'offer_schedule' => [
                'type'        => 'array',
                'items'       => [ 'type' => 'string' ],
                'description' => __( 'Offer schedule types (e.g., daily).', 'storegrowth-sales-booster' ),
            ],
            'smart_offer' => [
                'type'              => 'boolean',
                'default'           => false,
                'description'       => __( 'Enable smart offer logic.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'box_border_style' => [
                'type'              => 'string',
                'description'       => __( 'Border style for display box.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'box_border_color' => [
                'type'              => 'string',
                'description'       => __( 'Box border color.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'box_top_margin' => [
                'type'              => 'integer',
                'description'       => __( 'Top margin for the box.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'box_bottom_margin' => [
                'type'              => 'integer',
                'description'       => __( 'Bottom margin for the box.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'discount_background_color' => [
                'type'              => 'string',
                'description'       => __( 'Background color for discount text.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'discount_text_color' => [
                'type'              => 'string',
                'description'       => __( 'Color of discount text.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'discount_font_size' => [
                'type'              => 'string',
                'description'       => __( 'Font size for discount text.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'product_description_text_color' => [
                'type'              => 'string',
                'description'       => __( 'Color of product description text.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'product_description_font_size' => [
                'type'              => 'string',
                'description'       => __( 'Font size of product description text.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'accept_offer_background_color' => [
                'type'              => 'string',
                'description'       => __( 'Background color for accept offer button.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'accept_offer_text_color' => [
                'type'              => 'string',
                'description'       => __( 'Text color for accept offer.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'accept_offer_font_size' => [
                'type'              => 'string',
                'description'       => __( 'Font size for accept offer.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_description_background_color' => [
                'type'              => 'string',
                'description'       => __( 'Background color for offer description.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'offer_description_text_color' => [
                'type'              => 'string',
                'description'       => __( 'Text color for offer description.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'offer_description_font_size' => [
                'type'              => 'string',
                'description'       => __( 'Font size for offer description.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_image_url' => [
                'type'              => 'string',
                'description'       => __( 'Image URL for the offer.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'esc_url_raw',
            ],
            'offer_product_title' => [
                'type'              => 'string',
                'description'       => __( 'Title shown for the offered product.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_product_id' => [
                'type'              => 'integer',
                'description'       => __( 'Product ID of the offered product.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'absint',
            ],
            'offer_discount_title' => [
                'type'              => 'string',
                'description'       => __( 'Discount title shown on frontend.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_fixed_price_title' => [
                'type'              => 'string',
                'description'       => __( 'Fixed price title for offer.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'product_description' => [
                'type'              => 'string',
                'description'       => __( 'Product description shown on the offer.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_textarea_field',
            ],
            'selection_title' => [
                'type'              => 'string',
                'description'       => __( 'Title for product selection.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_description' => [
                'type'              => 'string',
                'description'       => __( 'Detailed offer description.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_textarea_field',
            ],
            'offer_product_regular_price' => [
                'type'              => 'number',
                'description'       => __( 'Regular price of the offered product.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'product_page_message' => [
                'type'              => 'string',
                'description'       => __( 'Message shown on product page.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_textarea_field',
            ],
            'shop_page_message' => [
                'type'              => 'string',
                'description'       => __( 'Message shown on shop page.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_textarea_field',
            ],
        ];
    }

    /**
     * Prepare Item for The REST API Response.
     *
     * @since 1.29.0
     *
     * @param array            $item    BOGO offer data.
     * @param WP_REST_Request  $request Request object.
     *
     * @return WP_REST_Response
     */
    public function prepare_item_for_response( $item, $request ) {
        $fields = $this->get_fields_for_response( $request );
        $data   = [];

        // Simple field map: field => transformation callback (optional)
        $field_map = [
            'id'                          => 'absint',
            'name_of_order_bogo'          => 'html_entity_decode',
            'offered_products'            => 'absint',
            'get_different_product_field' => 'absint',
            'bogo_status'              => null,
            'bogo_deal_type'           => null,
            'bogo_type'                => null,
            'minimum_quantity_required'=> null,
            'offer_start_date'         => null,
            'offer_end_date'           => null,
            'default_badge_icon_name'  => null,
            'enable_custom_badge_image'=> null,
            'default_custom_badge_icon'=> null,
            'offer_type'               => null,
            'discount_amount'          => null,
            'box_border_style'         => null,
            'box_border_color'         => null,
            'box_top_margin'           => null,
            'box_bottom_margin'        => null,
            'discount_background_color'=> null,
            'discount_text_color'      => null,
            'discount_font_size'       => null,
            'product_description_text_color' => null,
            'product_description_font_size'  => null,
            'accept_offer_background_color'  => null,
            'accept_offer_text_color'        => null,
            'accept_offer_font_size'         => null,
            'offer_description_background_color' => null,
            'offer_description_text_color'       => null,
            'offer_description_font_size'        => null,
            'offer_image_url'           => 'esc_url_raw',
            'offer_product_title'       => null,
            'offer_product_id'          => 'absint',
            'offer_discount_title'      => 'html_entity_decode',
            'offer_fixed_price_title'   => 'html_entity_decode',
            'product_description'       => 'html_entity_decode',
            'selection_title'           => 'html_entity_decode',
            'offer_description'         => 'html_entity_decode',
            'offer_product_regular_price' => null,
            'product_page_message'      => null,
            'shop_page_message'         => null,
            'offer_start'               => null,
            'offer_end'                 => null,
            'smart_offer'               => function( $v ) { return $v === 'true'; },
        ];

        // Always-cast arrays
        $array_fields = [
            'offer_schedule',
            'offered_products',
            'offered_categories',
            'bogo_schedule',
            'get_alternate_products',
        ];

        foreach ( $field_map as $key => $callback ) {
            if ( in_array( $key, $fields, true ) && isset( $item[ $key ] ) ) {
                $value = $item[ $key ];

                if ( is_callable( $callback ) ) {
                    $data[ $key ] = call_user_func( $callback, $value );
                } else {
                    $data[ $key ] = $value;
                }
            }
        }

        foreach ( $array_fields as $array_key ) {
            if ( in_array( $array_key, $fields, true ) && isset( $item[ $array_key ] ) ) {
                $data[ $array_key ] = (array) $item[ $array_key ];
            }
        }

        // Prepare response with context and additional fields
        $context  = ! empty( $request['context'] ) ? $request['context'] : 'view';
        $data     = $this->filter_response_by_context( $data, $context );
        $data     = $this->add_additional_fields_to_object( $data, $request );
        $response = rest_ensure_response( $data );

        /**
         * Filter the prepared BOGO response.
         *
         * @param WP_REST_Response $response The response object.
         * @param array            $item     Original item array.
         * @param WP_REST_Request  $request  Request object.
         */
        return apply_filters( 'storegrowth_rest_prepare_bogo_offer', $response, $item, $request );
    }


    /**
     * Format item's collection for response
     *
     * @since 1.29.0
     *
     * @param  WP_REST_Response $response
     * @param  WP_REST_Request  $request
     * @param  int              $total_items
     *
     * @return WP_REST_Response
     */
    public function format_collection_response( $response, $request, $total_items ) {
        if ( intval( $total_items ) === 0 ) {
            return $response;
        }

        // Store pagination values for headers then unset for count query.
        $per_page = (int) ( ! empty( $request['per_page'] ) ? $request['per_page'] : 20 );
        $page     = (int) ( ! empty( $request['page'] ) ? $request['page'] : 1 );

        $response->header( 'X-WP-Total', (int) $total_items );

        $max_pages = ceil( $total_items / $per_page );

        $response->header( 'X-WP-TotalPages', (int) $max_pages );
        $base = add_query_arg( $request->get_query_params(), rest_url( sprintf( '/%s/%s', $this->namespace, $this->rest_base ) ) );

        if ( $page > 1 ) {
            $prev_page = $page - 1;
            if ( $prev_page > $max_pages ) {
                $prev_page = $max_pages;
            }
            $prev_link = add_query_arg( 'page', $prev_page, $base );
            $response->link_header( 'prev', $prev_link );
        }
        if ( $max_pages > $page ) {
            $next_page = $page + 1;
            $next_link = add_query_arg( 'page', $next_page, $base );
            $response->link_header( 'next', $next_link );
        }

        return $response;
    }

    /**
     * Get The Item Schema.
     *
     * @since 1.29.0
     *
     * @return array
     */
    public function get_item_schema() {
        return [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'storegrowth_bogo_offer',
            'type'       => 'object',
            'properties' => [
                'id' => [
                    'description' => __( 'Unique identifier for the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'name_of_order_bogo' => [
                    'description' => __( 'The internal name of the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offered_products' => [
                    'description' => __( 'The ID of target product.', 'storegrowth-sales-booster' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                ],
                'bogo_status' => [
                    'description' => __( 'Whether the BOGO offer is active.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'enum'        => [ 'yes', 'no' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'bogo_deal_type' => [
                    'description' => __( 'The deal type for BOGO (e.g., same or different products).', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'bogo_type' => [
                    'description' => __( 'The target type of the BOGO deal, such as products or categories.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'minimum_quantity_required' => [
                    'description' => __( 'Minimum quantity required to trigger the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_start_date' => [
                    'description' => __( 'The formatted start date of the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'format'      => 'date',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_end_date' => [
                    'description' => __( 'The formatted end date of the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'format'      => 'date',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_start' => [
                    'description' => __( 'The start date in YYYY-MM-DD format.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'format'      => 'date',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_end' => [
                    'description' => __( 'The end date in YYYY-MM-DD format.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'format'      => 'date',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offered_products' => [
                    'description' => __( 'Array of product IDs eligible for BOGO.', 'storegrowth-sales-booster' ),
                    'type'        => 'array',
                    'items'       => [ 'type' => 'integer' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'offered_categories' => [
                    'description' => __( 'Array of category IDs eligible for BOGO.', 'storegrowth-sales-booster' ),
                    'type'        => 'array',
                    'items'       => [ 'type' => 'integer' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_schedule' => [
                    'description' => __( 'Recurring schedule settings for the offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'array',
                    'items'       => [ 'type' => 'string' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'smart_offer' => [
                    'description' => __( 'Whether the offer is a smart (dynamic) offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'enum'        => [ 'true', 'false' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'get_different_product_field' => [
                    'description' => __( 'ID of the offered product.', 'storegrowth-sales-booster' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                ],
                'get_alternate_products' => [
                    'description' => __( 'Array of alternate product IDs for the offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'array',
                    'items'       => [ 'type' => 'string' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_type' => [
                    'description' => __( 'Type of benefit offered (free, fixed price, etc.).', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'discount_amount' => [
                    'description' => __( 'Amount of discount applied in the offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'default_badge_icon_name' => [
                    'description' => __( 'Name of the default badge icon.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'enable_custom_badge_image' => [
                    'description' => __( 'Whether a custom badge image is enabled (0 or 1).', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'enum'        => [ '0', '1' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'default_custom_badge_icon' => [
                    'description' => __( 'URL or path to the custom badge image.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'box_border_style' => [
                    'description' => __( 'CSS style for box border (e.g., solid, dashed).', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'box_border_color' => [
                    'description' => __( 'Color code of the border.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'box_top_margin' => [
                    'description' => __( 'Top margin value of the BOGO box.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'box_bottom_margin' => [
                    'description' => __( 'Bottom margin value of the BOGO box.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'discount_background_color' => [
                    'description' => __( 'Background color of the discount box.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'discount_text_color' => [
                    'description' => __( 'Text color for discount information.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'discount_font_size' => [
                    'description' => __( 'Font size for discount text.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'product_description_text_color' => [
                    'description' => __( 'Text color for product descriptions.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'product_description_font_size' => [
                    'description' => __( 'Font size for product descriptions.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'accept_offer_background_color' => [
                    'description' => __( 'Background color of the "Accept Offer" button.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'accept_offer_text_color' => [
                    'description' => __( 'Text color of the "Accept Offer" button.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'accept_offer_font_size' => [
                    'description' => __( 'Font size for the "Accept Offer" button text.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_description_background_color' => [
                    'description' => __( 'Background color for the offer description box.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_description_text_color' => [
                    'description' => __( 'Text color for the offer description.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_description_font_size' => [
                    'description' => __( 'Font size of the offer description text.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_image_url' => [
                    'description' => __( 'URL to the promotional image or icon.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'format'      => 'uri',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_product_title' => [
                    'description' => __( 'Title of the offered product.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_product_id' => [
                    'description' => __( 'Product ID for the offered product.', 'storegrowth-sales-booster' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_discount_title' => [
                    'description' => __( 'Title shown for the discount.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_fixed_price_title' => [
                    'description' => __( 'Title for fixed-price deals.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'product_description' => [
                    'description' => __( 'Short description for the offer product.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'selection_title' => [
                    'description' => __( 'Title shown during offer product selection.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_description' => [
                    'description' => __( 'The long description of the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offer_product_regular_price' => [
                    'description' => __( 'Regular price of the offered product.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'product_page_message' => [
                    'description' => __( 'Message shown on the product page for the offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'shop_page_message' => [
                    'description' => __( 'Message shown on the shop page for the offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'bogo_schedule' => [
                    'description' => __( 'Schedule configuration for offers.', 'storegrowth-sales-booster' ),
                    'type'        => 'array',
                    'items'       => [ 'type' => 'string' ],
                    'context'     => [ 'view', 'edit' ],
                ],
            ],
        ];
    }
}
