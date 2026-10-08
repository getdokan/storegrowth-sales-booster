<?php
/**
 * BOGO counts for analytics (ADR-012).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Modules\BoGo\OrderBogo;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;

/**
 * A gift the cart adds is counted once per offer.
 *
 * @group bogo
 * @group analytics
 */
class BogoAnalyticsTest extends StoreGrowthTestCase {

	/**
	 * An empty counts table and cart.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;
		$wpdb->query( "TRUNCATE TABLE {$wpdb->prefix}" . Schema::DAILY ); // phpcs:ignore WordPress.DB

		wc_load_cart();
		WC()->cart->empty_cart();
	}

	/**
	 * Empty the cart.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		WC()->cart->empty_cart();

		parent::tearDown();
	}

	/**
	 * A new gift line counts `add_to_cart` for its offer; a quantity
	 * update of that gift doesn't.
	 *
	 * @return void
	 */
	public function test_added_gift_is_counted_once() {
		global $wpdb;

		$trigger     = $this->create_product( 30.0 );
		$gift        = $this->create_product( 10.0 );
		$trigger_key = WC()->cart->add_to_cart( $trigger->get_id() );
		$settings    = $this->bogo_settings(
			[
				'id'               => 7,
				'offer_product_id' => $gift->get_id(),
			]
		);

		OrderBogo::instance()->apply_bogo_product( $settings, $trigger->get_id(), $trigger_key );
		OrderBogo::instance()->apply_bogo_product( $settings, $trigger->get_id(), $trigger_key, 2 );

		$rows = $wpdb->get_results( "SELECT module, metric, object_type, object_id, count FROM {$wpdb->prefix}" . Schema::DAILY, ARRAY_A ); // phpcs:ignore WordPress.DB

		$this->assertSame(
			[
				[
					'module'      => 'bogo',
					'metric'      => 'add_to_cart',
					'object_type' => 'campaign',
					'object_id'   => '7',
					'count'       => '1',
				],
			],
			$rows
		);
	}
}
