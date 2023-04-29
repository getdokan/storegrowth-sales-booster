<?php
/**
 * Show form fields to product edit screen.
 *
 * @package SBFW
 */

global $product_object;

$dates_from = get_post_meta( $product_object->get_id(), '_sbfw_stock_countdown_discount_start', true );
$dates_to   = get_post_meta( $product_object->get_id(), '_sbfw_stock_countdown_discount_end', true );

?>
<div id="sbfw-stock-countdown-tab" class="panel woocommerce_options_panel hidden">
	<div class="options_group">
		<?php
			woocommerce_wp_text_input(
				array(
					'id'          => '_sbfw_stock_countdown_discount_amount',
					'label'       => __( 'Stock Discount (%)', 'sbfw' ),
					'placeholder' => 'Set the discount as percentage.',
					'desc_tip'    => true,
					'description' => __( 'Set the countdown timer discount as percentage.', 'sbfw' ),
				)
			);
			?>
		<p class="form-field sale_price_dates_fields" style="margin-bottom: 0;">
			<label><?php esc_html_e( 'Discount dates', 'sbfw' ); ?></label>
			<input type="text" class="short" name="_sbfw_stock_countdown_discount_start" id="_sbfw_stock_countdown_discount_start" value="<?php echo esc_attr( $dates_from ); ?>" placeholder="Start&hellip; YYYY-MM-DD" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" />
			<input type="text" class="short" name="_sbfw_stock_countdown_discount_end" id="_sbfw_stock_countdown_discount_end" value="<?php echo esc_attr( $dates_to ); ?>" placeholder="End&hellip; YYYY-MM-DD" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" />
			<?php echo wc_help_tip( __( 'The sale will start at 00:00:00 of "Start" date and end at 23:59:59 of "End" date.', 'sbfw' ) ); ?>
			<input type="hidden" value="sbfw_stock_countdown_dates_fields">
		</p>
		<p class="form-field" style="margin: 0; padding-top: 0 !important;">
			<span class="description" style="margin:0; color:#2271b2; font-weight:bold;">All the fields are required to show the countdown.</span>
		</p>
	</div>
</div>
