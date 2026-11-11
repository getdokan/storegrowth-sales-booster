<?php
/**
 * File for V_3_1_0 migration class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use RuntimeException;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Migration shipped with 3.1.0 (offer versions, ADR-013). Existing offers
 * are everyday offers as they stand, so no offer data is copied or rewritten.
 *
 * @since SPSG_VERSION
 */
class V_3_1_0 extends BaseMigration {

	/**
	 * Create the campaign tables. Throws when they aren't there afterwards, so
	 * the version isn't stamped and the update can be retried.
	 *
	 * @since SPSG_VERSION
	 *
	 * @throws RuntimeException When the tables could not be created.
	 *
	 * @return void
	 */
	public static function create_campaign_tables(): void {
		CampaignRepository::install();

		if ( ! CampaignRepository::is_installed() ) {
			throw new RuntimeException( esc_html__( 'The campaign tables could not be created.', 'storegrowth-sales-booster' ) );
		}
	}

	/**
	 * Add the campaign columns to the offer lookup table.
	 *
	 * @since SPSG_VERSION
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
}
