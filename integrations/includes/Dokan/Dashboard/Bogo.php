<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan\Dashboard;

use StorePulse\StoreGrowth\Assets;
use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Traits\Singleton;

/**
 * Dashboard Bogo Class.
 *
 * @package SBFW
 */
class Bogo {

    use Singleton;

	/**
	 * The dashboard bundle (`integrations/dokan/bogo` in webpack-entries.js),
	 * relative to the plugin folder, without extension.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	const BUNDLE = 'build/integrations/dokan/bogo';

    /**
     * Constructor of Bogo Class.
     *
     * @since 1.12.0
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize Hooks.
     *
     * @since 1.12.0
     *
     * @return void
     */
    private function init_hooks() {
        add_filter( 'dokan_get_dashboard_nav', [ $this, 'add_nav_menu' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'vendor_dashboard_enqueue_scripts' ] );
		// Kept for compatibility: `spsg_bogo_product_args` hasn't fired since
		// 2.0.2; vendor product search is scoped by `spsg_product_query_args`.
		add_filter( 'spsg_bogo_product_args', [ $this, 'add_bogo_product_args' ] );
		add_filter( 'spsg_bogo_rest_query_filters', [ $this, 'add_bogo_rest_query_args' ] );
		add_filter( 'spsg_bogo_created_by', [ $this, 'add_bogo_created_by' ] );
		add_filter( 'spsg_bogo_check_permission', [ $this, 'check_bogo_permission' ] );
		add_filter( 'spsg_bogo_single_item_permission', [ $this, 'check_bogo_single_item_permission' ], 10, 3 );
		add_filter( 'spsg_product_query_args', [ $this, 'add_product_query_args' ], 10, 2 );
    }

	public function add_product_query_args ( $args, $request ) {
		if ( ! current_user_can( 'manage_woocommerce' ) && function_exists('dokan_get_current_user_id') ) {
			$args['author'] = dokan_get_current_user_id();
		}
		return $args;
	}

    /**
     * Add BOGO Sub-menu on Dokan Vendor Dashboard.
     *
     * @since 1.12.0
     *
     * @param array $menus Dashboard menus.
     *
     * @return array
     */
    public function add_nav_menu( $menus ): array {
		// dokan_is_seller_dashboard is checked before this class init.
		// The menu shows whatever `vendors_can_create_buy_x_get_x` is (it
		// hid the menu when off; it only gates Buy X Get X offers), but only
		// with the dashboard bundle, or its route would be blank.
		if ( ! file_exists( Helper::get_plugin_path( self::BUNDLE . '.asset.php' ) ) ) {
			return $menus;
		}

        $menus['bogo'] = [
            'title'      => esc_html__( 'BOGO', 'storegrowth-sales-booster' ),
            'icon'       => '<i class="fa-solid fa-box"></i>',
            'icon_name'  => 'PackagePlus',
            'url'        => dokan_get_navigation_url( '/bogo' ),
            'pos'        => 10,
            'permission' => 'dokandar',
            'react_route' => 'bogo',
        ];

        return $menus;
    }

	public function add_bogo_product_args( $args ): array {
		if ( ! dokan_is_seller_dashboard() ) {
            return $args;
        }

		$args['author'] = dokan_get_current_user_id();

		return $args;
	}
	public function add_bogo_rest_query_args( $args ): array {
		if ( ! current_user_can('manage_options') ) {
            $args['created_by'] = dokan_get_current_user_id();
        }

		return $args;
	}

	public function add_bogo_created_by( $user_id ) {
		if ( ! current_user_can('manage_options') ) {
			return dokan_get_current_user_id();
		}
		return $user_id;
	}

	public function check_bogo_permission( $has_permission ) {
		if ( ! current_user_can('manage_options') ) {
            return current_user_can( 'dokandar' );
        }
		return $has_permission;
	}

