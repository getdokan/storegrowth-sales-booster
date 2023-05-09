<?php
/**
 * Bump design for front.
 *
 * @package Bump design for front.
 */

?>

<div class='template-overview-area'>
		<div class="offer-overview-top-text">
			OFFER OVERVIEW
		</div>
		<hr style="margin-bottom:<?php echo esc_attr( $bump_info->box_top_margin ); ?>px"/>
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
			>q

			<?php
			echo 'discount' === $offer_type ? '&nbsp;' . esc_attr( $offer_amount ) . '% off only for you' : 'Just Only $' . esc_attr( $offer_amount ) . '.00';
			?>
			</div>
			<div class="product-image-and-title">
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
					<span style="text-decoration:line-through">$<?php echo esc_attr( $regular_price ); ?>.00</span>&nbsp;&nbsp;
					<span style="text-decoration:underline">$<?php echo esc_attr( $offer_price ); ?>.00</span>
					<br/>
					<span><?php echo esc_attr( $bump_info->product_description ); ?></span>
				</div>
			</div>
			<div class="product-checkbox-and-excitement-message" 

			style = "
			<?php
			echo 'background:' . esc_attr( $bump_info->accept_offer_background_color ) . ';';
			echo 'color:' . esc_attr( $bump_info->accept_offer_text_color ) . ';';
			echo 'font-size:' . esc_attr( $bump_info->accept_offer_font_size ) . 'px;'
			?>
			"
			>
			<input 
				type     = "checkbox"
				class    = 'custom-checkbox' 
				value    = "<?php echo esc_attr( $offer_product_id ); ?>" 
				id       = "test_<?php echo esc_attr( $offer_product_id ); ?>" 
				onchange = "extraProducts(<?php echo esc_attr( $offer_product_id ); ?>,'<?php echo esc_attr( $checked ); ?>', '<?php echo esc_attr( $offer_price ); ?>')"
				<?php echo esc_attr( $checked ); ?> 
				>
				<?php echo esc_attr( $bump_info->selection_title ); ?>
			</div>

			<div 
				class = "product-description"
				style = "
				<?php
				echo 'background:' . esc_attr( $bump_info->offer_description_background_color ) . ';';
				echo 'color:' . esc_attr( $bump_info->offer_description_text_color ) . ';';
				echo 'font-size:' . esc_attr( $bump_info->offer_description_font_size ) . 'px;'
				?>
				"
			>
				<?php echo esc_attr( $bump_info->offer_description ); ?>
			</div>
		</div>
		<hr style="margin-bottom:<?php echo esc_attr( $bump_info->box_bottom_margin ); ?>px" />
</div>
