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
	 * Render the Free Shipping Rules progress notice inside the FlyCart.
	 *
	 * FlyCart triggers the render so the notice shows whenever its "Show Free
	 * Shipping Message" toggle is on — even when the Free Shipping Rules module is
	 * deactivated. The message text is still produced by that module's Helper
	 * (its class autoloads regardless of activation), so the logic is unchanged;
	 * only where it is triggered from moves.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function render_free_shipping_notice() {
		/**
		 * Whether the FlyCart free-shipping notice is enabled. Pro sets this from
		 * the "Show Free Shipping Message" setting; defaults off.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param bool $enabled Whether the notice should be displayed.
		 */
		if ( ! apply_filters( 'spsg_fly_cart_show_free_shipping_enabled', false ) ) {
			return;
		}

		if ( ! \StorePulse\StoreGrowth\Helper::is_current_user_allowed_to_view_promotions() ) {
			return;
		}

		$settings    = \StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Helper::get_settings();
		$banner_text = \StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Helper::get_banner_text( $settings );

		if ( empty( $banner_text ) ) {
			return;
		}
		?>
		<div class="spsg-fly-cart-free-shipping-notice">
			<span class="spsg-fly-cart-free-shipping-text">
				<?php echo wp_kses_post( $banner_text ); ?>
			</span>
		</div>
		<?php
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
