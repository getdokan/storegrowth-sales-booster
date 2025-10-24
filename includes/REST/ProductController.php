<?php

namespace StorePulse\StoreGrowth\REST;

use WC_REST_Products_Controller;

class ProductController extends WC_REST_Products_Controller {


	protected $namespace = 'sales-booster/v1';

	protected function prepare_objects_query( $request ) {
		$args = parent::prepare_objects_query( $request );

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

		return $params;
	}
}
