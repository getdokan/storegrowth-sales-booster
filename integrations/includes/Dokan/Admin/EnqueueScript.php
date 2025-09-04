<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan\Admin;

use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Helper;

/**
 * Admin EnqueueScript Class.
 *
 * @package SBFW
 */
class EnqueueScript {
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
        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ] );
    }

    /**
     * Enqueue Scripts for Dokan Admin.
     *
     * @since 1.12.0
     *
     */
    public function admin_enqueue_scripts() {
        $admin_file     = require Helper::get_plugin_path( 'integrations/assets/build/bogo-dokan-admin.asset.php' );
        $admin_file     = require Helper::get_plugin_path( 'integrations/assets/build/bogo-dokan-admin.asset.php' );
        $flycart_file   = require Helper::get_plugin_path( 'integrations/assets/build/dokan-fly-cart.asset.php' );
        $countdown_file = require Helper::get_plugin_path( 'integrations/assets/build/dokan-countdown-timer.asset.php' );

        if ( file_exists( Helper::get_plugin_path( 'integrations/assets/build/bogo-dokan-admin.js' ) ) ) {
            wp_enqueue_script(
                'spsg-bogo-dokan-admin',
                Helper::get_integrations_path( 'assets/build/bogo-dokan-admin.js' ),
                array_merge( $admin_file['dependencies'], [ 'spsg-bogo-admin-script' ] ),
                $admin_file['version'],
                true
            );
        }

        if ( file_exists( Helper::get_plugin_path( 'integrations/assets/build/dokan-fly-cart.js' ) ) ) {
            wp_enqueue_script(
                'spsg-dokan-fly-cart',
                Helper::get_integrations_path( 'assets/build/dokan-fly-cart.js' ),
                $flycart_file['dependencies'] ,
                $flycart_file['version'],
                true
            );
        }

        if ( file_exists( Helper::get_plugin_path( 'integrations/assets/build/dokan-countdown-timer.js' ) ) ) {
            wp_enqueue_script(
                'spsg-dokan-countdown-timer',
                Helper::get_integrations_path( 'assets/build/dokan-countdown-timer.js' ),
                $countdown_file['dependencies'] ,
                $countdown_file['version'],
                true
            );
        }
    }
}
