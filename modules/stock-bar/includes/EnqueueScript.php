<?php
/**
 * Enqueue_Script class for `Stock Bar` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\StockBar;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Helper as PluginHelper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Countdown Timer` module inside this class.
 */
class EnqueueScript implements HookRegistry {
	use Singleton;

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'wp_enqueue_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * Add JS scripts to frontend.
	 *
	 * Enqueue CSS and JS for fly cart.
	 */
	public function wp_enqueue_scripts() {
		if ( ! is_product() && ! is_shop() ) {
			return;
		}

		wp_enqueue_style(
			'spsg-stock-cd-custom-style',
			PluginHelper::get_modules_url( 'stock-bar/assets/scripts/spsg-stockbar-style.css' ),
			array(),
			filemtime( PluginHelper::get_modules_path( 'stock-bar/assets/scripts/spsg-stockbar-style.css' ) )
		);

		wp_enqueue_script(
			'stockbar_jqmeter',
			PluginHelper::get_modules_url( 'stock-bar/assets/scripts/jqmeter.min.js' ),
			array( 'jquery' ),
			filemtime( PluginHelper::get_modules_path( 'stock-bar/assets/scripts/jqmeter.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'stockbar_custom_script',
			PluginHelper::get_modules_url( 'stock-bar/assets/scripts/spsg-stock-bar.js' ),
			array( 'jquery', 'stockbar_jqmeter' ),
			filemtime( PluginHelper::get_modules_path( 'stock-bar/assets/scripts/spsg-stock-bar.js' ) ),
			true
		);

		$this->inline_styles();
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook Page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( 'storegrowth_page_spsg-settings' !== $hook ) {
			return;
		}

		$settings_file = require PluginHelper::get_modules_path( 'stock-bar/assets/build/settings.asset.php' );

		wp_enqueue_script(
			'spsg-stock-bar-settings',
			PluginHelper::get_modules_url( 'stock-bar/assets/build/settings.js' ),
			$settings_file['dependencies'],
			$settings_file['version'],
			false
		);
	}

	/**
	 * All inline styles
	 */
	private function inline_styles() {
		// Get settings options.
		$settings = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_stock_bar_settings' );

		$bar_height   = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'stockbar_height', '10' );
		$bg_color     = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'stockbar_bg_color', '#e7efff' );
		$fg_color     = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'stockbar_fg_color', '#0875ff' );
		$border_color = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'stockbar_border_color', '#dde6f9' );

		$theme               = wp_get_theme();
		$is_twenty_one_theme = ! empty( $theme->name ) ? $theme->name === 'Twenty Twenty-One' : false;

		$custom_css = "
			.spsg-stock-progress-bar-section {
				border: 2px solid {$border_color};
			}
			.spsg-stock-progress {
				height: {$bar_height}px;
				background: {$fg_color};
			}
			.spsg-stock-progress-bar {
				background-color: {$bg_color};
			}
		";

		if ( $is_twenty_one_theme ) {
			$custom_css .= '
                .spsg-stock-counter-and-bar {
                    margin-top: 18px;
                }
            ';
		}

		wp_add_inline_style( 'spsg-stock-cd-custom-style', $custom_css );
	}
}
