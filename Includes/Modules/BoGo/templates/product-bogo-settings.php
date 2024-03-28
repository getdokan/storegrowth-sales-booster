<?php
/**
 * Template for simple product BoGo.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\BoGo\Includes;

?>

<!-- Start BOGO Tab Content -->
<div id='bogo_product_data' class='panel woocommerce_options_panel'>
	<div class='options_group'>
		<?php
		global $post;

		$bogo_settings       = Helper::sgsb_get_product_bogo_settings( $post->ID );
		$is_enable_bogo      = ! empty( $bogo_settings['bogo_status'] ) ? esc_html( $bogo_settings['bogo_status'] ) : 'no';
		$different_deal_type = ! empty( $bogo_settings['bogo_deal_type'] ) ? esc_html( $bogo_settings['bogo_deal_type'] ) : 'different';
		$different_bogo_type = ! empty( $bogo_settings['bogo_type'] ) ? esc_html( $bogo_settings['bogo_type'] ) : 'products';
		// Add a nonce field for BOGO settings panel.
		wp_nonce_field( 'sgsb_bogo_settings', '_sgsb_bogo_settings_nonce' );

		// Enable/Disable for BOGO
		woocommerce_wp_checkbox(
			array(
				'id'    => 'bogo_status',
				'value' => $is_enable_bogo,
				'label' => __( 'Enable BOGO', 'storegrowth-sales-booster' ),
			)
		);
		?>

		<div id="bogo_settings_fields">
			<?php
			$offered_product_id = ! empty( $bogo_settings['get_different_product_field'] ) ? esc_html( $bogo_settings['get_different_product_field'] ) : '';

            // Display the select dropdown with modified options using apply_filters
            $deal_types = apply_filters(
                'sgsb_bogo_deal_types',
                array( 'different' => __( 'Buy X Get Y Free', 'storegrowth-sales-booster' ) ),
            );

			woocommerce_wp_select(
				array(
					'id'      => 'bogo_deal_type',
					'value'   => $different_deal_type,
					'label'   => __( 'Deal Type', 'storegrowth-sales-booster' ),
					'options' => $deal_types,
				)
			);

			$current_product     = wc_get_product( $post->ID );
			$is_variable_product = $current_product->is_type( 'variable' );

			if ( ! $is_variable_product ) :
				?>
				<div class="sgsb-bogo-box-title">
					<?php esc_html_e( 'Offered Product', 'storegrowth-sales-booster' ); ?>
					<span
						class="dashicons dashicons-editor-help sgsb-section-tip"
						title="<?php esc_html_e( 'Click this button to submit the form', 'storegrowth-sales-booster' ); ?>"
					></span>
				</div>

				<p id="different-product-field" class="form-field <?php echo esc_attr( $different_deal_type === 'different' ? 'active-product-field' : 'disable-product-field' ); ?>">
					<label for="_sgsb_get_product_field"><?php esc_html_e( 'Get different product', 'storegrowth-sales-booster' ); ?></label>
					<select class="select short" id="_sgsb_get_product_field" name="get_different_product_field" data-allow_clear="true"
						data-placeholder="<?php esc_attr_e( 'Select product', 'storegrowth-sales-booster' ); ?>" style="width: 50%;">
						<option value=""><?php esc_html_e( 'Select product', 'storegrowth-sales-booster' ); ?></option>
						<?php
						$products = wc_get_products(
							array(
								'status' => 'publish',
								'limit'  => -1,
							)
						);

						foreach ( $products as $product ) :
							?>
							<option value="<?php echo esc_attr( $product->get_id() ); ?>" <?php echo ( $product->get_id() == $offered_product_id ) ? 'selected ' : ''; ?>>
										<?php echo esc_html( $product->get_name() ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</p>

				<?php
				$is_bogo_discount    = ! empty( $bogo_settings['offer_type'] ) ? esc_html( $bogo_settings['offer_type'] ) : 'free';
				$discount_percentage = ! empty( $bogo_settings['discount_amount'] ) ? absint( $bogo_settings['discount_amount'] ) : 0;

				woocommerce_wp_select(
					array(
						'id'      => 'offer_type',
						'value'   => $is_bogo_discount,
						'label'   => __( 'Offer Type', 'storegrowth-sales-booster' ),
						'options' => array(
							'free'     => __( 'Free', 'storegrowth-sales-booster' ),
							'discount' => __( 'Discount', 'storegrowth-sales-booster' ),
						),
					)
				);

				woocommerce_wp_text_input(
					array(
						'id'                => '_sgsb_bogo_product_discount_percentage',
						'name'              => 'discount_amount',
						'class'             => 'sgsb_bogo_product_discount_percentage',
						'value'             => $discount_percentage,
						'wrapper_class'     => ( $is_bogo_discount === 'discount' ) ? 'enable_bogo_product_discount' : 'disable_bogo_product_discount',
						'label'             => __( 'Discount', 'storegrowth-sales-booster' ),
						'description'       => __( 'Enter the product discount percentage here.', 'storegrowth-sales-booster' ),
						'placeholder'       => __( 'Percent discount E.g: 10', 'storegrowth-sales-booster' ),
						'type'              => 'number',
						'custom_attributes' => array(
							'min'  => '0',
							'step' => 'any',
						),
					)
				);

                /**
                 * Load premium settings after BOGO offer settings.
                 *
                 * @since 1.0.2
                 *
                 * @param array $bogo_settings
                 */
                do_action( 'sgsb_after_bogo_offer_settings', $bogo_settings );
				?>

				<hr />
				<?php
				// Display the select dropdown with modified options using apply_filters
				$options = apply_filters(
					'options_sgsb_bogo_type',
					array(
						'products' => __( 'Products', 'storegrowth-sales-booster' ),
					),
					'bogo_type'
				);

				woocommerce_wp_select(
					array(
						'id'      => 'bogo_type',
						'value'   => $different_bogo_type,
						'label'   => __( 'Bogo Type', 'storegrowth-sales-booster' ),
						'options' => $options,
					)
				);

				?>
				<p class="form-field alt-bogo-products">
					<label for="_sgsb_get_multiple_product_field"><?php esc_html_e( 'Alternate option of the offered products', 'storegrowth-sales-booster' ); ?></label>
					<select class="select short" id="_sgsb_get_multiple_product_field" name="get_alternate_products[]" multiple="multiple"
						data-placeholder="<?php esc_attr_e( 'Select a product', 'storegrowth-sales-booster' ); ?>" style="width: 50%;">
						<option value=""><?php esc_html_e( 'Select a product', 'storegrowth-sales-booster' ); ?></option>
						<?php
						$products = wc_get_products(
							array(
								'status'  => 'publish',
								'limit'   => -1,
                                'exclude' => array( $post->ID ),
                                'type'    => array( 'simple', 'variable' )
							)
						);

						$offer_products = ! empty( $bogo_settings['get_alternate_products'] ) ? $bogo_settings['get_alternate_products'] : array();
						if ( ! is_array( $offer_products ) ) {
							$offer_products = array();
						}
						?>

						<?php foreach ( $products as $product ) : ?>
							<option value="<?php echo esc_attr( $product->get_id() ); ?>" <?php echo in_array( $product->get_id(), $offer_products ) ? 'selected ' : ''; ?>>
								<?php echo esc_html( $product->get_name() ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</p>
				<?php  do_action( 'sgsb_after_bogo_offer_type_field', $bogo_settings ); ?>

				<?php
				$product_page_msg = ! empty( $bogo_settings['product_page_message'] ) ? esc_html( $bogo_settings['product_page_message'] ) : '';
				$shop_page_msg    = ! empty( $bogo_settings['shop_page_message'] ) ? esc_html( $bogo_settings['shop_page_message'] ) : '';
				$bogo_badge_image = ! empty( $bogo_settings['bogo_badge_image'] ) ? esc_url( $bogo_settings['bogo_badge_image'] ) : '';

				woocommerce_wp_text_input(
					array(
						'id'          => '_product_page_message',
						'name'        => 'product_page_message',
						'value'       => $product_page_msg,
						'label'       => __( 'Product page message', 'storegrowth-sales-booster' ),
						'description' => __( 'Enter custom message one.', 'storegrowth-sales-booster' ),
						'desc_tip'    => true,
					)
				);

				woocommerce_wp_text_input(
					array(
						'id'          => '_shop_page_message',
						'name'        => 'shop_page_message',
						'value'       => $shop_page_msg,
						'label'       => __( 'Shop page message', 'storegrowth-sales-booster' ),
						'description' => __( 'Enter custom message two.', 'storegrowth-sales-booster' ),
						'desc_tip'    => true,
					)
				);

				woocommerce_wp_text_input(
					array(
						'id'          => '_bogo_badge_image',
						'name'        => 'bogo_badge_image',
						'label'       => __( 'Custom Image', 'storegrowth-sales-booster' ),
						'placeholder' => 'http://',
						'desc_tip'    => 'true',
						'description' => __( 'Upload a custom image.', 'storegrowth-sales-booster' ),
						'type'        => 'text',
						'value'       => $bogo_badge_image,
					)
				);

			endif;

			/**
			 * Load settings before settings panel end.
			 *
			 * @since 1.0.2
			 *
			 * @param \WC_Product $current_product
			 * @param bool        $is_variable_product
			 * @param array       $bogo_settings
			 */
			do_action( 'sgsb_after_bogo_settings_panel', $current_product, $is_variable_product, $bogo_settings );
			?>
		</div>
	</div>
</div>
<!-- End BOGO Tab Content -->
