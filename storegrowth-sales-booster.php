<?php
/**
 * Plugin Name: StoreGrowth - Sales Booster For WooCommerce Lite
 * Description: Best WooCommerce Direct Checkout, Fly Cart, BOGO, Quick View, Live Sales Notifications, Floating Notification Bar and More Essential Features for Every WooCommerce Site!
 * Version:     1.28.13
 * Author:      Dokan Inc.
 * Author URI:  https://storegrowth.io
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: storegrowth-sales-booster
 * Domain Path: /languages
 *
 * @package SGSB
 */

use StorePulse\StoreGrowth\Bootstrap;

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
	define( 'STOREGROWTH_PLUGIN_TEMPLATES_PATH_LITE', plugin_dir_path( STOREGROWTH_PLUGIN_FILE ) . 'modules/' );
}

/**
 * Define The Stock Count Down Template Constant
 */

if ( ! defined( 'STOREGROWTH_STOCK_COUNTDOWN_TEMPLATES_PATH' ) ) {
	define( 'STOREGROWTH_STOCK_COUNTDOWN_TEMPLATES_PATH', STOREGROWTH_PLUGIN_TEMPLATES_PATH_LITE . 'countdown-timer/templates/' );
}

/**
 * Define The Free Shipping Bar Template Constant
 */

if ( ! defined( 'FREE_SHIPPING_BAR_TEMPLATES_PATH' ) ) {
	define( 'FREE_SHIPPING_BAR_TEMPLATES_PATH', STOREGROWTH_PLUGIN_TEMPLATES_PATH_LITE . 'progressive-discount-banner/templates/' );
}

/**
 * Define plugin basename.
 */
if ( ! defined( 'STOREGROWTH_PLUGIN_BASENAME' ) ) {
	define( 'STOREGROWTH_PLUGIN_BASENAME', plugin_basename( STOREGROWTH_PLUGIN_FILE ) );
}

/**
 * Define module directory.
 */
if ( ! defined( 'STOREGROWTH_MODULE_DIR' ) ) {
	define( 'STOREGROWTH_MODULE_DIR', __DIR__ . '/modules' );
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

// Use the necessary namespace.
use StorePulse\StoreGrowth\DependencyManagement\Container;

// Declare the $dokan_container as global to access from the inside of the function.
global $storegrowth_container;

// Instantiate the container.
$storegrowth_container = new Container();

// Register the service providers.
$storegrowth_container->addServiceProvider( new \StorePulse\StoreGrowth\DependencyManagement\Providers\ServiceProvider() );

/**
 * Get the container.
 *
 * @since 1.29.0
 *
 * @return Container The global container instance.
 */
function storegrowth_get_container(): Container {
    global $storegrowth_container;

    return $storegrowth_container;
}

/**
 * Initialize the plugin functionality.
 *
 * @since  1.0.0
 *
 * @return Bootstrap
 */
function spsg_plugin(): Bootstrap {
	return Bootstrap::instance();
}

// Load modules bootstrap files.
require_once STOREGROWTH_MODULE_DIR . '/bogo/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/countdown-timer/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/direct-checkout/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/floating-notification-bar/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/fly-cart/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/progressive-discount-banner/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/quick-view/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/sales-pop/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/stock-bar/bootstrap.php';
require_once STOREGROWTH_MODULE_DIR . '/upsell-order-bump/bootstrap.php';

// Load integrations bootstrap files.
require_once STOREGROWTH_PLUGIN_DIR_PATH . '/integrations/bootstrap.php';

// Call initialization function.
spsg_plugin();
