<?php
/**
 * Characterisation tests for the BOGO data layer.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Bogo;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Test\StoreGrowthTestCase;

/**
 * CHARACTERISATION tests: they record what the code does today, not what it
 * ought to do.
 *
 * @group bogo
 * @group data
 */
class BogoDataManagerTest extends StoreGrowthTestCase {

	/**
	 * Global offer reads are silently capped at 20 rows.
	 *
	 * `get_active_global_bogo_offers()` passes no options to
	 * `get_bogo_offers()`, which defaults to `'limit' => 20`. A store with more
	 * than 20 active global offers therefore never sees the rest, with no
	 * pagination and no warning.
	 *
	 * Recorded as current behaviour.
	 *
	 * @return void
	 */
	public function test_active_global_offers_are_capped_at_twenty() {
		for ( $i = 0; $i < 25; $i++ ) {
			$this->create_global_offer(
				array(
					'name_of_order_bogo' => 'Offer ' . $i,
					'offered_products'   => array( 1000 + $i ),
				)
			);
		}

		$this->assertSame(
			25,
			BogoDataManager::get_bogo_offers_count( array( 'type' => 'global', 'status' => 'active' ) ),
			'all 25 rows are stored'
		);

		$this->assertCount(
			20,
			BogoDataManager::get_active_global_bogo_offers(),
			'but only the first 20 are returned'
		);
	}

	/**
	 * A larger explicit limit reaches past the default cap.
	 *
	 * @return void
	 */
	public function test_explicit_limit_overrides_the_default_cap() {
		for ( $i = 0; $i < 25; $i++ ) {
			$this->create_global_offer( array( 'name_of_order_bogo' => 'Offer ' . $i ) );
		}

		$this->assertCount(
			25,
			BogoDataManager::get_bogo_offers(
				array( 'type' => 'global', 'status' => 'active' ),
				array( 'limit' => 100 )
			)
		);
	}

	/**
	 * Offer ID lists survive the JSON round trip as integers.
	 *
	 * This is the input side of the strict comparison recorded in
	 * BogoEligibilityTest::test_product_matching_is_type_strict(). Offers stored
	 * through the data layer come back as integers and therefore do match; a row
	 * written with string IDs by any other route would not.
	 *
	 * @return void
	 */
	public function test_offered_products_round_trip_as_integers() {
		$id = $this->create_global_offer( array( 'offered_products' => array( 42, 43 ) ) );

		$offer = BogoDataManager::get_bogo_offer( $id );

		$this->assertSame( array( 42, 43 ), $offer['offered_products'] );
	}
}
