<?php
/**
 * Environment-agnostic site provisioning for the E2E/API suite.
 *
 * Run inside the WP-CLI container of whichever environment hosts the site:
 *
 *   # Docker stack (bin/setup-docker.sh):
 *   docker compose -p <project> run --rm cli wp eval-file \
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

/* -- Lite or Pro. -------------------------------------------------------------
 * Pro runs only when it is mounted AND a LICENSE_KEY is given (the Docker
 * stack's opt-in Pro variant, or CI with the Pro secrets). Otherwise it is
 * deactivated, so a lite stack never reports has_pro() through a stale
 * active_plugins entry (deactivate_plugins() works on the option even when the
 * plugin folder is no longer mounted). */
if ( ! function_exists( 'activate_plugin' ) ) {
	require_once ABSPATH . 'wp-admin/includes/plugin.php';
}
$pro_plugin = 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php';
$pro_wanted = getenv( 'LICENSE_KEY' ) && file_exists( WP_PLUGIN_DIR . '/' . $pro_plugin );
if ( $pro_wanted && ! is_plugin_active( $pro_plugin ) ) {
	activate_plugin( $pro_plugin );
} elseif ( ! $pro_wanted && is_plugin_active( $pro_plugin ) ) {
	deactivate_plugins( $pro_plugin, true );
	if ( class_exists( 'WP_CLI' ) ) {
		WP_CLI::log( '    StoreGrowth Pro deactivated (lite stack).' );
	}
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

/* -- Seed the `e2e10` coupon (10% off) the Fly Cart coupon test applies. ------ */
if ( class_exists( 'WC_Coupon' ) && function_exists( 'wc_get_coupon_id_by_code' ) && ! wc_get_coupon_id_by_code( 'e2e10' ) ) {
	$coupon = new WC_Coupon();
	$coupon->set_code( 'e2e10' );
	$coupon->set_discount_type( 'percent' );
	$coupon->set_amount( 10 );
	$coupon->save();
}

/* -- A BLOCK checkout too, at /e2e-block-checkout/ (Order Bump block; ISSUES #7).
 * WooCommerce's own default Checkout block content, so the page renders as a
 * fresh store's block checkout would. Idempotent by slug. Created AFTER the
 * products, so a fresh stack keeps their ids 11–13 (data/products.ts). */
if ( class_exists( 'WC_Install' ) && ! get_page_by_path( 'e2e-block-checkout' ) ) {
	$block_content = new ReflectionMethod( 'WC_Install', 'get_checkout_block_content' );
	$block_content->setAccessible( true );
	wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'E2E Block Checkout',
			'post_name'    => 'e2e-block-checkout',
			'post_content' => $block_content->invoke( null ),
		)
	);
}

/* -- No BOGO / Order Bump records are seeded. ---------------------------------
 * Specs own them: create through the REST helpers (helpers/records.ts) and
 * delete what they made. A seeded offer would eat one of lite's two BOGO
 * slots, and the old "Buy C get C" seed is rejected by the current validator
 * (the offer product can't be a target product). */

if ( class_exists( 'WP_CLI' ) ) {
	WP_CLI::success( 'StoreGrowth E2E site provisioned (all modules active, products seeded, classic checkout).' );
}
