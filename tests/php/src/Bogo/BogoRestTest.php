<?php
/**
 * Contract tests for the BOGO REST routes (step 10a: bugs 1–5 and R3).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\Helper;
use StorePulse\StoreGrowth\Modules\BoGo\REST\BogoController;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * `sales-booster/v1/bogo/offers`, driven through the REST server as an
 * administrator. The module isn't activated in the suite, so the routes are
 * registered here.
 *
 * @group bogo
 * @group rest
 */
class BogoRestTest extends StoreGrowthTestCase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	const BASE = '/sales-booster/v1/bogo/offers';

	/**
	 * Pro state for the test (the `storegrowth_pro_is_active` filter).
	 *
	 * @var bool
	 */
	private $pro = false;

	/**
	 * REST server with the BOGO routes, and an administrator.
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
				( new BogoController() )->register_routes();
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
	 * A full create payload, as the admin editor sends it.
	 *
	 * @param array $overrides Keys to replace.
	 *
	 * @return array
	 */
	private function payload( array $overrides = [] ): array {
		return array_merge(
			[
				'name_of_order_bogo'             => 'Offer',
				'offered_products'               => [ $this->create_product()->get_id() ],
				'get_different_product_field'    => $this->create_product()->get_id(),
				'offer_type'                     => 'free',
				'box_border_style'               => 'solid',
				'box_border_color'               => '#e0e0e0',
				'box_top_margin'                 => 10,
				'box_bottom_margin'              => 10,
				'discount_background_color'      => '#E1FFF4',
				'discount_text_color'            => '#02AC6E',
				'discount_font_size'             => '14',
				'product_description_text_color' => '#333333',
				'product_description_font_size'  => '12',
			],
			$overrides
		);
	}

	/**
	 * Bug 1: GET returns the design and the schedule, and a PUT that sends
	 * only the name keeps them.
	 *
	 * @return void
	 */
	public function test_update_keeps_what_the_request_leaves_out() {
		$this->pro = true;
		$created   = $this->request(
			'POST',
			self::BASE,
			$this->payload(
				[
					'box_border_color'          => '#123456',
					'discount_text_color'       => '#abcdef',
					'minimum_quantity_required' => 3,
					'offer_schedule'            => [ 'monday' ],
				]
			)
		);
		$this->assertSame( 201, $created->get_status() );
		$id = $created->get_data()['id'];

		$got = $this->request( 'GET', self::BASE . '/' . $id )->get_data();
		$this->assertSame( '#123456', $got['box_border_color'], 'GET returns the design' );
		$this->assertSame( [ 'monday' ], $got['offer_schedule'], 'GET returns the schedule' );

		$this->assertSame( 200, $this->request( 'PUT', self::BASE . '/' . $id, [ 'name_of_order_bogo' => 'Renamed' ] )->get_status() );

		$offer = BogoDataManager::get_bogo_offer( $id );
		$this->assertSame( 'Renamed', $offer['name'] );
		$design = BogoDataManager::get_design_settings( $offer['design_settings'] );
		$this->assertSame( '#123456', $design['box_border_color'], 'the design survives' );
		$this->assertSame( '#abcdef', $design['discount_text_color'] );
		$this->assertSame( [ 'monday' ], $offer['offer_schedule'], 'the schedule survives' );
		$this->assertSame( 3, (int) $offer['minimum_quantity_required'], 'min quantity survives' );
	}

	/**
	 * Bug 2: `search`, `type` and `status` reach the query.
	 *
	 * @return void
	 */
	public function test_list_filters_by_search_type_and_status() {
		$this->pro = true;
		$this->create_global_offer( [ 'name_of_order_bogo' => 'Summer sale' ] );
		$this->create_global_offer(
			[
				'name_of_order_bogo' => 'Winter deal',
				'status'             => 'inactive',
			]
		);

		$this->assertCount( 1, $this->request( 'GET', self::BASE, [], [ 'search' => 'Summer' ] )->get_data() );
		$this->assertCount( 1, $this->request( 'GET', self::BASE, [], [ 'status' => 'inactive' ] )->get_data() );
		$this->assertCount( 2, $this->request( 'GET', self::BASE, [], [ 'type' => 'global' ] )->get_data() );
		$this->assertCount( 0, $this->request( 'GET', self::BASE, [], [ 'search' => 'nothing like it' ] )->get_data() );
	}

	/**
	 * Bug 3: `X-WP-Total` counts every listed row, and is sent when zero.
	 *
	 * @return void
	 */
	public function test_total_counts_every_row_and_is_always_sent() {
		$empty = $this->request( 'GET', self::BASE );
		$this->assertSame( 0, $empty->get_headers()['X-WP-Total'] ?? null, 'sent for an empty table' );

		$this->create_global_offer( [ 'name_of_order_bogo' => 'A' ] );
		$this->create_global_offer( [ 'name_of_order_bogo' => 'B' ] );
		BogoDataManager::save_product_bogo_settings( $this->create_product()->get_id(), 0, $this->bogo_settings() );

		$list = $this->request( 'GET', self::BASE );
		$this->assertCount( 3, $list->get_data() );
		$this->assertSame( 3, $list->get_headers()['X-WP-Total'], 'product offers counted too' );
	}

	/**
	 * Bug 4: the global offer list carries status and dates, and a badge
	 * sent with an offer is stored.
	 *
	 * @return void
	 */
	public function test_global_list_carries_status_and_badge_keys_persist() {
		$this->create_global_offer(
			[
				'name_of_order_bogo'        => 'Badge',
				'offer_end'                 => '2030-01-01 00:00:00',
				'enable_custom_badge_image' => true,
				'default_badge_icon_name'   => 'bogo-icons-3',
			]
		);

		$item = Helper::get_global_offered_product_list()[0];
		$this->assertSame( 'active', $item['status'] );
		$this->assertSame( '2030-01-01', $item['offer_end'], 'a DATE column' );
		$this->assertTrue( (bool) $item['enable_custom_badge_image'] );
		$this->assertSame( 'bogo-icons-3', $item['default_badge_icon_name'] );
	}

	/**
	 * Bug 5: one lite limit, global offers of any status; the list says
	 * whether another can be created.
	 *
	 * @return void
	 */
	public function test_lite_limit_counts_inactive_offers() {
		$this->create_global_offer( [ 'status' => 'inactive' ] );
		$this->create_global_offer( [ 'status' => 'inactive' ] );

		$this->assertSame( 403, $this->request( 'POST', self::BASE, $this->payload() )->get_status() );
		$this->assertSame( '0', $this->request( 'GET', self::BASE )->get_headers()['X-SPSG-Can-Create'] );

		$this->pro = true;
		$this->assertSame( 201, $this->request( 'POST', self::BASE, $this->payload() )->get_status() );
		$this->assertSame( '1', $this->request( 'GET', self::BASE )->get_headers()['X-SPSG-Can-Create'] );
	}

	/**
	 * Bug 5: the product tab finds a product inside an offer once the limit
	 * is reached (the plucked list of lists never matched).
	 *
	 * @return void
	 */
	public function test_product_tab_stays_open_for_a_product_in_an_offer() {
		$in  = $this->create_product();
		$out = $this->create_product();
		$this->create_global_offer( [ 'offered_products' => [ $in->get_id() ] ] );
		$this->create_global_offer( [ 'offered_products' => [ $this->create_product()->get_id() ] ] );

		$this->assertTrue( Helper::is_load_product_bogo_offer( $in->get_id() ), 'a product in an offer keeps its tab' );
		$this->assertFalse( Helper::is_load_product_bogo_offer( $out->get_id() ), 'others are locked at the limit' );
	}

	/**
	 * R3: without pro, a new offer gets the defaults for min quantity and
	 * schedule; a Buy X Get X deal type is kept as sent (lite's storefront
	 * skips it) rather than turned into another deal.
	 *
	 * @return void
	 */
	public function test_pro_values_are_ignored_on_create_without_pro() {
		$created = $this->request(
			'POST',
			self::BASE,
			$this->payload(
				[
					'bogo_deal_type'            => 'same',
					'minimum_quantity_required' => 5,
					'offer_schedule'            => [ 'monday' ],
				]
			)
		);
		$this->assertSame( 201, $created->get_status() );

		$offer = BogoDataManager::get_bogo_offer( $created->get_data()['id'] );
		$this->assertSame( 'same', $offer['bogo_deal_type'] );
		$this->assertSame( 1, (int) $offer['minimum_quantity_required'] );
		$this->assertSame( [ 'daily' ], $offer['offer_schedule'] );
	}

	/**
	 * R3: without pro, an update keeps the stored pro values.
	 *
	 * @return void
	 */
	public function test_pro_values_are_kept_on_update_without_pro() {
		$id = $this->create_global_offer(
			[
				'name_of_order_bogo'        => 'Kept',
				'minimum_quantity_required' => 4,
				'offer_schedule'            => [ 'friday' ],
			]
		);

		$response = $this->request(
			'PUT',
			self::BASE . '/' . $id,
			[
				'bogo_deal_type'            => 'same',
				'minimum_quantity_required' => 9,
				'offer_schedule'            => [ 'monday' ],
			]
		);
		$this->assertSame( 200, $response->get_status() );

		$offer = BogoDataManager::get_bogo_offer( $id );
		$this->assertSame( 'different', $offer['bogo_deal_type'] );
		$this->assertSame( 4, (int) $offer['minimum_quantity_required'] );
		$this->assertSame( [ 'friday' ], $offer['offer_schedule'] );
	}

	/**
	 * Keys in `design_settings` this version doesn't know survive an update.
	 *
	 * @return void
	 */
	public function test_unknown_design_keys_survive_an_update() {
		global $wpdb;

		$id = $this->create_global_offer( [ 'name_of_order_bogo' => 'Legacy' ] );
		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prefix . 'spsg_bogo_settings',
			[
				'design_settings' => wp_json_encode(
					[
						'box_border_color' => '#111111',
						'legacy_unknown'   => 'keep',
					]
				),
			],
			[ 'id' => $id ]
		);

		$this->assertSame( 200, $this->request( 'PUT', self::BASE . '/' . $id, [ 'name_of_order_bogo' => 'Renamed' ] )->get_status() );

		$design = json_decode( BogoDataManager::get_bogo_offer( $id )['design_settings'], true );
		$this->assertSame( 'keep', $design['legacy_unknown'] );
		$this->assertSame( '#111111', $design['box_border_color'] );
	}

	/**
	 * At the limit, an otherwise incomplete create gets 403, not the
	 * validation error (the route's required args still come first).
	 *
	 * @return void
	 */
	public function test_limit_comes_before_validation() {
		$this->create_global_offer();
		$this->create_global_offer();

		$response = $this->request(
			'POST',
			self::BASE,
			[
				'name_of_order_bogo' => 'Incomplete',
				'offer_type'         => 'free',
			]
		);
		$this->assertSame( 403, $response->get_status() );
	}

	/**
	 * The product tab stays open for a product in an inactive global offer.
	 *
	 * @return void
	 */
	public function test_product_tab_stays_open_for_a_product_in_an_inactive_offer() {
		$in = $this->create_product();
		$this->create_global_offer(
			[
				'offered_products' => [ $in->get_id() ],
				'status'           => 'inactive',
			]
		);
		$this->create_global_offer( [ 'offered_products' => [ $this->create_product()->get_id() ] ] );

		$this->assertTrue( Helper::is_load_product_bogo_offer( $in->get_id() ) );
	}

	/**
	 * Bulk delete removes the given offers and reports ids it couldn't.
	 *
	 * @return void
	 */
	public function test_batch_delete() {
		$a = $this->create_global_offer( [ 'name_of_order_bogo' => 'A' ] );
		$b = $this->create_global_offer( [ 'name_of_order_bogo' => 'B' ] );
		$c = $this->create_global_offer( [ 'name_of_order_bogo' => 'C' ] );

		$result = $this->request( 'POST', self::BASE . '/batch', [ 'delete' => [ $a, $b, 99999 ] ] )->get_data();

		$this->assertSame( [ $a, $b ], $result['deleted'] );
		$this->assertSame( [ 99999 ], $result['failed'] );
		$this->assertNull( BogoDataManager::get_bogo_offer( $a ) );
		$this->assertNotNull( BogoDataManager::get_bogo_offer( $c ) );
	}

	/**
	 * Bulk delete skips an offer the item permission refuses (the Dokan
	 * vendor check uses this path).
	 *
	 * @return void
	 */
	public function test_batch_delete_respects_item_permission() {
		$mine   = $this->create_global_offer( [ 'name_of_order_bogo' => 'Mine' ] );
		$theirs = $this->create_global_offer( [ 'name_of_order_bogo' => 'Theirs' ] );

		add_filter(
			'spsg_bogo_single_item_permission',
			static function ( $allowed, $item ) use ( $theirs ) {
				return (int) $item['id'] === $theirs ? new \WP_Error( 'not_yours', 'No', [ 'status' => 403 ] ) : $allowed;
			},
			10,
			2
		);

		$result = $this->request( 'POST', self::BASE . '/batch', [ 'delete' => [ $mine, $theirs ] ] )->get_data();

		$this->assertSame( [ $mine ], $result['deleted'] );
		$this->assertSame( [ $theirs ], $result['failed'] );
		$this->assertNotNull( BogoDataManager::get_bogo_offer( $theirs ) );
	}

	/**
	 * List rows carry what the list cells show: thumbnails, both prices and,
	 * for product offers, the product to edit.
	 *
	 * @return void
	 */
	public function test_list_rows_carry_cell_data() {
		$target = $this->create_product( 20.0 );
		BogoDataManager::save_product_bogo_settings(
			$target->get_id(),
			0,
			$this->bogo_settings(
				[
					'offered_products'            => [ $target->get_id() ],
					'get_different_product_field' => $this->create_product( 30.0 )->get_id(),
				]
			)
		);

		$row = $this->request( 'GET', self::BASE )->get_data()[0];
		$this->assertSame( $target->get_id(), $row['product_id'] );
		$this->assertNotEmpty( $row['edit_url'] );
		$this->assertSame( '30', $row['get_different_product_info']['regular_price'] );
		$this->assertNotEmpty( $row['get_different_product_info']['image'] );
		$this->assertStringContainsString( '30', $row['offer_prices']['regular'] );
		$this->assertStringContainsString( '0', $row['offer_prices']['offer'], 'free' );
	}

	/**
	 * Buy X Get X prices the target product; category offers list their
	 * categories by name.
	 *
	 * @return void
	 */
	public function test_list_rows_for_same_product_and_category_offers() {
		$this->pro = true;
		$target    = $this->create_product( 40.0 );
		$category  = self::factory()->term->create(
			[
				'taxonomy' => 'product_cat',
				'name'     => 'Shoes & Bags',
			]
		);
		$this->create_global_offer(
			[
				'name_of_order_bogo' => 'Same',
				'bogo_deal_type'     => 'same',
				'offered_products'   => [ $target->get_id() ],
				'offered_categories' => [ $category ],
				'offer_type'         => 'discount',
				'discount_amount'    => 50,
			]
		);

		$row = $this->request( 'GET', self::BASE )->get_data()[0];
		$this->assertStringContainsString( '40', $row['offer_prices']['regular'] );
		$this->assertStringContainsString( '20', $row['offer_prices']['offer'], '50% off the target' );
		$this->assertSame( [ 'Shoes & Bags' ], $row['target_categories'] );
	}

	/**
	 * The `name` alias still renames an offer on update.
	 *
	 * @return void
	 */
	public function test_name_alias_renames_on_update() {
		$id = $this->create_global_offer( [ 'name_of_order_bogo' => 'Old' ] );

		$this->request( 'PUT', self::BASE . '/' . $id, [ 'name' => 'New' ] );

		$this->assertSame( 'New', BogoDataManager::get_bogo_offer( $id )['name'] );
	}

	/**
	 * `search` matches `%` and `_` literally.
	 *
	 * @return void
	 */
	public function test_search_escapes_wildcards() {
		$this->create_global_offer( [ 'name_of_order_bogo' => '50% off' ] );
		$this->create_global_offer( [ 'name_of_order_bogo' => '50 off' ] );

		$this->assertCount( 1, $this->request( 'GET', self::BASE, [], [ 'search' => '50%' ] )->get_data() );
	}

	/**
	 * `search` keeps `<…` (a name can hold it).
	 *
	 * @return void
	 */
	public function test_search_keeps_angle_brackets() {
		$this->create_global_offer( [ 'name_of_order_bogo' => 'Deal <b>now</b>' ] );

		$this->assertCount( 1, $this->request( 'GET', self::BASE, [], [ 'search' => '<b>' ] )->get_data() );
	}

	/**
	 * A guest gets 401, a customer 403.
	 *
	 * @return void
	 */
	public function test_permission_status_codes() {
		wp_set_current_user( 0 );
		$this->assertSame( 401, $this->request( 'GET', self::BASE )->get_status() );

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'customer' ] ) );
		$this->assertSame( 403, $this->request( 'GET', self::BASE )->get_status() );
	}

	/**
	 * Badge keys sent with an update are sanitized, and the offer carries
	 * them at the top level (where the badge code reads them).
	 *
	 * @return void
	 */
	public function test_badge_keys_are_sanitized_and_readable() {
		// The offer's badge artwork is pro (10d); the switch is lite.
		$this->pro = true;
		$id        = $this->create_global_offer( [ 'name_of_order_bogo' => 'Badge' ] );

		$response = $this->request(
			'PUT',
			self::BASE . '/' . $id,
			[
				'enable_custom_badge_image' => 'yes',
				'default_badge_icon_name'   => '<b>bogo-icons-2</b>',
				'default_custom_badge_icon' => 'javascript:alert(1)',
			]
		);
		$this->assertSame( 200, $response->get_status() );

		$offer = BogoDataManager::get_bogo_offer( $id );
		$this->assertTrue( $offer['enable_custom_badge_image'] );
		$this->assertSame( 'bogo-icons-2', $offer['default_badge_icon_name'] );
		$this->assertSame( '', $offer['default_custom_badge_icon'] );
	}

	/**
	 * 10d, R3: the editor's pro fields (product page message, the offer's
	 * badge artwork) are ignored without pro: a new offer gets the defaults,
	 * an update keeps what's stored. The badge switch stays lite.
	 *
	 * @return void
	 */
	public function test_editor_pro_fields_are_ignored_without_pro() {
		$pro_values = [
			'product_page_message'      => 'Two for one',
			'enable_custom_badge_image' => true,
			'default_badge_icon_name'   => 'bogo-icons-3',
			'default_custom_badge_icon' => 'https://example.com/badge.png',
		];

		$created = $this->request( 'POST', self::BASE, $this->payload( $pro_values ) );
		$this->assertSame( 201, $created->get_status() );

		$offer = BogoDataManager::get_bogo_offer( $created->get_data()['id'] );
		$this->assertSame( 'Free Gift', $offer['product_page_message'], 'the old editor\'s default' );
		$this->assertTrue( $offer['enable_custom_badge_image'] );
		$this->assertSame( 'bogo-icons-1', $offer['default_badge_icon_name'] );
		$this->assertSame( '', $offer['default_custom_badge_icon'] );

		$this->pro = true;
		$id        = $this->create_global_offer( array_merge( [ 'name_of_order_bogo' => 'Pro' ], $pro_values ) );
		$this->pro = false;

		$response = $this->request(
			'PUT',
			self::BASE . '/' . $id,
			[
				'product_page_message'    => 'Changed',
				'default_badge_icon_name' => 'bogo-icons-4',
			]
		);
		$this->assertSame( 200, $response->get_status() );

		$offer = BogoDataManager::get_bogo_offer( $id );
		$this->assertSame( 'Two for one', $offer['product_page_message'] );
		$this->assertSame( 'bogo-icons-3', $offer['default_badge_icon_name'] );
		$this->assertSame( 'https://example.com/badge.png', $offer['default_custom_badge_icon'] );
	}

	/**
	 * 10d: a create checks the editor's rules (discount 1–100, end not
	 * before start, a target); an update only those about what it sends,
	 * so an offer stored before the rules can still be renamed.
	 *
	 * @return void
	 */
	public function test_offer_rules() {
		$cases = [
			'bogo_invalid_discount'      => [
				'offer_type'      => 'discount',
				'discount_amount' => 150,
			],
			'bogo_invalid_dates'         => [
				'offer_start' => '2030-02-01',
				'offer_end'   => '2030-01-01',
			],
			'bogo_missing_target'        => [ 'offered_products' => [] ],
			'bogo_missing_offer_product' => [
				'bogo_deal_type'              => 'different',
				'get_different_product_field' => 0,
			],
		];

		foreach ( $cases as $code => $values ) {
			$response = $this->request( 'POST', self::BASE, $this->payload( $values ) );
			$this->assertSame( 400, $response->get_status(), $code );
			$this->assertSame( $code, $response->get_data()['code'] );
		}

		$discount = $this->request( 'POST', self::BASE, $this->payload( [ 'offer_type' => 'discount' ] ) );
		$this->assertSame( 'bogo_invalid_discount', $discount->get_data()['code'], 'a discount without an amount' );

		// Stored before the rules: 150% off.
		$id = $this->create_global_offer(
			[
				'offer_type'      => 'discount',
				'discount_amount' => 150,
			]
		);
		$this->assertSame( 200, $this->request( 'PUT', self::BASE . '/' . $id, [ 'name_of_order_bogo' => 'Renamed' ] )->get_status() );
		$this->assertSame( 'bogo_invalid_discount', $this->request( 'PUT', self::BASE . '/' . $id, [ 'discount_amount' => 120 ] )->get_data()['code'] );
		$this->assertSame( 200, $this->request( 'PUT', self::BASE . '/' . $id, [ 'discount_amount' => 40 ] )->get_status() );
		$this->assertSame( 'bogo_missing_target', $this->request( 'PUT', self::BASE . '/' . $id, [ 'offered_products' => [] ] )->get_data()['code'] );
	}

	/**
	 * 10d: the offer price is never negative, and a discount out of 0–100
	 * doesn't mark the price up.
	 *
	 * @return void
	 */
	public function test_offer_price_is_clamped() {
		$this->assertSame( 0.0, (float) Helper::calculate_offer_price( 'discount', 100, 150 ) );
		$this->assertSame( 100.0, (float) Helper::calculate_offer_price( 'discount', 100, -20 ) );
		$this->assertSame( 60.0, (float) Helper::calculate_offer_price( 'discount', 100, 40 ) );
		$this->assertSame( 0.0, (float) Helper::calculate_offer_price( 'free', 100, 0 ) );
	}

	/**
	 * 10d: the editor route returns the page and fields (`BogoOfferFields`)
	 * with typed defaults, whether a new offer passes the limit, and the
	 * price format.
	 *
	 * @return void
	 */
	public function test_editor_route() {
		$response = $this->request( 'GET', self::BASE . '/editor' );
		$this->assertSame( 200, $response->get_status() );

		$data   = $response->get_data();
		$page   = (array) $data['page'];
		$schema = (array) $data['schema'];

		$this->assertSame( [ 'basic', 'content', 'design' ], array_keys( $page['tabs'] ) );
		$this->assertSame( [ 'setup', 'pricing', 'schedule', 'advanced' ], array_keys( $page['tabs']['basic']['sections'] ) );
		$this->assertSame( 'different', $schema['bogo_deal_type']['default'] );
		$this->assertSame( [ 'same' ], $schema['bogo_deal_type']['pro_options'] );
		$this->assertSame( [ 'bogo_deal_type' => 'different' ], $schema['get_different_product_field']['show_when'] );
		$this->assertSame( 1, $schema['box_top_margin']['default'], 'numbers typed' );
		$this->assertSame( [ 'daily' ], $schema['offer_schedule']['default'] );
		$this->assertTrue( $schema['minimum_quantity_required']['pro'] );
		$this->assertFalse( $schema['enable_custom_badge_image']['pro'] );
		$this->assertContains( 'no_border', $schema['box_border_style']['options'] );
		$this->assertTrue( $data['can_create'] );
		$this->assertSame( [ 'symbol', 'position', 'decimals', 'decimal_separator', 'thousand_separator' ], array_keys( $data['currency'] ) );

		$this->create_global_offer();
		$this->create_global_offer();
		$this->assertFalse( $this->request( 'GET', self::BASE . '/editor' )->get_data()['can_create'] );
	}

	/**
	 * 10d, ADR-010: extensions add fields and tabs in PHP; the offer's own
	 * fields can't be redefined and a field of an unknown type is dropped.
	 *
	 * @return void
	 */
	public function test_editor_is_extended_in_php() {
		$extend = static function ( $fields ) {
			$fields['my_note']            = [
				'type'  => 'text',
				'tab'   => 'extra',
				'label' => 'Note',
			];
			$fields['my_broken']          = [ 'type' => 'nope' ];
			$fields['name_of_order_bogo'] = [ 'type' => 'textarea' ];

			return $fields;
		};
		$tab    = static function ( $page ) {
			$page['tabs']['extra'] = [ 'label' => 'Extra' ];

			return $page;
		};
		add_filter( 'spsg_bogo_offer_fields', $extend );
		add_filter( 'spsg_bogo_offer_page', $tab );

		$data   = $this->request( 'GET', self::BASE . '/editor' )->get_data();
		$schema = (array) $data['schema'];

		$this->assertSame( 'extra', $schema['my_note']['tab'] );
		$this->assertArrayNotHasKey( 'my_broken', $schema );
		$this->assertSame( 'text', $schema['name_of_order_bogo']['type'] );
		$this->assertArrayHasKey( 'extra', ( (array) $data['page'] )['tabs'] );

		remove_filter( 'spsg_bogo_offer_fields', $extend );
		remove_filter( 'spsg_bogo_offer_page', $tab );
	}
}
