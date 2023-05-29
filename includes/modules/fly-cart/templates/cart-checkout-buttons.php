<?php
/**
 * Proceed to checkout button.
 *
 * @package SBFW
 */

?>
<div class="sgsb-cart-widget-buttons">
	<a href="#" class="sgsb-cart-widget-shooping-button sgsb-cart-widget-close">
		<?php esc_html_e( 'Keep Shopping', 'storegrowth-sales-booster' ); ?>
	</a>

	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="sgsb-cart-widget-checkout-button">
		<?php esc_html_e( 'Checkout', 'storegrowth-sales-booster' ); ?>
	</a>
</div>
