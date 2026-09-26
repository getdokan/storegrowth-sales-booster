<?php
/**
 * Template for the product page countdown timer.
 *
 * The classes and the `spsg_countdown_timer_styles` filter stay as they were
 * (pro's shop template, themes and custom CSS use them). The colours that
 * pass through the filter are printed here as `--spsg-countdown-timer-*`
 * variables; the other design settings come with the stylesheet
 * (`EnqueueScript::design_variables()`).
 *
 * @package SBFW
 */

use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\CountdownTimer\Helper;
use StorePulse\StoreGrowth\Storefront\StorefrontFonts;
use StorePulse\StoreGrowth\Storefront\StorefrontStyle;
use StorePulse\StoreGrowth\Storefront\StorefrontText;

if ( ! Helper::is_product_discountable( $product->get_id() ) ) {
	return;
}

$settings                         = PluginHelper::get_settings( 'spsg_countdown_timer_settings' );
$enable_countdown_in_product_page = PluginHelper::find_option_settings( $settings, 'product_page_countdown_enable', true );
$layout_class                     = PluginHelper::find_option_settings( $settings, 'selected_theme', 'ct-layout-1' );

if ( is_product() && ! $enable_countdown_in_product_page ) {
	return;
}

$end_date        = get_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_end', true );
$discount_amount = get_post_meta( $product->get_id(), '_spsg_countdown_timer_discount_amount', true );
$heading_text    = PluginHelper::find_option_settings( $settings, 'countdown_heading', __( 'Last chance! [discount]% OFF', 'storegrowth-sales-booster' ) );
$heading         = StorefrontText::replace( (string) $heading_text, [ 'discount' => $discount_amount ] );

// The second old layout draws the heading as a gradient when its colour is transparent.
$heading_class = 'ct-layout-2' === $layout_class && 'transparent' === PluginHelper::find_option_settings( $settings, 'heading_text_color', '' ) ? 'default' : '';

// Counter colours: the saved ones with pro, the template's otherwise and for
// any not saved (pro's filter reads them from the settings it gets).
$has_pro  = sp_store_growth()->has_pro();
$saved    = is_array( $settings ) ? $settings : [];
$counter  = array_intersect_key( Helper::template_colors( $layout_class ), array_flip( Helper::COUNTER_KEYS ) );
$settings = $has_pro ? $saved + $counter : array_merge( $saved, $counter );

/**
 * Filters the countdown's counter colours. Pro replaces the template's
 * colours with the saved ones.
 *
 * @since 1.1.1
 *
 * @param array $styles   Digit colours per unit, counter border and background colours.
 * @param array $settings Countdown Timer settings, with the template's counter colours for those not saved.
 */
$widget_style = apply_filters(
	'spsg_countdown_timer_styles',
	array_intersect_key( $settings, array_flip( [ 'day_text_color', 'hour_text_color', 'minute_text_color', 'second_text_color', 'counter_border_color', 'counter_background_color' ] ) ),
	$settings
);

// Boxes with their own background drop the second layout's gradient strip;
// its white captions would vanish on them, so unsaved ones take the first layout's.
if ( 'ct-layout-2' === $layout_class && 'transparent' !== $widget_style['counter_background_color'] ) {
	$captions     = array_intersect_key( Helper::template_colors( 'ct-layout-1' ), array_flip( [ 'counter_label_color', 'counter_separator_color' ] ) );
	$layout_class = '';
	$settings     = array_merge( $settings, $has_pro ? array_diff_key( $captions, $saved ) : $captions );
}

$color     = static function ( $value, string $fallback ): array {
	return [
		'value'   => $value,
		'type'    => 'color',
		'default' => $fallback,
	];
};
$variables = StorefrontStyle::declarations(
	'countdown-timer',
	[
		'counter-bg'      => $color( $widget_style['counter_background_color'], $counter['counter_background_color'] ),
		'counter-border'  => $color( $widget_style['counter_border_color'], $counter['counter_border_color'] ),
		'label-color'     => $color( $settings['counter_label_color'], $counter['counter_label_color'] ),
		'separator-color' => $color( $settings['counter_separator_color'], $counter['counter_separator_color'] ),
	]
);

// Fonts load only where the widget shows.
StorefrontFonts::request( Helper::font_family( $saved['font_family'] ?? 'roboto' ) );
StorefrontFonts::request( Helper::font_family( $has_pro ? $saved['counter_font_family'] ?? 'roboto' : 'roboto' ) );

$units = [
	'days'    => [ $widget_style['day_text_color'], __( 'Days', 'storegrowth-sales-booster' ) ],
	'hours'   => [ $widget_style['hour_text_color'], __( 'Hours', 'storegrowth-sales-booster' ) ],
	'minutes' => [ $widget_style['minute_text_color'], __( 'Min', 'storegrowth-sales-booster' ) ],
	'seconds' => [ $widget_style['second_text_color'], __( 'Sec', 'storegrowth-sales-booster' ) ],
];
?>
<div class="spsg-countdown-timer <?php echo esc_attr( $layout_class ); ?>" style="<?php echo esc_attr( $variables ); ?>">
	<div class="spsg-countdown-timer-wrapper">
		<?php if ( $heading_text ) : ?>
			<p class="spsg-countdown-timer-heading <?php echo esc_attr( trim( $layout_class . ' ' . $heading_class ) ); ?>">
				<?php echo wp_kses_post( $heading ); ?>
			</p>
		<?php endif; ?>

		<div class="spsg-countdown-timer-items <?php echo esc_attr( $layout_class ); ?>" data-end-date="<?php echo esc_attr( $end_date ); ?>">
			<?php foreach ( $units as $unit => [ $digit, $label ] ) : ?>
				<?php if ( 'days' !== $unit ) : ?>
					<span class="spsg-colon <?php echo esc_attr( $layout_class ); ?>">:</span>
				<?php endif; ?>
				<div
					class="spsg-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>"
					style="<?php echo esc_attr( StorefrontStyle::declarations( 'countdown-timer', [ 'digit-color' => $color( $digit, $counter['day_text_color'] ) ] ) ); ?>"
				>
					<strong class="spsg-countdown-timer-item-<?php echo esc_attr( $unit ); ?>">00</strong>
					<span><?php echo esc_html( $label ); ?></span>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</div>
