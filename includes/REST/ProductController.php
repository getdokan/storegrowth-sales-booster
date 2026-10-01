<?php

namespace StorePulse\StoreGrowth\REST;

use WC_Product_Variation;
use WC_REST_Products_Controller;

class ProductController extends WC_REST_Products_Controller {


	protected $namespace = 'sales-booster/v1';

	protected function prepare_objects_query( $request ) {
		$args = parent::prepare_objects_query( $request );

		// Opt-in: variations too (an offer product can be one). Before the
		// filter, so its scoping (e.g. a Dokan vendor's own) still applies.
		if ( $request->get_param( 'include_variations' ) ) {
			$args['post_type'] = [ 'product', 'product_variation' ];
		}

		return apply_filters( 'spsg_product_query_args', $args, $request);
	}

	/**
	 * A product as the route returns it. With `include_variations`, a
	 * variation also says whether one of its attributes is "Any …"
	 * (`any_attribute`): it can't be added to a cart without the shopper's
	 * choice, so it can't be an order bump's offer. WooCommerce leaves such
	 * an attribute out of `attributes`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param \WC_Data         $product Product.
	 * @param \WP_REST_Request $request Request.
	 *
	 * @return \WP_REST_Response
	 */
	public function prepare_object_for_response( $product, $request ) {
		$response = parent::prepare_object_for_response( $product, $request );

		if ( $request->get_param( 'include_variations' ) && $product instanceof WC_Product_Variation ) {
			$data                  = $response->get_data();
			$data['any_attribute'] = in_array( '', array_map( 'strval', $product->get_variation_attributes() ), true );
			$response->set_data( $data );
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

		/*
		 * Variations too (`product_variation` posts), e.g. to search or
		 * resolve an offer product.
		 *
		 * @since SPSG_VERSION
		 */
		$params['include_variations'] = [
			'description'       => __( 'Include product variations.', 'storegrowth-sales-booster' ),
			'type'              => 'boolean',
			'default'           => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
			'validate_callback' => 'rest_validate_request_arg',
		];

		return $params;
	}
}
