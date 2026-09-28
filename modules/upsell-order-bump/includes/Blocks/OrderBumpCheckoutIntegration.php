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

		foreach ( OrderBump::get_checkout_offers() as $offer ) {
			$product = $offer['product'];

			if ( ! $product->is_purchasable() ) {
				continue;
			}

			// A variation is sent as its parent plus its own id.
			$is_variation = $product->is_type( 'variation' );

			$data[] = array_merge(
				$offer['bump'],
				$offer['design'],
				[
					'design_settings'    => array_merge( $offer['design'], [ 'fallback_image_url' => $fallback_image_url ] ),
					'bump_type'          => $offer['bump']['target_type'],
					'offer_product_id'   => $is_variation ? $product->get_parent_id() : $product->get_id(),
					'variation_id'       => $is_variation ? $product->get_id() : 0,
					'checked'            => $offer['checked'],
					'offer_label'        => $offer['offer_label'],
					'regular_price'      => $offer['regular_price'],
					'offer_price'        => $offer['offer_price'],
					'regular_price_html' => wc_price( $offer['regular_price'] ),
					'offer_price_html'   => wc_price( $offer['offer_price'] ),
					'currency_symbol'    => html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8' ),
					'category_names'     => [],
					'is_purchasable'     => $offer['is_purchasable'],
				]
			);
		}

		return $data;
	}
}
