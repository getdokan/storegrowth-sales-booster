<?php
/**
 * File for Upgrader class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Migrations\V_2_2_0;
use StorePulse\StoreGrowth\Notices\UpgradeNoticeProvider;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\AdminNotification\NoticeManager;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\AdminNotification\NoticeRESTController;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationHooks;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationManager;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationRegistry;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationRESTController;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Database upgrades and the admin notice that triggers them.
 *
 * Migrations are versioned and run on demand: the merchant is told an update is
 * pending through the REST backed notice feed, and the upgrade runs when they
 * confirm it, instead of on an arbitrary page load.
 *
 * @since SPSG_VERSION
 */
class Upgrader implements HookRegistry {

	/**
	 * Option key holding the migrated database version.
	 *
	 * @since SPSG_VERSION
	 */
	const DB_VERSION_KEY = 'spsg_db_version';

	/**
	 * Prefix of the hooks and options owned by the migration runner.
	 *
	 * @since SPSG_VERSION
	 */
	const PREFIX = 'storegrowth';

	/**
	 * REST namespace serving the migration and notice routes.
	 *
	 * @since SPSG_VERSION
	 */
	const REST_NAMESPACE = 'sales-booster/v1';

	/**
	 * Options proving the plugin ran before the database version was tracked.
	 *
	 * @since SPSG_VERSION
	 */
	const LEGACY_INSTALL_OPTIONS = [
		'spsg_active_module_ids',
		'spsg_ini_completion',
		'spsg_user_consent_data',
	];

	/**
	 * Migration registry.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var MigrationRegistry
	 */
	protected MigrationRegistry $registry;

	/**
	 * Migration manager.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var MigrationManager
	 */
	protected MigrationManager $manager;

	/**
	 * Admin notice manager.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var NoticeManager
	 */
	protected NoticeManager $notices;

	/**
	 * Build the migration registry, manager and notice manager.
	 *
	 * @since SPSG_VERSION
	 */
	public function __construct() {
		$this->registry = new MigrationRegistry( self::DB_VERSION_KEY, STOREGROWTH_VERSION );
		$this->registry->register_many(
			[
				'2.2.0' => V_2_2_0::class,
			]
		);

		$this->manager = new MigrationManager( $this->registry, self::PREFIX );
		$this->notices = new NoticeManager( self::PREFIX );

		$this->notices->register_provider( new UpgradeNoticeProvider( $this->manager ) );
	}

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		( new MigrationHooks( $this->manager, self::PREFIX ) )->register();

		add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
	}

	/**
	 * Register the migration and notice REST routes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_rest_routes(): void {
		( new MigrationRESTController( $this->manager, self::REST_NAMESPACE ) )->register_routes();
		( new NoticeRESTController( $this->notices, self::REST_NAMESPACE ) )->register_routes();
	}

	/**
	 * Retrieve the migration manager.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return MigrationManager
	 */
	public function get_manager(): MigrationManager {
		return $this->manager;
	}

	/**
	 * Stamp the current version on a fresh install.
	 *
	 * A site installing StoreGrowth for the first time has nothing to migrate,
	 * so it starts at the current version and never sees the upgrade notice. A
	 * site that ran an older release keeps its missing version, which leaves the
	 * pending migrations to run.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function maybe_stamp_fresh_install(): void {
		if ( false !== get_option( self::DB_VERSION_KEY, false ) ) {
			return;
		}

		foreach ( self::LEGACY_INSTALL_OPTIONS as $option ) {
			if ( null !== get_option( $option, null ) ) {
				return;
			}
		}

		update_option( self::DB_VERSION_KEY, STOREGROWTH_VERSION, false );
	}
}
