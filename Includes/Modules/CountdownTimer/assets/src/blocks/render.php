<?php
/**
 * Slider block
 *
 * @var array     $attributes Block attributes.
 * @var string    $content    Block default content.
 * @var \WP_Block $block      Block instance.
 *
 * @package sales-booster/sales-countdown
 */

$heading          = empty( $attributes['discountText'] ) ? false : $attributes['discountText'];
$border_color     = empty( $attributes['borderColor'] ) ? false : $attributes['borderColor'];
$heading_color    = empty( $attributes['headingColor'] ) ? false : $attributes['headingColor'];
$background_color = empty( $attributes['backgroundColor'] ) ? false : $attributes['backgroundColor'];
$start_date       = empty( $attributes['startDate'] ) ? false : $attributes['startDate'];
$end_date         = empty( $attributes['endDate'] ) ? false : $attributes['endDate'];

if ( strtotime( sprintf( '%s 00:00:00', $start_date ) ) > time() ) {
	$heading      = 'Starts In';
	$counter_time = sprintf( '%s 00:00:00', $start_date );
} else {
	$counter_time = sprintf( '%s 23:59:59', $end_date );
}

?>
<div
	class="sgsb-countdown-timer ct-layout-1"
	style='border: 1px solid <?php echo esc_attr( $border_color ); ?>; background: <?php echo esc_attr( $background_color ); ?> !important'
>

	<div class="sgsb-countdown-timer-wrapper">
			<p
				class='sgsb-countdown-timer-heading '
				style='color: <?php echo esc_attr( $heading_color ); ?>;'
			>
				<?php echo wp_kses_post( $heading ); ?>
			</p>

		<div class="sgsb-countdown-timer-items ct-layout-1" data-end-date="<?php echo esc_attr( $counter_time ); ?>">
			<div class="sgsb-countdown-timer-item ct-layout-1">
				<strong class="sgsb-countdown-timer-item-days">00</strong>
				<span>Days</span>
			</div>
			<span
				class="sgsb-colon ct-layout-1"
				style='color: <?php echo esc_attr( $heading_color ); ?>;'
			>:</span>
			<div class="sgsb-countdown-timer-item ct-layout-1">
				<strong class="sgsb-countdown-timer-item-hours">00</strong>
				<span>Hours</span>
			</div>
			<span
				class="sgsb-colon ct-layout-1"
				style='color: <?php echo esc_attr( $heading_color ); ?>;'
			>:</span>
			<div class="sgsb-countdown-timer-item ct-layout-1">
				<strong class="sgsb-countdown-timer-item-minutes">00</strong>
				<span>Min</span>
			</div>
			<span
				class="sgsb-colon ct-layout-1"
				style='color: <?php echo esc_attr( $heading_color ); ?>;'
			>:</span>
			<div class="sgsb-countdown-timer-item ct-layout-1">
				<strong class="sgsb-countdown-timer-item-seconds">00</strong>
				<span>Sec</span>
			</div>
		</div>
	</div>
</div>
<!-- .sales-countdown -->
