<?php
/**
 * The BOGO category message ajax actions still work next to the REST routes
 * (step 10e; pro 2.2.0 calls them).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Modules\BoGo\Ajax;
use StorePulse\StoreGrowth\Modules\BoGo\CategoryMessages;
use WPAjaxDieContinueException;
use WP_Ajax_UnitTestCase;

/**
 * `bogo_category_msg_create` / `bogo_category_msg_list` (lite), unchanged:
 * same stored shape, readable through the REST data layer.
 *
 * Not in the `ajax` group, which the WordPress test bootstrap leaves out of
 * a default run.
 *
 * @group bogo
 */
class CategoryMessagesAjaxTest extends WP_Ajax_UnitTestCase {

	/**
	 * Option holding the messages.
	 *
	 * @var string
	 */
	const OPTION = 'spsg_bogo_general_settings';

	/**
	 * The module's ajax hooks and an administrator.
	 *
	 * @return void
	 */
	public function set_up() {
		parent::set_up();

		( new Ajax() )->register_hooks();
		$this->_setRole( 'administrator' );
	}

	/**
	 * Run an ajax action with the admin nonce.
	 *
	 * @param string $action Action.
	 * @param array  $post   POST data.
	 *
	 * @return array Decoded response.
	 */
	private function ajax( string $action, array $post = [] ): array {
		$_POST                = $post;
		$_POST['_ajax_nonce'] = wp_create_nonce( 'spsg_admin_ajax_nonce' );
		$this->_last_response = '';

		// `admin_init` runs WooCommerce's first-install jobs, whose database
		// notices would be printed into the response.
		global $wpdb;
		$suppressed = $wpdb->suppress_errors( true );

		try {
			$this->_handleAjax( $action );
		} catch ( WPAjaxDieContinueException $e ) {
			unset( $e );
		}

		$wpdb->suppress_errors( $suppressed );

		return (array) json_decode( $this->_last_response, true );
	}

	/**
	 * Create, edit and list through the ajax actions, as 2.2.0's screen
	 * posts them (`categoryStatus` as the string jQuery sends).
	 *
	 * @return void
	 */
	public function test_create_edit_and_list() {
		update_option( self::OPTION, [ 'offer_remove_from_cart' => true ] );
		$category = (int) self::factory()->term->create( [ 'taxonomy' => 'product_cat' ] );

		$created = $this->ajax(
			'bogo_category_msg_create',
			[
				'data' => [
					'id'             => (string) $category,
					'message'        => 'Buy one',
					'categoryStatus' => 'true',
				],
			]
		);
		$this->assertTrue( $created['success'] );

		$this->assertSame(
			[
				[
					'id'             => $category,
					'message'        => 'Buy one',
					'categoryStatus' => 'true',
				],
			],
			get_option( self::OPTION )['bogo_category_messages']
		);
		$this->assertTrue( get_option( self::OPTION )['offer_remove_from_cart'], 'other keys kept' );

		$this->ajax(
			'bogo_category_msg_create',
			[
				'data' => [
					'id'             => (string) $category,
					'editableId'     => (string) $category,
					'message'        => 'Edited',
					'categoryStatus' => 'false',
				],
			]
		);
		$this->assertCount( 1, get_option( self::OPTION )['bogo_category_messages'], 'an edit replaces the row' );

		$list = $this->ajax( 'bogo_category_msg_list' );
		$this->assertTrue( $list['success'] );
		$this->assertSame( 'Edited', $list['data']['categoryDataList'][0]['message'] );

		// The REST data layer reads the same row.
		$row = CategoryMessages::find( $category );
		$this->assertSame( 'Edited', $row['message'] );
		$this->assertFalse( CategoryMessages::is_active( $row ) );
	}
}
