<?php
/**
 * Tests for the Order Bump 1.x migration (step 11g).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\UpsellOrderBump;

use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\LegacyMigration;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;
use WC_Product_Variable;
use WC_Product_Variation;
use WP_Upgrader;

/**
 * 1.x order bumps (`sgsb_order_bump` posts) reach the order bumps table once,
 * with mapped keys, and are never changed.
 *
 * @group upsell-order-bump
 * @group migration
 */
class OrderBumpMigrationTest extends StoreGrowthTestCase {

	/**
	 * Start every case with an empty table and no flag.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}spsg_order_bumps" ); // phpcs:ignore WordPress.DB

		delete_option( LegacyMigration::FLAG_OPTION );
	}

	/**
	 * Insert a 1.x bump as 1.x's `bump_create` did: the still-slashed request
	 * serialized into `post_excerpt`, through `wp_insert_post()` (which
	 * unslashes it).
	 *
	 * @param array|string $settings Bump settings, or a raw excerpt.
	 * @param string       $status   Post status.
	 * @param int          $author   Post author.
	 *
	 * @return int Post ID.
	 */
	private function add_legacy_bump( $settings, string $status = 'publish', int $author = 7 ): int {
		$name = is_array( $settings ) ? (string) ( $settings['name_of_order_bump'] ?? '' ) : 'Raw';

		return (int) wp_insert_post(
			[
				'post_title'   => wp_slash( $name ),
				'post_status'  => $status,
				'post_type'    => 'sgsb_order_bump',
				'post_excerpt' => is_array( $settings ) ? maybe_serialize( wp_slash( $settings ) ) : wp_slash( $settings ),
				'post_content' => 'Not defined',
				'post_author'  => $author,
			]
		);
	}

	/**
	 * A 1.x bump in the shape 1.x's admin form saved it (texts entity-encoded).
	 *
	 * @param array $overrides Keys to replace.
	 *
	 * @return array
	 */
	private function legacy_bump( array $overrides = [] ): array {
		return array_merge(
			[
				'name_of_order_bump'             => '&#83;&#117;&#109;&#109;&#101;&#114;&#32;&#38;&#32;&#115;&#97;&#108;&#101;',
				'target_products'                => [ 11, 12 ],
				'target_categories'              => [],
				'bump_schedule'                  => [ 'monday' ],
				'smart_offer'                    => 'false',
				'offer_product'                  => 0,
				'offer_type'                     => 'discount',
				'bump_type'                      => 'products',
				'offer_amount'                   => '20',
				'box_border_style'               => 'dashed',
				'box_border_color'               => '#FF0000',
				'box_top_margin'                 => '5',
				'box_bottom_margin'              => '6',
				'discount_background_color'      => '#E1FFF4',
				'discount_text_color'            => '#02AC6E',
				'discount_font_size'             => '15',
				'product_description_text_color' => '#080814',
				'product_description_font_size'  => '18',
				'offer_image_url'                => 'https://example.com/old.png',
				'offer_product_title'            => 'Old title',
				'offer_product_id'               => 0,
				'offer_discount_title'           => '&#37;&#32;&#111;&#102;&#102;&#33;',
				'offer_fixed_price_title'        => '&#36;&#32;&#111;&#110;&#108;&#121;',
				'product_description'            => 'Add product description please',
				'selection_title'                => 'Add selection title please',
				'offer_description'              => 'Add offer description please',
				'offer_product_regular_price'    => '30',
			],
			$overrides
		);
	}

	/**
	 * Every row, oldest first.
	 *
	 * @return array[]
	 */
	private function rows(): array {
		return ( new OrderBumpData() )->get_all(
			[
				'status'   => '',
				'order_by' => 'id',
				'order'    => 'ASC',
			]
		);
	}

