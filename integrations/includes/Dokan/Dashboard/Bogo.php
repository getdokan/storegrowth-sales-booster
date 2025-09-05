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
        add_filter( 'dokan_get_dashboard_nav', [ $this, 'add_bogo_submenu_on_dokan_vendor_dashboard' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'vendor_dashboard_enqueue_scripts' ] );
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
    public function add_bogo_submenu_on_dokan_vendor_dashboard( $menus ) {
        if ( ! dokan_is_seller_dashboard() ) {
            return $menus;
        }
        $menus['sales_booster']['submenu']['bogo'] = [
            'title'      => esc_html__( 'BOGO', 'storegrowth-sales-booster' ),
            'icon'       => '<i class="fa-solid fa-box"></i>',
            'url'        => dokan_get_navigation_url( '/bogo' ),
            'pos'        => 10,
            'permission' => 'dokandar',
            'react_route' => '/bogo',
        ];

        return $menus;
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
            array_merge( $assets['dependencies'], [ 'dokan-react-components'] ),
            $assets['version'],
            true
        );
        wp_localize_script(
            'spsg-bogo-dokan-vendor-dashboard',
            'spsgAdmin',
            array(
                'ajax_url' => admin_url( 'admin-ajax.php' ),
                'nonce'    => wp_create_nonce( 'spsg_ajax_nonce' ),
                'isPro'    => is_plugin_active( 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php' ),
            )
        );
        $action    = 'ajd_protected';
        $ajd_nonce = wp_create_nonce( $action );

        $script = new \StorePulse\StoreGrowth\Modules\BoGo\EnqueueScript();

        wp_localize_script(
            'spsg-bogo-dokan-vendor-dashboard',
            'bogo_products_and_categories',
            array(
                'product_list'          => $script->prodcut_list(),
                'product_list_for_view' => $script->prodcut_list_for_view(),
                'category_list'         => $script->category_list(),
                'order_bogo_list'       => $script->order_bogo_list(),
            )
        );

        wp_localize_script(
            'spsg-bogo-dokan-vendor-dashboard',
            'bogo_save_url',
            array(
                'ajax_url'     => admin_url( 'admin-ajax.php' ),
                'ajd_nonce'    => $ajd_nonce,
                'rest_nonce'   => wp_create_nonce( 'wp_rest' ),
                'image_folder' => Helper::get_modules_url( 'BoGo/assets/images' ),
            )
        );

        $admin_settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_dokan_vendors_settings', [] );

        wp_localize_script(
            'spsg-bogo-dokan-vendor-dashboard',
            'spsgBogoDokanVendorDashboard',
            [
                'is_pro_active'                               => is_plugin_active( 'storegrowth-sales-booster-pro/storegrowth-sales-booster-pro.php' ),
                'vendors_can_create_buy_x_get_x'              => $admin_settings['vendors_can_create_buy_x_get_x'] ?? '',
                'vendors_can_schedule_offers'                 => $admin_settings['vendors_can_schedule_offers'] ?? '',
                'vendors_can_set_shop_page_custom_message'    => $admin_settings['vendors_can_set_shop_page_custom_message'] ?? '',
                'vendors_can_set_product_page_custom_message' => $admin_settings['vendors_can_set_product_page_custom_message'] ?? '',
            ]
        );
    }
}
