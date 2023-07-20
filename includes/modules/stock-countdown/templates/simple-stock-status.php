<?php
/**
 * Template for simple product stock bar.
 *
 * @package SBFW
 */

if ( ! sgsb_stock_cd_is_product_discountable( $product->get_id() ) ) {
	return;
}

$settings                         = get_option( 'sgsb_stock_countdown_settings' );
$enable_countdown_in_product_page = sgsb_find_option_setting( $settings, 'product_page_countdown_enable', true );

if ( is_product() && ! $enable_countdown_in_product_page ) {
	return;
}

$start_date = get_post_meta( $product->get_id(), '_sgsb_stock_countdown_discount_start', true );
$end_date   = get_post_meta( $product->get_id(), '_sgsb_stock_countdown_discount_end', true );

$discount_amount = get_post_meta( $product->get_id(), '_sgsb_stock_countdown_discount_amount', true );

$heading_text = sgsb_find_option_setting( $settings, 'countdown_heading', 'Last chance! [discount]% OFF' );
$heading      = str_replace( '[discount]', $discount_amount, $heading_text );

?>
<div class="sgsb-stock-counter-and-bar">

	<div class="sgsb-stock-counter-wrapper">
		<?php if ( $heading_text ) : ?>
		<p class="sgsb-stock-counter-heading"><?php echo wp_kses_post( $heading ); ?></p>
		<?php endif; ?>

		<div class="sgsb-stock-counter-items" data-end-date="<?php echo esc_attr( $end_date ); ?>">
			<div class="sgsb-stock-counter-item">
				<strong class="sgsb-stock-counter-item-days">00</strong>
				<span>Days</span>
			</div>
			<span class="sgsb-colon">:</span>
			<div class="sgsb-stock-counter-item">
				<strong class="sgsb-stock-counter-item-hours">00</strong>
				<span>Hours</span>
			</div>
			<span class="sgsb-colon">:</span>
			<div class="sgsb-stock-counter-item">
				<strong class="sgsb-stock-counter-item-minutes">00</strong>
				<span>Min</span>
			</div>
			<span class="sgsb-colon">:</span>
			<div class="sgsb-stock-counter-item">
				<strong class="sgsb-stock-counter-item-seconds">00</strong>
				<span>Sec</span>
			</div>
		</div>
	</div>

</div>
