<?php
/**
 * Helper functions for countdown timer module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Helper.
 */
class Helper {

    /**
     * Stored font slug → CSS family.
     *
     * @since SPSG_VERSION
     *
     * @var array<string, string>
     */
    const FONT_FAMILIES = [
        'roboto'        => 'Roboto',
        'inter'         => 'Inter',
        'open_sans'     => 'Open Sans',
        'lato'          => 'Lato',
        'poppins'       => 'Poppins',
        'montserrat'    => 'Montserrat',
        'ibm_plex_sans' => 'IBM Plex Sans',
        'merienda'      => 'Merienda',
    ];

    /**
     * Colours of each template (`selected_theme`), in this order: widget
     * background, widget border, heading | counter background, counter border,
     * digits, labels, separators. The old layouts set only the counter.
     *
     * The admin's presets get them from here (AdminPage). On the storefront a
     * template's counter colours also apply in lite, where their fields need
     * pro; with pro, saved values win.
     *
     * @since SPSG_VERSION
     *
     * @var array<string, array<int, string|null>>
     */
    const TEMPLATES = [
        'ct-layout-1' => [ null, null, null, '#FFFFFF', '#ECEDF0', '#1B1B50', '#64748B', '#1E293B' ],
        'ct-layout-2' => [ null, null, null, 'transparent', 'transparent', '#FFFFFF', '#FFFFFF', '#FFFFFF' ],
        'ct-blue'     => [ '#FFFFFF', '#3B82F6', '#1D4ED8', '#FFFFFF', '#E2E8F0', '#1E293B', '#64748B', '#1E293B' ],
        'ct-dark'     => [ '#0F172A', '#1E293B', '#EF4444', '#1E293B', '#334155', '#FFFFFF', '#94A3B8', '#FFFFFF' ],
        'ct-red'      => [ '#E90F31', '#E90F31', '#1F2938', '#CA0D2B', '#CA0D2B', '#FFFFFF', '#FFE4E6', '#FFFFFF' ],
        'ct-gray'     => [ '#EFEFF2', '#E2E8F0', '#0F172A', '#FFFFFF', '#FFFFFF', '#1E293B', '#64748B', '#1E293B' ],
        'ct-cyan'     => [ '#00ACF9', '#00ACF9', '#0F172A', '#27BCFA', '#5BCDFB', '#FFFFFF', '#ECFDF5', '#FFFFFF' ],
        'ct-orange'   => [ '#FFBD00', '#FFBD00', '#AD0000', '#FEF3C7', '#FDE68A', '#78350F', '#B45309', '#78350F' ],
    ];

    /**
     * Counter colour settings (pro fields) a template sets.
     *
     * @since SPSG_VERSION
     *
     * @var string[]
     */
    const COUNTER_KEYS = [
        'counter_background_color',
        'counter_border_color',
        'day_text_color',
        'hour_text_color',
        'minute_text_color',
        'second_text_color',
        'counter_label_color',
        'counter_separator_color',
    ];

    /**
     * CSS family of a stored font slug; other values pass through.
     *
     * @since SPSG_VERSION
     *
     * @param mixed $slug Stored font.
     *
     * @return string
     */
    public static function font_family( $slug ): string {
        $slug = is_scalar( $slug ) ? (string) $slug : '';

        return self::FONT_FAMILIES[ $slug ] ?? $slug;
    }

    /**
     * The settings a template sets, setting key → colour. Unknown ids (e.g.
     * the old `ct-custom`) get the first layout's.
     *
     * @since SPSG_VERSION
     *
     * @param mixed $theme Template id.
     *
     * @return array<string, string>
     */
    public static function template_colors( $theme ): array {
        $colors = self::TEMPLATES[ is_string( $theme ) ? $theme : '' ] ?? self::TEMPLATES['ct-layout-1'];
        $digits = $colors[5];
        $keys   = [ 'widget_background_color', 'border_color', 'heading_text_color', 'counter_background_color', 'counter_border_color', 'day_text_color', 'counter_label_color', 'counter_separator_color' ];

        return array_merge(
            array_filter( array_combine( $keys, $colors ), 'is_string' ),
            [
                'hour_text_color'   => $digits,
                'minute_text_color' => $digits,
                'second_text_color' => $digits,
            ]
        );
    }

    /**
     * Check if product is discountable.
     *
     * @since 1.0.2
     *
     * @param int $product_id Product post ID.
     *
     * @return bool
     */
    public static function is_product_discountable( $product_id ) {
        $discount_amount = get_post_meta( $product_id, '_spsg_countdown_timer_discount_amount', true );
        $start_date      = get_post_meta( $product_id, '_spsg_countdown_timer_discount_start', true );
        $end_date        = get_post_meta( $product_id, '_spsg_countdown_timer_discount_end', true );

        // If data is not set.
        if ( ! $discount_amount || ! $end_date ) {
            return false;
        }

        // Check start date is later.
        if ( strtotime( $start_date ) > time() ) {
            return false;
        }

        // Check end date has passed.
        if ( strtotime( $end_date ) < time() ) {
            return false;
        }

        return true;
    }
}
