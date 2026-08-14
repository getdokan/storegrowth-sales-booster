<?php
/**
 * File for V_2_2_0 migration class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Migration shipped with 2.2.0.
 *
 * @since SPSG_VERSION
 */
class V_2_2_0 extends BaseMigration {

	/**
	 * Drop the consent records left behind by the removed setup wizard handler.
	 *
	 * Every consent appended a full request payload — the administrator email
	 * address, the site plugin list and a duplicate JSON copy of the same data —
	 * to the autoloaded `spsg_user_consent_data` option. Nothing read it, it was
	 * never sent anywhere, and the telemetry it duplicated is collected by the
	 * Appsero client instead.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function remove_legacy_consent_data(): void {
		delete_option( 'spsg_user_consent_data' );
	}
}
