<?php
/**
 * Countdown Timer settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer;

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Countdown Timer settings page into the admin app, with the
 * storefront stylesheet its preview renders with (ADR-005 S10) and the
 * template colours and fonts from `Helper` (`window.spsgCountdownTimer`).
 * Fonts load on demand from the preview.
 *
 * Registered from the always-loaded ServiceProvider, so the page is there
 * right after the module is switched on in the app, without a reload.
 *
 * @since SPSG_VERSION
 */
class AdminPage implements HookRegistry {

	/**
	 * Register the hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ] );
	}

	/**
	 * Enqueue on the two app pages (the route is reachable from either).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $hook Admin page hook.
	 *
	 * @return void
	 */
	public function enqueue( $hook ): void {
		$id         = CountdownTimerModule::get_id();
		$asset_file = PluginHelper::get_modules_path( "{$id}/assets/js/admin.asset.php" );

		if ( ! in_array( $hook, [ 'storegrowth_page_spsg-settings', 'storegrowth_page_spsg-modules' ], true ) || ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script( "spsg-{$id}-admin", PluginHelper::get_modules_url( "{$id}/assets/js/admin.js" ), $asset['dependencies'], $asset['version'], true );

		// The template colours and font names the storefront uses, for the presets and preview.
		$data = [
			'templates' => array_map( [ Helper::class, 'template_colors' ], array_combine( array_keys( Helper::TEMPLATES ), array_keys( Helper::TEMPLATES ) ) ),
			'fonts'     => Helper::FONT_FAMILIES,
		];
		wp_add_inline_script( "spsg-{$id}-admin", 'window.spsgCountdownTimer = ' . wp_json_encode( $data ) . ';', 'before' );

		wp_enqueue_style(
			'spsg-cd-timer-custom-style',
			PluginHelper::get_modules_url( "{$id}/assets/scripts/wpbs-style.css" ),
			[],
			filemtime( PluginHelper::get_modules_path( "{$id}/assets/scripts/wpbs-style.css" ) )
		);
	}
}
