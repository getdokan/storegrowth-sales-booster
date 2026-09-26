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
<?php $template_no = ! empty( $popup_properties['template'] ) ? absint( $popup_properties['template'] ) : 4; ?>
<section class="custom-social-proof" style="display: none;">
	<div class="custom-notification" style="<?php echo isset( $main_div_style ) ? esc_attr( $main_div_style ) : null; ?>">
		<div class="custom-notification-container" style="<?php do_action( 'spsg_sales_pop_image_position', $popup_properties['image_position'] ); ?>" >

			<div class="custom-notification-image-wrapper" style="padding:<?php echo isset( $image_spacing ) ? esc_attr( $image_spacing ) : null; ?>px">
				<?php
				// Template 2: a bag icon instead of the product image.
				if ( 2 === $template_no ) {
					?>
					<span class="spsg-sales-pop-icon" style="width:<?php echo esc_attr( absint( $popup_properties['popup_image_width'] ) ?: 72 ); ?>px" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 10a4 4 0 0 1-8 0"/><path d="M3.103 6.034h17.794"/><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/></svg>
					</span>
					<?php
				} elseif ( $popup_properties['link_image_to_product'] ) {
					// Product image markup (an <img>, optionally wrapped in an <a>).
					// wp_kses_post keeps that markup while stripping scripts/handlers.
					echo wp_kses_post( $image_with_link );
				} else {
					echo wp_kses_post( $image_without_link );
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
				?>
			<div class="custom-close <?php echo esc_attr( 'template-' . $template_no ); ?>"></div>
		<?php } ?>
		</div>	
	</div>
</section>
