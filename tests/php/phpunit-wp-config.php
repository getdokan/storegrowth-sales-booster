<?php
/**
 * WordPress configuration used by the PHPUnit suite.
 *
 * Consumed through the `WP_PHPUNIT__TESTS_CONFIG` env var set in phpunit.xml.
 *
 * @package SBFW
 */

$wordpress_dir = dirname( __DIR__, 2 ) . '/wordpress/';
if ( ! is_dir( $wordpress_dir ) ) {
	$wordpress_dir = dirname( __DIR__, 5 ) . '/';
}

/* Path to the WordPress codebase to test against. Trailing slash required. */
define( 'ABSPATH', $wordpress_dir );

define( 'WP_DEFAULT_THEME', 'default' );
define( 'WP_DEBUG', true );

// ** Database settings ** //
//
// WARNING: the suite DROPS ALL TABLES carrying the prefix below. The prefix is
// deliberately `unit_` rather than the site's own, so the suite can share the
// wp-env database without destroying the development site sitting next to it.
// Never point this at a production database.
// Every value is overridable so the same config serves a local MySQL, a wp-env
// container (WP_DB_HOST=mysql) and CI without edits.
define( 'DB_NAME', getenv( 'WP_DB_NAME' ) ?: 'spsg_phpunit_tests' );
define( 'DB_USER', getenv( 'WP_DB_USER' ) ?: 'root' );
define( 'DB_PASSWORD', getenv( 'WP_DB_PASS' ) ?: '' );
define( 'DB_HOST', getenv( 'WP_DB_HOST' ) ?: 'localhost' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

define( 'AUTH_KEY', 'put your unique phrase here' );
define( 'SECURE_AUTH_KEY', 'put your unique phrase here' );
define( 'LOGGED_IN_KEY', 'put your unique phrase here' );
define( 'NONCE_KEY', 'put your unique phrase here' );
define( 'AUTH_SALT', 'put your unique phrase here' );
define( 'SECURE_AUTH_SALT', 'put your unique phrase here' );
define( 'LOGGED_IN_SALT', 'put your unique phrase here' );
define( 'NONCE_SALT', 'put your unique phrase here' );

$table_prefix = 'unit_'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

define( 'WP_TESTS_DOMAIN', 'example.org' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'Test Blog' );

define( 'WP_PHP_BINARY', 'php' );

define( 'WPLANG', '' );
