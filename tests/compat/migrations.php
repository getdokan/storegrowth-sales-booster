<?php
/**
 * Versioned database migrations (`Upgrader`, `Migrations\V_2_1_2`) and their
 * REST routes, against a live site.
 *
 *     wp eval-file tests/compat/migrations.php
 *
 * Covers what PHPUnit doesn't (the 1.x BOGO and Order Bump imports are in
 * tests/php/src/Bogo/BogoMigrationTest.php and
 * tests/php/src/UpsellOrderBump/OrderBumpMigrationTest.php):
 *
 * - `Upgrader::maybe_stamp_fresh_install()`: a fresh install starts at the
 *   current version; a site that ran an older release keeps the version
 *   missing, so its migrations stay pending.
 * - `GET sales-booster/v1/migration/status` / `POST …/migration/upgrade`:
 *   `update_plugins` only; status before and after; the upgrade runs
 *   V_2_1_2 (drops `spsg_user_consent_data`), stamps the plugin version and logs it; a
 *   second upgrade and one while another runs answer 400.
 *
 * Every option it touches is restored, also on failure. Exits 1 on any failure.
 *
 * @package StorePulse\StoreGrowth
 */

use StorePulse\StoreGrowth\Upgrader;

defined( 'ABSPATH' ) || exit;

// phpcs:ignoreFile -- CLI test script (wp eval-file), prints plain text.

$spsg_failures = 0;

$check = static function ( bool $ok, string $label, $got = null ) use ( &$spsg_failures ) {
	echo ( $ok ? '  ✓ ' : '  ✗ ' ), $label, ( $ok || null === $got ? '' : '  got: ' . var_export( $got, true ) ), "\n";
	if ( ! $ok ) {
		++$spsg_failures;
	}
};

// Options this script changes, restored at the end (or on a fatal).
$touched = [
	Upgrader::DB_VERSION_KEY,
	'spsg_user_consent_data',
	'spsg_active_module_ids',
	'spsg_ini_completion',
	Upgrader::PREFIX . '_is_upgrading_db',
	Upgrader::PREFIX . '_migration_log',
];
$missing = new stdClass();
$backup  = [];
foreach ( $touched as $option ) {
	$backup[ $option ] = get_option( $option, $missing );
}
$restored = false;
$restore  = static function () use ( &$restored, $backup, $missing ) {
	if ( $restored ) {
		return;
	}
	$restored = true;
	foreach ( $backup as $option => $value ) {
		if ( $missing === $value ) {
			delete_option( $option );
		} else {
			update_option( $option, $value );
		}
	}
};
register_shutdown_function( $restore );

$request = static function ( string $method, string $route ) {
	$response = rest_do_request( new WP_REST_Request( $method, '/' . Upgrader::REST_NAMESPACE . $route ) );

	return [ $response->get_status(), $response->get_data() ];
};

