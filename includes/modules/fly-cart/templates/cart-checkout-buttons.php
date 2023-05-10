<?php
/**
 * Proceed to checkout button.
 *
 * @package SBFW
 */

?>
<div class="spsb-cart-widget-buttons">
	<a href="#" class="spsb-cart-widget-shooping-button spsb-cart-widget-close">
		<?php esc_html_e( 'Keep Shopping', 'spsb' ); ?>
	</a>

	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="spsb-cart-widget-checkout-button">
		<?php esc_html_e( 'Checkout', 'spsb' ); ?>
	</a>
</div>
