<?php
/**
 * Countdown Timer settings page assets.
 *
 * @package StorePulse\StoreGrowth\Modules\CountdownTimer
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer;

use StorePulse\StoreGrowth\Admin\ModuleAdminPage;

defined( 'ABSPATH' ) || exit;

/**
 * Loads the Countdown Timer settings page into the admin app, with the
 * storefront stylesheet its preview renders with (ADR-005 S10) and the
 * template colours and fonts from `Helper` (`window.spsgCountdownTimer`).
 * Fonts load on demand from the preview.
 *
 * @since SPSG_VERSION
 */
class AdminPage extends ModuleAdminPage {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	protected function module_id(): string {
		return CountdownTimerModule::get_id();
	}

	/**
	 * The timer's stylesheet.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, string>
	 */
	protected function stylesheets(): array {
		return [
			'spsg-cd-timer-custom-style' => 'modules/countdown-timer/assets/scripts/wpbs-style.css',
		];
	}

	/**
	 * The template colours and font names the storefront uses, for the
	 * presets and preview.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array>
	 */
	protected function data(): array {
		return [
			'spsgCountdownTimer' => [
				'templates' => array_map( [ Helper::class, 'template_colors' ], array_combine( array_keys( Helper::TEMPLATES ), array_keys( Helper::TEMPLATES ) ) ),
				'fonts'     => Helper::FONT_FAMILIES,
			],
		];
	}
}
