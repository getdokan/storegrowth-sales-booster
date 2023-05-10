<?php
/**
 * Template for simple product stock bar.
 *
 * @package SBFW
 */

if ( ! spsb_stock_cd_is_product_discountable( $product->get_id() ) && ! $product->managing_stock() ) {
	return;
}

$total_sales = intval( $product->get_total_sales() );
$stock       = intval( $product->get_stock_quantity() );
$total_stock = $stock + $total_sales;

$settings                 = get_option( 'spsb_stock_countdown_settings' );
$shop_bar_enable          = spsb_find_option_setting( $settings, 'shop_page_progress_bar_enable', true );
$shop_countdown_enable    = spsb_find_option_setting( $settings, 'shop_page_countdown_enable', true );
$product_bar_enable       = spsb_find_option_setting( $settings, 'product_page_progress_bar_enable', true );
$product_countdown_enable = spsb_find_option_setting( $settings, 'product_page_countdown_enable', true );
?>
<div class="spsb-stock-counter-and-bar">
	<?php
		require __DIR__ . '/stock-counter.php';

		require __DIR__ . '/stock-bar.php';
	?>
</div>
