<?php
/**
 * PHPUnit bootstrap.
 *
 * Boots a real WordPress + WooCommerce through wp-phpunit, then loads
 * StoreGrowth on top, mirroring the harness used by dokan-lite.
 *
 * @package SBFW
 */

define( 'TEST_SPSG_PLUGIN_DIR', dirname( __DIR__, 2 ) );
define( 'TEST_WC_DIR', dirname( TEST_SPSG_PLUGIN_DIR, 1 ) . '/woocommerce' );

// The composer autoloader must load first so WP_PHPUNIT__DIR becomes available.
require_once TEST_SPSG_PLUGIN_DIR . '/vendor/autoload.php';

$_tests_dir = getenv( 'WP_TESTS_DIR' ) ? getenv( 'WP_TESTS_DIR' ) : getenv( 'WP_PHPUNIT__DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo "Could not find $_tests_dir/includes/functions.php. Run `composer install` first." . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	exit( 1 );
}

if ( ! file_exists( TEST_WC_DIR . '/woocommerce.php' ) ) {
	echo 'Could not find WooCommerce at ' . TEST_WC_DIR . '. The suite needs it as a sibling plugin directory.' . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	exit( 1 );
}

require_once $_tests_dir . '/includes/functions.php';

/**
 * Load WooCommerce and StoreGrowth into the test environment.
 *
 * @return void
 */
function spsg_manually_load_plugin() {
	define( 'WC_TAX_ROUNDING_MODE', 'auto' );
	define( 'WC_USE_TRANSACTIONS', false );

	require TEST_WC_DIR . '/woocommerce.php';
	require TEST_SPSG_PLUGIN_DIR . '/storegrowth-sales-booster.php';
}

tests_add_filter( 'muplugins_loaded', 'spsg_manually_load_plugin' );

/**
 * Install WooCommerce tables.
 *
 * @return void
 */
function spsg_install_wc() {
	define( 'WP_UNINSTALL_PLUGIN', true );
	define( 'WC_REMOVE_ALL_DATA', true );

	include TEST_WC_DIR . '/uninstall.php';

	WC_Install::install();
	WC_Install::create_tables();

	// Reload capabilities after install, see https://core.trac.wordpress.org/ticket/28374.
	$GLOBALS['wp_roles'] = null; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
	wp_roles();

	echo esc_html( 'Installing WooCommerce...' . PHP_EOL );
}

/**
 * Create the StoreGrowth custom tables the suite reads and writes.
 *
 * Both tables are otherwise created only from their module's `activate()`
 * callback, so the suite creates them explicitly rather than depending on
 * activation order.
 *
 * @return void
 */
function spsg_install_storegrowth() {
	\StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::create_table();

	if ( class_exists( \StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\Migration::class ) ) {
		\StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\Migration::run_migration();
	}

	echo esc_html( 'Installing StoreGrowth...' . PHP_EOL );
}

tests_add_filter( 'setup_theme', 'spsg_install_wc' );
tests_add_filter( 'setup_theme', 'spsg_install_storegrowth' );

require $_tests_dir . '/includes/bootstrap.php';
