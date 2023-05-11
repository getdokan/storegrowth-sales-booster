<?php
/**
 * Proceed to checkout button.
 *
 * @package SBFW
 */

?>
<div class="storepulse_sales_booster-cart-widget-buttons">
	<a href="#" class="storepulse_sales_booster-cart-widget-shooping-button storepulse_sales_booster-cart-widget-close">
		<?php esc_html_e( 'Keep Shopping', 'storepulse_sales_booster' ); ?>
	</a>

	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="storepulse_sales_booster-cart-widget-checkout-button">
		<?php esc_html_e( 'Checkout', 'storepulse_sales_booster' ); ?>
	</a>
</div>
