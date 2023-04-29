<?php
/**
 * Proceed to checkout button.
 *
 * @package SBFW
 */

?>
<div class="sbfw-cart-widget-buttons">
	<a href="#" class="sbfw-cart-widget-shooping-button sbfw-cart-widget-close">
		<?php esc_html_e( 'Keep Shopping', 'sbfw' ); ?>
	</a>

	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="sbfw-cart-widget-checkout-button">
		<?php esc_html_e( 'Checkout', 'sbfw' ); ?>
	</a>
</div>
