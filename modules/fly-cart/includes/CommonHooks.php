<?php
/**
 * Common_Hooks class for Fly cart.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\FlyCart;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Miscellaneous hooks implementation.
 */
class CommonHooks implements HookRegistry {

    /**
     * Register Hooks.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public function register_hooks(): void {
		add_filter( 'woocommerce_add_to_cart_fragments', array( $this, 'woocommerce_add_to_cart_fragment' ) );

		add_action( 'wp_footer', array( $this, 'wp_footer' ) );

		add_action( 'spsg_woocommerce_before_cart_collaterals', array( $this, 'spsg_before_cart_collaterals' ) );
		add_action( 'spsg_woocommerce_before_cart_collaterals', array( $this, 'render_free_shipping_notice' ) );

		add_filter( 'template_include', array( $this, 'set_custom_checkout_template' ), 20 );
	}

	/**
	 * Render the free-shipping progress notice inside the FlyCart.
	 *
	 * Self-contained: the threshold comes from WooCommerce's own free-shipping
	 * methods, so FlyCart depends only on WooCommerce (core) and not on any other
	 * module. Gated by the `spsg_fly_cart_show_free_shipping_enabled` filter,
	 * which Pro toggles via the "Show Free Shipping Message" setting.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function render_free_shipping_notice() {
		/**
		 * Whether to show the FlyCart free-shipping notice. Defaults to false
		 * (off in the free plugin); Pro enables it from its setting.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param bool $enabled Whether the notice should be displayed.
		 */
		if ( ! apply_filters( 'spsg_fly_cart_show_free_shipping_enabled', false ) ) {
			return;
		}

		if ( ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) {
			return;
		}

		if ( ! \StorePulse\StoreGrowth\Helper::is_current_user_allowed_to_view_promotions() ) {
			return;
		}

		$threshold = $this->get_free_shipping_threshold();
		if ( $threshold <= 0 ) {
			// No min-amount free shipping configured — nothing to progress toward.
			return;
		}

		$cart_total = (float) WC()->cart->get_displayed_subtotal();

		if ( $cart_total >= $threshold ) {
			$message = __( 'You have unlocked free shipping!', 'storegrowth-sales-booster' );
		} else {
			$message = sprintf(
				/* translators: %s: remaining amount, formatted as a price. */
				__( 'Add %s more to get free shipping', 'storegrowth-sales-booster' ),
				wc_price( $threshold - $cart_total )
			);
		}
		?>
		<div class="spsg-fly-cart-free-shipping-notice">
			<span class="spsg-fly-cart-free-shipping-text">
				<?php echo wp_kses_post( $message ); ?>
			</span>
		</div>
		<?php
	}

	/**
	 * Lowest "min amount" across all enabled WooCommerce free-shipping methods.
	 *
	 * Scans every shipping zone (plus the "Rest of the World" zone) for enabled
	 * `free_shipping` methods that unlock on order amount alone, and returns the
	 * smallest threshold so the notice promises the closest achievable free
	 * shipping. Methods needing a coupon too (`requires = both`) are skipped, and
	 * 0 is returned when no amount-based free shipping is configured.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return float
	 */
	private function get_free_shipping_threshold() {
		if ( ! class_exists( '\WC_Shipping_Zones' ) ) {
			return 0;
		}

		$zone_ids   = wp_list_pluck( \WC_Shipping_Zones::get_zones(), 'zone_id' );
		$zone_ids[] = 0; // "Rest of the World" zone.

		$thresholds = array();
		foreach ( $zone_ids as $zone_id ) {
			$zone = \WC_Shipping_Zones::get_zone( $zone_id );
			if ( ! $zone ) {
				continue;
			}

			foreach ( $zone->get_shipping_methods( true ) as $method ) {
				if ( 'free_shipping' !== $method->id ) {
					continue;
				}

				$requires = $method->get_option( 'requires' );
				if ( ! in_array( $requires, array( 'min_amount', 'either' ), true ) ) {
					continue;
				}

				$min_amount = (float) $method->get_option( 'min_amount' );
				if ( $min_amount > 0 ) {
					$thresholds[] = $min_amount;
				}
			}
		}

		return empty( $thresholds ) ? 0 : min( $thresholds );
	}

	/**
	 * WooCommerce add-to-cart fragment.
	 */
	public function woocommerce_add_to_cart_fragment() {
			ob_start();
		?>
			<span class="wfc-cart-countlocation">
				<?php echo esc_html( wc()->cart->cart_contents_count ); ?>
			</span>
		<?php
			$fragments['span.wfc-cart-countlocation'] = ob_get_clean();

			return $fragments;
	}

	/**
	 * Frontend footer action hook.
	 */
	public function wp_footer() {
		// Don't show the widget in cart or checkout page.
		if ( is_checkout() || is_cart() ) {
			return;
		}

		$settings      = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_fly_cart_settings' );
		$icon_position = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'icon_position', 'bottom-right' );
		$icon_name     = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'icon_name', 'shopping-cart-icon-5' );

		include __DIR__ . '/../templates/fly-cart.php';
	}

	/**
	 * Hook woocommerce_before_cart_collaterals
	 */
	public function spsg_before_cart_collaterals() {
		remove_action( 'woocommerce_cart_collaterals', 'woocommerce_cross_sell_display' );
		remove_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );

		add_action( 'woocommerce_proceed_to_checkout', array( $this, 'button_proceed_to_checkout' ) );
	}

	/**
	 * Show checkout buttons in cart.
	 */
	public function button_proceed_to_checkout() {
		include __DIR__ . '/../templates/cart-checkout-buttons.php';
	}

	/**
	 * Set our own checkout template.
	 *
	 * @param string $template Template path.
	 *
	 * @return string
	 */
	public function set_custom_checkout_template( $template ) {
		// phpcs:ignore
		if ( ! is_checkout() || empty( $_GET['spsg-checkout'] ) ) {
			return $template;
		}

		show_admin_bar( false );

		return __DIR__ . '/../templates/fast-checkout.php';
	}
}
