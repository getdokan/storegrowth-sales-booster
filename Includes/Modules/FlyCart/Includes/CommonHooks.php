<?php
/**
 * Common_Hooks class for Fly cart.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\FlyCart\Includes;

use STOREGROWTH\SPSB\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Miscellaneous hooks implementation.
 */
class CommonHooks {

	use Singleton;

	/**
	 * Constructor of Enqueue class.
	 */
	private function __construct() {
		add_filter( 'woocommerce_add_to_cart_fragments', array( $this, 'woocommerce_add_to_cart_fragment' ) );

		add_action( 'wp_footer', array( $this, 'wp_footer' ) );

		add_action( 'sgsb_woocommerce_before_cart_collaterals', array( $this, 'sgsb_before_cart_collaterals' ) );

		add_filter( 'template_include', array( $this, 'set_custom_checkout_template' ), 20 );
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

		$settings      = get_option( 'sgsb_fly_cart_settings' );
		$icon_position = sgsb_find_option_setting( $settings, 'icon_position', 'bottom-right' );
		$icon_name     = sgsb_find_option_setting( $settings, 'icon_name', 'shopping-cart-icon-5' );

		include __DIR__ . '/../templates/fly-cart.php';
	}

	/**
	 * Hook woocommerce_before_cart_collaterals
	 */
	public function sgsb_before_cart_collaterals() {
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
		if ( ! is_checkout() || empty( $_GET['sgsb-checkout'] ) ) {
			return $template;
		}

		show_admin_bar( false );

		return __DIR__ . '/../templates/fast-checkout.php';
	}
}
