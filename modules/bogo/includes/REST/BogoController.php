<?php

namespace StorePulse\StoreGrowth\Modules\BoGo\REST;

use Exception;
use WP_Error;
use WP_HTTP_Response;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;

defined( 'ABSPATH' ) || exit();

/**
 * BogoController Class.
 *
 * @package SBFW
 */
class BogoController extends WP_REST_Controller {

    /**
     * Class Constructor.
     */
    public function __construct() {
        $this->namespace = 'sales-booster/v1';
        $this->rest_base = 'bogo/offers';
    }

    /**
     * Register REST routes.
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

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)/status',
            [
                'args' => [
                    'id' => [
                        'description' => __( 'Bogo offer ID', 'storegrowth-sales-booster' ),
                        'type'        => 'integer',
                    ],
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [ $this, 'update_status' ],
                    'permission_callback' => [ $this, 'check_permission' ],
                    'args'                => [
                        'id' => [
                            'type'     => 'integer',
                            'required' => true,
                        ],
                        'status' => [
                            'type'     => 'string',
                            'required' => true,
                            'enum'     => [ 'yes', 'no' ],
                        ],
                    ],
                ],
            ]
        );
    }

    /**
     * Get query filters for fetching BOGO offers.
     * This method can be overridden by child classes to customize query filters.
     *
     * @since 2.0.0
     * @param WP_REST_Request $request Rest Request.
     * @return array Query filters for BogoDataManager.
     */
    protected function get_query_filters( $request ) {
        return apply_filters( 'spsg_bogo_rest_query_filters', [], $request );
    }

    /**
     * Get query options for fetching BOGO offers.
     * This method can be overridden by child classes to customize query options.
     *
     * @since 2.0.0
     * @param WP_REST_Request $request Rest Request.
     * @return array Query options for BogoDataManager.
     */
    protected function get_query_options( $request ) {
        $params = $request->get_params();
        $per_page = isset( $params['per_page'] ) ? (int) $params['per_page'] : 20;
        $page = isset( $params['page'] ) ? (int) $params['page'] : 1;

        return [
            'limit' => $per_page,
            'offset' => ($page - 1) * $per_page,
            'order_by' => 'created_at DESC'
        ];
    }

    /**
     * Get total count of BOGO offers for pagination.
     * This method can be overridden by child classes to customize count logic.
     *
     * @since 2.0.0
     * @param array $query_filters Query filters.
     * @param WP_REST_Request $request Rest Request.
     * @return int Total count of offers.
     */
    protected function get_total_items_count( $query_filters, $request ) {
        if ( ! empty( $query_filters ) ) {
            return BogoDataManager::get_bogo_offers_count( $query_filters );
        } else {
            // For global offers, add the type filter
            return BogoDataManager::get_bogo_offers_count( ['type' => 'global'] );
        }
    }

    /**
     * Get BOGO offers with pagination.
     *
     * @since 2.0.0
     * @param WP_REST_Request $request Rest Request.
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_items( $request ) {
        // Get custom query filters and options from child classes
        $query_filters = $this->get_query_filters( $request );
        $query_options = $this->get_query_options( $request );
        
        // Get total count for pagination
        $total_items = $this->get_total_items_count( $query_filters, $request );

        $offers = BogoDataManager::get_bogo_offers( $query_filters, $query_options );

        $data = [];
        
        foreach ( $offers as $item ) {
            $item_data = $this->prepare_item_for_response( $item, $request );
            $data[] = $this->prepare_response_for_collection( $item_data );
        }

        $response = rest_ensure_response( $data );
        return $this->format_collection_response( $response, $request, $total_items );
    }

    /**
     * Check permission for accessing a single BOGO offer.
     * This method can be overridden by child classes to implement custom permission logic.
     *
     * @since 2.0.0
     * @param array $item The BOGO offer data.
     * @param WP_REST_Request $request Rest Request.
     * @return bool|WP_Error True if permission granted, WP_Error otherwise.
     */
    protected function check_single_item_permission( $item, $request ) {
        return apply_filters( 'spsg_bogo_single_item_permission', true,  $item, $request );
    }

