<?php
/**
 * Template for simple product stock bar.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\CountdownTimer\Includes;

if ( ! Helper::sgsb_stock_cd_is_product_discountable( $product->get_id() ) ) {
	return;
}

$settings                         = get_option( 'sgsb_countdown_timer_settings' );
$enable_countdown_in_product_page = sgsb_find_option_setting( $settings, 'product_page_countdown_enable', true );
$layout_class                     = sgsb_find_option_setting( $settings, 'selected_theme', 'ct-custom' );

if ( is_product() && ! $enable_countdown_in_product_page ) {
	return;
}

$start_date = get_post_meta( $product->get_id(), '_sgsb_countdown_timer_discount_start', true );
$end_date   = get_post_meta( $product->get_id(), '_sgsb_countdown_timer_discount_end', true );

$discount_amount = get_post_meta( $product->get_id(), '_sgsb_countdown_timer_discount_amount', true );

$heading_text = sgsb_find_option_setting( $settings, 'countdown_heading', 'Last chance! [discount]% OFF' );
$heading      = str_replace( '[discount]', $discount_amount, $heading_text );

$families = [
    'lato'          => 'Lato',
    'roboto'        => 'Roboto',
    'poppins'       => 'Poppins',
    'merienda'      => 'Merienda',
    'montserrat'    => 'Montserrat',
    'ibm_plex_sans' => 'IBM Plex Sans',
];

// Countdown Styles.
$font_family      = sgsb_find_option_setting( $settings, 'font_family', 'roboto' );
$border_color     = sgsb_find_option_setting( $settings, 'border_color', '#1677FF' );
$heading_color    = sgsb_find_option_setting( $settings, 'heading_text_color', '#008DFF' );
$background_color = sgsb_find_option_setting( $settings, 'widget_background_color', '#FFF' );

// Get countdown heading template conditionally.
$heading_color = ( $layout_class !== 'ct-layout-2' ? $heading_color : ( $heading_color !== 'transparent' ? $heading_color: 'default' ) );
$font_family   = ! empty( $families[ $font_family ] ) ? $families[ $font_family ] : $font_family;

$widget_style = apply_filters(
    'sgsb_countdown_timer_styles',
    array(
        'day_text_color'           => $layout_class === 'ct-layout-1' ? '#1B1B50' : '#FFFFFF',
        'hour_text_color'          => $layout_class === 'ct-layout-1' ? '#1B1B50' : '#FFFFFF',
        'minute_text_color'        => $layout_class === 'ct-layout-1' ? '#1B1B50' : '#FFFFFF',
        'second_text_color'        => $layout_class === 'ct-layout-1' ? '#1B1B50' : '#FFFFFF',
        'counter_border_color'     => $layout_class === 'ct-layout-1' ? '#ECEDF0' : 'transparent',
        'counter_background_color' => $layout_class === 'ct-layout-1' ? '#FFFFFF' : 'transparent',
    ),
    $settings
);

if ( $layout_class === 'ct-layout-1' ) {
    $colon_color = $widget_style['counter_background_color'] !== '#FFFFFF' ? $widget_style['counter_background_color'] : '#1B1B50';
} else {
    $colon_color  = $widget_style['counter_background_color'] !== 'transparent' ? $widget_style['counter_background_color'] : '#FFFFFF';
    $layout_class = $widget_style['counter_background_color'] === 'transparent' ? $layout_class : '';
}
?>
<div
	class="sgsb-countdown-timer <?php echo esc_attr( $layout_class ); ?>"
	style='border: 1px solid <?php echo esc_attr( $border_color ); ?>; background: <?php echo esc_attr( $background_color ); ?> !important'
>

	<div class="sgsb-countdown-timer-wrapper">
		<?php if ( $heading_text ) : ?>
			<p
                class='sgsb-countdown-timer-heading <?php echo esc_attr( $layout_class . ' ' . $heading_color ); ?>'
                style='color: <?php echo esc_attr( $heading_color ); ?>; font-family: <?php echo esc_attr( $font_family ); ?>;'
			>
				<?php echo wp_kses_post( $heading ); ?>
			</p>
		<?php endif; ?>

		<div class="sgsb-countdown-timer-items <?php echo esc_attr( $layout_class ); ?>" data-end-date="<?php echo esc_attr( $end_date ); ?>">
			<div
                class="sgsb-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>"
                style="
                    font-family: <?php echo esc_attr( $font_family ); ?>;
                    color: <?php echo esc_attr( $widget_style['day_text_color'] ) ?>;
                    background: <?php echo esc_attr( $widget_style['counter_background_color'] ) ?>;
                    border: 1px solid <?php echo esc_attr( $widget_style['counter_border_color'] ) ?>;
                "
            >
				<strong class="sgsb-countdown-timer-item-days">00</strong>
				<span>Days</span>
			</div>
			<span
                style='color: <?php echo esc_attr( $colon_color ); ?>;'
                class="sgsb-colon <?php echo esc_attr( $layout_class ); ?>"
			>:</span>
			<div
                class="sgsb-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>"
                style="
                    font-family: <?php echo esc_attr( $font_family ); ?>;
                    color: <?php echo esc_attr( $widget_style['hour_text_color'] ) ?>;
                    background: <?php echo esc_attr( $widget_style['counter_background_color'] ) ?>;
                    border: 1px solid <?php echo esc_attr( $widget_style['counter_border_color'] ) ?>;
                "
            >
				<strong class="sgsb-countdown-timer-item-hours">00</strong>
				<span>Hours</span>
			</div>
			<span
                style='color: <?php echo esc_attr( $colon_color ); ?>;'
                class="sgsb-colon <?php echo esc_attr( $layout_class ); ?>"
			>:</span>
			<div
                class="sgsb-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>"
                style="
                    font-family: <?php echo esc_attr( $font_family ); ?>;
                    color: <?php echo esc_attr( $widget_style['minute_text_color'] ) ?>;
                    background: <?php echo esc_attr( $widget_style['counter_background_color'] ) ?>;
                    border: 1px solid <?php echo esc_attr( $widget_style['counter_border_color'] ) ?>;
                "
            >
				<strong class="sgsb-countdown-timer-item-minutes">00</strong>
				<span>Min</span>
			</div>
			<span
                style='color: <?php echo esc_attr( $colon_color ); ?>;'
                class="sgsb-colon <?php echo esc_attr( $layout_class ); ?>"
			>:</span>
			<div
                class="sgsb-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>"
                style="
                    font-family: <?php echo esc_attr( $font_family ); ?>;
                    color: <?php echo esc_attr( $widget_style['second_text_color'] ) ?>;
                    background: <?php echo esc_attr( $widget_style['counter_background_color'] ) ?>;
                    border: 1px solid <?php echo esc_attr( $widget_style['counter_border_color'] ) ?>;
                "
            >
				<strong class="sgsb-countdown-timer-item-seconds">00</strong>
				<span>Sec</span>
			</div>
		</div>
	</div>

</div>
