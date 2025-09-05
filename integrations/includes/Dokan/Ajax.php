<?php

namespace StorePulse\StoreGrowth\Integrations\Dokan;

use StorePulse\StoreGrowth\Traits\Singleton;

defined( 'ABSPATH' ) || exit;

/**
 * Ajax Class.
 *
 * @package SBFW
 */
class Ajax {

    use Singleton;

    /**
     * Constructor of Ajax Class.
     *
     * @since 1.12.0
     */
    private function __construct() {
	    add_action( 'wp_ajax_spsg_bogo_vendors_get_settings', [ $this, 'get_settings' ] );
        add_action( 'wp_ajax_spsg_bogo_vendors_save_settings', [ $this, 'save_settings' ] );
    }

    /**
     * Initialize Classes.
     *
     * @since 1.12.0
     *
     * @return void
     */
    public function save_settings() {
        check_ajax_referer( 'spsg_ajax_nonce' );

        if ( ! isset( $_POST['data'] ) ) {
            wp_send_json_error();
        }

        // Decode the JSON data.
        $data = isset( $_POST['data'] ) ? json_decode( wp_unslash( $_POST['data'] ), true ) : []; // phpcs: ignore.

        if ( isset( $data['spsg_bogo_dokan_vendors_settings_data'] ) ) {
            $vendors_settings_data = $data['spsg_bogo_dokan_vendors_settings_data'];

            update_option( 'spsg_bogo_dokan_vendors_settings', $vendors_settings_data );
            wp_send_json_success( maybe_unserialize( \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_dokan_vendors_settings' ) ) );
        }
    }

    /**
     * Initialize Classes.
     *
     * @since 1.12.0
     *
     * @return void
     */
    public function get_settings() {
        check_ajax_referer( 'spsg_ajax_nonce' );

        $form_data = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_bogo_dokan_vendors_settings', [] );

        wp_send_json_success( $form_data );
    }
}