	/**
	 * A 1.x bump lands with mapped keys, cleaned as a REST save; the post is
	 * untouched and the row belongs to the post's author.
	 *
	 * @return void
	 */
	public function test_migrates_bump_with_mapped_keys() {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
		$vendor = self::factory()->user->create();

		$parent = new WC_Product_Variable();
		$parent->set_name( 'Hoodie' );
		$parent->save();
		$variation = new WC_Product_Variation();
		$variation->set_parent_id( $parent->get_id() );
		$variation->set_regular_price( '40' );
		$variation->save();

		$post_id = $this->add_legacy_bump(
			$this->legacy_bump(
				[
					'offer_product'     => (string) $variation->get_id(),
					'offer_product_id'  => 999,
					'bump_type'         => 'categories',
					'target_categories' => [ '5', '6' ],
				]
			),
			'publish',
			$vendor
		);
		$excerpt = get_post_field( 'post_excerpt', $post_id, 'raw' );

		$result = LegacyMigration::migrate();

		$this->assertTrue( $result['success'], implode( '; ', $result['errors'] ) );

		$rows = $this->rows();
		$this->assertCount( 1, $rows );

		$row = $rows[0];
		$this->assertSame( 'Summer & sale', $row['name'] );
		$this->assertSame( 'active', $row['status'] );
		$this->assertSame( 'categories', $row['target_type'] );
		$this->assertSame( [ 5, 6 ], $row['target_categories'] );
		$this->assertSame( [ 11, 12 ], $row['target_products'] );
		$this->assertSame( (string) $variation->get_id(), (string) $row['offer_product_id'], 'the offer product (a variation), not 1.x offer_product_id' );
		$this->assertSame( 'discount', $row['offer_type'] );
		$this->assertEquals( 20, (float) $row['offer_amount'] );
		$this->assertSame( '% off!', $row['offer_discount_title'] );
		$this->assertSame( (string) $vendor, (string) $row['created_by'] );
		$this->assertSame( (string) $vendor, (string) $row['updated_by'] );

		$design = $row['design_settings'];
		$this->assertSame( 'dashed', $design['box_border_style'] );
		$this->assertSame( '#FF0000', $design['box_border_color'] );
		$this->assertSame( 5, $design['box_top_margin'] );
		$this->assertSame( '15', $design['discount_font_size'] );
		$this->assertSame( '% off!', $design['offer_discount_title'] );
		$this->assertSame( '$ only', $design['offer_fixed_price_title'] );
		$this->assertSame( $variation->get_name(), $design['offer_product_title'], 'copies written from the product' );
		$this->assertSame( '', $design['offer_image_url'] );
		$this->assertSame( '40', $design['offer_product_regular_price'] );
		$this->assertSame( '#8fa68bff', $design['offer_description_background_color'], 'a key 1.x lacks gets the default' );
		// 1.x never checked its schedule: the bump keeps running every day.
		$this->assertSame( [ 'daily' ], $design['bump_schedule'], '1.x schedule not migrated' );
		foreach ( [ 'smart_offer', 'name_of_order_bump', 'target_products', 'offer_product', 'offer_product_id', 'bump_type' ] as $key ) {
			$this->assertArrayNotHasKey( $key, $design, "{$key} stays in the 1.x data only" );
		}

		$this->assertSame( $excerpt, get_post_field( 'post_excerpt', $post_id, 'raw' ), '1.x data is never changed' );
		$this->assertSame( 'sgsb_order_bump', get_post_type( $post_id ), '1.x posts are kept' );

		$flag = get_option( LegacyMigration::FLAG_OPTION );
		$this->assertSame( 'done', $flag['state'] );
		$this->assertSame( 1, $flag['bumps'] );
	}

	/**
	 * A text with quotes left 1.x's serialized lengths wrong (the request was
	 * serialized slashed, then unslashed): it is recounted, and the 1.x copies
	 * stand in for an offer product that is gone.
	 *
	 * @return void
	 */
	public function test_slashed_quotes_are_recounted_and_missing_product_keeps_copies() {
		$post_id = $this->add_legacy_bump(
			$this->legacy_bump(
				[
					'offer_product'       => 999999,
					'offer_product_title' => 'Men\'s "12" Shirt \\ Co',
					'offer_image_url'     => 'http://false',
				]
			)
		);

		$this->assertFalse(
			maybe_unserialize( get_post_field( 'post_excerpt', $post_id, 'raw' ) ),
			'the fixture is broken the way 1.x stored it'
		);

		$result = LegacyMigration::migrate();
		$this->assertTrue( $result['success'], implode( '; ', $result['errors'] ) );

		$row = $this->rows()[0];
		$this->assertSame( '999999', (string) $row['offer_product_id'] );
		$this->assertSame( 'Men\'s "12" Shirt \\ Co', $row['design_settings']['offer_product_title'] );
		$this->assertSame( '', $row['design_settings']['offer_image_url'], "1.x's no-image value" );
		$this->assertSame( '30', $row['design_settings']['offer_product_regular_price'] );
	}

