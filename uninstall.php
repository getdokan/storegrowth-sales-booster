<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * Delegates to {@see \StorePulse\StoreGrowth\Uninstaller}, which removes the
 * plugin's data only when the merchant has opted in. By default nothing is
 * removed, so uninstalling to troubleshoot never destroys configuration.
 *
 * @package WPBP
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$spsg_autoload = __DIR__ . '/vendor/autoload.php';

// Without the autoloader the cleanup classes cannot be resolved. Since the
// default is to preserve data, skipping is the safe outcome.
if ( ! file_exists( $spsg_autoload ) ) {
	return;
}

require_once $spsg_autoload;

if ( class_exists( \StorePulse\StoreGrowth\Uninstaller::class ) ) {
	\StorePulse\StoreGrowth\Uninstaller::run();
}
