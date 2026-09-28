<?php
/**
 * Dokan vendor dashboard styles.
 *
 * @package StorePulse\StoreGrowth\Integrations\Dokan\Dashboard
 */

namespace StorePulse\StoreGrowth\Integrations\Dokan\Dashboard;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Traits\Singleton;

/**
 * Dashboard EnqueueScript Class.
 */
class EnqueueScript {

	use Singleton;

	/**
	 * Constructor of EnqueueScript Class.
	 *
	 * @since 1.12.0
	 */
	public function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize Hooks.
	 *
	 * @since 1.12.0
	 *
	 * @return void
	 */
	private function init_hooks() {
		add_action( 'wp_enqueue_scripts', [ $this, 'dashboard_enqueue_scripts' ] );
	}

	/**
	 * Enqueue the vendor dashboard styles: the Countdown Timer fields on the
	 * Dokan product form.
	 *
	 * @since 1.12.0
	 * @since SPSG_VERSION A plain stylesheet in the Countdown Timer module (was
	 *                     a legacy bundle), loaded on the vendor dashboard only.
	 *
	 * @return void
	 */
	public function dashboard_enqueue_scripts() {
		if ( ! function_exists( 'dokan_is_seller_dashboard' ) || ! dokan_is_seller_dashboard() ) {
			return;
		}

		wp_enqueue_style(
			'spsg-dokan-dashboard-products',
			Helper::get_modules_url( 'countdown-timer/assets/css/dokan-countdown-timer-fields.css' ),
			[],
			STOREGROWTH_VERSION
		);
	}
}
