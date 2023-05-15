<?php
/**
 * Fly Cart Content
 *
 * This template is based on woocommerce/templates/cart/cart.php of version 3.8.0.
 * We have updated this template as we need.
 *
 * @package SBFW
 */

// phpcs:disable WooCommerce.Commenting.CommentHooks.MissingHookComment
// Show empty cart notice if cart is empty.
if ( WC()->cart->is_empty() ) {
	wc_get_template( 'cart/cart-empty.php' );
	return;
}

$settings             = get_option( 'storepulse_sales_booster_fly_cart_settings' );
$show_product_image   = storepulse_sales_booster_find_option_setting( $settings, 'show_product_image', true );
$show_remove_icon     = storepulse_sales_booster_find_option_setting( $settings, 'show_remove_icon', true );
$show_quantity_picker = storepulse_sales_booster_find_option_setting( $settings, 'show_quantity_picker', true );
$show_product_price   = storepulse_sales_booster_find_option_setting( $settings, 'show_product_price', true );
$show_coupon          = storepulse_sales_booster_find_option_setting( $settings, 'show_coupon', true );

do_action( 'woocommerce_before_cart' ); ?>

<form class="storepulse_sales_booster-woocommerce-cart-form" action="<?php echo esc_url( wc_get_cart_url() ); ?>" method="post">
	<?php do_action( 'woocommerce_before_cart_table' ); ?>

	<table class="storepulse_sales_booster-fly-cart-table" cellspacing="0">
		<tbody>
		<?php do_action( 'woocommerce_before_cart_contents' ); ?>

		<?php
		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$_product   = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
			$product_id = apply_filters( 'woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key );

			if ( $_product && $_product->exists() && $cart_item['quantity'] > 0 && apply_filters( 'woocommerce_cart_item_visible', true, $cart_item, $cart_item_key ) ) {
				$product_permalink = apply_filters( 'woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink( $cart_item ) : '', $cart_item, $cart_item_key );
				?>
				<tr class="woocommerce-cart-form__cart-item <?php echo esc_attr( apply_filters( 'woocommerce_cart_item_class', 'cart_item', $cart_item, $cart_item_key ) ); ?>">

					<?php if ( $show_remove_icon || $show_product_image ) : ?>
					<td class="product-thumbnail">
						<?php if ( $show_remove_icon ) : ?>
						<div class="product-remove">
							<?php
							echo apply_filters( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								'woocommerce_cart_item_remove_link',
								sprintf(
									'<a href="%s" class="storepulse_sales_booster-fly-cart-remove" aria-label="%s" data-product_id="%s" data-product_sku="%s">&times;</a>',
									esc_url( wc_get_cart_remove_url( $cart_item_key ) . '&' . storepulse_sales_booster_fast_cart_get_query_string_for_http_ajax_referer() ),
									esc_html__( 'Remove this item', 'storepulse-sales-booster' ),
									esc_attr( $product_id ),
									esc_attr( $_product->get_sku() )
								),
								$cart_item_key
							);
							?>
						</div>
							<?php
						endif;

						if ( $show_product_image ) {
							$thumbnail = apply_filters( 'woocommerce_cart_item_thumbnail', $_product->get_image(), $cart_item, $cart_item_key );

							if ( ! $product_permalink ) {
								echo $thumbnail; // phpcs:ignore
							} else {
								printf( '<a href="%s">%s</a>', esc_url( $product_permalink ), $thumbnail ); // phpcs:ignore
							}
						}
						?>
					</td>
					<?php endif; ?>

					<td class="product-name">
						<div class="storepulse_sales_booster-product-title">
							<?php
							if ( ! $product_permalink ) {
								echo wp_kses_post( apply_filters( 'woocommerce_cart_item_name', $_product->get_name(), $cart_item, $cart_item_key ) . '&nbsp;' );
							} else {
								echo wp_kses_post( apply_filters( 'woocommerce_cart_item_name', sprintf( '<a href="%s">%s</a>', esc_url( $product_permalink ), $_product->get_name() ), $cart_item, $cart_item_key ) );
							}

							?>
						</div>

						<?php if ( $show_quantity_picker ) : ?>
						<div class="product-quantity">
							<?php
							if ( $_product->is_sold_individually() ) {
								$product_quantity = sprintf( '<input type="hidden" name="cart[%s][qty]" value="1" />', $cart_item_key );
							} else {
								$product_quantity  = '<button type="button" class="storepulse_sales_booster-minus-icon">-</button>';
								$product_quantity .= woocommerce_quantity_input(
									array(
										'input_name'   => "cart[{$cart_item_key}][qty]",
										'input_value'  => $cart_item['quantity'],
										'max_value'    => $_product->get_max_purchase_quantity(),
										'min_value'    => '0',
										'product_name' => $_product->get_name(),
									),
									$_product,
									false
								);
								$product_quantity .= '<button type="button" class="storepulse_sales_booster-plus-icon">+</button>';
							}

							// phpcs:ignore
							echo apply_filters( 'woocommerce_cart_item_quantity', $product_quantity, $cart_item_key, $cart_item );
							?>
						</div>
						<?php endif; ?>
					</td>

					<?php if ( $show_product_price ) : ?>
					<td class="product-subtotal">
						<?php
						 	// phpcs:ignore
							echo apply_filters( 'woocommerce_cart_item_subtotal', WC()->cart->get_product_subtotal( $_product, $cart_item['quantity'] ), $cart_item, $cart_item_key );
						?>
					</td>
					<?php endif; ?>

				</tr>
				<?php
			}
		}
		?>

		<?php do_action( 'woocommerce_cart_contents' ); ?>

		<tr>
			<td colspan="6" class="actions">

				<?php
				if ( $show_coupon && wc_coupons_enabled() ) {
					do_action( 'storepulse_sales_booster_fly_cart_coupon' );
				}
				?>

				<input type="hidden" name="update_cart" value="Update cart">

				<?php do_action( 'woocommerce_cart_actions' ); ?>

				<?php wp_nonce_field( 'woocommerce-cart', 'woocommerce-cart-nonce', false ); ?>
				<input type="hidden" name="_wp_http_referer" value="<?php echo esc_attr( storepulse_sales_booster_fast_cart_get_query_string_for_http_ajax_referer( true ) ); ?>">
			</td>
		</tr>

		<?php do_action( 'woocommerce_after_cart_contents' ); ?>
		</tbody>
	</table>
	<?php do_action( 'woocommerce_after_cart_table' ); ?>
</form>

<?php do_action( 'storepulse_sales_booster_woocommerce_before_cart_collaterals' ); ?>

<div class="storepulse_sales_booster-cart-collaterals cart-collaterals">
	<?php
	/**
	 * Cart collaterals hook.
	 *
	 * @since 1.0.0
	 */
	do_action( 'woocommerce_cart_collaterals' );
	?>
</div>

<?php do_action( 'woocommerce_after_cart' ); ?>
