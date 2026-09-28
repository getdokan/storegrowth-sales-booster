<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Blocks;

use Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface;
use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBump;

class OrderBumpCheckoutIntegration implements IntegrationInterface {

	protected string $script_key = 'storegrowth-upsell-order-bump';

	public function get_name(): string {
		return 'storegrowth-upsell-order-bump';
	}

	public function initialize() {
		// TODO: Implement initialize() method.
	}

	public function get_script_handles(): array {
		return $this->register_script() ? [ $this->script_key ] : [];
	}

	public function get_editor_script_handles(): array {
		return $this->register_script() ? [ $this->script_key ] : [];
	}

	/**
	 * Register the block script built by webpack (`assets/js/blocks.js`).
	 *
	 * Returns false when the build is missing, so the cart and checkout
	 * blocks render without the bump instead of failing on a handle that
	 * doesn't exist.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool Whether the script is registered.
	 */
	protected function register_script(): bool {
		if ( wp_script_is( $this->script_key, 'registered' ) ) {
			return true;
		}

		$asset_file = $this->get_asset_file();

		if ( ! file_exists( $asset_file ) ) {
			return false;
		}

		$blocks = require $asset_file;

		return wp_register_script(
			$this->script_key,
			PluginHelper::get_modules_url( 'upsell-order-bump/assets/js/blocks.js' ),
			array_merge( [ 'wc-blocks-registry' ], $blocks['dependencies'] ),
			$blocks['version'],
			true
		);
	}

	/**
	 * Path of the block script's generated `.asset.php`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	protected function get_asset_file(): string {
		return PluginHelper::get_modules_path( 'upsell-order-bump/assets/js/blocks.asset.php' );
	}

	/**
	 * The bumps for the current cart, as the block draws them: the same
	 * offers, prices and texts as the classic checkout box
	 * (`OrderBump::get_checkout_offers()`), the prices already formatted by
	 * `wc_price()`, the design sanitized.
	 *
	 * @return array[]
	 */
	public function get_script_data(): array {
		if ( ! function_exists( 'WC' ) || empty( WC()->cart ) || WC()->cart->is_empty() ) {
			return [];
		}

		$fallback_image_url = PluginHelper::get_modules_url( 'upsell-order-bump/assets/images/bump-preview.svg' );
		$data               = [];

		// Only what the block reads (`order-bump-template.tsx`).
		foreach ( OrderBump::get_checkout_offers() as $offer ) {
			$data[] = [
				'id'                 => (int) $offer['bump']['id'],
				'design_settings'    => array_merge( $offer['design'], [ 'fallback_image_url' => $fallback_image_url ] ),
				'offer_label'        => $offer['offer_label'],
				'offer_product_id'   => $offer['cart_product_id'],
				'variation_id'       => $offer['variation_id'],
				'checked'            => $offer['checked'],
				'offer_price'        => $offer['offer_price_display'],
				'regular_price_html' => wc_price( $offer['regular_price_display'] ),
				'offer_price_html'   => wc_price( $offer['offer_price_display'] ),
				'is_purchasable'     => $offer['is_purchasable'],
			];
		}

		return $data;
	}
}
