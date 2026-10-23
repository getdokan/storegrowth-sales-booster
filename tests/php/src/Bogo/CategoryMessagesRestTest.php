<?php
/**
 * Contract tests for the BOGO category messages REST routes (step 10e, R2).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\BoGo\REST\CategoryMessagesController;
use StorePulse\StoreGrowth\Settings\SettingsService;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * `sales-booster/v1/bogo/category-messages`, over the rows the ajax actions
 * and pro 2.2.0 read and write in `spsg_bogo_general_settings`.
 *
 * @group bogo
 * @group rest
 */
class CategoryMessagesRestTest extends StoreGrowthTestCase {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	const BASE = '/sales-booster/v1/bogo/category-messages';

	/**
	 * Option holding the messages.
	 *
	 * @var string
	 */
	const OPTION = 'spsg_bogo_general_settings';

	/**
	 * Pro state for the test (the `storegrowth_pro_is_active` filter).
	 *
	 * @var bool
	 */
	private $pro = true;

	/**
	 * A product category.
	 *
	 * @var int
	 */
	private $category;

	/**
	 * REST server with the routes, an administrator and a category.
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
				( new CategoryMessagesController() )->register_routes();
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

		$this->pro = true;
		add_filter(
			'storegrowth_pro_is_active',
			function () {
				return $this->pro;
			},
			999
		);

		$this->category = $this->create_category( 'Hoodies' );
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
	 * A product category.
	 *
	 * @param string $name Name.
	 *
	 * @return int Term id.
	 */
	private function create_category( string $name ): int {
		return (int) self::factory()->term->create(
			[
				'taxonomy' => 'product_cat',
				'name'     => $name,
			]
		);
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
	 * Stored messages.
	 *
	 * @return array
	 */
	private function stored(): array {
		return get_option( self::OPTION, [] )['bogo_category_messages'] ?? [];
	}

	/**
	 * A create stores the row in the shape the ajax actions and pro read
	 * (`categoryStatus` is the string pro's storefront compares), keeps the
	 * option's other keys, and the list returns it.
	 *
	 * @return void
	 */
	public function test_create_stores_the_legacy_shape() {
		update_option( self::OPTION, [ 'offer_remove_from_cart' => true ] );

		$response = $this->request(
			'POST',
			self::BASE,
			[
				'category' => $this->category,
				'message'  => 'Buy 1 <b>get</b> 1',
			]
		);

		$this->assertSame( 201, $response->get_status() );
		$this->assertSame(
			[
				'id'      => $this->category,
				'name'    => 'Hoodies',
				'message' => 'Buy 1 get 1',
				'status'  => true,
			],
			$response->get_data()
		);
		$this->assertSame(
			[
				[
					'id'             => $this->category,
					'message'        => 'Buy 1 get 1',
					'categoryStatus' => 'true',
				],
			],
			$this->stored()
		);
		$this->assertTrue( get_option( self::OPTION )['offer_remove_from_cart'], 'other keys kept' );

		$list = $this->request( 'GET', self::BASE )->get_data();
		$this->assertCount( 1, $list );
		$this->assertSame( $this->category, $list[0]['id'] );

		$off = $this->create_category( 'Music' );
		$this->request(
			'POST',
			self::BASE,
			[
				'category' => $off,
				'message'  => 'Off',
				'status'   => false,
			]
		);
		$this->assertSame( 'false', $this->stored()[1]['categoryStatus'] );
	}

	/**
	 * A create needs an existing category without a message, and text.
	 *
	 * @return void
	 */
	public function test_create_rejects_invalid_input() {
		$this->request(
			'POST',
			self::BASE,
			[
				'category' => $this->category,
				'message'  => 'First',
			]
		);

		$cases = [
			'bogo_category_message_exists' => [
				'category' => $this->category,
				'message'  => 'Again',
			],
			'bogo_invalid_category'        => [
				'category' => 999999,
				'message'  => 'Nowhere',
			],
			'rest_invalid_param'           => [
				'category' => $this->create_category( 'Decor' ),
				'message'  => '  <br>  ',
			],
			'rest_missing_callback_param'  => [ 'message' => 'No category' ],
		];

		foreach ( $cases as $code => $body ) {
			$response = $this->request( 'POST', self::BASE, $body );
			$this->assertSame( 400, $response->get_status(), $code );
			$this->assertSame( $code, $response->get_data()['code'] );
		}

		$this->assertCount( 1, $this->stored(), 'nothing else stored' );
	}

	/**
	 * The cap the ajax action applies (`spsg_bogo_max_category_messages`).
	 *
	 * @return void
	 */
	public function test_create_respects_the_cap() {
		add_filter(
			'spsg_bogo_max_category_messages',
			static function () {
				return 1;
			}
		);

		$this->request(
			'POST',
			self::BASE,
			[
				'category' => $this->category,
				'message'  => 'First',
			]
		);
		$response = $this->request(
			'POST',
			self::BASE,
			[
				'category' => $this->create_category( 'Music' ),
				'message'  => 'Second',
			]
		);

		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'bogo_category_messages_limit', $response->get_data()['code'] );
		$this->assertCount( 1, $this->stored() );
	}

