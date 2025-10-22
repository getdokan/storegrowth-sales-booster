<?php

namespace StorePulse\StoreGrowth\REST;

use WC_Product;
use WC_REST_Controller;
use WP_Error;
use WP_HTTP_Response;
use WP_Query;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

class ProductController extends WC_REST_Controller {

	/**
	 * Post type
	 *
	 * @var string
	 */
	protected string $post_type = 'product';

	/**
	 * Post status
	 */
	protected array $post_status = [ 'publish', 'pending', 'draft' ];

	public function __construct() {
		$this->namespace = 'sales-booster/v1';
		$this->rest_base = 'products';
		$this->post_type = 'product';
	}

	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'permission_callback' => [ $this, 'get_items_permissions_check' ],
					'args'                => $this->get_collection_params(),
				],
			]
		);
	}

	public function get_items_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return new WP_Error( 'rest_cannot_view', __( 'Sorry, you are not allowed to list resources.', 'storegrowth-sales-booster' ), [ 'status' => rest_authorization_required_code() ] );
		}

		return true;
	}

	/**
	 * Get product object
	 *
	 * @return WC_Product|null|false
	 */
	public function get_object( $id ) {
		return wc_get_product( $id );
	}

	protected function prepare_objects_query( $request ) {
		$args                        = array();
		$args['fields']              = 'ids';
		$args['post_status']         = ! isset( $request['post_status'] ) ? $this->post_status : $request['post_status'];
		$args['offset']              = $request['offset'];
		$args['order']               = $request['order'];
		$args['orderby']             = $request['orderby'];
		$args['paged']               = $request['page'];
		$args['post__in']            = $request['include'];
		$args['post__not_in']        = $request['exclude'];
		$args['posts_per_page']      = $request['per_page'];
		$args['name']                = $request['slug'];
		$args['post_parent__in']     = $request['parent'];
		$args['post_parent__not_in'] = $request['parent_exclude'];
		$args['s']                   = $request['search'];

		// author id
		if( ! current_user_can( 'manage_options' ) ) {
			$args['author'] = ! isset( $request['id'] ) ? get_current_user_id() : $request['id'];
		}

		if ( 'date' === $args['orderby'] ) {
			$args['orderby'] = 'date ID';
		}

		if ( ! isset( $args['orderby'] ) ) {
			$args['orderby'] = 'post_date';
		}

		$args['date_query'] = array();
		// Set before into date query. Date query must be specified as an array of an array.
		if ( isset( $request['before'] ) ) {
			$args['date_query'][0]['before'] = $request['before'];
		}

		// Set after into date query. Date query must be specified as an array of an array.
		if ( isset( $request['after'] ) ) {
			$args['date_query'][0]['after'] = $request['after'];
		}

		// Force the post_type argument, since it's not a user input variable.
		$args['post_type'] = $this->post_type;

        // Handle product_type taxonomy filter.
        if ( ! empty( $request['product_type'] ) ) {
            $args['tax_query'][] = array(
                'taxonomy' => 'product_type',
                'field'    => 'slug',
                'terms'    => $request['product_type'],
            );
        }

		return $args;
	}

	/**
	 * Get a collection of posts.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$query_args = $this->prepare_objects_query( $request );
		$query      = new WP_Query();
		$result     = $query->query( $query_args );

		$data_objects = array();
		$objects      = array_map( array( $this, 'get_object' ), $result );

		foreach ( $objects as $object ) {
			$data           = $this->prepare_data_for_response( $object, $request );
			$data_objects[] = $this->prepare_response_for_collection( $data );
		}

		$response = rest_ensure_response( $data_objects );

		return $this->format_collection_response( $response, $request, $query->found_posts );
	}

	/**
	 * Get product data.
	 *
	 * @param WC_Product $product Product instance.
	 * @param WP_REST_Request $request Request context.
	 *                            Options: 'view' and 'edit'.
	 *
	 * @return WP_Error|WP_HTTP_Response|WP_REST_Response
	 */
	protected function prepare_data_for_response( $product, $request ) {
		$context   = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$author_id = get_post_field( 'post_author', $product->get_id() );
		$data      = [
			'id'                 => $product->get_id(),
			'name'               => $product->get_name( $context ),
			'formatted_name'    => $product->get_formatted_name(),
			'slug'               => $product->get_slug( $context ),
			'post_author'        => $author_id,
			'permalink'          => $product->get_permalink(),
			'date_created'       => wc_rest_prepare_date_response( $product->get_date_created( $context ), false ),
			'date_created_gmt'   => wc_rest_prepare_date_response( $product->get_date_created( $context ) ),
			'date_modified'      => wc_rest_prepare_date_response( $product->get_date_modified( $context ), false ),
			'date_modified_gmt'  => wc_rest_prepare_date_response( $product->get_date_modified( $context ) ),
			'type'               => $product->get_type(),
			'status'             => $product->get_status( $context ),
			'featured'           => $product->is_featured(),
			'catalog_visibility' => $product->get_catalog_visibility( $context ),
			'description'        => 'view' === $context ? wpautop( do_shortcode( $product->get_description() ) ) : $product->get_description( $context ),
			'short_description'  => 'view' === $context ? apply_filters( 'woocommerce_short_description', $product->get_short_description() ) : $product->get_short_description( $context ),
			'sku'                => $product->get_sku( $context ),
			'price'              => $product->get_price( $context ),
			'regular_price'      => $product->get_regular_price( $context ),
			'sale_price'         => $product->get_sale_price( $context ) ? $product->get_sale_price( $context ) : '',
		];

		return rest_ensure_response( $data );
	}

	/**
	 * Format item's collection for response
	 *
	 * @param WP_REST_Response $response
	 * @param WP_REST_Request $request
	 * @param int $total_items
	 *
	 * @return WP_REST_Response
	 */
	public function format_collection_response( $response, $request, $total_items ) {
		if ( intval( $total_items ) === 0 ) {
			return $response;
		}

		// Store pagation values for headers then unset for count query.
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

	public function get_collection_params(): array {
		$params = parent::get_collection_params();

        $params['author'] = array(
            'description'       => __( 'Products author id', 'storegrowth-sales-booster' ),
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['post_status'] = array(
            'description'       => __( 'Product status publish, pending, draft etc.', 'storegrowth-sales-booster' ),
            'type'              => 'array',
            'sanitize_callback' => 'wc_clean',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['date'] = array(
            'description'       => __( 'Products publish month', 'storegrowth-sales-booster' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['product_cat'] = array(
            'description'       => __( 'Products category.', 'storegrowth-sales-booster' ),
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['product_type'] = array(
            'description'       => __( 'Products type all, simple, variable, grouped product etc.', 'storegrowth-sales-booster' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['stock_status'] = array(
            'description'       => __( 'Products stock status in stock or out of stock.', 'storegrowth-sales-booster' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );

        $params['filter_by_other'] = array(
            'description'       => __( 'Best selling, featured products etc.', 'storegrowth-sales-booster' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
            'required'          => false,
        );
        $params['include'] = array(
            'description'       => __( 'Limit result set to specific ids.', 'storegrowth-sales-booster' ),
            'type'              => 'array',
            'items'             => array(
                'type' => 'integer',
            ),
            'default'           => array(),
            'sanitize_callback' => 'wp_parse_id_list',
        );
        $params['exclude'] = array(
            'description'       => __( 'Ensure result set excludes specific IDs.', 'storegrowth-sales-booster' ),
            'type'              => 'array',
            'items'             => array(
                'type' => 'integer',
            ),
            'default'           => array(),
            'sanitize_callback' => 'wp_parse_id_list',
        );

		return $params;
	}
}