	/**
	 * Offer types map to `discount|price`, amounts are clamped, invalid design
	 * values fall back to the defaults, and a JSON excerpt is read.
	 *
	 * @return void
	 */
	public function test_values_are_mapped_clamped_and_sanitized() {
		$product = $this->create_product();
		$bumps   = [
			'Huge'     => [
				'offer_amount' => '250',
			],
			'Negative' => [
				'offer_type'   => 'price',
				'offer_amount' => '-5',
			],
			'Fixed'    => [
				'offer_type'   => 'price',
				'offer_amount' => '12.5',
			],
			'Untyped'  => [
				'offer_type'   => [],
				'offer_amount' => '3',
			],
			'Bad'      => [
				'box_border_style' => 'groove;color:red',
				'box_border_color' => 'red;}body{display:none',
				'box_top_margin'   => 'abc',
				'offer_image_url'  => 'javascript:alert(1)',
			],
		];
		foreach ( $bumps as $name => $overrides ) {
			$this->add_legacy_bump(
				$this->legacy_bump(
					array_merge(
						$overrides,
						[
							'name_of_order_bump' => $name,
							'offer_product'      => $product->get_id(),
						]
					)
				)
			);
		}
		$this->add_legacy_bump(
			wp_json_encode(
				$this->legacy_bump(
					[
						'name_of_order_bump' => 'Json',
						'offer_product'      => $product->get_id(),
					]
				)
			)
		);

		$result = LegacyMigration::migrate();
		$this->assertTrue( $result['success'], implode( '; ', $result['errors'] ) );

		$rows = array_column( $this->rows(), null, 'name' );
		$this->assertEquals( 100, (float) $rows['Huge']['offer_amount'] );
		$this->assertSame( 'price', $rows['Negative']['offer_type'] );
		$this->assertEquals( 0, (float) $rows['Negative']['offer_amount'] );
		$this->assertEquals( 12.5, (float) $rows['Fixed']['offer_amount'] );
		$this->assertSame( 'price', $rows['Untyped']['offer_type'], "1.x priced anything but 'discount' as a fixed price" );
		$this->assertArrayHasKey( 'Json', $rows );

		$design = $rows['Bad']['design_settings'];
		$this->assertSame( 'solid', $design['box_border_style'], 'unknown style → default' );
		$this->assertSame( '#32DBBE', $design['box_border_color'], 'invalid colour → default' );
		$this->assertSame( 1, $design['box_top_margin'], 'non-numeric margin → default' );
		$this->assertSame( 'Test product', $design['offer_product_title'] );
		$this->assertSame( '', $design['offer_image_url'], 'the product has no image' );
	}

	/**
	 * Only published posts migrate: 1.x listed and showed no others.
	 *
	 * @return void
	 */
	public function test_only_published_bumps_migrate() {
		$product = $this->create_product();
		$this->add_legacy_bump(
			$this->legacy_bump(
				[
					'name_of_order_bump' => 'Draft',
					'offer_product'      => $product->get_id(),
				]
			),
			'draft'
		);

		LegacyMigration::migrate();

		$this->assertCount( 0, $this->rows() );
	}

	/**
	 * A migrated bump keeps its 1.x creation date, so the list (newest first)
	 * keeps 1.x's order.
	 *
	 * @return void
	 */
	public function test_created_at_is_the_1x_post_date() {
		$product = $this->create_product();
		$dates   = [ '2023-03-04 05:06:07', '2021-01-02 03:04:05' ];

		foreach ( $dates as $index => $date ) {
			$post_id = $this->add_legacy_bump(
				$this->legacy_bump(
					[
						'name_of_order_bump' => "Bump {$index}",
						'offer_product'      => $product->get_id(),
					]
				)
			);
			wp_update_post(
				[
					'ID'            => $post_id,
					'post_date'     => $date,
					'post_date_gmt' => get_gmt_from_date( $date ),
				]
			);
		}

		LegacyMigration::migrate();

		$this->assertSame( $dates, wp_list_pluck( $this->rows(), 'created_at' ) );
		$this->assertSame( [ 'Bump 0', 'Bump 1' ], wp_list_pluck( ( new OrderBumpData() )->get_all( [ 'status' => '' ] ), 'name' ), 'newest first' );
	}