	/**
	 * An update changes only what it sends; it can move the message to a
	 * category without one; `{ status }` writes `'false'`.
	 *
	 * @return void
	 */
	public function test_update_status_and_move() {
		$this->request(
			'POST',
			self::BASE,
			[
				'category' => $this->category,
				'message'  => 'First',
			]
		);

		$this->assertSame( 200, $this->request( 'PATCH', self::BASE . '/' . $this->category, [ 'message' => 'Changed' ] )->get_status() );
		$this->assertSame( 'Changed', $this->stored()[0]['message'] );
		$this->assertSame( 'true', $this->stored()[0]['categoryStatus'], 'status kept' );

		// The list's switch.
		$status = $this->request( 'PATCH', self::BASE . '/' . $this->category, [ 'status' => false ] );
		$this->assertFalse( $status->get_data()['status'] );
		$this->assertSame( 'false', $this->stored()[0]['categoryStatus'] );
		$this->assertSame( 'Changed', $this->stored()[0]['message'], 'message kept' );
		$this->assertSame( 404, $this->request( 'POST', self::BASE . '/' . $this->category . '/status', [ 'status' => true ] )->get_status(), 'no status route' );

		// A move needs an existing category, as a create.
		foreach ( [ -5, 0, 999999 ] as $bad ) {
			$response = $this->request( 'PUT', self::BASE . '/' . $this->category, [ 'category' => $bad ] );
			$this->assertSame( 400, $response->get_status(), (string) $bad );
		}
		$this->assertSame( $this->category, $this->stored()[0]['id'] );

		$music = $this->create_category( 'Music' );
		$moved = $this->request( 'PUT', self::BASE . '/' . $this->category, [ 'category' => $music ] );
		$this->assertSame( 200, $moved->get_status() );
		$this->assertSame( 'Music', $moved->get_data()['name'] );
		$this->assertSame( $music, $this->stored()[0]['id'] );

		$this->request(
			'POST',
			self::BASE,
			[
				'category' => $this->category,
				'message'  => 'Back',
			]
		);
		$taken = $this->request( 'PUT', self::BASE . '/' . $this->category, [ 'category' => $music ] );
		$this->assertSame( 400, $taken->get_status() );
		$this->assertSame( 'bogo_category_message_exists', $taken->get_data()['code'] );

		$this->assertSame( 404, $this->request( 'PATCH', self::BASE . '/999999', [ 'message' => 'x' ] )->get_status() );
	}

	/**
	 * Rows written by 2.2.0 (string ids, a category stored twice, extra
	 * keys) are read, changed and deleted as one message, keeping their keys.
	 *
	 * @return void
	 */
	public function test_legacy_rows() {
		$id = (string) $this->category;
		update_option(
			self::OPTION,
			[
				'bogo_category_messages' => [
					[
						'id'             => $id,
						'message'        => 'Old',
						'categoryStatus' => 'true',
						'editableId'     => $id,
					],
					'not a row',
					[
						'id'             => $id,
						'message'        => 'Duplicate',
						'categoryStatus' => 'false',
					],
				],
			]
		);

		$list = $this->request( 'GET', self::BASE )->get_data();
		$this->assertCount( 1, $list, 'a category is listed once' );
		$this->assertSame( 'Old', $list[0]['message'] );
		$this->assertSame( $this->category, $list[0]['id'] );

		$this->request(
			'PATCH',
			self::BASE . '/' . $this->category,
			[
				'status'  => false,
				'message' => 'New',
			]
		);
		$stored = $this->stored();
		$this->assertSame( [ 'false', 'false' ], array_column( $stored, 'categoryStatus' ) );
		$this->assertSame( [ 'New', 'Duplicate' ], array_column( $stored, 'message' ), 'only the listed (first) row' );
		$this->assertSame( $id, $stored[0]['id'], 'id kept as stored' );
		$this->assertSame( $id, $stored[0]['editableId'], 'unknown keys kept' );
		$this->assertSame( 'not a row', $stored[1], 'a non-array row kept' );

		// Switched on, the hidden duplicate stays off: pro prints every
		// `'true'` row, so the category would show the message twice.
		$this->request( 'PATCH', self::BASE . '/' . $this->category, [ 'status' => true ] );
		$this->assertSame( [ 'true', 'false' ], array_column( $this->stored(), 'categoryStatus' ) );

		// A delete removes every row of the category.
		$this->assertSame( 200, $this->request( 'DELETE', self::BASE . '/' . $this->category )->get_status() );
		$this->assertSame( [ 'not a row' ], $this->stored() );
	}

