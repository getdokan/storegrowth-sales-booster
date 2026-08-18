<?php
/**
 * Base test case for the StoreGrowth PHPUnit suite.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use WP_UnitTestCase;

/**
 * Shared setup and offer builders for the characterisation tests.
 *
 * PHPUnit docs: @see https://docs.phpunit.de/en/9.6/
 */
abstract class StoreGrowthTestCase extends WP_UnitTestCase {

	/**
	 * Truncate the BOGO table between tests so offers never leak across cases.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		global $wpdb;

		$table = $wpdb->prefix . 'spsg_bogo_settings';

		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) ) ) === $table ) {
			$wpdb->query( "TRUNCATE TABLE {$table}" ); // phpcs:ignore WordPress.DB
		}
	}

	/**
	 * Build a BOGO settings array in the shape `BogoDataManager` hands back.
	 *
	 * Tests override only the keys they exercise, so a change in defaults does
	 * not silently rewrite what every case is asserting.
	 *
	 * @param array $overrides Keys to replace.
	 *
	 * @return array
	 */
	protected function bogo_settings( array $overrides = array() ): array {
		return array_merge(
			array(
				'id'                        => 1,
				'type'                      => 'global',
				'status'                    => 'active',
				'bogo_deal_type'            => 'different',
				'offer_type'                => 'free',
				'discount_amount'           => 0,
				'offered_products'          => array(),
				'offered_categories'        => array(),
				'alternate_products'        => array(),
				'minimum_quantity_required' => 1,
				'offer_start'               => null,
				'offer_end'                 => null,
				'offer_schedule'            => array( 'daily' ),
			),
			$overrides
		);
	}

	/**
	 * Create a simple published product.
	 *
	 * @param float $price Regular price.
	 *
	 * @return \WC_Product_Simple
	 */
	protected function create_product( float $price = 10.0 ): \WC_Product_Simple {
		$product = new \WC_Product_Simple();
		$product->set_regular_price( (string) $price );
		$product->set_name( 'Test product' );
		$product->set_status( 'publish' );
		$product->save();

		return $product;
	}

	/**
	 * Insert a global BOGO offer through the data layer under test.
	 *
	 * @param array $settings Offer settings.
	 *
	 * @return int Inserted offer ID.
	 */
	protected function create_global_offer( array $settings = array() ): int {
		return (int) BogoDataManager::create_global_offer( $this->bogo_settings( $settings ) );
	}
}