	/**
	 * While another request holds the lock, a run copies nothing and leaves
	 * the flag unset.
	 *
	 * @return void
	 */
	public function test_held_lock_makes_run_a_no_op() {
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

		$this->add_legacy_bump( $this->legacy_bump( [ 'offer_product' => $this->create_product()->get_id() ] ) );

		$this->assertTrue( WP_Upgrader::create_lock( LegacyMigration::LOCK_NAME, HOUR_IN_SECONDS ) );

		LegacyMigration::maybe_migrate();

		$this->assertCount( 0, $this->rows() );
		$this->assertFalse( get_option( LegacyMigration::FLAG_OPTION ) );

		WP_Upgrader::release_lock( LegacyMigration::LOCK_NAME );

		LegacyMigration::maybe_migrate();

		$this->assertCount( 1, $this->rows() );
	}

	/**
	 * The migration runs once: the flag stops a second run.
	 *
	 * @return void
	 */
	public function test_runs_once() {
		$product = $this->create_product();
		$this->add_legacy_bump( $this->legacy_bump( [ 'offer_product' => $product->get_id() ] ) );

		LegacyMigration::maybe_migrate();
		$this->assertCount( 1, $this->rows() );

		// Delete the migrated row and add another 1.x post: nothing comes back.
		( new OrderBumpData() )->delete( $this->rows()[0]['id'] );
		$this->add_legacy_bump( $this->legacy_bump( [ 'offer_product' => $product->get_id() ] ) );

		LegacyMigration::maybe_migrate();
		LegacyMigration::migrate();

		$this->assertCount( 0, $this->rows() );
	}

	/**
	 * Nothing is copied when the table already has bumps.
	 *
	 * @return void
	 */
	public function test_skipped_when_table_has_bumps() {
		$product = $this->create_product();
		( new OrderBumpData() )->create(
			[
				'name'             => '2.x bump',
				'status'           => 'inactive',
				'offer_product_id' => $product->get_id(),
			]
		);
		$this->add_legacy_bump( $this->legacy_bump( [ 'offer_product' => $product->get_id() ] ) );

		LegacyMigration::maybe_migrate();

		$rows = $this->rows();
		$this->assertCount( 1, $rows );
		$this->assertSame( '2.x bump', $rows[0]['name'] );
		$this->assertSame( 'skipped', get_option( LegacyMigration::FLAG_OPTION )['state'] );
	}

	/**
	 * A bad post (unreadable settings, no offer product) is skipped and
	 * recorded; the others migrate.
	 *
	 * @return void
	 */
	public function test_bad_row_is_skipped_and_others_migrate() {
		$product = $this->create_product();
		$this->add_legacy_bump(
			$this->legacy_bump(
				[
					'name_of_order_bump' => 'First',
					'offer_product'      => $product->get_id(),
				]
			)
		);
		$unreadable = $this->add_legacy_bump( 'Not defined' );
		$no_offer   = $this->add_legacy_bump( $this->legacy_bump( [ 'name_of_order_bump' => 'No offer' ] ) );
		$this->add_legacy_bump(
			$this->legacy_bump(
				[
					'name_of_order_bump' => 'Fourth',
					'offer_product'      => $product->get_id(),
				]
			)
		);

		$result = LegacyMigration::migrate();

		$this->assertFalse( $result['success'] );
		$this->assertCount( 2, $result['errors'] );
		$this->assertStringContainsString( (string) $unreadable, $result['errors'][0] );
		$this->assertStringContainsString( (string) $no_offer, $result['errors'][1] );
		$this->assertSame( [ 'First', 'Fourth' ], wp_list_pluck( $this->rows(), 'name' ) );

		$flag = get_option( LegacyMigration::FLAG_OPTION );
		$this->assertSame( 2, $flag['bumps'] );
		$this->assertCount( 2, $flag['errors'] );
	}

	/**
	 * The flag option is not autoloaded.
	 *
	 * @return void
	 */
	public function test_flag_is_not_autoloaded() {
		global $wpdb;

		LegacyMigration::maybe_migrate();

		$autoload = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare( "SELECT autoload FROM {$wpdb->options} WHERE option_name = %s", LegacyMigration::FLAG_OPTION )
		);

		$this->assertContains( $autoload, [ 'no', 'off' ] );
	}
}
