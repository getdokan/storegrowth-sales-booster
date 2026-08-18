<?php
/**
 * File for BaseMigration class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

use StorePulse\StoreGrowth\Upgrader;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\BaseMigration as WPKitMigration;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base class of every StoreGrowth migration.
 *
 * Binds the WPKit migration runner to the plugin database version option. Child
 * classes are named after the version they ship in (`V_2_1_2` => `2.1.2`) and
 * every public static method they declare is executed by the runner.
 *
 * @since 2.1.2
 */
abstract class BaseMigration extends WPKitMigration {

	/**
	 * Option key holding the migrated database version.
	 *
	 * @since 2.1.2
	 *
	 * @var string
	 */
	protected static string $db_version_key = Upgrader::DB_VERSION_KEY;
}
