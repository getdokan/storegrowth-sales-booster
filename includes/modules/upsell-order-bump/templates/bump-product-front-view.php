<?php
/**
 * Bump design for front.
 *
 * @package Bump design for front.
 */

?>

<div class='template-overview-area'>
		<hr style="margin-top:<?php echo esc_attr( $bump_info->box_top_margin ); ?>px"/>
		<div class="offer-main-wrap" 
		style="<?php echo 'no_border' !== $bump_info->box_border_style ? 'border:2px ' . esc_attr( $bump_info->box_border_style ) . ' ' . esc_attr( $bump_info->box_border_color ) : ''; ?>">
			<div class="dynamic-offer-text"
			style="
			<?php
			echo 'background:' . esc_attr( $bump_info->discount_background_color ) . ';';
			echo 'color:' . esc_attr( $bump_info->discount_text_color ) . ';';
			echo 'font-size:' . esc_attr( $bump_info->discount_font_size ) . 'px;'
			?>
			"
			>

			<?php
			echo 'discount' === $offer_type ? '&nbsp;' . esc_attr( $offer_amount ) . '% off only for you' : 'Just Only $' . esc_attr( $offer_amount ) . '.00';
			?>
			</div>
			<div class="product-image-and-title">
				<div class="offer-product-image-title">
				<div class="offer-product-image">
					<img src="<?php echo esc_attr( $bump_info->offer_image_url ); ?>" width='70' alt="" />	
				</div>
				<div class="offer-product-title" 
				style = "
				<?php
				echo 'color:' . esc_attr( $bump_info->product_description_text_color ) . ';';
				echo 'font-size:' . esc_attr( $bump_info->product_description_font_size ) . 'px;'
				?>
				"
				>
					<h3 style="color:<?php echo esc_attr( $bump_info->product_description_text_color ); ?>">
					<?php echo esc_attr( $bump_info->offer_product_title ); ?>
					</h3>
			</div>
			</div>
			<div class="offer-price" style = "
				<?php
				echo 'color:' . esc_attr( $bump_info->product_description_text_color ) . ';';
				echo 'font-size:' . esc_attr( $bump_info->product_description_font_size ) . 'px;'
				?>
				">
			<span style="text-decoration:line-through"><?php echo esc_html( get_woocommerce_currency_symbol() ) . esc_attr( number_format( (float) $regular_price, 2 ) ); ?></span>
			&nbsp;
			<span style=""><?php echo esc_html( get_woocommerce_currency_symbol() ) . esc_attr( number_format( (float) $offer_price, 2 ) ); ?></span>
			</div>
			<div class="product-checkbox-and-excitement-message" >
				<input 
					type     = "checkbox"
					class    = 'custom-checkbox' 
					value    = "<?php echo esc_attr( $offer_product_id ); ?>" 
					id       = "test_<?php echo esc_attr( $offer_product_id ); ?>" 
					onchange = "extraProducts(<?php echo esc_attr( $offer_product_id ); ?>,'<?php echo esc_attr( $checked ); ?>', '<?php echo esc_attr( $offer_price ); ?>')"
					<?php echo esc_attr( $checked ); ?> 
					>
					&nbsp; <Span>Select</Span>
			</div>
		</div>
</div>
