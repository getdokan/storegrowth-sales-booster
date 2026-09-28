<?php

namespace StorePulse\StoreGrowth\REST;

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
