<?php
/**
 * The rewards bar on the cart page, the fly cart and the block mini-cart.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner;

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Settings\SettingsService;
use WC_Cart;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Prints the bar and adds it to the Store API cart (ADR-015). The top bar is
 * a separate surface and stays in `CommonHooks`.
 *
 * @since SPSG_VERSION
 */
class RewardsBar implements HookRegistry {

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// Fires on the cart page and in the fly cart's own template.
		add_action( 'woocommerce_before_cart_table', [ $this, 'render_classic_bar' ] );
		add_filter( 'render_block_woocommerce/mini-cart-footer-block', [ $this, 'add_bar_to_mini_cart' ] );
		add_filter( 'spsg_store_api_cart_data', [ $this, 'add_store_api_data' ], 10, 2 );
	}

	/**
	 * The bar's data for the current visitor and cart, or null.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array|null
	 */
	private function progress(): ?array {
		if (
			! WC()->cart
			|| ! PluginHelper::is_current_user_allowed_to_view_promotions()
			|| ! storegrowth_get_container()->get( SettingsService::class )->is_published( ProgressiveDiscountBannerModule::get_id() )
		) {
			return null;
		}

		return Milestones::progress( WC()->cart );
	}

	/**
	 * Print the bar in the classic cart or the fly cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function render_classic_bar(): void {
		$progress = $this->progress();
		$here     = is_cart() ? 'cart-page' : 'fly-cart';

		if ( ! $progress || ! in_array( $progress['placement'], [ $here, 'both' ], true ) ) {
			return;
		}

		include __DIR__ . '/../templates/rewards-bar.php';
	}

	/**
	 * Add the bar to the block mini-cart's footer, drawn from the same cart
	 * data the Store API returns, so WooCommerce keeps it current.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $content Block content.
	 *
	 * @return string
	 */
	public function add_bar_to_mini_cart( $content ) {
		$settings = Helper::get_settings();

		if ( ! Milestones::active( $settings ) || 'cart-page' === PluginHelper::find_option_settings( $settings, 'bar_placement', 'both' ) ) {
			return $content;
		}

		ob_start();
		include __DIR__ . '/../templates/rewards-bar-mini-cart.php';

		return ob_get_clean() . $content;
	}

	/**
	 * Add the bar's data to the Store API cart.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array   $data Cart data.
	 * @param WC_Cart $cart Cart.
	 *
	 * @return array
	 */
	public function add_store_api_data( $data, $cart ) {
		$data['rewards'] = $this->progress();

		return $data;
	}
}
