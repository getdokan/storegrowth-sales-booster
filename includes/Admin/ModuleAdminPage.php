<?php
/**
 * Base for a module's settings page assets.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Admin;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * Loads a module's settings page bundle (`modules/<id>/assets/js/admin.js`)
 * into the admin app, with the storefront stylesheets its preview renders
 * with (ADR-005 S10) and any data the page reads from PHP.
 *
 * Register the subclass from the module's always-loaded ServiceProvider, so
 * the page is there right after the module is switched on in the app.
 *
 * @since SPSG_VERSION
 */
abstract class ModuleAdminPage implements HookRegistry {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	abstract protected function module_id(): string;

	/**
	 * Storefront stylesheets the preview needs: handle → path from the
	 * plugin root, e.g. `modules/stock-bar/assets/scripts/spsg-stockbar-style.css`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, string>
	 */
	protected function stylesheets(): array {
		return [];
	}

	/**
	 * Data for the page: JS global name → value (localized on the bundle).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array>
	 */
	protected function data(): array {
		return [];
	}

	/**
	 * Whether the page picks files from the media library (`wp.media`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	protected function uses_media(): bool {
		return false;
	}

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
	 * Enqueue on the app page.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $hook Admin page hook.
	 *
	 * @return void
	 */
	public function enqueue( $hook ): void {
		$id         = $this->module_id();
		$asset_file = Helper::get_modules_path( "{$id}/assets/js/admin.asset.php" );

		if ( AdminMenu::SCREEN_ID !== $hook || ! file_exists( $asset_file ) ) {
			return;
		}

		$asset  = require $asset_file;
		$handle = "spsg-{$id}-admin";

		wp_enqueue_script( $handle, Helper::get_modules_url( "{$id}/assets/js/admin.js" ), $asset['dependencies'], $asset['version'], true );

		foreach ( $this->data() as $name => $value ) {
			wp_localize_script( $handle, $name, $value );
		}

		foreach ( $this->stylesheets() as $style => $path ) {
			wp_enqueue_style( $style, Helper::get_plugin_url( $path ), [], filemtime( Helper::get_plugin_path( $path ) ) );
		}

		if ( $this->uses_media() ) {
			wp_enqueue_media();
		}
	}
}
