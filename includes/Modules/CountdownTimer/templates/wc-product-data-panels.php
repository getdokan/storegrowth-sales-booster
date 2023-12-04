<?php
/**
 * Show form fields to product edit screen.
 *
 * @package SBFW
 */

global $product_object;

$dates_from = get_post_meta( $product_object->get_id(), '_sgsb_countdown_timer_discount_start', true );
$dates_to   = get_post_meta( $product_object->get_id(), '_sgsb_countdown_timer_discount_end', true );

$dates_from = $dates_from ? gmdate( 'Y-m-d', strtotime( $dates_from ) ) : $dates_from;
$dates_to   = $dates_to ? gmdate( 'Y-m-d', strtotime( $dates_to ) ) : $dates_to;

?>
<div id="sgsb-countdown-timer-tab" class="panel woocommerce_options_panel hidden">
	<div class="options_group">
		<?php
		woocommerce_wp_text_input(
			array(
				'id'          => '_sgsb_countdown_timer_discount_amount',
				'label'       => __( 'Product Discount (%)', 'storegrowth-sales-booster' ),
				'placeholder' => 'Set the discount as percentage.',
				'desc_tip'    => true,
				'description' => __( 'Set the countdown timer discount as percentage.', 'storegrowth-sales-booster' ),
			)
		);
		?>
		<p class="form-field sale_price_dates_fields" style="margin-bottom: 0;">
			<label>
				<?php esc_html_e( 'Discount dates', 'storegrowth-sales-booster' ); ?>
			</label>
			<input type="text" class="short" name="_sgsb_countdown_timer_discount_start"
				id="_sgsb_countdown_timer_discount_start" value="<?php echo esc_attr( $dates_from ); ?>"
				placeholder="Start&hellip; YYYY-MM-DD" maxlength="10"
				pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" />
			<input type="text" class="short" name="_sgsb_countdown_timer_discount_end" id="_sgsb_countdown_timer_discount_end"
				value="<?php echo esc_attr( $dates_to ); ?>" placeholder="End&hellip; YYYY-MM-DD" maxlength="10"
				pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" />
			<input type="hidden" value="sgsb_countdown_timer_dates_fields">
		</p>
		<p class="form-field" style="margin: 0; padding-top: 0 !important;">
			<span class="description" style="margin:0;">
				<?php echo esc_html( __( 'The sale will start at 00:00:00 of "Start" date and end at 23:59:59 of "End" date.', 'storegrowth-sales-booster' ) ); ?>
			</span>
		</p>
		<p class="form-field" style="margin: 0; padding-top: 0 !important;">
			<span class="description" style="margin:0; color:#2271b2; font-weight:bold;">All the fields are required to show
				the countdown.</span>
		</p>
		<p class="form-field" style="margin: 0; padding-top: 0 !important;">
			<span class="description" style="margin: 0; color: #2271b2; font-weight: bold;">To learn more, please view the
				<b><a href="https://storegrowth.io/docs/sales-countdown/" target="_blank">Documentation</a></b>
			</span>
		</p>
	</div>
</div>
