<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan\Dashboard;

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
		add_filter( 'spsg_bogo_product_args', [ $this, 'add_bogo_product_args' ] );
		add_filter( 'spsg_bogo_rest_query_filters', [ $this, 'add_bogo_rest_query_args' ] );
		add_filter( 'spsg_bogo_created_by', [ $this, 'add_bogo_created_by' ] );
		add_filter( 'spsg_bogo_check_permission', [ $this, 'check_bogo_permission' ] );
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
		// dokan_is_seller_dashboard is checked before this class init
		$settings = Helper::get_settings( 'spsg_bogo_dokan_vendors_settings', [] );

		if ( isset( $settings['vendors_can_create_buy_x_get_x'] ) && ! $settings['vendors_can_create_buy_x_get_x'] ) {
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
     * Enqueue Scripts for Dokan Vendor Dashbaord.
     *
     * @since 1.12.0
     *
     */
    public function vendor_dashboard_enqueue_scripts() {
        if ( ! dokan_is_seller_dashboard() ) {
            return;
        }

        $script_assets = Helper::get_plugin_path( 'integrations/assets/build/bogo-dokan-dashboard.asset.php' );

        if ( ! file_exists( $script_assets ) ) {
            return;
        }

        $assets = include $script_assets;

        wp_enqueue_style(
            'spsg-bogo-dokan-vendor-dashboard',
	        Helper::get_integrations_path( 'assets/build/bogo-dokan-dashboard.css' ),
            [],
            $assets['version'],
        );

        wp_enqueue_script(
            'spsg-bogo-dokan-vendor-dashboard',
	        Helper::get_integrations_path( 'assets/build/bogo-dokan-dashboard.js' ),
            array_merge( $assets['dependencies'], [ 'dokan-react-components' ] ),
            $assets['version'],
            true
        );
		$settings = Helper::get_settings( 'spsg_bogo_dokan_vendors_settings', [] );
		$is_enable = isset( $settings['vendors_can_create_buy_x_get_x'] ) && $settings['vendors_can_create_buy_x_get_x'];
        wp_localize_script(
            'spsg-bogo-dokan-vendor-dashboard',
            'spsgAdmin',
            [
                'ajax_url' => admin_url( 'admin-ajax.php' ),
                'nonce'    => wp_create_nonce( 'spsg_ajax_nonce' ),
                'isPro'    => sp_store_growth()->has_pro(),
				'buyXGetXEnableForVendor' => $is_enable,
            ]
        );
        $action    = 'spsg_protected';
        $ajd_nonce = wp_create_nonce( $action );

        $script = new \StorePulse\StoreGrowth\Modules\BoGo\EnqueueScript();

		$args = [
            'product_list_for_view' => $script->prodcut_list_for_view(),
            'category_list'         => $script->category_list(),
            'order_bogo_list'       => $script->order_bogo_list(),
		];

		wp_add_inline_script(
			'spsg-bogo-dokan-vendor-dashboard',
			'const bogo_products_and_categories = ' . wp_json_encode( $args ) . ';',
		);

        wp_localize_script(
            'spsg-bogo-dokan-vendor-dashboard',
            'bogo_save_url',
            [
                'ajax_url'     => admin_url( 'admin-ajax.php' ),
                'ajd_nonce'    => $ajd_nonce,
                'rest_nonce'   => wp_create_nonce( 'wp_rest' ),
                'image_folder' => Helper::get_modules_url( 'BoGo/assets/images' ),
            ]
        );
    }
}
