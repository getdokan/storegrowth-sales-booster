<?php
/**
 * Plugin Name: StoreGrowth - Sales Booster For WooCommerce Lite
 * Description: Best WooCommerce Direct Checkout, Fly Cart, BOGO, Quick View, Live Sales Notifications, Floating Notification Bar and More Essential Features for Every WooCommerce Site!
 * Version:     1.28.10
 * Author:      Invizo
 * Author URI:  https://invizo.io/
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: storegrowth-sales-booster
 * Domain Path: /languages
 *
 * @package SGSB
 */

use STOREGROWTH\SPSB\Bootstrap;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	return;
}

require_once __DIR__ . '/vendor/autoload.php';

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
 * Define The Template's Folder Constant
 */
if ( ! defined( 'STOREGROWTH_PLUGIN_TEMPLATES_PATH_LITE' ) ) {
	define( 'STOREGROWTH_PLUGIN_TEMPLATES_PATH_LITE', plugin_dir_path( STOREGROWTH_PLUGIN_FILE ) . 'Includes/Modules/' );
}

/**
 * Define The Stock Count Down Template Constant
 */

if ( ! defined( 'STOREGROWTH_STOCK_COUNTDOWN_TEMPLATES_PATH' ) ) {
	define( 'STOREGROWTH_STOCK_COUNTDOWN_TEMPLATES_PATH', STOREGROWTH_PLUGIN_TEMPLATES_PATH_LITE . 'CountdownTimer/templates/' );
}

/**
 * Define The Free Shipping Bar Template Constant
 */

if ( ! defined( 'FREE_SHIPPING_BAR_TEMPLATES_PATH' ) ) {
	define( 'FREE_SHIPPING_BAR_TEMPLATES_PATH', STOREGROWTH_PLUGIN_TEMPLATES_PATH_LITE . 'ProgressiveDiscountBanner/templates/' );
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
					// translators: %s is a placeholder for the WooCommerce plugin link.
				__( 'StoreGrowth - Sales Booster requires %s to be installed and active.', 'storegrowth_sales_booster' ),
				'<a href="https://wordpress.org/plugins/woocommerce/">WooCommerce</a>'
			);

			printf( '<div class="%1$s"><p><strong>%2$s</strong></p></div>', esc_attr( 'notice notice-error' ), wp_kses_post( $message ) );
		}
	);

	return;
}

if ( is_plugin_active( 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php' ) ) {
	define( 'SGSB_PRO_ACTIVE', true );
} else {
	define( 'SGSB_PRO_ACTIVE', false );
}

/**
 * add option when plugin is activated.
 */
register_activation_hook(
	__FILE__,
	function () {
		add_option( 'storegrowth_activation_redirect', true );
	}
);
/**
 * Initialize the plugin functionality.
 *
 * @since  1.0.0
 *
 * @return Bootstrap
 */
function sgsb_plugin(): Bootstrap {
	return Bootstrap::instance();
}

// Call initialization function.
sgsb_plugin();
