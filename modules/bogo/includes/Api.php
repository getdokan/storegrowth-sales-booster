<?php

namespace STOREGROWTH\SPSB\Modules\BoGo\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Modules\BoGo\Includes\REST\BogoController;

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
     */
    private function init_hooks() {
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
    }

    /**
     * Register REST API routes.
     */
    public function register_rest_routes() {
        $controller = new BogoController();
        $controller->register_routes();
    }
}
