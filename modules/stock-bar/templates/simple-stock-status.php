<?php
/**
 * Template for simple product stock bar.
 *
 * @package SBFW
 */

if ( ! $product->managing_stock() ) {
	return;
}

$settings                         = \StorePulse\StoreGrowth\Helper::get_settings( 'spsg_stock_bar_settings' );
$enable_stock_bar_in_product_page = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'product_page_stock_bar_enable', true );

if ( is_product() && ! $enable_stock_bar_in_product_page ) {
	return;
}

$total_sales = intval( $product->get_total_sales() );
$stock       = intval( $product->get_stock_quantity() );
$total_stock = $stock + $total_sales;

$bar_height          = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'stockbar_height', '10' );
$bg_color            = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'stockbar_bg_color', '#e7efff' );
$fg_color            = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'stockbar_fg_color', '#0875ff' );
$sd_format           = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'stock_display_format', 'above' );
$total_sell_text     = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'total_sell_count_text', 'Total Sold' );
$available_item_text = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'available_item_count_text', 'Available Item' );

// Vars for threshold warning msg.
$show_stock_status = \StorePulse\StoreGrowth\Helper::find_option_settings( $settings, 'show_stock_status', true );
/**
 * Filters the stock bar's low-stock warning (threshold, color, text).
 *
 * @since 2.0.0
 *
 * @param array $contents Warning contents.
 * @param array $settings Stock bar settings.
 * @param int   $stock    Stock quantity.
 */
$stock_contents = apply_filters(
	'spsg_stock_bar_warning_contents',
	array(
		'quantity_required' => 10,
		'status_text_color' => '#073B4C',
		/* translators: %d: Items left in stock. */
		'stock_status_text' => sprintf( __( 'Hurry! only %d stocks left.', 'storegrowth-sales-booster' ), $stock ),
	),
	$settings,
	$stock
);

?>

<div class="spsg-stock-bar">
	<div
		class="spsg-stock-progress-bar-section wpbsc_total_sale spsg-stock-stock-bar-format-<?php echo esc_attr( $sd_format ); ?>"
		total-sale="<?php echo esc_attr( $total_sales ); ?>"
		total-stock="<?php echo esc_attr( $total_stock ); ?>"
		data-height="<?php echo esc_attr( $bar_height ); ?>"
		data-bgcolor="<?php echo esc_attr( $bg_color ); ?>"
		data-fgcolor="<?php echo esc_attr( $fg_color ); ?>"
	>
		<?php if ( 'above' === $sd_format ) : ?>
		<div class="spsg-stock-progress-title">
			<span class="spsg-stock-progress-sold-title">
				<?php echo esc_html( sprintf( '%1$s:', $total_sell_text ) ); ?>
				<span class="spsg-stock-progress-count">
					<?php echo esc_html( sprintf( '%1$s', $total_sales ) ); ?>
				</span>
			</span>
			<span class="spsg-stock-progress-available-title">
				<?php echo esc_html( sprintf( '%1$s:', $available_item_text ) ); ?>
				<span class="spsg-stock-progress-count">
					<?php echo esc_html( sprintf( '%1$s', $stock ) ); ?>
				</span>
			</span>
		</div>
		<?php endif; ?>
		<div class="jqmeter-container"></div>
		<?php
		if ( 'below' === $sd_format ) :
				/**
				 * Fires below the stock bar when the display format is "below".
				 *
				 * @since 2.0.0
				 */
				do_action( 'spsg_stock_bar_stock_below' );
			endif;
		?>

		<?php if ( $show_stock_status && ( $stock <= $stock_contents['quantity_required'] ) ) : ?>
			<p
				class='stock-status-warning-msg'
				style='color: <?php echo esc_attr( $stock_contents['status_text_color'] ); ?>; margin: 0; font-size: var(--spsg-stock-bar-status-size, 11px);'
			>
				<?php esc_html_e( $stock_contents['stock_status_text'], 'storegrowth-sales-booster' ); // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText -- Filtered text (`spsg_stock_bar_warning_contents`); kept through gettext as before. ?>
			</p>
		<?php endif; ?>
	</div>
</div>