	/**
	 * Restrict a vendor to BOGO offers they own.
	 *
	 * `check_bogo_permission()` opens the admin-scoped BOGO routes to every
	 * `dokandar` user, because the vendor dashboard lists offers through
	 * `GET /bogo/offers`. That grant is capability-wide and carries no notion of
	 * ownership, so without this filter a vendor could address a single-offer
	 * route with another vendor's offer ID and read, edit, disable or delete it.
	 *
	 * Mirrors `VendorBogoController::check_single_item_permission()`, which
	 * already enforces the same rule on the vendor-scoped mirror routes.
	 *
	 * @since 2.2.0
	 *
	 * @param bool|\WP_Error   $has_permission Permission resolved so far.
	 * @param array            $item           The BOGO offer being addressed.
	 * @param \WP_REST_Request $request        Rest request.
	 *
	 * @return bool|\WP_Error True when permitted, WP_Error otherwise.
	 */
	public function check_bogo_single_item_permission( $has_permission, $item, $request ) {
		// Administrators keep whatever the core controller resolved.
		if ( current_user_can( 'manage_options' ) ) {
			return $has_permission;
		}

		if ( ! is_array( $item ) || ! isset( $item['created_by'] ) || (int) $item['created_by'] !== dokan_get_current_user_id() ) {
			return new \WP_Error(
				'salesbooster_permission_failure',
				__( 'You do not have permission to access this BOGO offer.', 'storegrowth-sales-booster' ),
				[ 'status' => 403 ]
			);
		}

		return $has_permission;
	}

    /**
     * Enqueue Scripts for Dokan Vendor Dashbaord.
     *
     * @since 1.12.0
     *
     */
    public function vendor_dashboard_enqueue_scripts() {
		global $wp;

		// Only Dokan's React dashboard (`/dashboard/new/`, as Dokan's own
		// `NewDashboard` checks), and only for a vendor: not the legacy
		// dashboard pages or other visitors.
		if ( ! dokan_is_seller_dashboard() || ! isset( $wp->query_vars['new'] ) || ! current_user_can( 'dokandar' ) ) {
			return;
		}

		$asset_file = Helper::get_plugin_path( self::BUNDLE . '.asset.php' );

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		// The bundle draws the admin's list and editor (ADR-011): the shared
		// bundles and the Tailwind stylesheet, registered for wp-admin only.
		Assets::instance()->register_shared_bundles();

		wp_enqueue_script(
			'spsg-bogo-dokan-vendor-dashboard',
			Helper::get_plugin_url( self::BUNDLE . '.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
		wp_set_script_translations( 'spsg-bogo-dokan-vendor-dashboard', 'storegrowth-sales-booster', Helper::get_plugin_path( 'languages' ) );

		// Only what the shared code reads, under the admin's global names;
		// never the admin data (modules) or the admin ajax nonce
		// (`spsg_ajax_nonce`, which the privileged settings handlers accept).
		// The REST nonce and root come from `wp-api-fetch` itself.
		foreach ( self::get_script_data() as $name => $data ) {
			wp_localize_script( 'spsg-bogo-dokan-vendor-dashboard', $name, $data );
		}

		// Tailwind after Dokan's own (both apply inside `.dokan-layout`; the
		// later one wins), scoped to `.spsg-layout` (ADR-003, ADR-011).
		$styles = array_merge(
			array_values( array_filter( [ 'dokan-tailwind', 'dokan-react-components' ], [ wp_styles(), 'query' ] ) ),
			[ 'spsg-font-inter', 'spsg-tailwind' ]
		);

		// An alias handle (no file of its own): `wp_enqueue_style()` doesn't
		// register a handle without a source, so register it first.
		wp_register_style( 'spsg-bogo-dokan-vendor-dashboard', false, $styles, $asset['version'] );
		wp_enqueue_style( 'spsg-bogo-dokan-vendor-dashboard' );
	}

	/**
	 * Data localized for the dashboard bundle: the subset of the admin's
	 * `spsgAdmin` / `spsgAdminHeader` that the list, the editor and the shared
	 * bundles read on the vendor dashboard (REST namespace, pro flag, asset
	 * URL; no upgrade URL: vendor mode shows no Upgrade button).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array> Keyed by global name.
	 */
	public static function get_script_data(): array {
		$is_pro = sp_store_growth()->has_pro();

		return [
			'spsgAdmin'       => [
				'restNamespace' => 'sales-booster/v1',
				'isPro'         => $is_pro,
			],
			'spsgAdminHeader' => [
				'assets_url'  => Helper::get_plugin_url( 'assets/' ),
				'header_info' => [
					'is_pro_exists' => $is_pro,
				],
			],
		];
	}
}
