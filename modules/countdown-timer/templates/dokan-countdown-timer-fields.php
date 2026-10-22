<?php
/**
 * Show countdown timer fields on Dokan product edit page.
 *
 * @package SBFW
 *
 * @var array $args
 */

use StorePulse\StoreGrowth\Modules\CountdownTimer\CountdownTimerModule;
use StorePulse\StoreGrowth\Modules\CountdownTimer\Helper;

$defaults = [
    'post_id'      => 0,
    'product'      => null,
];


// Allow developers to filter the default arguments
$defaults = apply_filters('spsg_countdown_timer_fields_defaults', $defaults);

$args = wp_parse_args($args, $defaults);

$post_id     = $args['post_id'];

// If the vendor is not allowed to create countdown discounts, return early
// (the stored setting is a bool, or `off` from older versions).
$show_discount_field = Helper::vendor_can( 'vendor_can_create_countdown_discount' );

if ( ! $show_discount_field ) {
    return;
}

$show_date_fields = Helper::vendor_can( 'vendor_can_create_schedule_timer' );


// Get discount amount and dates
$discount_amount = get_post_meta($post_id,'_spsg_countdown_timer_discount_amount', true);
$dates_from = get_post_meta($post_id, '_spsg_countdown_timer_discount_start', true);
$dates_to   = get_post_meta($post_id, '_spsg_countdown_timer_discount_end', true);

$dates_from = $dates_from ? gmdate('Y-m-d', strtotime($dates_from)) : '';
$dates_to   = $dates_to ? gmdate('Y-m-d', strtotime($dates_to)) : '';

// Use settings from options for permissions

$doc_link = storegrowth_get_container()->get(CountdownTimerModule::get_id())->get_doc_link();
?>

<div class="dokan-edit-row dokan-clearfix dokan-countdown-timer-options">
    <div class="dokan-section-heading" data-togglehandler="dokan_countdown_timer_options">
        <h2><i class="fas fa-clock"></i> <?php esc_html_e( 'Countdown Timer', 'storegrowth-sales-booster' ); ?></h2>
        <p><?php esc_html_e( 'Configure countdown timer settings for this product', 'storegrowth-sales-booster' ); ?></p>
        <a href="#" class="dokan-section-toggle">
            <i class="fas fa-sort-down fa-flip-vertical" aria-hidden="true"></i>
        </a>
        <div class="dokan-clearfix"></div>
    </div>
    <div class="dokan-section-content">
        <?php if ( $show_discount_field ) : ?>
        <div class='dokan-countdown-timer-wrapper'>
            <div class="dokan-form-group dokan-countdown-timer-discount">
                <label for="_spsg_countdown_timer_discount_amount" class="form-label"><?php esc_html_e( 'Product Discount (%)', 'storegrowth-sales-booster' ); ?></label>
                <input type="number" class="dokan-form-control" name="_spsg_countdown_timer_discount_amount" id="_spsg_countdown_timer_discount_amount" value="<?php echo esc_attr( $discount_amount ); ?>" placeholder="<?php esc_attr_e( 'Set the discount as percentage', 'storegrowth-sales-booster' ); ?>">
                <span class="description"><?php esc_html_e( 'Set the countdown timer discount as percentage.', 'storegrowth-sales-booster' ); ?></span>
            </div>

            <?php if ( $show_date_fields ) : ?>
                <div class="dokan-form-group dokan-countdown-timer-date-wrapper sale_price_dates_fields">
                    <label class="form-label"><?php esc_html_e( 'Discount dates', 'storegrowth-sales-booster' ); ?></label>
                    <div class="dokan-input-group">
                        <input type="text" class="dokan-form-control datepicker" name="_spsg_countdown_timer_discount_start" id="_spsg_countdown_timer_discount_start" value="<?php echo esc_attr( $dates_from ); ?>" placeholder="<?php esc_attr_e( 'Start date... YYYY-MM-DD', 'storegrowth-sales-booster' ); ?>" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])">
                        <span class="dokan-input-group-addon"><?php esc_html_e( 'to', 'storegrowth-sales-booster' ); ?></span>
                        <input type="text" class="dokan-form-control datepicker" name="_spsg_countdown_timer_discount_end" id="_spsg_countdown_timer_discount_end" value="<?php echo esc_attr( $dates_to ); ?>" placeholder="<?php esc_attr_e( 'End date... YYYY-MM-DD', 'storegrowth-sales-booster' ); ?>" maxlength="10" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])">
                        <input type="hidden" value="spsg_countdown_timer_dates_fields">
                    </div>
                    <span class="description"><?php esc_html_e( 'The sale will start at 00:00:00 of "Start" date and end at 23:59:59 of "End" date.', 'storegrowth-sales-booster' ); ?></span>
                </div>
			<?php else : ?>
				<?php // The store schedules countdowns: show the vendor the dates it set, or that none are set yet. ?>
				<div class="dokan-form-group dokan-countdown-timer-date-wrapper">
					<label class="form-label"><?php esc_html_e( 'Discount dates', 'storegrowth-sales-booster' ); ?></label>
					<p class="description">
						<?php
						if ( $dates_to ) {
							echo esc_html(
								sprintf(
									/* translators: 1: start date, or "now", 2: end date (Y-m-d). */
									__( 'Set by the store: %1$s to %2$s.', 'storegrowth-sales-booster' ),
									$dates_from ? $dates_from : __( 'now', 'storegrowth-sales-booster' ),
									$dates_to
								)
							);
						} else {
							esc_html_e( 'The store sets the dates. The countdown and discount show once it has set an end date.', 'storegrowth-sales-booster' );
						}
						?>
					</p>
				</div>
			<?php endif; ?>
        </div>


			<?php if ( $show_date_fields ) : ?>
            <div class="dokan-form-group">
                <span class="description " >
                    <?php
                    echo wp_kses(
                        sprintf( __( 'All the fields are required to show the countdown. To learn more, please view the <b><a href="%s" target="_blank">%s</a></b>', 'storegrowth-sales-booster' ), $doc_link, __( 'Documentation', 'storegrowth-sales-booster' ) ),
                        [
                            'b' => [],
                            'a' => [
                                'href'   => [],
                                'target' => [],
                            ],
                        ]
                    );
                    ?>
                </span>
            </div>
			<?php endif; ?>
        <?php endif; ?>
    </div>
</div>
