<?php
/**
 * Environment-agnostic site provisioning for the E2E/API suite.
 *
 * Run inside the WP-CLI container of whichever environment hosts the site:
 *
 *   # Docker stack (bin/setup-docker.sh):
 *   docker compose run --rm cli wp eval-file \
 *     /var/www/html/wp-content/plugins/storegrowth-sales-booster/tests/e2e/bin/provision-site.php
 *
 *   # GitHub Actions (wp-env):
 *   wp-env run cli wp eval-file \
 *     wp-content/plugins/storegrowth-sales-booster/tests/e2e/bin/provision-site.php
 *
 * Assumes WordPress, WooCommerce, this plugin, the Storefront theme and the
 * WP-API Basic-Auth plugin are already installed + active (each environment
 * handles installation its own way). This script does the *shared* post-install
 * configuration the tests rely on. Idempotent — safe to re-run.
 *
 * @package storegrowth-e2e
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* -- Pretty permalinks (required by /wp-json/ pretty routes). ---------------- */
if ( get_option( 'permalink_structure' ) !== '/%postname%/' ) {
	update_option( 'permalink_structure', '/%postname%/' );
	flush_rewrite_rules( false );
}

/* -- Activate the Storefront theme if available. ---------------------------- */
if ( wp_get_theme( 'storefront' )->exists() && get_option( 'stylesheet' ) !== 'storefront' ) {
	switch_theme( 'storefront' );
}

/* -- Publish the storefront (WooCommerce "Coming soon" off) + base config. --- */
update_option( 'woocommerce_coming_soon', 'no' );
update_option( 'woocommerce_store_pages_only', 'no' );
update_option( 'woocommerce_default_country', 'US:CA' );
update_option( 'woocommerce_currency', 'USD' );
update_option( 'woocommerce_calc_taxes', 'no' );
update_option( 'woocommerce_onboarding_profile', array( 'skipped' => true ) );

/* -- Mark StoreGrowth initial setup complete (Settings loads directly). ------ */
update_option( 'spsg_ini_completion', 1 );
delete_option( 'storegrowth_activation_redirect' );

/* -- Ensure WooCommerce pages exist. ---------------------------------------- */
if ( class_exists( 'WC_Install' ) ) {
	WC_Install::create_pages();
}

/* -- Use the CLASSIC checkout (the Order Bump uses a classic hook; ISSUES #7). */
$checkout_id = (int) get_option( 'woocommerce_checkout_page_id' );
if ( $checkout_id ) {
	wp_update_post(
		array(
			'ID'           => $checkout_id,
			'post_content' => '[woocommerce_checkout]',
		)
	);
}

/* -- Activate the Pro plugin if it is present (Docker mounts it; CI may not). - */
if ( ! function_exists( 'activate_plugin' ) ) {
	require_once ABSPATH . 'wp-admin/includes/plugin.php';
}
$pro_plugin = 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php';
if ( file_exists( WP_PLUGIN_DIR . '/' . $pro_plugin ) && ! is_plugin_active( $pro_plugin ) ) {
	activate_plugin( $pro_plugin );
}

/* -- Activate the Pro license from $LICENSE_KEY (Appsero), if available. ------
 * Requires Pro to be loaded in this request (the setup activates the Pro plugin
 * in a prior step). Hits the Appsero license API once; skips if already valid.
 */
$license_key   = getenv( 'LICENSE_KEY' );
$appsero_client = '\\StorePulse\\StoreGrowthPro\\Dependencies\\Appsero\\Client';
if ( $license_key && defined( 'STOREGROWTH_PRO_FILE' ) && class_exists( $appsero_client ) ) {
	$client  = new $appsero_client( '512b82bc-5d26-46d3-9d14-e51642c15ff3', 'StoreGrowth Sales Booster Pro', STOREGROWTH_PRO_FILE );
	$license = $client->license();
	if ( ! $license->is_valid() ) {
		$resp = $license->activate( trim( $license_key ) );
		if ( ! empty( $resp['success'] ) ) {
			update_option(
				'appsero_' . md5( $client->slug ) . '_manage_license',
				array(
					'key'              => trim( $license_key ),
					'status'           => 'activate',
					'remaining'        => $resp['remaining'] ?? '',
					'activation_limit' => $resp['activation_limit'] ?? '',
					'expiry_days'      => $resp['expiry_days'] ?? '',
					'title'            => $resp['title'] ?? '',
					'source_id'        => $resp['source_identifier'] ?? '',
					'recurring'        => $resp['recurring'] ?? '',
				),
				false
			);
			if ( class_exists( 'WP_CLI' ) ) {
				WP_CLI::log( '    Pro license activated.' );
			}
		} elseif ( class_exists( 'WP_CLI' ) ) {
			WP_CLI::warning( 'Pro license activation failed: ' . ( $resp['error'] ?? 'unknown' ) );
		}
	}
}

/* -- Activate ALL modules via ModuleManager (fires hooks + migrations). ------ */
if ( function_exists( 'storegrowth_get_container' ) ) {
	$module_manager = storegrowth_get_container()->get( \StorePulse\StoreGrowth\ModuleManager::class );
	$module_ids     = array(
		'bogo',
		'countdown-timer',
		'direct-checkout',
		'floating-notification-bar',
		'fly-cart',
		'progressive-discount-banner',
		'quick-view',
		'sales-pop',
		'stock-bar',
		'upsell-order-bump',
	);
	foreach ( $module_ids as $module_id ) {
		$module_manager->activate( $module_id );
	}
}

/* -- Seed published, stock-managed products (idempotent by slug). ------------ */
if ( class_exists( 'WC_Product_Simple' ) ) {
	$seed_products = array(
		array( 'E2E Test Product A', 'e2e-test-product-a', '19.99', 25 ),
		array( 'E2E Test Product B', 'e2e-test-product-b', '49.00', 5 ),
		array( 'E2E Sale Product C', 'e2e-sale-product-c', '30.00', 100 ),
	);
	foreach ( $seed_products as $row ) {
		list( $name, $slug, $price, $stock ) = $row;
		if ( get_page_by_path( $slug, OBJECT, 'product' ) ) {
			continue;
		}
		$product = new WC_Product_Simple();
		$product->set_name( $name );
		$product->set_slug( $slug );
		$product->set_regular_price( $price );
		$product->set_manage_stock( true );
		$product->set_stock_quantity( $stock );
		$product->set_stock_status( 'instock' );
		$product->set_status( 'publish' );
		$product->save();
	}
}

if ( class_exists( 'WP_CLI' ) ) {
	WP_CLI::success( 'StoreGrowth E2E site provisioned (all modules active, products seeded, classic checkout).' );
}
