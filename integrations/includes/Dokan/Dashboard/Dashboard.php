<?php

namespace STOREGROWTH\SPSB\Integrations\Dokan\Dashboard;

use STOREGROWTH\SPSB\ModuleManager;
use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Modules;

/**
 * Dashboard Class.
 *
 * @package SBFW
 */
class Dashboard {

    use Singleton;

    /**
     * Constructor of Dashboard Class.
     *
     * @since 1.12.0
     */
    private function __construct() {
        $this->init_hooks();
        $this->init_classes();
    }

    /**
     * Initialize Classes.
     *
     * @since 1.12.0
     *
     * @return void
     */
    private function init_classes() {
	    // Initialize necessary classes instance for countdown timer module.
	    EnqueueScript::instance();

	    $modules = new ModuleManager();

        if ( $modules->is_active_module( 'bogo' ) ) {
            Bogo::instance();
        }
    }

    /**
     * Initialize Hooks.
     *
     * @since 1.12.0
     *
     * @return void
     */
    private function init_hooks() {
        add_filter( 'dokan_get_dashboard_nav', [ $this, 'add_menu_on_dokan_vendor_dashboard' ], 10, 1 );
        add_filter( 'dokan_query_var_filter', [ $this, 'add_endpoint_on_dokan_vendor_dashboard' ], 10, 1 );

        // Flush rewrite rules.
        add_action( 'woocommerce_flush_rewrite_rules', [ $this, 'flush_rewrite_rules' ] );

        // Remove promo banners from vendor dashboard.
        add_filter( 'sgsb_floating_bar_content_pro', [ $this, 'remove_sgsb_template_path_on_seller_dashboard' ], 99 );
        add_filter( 'free_shipping_bar_content_pro', [ $this, 'remove_sgsb_template_path_on_seller_dashboard' ], 99 );
        add_action( 'dokan_product_edit_after_inventory_variants' , [ $this, 'sgsb_add_product_countdown_timer_fields' ], 5, 2 );

        // Save countdown timer fields when product is saved
        add_action( 'dokan_process_product_meta', [ $this, 'sgsb_save_product_countdown_timer_fields' ], 10, 1 );
    }

    /**
     * Add Menu on Dokan Vendor Dashboard.
     *
     * @since 1.12.0
     *
     * @param array $menus Dashboard menus.
     *
     * @return array
     */
    public function add_menu_on_dokan_vendor_dashboard( $menus ) {
        if ( ! dokan_is_seller_dashboard() ) {
            return $menus;
        }

        $menus['sales_booster'] = [
            'title'      => __( 'SalesBooster', 'storegrowth-sales-booster' ),
            'icon'       => '<i class="fas fa-chart-line"></i>',
            'url'        => dokan_get_navigation_url( 'sales-booster' ),
            'pos'        => 199,
            'permission' => 'dokandar',
            'react_route' => 'sales-booster',
        ];

        return $menus;
    }

    /**
     * Add Endpoint to the Dokan Vendor Dashboard.
     *
     * @since 1.12.0
     *
     * @param array $query_var
     */
    public function add_endpoint_on_dokan_vendor_dashboard( $query_var ) {
        $query_var['sales-booster'] = 'sales-booster';

        return $query_var;
    }

    /**
     * Flush Rewrite Rules.
     *
     * @since 1.12.0
     *
     * @return void
     */
    public function flush_rewrite_rules() {
        add_filter( 'dokan_query_var_filter', [ $this, 'add_endpoint_on_dokan_vendor_dashboard' ] );
        dokan()->rewrite->register_rule();
        flush_rewrite_rules( true );
    }

    /**
     * Remove StoreGrowth Template Path on Dokan Seller Dashboard.
     *
     * @since 1.12.0
     *
     * @param string $template_patch Template path.
     *
     * @return string $template_patch
     */
    public function remove_sgsb_template_path_on_seller_dashboard( $template_patch ) {
        if ( dokan_is_seller_dashboard() ) {
            $template_patch = '';
        }

        return $template_patch;
    }

    /**
     * Add Product Countdown Timer Fields on Dokan Product Edit Page.
     *
     * @since 1.12.0
     *
     * @param object $post Post object.
     * @param int    $post_id Post ID.
     */
    public function sgsb_add_product_countdown_timer_fields( $post, $post_id ) {
        if ( ! dokan_is_seller_dashboard() ) {
            return;
        }

        // pass the post ID and product object to the template
        $product = wc_get_product( $post_id );
        $args = [
            'post_id'      => $post_id,
            'product'      => $product,
            'discount_key' => '_sgsb_countdown_timer_discount_amount',
            'start_key'    => '_sgsb_countdown_timer_discount_start',
            'end_key'      => '_sgsb_countdown_timer_discount_end',
        ];

        // Include the template file directly with variables in scope
        include STOREGROWTH_PLUGIN_DIR_PATH . '/Modules/countdown-timer/templates/dokan-countdown-timer-fields.php';
    }

    /**
     * Save countdown timer fields when a vendor saves a product.
     *
     * @since 1.12.0
     *
     * @param int $post_id Post ID.
     *
     * @return void
     */
    public function sgsb_save_product_countdown_timer_fields( $post_id ) {
        // Check if we have permission to save
        if ( ! current_user_can( 'dokan_edit_product', $post_id ) ) {
            return;
        }

        // Define the meta keys we want to save
        $meta_keys = [
            '_sgsb_countdown_timer_discount_amount',
            '_sgsb_countdown_timer_discount_start',
            '_sgsb_countdown_timer_discount_end',
        ];

        // Apply filter to allow customization of meta keys
        $meta_keys = apply_filters( 'sgsb_countdown_timer_meta_keys', $meta_keys, $post_id );

        // Loop through meta keys and save data
        foreach ( $meta_keys as $meta_key ) {
            if ( isset( $_POST[ $meta_key ] ) ) {
                $value = sanitize_text_field( wp_unslash( $_POST[ $meta_key ] ) );

                // Allow filtering of meta values before saving
                $value = apply_filters( 'sgsb_countdown_timer_meta_value', $value, $meta_key, $post_id );

                update_post_meta( $post_id, $meta_key, $value );
            } else {
                // If the field is not present in the form, delete the meta
                delete_post_meta( $post_id, $meta_key );
            }
        }

        // Action hook for after saving countdown timer fields
        do_action( 'sgsb_after_save_countdown_timer_fields', $post_id );
    }
}
