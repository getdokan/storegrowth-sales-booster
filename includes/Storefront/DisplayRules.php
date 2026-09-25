<?php
/**
 * Storefront display rules for bars and popups.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Storefront;

use StorePulse\StoreGrowth\Helper;

defined( 'ABSPATH' ) || exit;

/**
 * One server-side check for whether a bar or popup renders (ADR-005 S6).
 *
 * It mirrors what lite does today, no more:
 * - the visitor is in the promotion audience
 *   (`Helper::is_current_user_allowed_to_view_promotions()`);
 * - at least one device is chosen in `banner_device_view`.
 *
 * Page and visibility targeting (`banner_show_option`, `slected_page_option`,
 * `user_type`) is pro's, applied through pro's own filters; this class does
 * not evaluate those keys, so a lite-only site keeps its current behaviour.
 * Which device the visitor is on is decided in the browser
 * (`spsgStorefront.matchesDevice()`), so full-page caches stay valid.
 *
 * @since SPSG_VERSION
 */
class DisplayRules {

	/**
	 * Whether a module's bar or popup should render on this request.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array  $settings Module settings (as stored).
	 * @param string $module   Module id.
	 * @param array  $defaults Module defaults for missing keys, e.g. `banner_device_view`.
	 *
	 * @return bool
	 */
	public static function should_show( array $settings, string $module, array $defaults = array() ): bool {
		$show = Helper::is_current_user_allowed_to_view_promotions();

		if ( $show ) {
			$devices = Helper::find_option_settings( $settings, 'banner_device_view', $defaults['banner_device_view'] ?? array() );
			$show    = ! empty( $devices );
		}

		/**
		 * Filters whether a module's bar or popup renders. Runs after lite's
		 * audience and device checks, so pro or an extension can add page and
		 * visibility rules at the same point.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param bool   $show     Whether it renders.
		 * @param array  $settings Module settings.
		 * @param string $module   Module id.
		 */
		return (bool) apply_filters( 'spsg_display_rules_should_show', $show, $settings, $module );
	}
}
