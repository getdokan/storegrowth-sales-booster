<?php

namespace STOREGROWTH\SPSB\Integrations\Dokan;

use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Integrations\Dokan\Admin\EnqueueScript as AdminEnqueueScript;
use STOREGROWTH\SPSB\Integrations\Dokan\Dashboard\Dashboard;
use STOREGROWTH\SPSB\Integrations\Dokan\Frontend\Frontend;

/**
 * Dokan Class.
 *
 * @package SBFW
 */
class Dokan {

    use Singleton;

    /**
     * Constructor of Dokan Class.
     *
     * @since 1.12.0
     */
    private function __construct() {
        add_action( 'dokan_loaded', [ $this, 'init_classes' ] );
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
