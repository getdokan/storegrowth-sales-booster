<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan\Dashboard;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Traits\Singleton;

class EnqueueScript

{
    use Singleton;
    /**
     * Constructor of EnqueueScript Class.
     *
     * @since 1.12.0
     */
    public function __construct() {
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
        add_action( 'wp_enqueue_scripts', array( $this, 'dashboard_enqueue_scripts' ) );
    }

    /**
     * Enqueue Scripts for Dokan Admin.
     *
     * @since 1.12.0
     *
     */
    public function dashboard_enqueue_scripts() {
       // products  page
        $products_file = require Helper::get_plugin_path( 'integrations/assets/build/dokan-dashboard-products.asset.php' );
        if ( ! file_exists( Helper::get_plugin_path( 'integrations/assets/build/dokan-dashboard-products.js' ) ) ) {
            return;
        }

        wp_enqueue_style(
            'spsg-dokan-dashboard-products',
	        Helper::get_integrations_path( 'assets/build/dokan-dashboard-products.css' ),
            $products_file['dependencies'],
            $products_file['version']
        );
    }
}
