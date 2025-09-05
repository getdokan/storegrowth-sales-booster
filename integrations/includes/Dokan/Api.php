<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Integrations\Dokan\REST\VendorBogoController;

defined( 'ABSPATH' ) || exit;

/**
 * Bogo Class.
 *
 * @package SBFW
 */
class Api {

    use Singleton;

    /**
     * Constructor of Bootstrap class.
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize hooks.
     *
     * @since 1.12.0
     *
     * @return void
     */
    private function init_hooks() {
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
    }

    /**
     * Register REST API routes.
     *
     * @since 1.12.0
     *
     * @return void
     */
    public function register_rest_routes() {
        $controller = new VendorBogoController();
        $controller->register_routes();
    }
}
