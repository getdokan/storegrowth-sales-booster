<?php
/**
 * BOGO on the Dokan vendor dashboard (step 10f2, ADR-011).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Assets;
use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Integrations\Dokan\Dashboard\Bogo;
use StorePulse\StoreGrowth\Integrations\Dokan\REST\VendorBogoController;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WP_REST_Request;
use WP_REST_Server;

/**
 * The dashboard bundle's localized data, the shared bundles it needs outside
 * wp-admin, and the vendor editor's Buy X Get X flag. Dokan isn't loaded in
 * the suite: the enqueue itself (behind `dokan_is_seller_dashboard()`) is
 * checked on the dev site.
 *
 * @group bogo
 * @group dokan
 */
class BogoVendorDashboardTest extends StoreGrowthTestCase {

	/**
	 * The localized data is the subset the shared code reads: no admin
	 * nonce, no module list, no ajax URL.
	 *
	 * @return void
	 */
	public function test_script_data_is_the_vendor_subset(): void {
		$data = Bogo::get_script_data();

		$this->assertSame( [ 'spsgAdmin', 'spsgAdminHeader' ], array_keys( $data ) );
		$this->assertSame( [ 'restNamespace', 'isPro' ], array_keys( $data['spsgAdmin'] ) );
		$this->assertSame( 'sales-booster/v1', $data['spsgAdmin']['restNamespace'] );
		$this->assertSame( [ 'assets_url', 'header_info' ], array_keys( $data['spsgAdminHeader'] ) );
		$this->assertSame( [ 'is_pro_exists' ], array_keys( $data['spsgAdminHeader']['header_info'] ) );
		$this->assertSame( Helper::get_plugin_url( 'assets/' ), $data['spsgAdminHeader']['assets_url'] );

		$json = wp_json_encode( $data );
		$this->assertStringNotContainsString( wp_create_nonce( 'spsg_ajax_nonce' ), $json );
		$this->assertStringNotContainsString( 'admin-ajax.php', $json );
		$this->assertStringNotContainsString( 'modules', $json );
	}

	/**
	 * The pro flag follows pro.
	 *
	 * @return void
	 */
	public function test_script_data_pro_flag(): void {
		add_filter( 'storegrowth_pro_is_active', '__return_true', 999 );
		$data = Bogo::get_script_data();
		remove_filter( 'storegrowth_pro_is_active', '__return_true', 999 );

		$this->assertTrue( $data['spsgAdmin']['isPro'] );
		$this->assertTrue( $data['spsgAdminHeader']['header_info']['is_pro_exists'] );
	}

	/**
	 * `register_shared_bundles()` registers the shared scripts and the
	 * Tailwind stylesheet (outside wp-admin too), from the build.
	 *
	 * @return void
	 */
	public function test_register_shared_bundles(): void {
		if ( ! file_exists( Helper::get_plugin_path( 'build/components.asset.php' ) ) ) {
			$this->markTestSkipped( 'No build.' );
		}

		foreach ( [ 'spsg-plugin-ui', 'spsg-utilities', 'spsg-hooks', 'spsg-components' ] as $handle ) {
			wp_deregister_script( $handle );
		}
		wp_deregister_style( 'spsg-tailwind' );

		Assets::instance()->register_shared_bundles();

		foreach ( [ 'spsg-plugin-ui', 'spsg-utilities', 'spsg-hooks', 'spsg-components' ] as $handle ) {
			$this->assertTrue( wp_script_is( $handle, 'registered' ), $handle );
		}
		$this->assertTrue( wp_style_is( 'spsg-tailwind', 'registered' ) );
		$this->assertTrue( wp_style_is( 'spsg-font-inter', 'registered' ) );
		// Registered only.
		$this->assertFalse( wp_script_is( 'spsg-components', 'enqueued' ) );
	}

	/**
	 * `GET /bogo/offers/vendor/editor` says whether the vendor may choose
	 * Buy X Get X (missing option = no).
	 *
	 * @return void
	 */
	public function test_vendor_editor_buy_x_get_x_flag(): void {
		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		add_action(
			'rest_api_init',
			static function () {
				( new VendorBogoController() )->register_routes();
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

		// Pro: the vendor limit (which needs Dokan) isn't checked.
		add_filter( 'storegrowth_pro_is_active', '__return_true', 999 );

		$vendor = self::factory()->user->create( [ 'role' => 'customer' ] );
		get_userdata( $vendor )->add_cap( 'dokandar' );
		wp_set_current_user( $vendor );

		$request = new WP_REST_Request( 'GET', '/sales-booster/v1/bogo/offers/vendor/editor' );

		delete_option( 'spsg_bogo_dokan_vendors_settings' );
		$response = rest_get_server()->dispatch( $request );
		$this->assertSame( 200, $response->get_status() );
		$this->assertFalse( $response->get_data()['buy_x_get_x'] );
		$this->assertArrayHasKey( 'schema', $response->get_data() );
		// The preview's global "Show Regular Price" comes with the editor
		// (a vendor can't read `GET /admin/settings`).
		$this->assertIsBool( $response->get_data()['show_regular_price'] );

		update_option( 'spsg_bogo_dokan_vendors_settings', [ 'vendors_can_create_buy_x_get_x' => true ] );
		$this->assertTrue( rest_get_server()->dispatch( $request )->get_data()['buy_x_get_x'] );

		update_option( 'spsg_bogo_dokan_vendors_settings', [ 'vendors_can_create_buy_x_get_x' => false ] );
		$this->assertFalse( rest_get_server()->dispatch( $request )->get_data()['buy_x_get_x'] );

		remove_filter( 'storegrowth_pro_is_active', '__return_true', 999 );
	}
}
