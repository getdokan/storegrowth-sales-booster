<?php
/**
 * This is popup message file
 *
 * @package Popup message
 */

// This will include style file.

?>
<section class="custom-social-proof" style="display: none;">
	<div class="custom-notification" style="<?php echo esc_attr( $main_div_style ); ?>">
		<div class="custom-notification-container">
			<?php
			if ( 'left' === $popup_properties['image_position'] ) {
				?>
				<div class="custom-notification-image-wrapper" style="padding:<?php echo esc_attr( $image_spacing ); ?>px">
					<?php if ( 'true' === $popup_properties['link_image_to_product'] ) { ?>
						<a id="product_url" href="#" target="<?php echo 'true' === $popup_properties['open_product_link_in_new_tab'] ? '_blank' : null; ?>">
							<img id="image_of_product" 
								src="https://wiki.openstreetmap.org/w/images/d/d1/Tile_osm-no-label.png" 
								style="<?php echo esc_attr( $image_style ); ?>;"
							>
						</a>
					<?php } else { ?>
							<img id="image_of_product" 
								src="https://wiki.openstreetmap.org/w/images/d/d1/Tile_osm-no-label.png" 
								style="<?php echo esc_attr( $image_style ); ?>;"
							>
					<?php } ?>
				</div>
				<?php
			}
			?>
			<div class="custom-notification-content-wrapper">
				<div class="custom-notification-content">
					<p class="message-line-height" id="popup_title">
						<span id="product" 
						style="color:<?php echo esc_attr( $popup_properties['product_title_color'] ); ?>; font-size:<?php echo esc_attr( $popup_properties['product_title_font_size'] ); ?>px ;">
						hosting
						</span> 
						<br>
					</p> 

					<p class="message-line-height" id="popup_virtual_name">
						<span id="virtual_name" 
							style="<?php echo esc_attr( $name_style ); ?>">
							Someone 
						</span> 
						<br>
					</p>
					<p class="message-line-height" id="popup_location">
						<span id="country">Nepal</span>
						<br>
					</p>
					<p id="popup_time">
						<span id="time" style="<?php echo esc_attr( $time_style ); ?>">1</span>
						<span style="<?php echo esc_attr( $time_style ); ?>">hour ago</span> 
						<br>	
					</p>
				</div>
			</div>
			<?php

			if ( 'right' === $popup_properties['image_position'] ) {
				?>
				<div class="custom-notification-image-wrapper" >
					<img id="map1" 
					src="https://wiki.openstreetmap.org/w/images/d/d1/Tile_osm-no-label.png" 
					style="<?php echo esc_attr( $image_style ); ?>;"
					>
				</div>
				<?php
			}
			?>
		</div>
		
		<?php if ( true === $popup_properties['show_close_button'] ) { ?>
			<div class="custom-close"></div>
		<?php } ?>
	</div>
</section>
