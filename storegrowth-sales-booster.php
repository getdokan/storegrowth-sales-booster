<?php
/**
 * Plugin Name: StoreGrowth
 * Description: Best WooCommerce Direct Checkout, Fly Cart, BOGO, Quick View, Live Sales Notifications, Floating Notification Bar and More Essential Features for Every WooCommerce Site!
 * Version:     2.0.5
 * Author:      Dokan Inc.
 * Author URI:  https://storegrowth.io
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: storegrowth-sales-booster
 * Domain Path: /languages
 * Requires Plugins: woocommerce
 * Requires at least: 6.8
 * Requires PHP: 7.4
 * 
 * @package SPSG
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
if ( ! defined( 'STOREGROWTH_FILE' ) ) {
	define( 'STOREGROWTH_FILE', __FILE__ );
}

/**
 * Define plugin directory URL.
 */
if ( ! defined( 'STOREGROWTH_DIR_URL' ) ) {
	define( 'STOREGROWTH_DIR_URL', plugin_dir_url( STOREGROWTH_FILE ) );
}

/**
 * Define plugin directory path.
 */
if ( ! defined( 'STOREGROWTH_DIR_PATH' ) ) {
	define( 'STOREGROWTH_DIR_PATH', plugin_dir_path( STOREGROWTH_FILE ) );
}

/**
 * Define module directory.
 */
if ( ! defined( 'STOREGROWTH_MODULE_DIR' ) ) {
	define( 'STOREGROWTH_MODULE_DIR', __DIR__ . '/modules' );
}

/**
 * Define plugin basename.
 */
if ( ! defined( 'STOREGROWTH_BASENAME' ) ) {
	define( 'STOREGROWTH_BASENAME', plugin_basename( STOREGROWTH_FILE ) );
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
 * @since 2.0.0
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
function sp_store_growth(): Bootstrap {
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
require_once STOREGROWTH_DIR_PATH . '/integrations/bootstrap.php';

// Call initialization function.
sp_store_growth();
