<?php
/**
 * The block cart, mini-cart and checkout script (ADR-015).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\StoreApi;

use Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface;
use StorePulse\StoreGrowth\Helper;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the script that shows StoreGrowth's labels, notices and rewards
 * bar in the block cart and checkout.
 *
 * @since 3.1.0
 */
class CartBlocksIntegration implements IntegrationInterface {

	/**
	 * Script handle.
	 *
	 * @since 3.1.0
	 */
	const HANDLE = 'storegrowth-cart-blocks';

	/**
	 * Integration name.
	 *
	 * @since 3.1.0
	 *
	 * @return string
	 */
	public function get_name(): string {
		return self::HANDLE;
	}

	/**
	 * Nothing to set up.
	 *
	 * @since 3.1.0
	 *
	 * @return void
	 */
	public function initialize() {
	}

	/**
	 * Script handles for the storefront.
	 *
	 * @since 3.1.0
	 *
	 * @return string[]
	 */
	public function get_script_handles(): array {
		return $this->register_script() ? [ self::HANDLE ] : [];
	}

	/**
	 * Script handles for the editor: the script only acts on the storefront.
	 *
	 * @since 3.1.0
	 *
	 * @return string[]
	 */
	public function get_editor_script_handles(): array {
		return [];
	}

	/**
	 * No data: everything comes with the Store API cart.
	 *
	 * @since 3.1.0
	 *
	 * @return array
	 */
	public function get_script_data(): array {
		return [];
	}

	/**
	 * Register the built script. Returns false when the build is missing, so
	 * the blocks render without it instead of failing on an unknown handle.
	 *
	 * @since 3.1.0
	 *
	 * @return bool
	 */
	private function register_script(): bool {
		if ( wp_script_is( self::HANDLE, 'registered' ) ) {
			return true;
		}

		$asset_file = Helper::get_plugin_path( 'build/cart-blocks.asset.php' );

		if ( ! file_exists( $asset_file ) ) {
			return false;
		}

		$asset = require $asset_file;

		return wp_register_script(
			self::HANDLE,
			Helper::get_plugin_url( 'build/cart-blocks.js' ),
			// The bundle reads these from `window` directly, so the build can't list them.
			array_merge( [ 'wc-blocks-checkout', 'wc-blocks-data-store', 'wp-data', 'wp-plugins' ], $asset['dependencies'] ),
			$asset['version'],
			true
		);
	}
}
