<?php
/**
 * This is popup message file
 *
 * @package Popup message
 */

$image_with_link = '<a id="product_url" href="#" target="' . ( $popup_properties['open_product_link_in_new_tab'] ? '_blank' : '' ) . '">
											<img id="image_of_product" src="#" 
											style="' . esc_attr( $image_style ) . ';">
										</a>';

$image_without_link = '<img id="image_of_product" src="#" 
												style="' . ( isset( $image_style ) ? esc_attr( $image_style ) : '' ) . ';">';

?>
<section class="custom-social-proof" style="display: none;">
	<div class="custom-notification" style="<?php echo isset( $main_div_style ) ? esc_attr( $main_div_style ) : null; ?>">
		<div class="custom-notification-container" style="<?php do_action( 'sgsb_sales_pop_image_position', $popup_properties['image_position'] ); ?>" >

			<div class="custom-notification-image-wrapper" style="padding:<?php echo isset( $image_spacing ) ? esc_attr( $image_spacing ) : null; ?>px">
				<?php
				if ( $popup_properties['link_image_to_product'] ) {
                    echo $image_with_link; //phpcs:ignore
				} else {
                    echo $image_without_link; //phpcs:ignore
				}
				?>
			</div>

			<div class="custom-notification-content-wrapper">
				<div class="custom-notification-content" 
				style="<?php echo isset( $normal_text_style ) ? esc_attr( $normal_text_style ) : null; ?>">

					<p class="message-line-height" id="popup_virtual_name">
						<span id="virtual_name" 
							style="<?php echo isset( $name_style ) ? esc_attr( $name_style ) : null; ?>">
							Someone 
						</span>
						<span style="<?php echo isset( $name_style ) ? esc_attr( $name_style ) : null; ?>">Just purchased</span> 
						<br>
					</p>

					<p class="message-line-height" id="popup_title">
					<a id="product_url_title" href="#" target="">
						<span id="product" 
						style="color:<?php echo esc_attr( $popup_properties['product_title_color'] ); ?>; font-size:<?php echo esc_attr( $popup_properties['product_title_font_size'] ); ?>px ;">
						hosting
						</span>
					</a> 
						<br>
					</p>

					<p class="message-line-height" id="popup_location">
						<span id="country">Nepal</span>
						<br>
					</p>
					<p id="popup_time">
						<span id="time" style="<?php echo isset( $time_style ) ? esc_attr( $time_style ) : null; ?>">15</span>
						<span style="<?php echo isset( $time_style ) ? esc_attr( $time_style ) : null; ?>">minutes ago</span> 
						<br>	
					</div>

				</div>
			</div>


			<?php
			if ( true === $popup_properties['show_close_button'] ) {
				$template_no = ! empty( $popup_properties['template'] ) ? absint( $popup_properties['template'] ) : 4;
				?>
			<div class="custom-close <?php echo esc_attr( 'template-' . $template_no ); ?>"></div>
		<?php } ?>
		</div>	
	</div>
</section>
