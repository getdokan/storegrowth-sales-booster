<?php

namespace STOREGROWTH\SPSB\Integrations;

use STOREGROWTH\SPSB\Traits\Singleton;
use STOREGROWTH\SPSB\Integrations\Dokan\Dokan;

/**
 * Integrations Class.
 *
 * @package SGSBP
 */
class Integrations {

    use Singleton;

    /**
     * Array of Integration Classes.
     *
     * @var array
     */
    private $integrations = [];

    /**
     * Constructor of Integration Class.
     *
     * @since 1.12.0
     */
    private function __construct() {
        $this->init_integrations();
    }

    /**
     * Initialize Integration Classes.
     *
     * @since 1.12.0
     *
     * @return void
     */
    private function init_integrations() {
        $this->integrations['dokan'] = Dokan::instance();
    }

    /**
     * Get Integration Instance.
     *
     * @since 1.12.0
     *
     * @param string $integration Integration name.
     *
     * @return object|false
     */
    public function get_integration( $integration ) {
        return isset( $this->integrations[ $integration ] ) ? $this->integrations[ $integration ] : false;
    }
}