	/**
	 * A message of a deleted category lists with no name and can be deleted.
	 *
	 * @return void
	 */
	public function test_deleted_category() {
		$this->request(
			'POST',
			self::BASE,
			[
				'category' => $this->category,
				'message'  => 'Gone',
			]
		);
		wp_delete_term( $this->category, 'product_cat' );

		$this->assertNull( $this->request( 'GET', self::BASE )->get_data()[0]['name'] );
		$this->assertSame( 200, $this->request( 'PATCH', self::BASE . '/' . $this->category, [ 'message' => 'Still' ] )->get_status() );
		$this->assertSame( 200, $this->request( 'DELETE', self::BASE . '/' . $this->category )->get_status() );
		$this->assertSame( 404, $this->request( 'DELETE', self::BASE . '/' . $this->category )->get_status() );
	}

	/**
	 * Without pro the messages can be read, not changed (R3).
	 *
	 * @return void
	 */
	public function test_changes_need_pro() {
		update_option(
			self::OPTION,
			[
				'bogo_category_messages' => [
					[
						'id'             => $this->category,
						'message'        => 'Kept',
						'categoryStatus' => 'true',
					],
				],
			]
		);
		$before    = get_option( self::OPTION );
		$this->pro = false;

		$this->assertCount( 1, $this->request( 'GET', self::BASE )->get_data() );

		$requests = [
			[
				'POST',
				self::BASE,
				[
					'category' => $this->create_category( 'Music' ),
					'message'  => 'New',
				],
			],
			[ 'PATCH', self::BASE . '/' . $this->category, [ 'message' => 'Changed' ] ],
			[ 'PATCH', self::BASE . '/' . $this->category, [ 'status' => false ] ],
			[ 'DELETE', self::BASE . '/' . $this->category, [] ],
		];

		foreach ( $requests as [ $method, $route, $body ] ) {
			$response = $this->request( $method, $route, $body );
			$this->assertSame( 403, $response->get_status(), "$method $route" );
			$this->assertSame( 'salesbooster_pro_required', $response->get_data()['code'] );
		}

		$this->assertSame( $before, get_option( self::OPTION ), 'nothing changed' );
	}

	/**
	 * Administrators only: a guest gets 401, a shop manager 403.
	 *
	 * @return void
	 */
	public function test_administrators_only() {
		wp_set_current_user( 0 );
		$this->assertSame( 401, $this->request( 'GET', self::BASE )->get_status() );

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'shop_manager' ] ) );
		$this->assertSame( 403, $this->request( 'GET', self::BASE )->get_status() );
		$this->assertSame(
			403,
			$this->request(
				'POST',
				self::BASE,
				[
					'category' => $this->category,
					'message'  => 'No',
				]
			)->get_status()
		);
	}

	/**
	 * An option (or messages) of the wrong shape: writes answer 409 and
	 * leave it alone; the list is empty.
	 *
	 * @return void
	 */
	public function test_invalid_option_is_left_alone() {
		foreach ( [ 'a string', [ 'bogo_category_messages' => 'a string' ] ] as $stored ) {
			update_option( self::OPTION, $stored );

			$this->assertSame( [], $this->request( 'GET', self::BASE )->get_data() );

			$requests = [
				[
					'POST',
					self::BASE,
					[
						'category' => $this->category,
						'message'  => 'New',
					],
				],
				[ 'PATCH', self::BASE . '/' . $this->category, [ 'status' => false ] ],
				[ 'DELETE', self::BASE . '/' . $this->category, [] ],
			];

			foreach ( $requests as [ $method, $route, $body ] ) {
				$response = $this->request( $method, $route, $body );
				$this->assertSame( 409, $response->get_status(), "$method $route" );
				$this->assertSame( 'bogo_invalid_option', $response->get_data()['code'] );
			}

			$this->assertSame( $stored, get_option( self::OPTION ) );
		}
	}

	/**
	 * A save of the global settings (`BogoSettings`) keeps the messages.
	 *
	 * @return void
	 */
	public function test_settings_save_keeps_messages() {
		$this->request(
			'POST',
			self::BASE,
			[
				'category' => $this->category,
				'message'  => 'Kept',
			]
		);
		$messages = $this->stored();

		$saved = storegrowth_get_container()->get( SettingsService::class )->save( BoGoModule::get_id(), [ 'offer_remove_from_cart' => true ] );

		$this->assertNotWPError( $saved );
		$this->assertSame( $messages, $this->stored() );
		$this->assertTrue( (bool) get_option( self::OPTION )['offer_remove_from_cart'] );
	}
}
