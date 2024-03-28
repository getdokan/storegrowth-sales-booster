<?php
/**
 * Bogo design for front.
 *
 * @package Bogo design for front.
 */

// Check if the variables are set before using them.
use STOREGROWTH\SPSB\Modules\BoGo\Includes\Helper;

if ( isset( $product, $bogo_info, $target_product, $offer_product_id, $image_url, $regular_price, $offer_price ) ) {
	$bogo_message = $bogo_info->product_page_message;
	$bogo_message = str_replace( '[target_product]', get_the_title( $target_product ), $bogo_message );
	$bogo_message = str_replace( '[offered_product]', get_the_title( $offer_product_id ), $bogo_message );

    $show_regular_price = Helper::sgsb_get_bogo_settings_option( 'regular_price_show', false );
	?>

	<div class='bogo-template-overview-area'>
		<div class="offer-main-wrap" style="border: 2px solid #32DBBE; margin-bottom: 20px;">
			<div class="dynamic-offer-text">
				<svg width='15' height='15' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						fill='#02AC6E'
						d='M6.35818 0.158203C6.08866 0.158203 5.81928 0.261688 5.61466 0.466306L5.2127 0.868251C4.84967 1.23128 4.35705 1.43443 3.84365 1.43443H3.2095C2.63076 1.43443 2.15787 1.90729 2.15787 2.48604V2.95182V3.12053C2.15787 3.63394 1.95471 4.12619 1.59169 4.48922L1.18974 4.89117C0.780504 5.3004 0.780504 5.96965 1.18974 6.37888L1.59169 6.78083C1.95471 7.14386 2.15787 7.63577 2.15787 8.14918V8.78366C2.15787 9.36241 2.63076 9.83528 3.2095 9.83528H3.84365C4.35705 9.83528 4.84967 10.0388 5.2127 10.4018L5.61466 10.8034C6.02389 11.2126 6.69247 11.2126 7.1017 10.8034L7.504 10.4018C7.86703 10.0388 8.35931 9.83528 8.87271 9.83528H9.50686C10.0856 9.83528 10.5585 9.36241 10.5585 8.78366V8.14918C10.5585 7.63577 10.7634 7.14386 11.1264 6.78083L11.528 6.37888C11.9372 5.96964 11.9372 5.30041 11.528 4.89117L11.1264 4.48922C10.7634 4.12618 10.5585 3.63394 10.5585 3.12053V2.48604C10.5585 1.90729 10.0856 1.43443 9.50686 1.43443H8.87271C8.35931 1.43443 7.86703 1.23128 7.504 0.868251L7.1017 0.466306C6.89709 0.261687 6.6277 0.158204 6.35818 0.158203ZM5.03537 3.41518C5.52954 3.41518 5.93415 3.82012 5.93415 4.31429C5.93415 4.80846 5.52954 5.21341 5.03537 5.21341C4.54119 5.21341 4.13623 4.80846 4.13623 4.31429C4.13623 3.82012 4.54119 3.41518 5.03537 3.41518ZM8.13402 3.65669C8.18088 3.65643 8.22593 3.6748 8.25926 3.70775C8.27581 3.72405 8.28899 3.74346 8.29803 3.76486C8.30708 3.78625 8.31182 3.80923 8.31198 3.83246C8.31214 3.85569 8.30772 3.87873 8.29897 3.90025C8.29022 3.92177 8.27732 3.94136 8.261 3.95789L4.67896 7.56092C4.64604 7.59399 4.60137 7.6127 4.5547 7.61296C4.50804 7.61322 4.46315 7.59502 4.42986 7.56232C4.41325 7.54601 4.40004 7.52659 4.39096 7.50516C4.38188 7.48373 4.37713 7.46071 4.37697 7.43744C4.37681 7.41417 4.38124 7.39109 4.39002 7.36954C4.3988 7.34798 4.41175 7.32837 4.42812 7.31184L8.01015 3.70916C8.04292 3.67603 8.08743 3.65717 8.13402 3.65669ZM5.03537 3.76882C4.73224 3.76882 4.48988 4.0112 4.48988 4.31429C4.48988 4.61739 4.73224 4.85977 5.03537 4.85977C5.33849 4.85977 5.58085 4.61739 5.58085 4.31429C5.58085 4.0112 5.33849 3.76882 5.03537 3.76882ZM7.68134 6.05629C8.17552 6.05629 8.58047 6.46124 8.58047 6.95541C8.58047 7.44958 8.17552 7.85314 7.68134 7.85314C7.18717 7.85314 6.78359 7.44958 6.78359 6.95541C6.78359 6.46124 7.18717 6.05629 7.68134 6.05629ZM7.68134 6.40993C7.37822 6.40993 7.1369 6.65231 7.1369 6.95541C7.1369 7.2585 7.37822 7.50088 7.68134 7.50088C7.98447 7.50088 8.22648 7.2585 8.22648 6.95541C8.22648 6.65231 7.98447 6.40993 7.68134 6.40993Z'
					/>
				</svg>
				<?php
				echo esc_attr( $bogo_message );
				$fallback_image_url = esc_url( plugin_dir_url( __FILE__ ) . '../assets/images/bump-preview.svg' );
				$image_url          = $image_url ? $image_url : $fallback_image_url;
				?>
			</div>
			<div class="product-image-and-title">
				<div class="offer-product-image-title">
					<div class="offer-product-image">
						<img src="<?php echo esc_attr( $image_url ); ?>" width='70' alt="" />
					</div>
					<div class="offer-product-title">
						<h3>
							<?php echo esc_html( get_the_title( $offer_product_id ) ); ?>
						</h3>

						<?php

                        $variation_id = 0;
                        if ( $product->is_type( 'variable' ) ) {
                            $variation_id   = $target_product;
                            $target_product = $product->get_parent_id();
                        }

                        // Get apply product id.
                        $apply_able_product_id = apply_filters( 'sgsb_bogo_get_apply_able_product_id', $target_product, $variation_id );

                        // Prepare settings for BOGO apply.
                        $bogo_settings = Helper::sgsb_get_product_bogo_settings_for_cart( $apply_able_product_id );
                        $bogo_settings = apply_filters( 'sgsb_get_bogo_settings_for_cart', $bogo_settings, $target_product, $variation_id );

                        $product_id = Helper::sgsb_get_offer_product_id( $bogo_settings, $apply_able_product_id );

						if ( $product_id ) {
							$product_categories = wp_get_post_terms( $product_id, 'product_cat' );

							$category_names = array();
							foreach ( $product_categories as $category ) {
								$category_names[] = $category->name;
							}

							$category_names = implode( ', ', $category_names );
							?>

							<?php if ( ! empty( $category_names ) ) : ?>
								<p>
									<?php echo esc_html( $category_names ); ?>
								</p>
							<?php endif; ?>
						<?php } ?>
					</div>
				</div>
				<div class="offer-price">
                    <?php if ( $show_regular_price ) : ?>
                        <span style="text-decoration: line-through;">
                            <?php echo esc_html( get_woocommerce_currency_symbol() ) . esc_attr( number_format( (float) $regular_price, 2 ) ); ?>
                        </span>
                    <?php endif; ?>
                    &nbsp;
					<span>
						<?php echo esc_html( get_woocommerce_currency_symbol() ) . esc_attr( number_format( (float) $offer_price, 2 ) ); ?>
					</span>
				</div>
			</div>
		</div>
	</div>

<?php } // end if isset ?>
