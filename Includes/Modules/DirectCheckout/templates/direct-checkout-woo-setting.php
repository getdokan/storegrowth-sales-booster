<?php
/**
 * Template for direct checkout woocommerce settings meta field.
 *
 * @package SBFW
 */

?>

<div id="sgsb-direct-checkout-data" class="panel woocommerce_options_panel hidden">
		<div class="options_group">
			<?php
			woocommerce_wp_radio(
				array(
					'id'          => '_sgsb_direct_checkout_button_layout',
					'value'       => get_post_meta( $post->ID, '_sgsb_direct_checkout_button_layout', true ),
					'label'       => 'Button Layout Setting',
					'description' => 'This is the visibility setting of the Direct checkout button',
					'desc_tip'    => true,
					'options'     => array(
						'cart-to-buy-now'     => '"Add to cart" as "Buy Now"',
						'cart-with-buy-now'   => '"Buy Now" with "Add to cart"',
						'default-add-to-cart' => 'Default Add to cart',
					),
				)
			);
			?>
		</div>
	</div>
