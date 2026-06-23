<?php
/**
 * Template for simple product BoGo.
 *
 * @package SBFW
 */
?>

<!-- Start BOGO Tab Content -->
<div id='bogo_product_data' class='panel woocommerce_options_panel'>
	<div class='options_group'>
		<?php
		global $post;

		// Load only THIS product's own BOGO settings. Do not fall back to a global
		// offer here: this tab edits the product-specific BOGO, and showing global
		// data would make "Enable BOGO" appear on and cause an empty product BOGO to
		// be saved that shadows the global offer.
		$product_bogo_offers = \StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::get_bogo_offers(
			array(
				'type'         => 'product',
				'product_id'   => $post->ID,
				'variation_id' => 0,
				'status'       => '',
			)
		);
		$bogo_settings       = ! empty( $product_bogo_offers ) ? $product_bogo_offers[0] : array();
		$is_enable_bogo      = ! empty( $bogo_settings['status'] ) ? esc_html( $bogo_settings['status'] ) : 'no';
		$different_deal_type = ! empty( $bogo_settings['bogo_deal_type'] ) ? esc_html( $bogo_settings['bogo_deal_type'] ) : 'different';
		$different_bogo_type = ! empty( $bogo_settings['bogo_type'] ) ? esc_html( $bogo_settings['bogo_type'] ) : 'products';

		// If there is no product-specific BOGO, surface any active GLOBAL offer that
		// already covers this product as read-only info, so the merchant can see it
		// (global offers are managed under StoreGrowth → BOGO, not from this tab).
		$covering_global_offer = null;
		if ( empty( $bogo_settings ) ) {
			$global_offers = \StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager::get_bogo_offers(
				array(
					'type'   => 'global',
					'status' => 'active',
				)
			);
			foreach ( $global_offers as $global_offer ) {
				$offered = $global_offer['offered_products'] ?? array();
				$offered = is_array( $offered ) ? array_map( 'intval', $offered ) : array( (int) $offered );
				if ( in_array( (int) $post->ID, $offered, true ) ) {
					$covering_global_offer = $global_offer;
					break;
				}
			}
		}

		// Add a nonce field for BOGO settings panel.
		wp_nonce_field( 'spsg_bogo_settings', '_spsg_bogo_settings_nonce' );

		// Read-only summary of the active global offer that already covers this product,
		// with a link into the StoreGrowth → BOGO (React) editor to manage it.
		if ( $covering_global_offer ) {
			$g_name      = $covering_global_offer['name'] ?? '';
			$g_deal      = ( ( $covering_global_offer['bogo_deal_type'] ?? 'different' ) === 'same' )
				? __( 'Buy X Get X', 'storegrowth-sales-booster' )
				: __( 'Buy X Get Y', 'storegrowth-sales-booster' );
			$g_gift_id   = \StorePulse\StoreGrowth\Modules\BoGo\BogoValidator::get_offer_product_id( $covering_global_offer, $post->ID );
			$g_gift_name = $g_gift_id ? get_the_title( $g_gift_id ) : '';
			$g_discount  = (float) ( $covering_global_offer['discount_amount'] ?? 0 );
			$g_offer_lbl = ( ( $covering_global_offer['offer_type'] ?? 'free' ) === 'discount' && $g_discount > 0 )
				? sprintf( /* translators: %s: discount percent. */ __( '%s%% off', 'storegrowth-sales-booster' ), $g_discount )
				: __( 'Free', 'storegrowth-sales-booster' );
			$g_edit_url  = admin_url( 'admin.php?page=spsg-settings#/bogo/' . (int) ( $covering_global_offer['id'] ?? 0 ) );
			?>
			<div class="spsg-bogo-global-notice" style="padding:12px 14px;margin:0 0 14px;background:#eef6ff;border:1px solid #c5d9f1;border-radius:4px;">
				<strong><?php esc_html_e( 'This product is part of a global BOGO offer', 'storegrowth-sales-booster' ); ?></strong>
				<ul style="margin:8px 0 10px;list-style:disc;padding-left:18px;">
					<li><?php esc_html_e( 'Name', 'storegrowth-sales-booster' ); ?>: <strong><?php echo esc_html( $g_name ); ?></strong></li>
					<li><?php esc_html_e( 'Deal', 'storegrowth-sales-booster' ); ?>: <?php echo esc_html( $g_deal ); ?></li>
					<?php if ( $g_gift_name ) : ?>
						<li><?php esc_html_e( 'Gift product', 'storegrowth-sales-booster' ); ?>: <?php echo esc_html( $g_gift_name ); ?> (<?php echo esc_html( $g_offer_lbl ); ?>)</li>
					<?php endif; ?>
				</ul>
				<a href="<?php echo esc_url( $g_edit_url ); ?>" class="button button-secondary" target="_blank" rel="noopener">
					<?php esc_html_e( 'Edit this offer in StoreGrowth → BOGO', 'storegrowth-sales-booster' ); ?>
				</a>
				<p style="margin:8px 0 0;color:#555;"><?php esc_html_e( 'Enable below only to set a product-specific offer that overrides this global one.', 'storegrowth-sales-booster' ); ?></p>
			</div>
			<?php
		}

		// Enable/Disable for BOGO
		woocommerce_wp_checkbox(
			array(
				'id'      => 'bogo_status',
				'value'   => $is_enable_bogo === 'active' ? 'yes' : 'no',
				'cbvalue' => 'yes',
				'label'   => __( 'Enable BOGO', 'storegrowth-sales-booster' ),
			)
		);
		?>

		<div id="bogo_settings_fields">
			<?php
			$offered_product_id = ! empty( $bogo_settings['get_different_product_field'] ) ? esc_html( $bogo_settings['get_different_product_field'] ) : '';

            // Display the select dropdown with modified options using apply_filters
            $deal_types = apply_filters(
                'spsg_bogo_deal_types',
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
				<div class="spsg-bogo-box-title">
					<?php esc_html_e( 'Offered Product', 'storegrowth-sales-booster' ); ?>
					<span
						class="dashicons dashicons-editor-help spsg-section-tip"
						title="<?php esc_html_e( 'Click this button to submit the form', 'storegrowth-sales-booster' ); ?>"
					></span>
				</div>

				<p id="different-product-field" class="form-field <?php echo esc_attr( $different_deal_type === 'different' ? 'active-product-field' : 'disable-product-field' ); ?>">
					<label for="_spsg_get_product_field"><?php esc_html_e( 'Get different product', 'storegrowth-sales-booster' ); ?></label>
					<select class="select short" id="_spsg_get_product_field" name="get_different_product_field" data-allow_clear="true"
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
						'id'                => '_spsg_bogo_product_discount_percentage',
						'name'              => 'discount_amount',
						'class'             => 'spsg_bogo_product_discount_percentage',
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
                do_action( 'spsg_after_bogo_offer_settings', $bogo_settings );
				?>

				<hr />
				<?php
				// Display the select dropdown with modified options using apply_filters
				$options = apply_filters(
					'options_spsg_bogo_type',
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
					<label for="_spsg_get_multiple_product_field"><?php esc_html_e( 'Alternate option of the offered products', 'storegrowth-sales-booster' ); ?></label>
					<select class="select short" id="_spsg_get_multiple_product_field" name="get_alternate_products[]" multiple="multiple"
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
				<?php  do_action( 'spsg_after_bogo_offer_type_field', $bogo_settings ); ?>

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
				/**
				 * TODO: It has no impact in the current implementation.
				 * @see https://github.com/getdokan/plugin-internal-tasks/issues/892
				 */
				
				// woocommerce_wp_text_input(
				// 	array(
				// 		'id'          => '_shop_page_message',
				// 		'name'        => 'shop_page_message',
				// 		'value'       => $shop_page_msg,
				// 		'label'       => __( 'Shop page message', 'storegrowth-sales-booster' ),
				// 		'description' => __( 'Enter custom message two.', 'storegrowth-sales-booster' ),
				// 		'desc_tip'    => true,
				// 	)
				// );

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
			do_action( 'spsg_after_bogo_settings_panel', $current_product, $is_variable_product, $bogo_settings );
			?>
		</div>
	</div>
</div>
<!-- End BOGO Tab Content -->
