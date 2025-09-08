<?php
/**
 * Enqueue class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles of scripts files inside this class.
 */
class Assets {

	use Singleton;

	/**
	 * Modules page slug.
	 *
	 * @var string
	 */
	private $modules_page_hook = 'storegrowth_page_spsg-modules';

	/**
	 * Module settings page slug.
	 *
	 * @var string
	 */
	private $settings_page_hook = 'storegrowth_page_spsg-settings';

	/**
	 * Constructor of Enqueue class.
	 */
	private function __construct() {
        add_action( 'init', array( $this, 'register_all_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 11 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_styles' ) );
	}

    /**
     * Register scripts here.
     *
     * @return void
     */
    public function register_all_scripts() {
        wp_register_script(
            'spsg-accounting',
            WC()->plugin_url() . '/assets/js/accounting/accounting.min.js',
            [ 'jquery' ]
        );

        // localize dokan frontend script
        wp_localize_script(
            'spsg-accounting',
            'spsg',
            apply_filters(
                'spsg_global_common_localized_args',
                array(
                    'currency' => array(
                        'precision' => wc_get_price_decimals(),
                        'symbol'    => html_entity_decode( get_woocommerce_currency_symbol() ),
                        'decimal'   => esc_attr( wc_get_price_decimal_separator() ),
                        'thousand'  => esc_attr( wc_get_price_thousand_separator() ),
                        'position'  => esc_attr( get_option( 'woocommerce_currency_pos' ) ),
                        'format'    => esc_attr( str_replace( [ '%1$s', '%2$s' ], [ '%s', '%v' ], get_woocommerce_price_format() ) ), // For accounting JS
                    ),
                )
            ),
        );
    }

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( $this->modules_page_hook === $hook ) {
			$settings_file = require Helper::get_plugin_path( 'assets/build/modules.asset.php' );

            $dependencies = array_merge( $settings_file['dependencies'], [ 'spsg-accounting' ] );
			wp_enqueue_script(
				'spsg-modules-script',
				Helper::get_plugin_assets_url( 'build/modules.js' ),
                $dependencies,
				$settings_file['version'],
				true
			);

			wp_localize_script(
				'spsg-modules-script',
				'spsgAdmin',
				array(
					'ajax_url' => admin_url( 'admin-ajax.php' ),
					'nonce'    => wp_create_nonce( 'spsg_ajax_nonce' ),
					'isPro'    => sp_store_growth()->has_pro(),
				)
			);
		}

		if ( $this->settings_page_hook === $hook ) {
			$settings_file = require Helper::get_plugin_path( 'assets/build/settings.asset.php' );

            $dependencies = array_merge( $settings_file['dependencies'], [ 'spsg-accounting' ] );
			wp_enqueue_script(
				'spsg-settings-script',
				Helper::get_plugin_assets_url( 'build/settings.js' ),
                $dependencies,
				$settings_file['version'],
				true
			);

			wp_localize_script(
				'spsg-settings-script',
				'spsgAdmin',
				array(
					'ajax_url'       => admin_url( 'admin-ajax.php' ),
					'nonce'          => wp_create_nonce( 'spsg_ajax_nonce' ),
					'isPro'          => sp_store_growth()->has_pro(),
					'currencySymbol' => get_woocommerce_currency_symbol(),
				)
			);
		}
	}

	/**
	 * Add CSS files to admin.
	 *
	 * @param string $hook page slug.
	 */
	public function admin_enqueue_styles( $hook ) {
		if (
			$this->modules_page_hook === $hook
			|| $this->settings_page_hook === $hook
		) {
			wp_enqueue_style(
				'spsg-admin-style',
				Helper::get_plugin_assets_url( 'build/modules.css' ),
				array(),
				filemtime( Helper::get_plugin_path( 'assets/build/modules.css' ) )
			);
		}
	}
}