    /**
     * Get a single BOGO offer.
     *
     * @since 2.0.0
     * @param WP_REST_Request $request Rest Request.
     * @return WP_Error|WP_HTTP_Response|WP_REST_Response
     */
    public function get_item( $request ) {
        $id = $request->get_param( 'id' );
        $item = BogoDataManager::get_bogo_offer( $id );

        if ( ! $item ) {
            return new WP_REST_Response( [ 'error' => __( 'No BOGO offer found for the given ID.', 'storegrowth-sales-booster' ) ], 404 );
        }

        // Check custom permission logic from child classes
        $permission_check = $this->check_single_item_permission( $item, $request );
        if ( is_wp_error( $permission_check ) ) {
            return $permission_check;
        }

        $response = $this->prepare_item_for_response( $item, $request );
        $response->set_status( 200 );

        return $response;
    }

    /**
     * Prepare data before creating a BOGO offer.
     * This method can be overridden by child classes to customize data before creation.
     *
     * @since 2.0.0
     * @param array $data The validated request data.
     * @param WP_REST_Request $request Rest Request.
     * @return array Modified data for creation.
     */
    protected function prepare_data_for_creation( $data, $request ) {
        return $data;
    }

    /**
     * Check creation limitations before creating a BOGO offer.
     * This method can be overridden by child classes to implement custom limitations.
     *
     * @since 2.0.0
     * @param array $data The validated request data.
     * @param WP_REST_Request $request Rest Request.
     * @return bool|WP_Error True if allowed, WP_Error otherwise.
     */
    protected function check_creation_limitations( $data, $request ) {
        // Check for free version limitations
        if ( ! sp_store_growth()->has_pro() ) {
            $existing_offers = BogoDataManager::get_global_bogo_offers();
            if ( count( $existing_offers ) >= 2 ) {
                return new WP_Error(
                    'salesbooster_limit_exceeded',
                    __( 'BOGO limit exceeded. Upgrade to PRO for unlimited offers.', 'storegrowth-sales-booster' ),
                    [ 'status' => 403 ]
                );
            }
        }

        return true;
    }