try {
	echo "\nUpgrader::maybe_stamp_fresh_install\n";
	foreach ( Upgrader::LEGACY_INSTALL_OPTIONS as $option ) {
		delete_option( $option );
	}
	delete_option( Upgrader::DB_VERSION_KEY );
	Upgrader::maybe_stamp_fresh_install();
	$check( STOREGROWTH_VERSION === get_option( Upgrader::DB_VERSION_KEY ), 'fresh install: stamped with the current version', get_option( Upgrader::DB_VERSION_KEY ) );

	delete_option( Upgrader::DB_VERSION_KEY );
	update_option( 'spsg_active_module_ids', [ 'bogo' ] );
	Upgrader::maybe_stamp_fresh_install();
	$check( false === get_option( Upgrader::DB_VERSION_KEY, false ), 'older release (a legacy option exists): version left missing' );

	update_option( Upgrader::DB_VERSION_KEY, '2.1.0' );
	Upgrader::maybe_stamp_fresh_install();
	$check( '2.1.0' === get_option( Upgrader::DB_VERSION_KEY ), 'a stored version is never overwritten' );

	echo "\nmigration routes: permissions\n";
	wp_set_current_user( 0 );
	list( $status ) = $request( 'GET', '/migration/status' );
	$check( in_array( $status, [ 401, 403 ], true ), 'guest: status rejected', $status );
	list( $status ) = $request( 'POST', '/migration/upgrade' );
	$check( in_array( $status, [ 401, 403 ], true ), 'guest: upgrade rejected', $status );

	$customer = wp_insert_user(
		[
			'user_login' => 'spsg_compat_' . wp_generate_password( 6, false ),
			'user_pass'  => wp_generate_password(),
			'role'       => 'customer',
		]
	);
	wp_set_current_user( $customer );
	list( $status ) = $request( 'POST', '/migration/upgrade' );
	$check( 403 === $status, 'customer: upgrade rejected', $status );
	require_once ABSPATH . 'wp-admin/includes/user.php';
	wp_delete_user( $customer );

	$admins = get_users( [ 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ] );
	wp_set_current_user( (int) $admins[0] );

	echo "\nmigration routes: a site on 2.1.1 upgrades through V_2_1_2\n";
	update_option( Upgrader::DB_VERSION_KEY, '2.1.1' );
	update_option( 'spsg_user_consent_data', [ [ 'email' => 'admin@example.com' ] ] );
	delete_option( Upgrader::PREFIX . '_is_upgrading_db' );
	delete_option( Upgrader::PREFIX . '_migration_log' );

	list( $status, $data ) = $request( 'GET', '/migration/status' );
	$check( 200 === $status, 'status: 200', $status );
	$check( true === ( $data['is_upgrade_required'] ?? null ), 'status: upgrade required', $data );
	$check( '2.1.1' === ( $data['db_version'] ?? null ), 'status: db_version 2.1.1', $data['db_version'] ?? null );
	$check( STOREGROWTH_VERSION === ( $data['plugin_version'] ?? null ), 'status: plugin_version', $data['plugin_version'] ?? null );
	$check( false === ( $data['is_running'] ?? null ), 'status: not running', $data['is_running'] ?? null );

	update_option( Upgrader::PREFIX . '_is_upgrading_db', [ '2.1.2' => [ 'x' ] ], false );
	list( $status ) = $request( 'POST', '/migration/upgrade' );
	$check( 400 === $status, 'upgrade while another runs: 400', $status );
	$check( false !== get_option( 'spsg_user_consent_data', false ), '… and nothing ran' );
	delete_option( Upgrader::PREFIX . '_is_upgrading_db' );

	list( $status, $data ) = $request( 'POST', '/migration/upgrade' );
	$check( 201 === $status, 'upgrade: 201', [ $status, $data ] );
	$check( false === get_option( 'spsg_user_consent_data', false ), 'V_2_1_2: spsg_user_consent_data removed' );
	// The run ends with `update_db_version_to_current()`: the plugin's version, not the last migration's.
	$check( STOREGROWTH_VERSION === get_option( Upgrader::DB_VERSION_KEY ), 'db version stamped with the plugin version', get_option( Upgrader::DB_VERSION_KEY ) );
	$check( false === get_option( Upgrader::PREFIX . '_is_upgrading_db', false ), 'the in-progress flag is cleared' );
	$log = get_option( Upgrader::PREFIX . '_migration_log', [] );
	$check( is_array( $log ) && false !== strpos( wp_json_encode( $log ), '2.1.2' ), 'the run is logged', $log );

	list( $status, $data ) = $request( 'GET', '/migration/status' );
	$check( false === ( $data['is_upgrade_required'] ?? null ), 'status after: no upgrade required', $data );

	list( $status ) = $request( 'POST', '/migration/upgrade' );
	$check( 400 === $status, 'a second upgrade: 400 (no upgrade required)', $status );

	echo "\nmigration routes: a current site has nothing to run\n";
	update_option( Upgrader::DB_VERSION_KEY, STOREGROWTH_VERSION );
	update_option( 'spsg_user_consent_data', [ 'kept' ] );
	list( $status, $data ) = $request( 'GET', '/migration/status' );
	$check( false === ( $data['is_upgrade_required'] ?? null ), 'status: no upgrade required', $data );
	list( $status ) = $request( 'POST', '/migration/upgrade' );
	$check( 400 === $status, 'upgrade: 400', $status );
	$check( [ 'kept' ] === get_option( 'spsg_user_consent_data' ), 'V_2_1_2 did not run again' );
} finally {
	$restore();
}

$check( $backup[ Upgrader::DB_VERSION_KEY ] === get_option( Upgrader::DB_VERSION_KEY, $missing ), 'options restored' );

echo "\n", $spsg_failures ? "{$spsg_failures} failure(s)\n" : "All checks passed\n";
if ( $spsg_failures ) {
	exit( 1 );
}
