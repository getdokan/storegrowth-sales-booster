<?php
/**
 * The product pickers' route: variations only on request (step 11c).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Rest;

use StorePulse\StoreGrowth\REST\ProductController;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Product_Attribute;
use WC_Product_Variable;
use WC_Product_Variation;
use WP_REST_Request;
use WP_REST_Server;

/**
 * `sales-booster/v1/products` as an administrator.
 *
 * @group rest
 */
class ProductControllerTest extends StoreGrowthTestCase {

	/**
	 * REST server with the products route, and an administrator.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action(
			'rest_api_init',
			static function () {
				( new ProductController() )->register_routes();
			}
		);
		/**
		 * Fires when preparing to serve a REST API request (WordPress core).
		 *
		 * @since 4.4.0
		 *
		 * @param WP_REST_Server $wp_rest_server Server object.
		 */
		do_action( 'rest_api_init', $wp_rest_server );

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
	}

	/**
	 * Drop the server.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		global $wp_rest_server;
		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		parent::tearDown();
	}

	/**
	 * The ids a products request returns.
	 *
	 * @param array $query Query parameters.
	 *
	 * @return int[]
	 */
	private function ids( array $query ): array {
		$request = new WP_REST_Request( 'GET', '/sales-booster/v1/products' );
		$request->set_query_params( $query );

		$response = rest_get_server()->dispatch( $request );
		$this->assertSame( 200, $response->get_status() );

		$ids = wp_list_pluck( $response->get_data(), 'id' );
		sort( $ids );

		return $ids;
	}

	/**
	 * A variable product "Parka" with one variation.
	 *
	 * @return WC_Product_Variation
	 */
	private function create_variation(): WC_Product_Variation {
		$attribute = new WC_Product_Attribute();
		$attribute->set_name( 'size' );
		$attribute->set_options( [ 'small', 'large' ] );
		$attribute->set_visible( true );
		$attribute->set_variation( true );

		$parent = new WC_Product_Variable();
		$parent->set_name( 'Parka' );
		$parent->set_status( 'publish' );
		$parent->set_attributes( [ $attribute ] );
		$parent->save();

		$variation = new WC_Product_Variation();
		$variation->set_parent_id( $parent->get_id() );
		$variation->set_attributes( [ 'size' => 'large' ] );
		$variation->set_regular_price( '20' );
		$variation->set_status( 'publish' );
		$variation->save();

		return wc_get_product( $variation->get_id() );
	}

	/**
	 * Without `include_variations` a variation is neither found nor resolved
	 * by id (as before); with it, both.
	 *
	 * @return void
	 */
	public function test_variations_only_on_request() {
		$variation = $this->create_variation();
		$parent_id = $variation->get_parent_id();
		$both      = [ $parent_id, $variation->get_id() ];
		sort( $both );

		$this->assertSame( [ $parent_id ], $this->ids( [ 'search' => 'Parka' ] ) );
		$this->assertSame(
			[ $parent_id ],
			$this->ids( [ 'include' => implode( ',', $both ) ] )
		);

		$this->assertSame(
			$both,
			$this->ids(
				[
					'search'             => 'Parka',
					'include_variations' => true,
				]
			)
		);
		$this->assertSame(
			$both,
			$this->ids(
				[
					'include'            => implode( ',', $both ),
					'include_variations' => true,
				]
			)
		);
	}

	/**
	 * 11e: with variations, a variation says whether it has an "Any …"
	 * attribute (the order bump offer picker leaves those out); without,
	 * nothing is added.
	 *
	 * @return void
	 */
	public function test_variation_says_when_an_attribute_is_any() {
		$set = $this->create_variation();

		$any = new WC_Product_Variation();
		$any->set_parent_id( $set->get_parent_id() );
		$any->set_attributes( [ 'size' => '' ] );
		$any->set_regular_price( '20' );
		$any->set_status( 'publish' );
		$any->save();

		$request = new WP_REST_Request( 'GET', '/sales-booster/v1/products' );
		$request->set_query_params(
			[
				'include'            => implode( ',', [ $set->get_parent_id(), $set->get_id(), $any->get_id() ] ),
				'include_variations' => true,
			]
		);
		$flags = [];
		foreach ( rest_get_server()->dispatch( $request )->get_data() as $product ) {
			if ( array_key_exists( 'any_attribute', $product ) ) {
				$flags[ $product['id'] ] = $product['any_attribute'];
			}
		}

		$this->assertFalse( $flags[ $set->get_id() ] );
		$this->assertTrue( $flags[ $any->get_id() ] );
		$this->assertArrayNotHasKey( $set->get_parent_id(), $flags, 'only variations carry it' );

		$request = new WP_REST_Request( 'GET', '/sales-booster/v1/products' );
		$request->set_query_params( [ 'include' => (string) $set->get_parent_id() ] );
		$this->assertArrayNotHasKey( 'any_attribute', rest_get_server()->dispatch( $request )->get_data()[0] );
	}

	/**
	 * `spsg_product_query_args` still scopes a request with variations (e.g.
	 * a Dokan vendor's own products).
	 *
	 * @return void
	 */
	public function test_query_filter_applies_with_variations() {
		$variation = $this->create_variation();

		add_filter(
			'spsg_product_query_args',
			static function ( $args ) use ( $variation ) {
				$args['post__in'] = [ $variation->get_id() ];

				return $args;
			}
		);

		$this->assertSame(
			[ $variation->get_id() ],
			$this->ids(
				[
					'search'             => 'Parka',
					'include_variations' => true,
				]
			)
		);
	}
}
