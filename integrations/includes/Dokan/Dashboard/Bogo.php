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
            'url'        => dokan_get_navigation_url( 'sales-booster/bogo' ),
            'pos'        => 10,
            'permission' => 'dokandar',
            'react_route' => 'sales-booster/bogo',
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

        wp_enqueue_script(
            'spsg-bogo-dokan-vendor-dashboard',
	        Helper::get_integrations_path( 'assets/build/bogo-dokan-dashboard.js' ),
            array_merge( $assets['dependencies'], [ 'dokan-react-components' ] ),
            $assets['version'],
            true
        );

        $admin_settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_dokan_vendors_settings', [] );

        wp_localize_script(
            'spsg-bogo-dokan-vendor-dashboard',
            'spsgBogoDokanVendorDashboard',
            [
                'is_pro_active'                               => sp_store_growth()->has_pro(),
                'vendors_can_create_buy_x_get_x'              => $admin_settings['vendors_can_create_buy_x_get_x'] ?? '',
                'vendors_can_schedule_offers'                 => $admin_settings['vendors_can_schedule_offers'] ?? '',
                'vendors_can_set_shop_page_custom_message'    => $admin_settings['vendors_can_set_shop_page_custom_message'] ?? '',
                'vendors_can_set_product_page_custom_message' => $admin_settings['vendors_can_set_product_page_custom_message'] ?? '',
            ]
        );
    }
}
