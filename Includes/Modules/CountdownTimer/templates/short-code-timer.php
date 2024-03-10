<?php
/**
 * Template for simple product stock bar.
 *
 * @package SBFW
 */

namespace STOREGROWTH\SPSB\Modules\CountdownTimer\Includes;

$settings = get_option( 'sgsb_countdown_timer_settings' );

// Countdown Styles.
$border_color     = sgsb_find_option_setting( $settings, 'border_color', '#1677FF' );
$heading_color    = sgsb_find_option_setting( $settings, 'heading_text_color', '#008DFF' );
$background_color = sgsb_find_option_setting( $settings, 'widget_background_color', '#FFF' );

?>
<div
	class="sgsb-countdown-timer <?php echo esc_attr( $layout_class ); ?>"
	style='border: 1px solid <?php echo esc_attr( $border_color ); ?>; background: <?php echo esc_attr( $background_color ); ?> !important'
>

	<div class="sgsb-countdown-timer-wrapper">
			<p
				class='sgsb-countdown-timer-heading <?php echo esc_attr( $layout_class ); ?>'
				style='color: <?php echo esc_attr( $layout_class !== 'ct-layout-2' ? $heading_color : '' ); ?>;'
			>
				<?php echo wp_kses_post( $heading ); ?>
			</p>

		<div class="sgsb-countdown-timer-items <?php echo esc_attr( $layout_class ); ?>" data-end-date="<?php echo esc_attr( $end_date ); ?> 23:59:59">
			<div class="sgsb-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>">
				<strong class="sgsb-countdown-timer-item-days">00</strong>
				<span>Days</span>
			</div>
			<span
				class="sgsb-colon <?php echo esc_attr( $layout_class ); ?>"
				style='color: <?php echo esc_attr( $layout_class !== 'ct-layout-2' ? $heading_color : '' ); ?>;'
			>:</span>
			<div class="sgsb-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>">
				<strong class="sgsb-countdown-timer-item-hours">00</strong>
				<span>Hours</span>
			</div>
			<span
				class="sgsb-colon <?php echo esc_attr( $layout_class ); ?>"
				style='color: <?php echo esc_attr( $layout_class !== 'ct-layout-2' ? $heading_color : '' ); ?>;'
			>:</span>
			<div class="sgsb-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>">
				<strong class="sgsb-countdown-timer-item-minutes">00</strong>
				<span>Min</span>
			</div>
			<span
				class="sgsb-colon <?php echo esc_attr( $layout_class ); ?>"
				style='color: <?php echo esc_attr( $layout_class !== 'ct-layout-2' ? $heading_color : '' ); ?>;'
			>:</span>
			<div class="sgsb-countdown-timer-item <?php echo esc_attr( $layout_class ); ?>">
				<strong class="sgsb-countdown-timer-item-seconds">00</strong>
				<span>Sec</span>
			</div>
		</div>
	</div>

</div>