    /**
     * Create a BOGO offer.
     *
     * @since 2.0.0
     * @param \WP_REST_Request $request The REST request.
     * @return WP_REST_Response|WP_Error
     * @throws Exception if any error
     */
    public function create_item( $request ) {
        $data = $request->get_params();

        // Validate and normalize data
        $validation = $this->validate_and_normalize_data( $data );
        if ( is_wp_error( $validation ) ) {
            return $validation;
        }
        $data = $validation;

        // Check creation limitations
        $limitation_check = $this->check_creation_limitations( $data, $request );
        if ( is_wp_error( $limitation_check ) ) {
            return $limitation_check;
        }

        // Prepare data for creation (can be customized by child classes)
        $data = $this->prepare_data_for_creation( $data, $request );

		// check the duplicate bogo offer
		$existing = BogoDataManager::get_bogo_offers([
			'offered_products' => wp_json_encode( $data['offered_products'] ?? array() ),
		]);

		if ( ! empty( $existing ) ) {
			return new WP_Error(
				'bogo_offer_exists',
				__('This product already has an active BOGO offer. Please remove the previous offer or select different products to create a new one.', '')
			);
		}

        $result = BogoDataManager::create_global_offer( $data );

        if ( ! $result ) {
            return new WP_REST_Response( [ 'error' => __( 'Failed to create BOGO offer.', 'storegrowth-sales-booster' ) ], 400 );
        }

        $created_data = BogoDataManager::get_bogo_offer( $result );
        if ( ! $created_data ) {
            return new WP_REST_Response( [ 'error' => __( 'Failed to retrieve created BOGO offer.', 'storegrowth-sales-booster' ) ], 500 );
        }

        $response = $this->prepare_item_for_response( $created_data, $request );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Update a BOGO offer.
     *
     * @since 2.0.0
     * @param WP_REST_Request $request The REST request.
     * @return WP_REST_Response|WP_Error
     */
    public function update_item( $request ) {
        $id = $request->get_param( 'id' );
        $data = $request->get_params();

        // Validate and normalize data
        $validation = $this->validate_and_normalize_data( $data );
        if ( is_wp_error( $validation ) ) {
            return $validation;
        }
        $data = $validation;

        $existing_offer = BogoDataManager::get_bogo_offer( $id );
        if ( ! $existing_offer ) {
            return new WP_REST_Response( [ 'error' => __( 'BOGO offer not found.', 'storegrowth-sales-booster' ) ], 404 );
        }

        // Check custom permission logic from child classes
        $permission_check = $this->check_single_item_permission( $existing_offer, $request );
        if ( is_wp_error( $permission_check ) ) {
            return $permission_check;
        }

        $result = BogoDataManager::update_global_offer( $id, $data );

        $updated_data = BogoDataManager::get_bogo_offer( $id );
        $response = $this->prepare_item_for_response( $updated_data, $request );
        $response->set_status( 200 );

        return $response;
    }

    /**
     * Delete a BOGO offer.
     *
     * @since 2.0.0
     * @param WP_REST_Request $request The REST request.
     * @return WP_REST_Response|WP_Error
     */
    public function delete_item( $request ) {
        $id = $request->get_param( 'id' );
        
        $existing_offer = BogoDataManager::get_bogo_offer( $id );
        if ( ! $existing_offer ) {
            return new WP_REST_Response( [ 'error' => __( 'BOGO offer not found.', 'storegrowth-sales-booster' ) ], 404 );
        }

        // Check custom permission logic from child classes
        $permission_check = $this->check_single_item_permission( $existing_offer, $request );
        if ( is_wp_error( $permission_check ) ) {
            return $permission_check;
        }

        $result = BogoDataManager::delete_bogo_offer( $id );

        if ( ! $result ) {
            return new WP_REST_Response( [ 'error' => __( 'Failed to delete BOGO offer.', 'storegrowth-sales-booster' ) ], 400 );
        }

        return new WP_REST_Response( [ 'deleted' => true ], 200 );
    }

    /**
     * Update BOGO offer status.
     *
     * @since 2.0.0
     * @param WP_REST_Request $request The REST request.
     * @return WP_REST_Response
     */
    public function update_status( $request ) {
        $id = $request->get_param( 'id' );
        $status = $request->get_param( 'status' );
        $table_status = ( $status === 'yes' ) ? 'active' : 'inactive';
        
        $result = BogoDataManager::set_bogo_status( $id, $table_status );

        if ( ! $result ) {
            return new WP_REST_Response( [ 'error' => __( 'Failed to update BOGO offer status.', 'storegrowth-sales-booster' ) ], 400 );
        }

        return new WP_REST_Response( [ 'status' => $status ], 200 );
    }

    /**
     * Validate and normalize request data.
     *
     * @since 2.0.0
     * @param array $data The request data.
     * @return array|WP_Error Normalized data or error if validation fails.
     */
    protected function validate_and_normalize_data( $data ) {
        if ( empty( $data ) || ! is_array( $data ) ) {
            return new WP_Error(
                'invalid_data',
                __( 'No data provided', 'storegrowth-sales-booster' ),
                [ 'status' => 400 ]
            );
        }

        // Normalize data
        $data = $this->normalize_request_data( $data );

        // Validate required fields
        if ( ! isset( $data['name_of_order_bogo'] ) || trim( $data['name_of_order_bogo'] ) === '' ) {
            return new WP_Error(
                'missing_name_of_order_bogo',
                __( 'Missing or empty required field: name_of_order_bogo', 'storegrowth-sales-booster' ),
                [ 'status' => 400 ]
            );
        }

        if ( ! isset( $data['offer_type'] ) || trim( $data['offer_type'] ) === '' ) {
            return new WP_Error(
                'missing_offer_type',
                __( 'Missing or empty required field: offer_type', 'storegrowth-sales-booster' ),
                [ 'status' => 400 ]
            );
        }

        // Validate design fields are present
        $design_fields = [
            'box_border_style',
            'box_border_color', 
            'box_top_margin',
            'box_bottom_margin',
            'discount_background_color',
            'discount_text_color',
            'discount_font_size',
            'product_description_text_color',
            'product_description_font_size'
        ];
        
        foreach ( $design_fields as $field ) {
            if ( ! isset( $data[ $field ] ) || trim( $data[ $field ] ) === '' ) {
                return new WP_Error(
                    'missing_design_field',
                    __( 'Missing or empty required design field: ' . $field, 'storegrowth-sales-booster' ),
                    [ 'status' => 400 ]
                );
            }
        }

        return $data;
    }

    /**
     * Normalize request data for backward compatibility.
     *
     * @since 2.0.0
     * @param array $data The request data.
     * @return array Normalized data.
     */
    protected function normalize_request_data( $data ) {
        // Ensure backward compatibility for 'name' field
        if ( isset( $data['name'] ) && ! isset( $data['name_of_order_bogo'] ) ) {
            $data['name_of_order_bogo'] = $data['name'];
        }

        // Decode HTML entities and sanitize name_of_order_bogo
        if ( isset( $data['name_of_order_bogo'] ) ) {
            $data['name_of_order_bogo'] = html_entity_decode( $data['name_of_order_bogo'], ENT_QUOTES | ENT_HTML5, 'UTF-8' );
            $data['name_of_order_bogo'] = sanitize_text_field( $data['name_of_order_bogo'] );
        }

        // Ensure offer_type is preserved
        if ( isset( $data['offer_type'] ) ) {
            $data['offer_type'] = sanitize_text_field( $data['offer_type'] );
        }

        // Normalize offered_products (convert string to array if needed)
        if ( isset( $data['offered_products'] ) && is_string( $data['offered_products'] ) ) {
            $data['offered_products'] = array_map( 'absint', array_filter( explode( ',', $data['offered_products'] ) ) );
        }

        // Normalize offered_categories (convert string to array if needed)
        if ( isset( $data['offered_categories'] ) && is_string( $data['offered_categories'] ) ) {
            $data['offered_categories'] = array_map( 'absint', array_filter( explode( ',', $data['offered_categories'] ) ) );
        }

        		// Normalize get_alternate_products (convert string to array if needed)
		if ( isset( $data['get_alternate_products'] ) && is_string( $data['get_alternate_products'] ) ) {
			$data['get_alternate_products'] = array_map( 'absint', array_filter( explode( ',', $data['get_alternate_products'] ) ) );
		}

		// Normalize offer_schedule (convert string to array if needed)
		if ( isset( $data['offer_schedule'] ) && is_string( $data['offer_schedule'] ) ) {
			$data['offer_schedule'] = array_filter( explode( ',', $data['offer_schedule'] ) );
		}

		// Ensure offer_schedule has a default value
		if ( ! isset( $data['offer_schedule'] ) || empty( $data['offer_schedule'] ) ) {
			$data['offer_schedule'] = array( 'daily' );
		}

		// Normalize design fields
		$design_fields = [
			'box_border_style',
			'box_border_color', 
			'box_top_margin',
			'box_bottom_margin',
			'discount_background_color',
			'discount_text_color',
			'discount_font_size',
			'product_description_text_color',
			'product_description_font_size'
		];
		
		foreach ( $design_fields as $field ) {
			if ( isset( $data[ $field ] ) ) {
				$data[ $field ] = sanitize_text_field( $data[ $field ] );
			}
		}

		// Normalize date fields - convert empty strings or invalid dates to null
		$date_fields = [ 'offer_start', 'offer_end' ];
		foreach ( $date_fields as $field ) {
			if ( isset( $data[ $field ] ) ) {
				$date_value = trim( $data[ $field ] );
				// Convert empty strings, '0000-00-00', or invalid dates to null
				if ( empty( $date_value ) || $date_value === '0000-00-00' || $date_value === '0000-00-00 00:00:00' ) {
					$data[ $field ] = null;
				} else {
					// Validate the date format and convert invalid dates to null
					$timestamp = strtotime( $date_value );
					if ( $timestamp === false ) {
						$data[ $field ] = null;
					} else {
						// Keep the original format but ensure it's a valid date
						$data[ $field ] = $date_value;
					}
				}
			}
		}

		return $data;
    }

    /**
     * Custom validation for offered_products field.
     *
     * @since 2.0.0
     * @param mixed $value The value to validate.
     * @param WP_REST_Request $request The request object.
     * @param string $param The parameter name.
     * @return bool|WP_Error
     */
    public function validate_offered_products( $value, $request, $param ) {
        return true;
    }

    /**
     * Custom validation for offered_categories field.
     *
     * @since 2.0.0
     * @param mixed $value The value to validate.
     * @param WP_REST_Request $request The request object.
     * @param string $param The parameter name.
     * @return bool|WP_Error
     */
    public function validate_offered_categories( $value, $request, $param ) {
        return true;
    }

    /**
     * Custom validation for get_alternate_products field.
     *
     * @since 2.0.0
     * @param mixed $value The value to validate.
     * @param WP_REST_Request $request The request object.
     * @param string $param The parameter name.
     * @return bool|WP_Error
     */
    public function validate_get_alternate_products( $value, $request, $param ) {
        return true;
    }

    /**
     * Permission checker.
     *
     * @since 2.0.0
     * @param WP_REST_Request $request Rest Request.
     * @return bool|WP_Error
     */
    public function check_permission( $request ) {
        if ( apply_filters( 'spsg_bogo_check_permission', current_user_can( 'manage_options' ), $request ) ) {
            return true;
        }

        return new WP_Error(
            'salesbooster_permission_failure',
            __( 'Sorry! You are not permitted to do the current action.', 'storegrowth-sales-booster' ),
            [ 'status' => 403 ]
        );
    }

    /**
     * Get endpoint arguments for create item.
     *
     * @since 2.0.0
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
            'name' => [
                'type'              => 'string',
                'description'       => __( 'Name of the BOGO offer (alternative to name_of_order_bogo).', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offered_products' => [
                'type'        => [ 'array', 'string' ],
                'items'       => [ 'type' => 'integer' ],
                'description' => __( 'Array of target product IDs or comma-separated string.', 'storegrowth-sales-booster' ),
                'validate_callback' => [ $this, 'validate_offered_products' ],
            ],
            'get_different_product_field' => [
                'type'              => [ 'integer', 'string' ],
                'description'       => __( 'ID of the offered product.', 'storegrowth-sales-booster' ),
                'default'           => 0,
                'sanitize_callback' => 'absint',
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
            'offered_categories' => [
                'type'        => [ 'array', 'string' ],
                'items'       => [ 'type' => 'integer' ],
                'description' => __( 'Target category IDs (array or comma-separated string).', 'storegrowth-sales-booster' ),
                'validate_callback' => [ $this, 'validate_offered_categories' ],
            ],
            'get_alternate_products' => [
                'type'        => [ 'array', 'string' ],
                'items'       => [ 'type' => 'integer' ],
                'description' => __( 'Alternate product IDs for GET BOGO type (array or comma-separated string).', 'storegrowth-sales-booster' ),
                'validate_callback' => [ $this, 'validate_get_alternate_products' ],
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
            'bogo_badge_image' => [
                'type'              => 'string',
                'description'       => __( 'Badge image for the BOGO offer.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'alternate_products' => [
                'type'        => 'array',
                'items'       => [ 'type' => 'integer' ],
                'description' => __( 'Array of alternate product IDs.', 'storegrowth-sales-booster' ),
                'validate_callback' => 'rest_validate_request_arg',
            ],
            'offer_start_date' => [
                'type'              => 'string',
                'description'       => __( 'Offer start date.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_end_date' => [
                'type'              => 'string',
                'description'       => __( 'Offer end date.', 'storegrowth-sales-booster' ),
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ];
    }

    /**
     * Prepare item for the REST API response.
     *
     * @since 2.0.0
     * @param array $item BOGO offer data.
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function prepare_item_for_response( $item, $request ) {
        $fields = $this->get_fields_for_response( $request );
        $data = [];

        $field_map = [
            'id'                          => 'absint',
            'name'                        => 'html_entity_decode',
            'name_of_order_bogo'          => 'html_entity_decode',
            'offered_products'            => null,
            'offered_categories'          => null,
            'get_different_product_field'  => 'absint',
            'offer_product_id'            => 'absint',
            'bogo_deal_type'              => null,
            'offer_type'                  => null,
            'discount_amount'             => null,
            'minimum_quantity_required'   => null,
            'offer_start'                 => null,
            'offer_end'                   => null,
            'product_page_message'        => null,
            'shop_page_message'           => null,
            'bogo_badge_image'            => null,
            'alternate_products'          => null,
            'get_alternate_products'      => null,
            'type'                        => null,
            'status'                      => null,
            'created_at'                  => null,
            'updated_at'                  => null,
        ];

        foreach ( $field_map as $key => $callback ) {
            if ( in_array( $key, $fields, true ) && isset( $item[ $key ] ) ) {
                $value = $item[ $key ];
                $data[ $key ] = is_callable( $callback ) ? call_user_func( $callback, $value ) : $value;
            }
        }

        if ( isset( $item['name'] ) && ! isset( $data['name_of_order_bogo'] ) ) {
            $data['name_of_order_bogo'] = $item['name'];
        }
        
        if ( isset( $item['offer_product_id'] ) && ! isset( $data['get_different_product_field'] ) ) {
            $data['get_different_product_field'] = $item['offer_product_id'];
        }
        
        if ( isset( $item['alternate_products'] ) && ! isset( $data['get_alternate_products'] ) ) {
            $data['get_alternate_products'] = $item['alternate_products'];
        }

		$currency = wp_strip_all_tags( html_entity_decode( get_woocommerce_currency_symbol() ) );

		if ( isset( $data['get_different_product_field'] ) ) {
			$product = wc_get_product( $data['get_different_product_field'] );
			if ( $product ) {
				$data['get_different_product_info'] = [
					'id' => $product->get_id(),
					'name' => $product->get_title(),
					'price' => $product->get_price(),
					'currency' => $currency
				];
			}
		}

		if ( isset( $data['offered_products'] ) ) {
			$product = wc_get_product( $data['offered_products'][0] ?? 0 );
			if ( $product ) {
				$data['get_offered_product_info'] = [
					'id' => $product->get_id(),
					'name' => $product->get_title(),
					'price' => $product->get_price(),
					'currency' => $currency
				];
			}
		}

        $context = ! empty( $request['context'] ) ? $request['context'] : 'view';
        $data = $this->filter_response_by_context( $data, $context );
        $data = $this->add_additional_fields_to_object( $data, $request );
        $response = rest_ensure_response( $data );

        return apply_filters( 'storegrowth_rest_prepare_bogo_offer', $response, $item, $request );
    }

    /**
     * Format item's collection for response.
     *
     * @since 2.0.0
     * @param WP_REST_Response $response
     * @param WP_REST_Request $request
     * @param int $total_items
     * @return WP_REST_Response
     */
    public function format_collection_response( $response, $request, $total_items ) {
        if ( $total_items === 0 ) {
            return $response;
        }

        $per_page = (int) ( ! empty( $request['per_page'] ) ? $request['per_page'] : 20 );
        $page = (int) ( ! empty( $request['page'] ) ? $request['page'] : 1 );

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
     * Get the item schema.
     *
     * @since 2.0.0
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
                'name' => [
                    'description' => __( 'The name of the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'offered_products' => [
                    'description' => __( 'Array of target product IDs.', 'storegrowth-sales-booster' ),
                    'type'        => 'array',
                    'items'       => [ 'type' => 'integer' ],
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
                    'items'       => [ 'type' => 'integer' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'alternate_products' => [
                    'description' => __( 'Array of alternate product IDs for the offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'array',
                    'items'       => [ 'type' => 'integer' ],
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
                'bogo_badge_image' => [
                    'description' => __( 'Badge image for the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                ],
                'type' => [
                    'description' => __( 'Type of BOGO offer (global or product).', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'enum'        => [ 'global', 'product' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'status' => [
                    'description' => __( 'Status of the BOGO offer (active or inactive).', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'enum'        => [ 'active', 'inactive' ],
                    'context'     => [ 'view', 'edit' ],
                ],
                'created_at' => [
                    'description' => __( 'Creation timestamp of the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'format'      => 'date-time',
                    'context'     => [ 'view', 'edit' ],
                ],
                'updated_at' => [
                    'description' => __( 'Last update timestamp of the BOGO offer.', 'storegrowth-sales-booster' ),
                    'type'        => 'string',
                    'format'      => 'date-time',
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
