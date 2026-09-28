<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan\Admin;

use StorePulse\StoreGrowth\Admin\AdminMenu;
use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\ModuleManager;

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
     * @param string $hook Current admin screen hook suffix.
     *
     * @return void
     */
    public function admin_enqueue_scripts( $hook = '' ) {
        // These bundles only extend the StoreGrowth settings SPA, so bail on
        // every other admin screen instead of shipping React plugin-wide.
        if ( AdminMenu::SCREEN_ID !== $hook ) {
            return;
        }

        $modules = new ModuleManager();

        if (
            $modules->is_active_module( 'countdown-timer' )
            && file_exists( Helper::get_plugin_path( 'integrations/assets/build/dokan-countdown-timer.js' ) )
        ) {
            $countdown_file = require Helper::get_plugin_path( 'integrations/assets/build/dokan-countdown-timer.asset.php' );

            wp_enqueue_script(
                'spsg-dokan-countdown-timer',
                Helper::get_integrations_path( 'assets/build/dokan-countdown-timer.js' ),
                $countdown_file['dependencies'],
                $countdown_file['version'],
                true
            );
        }
    }
}
