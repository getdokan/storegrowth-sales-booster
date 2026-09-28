<?php
/**
 * Contract tests for the Order Bump REST routes (step 11b).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\UpsellOrderBump;

use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\RestApi\OrderBumpController;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * `sales-booster/v1/order-bumps` (and `spsg/v1/order-bumps`), driven through
 * the REST server as an administrator. The module isn't activated in the
 * suite, so the routes are registered here.
 *
 * @group upsell-order-bump
 * @group rest
 */
class OrderBumpRestTest extends StoreGrowthTestCase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	const BASE = '/sales-booster/v1/order-bumps';

	/**
	 * The 2.x route base.
	 *
	 * @var string
	 */
	const LEGACY_BASE = '/spsg/v1/order-bumps';

	/**
	 * Pro state for the test (the `storegrowth_pro_is_active` filter).
	 *
	 * @var bool
	 */
	private $pro = false;

	/**
	 * REST server with the order bump routes, an empty table, an administrator.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}spsg_order_bumps" ); // phpcs:ignore WordPress.DB

		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action(
			'rest_api_init',
			static function () {
				( new OrderBumpController() )->register_routes();
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

		$this->pro = false;
		add_filter(
			'storegrowth_pro_is_active',
			function () {
				return $this->pro;
			},
			999
		);

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
	 * Dispatch a request.
	 *
	 * @param string $method HTTP method.
	 * @param string $route  Route.
	 * @param array  $body   JSON body.
	 * @param array  $query  Query parameters.
	 *
	 * @return \WP_REST_Response
	 */
	private function request( string $method, string $route, array $body = [], array $query = [] ) {
		$request = new WP_REST_Request( $method, $route );
		$request->set_query_params( $query );

		if ( $body ) {
			$request->set_header( 'Content-Type', 'application/json' );
			$request->set_body( wp_json_encode( $body ) );
		}

		return rest_get_server()->dispatch( $request );
	}

	/**
	 * A create payload.
	 *
	 * @param array $overrides Keys to replace.
	 *
	 * @return array
	 */
	private function payload( array $overrides = [] ): array {
		return array_merge(
			[
				'name'             => 'Bump',
				'target_type'      => 'products',
				'target_products'  => [ $this->create_product()->get_id() ],
				'offer_product_id' => $this->create_product( 20 )->get_id(),
				'offer_type'       => 'discount',
				'offer_amount'     => 10,
			],
			$overrides
		);
	}

	/**
	 * Create a bump through the data layer, as the 2.x admin left it.
	 *
	 * @param array $overrides Keys to replace.
	 *
	 * @return int
	 */
	private function insert_bump( array $overrides = [] ): int {
		return (int) ( new OrderBumpData() )->create( $this->payload( $overrides ) );
	}

	/**
	 * Both namespaces serve the same routes.
	 *
	 * @return void
	 */
	public function test_routes_are_registered_under_both_namespaces() {
		$routes = rest_get_server()->get_routes();

		foreach ( [ self::BASE, self::LEGACY_BASE ] as $base ) {
			foreach ( [ '', '/batch', '/editor', '/matching', '/(?P<id>[\d]+)', '/(?P<id>[\d]+)/status' ] as $path ) {
				$this->assertArrayHasKey( $base . $path, $routes, $base . $path );
			}
		}

		$id = $this->insert_bump();
		$this->assertSame( 200, $this->request( 'GET', self::LEGACY_BASE . '/' . $id )->get_status() );
		$this->assertSame( 200, $this->request( 'GET', self::BASE . '/' . $id )->get_status() );
	}

	/**
	 * `orderby` / `order` never reach the SQL unchecked: the route rejects
	 * values outside its enum, and the data layer allows only known columns.
	 *
	 * @return void
	 */
	public function test_list_sort_is_allow_listed() {
		$this->insert_bump();

		$injection = '(CASE WHEN 1=1 THEN name ELSE id END)';
		$this->assertSame( 400, $this->request( 'GET', self::BASE, [], [ 'orderby' => $injection ] )->get_status() );
		$this->assertSame( 400, $this->request( 'GET', self::BASE, [], [ 'order' => 'ASC, id' ] )->get_status() );
		$this->assertSame( 400, $this->request( 'GET', self::BASE, [], [ 'per_page' => 1000 ] )->get_status() );
		$this->assertSame( 200, $this->request( 'GET', self::BASE, [], [ 'orderby' => 'name', 'order' => 'ASC' ] )->get_status() );

		global $wpdb;
		$wpdb->last_query = '';
		( new OrderBumpData() )->get_all(
			[
				'order_by' => $injection,
				'order'    => 'ASC; DROP',
			]
		);
		$this->assertStringContainsString( 'ORDER BY created_at DESC', $wpdb->last_query );
	}

	/**
	 * Bug 2: the list pages with totals always sent, filters by status and
	 * by name (plain and as the 2.x admin encoded it), and says whether a
	 * create would pass.
	 *
	 * @return void
	 */
	public function test_list_pages_filters_and_sends_totals() {
		$this->pro = true;

		$empty = $this->request( 'GET', self::BASE );
		$this->assertSame( '0', (string) $empty->get_headers()['X-WP-Total'], 'sent when zero' );
		$this->assertSame( '0', (string) $empty->get_headers()['X-WP-TotalPages'] );

		// The 2.x admin's encoding of "Summer sale!".
		$this->insert_bump( [ 'name' => 'Summer&#32;sale&#33;' ] );
		$this->insert_bump( [ 'name' => 'Winter deal' ] );
		$this->insert_bump(
			[
				'name'   => 'Spring sale',
				'status' => 'inactive',
			]
		);

		$page = $this->request( 'GET', self::BASE, [], [ 'per_page' => 2 ] );
		$this->assertCount( 2, $page->get_data() );
		$this->assertSame( '3', (string) $page->get_headers()['X-WP-Total'] );
		$this->assertSame( '2', (string) $page->get_headers()['X-WP-TotalPages'] );
		$this->assertSame( '1', $page->get_headers()['X-SPSG-Can-Create'] );
		$this->assertCount(
			1,
			$this->request(
				'GET',
				self::BASE,
				[],
				[
					'per_page' => 2,
					'page'     => 2,
				]
			)->get_data()
		);

		$found = $this->request( 'GET', self::BASE, [], [ 'search' => 'Summer sale!' ] )->get_data();
		$this->assertCount( 1, $found, 'an encoded name matches the plain search' );
		$this->assertSame( 'Summer sale!', $found[0]['name'], 'and is returned decoded' );

		$sales = $this->request( 'GET', self::BASE, [], [ 'search' => 'sale' ] );
		$this->assertCount( 2, $sales->get_data() );
		$this->assertSame( '2', (string) $sales->get_headers()['X-WP-Total'], 'the total counts the search' );

		$this->assertCount( 1, $this->request( 'GET', self::BASE, [], [ 'status' => 'inactive' ] )->get_data() );
		$this->assertCount( 0, $this->request( 'GET', self::BASE, [], [ 'search' => 'nothing like it' ] )->get_data() );
	}

	/**
	 * A row carries what the list shows: target names and images, the offer
	 * product, the prices in the store's format, the status.
	 *
	 * @return void
	 */
	public function test_rows_carry_the_list_cells() {
		$target = $this->create_product();
		$target->set_name( 'Target & Co' );
		$target->save();
		$offer = $this->create_product( 174 );
		$offer->set_name( 'Offer product' );
		$offer->save();

		$this->insert_bump(
			[
				'target_products'  => [ $target->get_id() ],
				'offer_product_id' => $offer->get_id(),
				'offer_type'       => 'discount',
				'offer_amount'     => 20,
			]
		);

		$row = $this->request( 'GET', self::BASE )->get_data()[0];

		$this->assertSame( 'Target & Co', $row['targets'][0]['name'] );
		$this->assertArrayHasKey( 'image', $row['targets'][0] );
		$this->assertSame( 'Offer product', $row['offer_product_info']['name'] );
		$this->assertSame( html_entity_decode( wp_strip_all_tags( wc_price( 174 ) ), ENT_QUOTES, 'UTF-8' ), $row['offer_prices']['regular'] );
		$this->assertSame( html_entity_decode( wp_strip_all_tags( wc_price( 139.2 ) ), ENT_QUOTES, 'UTF-8' ), $row['offer_prices']['offer'] );
		$this->assertSame( 'active', $row['status'] );
		$this->assertSame( 20.0, $row['offer_amount'] );

		$category = self::factory()->term->create(
			[
				'taxonomy' => 'product_cat',
				'name'     => 'Hats',
			]
		);
		$id       = $this->insert_bump(
			[
				'target_type'       => 'categories',
				'target_products'   => [],
				'target_categories' => [ $category ],
			]
		);
		$row      = $this->request( 'GET', self::BASE . '/' . $id )->get_data();
		$this->assertSame( 'Hats', $row['targets'][0]['name'] );
	}

	/**
	 * A PUT merges over the stored bump and its design: keys left out, and
	 * design keys this version doesn't know, are kept.
	 *
	 * @return void
	 */
	public function test_update_merges_the_stored_bump_and_design() {
		$id = $this->insert_bump(
			[
				'design_settings' => [
					'box_border_color' => '#123456',
					'future_key'       => 'kept',
				],
			]
		);

		$response = $this->request(
			'PUT',
			self::BASE . '/' . $id,
			[
				'name'            => 'Renamed',
				'design_settings' => [ 'discount_text_color' => '#abcdef' ],
			]
		);
		$this->assertSame( 200, $response->get_status() );

		$bump = ( new OrderBumpData() )->get_by_id( $id );
		$this->assertSame( 'Renamed', $bump['name'] );
		$this->assertSame( 10.0, (float) $bump['offer_amount'], 'left out, kept' );
		$this->assertSame( '#123456', $bump['design_settings']['box_border_color'], 'the stored design survives' );
		$this->assertSame( '#abcdef', $bump['design_settings']['discount_text_color'] );
		$this->assertSame( 'kept', $bump['design_settings']['future_key'], 'an unknown key survives' );

		$got = $this->request( 'GET', self::BASE . '/' . $id )->get_data();
		$this->assertSame( '#123456', $got['design_settings']['box_border_color'], 'GET returns the design' );
	}

	/**
	 * The 2.x admin's full PUT (entity-encoded texts, the whole design) still
	 * saves, with the texts decoded and the storefront copies refreshed.
	 *
	 * @return void
	 */
	public function test_legacy_admin_payload_round_trips() {
		$offer = $this->create_product( 20 );
		$offer->set_name( 'Beanie' );
		$offer->save();

		$id = $this->insert_bump( [ 'offer_product_id' => $offer->get_id() ] );

		$response = $this->request(
			'PUT',
			self::LEGACY_BASE . '/' . $id,
			[
				'name'             => 'My&#32;bump',
				'target_type'      => 'products',
				'target_products'  => [ $this->create_product()->get_id() ],
				'offer_product_id' => $offer->get_id(),
				'offer_type'       => 'price',
				'offer_amount'     => '2',
				'design_settings'  => [
					'box_border_style'              => 'dashed',
					'box_border_color'              => '#32DBBE',
					'box_top_margin'                => 1,
					'discount_font_size'            => '13',
					'accept_offer_background_color' => '#e08b22ff',
					'offer_image_url'               => 'https://example.com/stale.jpg',
					'offer_product_title'           => 'Stale title',
					'offer_discount_title'          => '&#37;&#32;off&#32;only&#32;for&#32;you&#33;',
					'offer_fixed_price_title'       => '&#36;&#32;Just&#32;Only',
				],
			]
		);
		$this->assertSame( 200, $response->get_status(), wp_json_encode( $response->get_data() ) );

		$bump   = ( new OrderBumpData() )->get_by_id( $id );
		$design = $bump['design_settings'];
		$this->assertSame( 'My bump', $bump['name'] );
		$this->assertSame( '% off only for you!', $design['offer_discount_title'] );
		$this->assertSame( '% off only for you!', $bump['offer_discount_title'], 'the column gets the title too' );
		$this->assertSame( '$ Just Only', $design['offer_fixed_price_title'] );
		$this->assertSame( '#e08b22ff', $design['accept_offer_background_color'], 'an 8-digit hex survives' );
		$this->assertSame( 'dashed', $design['box_border_style'] );
		$this->assertSame( 1, $design['box_top_margin'] );
		$this->assertSame( '13', $design['discount_font_size'] );
		$this->assertSame( 'Beanie', $design['offer_product_title'], 'copied from the product' );
		$this->assertSame( '', $design['offer_image_url'], 'no image: empty, the storefront falls back' );
		$this->assertSame( '20', $design['offer_product_regular_price'] );
	}

	/**
	 * `design_settings` are sanitized key by key.
	 *
	 * @return void
	 */
	public function test_design_settings_are_sanitized_per_key() {
		$response = $this->request(
			'POST',
			self::BASE,
			$this->payload(
				[
					'design_settings' => [
						'box_border_color'        => 'red;background:url(https://evil.test)',
						'discount_text_color'     => 'rgba(0, 0, 0, 0.5)',
						'box_border_style'        => 'solid;x:y',
						'box_top_margin'          => '12',
						'discount_font_size'      => 'large',
						'offer_fixed_price_title' => '<img src=x onerror=alert(1)>Only',
						'offer_description'       => '<script>alert(1)</script>Hi',
					],
				]
			)
		);
		$this->assertSame( 201, $response->get_status() );

		$design = ( new OrderBumpData() )->get_by_id( $response->get_data()['id'] )['design_settings'];
		$this->assertSame( '#32DBBE', $design['box_border_color'], 'an invalid colour falls back to the default' );
		$this->assertSame( 'rgba(0, 0, 0, 0.5)', $design['discount_text_color'] );
		$this->assertSame( 'solid', $design['box_border_style'] );
		$this->assertSame( 12, $design['box_top_margin'] );
		$this->assertSame( '13', $design['discount_font_size'] );
		$this->assertSame( 'Only', $design['offer_fixed_price_title'] );
		$this->assertStringNotContainsString( '<', $design['offer_description'] );
		$this->assertSame( 'Add product description please', $design['product_description'], 'a new bump gets the defaults' );

		$update = $this->request( 'PUT', self::BASE . '/' . $response->get_data()['id'], [ 'design_settings' => [ 'box_border_style' => 'no_border' ] ] );
		$this->assertSame( 'no_border', $update->get_data()['design_settings']['box_border_style'] );
	}

	/**
	 * `offer_type`: `free` forces the amount to 0; a discount is over 0 and
	 * at most 100; a price isn't negative; an update checks only what it
	 * sends.
	 *
	 * @return void
	 */
	public function test_offer_type_and_amount_rules() {
		$this->pro = true;

		$free = $this->request(
			'POST',
			self::BASE,
			$this->payload(
				[
					'offer_type'   => 'free',
					'offer_amount' => 15,
				]
			)
		);
		$this->assertSame( 201, $free->get_status() );
		$this->assertSame( 0.0, $free->get_data()['offer_amount'] );
		$this->assertSame( 'free', $free->get_data()['offer_type'] );

		foreach ( [ 0, 101, -5 ] as $amount ) {
			$response = $this->request( 'POST', self::BASE, $this->payload( [ 'offer_amount' => $amount ] ) );
			$this->assertSame( 400, $response->get_status(), "discount $amount" );
			$this->assertSame( 'order_bump_invalid_discount', $response->get_data()['code'] );
		}

		$price = $this->request(
			'POST',
			self::BASE,
			$this->payload(
				[
					'offer_type'   => 'price',
					'offer_amount' => -1,
				]
			)
		);
		$this->assertSame( 'order_bump_invalid_price', $price->get_data()['code'] );

		$this->assertSame(
			400,
			$this->request( 'POST', self::BASE, $this->payload( [ 'offer_type' => 'percentage' ] ) )->get_status(),
			'an unknown type is refused'
		);

		// A bump stored before the rules (150%) can still be renamed.
		$legacy = $this->insert_bump( [ 'offer_amount' => 150 ] );
		$this->assertSame( 200, $this->request( 'PUT', self::BASE . '/' . $legacy, [ 'name' => 'Renamed' ] )->get_status() );
		$this->assertSame( 400, $this->request( 'PUT', self::BASE . '/' . $legacy, [ 'offer_amount' => 150 ] )->get_status() );
	}

	/**
	 * The save rules: a name, a target for the type, an offer product that
	 * can be a cart line.
	 *
	 * @return void
	 */
	public function test_save_rules() {
		$this->pro = true;

		$this->assertSame( 'order_bump_missing_name', $this->request( 'POST', self::BASE, $this->payload( [ 'name' => '<b></b>' ] ) )->get_data()['code'] );
		$this->assertSame( 'order_bump_missing_target', $this->request( 'POST', self::BASE, $this->payload( [ 'target_products' => [] ] ) )->get_data()['code'] );
		$this->assertSame(
			'order_bump_missing_target',
			$this->request(
				'POST',
				self::BASE,
				$this->payload(
					[
						'target_type'       => 'categories',
						'target_categories' => [],
					]
				)
			)->get_data()['code']
		);

		$variable = new \WC_Product_Variable();
		$variable->set_name( 'Variable' );
		$variable->save();
		$this->assertSame( 'order_bump_invalid_offer_product', $this->request( 'POST', self::BASE, $this->payload( [ 'offer_product_id' => $variable->get_id() ] ) )->get_data()['code'] );
		$this->assertSame( 'order_bump_invalid_offer_product', $this->request( 'POST', self::BASE, $this->payload( [ 'offer_product_id' => 999999 ] ) )->get_data()['code'] );
	}

	/**
	 * Lite keeps two bumps of any status: a third create gets 403, pro lifts
	 * it, existing bumps stay editable.
	 *
	 * @return void
	 */
	public function test_lite_limit() {
		$this->insert_bump();
		$second = $this->insert_bump( [ 'status' => 'inactive' ] );

		$response = $this->request( 'POST', self::BASE, $this->payload() );
		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'salesbooster_limit_exceeded', $response->get_data()['code'] );
		$this->assertSame( '0', $this->request( 'GET', self::BASE )->get_headers()['X-SPSG-Can-Create'] );
		$this->assertFalse( $this->request( 'GET', self::BASE . '/editor' )->get_data()['can_create'] );

		$this->assertSame( 200, $this->request( 'PUT', self::BASE . '/' . $second, [ 'name' => 'Still editable' ] )->get_status() );
		$this->assertSame( 200, $this->request( 'POST', self::BASE . '/' . $second . '/status', [ 'status' => 'active' ] )->get_status() );

		$this->pro = true;
		$this->assertSame( 201, $this->request( 'POST', self::BASE, $this->payload() )->get_status() );
		$this->assertTrue( $this->request( 'GET', self::BASE . '/editor' )->get_data()['can_create'] );
	}

	/**
	 * Bug 3: the status route turns a bump on and off (`active`/`inactive`,
	 * or `yes`/`no` as the BOGO list sends).
	 *
	 * @return void
	 */
	public function test_status_route() {
		$id   = $this->insert_bump();
		$data = new OrderBumpData();

		$this->assertSame( 'inactive', $this->request( 'POST', self::BASE . '/' . $id . '/status', [ 'status' => 'no' ] )->get_data()['status'] );
		$this->assertSame( 'inactive', $data->get_by_id( $id )['status'] );

		$this->request( 'PATCH', self::LEGACY_BASE . '/' . $id . '/status', [ 'status' => 'active' ] );
		$this->assertSame( 'active', $data->get_by_id( $id )['status'] );

		$this->assertSame( 400, $this->request( 'POST', self::BASE . '/' . $id . '/status', [ 'status' => 'maybe' ] )->get_status() );
		$this->assertSame( 404, $this->request( 'POST', self::BASE . '/999999/status', [ 'status' => 'yes' ] )->get_status() );
	}

	/**
	 * Bulk delete: each id through a single delete's checks; the missing ones
	 * are reported.
	 *
	 * @return void
	 */
	public function test_batch_delete() {
		$this->pro = true;
		$one       = $this->insert_bump();
		$two       = $this->insert_bump();
		$keep      = $this->insert_bump();

		$deleted = did_action( 'spsg_order_bump_deleted' );
		$result  = $this->request( 'POST', self::BASE . '/batch', [ 'delete' => [ $one, $two, 999999 ] ] )->get_data();

		$this->assertSame( [ $one, $two ], $result['deleted'] );
		$this->assertSame( [ 999999 ], $result['failed'] );
		$this->assertSame( $deleted + 2, did_action( 'spsg_order_bump_deleted' ), 'the delete hook fires per bump' );
		$this->assertNotNull( ( new OrderBumpData() )->get_by_id( $keep ) );
	}

	/**
	 * A user without `manage_options` is refused.
	 *
	 * @return void
	 */
	public function test_routes_need_manage_options() {
		$id = $this->insert_bump();
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'shop_manager' ] ) );

		$this->assertSame( 403, $this->request( 'GET', self::BASE )->get_status() );
		$this->assertSame( 403, $this->request( 'POST', self::BASE . '/batch', [ 'delete' => [ $id ] ] )->get_status() );
		$this->assertSame( 403, $this->request( 'POST', self::BASE . '/' . $id . '/status', [ 'status' => 'no' ] )->get_status() );
	}
}
