<?php
/**
 * Proceed to checkout button.
 *
 * @package SBFW
 */

?>
<div class="spsg-cart-widget-buttons">
	<a href="#" class="spsg-cart-widget-shooping-button spsg-cart-widget-close">
		<?php esc_html_e( 'Keep Shopping', 'storegrowth-sales-booster' ); ?>
	</a>

	<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="spsg-cart-widget-checkout-button">
		<?php esc_html_e( 'Checkout', 'storegrowth-sales-booster' ); ?>
	</a>
</div>
