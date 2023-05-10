<?php
/**
 * Template for simple product stock counter.
 *
 * @package SBFW
 */

if ( is_shop() && ! $shop_countdown_enable ) {
	return;
}

if ( is_product() && ! $product_countdown_enable ) {
	return;
}

$start_date = get_post_meta( $product->get_id(), '_spsb_stock_countdown_discount_start', true );
$end_date   = get_post_meta( $product->get_id(), '_spsb_stock_countdown_discount_end', true );

// If data is not set.
if ( ! spsb_stock_cd_is_product_discountable( $product->get_id() ) ) {
	return;
}

$discount_amount = get_post_meta( $product->get_id(), '_spsb_stock_countdown_discount_amount', true );

$heading_text = spsb_find_option_setting( $settings, 'countdown_heading', 'Last chance! [discount]% OFF' );
$heading      = str_replace( '[discount]', $discount_amount, $heading_text );
?>
<div class="spsb-stock-counter-wrapper">
	<?php if ( $heading_text ) : ?>
	<p class="spsb-stock-counter-heading"><?php echo wp_kses_post( $heading ); ?></p>
	<?php endif; ?>

	<div class="spsb-stock-counter-items" data-end-date="<?php echo esc_attr( $end_date ); ?>">
		<div class="spsb-stock-counter-item">
			<strong class="spsb-stock-counter-item-days">00</strong>
			<span>Days</span>
		</div>
		<div class="spsb-stock-counter-item">
			<strong class="spsb-stock-counter-item-hours">00</strong>
			<span>Hours</span>
		</div>
		<div class="spsb-stock-counter-item">
			<strong class="spsb-stock-counter-item-minutes">00</strong>
			<span>Minutes</span>
		</div>
		<div class="spsb-stock-counter-item">
			<strong class="spsb-stock-counter-item-seconds">00</strong>
			<span>Seconds</span>
		</div>
	</div>
</div>
