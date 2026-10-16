<?php
/**
 * Tests for the BOGO 1.x migration.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\BogoMigration;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Product_Variable;
use WC_Product_Variation;

/**
 * 1.x offers (`sgsb_bogo` posts, `sgsb_product_bogo_settings` meta) reach the
 * BOGO table once, with mapped keys, and are never changed.
 *
 * @group bogo
 * @group migration
 */
class BogoMigrationTest extends StoreGrowthTestCase {

	/**
	 * Start every case without the flag.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		delete_option( BogoMigration::FLAG_OPTION );
	}

	/**
	 * Insert a 1.x global offer post as 1.x's `bogo_create` stored it.
	 *
	 * @param array|string $settings Offer settings, or a raw excerpt.
	 * @param string       $title    Post title.
	 *
	 * @return int Post ID.
	 */
	private function add_legacy_global_offer( $settings, string $title = 'Offer' ): int {
		global $wpdb;

		$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->posts,
			[
				'post_title'   => $title,
				'post_status'  => 'publish',
				'post_type'    => 'sgsb_bogo',
				'post_excerpt' => is_array( $settings ) ? maybe_serialize( $settings ) : $settings,
				'post_content' => 'Not defined',
				'post_author'  => 7,
			]
		);

		return (int) $wpdb->insert_id;
	}

	/**
	 * A 1.x global offer in the shape 1.x's admin form saved.
	 *
	 * @param array $overrides Keys to replace.
	 *
	 * @return array
	 */
	private function legacy_offer( array $overrides = [] ): array {
		return array_merge(
			[
				// 1.x's form encoded the name as HTML entities.
				'name_of_order_bogo'          => '&#66;&#117;&#121;&#32;&#49;&#32;&#38;&#32;&#103;&#101;&#116;',
				'bogo_status'                 => 'yes',
				'bogo_deal_type'              => 'different',
				'bogo_type'                   => 'categories',
				'minimum_quantity_required'   => '0',
				'offered_products'            => '123',
				'get_different_product_field' => '456',
				'get_alternate_products'      => [ '11', '12' ],
				'get_alternate_categories'    => [ '5' ],
				'exclude_products'            => [ '99' ],
				'offer_type'                  => 'discount',
				'discount_amount'             => '25',
				'offer_start'                 => '2026-01-01',
				'offer_end'                   => '2026-12-31',
				'offer_schedule'              => [ 'monday', 'friday' ],
				'box_border_style'            => 'dashed',
				'box_border_color'            => '#32DBBE',
				'discount_font_size'          => '13',
				'enable_custom_badge_image'   => '1',
				'default_badge_icon_name'     => 'bogo-icons-2',
				'default_custom_badge_icon'   => '',
				'offer_product_id'            => 0,
				'accept_offer_text_color'     => '#000000',
				'product_page_message'        => 'Free Gift',
				'shop_page_message'           => '',
			],
			$overrides
		);
	}

	/**
	 * Every global row, oldest first.
	 *
	 * @return array[]
	 */
	private function global_rows(): array {
		return BogoDataManager::get_bogo_offers( [ 'type' => 'global' ], [ 'order_by' => 'id ASC' ] );
	}

	/**
	 * A 1.x global offer lands with mapped keys; the post is untouched.
	 *
	 * @return void
	 */
	public function test_migrates_global_offer_with_mapped_keys() {
		$post_id  = $this->add_legacy_global_offer( $this->legacy_offer( [ 'offer_product_id' => 999 ] ), 'Buy 1 &amp; get' );
		$excerpt  = get_post_field( 'post_excerpt', $post_id, 'raw' );
		$inactive = $this->add_legacy_global_offer(
			$this->legacy_offer(
				[
					'name_of_order_bogo' => '',
					'bogo_status'        => 'no',
					'offer_type'         => [],
					'offered_products'   => [ '7', '8' ],
					'offer_start'        => '',
					'offer_end'          => 'not a date',
					'offer_schedule'     => [],
				]
			),
			'Second &#8211; offer'
		);

		$result = BogoMigration::migrate_to_single_table();

		$this->assertTrue( $result['success'], implode( '; ', $result['errors'] ) );

		$rows = $this->global_rows();
		$this->assertCount( 2, $rows );

		$row = $rows[0];
		$this->assertSame( 'Buy 1 & get', $row['name'] );
		$this->assertSame( 'active', $row['status'] );
		$this->assertSame( [ 123 ], $row['offered_products'] );
		$this->assertSame( [], $row['offered_categories'], 'alternate categories are not target categories' );
		$this->assertSame( '456', (string) $row['offer_product_id'], 'the offer product, not 1.x offer_product_id' );
		$this->assertSame( [ 11, 12 ], $row['alternate_products'] );
		$this->assertSame( 'different', $row['bogo_deal_type'] );
		$this->assertSame( 'discount', $row['offer_type'] );
		$this->assertEquals( 25, (float) $row['discount_amount'] );
		$this->assertSame( '1', (string) $row['minimum_quantity_required'] );
		$this->assertSame( '2026-01-01', $row['offer_start'] );
		$this->assertSame( '2026-12-31', $row['offer_end'] );
		$this->assertSame( [ 'monday', 'friday' ], $row['offer_schedule'] );
		$this->assertSame( 'Free Gift', $row['product_page_message'] );
		$this->assertSame( '7', (string) $row['created_by'] );

		$design = BogoDataManager::get_design_settings( $row['design_settings'] );
		$this->assertSame( 'dashed', $design['box_border_style'] );
		$this->assertSame( '#32DBBE', $design['box_border_color'] );
		$this->assertSame( 13, $design['discount_font_size'] );
		$this->assertSame( 'bogo-icons-2', $row['default_badge_icon_name'] );
		$this->assertSame( 1, $row['enable_custom_badge_image'] );

		$second = $rows[1];
		$this->assertSame( 'Second – offer', $second['name'], 'falls back to the decoded post title' );
		$this->assertSame( 'inactive', $second['status'] );
		$this->assertSame( 'free', $second['offer_type'] );
		$this->assertSame( [ 7, 8 ], $second['offered_products'] );
		$this->assertNull( $second['offer_start'] );
		$this->assertNull( $second['offer_end'] );
		$this->assertSame( [ 'daily' ], $second['offer_schedule'] );

		$this->assertSame( $excerpt, get_post_field( 'post_excerpt', $post_id, 'raw' ), '1.x data is never changed' );
		$this->assertSame( 'sgsb_bogo', get_post_type( $inactive ), '1.x posts are kept' );

		$flag = get_option( BogoMigration::FLAG_OPTION );
		$this->assertSame( 'done', $flag['state'] );
		$this->assertSame( 2, $flag['globals'] );
	}

	/**
	 * Configured 1.x product and variation meta become product rows; meta
	 * 1.x wrote on every product save (disabled, empty) is left out.
	 *
	 * @return void
	 */
	public function test_migrates_configured_product_and_variation_meta() {
		$enabled = $this->create_product();
		update_post_meta(
			$enabled->get_id(),
			'sgsb_product_bogo_settings',
			[
				'bogo_type'                   => 'products',
				'bogo_status'                 => 'yes',
				'bogo_deal_type'              => 'same',
				'offer_type'                  => 'free',
				'discount_amount'             => '0',
				'bogo_badge_image'            => 'https://example.com/badge.png',
				'shop_page_message'           => 'Shop msg',
				'product_page_message'        => 'Product msg',
				'get_alternate_products'      => [],
				'get_different_product_field' => '',
			]
		);

		$empty = $this->create_product();
		update_post_meta(
			$empty->get_id(),
			'sgsb_product_bogo_settings',
			[
				'bogo_type'                   => 'same',
				'bogo_status'                 => 'no',
				'bogo_deal_type'              => 'same',
				'get_different_product_field' => '',
			]
		);

		$parent = new WC_Product_Variable();
		$parent->set_name( 'Variable' );
		$parent->save();
		$variation = new WC_Product_Variation();
		$variation->set_parent_id( $parent->get_id() );
		$variation->set_regular_price( '10' );
		$variation->save();
		update_post_meta(
			$variation->get_id(),
			'sgsb_product_bogo_settings',
			[
				'offer_type'                  => 'discount',
				'discount_amount'             => '10',
				'get_different_product_field' => (string) $enabled->get_id(),
				'minimum_quantity_required'   => '2',
				'offer_schedule'              => [ 'daily' ],
			]
		);

		BogoMigration::migrate_to_single_table();

		$product_row = BogoDataManager::get_product_bogo_settings( $enabled->get_id(), 0, [ 'status' => '' ] );
		$this->assertNotNull( $product_row );
		$this->assertSame( 'product', $product_row['type'] );
		$this->assertSame( 'active', $product_row['status'] );
		$this->assertSame( 'same', $product_row['bogo_deal_type'] );
		$this->assertSame( [ $enabled->get_id() ], $product_row['offered_products'] );
		$this->assertSame( 'Product msg', $product_row['product_page_message'] );
		$this->assertSame( 'https://example.com/badge.png', $product_row['bogo_badge_image'] );

		$this->assertSame(
			0,
			BogoDataManager::get_bogo_offers_count(
				[
					'type'       => 'product',
					'product_id' => $empty->get_id(),
				]
			),
			'unconfigured 1.x meta gets no row'
		);

		$variation_row = BogoDataManager::get_product_bogo_settings( $parent->get_id(), $variation->get_id(), [ 'status' => '' ] );
		$this->assertNotNull( $variation_row );
		$this->assertSame( (string) $variation->get_id(), (string) $variation_row['variation_id'] );
		$this->assertSame( 'active', $variation_row['status'] );
		$this->assertSame( 'discount', $variation_row['offer_type'] );
		$this->assertSame( (string) $enabled->get_id(), (string) $variation_row['offer_product_id'] );
		$this->assertSame( '2', (string) $variation_row['minimum_quantity_required'] );

		$this->assertSame( 2, get_option( BogoMigration::FLAG_OPTION )['products'] );
		$this->assertNotEmpty( get_post_meta( $empty->get_id(), 'sgsb_product_bogo_settings', true ), '1.x meta is kept' );
	}

	/**
	 * A variable product's own meta (enabled, no offer product) gets no row;
	 * a product row is credited to the product's author, not the current user.
	 *
	 * @return void
	 */
	public function test_variable_parent_skipped_and_product_row_owned_by_author() {
		$vendor = self::factory()->user->create();
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		$parent = new WC_Product_Variable();
		$parent->set_name( 'Variable' );
		$parent->save();
		update_post_meta(
			$parent->get_id(),
			'sgsb_product_bogo_settings',
			[
				'bogo_status'    => 'yes',
				'bogo_deal_type' => 'different',
			]
		);

		$product = $this->create_product();
		wp_update_post(
			[
				'ID'          => $product->get_id(),
				'post_author' => $vendor,
			]
		);
		update_post_meta(
			$product->get_id(),
			'sgsb_product_bogo_settings',
			[
				'bogo_status'                 => 'yes',
				'get_different_product_field' => '5',
			]
		);

		BogoMigration::migrate_to_single_table();

		$this->assertSame( 0, BogoDataManager::get_bogo_offers_count( [ 'product_id' => $parent->get_id() ] ) );

		$row = BogoDataManager::get_product_bogo_settings( $product->get_id(), 0, [ 'status' => '' ] );
		$this->assertSame( (string) $vendor, (string) $row['created_by'] );
	}

	/**
	 * Discounts are clamped to 0–100 and read like "50%"; invalid design values
	 * fall back to the defaults; a JSON excerpt is read too.
	 *
	 * @return void
	 */
	public function test_values_are_sanitized_and_json_excerpt_is_read() {
		$this->add_legacy_global_offer(
			$this->legacy_offer(
				[
					'name_of_order_bogo' => 'Percent',
					'discount_amount'    => '50%',
					'box_border_style'   => 'groove;color:red',
					'box_border_color'   => 'red;}body{display:none',
					'box_top_margin'     => 'abc',
					'box_bottom_margin'  => '4',
				]
			)
		);
		$amounts = [
			'Huge'     => '250',
			'Negative' => '-5',
		];
		foreach ( $amounts as $name => $amount ) {
			$this->add_legacy_global_offer(
				$this->legacy_offer(
					[
						'name_of_order_bogo' => $name,
						'discount_amount'    => $amount,
					]
				)
			);
		}
		$this->add_legacy_global_offer( wp_json_encode( $this->legacy_offer( [ 'name_of_order_bogo' => 'Json' ] ) ) );

		$result = BogoMigration::migrate_to_single_table();
		$this->assertTrue( $result['success'], implode( '; ', $result['errors'] ) );

		$rows = array_column( $this->global_rows(), null, 'name' );
		$this->assertEquals( 50, (float) $rows['Percent']['discount_amount'] );
		$this->assertEquals( 100, (float) $rows['Huge']['discount_amount'] );
		$this->assertEquals( 0, (float) $rows['Negative']['discount_amount'] );
		$this->assertArrayHasKey( 'Json', $rows );

		$design = BogoDataManager::get_design_settings( $rows['Percent']['design_settings'] );
		$this->assertSame( 'solid', $design['box_border_style'], 'unknown style → default' );
		$this->assertSame( '#e0e0e0', $design['box_border_color'], 'invalid colour → default' );
		$this->assertSame( 10, $design['box_top_margin'], 'non-numeric margin → default' );
		$this->assertSame( 4, $design['box_bottom_margin'] );
	}

	/**
	 * While another request holds the lock, a run copies nothing and leaves
	 * the flag unset, so the holder (or a later request) finishes the job.
	 *
	 * @return void
	 */
	public function test_held_lock_makes_run_a_no_op() {
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

		$this->add_legacy_global_offer( $this->legacy_offer() );

		$this->assertTrue( \WP_Upgrader::create_lock( BogoMigration::LOCK_NAME, HOUR_IN_SECONDS ) );

		BogoMigration::maybe_migrate();

		$this->assertCount( 0, $this->global_rows() );
		$this->assertFalse( get_option( BogoMigration::FLAG_OPTION ) );

		\WP_Upgrader::release_lock( BogoMigration::LOCK_NAME );

		BogoMigration::maybe_migrate();

		$this->assertCount( 1, $this->global_rows() );
	}

	/**
	 * A product that already has a 2.x row keeps it.
	 *
	 * @return void
	 */
	public function test_existing_product_row_is_not_overwritten() {
		$product = $this->create_product();
		BogoDataManager::save_product_bogo_settings(
			$product->get_id(),
			0,
			[
				'product_page_message'        => '2.x message',
				'get_different_product_field' => 5,
			]
		);
		update_post_meta(
			$product->get_id(),
			'sgsb_product_bogo_settings',
			[
				'bogo_status'          => 'yes',
				'product_page_message' => '1.x message',
			]
		);

		BogoMigration::migrate_to_single_table();

		$row = BogoDataManager::get_product_bogo_settings( $product->get_id(), 0, [ 'status' => '' ] );
		$this->assertSame( '2.x message', $row['product_page_message'] );
	}

	/**
	 * The migration runs once: the flag stops a second run.
	 *
	 * @return void
	 */
	public function test_runs_once() {
		$this->add_legacy_global_offer( $this->legacy_offer() );

		BogoMigration::maybe_migrate();
		$this->assertCount( 1, $this->global_rows() );

		// Delete the migrated row and add another 1.x post: nothing comes back.
		BogoDataManager::delete_bogo_offer( $this->global_rows()[0]['id'] );
		$this->add_legacy_global_offer( $this->legacy_offer() );

		BogoMigration::maybe_migrate();
		BogoMigration::migrate_to_single_table();

		$this->assertCount( 0, $this->global_rows() );
		$this->assertFalse( BogoMigration::is_migration_needed() );
	}

	/**
	 * Nothing is copied when the table already has global offers.
	 *
	 * @return void
	 */
	public function test_skipped_when_global_offers_exist() {
		$this->create_global_offer( [ 'name_of_order_bogo' => '2.x offer' ] );
		$this->add_legacy_global_offer( $this->legacy_offer() );

		$product = $this->create_product();
		update_post_meta( $product->get_id(), 'sgsb_product_bogo_settings', [ 'bogo_status' => 'yes' ] );

		BogoMigration::maybe_migrate();

		$rows = $this->global_rows();
		$this->assertCount( 1, $rows );
		$this->assertSame( '2.x offer', $rows[0]['name'] );
		$this->assertSame( 0, BogoDataManager::get_bogo_offers_count( [ 'type' => 'product' ] ) );
		$this->assertSame( 'skipped', get_option( BogoMigration::FLAG_OPTION )['state'] );
	}

	/**
	 * A bad row is skipped and recorded; the others migrate.
	 *
	 * @return void
	 */
	public function test_bad_row_is_skipped_and_others_migrate() {
		$this->add_legacy_global_offer( $this->legacy_offer( [ 'name_of_order_bogo' => 'First' ] ) );
		$bad = $this->add_legacy_global_offer( 'Not defined' );
		$this->add_legacy_global_offer( $this->legacy_offer( [ 'name_of_order_bogo' => 'Third' ] ) );

		$result = BogoMigration::migrate_to_single_table();

		$this->assertFalse( $result['success'] );
		$this->assertCount( 1, $result['errors'] );
		$this->assertStringContainsString( (string) $bad, $result['errors'][0] );
		$this->assertSame( [ 'First', 'Third' ], wp_list_pluck( $this->global_rows(), 'name' ) );

		$flag = get_option( BogoMigration::FLAG_OPTION );
		$this->assertSame( 2, $flag['globals'] );
		$this->assertCount( 1, $flag['errors'] );
	}

	/**
	 * The flag option is not autoloaded.
	 *
	 * @return void
	 */
	public function test_flag_is_not_autoloaded() {
		global $wpdb;

		BogoMigration::maybe_migrate();

		$autoload = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare( "SELECT autoload FROM {$wpdb->options} WHERE option_name = %s", BogoMigration::FLAG_OPTION )
		);

		$this->assertContains( $autoload, [ 'no', 'off' ] );
	}
}
