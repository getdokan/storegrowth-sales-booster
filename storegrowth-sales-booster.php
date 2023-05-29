<?php
/**
 * Plugin Name: StoreGrowth - Sales Booster
 * Description: Take your WooCommerce store to new heights with StoreGrowth, the must-have addon designed to skyrocket your sales. Whether you're just starting out or running a thriving online shop, StoreGrowth offers a comprehensive set of essential modules to optimize your store's performance and maximize conversions. With our free version, you'll gain access to five powerful modules that will supercharge your sales strategy. From advanced inventory management to persuasive marketing tools, StoreGrowth is your secret weapon for success. Get started with StoreGrowth today and unlock the full potential of your WooCommerce store.
 * Version:     1.0.0
 * Author:      Invizo
 * Author URI:  https://invizo.io/
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: storegrowth-sales-booster
 * Domain Path: /languages
 *
 * @package SGSB
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define plugin __FILE__
 */
if ( ! defined( 'STOREGROWTH_PLUGIN_FILE' ) ) {
	define( 'STOREGROWTH_PLUGIN_FILE', __FILE__ );
}

/**
 * Define plugin directory URL.
 */
if ( ! defined( 'STOREGROWTH_PLUGIN_DIR_URL' ) ) {
	define( 'STOREGROWTH_PLUGIN_DIR_URL', plugin_dir_url( STOREGROWTH_PLUGIN_FILE ) );
}

/**
 * Define plugin directory path.
 */
if ( ! defined( 'STOREGROWTH_PLUGIN_DIR_PATH' ) ) {
	define( 'STOREGROWTH_PLUGIN_DIR_PATH', plugin_dir_path( STOREGROWTH_PLUGIN_FILE ) );
}

/**
 * Define plugin basename.
 */
if ( ! defined( 'STOREGROWTH_PLUGIN_BASENAME' ) ) {
	define( 'STOREGROWTH_PLUGIN_BASENAME', plugin_basename( STOREGROWTH_PLUGIN_FILE ) );
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
				__( 'StoreGrowth - Sales Booster requires %s to be installed and active.', 'storegrowth_sales_booster' ),
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
if ( ! class_exists( 'STOREGROWTH\SPSB\Bootstrap' ) ) {
	require_once __DIR__ . '/includes/traits/trait-singleton.php';
	require_once __DIR__ . '/includes/class-bootstrap.php';
}

/**
 * Initialize the plugin functionality.
 *
 * @since  1.0.0
 * @return SBFW\Bootstrap
 */
function storepulse_sales_booster_plugin() {
	return STOREGROWTH\SPSB\Bootstrap::instance();
}

// Call initialization function.
storepulse_sales_booster_plugin();
