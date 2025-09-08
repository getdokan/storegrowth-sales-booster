<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use StorePulse\StoreGrowth\Integrations\Dokan\Admin\EnqueueScript as AdminEnqueueScript;
use StorePulse\StoreGrowth\Integrations\Dokan\Dashboard\Dashboard;
use StorePulse\StoreGrowth\Integrations\Dokan\Frontend\Frontend;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;

/**
 * Dokan Class.
 *
 * @package SBFW
 */
class Dokan implements HookRegistry {
    public function register_hooks(): void {
        $this->init_classes();
    }

    /**
     * Initialize Classes.
     *
     * @since 1.12.0
     *
     * @return void
     */
    public function init_classes() {
        if ( is_admin() ) {
            AdminEnqueueScript::instance();
        }

        if ( function_exists( 'dokan_is_seller_dashboard' ) ) {
            Dashboard::instance();
        }

        Ajax::instance();
        Frontend::instance();
        Api::instance();
    }
}
