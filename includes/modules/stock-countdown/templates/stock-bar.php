<?php
/**
 * Template for simple product stock bar.
 *
 * @package SBFW
 */

if ( ! $product->managing_stock() ) {
	return;
}

if ( is_shop() && ! $shop_bar_enable ) {
	return;
}

if ( is_product() && ! $product_bar_enable ) {
	return;
}

$bar_height          = spsb_find_option_setting( $settings, 'progressbar_height', '5' );
$bg_color            = spsb_find_option_setting( $settings, 'progressbar_bg_color', '#444444' );
$fg_color            = spsb_find_option_setting( $settings, 'progressbar_fg_color', '#c3d168' );
$sd_format           = spsb_find_option_setting( $settings, 'stock_display_format', 'above' );
$total_sell_text     = spsb_find_option_setting( $settings, 'total_sell_count_text', 'Total Sold' );
$available_item_text = spsb_find_option_setting( $settings, 'available_item_count_text', 'Available Item' );
?>
<div
	class="spsb-stock-progress-bar wpbsc_total_sale spsb-stock-progress-bar-format-<?php echo esc_attr( $sd_format ); ?>"
	total-sale="<?php echo esc_attr( $total_sales ); ?>"
	total-stock="<?php echo esc_attr( $total_stock ); ?>"
	data-height="<?php echo esc_attr( $bar_height ); ?>"
	data-bgcolor="<?php echo esc_attr( $bg_color ); ?>"
	data-fgcolor="<?php echo esc_attr( $fg_color ); ?>"
>
	<?php if ( 'above' === $sd_format ) : ?>
	<div class="spsb-stock-progressbar-status">
		<span class="total-sold">
			<?php echo esc_html( sprintf( '%1$s: %2$s', $total_sell_text, $total_sales ) ); ?>
		</span>
		<span class="instock">
			<?php echo esc_html( sprintf( '%1$s: %2$s', $available_item_text, $stock ) ); ?>
		</span>
	</div>
	<?php endif; ?>
	<div class="jqmeter-container"></div>
	<?php if ( 'below' === $sd_format ) : ?>
	<div class="spsb-stock-progressbar-status-below">
		<?php
			/* translators: %s: Left items in stock */
			echo esc_html( sprintf( __( 'Only %s left in stock', 'spsb' ), ( $stock - $total_sales ) ) );
		?>
	</div>
	<?php endif; ?>
</div>
