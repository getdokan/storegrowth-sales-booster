<?php
/**
 * File for V_3_1_0 migration class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

use StorePulse\StoreGrowth\Analytics\Schema;
use StorePulse\StoreGrowth\Offers\CampaignRepository;

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
	 * Create the campaign tables.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function create_campaign_tables(): void {
		CampaignRepository::install();
	}

	/**
	 * Add the campaign columns to the offer lookup table.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function add_promotion_lookup_columns(): void {
		Schema::install();
	}
}
