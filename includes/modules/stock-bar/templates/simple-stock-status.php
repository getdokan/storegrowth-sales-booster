<?php
/**
 * Template for simple product stock bar.
 *
 * @package SBFW
 */

if ( ! sgsb_stock_bar_is_product_discountable( $product->get_id() ) && ! $product->managing_stock() ) {
	return;
}

$total_sales = intval( $product->get_total_sales() );
$stock       = intval( $product->get_stock_quantity() );
$total_stock = $stock + $total_sales;

$settings                 = get_option( 'sgsb_stock_bar_settings' );
$product_bar_enable       = sgsb_find_option_setting( $settings, 'product_page_progress_bar_enable', true );
$product_countdown_enable = sgsb_find_option_setting( $settings, 'product_page_countdown_enable', true );


$hide_template_in_product = is_product() && ( ! $product->managing_stock() || ! $product_bar_enable ) && ! $product_countdown_enable;

if ( $hide_template_in_product ) {
	return false;
}

?>
<div class="sgsb-stock-counter-and-bar">
	<?php
		require __DIR__ . '/stock-counter.php';

		require __DIR__ . '/stock-bar.php';
	?>
</div>
