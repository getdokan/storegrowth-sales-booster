<?php
/**
 * Dokan vendors' BOGO offers (step 10f, bug 7).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Integrations\Dokan\BogoVendorRules;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\REST\BogoController;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * `sales-booster/v1/bogo/offers` as a vendor (a user with `dokandar`). Dokan
 * isn't loaded in the suite, so the vendor access its integration grants
 * (`Dashboard\Bogo`: the capability, and only the vendor's own offers) is
 * added here, and `BogoVendorRules` is registered by hand.
 *
 * @group bogo
 * @group rest
 * @group dokan
 */
class BogoVendorRulesTest extends StoreGrowthTestCase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	const BASE = '/sales-booster/v1/bogo/offers';

	/**
	 * The vendor under test.
	 *
	 * @var int
	 */
	private $vendor;

	/**
	 * Another vendor.
	 *
	 * @var int
	 */
	private $other;

	/**
	 * REST server with the BOGO routes, two vendors, the vendor logged in.
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

		// Pro: no lite cap in the way.
		add_filter( 'storegrowth_pro_is_active', '__return_true', 999 );

		// What the Dokan integration grants (`Dashboard\Bogo`).
		add_filter(
			'spsg_bogo_check_permission',
			static function ( $allowed ) {
				return current_user_can( 'manage_options' ) ? $allowed : current_user_can( 'dokandar' ); // phpcs:ignore WordPress.WP.Capabilities.Unknown -- Dokan's vendor capability.
			}
		);
		add_filter(
			'spsg_bogo_single_item_permission',
			static function ( $allowed, $item ) {
				if ( current_user_can( 'manage_options' ) || get_current_user_id() === (int) $item['created_by'] ) {
					return $allowed;
				}

				return new \WP_Error( 'salesbooster_permission_failure', 'Not yours.', [ 'status' => 403 ] );
			},
			10,
			2
		);

		( new BogoVendorRules() )->register_hooks();

		$this->vendor = $this->create_vendor();
		$this->other  = $this->create_vendor();

		wp_set_current_user( $this->vendor );
	}

	/**
	 * Drop the server and the option.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		global $wp_rest_server;
		$wp_rest_server = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		delete_option( BogoVendorRules::OPTION );

		parent::tearDown();
	}

	/**
	 * A user with Dokan's vendor capability.
	 *
	 * @return int
	 */
	private function create_vendor(): int {
		$id = self::factory()->user->create( [ 'role' => 'subscriber' ] );
		( new \WP_User( $id ) )->add_cap( 'dokandar' );

		return $id;
	}

	/**
	 * A product of a vendor.
	 *
	 * @param int $vendor Vendor.
	 *
	 * @return int
	 */
	private function product_of( int $vendor ): int {
		$id = $this->create_product()->get_id();
		wp_update_post(
			[
				'ID'          => $id,
				'post_author' => $vendor,
			]
		);

		return $id;
	}

	/**
	 * Dispatch a request.
	 *
	 * @param string $method HTTP method.
	 * @param string $route  Route.
	 * @param array  $body   JSON body.
	 *
	 * @return \WP_REST_Response
	 */
	private function request( string $method, string $route, array $body = [] ) {
		$request = new WP_REST_Request( $method, $route );

		if ( $body ) {
			$request->set_header( 'Content-Type', 'application/json' );
			$request->set_body( wp_json_encode( $body ) );
		}

		return rest_get_server()->dispatch( $request );
	}

	/**
	 * A create payload with the vendor's own products.
	 *
	 * @param array $overrides Keys to replace.
	 *
	 * @return array
	 */
	private function payload( array $overrides = [] ): array {
		return array_merge(
			[
				'name_of_order_bogo'             => 'Vendor offer',
				'offered_products'               => [ $this->product_of( $this->vendor ) ],
				'get_different_product_field'    => $this->product_of( $this->vendor ),
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
	 * Error code of a response.
	 *
	 * @param \WP_REST_Response $response Response.
	 *
	 * @return string
	 */
	private function code( $response ): string {
		return (string) ( $response->get_data()['code'] ?? '' );
	}

	/**
	 * An offer of the vendor's own products is created, as theirs.
	 *
	 * @return void
	 */
	public function test_vendor_creates_an_offer_of_own_products() {
		$response = $this->request( 'POST', self::BASE, $this->payload() );

		$this->assertSame( 201, $response->get_status() );
		$offer = BogoDataManager::get_bogo_offer( $response->get_data()['id'] );
		$this->assertSame( $this->vendor, (int) $offer['created_by'] );
	}

	/**
	 * Another vendor's product as a target is refused.
	 *
	 * @return void
	 */
	public function test_other_vendors_target_product_is_refused() {
		$response = $this->request( 'POST', self::BASE, $this->payload( [ 'offered_products' => [ $this->product_of( $this->vendor ), $this->product_of( $this->other ) ] ] ) );

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'spsg_bogo_vendor_product', $this->code( $response ) );
		$this->assertSame( 0, BogoDataManager::get_bogo_offers_count( [] ) );
	}

	/**
	 * Another vendor's product (or an admin's) as the offer product is refused.
	 *
	 * @return void
	 */
	public function test_other_vendors_offer_product_is_refused() {
		$response = $this->request( 'POST', self::BASE, $this->payload( [ 'get_different_product_field' => $this->product_of( $this->other ) ] ) );
		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'spsg_bogo_vendor_product', $this->code( $response ) );

		$response = $this->request( 'POST', self::BASE, $this->payload( [ 'get_different_product_field' => $this->product_of( 1 ) ] ) );
		$this->assertSame( 403, $response->get_status(), 'an admin product' );
	}

	/**
	 * A product that doesn't exist, or an alternate of another vendor, is refused.
	 *
	 * @return void
	 */
	public function test_missing_product_and_foreign_alternate_are_refused() {
		$this->assertSame( 403, $this->request( 'POST', self::BASE, $this->payload( [ 'offered_products' => [ 999999 ] ] ) )->get_status() );
		$this->assertSame( 403, $this->request( 'POST', self::BASE, $this->payload( [ 'get_alternate_products' => [ $this->product_of( $this->other ) ] ] ) )->get_status() );
	}

	/**
	 * Category targets are refused: a category holds other vendors' products.
	 *
	 * @return void
	 */
	public function test_category_targets_are_refused() {
		$category = self::factory()->term->create( [ 'taxonomy' => 'product_cat' ] );
		$response = $this->request( 'POST', self::BASE, $this->payload( [ 'offered_categories' => [ $category ] ] ) );

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'spsg_bogo_vendor_categories', $this->code( $response ) );
	}

	/**
	 * Buy X Get X needs the admin's flag, off until set.
	 *
	 * @return void
	 */
	public function test_buy_x_get_x_needs_the_admin_flag() {
		$same = [
			'bogo_deal_type'              => 'same',
			'get_different_product_field' => 0,
		];

		$response = $this->request( 'POST', self::BASE, $this->payload( $same ) );
		$this->assertSame( 403, $response->get_status(), 'no option: off' );
		$this->assertSame( 'spsg_bogo_vendor_buy_x_get_x', $this->code( $response ) );

		update_option( BogoVendorRules::OPTION, [ 'vendors_can_create_buy_x_get_x' => false ] );
		$this->assertSame( 403, $this->request( 'POST', self::BASE, $this->payload( $same ) )->get_status(), 'off' );

		update_option( BogoVendorRules::OPTION, [ 'vendors_can_create_buy_x_get_x' => true ] );
		$created = $this->request( 'POST', self::BASE, $this->payload( $same ) );
		$this->assertSame( 201, $created->get_status(), 'on' );

		// Turned off again: the vendor's existing offer stays editable, but
		// no offer can be turned into one.
		update_option( BogoVendorRules::OPTION, [ 'vendors_can_create_buy_x_get_x' => false ] );
		$this->assertSame( 200, $this->request( 'PUT', self::BASE . '/' . $created->get_data()['id'], [ 'name_of_order_bogo' => 'Renamed' ] )->get_status() );

		$different = $this->request( 'POST', self::BASE, $this->payload() );
		$this->assertSame( 201, $different->get_status() );
		$this->assertSame( 403, $this->request( 'PUT', self::BASE . '/' . $different->get_data()['id'], $same )->get_status() );
	}

	/**
	 * A Buy X Get X offer doesn't use its offer product, but stores it: it
	 * must be the vendor's too.
	 *
	 * @return void
	 */
	public function test_buy_x_get_x_offer_product_is_checked() {
		update_option( BogoVendorRules::OPTION, [ 'vendors_can_create_buy_x_get_x' => true ] );

		$response = $this->request(
			'POST',
			self::BASE,
			$this->payload(
				[
					'bogo_deal_type'              => 'same',
					'get_different_product_field' => $this->product_of( $this->other ),
				]
			)
		);

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'spsg_bogo_vendor_product', $this->code( $response ) );
	}

	/**
	 * The product's BOGO tab (wp-admin): a vendor's offer is saved only with
	 * their own products; an administrator's always.
	 *
	 * @return void
	 */
	public function test_product_tab_saves_only_own_products() {
		$product = $this->product_of( $this->vendor );
		$data    = [
			'bogo_deal_type'              => 'different',
			'offered_products'            => [ $product ],
			'get_different_product_field' => $this->product_of( $this->vendor ),
		];

		$this->assertTrue( $this->should_save_product_bogo( $product, $data ), 'own products' );

		$data['get_different_product_field'] = $this->product_of( $this->other );
		$this->assertFalse( $this->should_save_product_bogo( $product, $data ), 'another vendor\'s offer product' );

		// The tab's default Buy X Get X needs no flag.
		$same = [
			'bogo_deal_type'   => 'same',
			'offered_products' => [ $product ],
		];
		$this->assertTrue( $this->should_save_product_bogo( $product, $same ), 'Buy X Get X without the flag' );

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
		$this->assertTrue( $this->should_save_product_bogo( $product, $data ), 'administrator' );
	}

	/**
	 * What the product tab's save (`OrderBogo`) decides.
	 *
	 * @param int   $product Product.
	 * @param array $data    Offer data.
	 *
	 * @return bool
	 */
	private function should_save_product_bogo( int $product, array $data ): bool {
		/**
		 * Filters whether a product-specific BOGO offer should be saved on
		 * product save (documented in modules/bogo/includes/OrderBogo.php).
		 *
		 * @since 2.0.0
		 *
		 * @param bool  $should_save         Whether to persist the product BOGO.
		 * @param int   $post_id             Product ID.
		 * @param array $bogo_settings_data  BOGO settings being saved.
		 * @param bool  $is_variable_product Whether the product is variable.
		 */
		return (bool) apply_filters( 'spsg_should_save_product_bogo', true, $product, $data, false );
	}

	/**
	 * An update can't bring in another vendor's product.
	 *
	 * @return void
	 */
	public function test_update_with_other_vendors_product_is_refused() {
		$id = $this->request( 'POST', self::BASE, $this->payload() )->get_data()['id'];

		$response = $this->request( 'PUT', self::BASE . '/' . $id, [ 'offered_products' => [ $this->product_of( $this->other ) ] ] );
		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'spsg_bogo_vendor_product', $this->code( $response ) );

		$this->assertSame( 403, $this->request( 'PUT', self::BASE . '/' . $id, [ 'get_different_product_field' => $this->product_of( $this->other ) ] )->get_status() );
		$this->assertSame( 200, $this->request( 'PUT', self::BASE . '/' . $id, [ 'name_of_order_bogo' => 'Renamed' ] )->get_status() );

		// The old vendor editor sends the offer's own id as `offer_product_id`
		// (never saved): not taken for a product.
		$this->assertSame(
			200,
			$this->request(
				'PUT',
				self::BASE . '/' . $id,
				[
					'name_of_order_bogo' => 'Old editor',
					'offer_product_id'   => $id,
				]
			)->get_status()
		);
	}

	/**
	 * An offer saved before the rules with another vendor's product: it can
	 * be turned off and deleted, not turned on or edited.
	 *
	 * @return void
	 */
	public function test_offer_with_foreign_product_can_only_be_turned_off_or_deleted() {
		$id = $this->create_global_offer(
			[
				'name_of_order_bogo'          => 'Old',
				'created_by'                  => $this->vendor,
				'status'                      => 'active',
				'offered_products'            => [ $this->product_of( $this->other ) ],
				'get_different_product_field' => $this->product_of( $this->vendor ),
			]
		);

		$off = new WP_REST_Request( 'PUT', self::BASE . '/' . $id . '/status' );
		$off->set_param( 'status', 'no' );
		$this->assertSame( 200, rest_get_server()->dispatch( $off )->get_status(), 'turn off' );

		$on = new WP_REST_Request( 'PUT', self::BASE . '/' . $id . '/status' );
		$on->set_param( 'status', 'yes' );
		$this->assertSame( 403, rest_get_server()->dispatch( $on )->get_status(), 'turn on' );
		$this->assertSame( 'inactive', BogoDataManager::get_bogo_offer( $id )['status'] );

		$this->assertSame( 403, $this->request( 'PUT', self::BASE . '/' . $id, [ 'name_of_order_bogo' => 'Renamed' ] )->get_status(), 'edit' );
		$this->assertSame( 200, $this->request( 'DELETE', self::BASE . '/' . $id )->get_status(), 'delete' );
	}

	/**
	 * Turning on an offer of the vendor's own products works.
	 *
	 * @return void
	 */
	public function test_vendor_turns_on_own_offer() {
		$id = $this->create_global_offer(
			[
				'created_by'                  => $this->vendor,
				'status'                      => 'inactive',
				'offered_products'            => [ $this->product_of( $this->vendor ) ],
				'get_different_product_field' => $this->product_of( $this->vendor ),
			]
		);

		$on = new WP_REST_Request( 'PUT', self::BASE . '/' . $id . '/status' );
		$on->set_param( 'status', 'yes' );
		$this->assertSame( 200, rest_get_server()->dispatch( $on )->get_status() );
	}

	/**
	 * Administrators aren't restricted.
	 *
	 * @return void
	 */
	public function test_admin_is_not_restricted() {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		$response = $this->request(
			'POST',
			self::BASE,
			$this->payload(
				[
					'offered_products'            => [ $this->product_of( $this->other ) ],
					'get_different_product_field' => $this->product_of( $this->vendor ),
				]
			)
		);
		$this->assertSame( 201, $response->get_status() );

		$same = $this->request(
			'POST',
			self::BASE,
			$this->payload(
				[
					'bogo_deal_type'              => 'same',
					'get_different_product_field' => 0,
				]
			)
		);
		$this->assertSame( 201, $same->get_status(), 'Buy X Get X without the vendor flag' );
	}
}
