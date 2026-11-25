<?php
/**
 * File for V_3_1_0 migration class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

use StorePulse\StoreGrowth\Analytics\Schema;
use RuntimeException;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Migration shipped with 3.1.0 (offer versions, ADR-013). Existing offers
 * are everyday offers as they stand, so no offer data is copied or rewritten.
 * The campaign tables are StoreGrowth Pro's, installed by Pro.
 *
 * @since 3.1.0
 */
class V_3_1_0 extends BaseMigration {

	/**
	 * Add the campaign columns to the offer lookup table.
	 *
	 * @since 3.1.0
	 *
	 * @throws RuntimeException When the table could not be updated.
	 *
	 * @return void
	 */
	public static function add_promotion_lookup_columns(): void {
		Schema::install();

		if ( ! Schema::has_promotions() ) {
			throw new RuntimeException( esc_html__( 'The offer report table could not be updated.', 'storegrowth-sales-booster' ) );
		}
	}

	/**
	 * Replace the Free Shipping Bar's default goal text: a Cart Rewards
	 * milestone can now give a discount, a coupon or a gift, so "You have
	 * successfully acquired free shipping." would be wrong for them. Only
	 * the old default is replaced; a text the store owner wrote stays.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public static function replace_free_shipping_goal_text(): void {
		$settings = get_option( 'spsg_progressive_discount_banner_settings' );

		if ( ! is_array( $settings ) || 'You have successfully acquired free shipping.' !== ( $settings['goal_completion_text'] ?? '' ) ) {
			return;
		}

		$settings['goal_completion_text'] = 'All rewards unlocked';

		update_option( 'spsg_progressive_discount_banner_settings', $settings );
	}
}
