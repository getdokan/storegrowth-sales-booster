<?php
/**
 * Tests for the recoverable migration runner.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Test\Support;

use RuntimeException;
use StorePulse\StoreGrowth\Migrations\UpgradeManager;
use StorePulse\StoreGrowth\Migrations\UpgradeRESTController;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\BaseMigration;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationRegistry;
use WP_REST_Request;
use WP_UnitTestCase;

// phpcs:disable Generic.Files.OneObjectStructurePerFile.MultipleFound, Generic.Classes.OpeningBraceSameLine, PEAR.NamingConventions.ValidClassName.Invalid

/**
 * A migration that works.
 */
class V_9_0_1 extends BaseMigration {

	/**
	 * Option holding the database version in these tests.
	 *
	 * @var string
	 */
	protected static string $db_version_key = 'spsg_test_db_version';

	/**
	 * Times it ran.
	 *
	 * @var int
	 */
	public static $runs = 0;

	/**
	 * The step.
	 *
	 * @return void
	 */
	public static function step(): void {
		++self::$runs;
	}
}

/**
 * A migration that throws until told not to.
 */
class V_9_0_2 extends BaseMigration {

	/**
	 * Option holding the database version in these tests.
	 *
	 * @var string
	 */
	protected static string $db_version_key = 'spsg_test_db_version';

	/**
	 * Whether the step throws.
	 *
	 * @var bool
	 */
	public static $fail = true;

	/**
	 * Times it ran.
	 *
	 * @var int
	 */
	public static $runs = 0;

	/**
	 * The step.
	 *
	 * @throws RuntimeException While `$fail` is set.
	 *
	 * @return void
	 */
	public static function step(): void {
		++self::$runs;

		if ( self::$fail ) {
			throw new RuntimeException( 'Table could not be created.' );
		}
	}
}

/**
 * A failed upgrade can be run again: the flag is cleared, nothing finished is
 * redone, and a flag left by a dead run doesn't block the update forever.
 *
 * @group migration
 */
class UpgradeManagerTest extends WP_UnitTestCase {

	const PREFIX = 'spsg_test';

	const VERSION_KEY = 'spsg_test_db_version';

	/**
	 * The runner under test.
	 *
	 * @var UpgradeManager
	 */
	private UpgradeManager $manager;

	/**
	 * Start from 9.0.0 with both migrations pending.
	 *
	 * @return void
	 */
	public function setUp(): void {
		parent::setUp();

		update_option( self::VERSION_KEY, '9.0.0' );
		delete_option( self::PREFIX . '_is_upgrading_db' );
		delete_option( self::PREFIX . '_migration_log' );

		V_9_0_1::$runs = 0;
		V_9_0_2::$runs = 0;
		V_9_0_2::$fail = true;

		$registry = new MigrationRegistry( self::VERSION_KEY, '9.0.2' );
		$registry->register_many(
			[
				'9.0.1' => V_9_0_1::class,
				'9.0.2' => V_9_0_2::class,
			]
		);

		$this->manager = new UpgradeManager( $registry, self::PREFIX );
	}

	/**
	 * A failed run clears the flag and stamps only what finished.
	 *
	 * @return void
	 */
	public function test_a_failed_run_clears_the_flag_and_keeps_the_update_pending(): void {
		try {
			$this->manager->do_upgrade();
			$this->fail( 'The failing migration should throw.' );
		} catch ( RuntimeException $e ) {
			$this->assertSame( 'Table could not be created.', $e->getMessage() );
		}

		$this->assertFalse( get_option( self::PREFIX . '_is_upgrading_db', false ) );
		$this->assertFalse( $this->manager->has_ongoing_process() );
		$this->assertSame( '9.0.1', get_option( self::VERSION_KEY ) );
		$this->assertTrue( $this->manager->is_upgrade_required() );
		$this->assertSame( 'Table could not be created.', $this->manager->last_error() );
	}

	/**
	 * The retry runs only the migration that failed.
	 *
	 * @return void
	 */
	public function test_a_retry_runs_only_what_is_left(): void {
		try {
			$this->manager->do_upgrade();
		} catch ( RuntimeException $e ) {
			unset( $e );
		}

		V_9_0_2::$fail = false;
		$this->manager->do_upgrade();

		$this->assertSame( 1, V_9_0_1::$runs );
		$this->assertSame( 2, V_9_0_2::$runs );
		$this->assertSame( '9.0.2', get_option( self::VERSION_KEY ) );
		$this->assertFalse( $this->manager->is_upgrade_required() );
		$this->assertSame( '', $this->manager->last_error() );
	}

	/**
	 * A flag left by a run that died: ignored once its log failed or went stale.
	 *
	 * @return void
	 */
	public function test_a_dead_runs_flag_does_not_block_the_update(): void {
		$flag = self::PREFIX . '_is_upgrading_db';
		$log  = self::PREFIX . '_migration_log';

		update_option( $flag, [ '9.0.1' => [ V_9_0_1::class ] ], false );
		$this->assertTrue( $this->manager->has_ongoing_process(), 'A flag with no log yet is a run starting.' );

		update_option( $log, [ '9.0.1' => $this->log_entry( 'running', time() ) ], false );
		$this->assertTrue( $this->manager->has_ongoing_process(), 'A run that just started still blocks.' );

		update_option( $log, [ '9.0.1' => $this->log_entry( 'running', time() - UpgradeManager::STALE_AFTER - 1 ) ], false );
		$this->assertFalse( $this->manager->has_ongoing_process(), 'A run stuck for too long is dead.' );
		$this->assertFalse( get_option( $flag, false ), 'Its flag is removed.' );

		update_option( $flag, [ '9.0.1' => [ V_9_0_1::class ] ], false );
		update_option( $log, [ '9.0.1' => $this->log_entry( 'failed', time() ) ], false );
		$this->assertFalse( $this->manager->has_ongoing_process(), 'A failed run is over.' );
	}

	/**
	 * A migration log entry.
	 *
	 * @param string $status     `running`, `failed` or `completed`.
	 * @param int    $started_at When it started.
	 *
	 * @return array
	 */
	private function log_entry( string $status, int $started_at ): array {
		return [
			'status'     => $status,
			'started_at' => $started_at,
			'error'      => 'failed' === $status ? 'x' : null,
		];
	}

	/**
	 * The REST route answers a failure with its error as JSON.
	 *
	 * @return void
	 */
	public function test_the_route_answers_a_failure_with_its_message(): void {
		$controller = new UpgradeRESTController( $this->manager, 'sales-booster/v1' );
		$response   = $controller->do_upgrade( new WP_REST_Request( 'POST', '/sales-booster/v1/migration/upgrade' ) );

		$this->assertSame( 500, $response->get_status() );
		$this->assertSame( 'spsg_upgrade_failed', $response->get_data()['code'] );
		$this->assertStringContainsString( 'Table could not be created.', $response->get_data()['message'] );

		V_9_0_2::$fail = false;
		$response      = $controller->do_upgrade( new WP_REST_Request( 'POST', '/sales-booster/v1/migration/upgrade' ) );

		$this->assertSame( 201, $response->get_status(), 'The retry is not refused as "already in progress".' );
	}
}
