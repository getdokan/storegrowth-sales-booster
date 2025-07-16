<?php
/**
 * Fly Cart Content
 *
 * This template is based on woocommerce/templates/cart/cart.php of version 3.8.0.
 * We have updated this template as we need.
 *
 * @package SBFW
 */

use STOREGROWTH\SPSB\Modules\FlyCart\Includes\Helper;

// phpcs:disable WooCommerce.Commenting.CommentHooks.MissingHookComment
// Show empty cart notice if cart is empty.
if ( WC()->cart->is_empty() ) {
	wc_get_template( 'cart/cart-empty.php' );
	return;
}

$settings             = get_option( 'sgsb_fly_cart_settings' );
$show_product_image   = sgsb_find_option_setting( $settings, 'show_product_image', true );
$show_remove_icon     = sgsb_find_option_setting( $settings, 'show_remove_icon', true );
$show_quantity_picker = sgsb_find_option_setting( $settings, 'show_quantity_picker', true );
$show_product_price   = sgsb_find_option_setting( $settings, 'show_product_price', true );
$show_coupon          = sgsb_find_option_setting( $settings, 'show_coupon', true );
?>

<form class="sgsb-woocommerce-cart-form" action="<?php echo esc_url( wc_get_cart_url() ); ?>" method="post">
	<div class="sgsb-cart-notification-popup">
		<div class="sgsb-cart-notification-content">
		<span class="sgsb-cart-notification-message">Stock limit reached</span>
		</div>
	</div>
	<?php do_action( 'woocommerce_before_cart_table' ); ?>

	<table class="sgsb-fly-cart-table" cellspacing="0">
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
							<?php


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
						<div class="sgsb-product-detail-container">
						<div class="sgsb-product-title">
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
										$input_args = array(
											'input_name'   => "cart[{$cart_item_key}][qty]",
											'input_value'  => $cart_item['quantity'],
											'max_value'    => $_product->get_max_purchase_quantity(),
											'min_value'    => '1',
											'product_name' => $_product->get_name(),
										);

										if ( isset( $cart_item['bogo_offer_price'] ) ) {
												$product_quantity = woocommerce_quantity_input( $input_args, $_product, false );
										} else {
												$product_quantity  = '<button type="button" class="sgsb-minus-icon">-</button>';
												$product_quantity .= woocommerce_quantity_input( $input_args, $_product, false );
												$product_quantity .= '<button type="button" class="sgsb-plus-icon">+</button>';
										}
								}
							// phpcs:ignore
							echo apply_filters( 'woocommerce_cart_item_quantity', $product_quantity, $cart_item_key, $cart_item );
								?>
						</div>
						</div>
							<div class="sgsb-product-detail-container">

								<?php if ( $show_product_price ) : ?>
							<div class="product-subtotal" >
									<?php
									if ( isset( $cart_item['bogo_offer_price'] ) ) {
										$offer_price = floatval( $cart_item['bogo_offer_price'] );
										$quantity    = intval( $cart_item['quantity'] );
										$sub_total   = wc_price( $offer_price * $quantity );
									} else {
										$sub_total = WC()->cart->get_product_subtotal( $_product, $cart_item['quantity'] );
									}

						 	// phpcs:ignore
							echo apply_filters( 'woocommerce_cart_item_subtotal', $sub_total, $cart_item, $cart_item_key );
									?>
							</div>
							<?php endif; ?>
						<?php endif; ?>
							<?php if ( $show_remove_icon ) : ?>
						<div class="product-remove">
								<?php
								echo apply_filters( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									'woocommerce_cart_item_remove_link',
									sprintf(
										'<a href="%s" class="sgsb-fly-cart-remove" aria-label="%s" data-product_id="%s" data-product_sku="%s">
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                            <path
                                                fill="#073B4C"
                                                d="M8.33329 4.16667H11.6666C11.6666 3.72464 11.491 3.30072 11.1785 2.98816C10.8659 2.67559 10.442 2.5 9.99996 2.5C9.55793 2.5 9.13401 2.67559 8.82145 2.98816C8.50889 3.30072 8.33329 3.72464 8.33329 4.16667ZM7.08329 4.16667C7.08329 3.78364 7.15873 3.40437 7.30531 3.05051C7.45189 2.69664 7.66673 2.37511 7.93756 2.10427C8.2084 1.83343 8.52993 1.61859 8.8838 1.47202C9.23767 1.32544 9.61694 1.25 9.99996 1.25C10.383 1.25 10.7623 1.32544 11.1161 1.47202C11.47 1.61859 11.7915 1.83343 12.0624 2.10427C12.3332 2.37511 12.548 2.69664 12.6946 3.05051C12.8412 3.40437 12.9166 3.78364 12.9166 4.16667H17.7083C17.8741 4.16667 18.033 4.23251 18.1502 4.34973C18.2674 4.46694 18.3333 4.62591 18.3333 4.79167C18.3333 4.95743 18.2674 5.1164 18.1502 5.23361C18.033 5.35082 17.8741 5.41667 17.7083 5.41667H16.6083L15.6333 15.5092C15.5585 16.2825 15.1983 17.0002 14.623 17.5224C14.0477 18.0445 13.2985 18.3336 12.5216 18.3333H7.47829C6.70151 18.3334 5.95254 18.0442 5.37742 17.5221C4.80229 16.9999 4.44224 16.2823 4.36746 15.5092L3.39163 5.41667H2.29163C2.12587 5.41667 1.96689 5.35082 1.84968 5.23361C1.73247 5.1164 1.66663 4.95743 1.66663 4.79167C1.66663 4.62591 1.73247 4.46694 1.84968 4.34973C1.96689 4.23251 2.12587 4.16667 2.29163 4.16667H7.08329ZM8.74996 8.125C8.74996 7.95924 8.68411 7.80027 8.5669 7.68306C8.44969 7.56585 8.29072 7.5 8.12496 7.5C7.9592 7.5 7.80023 7.56585 7.68302 7.68306C7.56581 7.80027 7.49996 7.95924 7.49996 8.125V14.375C7.49996 14.5408 7.56581 14.6997 7.68302 14.8169C7.80023 14.9342 7.9592 15 8.12496 15C8.29072 15 8.44969 14.9342 8.5669 14.8169C8.68411 14.6997 8.74996 14.5408 8.74996 14.375V8.125ZM11.875 7.5C12.0407 7.5 12.1997 7.56585 12.3169 7.68306C12.4341 7.80027 12.5 7.95924 12.5 8.125V14.375C12.5 14.5408 12.4341 14.6997 12.3169 14.8169C12.1997 14.9342 12.0407 15 11.875 15C11.7092 15 11.5502 14.9342 11.433 14.8169C11.3158 14.6997 11.25 14.5408 11.25 14.375V8.125C11.25 7.95924 11.3158 7.80027 11.433 7.68306C11.5502 7.56585 11.7092 7.5 11.875 7.5ZM5.61163 15.3892C5.65657 15.853 5.87266 16.2835 6.21777 16.5968C6.56287 16.91 7.01225 17.0834 7.47829 17.0833H12.5216C12.9877 17.0834 13.437 16.91 13.7822 16.5968C14.1273 16.2835 14.3433 15.853 14.3883 15.3892L15.3533 5.41667H4.64663L5.61163 15.3892Z"
                                            />
                                        </svg>
                                    </a>',
										esc_url( wc_get_cart_remove_url( $cart_item_key ) . '&' . Helper::sgsb_fast_cart_get_query_string_for_http_ajax_referer() ),
										esc_html__( 'Remove this item', 'storegrowth-sales-booster' ),
										esc_attr( $product_id ),
										esc_attr( $_product->get_sku() )
									),
									$cart_item_key
								);
								?>
						</div>
						<?php endif; ?>
						</div>
					</td>
				</tr>
				<?php
			}
		}
		?>

				<?php do_action( 'woocommerce_cart_contents' ); ?>

		<tr>
			<td colspan="6" class="actions">

				<input type="hidden" name="update_cart" value="Update cart">

				<?php do_action( 'woocommerce_cart_actions' ); ?>

				<?php wp_nonce_field( 'woocommerce-cart', 'woocommerce-cart-nonce', false ); ?>
				<input type="hidden" name="_wp_http_referer" value="<?php echo esc_attr( Helper::sgsb_fast_cart_get_query_string_for_http_ajax_referer( true ) ); ?>">
			</td>
		</tr>

				<?php do_action( 'woocommerce_after_cart_contents' ); ?>
		</tbody>
	</table>
				<?php do_action( 'woocommerce_after_cart_table' ); ?>
</form>
				<?php do_action( 'sgsb_woocommerce_before_cart_collaterals' ); ?>

<div class="sgsb-cart-collaterals cart-collaterals">
				<?php
				/**
				 * Cart collaterals hook.
				 *
				 * @since 1.0.0
				 */
				if ( $show_coupon && wc_coupons_enabled() ) {
					do_action( 'storegrowth_sb_quick_cart_coupon' );
				}

				do_action( 'woocommerce_cart_collaterals' );
				?>
</div>

<?php do_action( 'woocommerce_after_cart' ); ?>
