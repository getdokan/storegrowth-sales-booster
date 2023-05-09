<?php
/**
 * Plugin Name: StorePulse - WooCommerce Sales Booster Addon
 * Description: Take your WooCommerce store to new heights with StorePulse, the must-have addon designed to skyrocket your sales. Whether you're just starting out or running a thriving online shop, StorePulse offers a comprehensive set of essential modules to optimize your store's performance and maximize conversions. With our free version, you'll gain access to five powerful modules that will supercharge your sales strategy. From advanced inventory management to persuasive marketing tools, StorePulse is your secret weapon for success. Get started with StorePulse today and unlock the full potential of your WooCommerce store.
 * Version:     1.0.0
 * Author:      Invizo
 * Author URI:  https://invizo.io/
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: storepulse-addon
 * Domain Path: /languages
 *
 * @package SBFW
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define plugin __FILE__
 */
if ( ! defined( 'WPCODAL_SBFW_PLUGIN_FILE' ) ) {
	define( 'WPCODAL_SBFW_PLUGIN_FILE', __FILE__ );
}

/**
 * Define plugin directory URL.
 */
if ( ! defined( 'WPCODAL_SBFW_PLUGIN_DIR_URL' ) ) {
	define( 'WPCODAL_SBFW_PLUGIN_DIR_URL', plugin_dir_url( WPCODAL_SBFW_PLUGIN_FILE ) );
}

/**
 * Define plugin directory path.
 */
if ( ! defined( 'WPCODAL_SBFW_PLUGIN_DIR_PATH' ) ) {
	define( 'WPCODAL_SBFW_PLUGIN_DIR_PATH', plugin_dir_path( WPCODAL_SBFW_PLUGIN_FILE ) );
}

/**
 * Define plugin basename.
 */
if ( ! defined( 'WPCODAL_SBFW_PLUGIN_BASENAME' ) ) {
	define( 'WPCODAL_SBFW_PLUGIN_BASENAME', plugin_basename( WPCODAL_SBFW_PLUGIN_FILE ) );
}

/**
 * Check free plugin is active or not.
 */
require_once ABSPATH . 'wp-admin/includes/plugin.php';

if ( ! is_plugin_active( 'woocommerce/woocommerce.php' ) ) {
	add_action(
		'admin_notices',
		function () {
			$message = sprintf(
				__( 'Sales booster for WooCommerce requires %s to be installed and active.', 'sbfw' ),
				'<a href="https://wordpress.org/plugins/woocommerce/">WooCommerce</a>'
			);

			printf( '<div class="%1$s"><p><strong>%2$s</strong></p></div>', esc_attr( 'notice notice-error' ), wp_kses_post( $message ) );
		}
	);

	return;
}

/**
 * Include necessary files to initial load of the plugin.
 */
if ( ! class_exists( 'WPCodal\SBFW\Bootstrap' ) ) {
	require_once __DIR__ . '/includes/traits/trait-singleton.php';
	require_once __DIR__ . '/includes/class-bootstrap.php';
}

/**
 * Initialize the plugin functionality.
 *
 * @since  1.0.0
 * @return SBFW\Bootstrap
 */
function wpcodal_sales_booster_plugin() {
	return WPCodal\SBFW\Bootstrap::instance();
}

// Call initialization function.
wpcodal_sales_booster_plugin();
