<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use StorePulse\StoreGrowth\Integrations\Dokan\Dashboard\Dashboard;
use StorePulse\StoreGrowth\Integrations\Dokan\Frontend\Frontend;
use StorePulse\StoreGrowth\Integrations\Dokan\Settings\BogoVendorSettings;
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
        if ( function_exists( 'dokan_is_seller_dashboard' ) ) {
            Dashboard::instance();
        }

        Ajax::instance();
        Frontend::instance();
        FlyCartFields::instance();
        CountdownTimerFields::instance();
        Api::instance();

        ( new BogoVendorRules() )->register_hooks();
        add_filter( 'spsg_settings_schemas', [ $this, 'add_settings_schemas' ] );
        add_filter( 'spsg_settings_page', [ BogoVendorSettings::class, 'add_link' ], 10, 2 );
    }

    /**
     * The BOGO vendor settings page (`#/settings?module=bogo-vendors`).
     *
     * @since SPSG_VERSION
     *
     * @param array $schemas Settings schemas.
     *
     * @return array
     */
    public function add_settings_schemas( $schemas ) {
        $schemas   = (array) $schemas;
        $schemas[] = new BogoVendorSettings();

        return $schemas;
    }
}
