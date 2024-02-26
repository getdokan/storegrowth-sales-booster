<?php
/**
 * Template for simple product stock bar.
 *
 * @package SBFW
 */

if ( ! $product->managing_stock() ) {
	return;
}

$settings                         = get_option( 'sgsb_stock_bar_settings' );
$enable_stock_bar_in_product_page = sgsb_find_option_setting( $settings, 'product_page_stock_bar_enable', true );

if ( is_product() && ! $enable_stock_bar_in_product_page ) {
	return;
}

$total_sales = intval( $product->get_total_sales() );
$stock       = intval( $product->get_stock_quantity() );
$total_stock = $stock + $total_sales;

$bar_height          = sgsb_find_option_setting( $settings, 'stockbar_height', '10' );
$bg_color            = sgsb_find_option_setting( $settings, 'stockbar_bg_color', '#e7efff' );
$fg_color            = sgsb_find_option_setting( $settings, 'stockbar_fg_color', '#0875ff' );
$sd_format           = sgsb_find_option_setting( $settings, 'stock_display_format', 'above' );
$total_sell_text     = sgsb_find_option_setting( $settings, 'total_sell_count_text', 'Total Sold' );
$available_item_text = sgsb_find_option_setting( $settings, 'available_item_count_text', 'Available Item' );

// Vars for threshold warning msg.
$show_stock_status = sgsb_find_option_setting( $settings, 'show_stock_status', true );
$stock_contents    = apply_filters(
    'sgsb_stock_bar_warning_contents',
    array(
        'quantity_required' => 10,
        'status_text_color' => '#073B4C',
        'stock_status_text' => __( "Hurry! only {$stock} stocks left.", 'storegrowth-sales-booster' )
    ),
    $settings,
    $stock
);

?>

<div class="sgsb-stock-bar">
	<div
		class="sgsb-stock-progress-bar-section wpbsc_total_sale sgsb-stock-stock-bar-format-<?php echo esc_attr( $sd_format ); ?>"
		total-sale="<?php echo esc_attr( $total_sales ); ?>"
		total-stock="<?php echo esc_attr( $total_stock ); ?>"
		data-height="<?php echo esc_attr( $bar_height ); ?>"
		data-bgcolor="<?php echo esc_attr( $bg_color ); ?>"
		data-fgcolor="<?php echo esc_attr( $fg_color ); ?>"
	>
		<?php if ( 'above' === $sd_format ) : ?>
		<div class="sgsb-stock-progress-title">
			<span class="sgsb-stock-progress-sold-title">
				<?php echo esc_html( sprintf( '%1$s:', $total_sell_text ) ); ?>
				<span class="sgsb-stock-progress-count">
					<?php echo esc_html( sprintf( '%1$s', $total_sales ) ); ?>
				</span>
			</span>
			<span class="sgsb-stock-progress-available-title">
				<?php echo esc_html( sprintf( '%1$s:', $available_item_text ) ); ?>
				<span class="sgsb-stock-progress-count">
					<?php echo esc_html( sprintf( '%1$s', $stock ) ); ?>
				</span>
			</span>
		</div>
		<?php endif; ?>
		<div class="jqmeter-container"></div>
		<?php
		if ( 'below' === $sd_format ) :
				/* translators: %s: Left items in stock */
				do_action( 'sgsb_stock_bar_stock_below' );
			endif;
		?>

        <?php if ( $show_stock_status && ( $stock <= $stock_contents['quantity_required'] ) ) : ?>
            <p
                class='stock-status-warning-msg'
                style='color: <?php echo esc_attr( $stock_contents['status_text_color'] ); ?>; margin: 0; font-size: 14px;'
            >
                <?php esc_html_e( $stock_contents['stock_status_text'], 'storegrowth-sales-booster' ); ?>
            </p>
        <?php endif; ?>
	</div>
</div>
