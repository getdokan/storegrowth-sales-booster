<?php
/**
 * Enqueue_Script class for `Countdown Timer` module.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Modules\CountdownTimer;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Traits\Singleton;
use StorePulse\StoreGrowth\Helper as PluginHelper;
use StorePulse\StoreGrowth\Modules\CountdownTimer\Settings\CountdownTimerSettings;
use StorePulse\StoreGrowth\Storefront\StorefrontFonts;
use StorePulse\StoreGrowth\Storefront\StorefrontStyle;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles and scripts files of `Countdown Timer` module inside this class.
 */
class EnqueueScript implements HookRegistry {
	use Singleton;

	/**
	 * Alignment setting → flex alignment.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<string, string>
	 */
	const FLEX = [
		'left'   => 'flex-start',
		'center' => 'center',
		'right'  => 'flex-end',
	];

	/**
	 * Register Hooks.
	 *
	 * @since 2.0.0
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// The admin page loads from AdminPage, which runs even while the module is off.
		add_action( 'wp_enqueue_scripts', array( $this, 'wp_enqueue_scripts' ) );
	}

	/**
	 * Add JS scripts to frontend.
	 *
	 * Enqueue CSS and JS for fly cart.
	 */
	public function wp_enqueue_scripts() {

		wp_enqueue_style(
			'spsg-cd-timer-custom-style',
			PluginHelper::get_modules_url( 'countdown-timer/assets/scripts/wpbs-style.css' ),
			array(),
			filemtime( PluginHelper::get_modules_path( 'countdown-timer/assets/scripts/wpbs-style.css' ) )
		);

		wp_enqueue_script(
			'spsg-jquery-countdown',
			PluginHelper::get_modules_url( 'countdown-timer/assets/scripts/jquery.countdown.min.js' ),
			array( 'jquery' ),
			filemtime( PluginHelper::get_modules_path( 'countdown-timer/assets/scripts/jquery.countdown.min.js' ) ),
			true
		);

		wp_enqueue_script(
			'wpbsc_custom_script',
			PluginHelper::get_modules_url( 'countdown-timer/assets/scripts/custom.js' ),
			array( 'jquery', 'spsg-jquery-countdown' ),
			filemtime( PluginHelper::get_modules_path( 'countdown-timer/assets/scripts/custom.js' ) ),
			true
		);

		$this->inline_styles();
	}

	/**
	 * All inline styles
	 */
	private function inline_styles() {
		$settings = PluginHelper::get_settings( 'spsg_countdown_timer_settings' );

		if ( 'Twenty Twenty-One' === wp_get_theme()->name ) {
			wp_add_inline_style( 'spsg-cd-timer-custom-style', '.spsg-countdown-timer { margin-top: 18px; }' );
		}

		$this->design_variables( is_array( $settings ) ? $settings : [] );
	}

	/**
	 * The widget's design settings as `--spsg-countdown-timer-*` variables
	 * (ADR-005 S1), read by `wpbs-style.css` with the defaults as fallbacks.
	 * Only saved keys are printed. The rule targets the widget root, so pro's
	 * shop template (same classes) gets them too.
	 *
	 * The counter colours are not here: they pass through the
	 * `spsg_countdown_timer_styles` filter, so the template prints them.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $settings Countdown Timer settings.
	 *
	 * @return void
	 */
	private function design_variables( array $settings ): void {
		$fields  = storegrowth_get_container()->get( CountdownTimerSettings::class )->get_fields();
		$has_pro = sp_store_growth()->has_pro();
		$specs   = [
			'bg'               => [ 'widget_background_color', 'color' ],
			'border'           => [ 'border_color', 'color' ],
			'radius'           => [ 'widget_radius', 'px' ],
			'margin'           => [ 'widget_margin', 'box' ],
			'padding'          => [ 'widget_padding', 'box' ],
			'align'            => [ 'widget_alignment', 'flex' ],
			'text-align'       => [ 'widget_alignment', 'keyword' ],
			'heading-color'    => [ 'heading_text_color', 'color' ],
			'heading-font'     => [ 'font_family', 'font' ],
			'heading-weight'   => [ 'heading_font_weight', 'number' ],
			'heading-tracking' => [ 'heading_letter_spacing', 'px' ],
			'heading-leading'  => [ 'heading_line_height', 'px' ],
			'counter-radius'   => [ 'counter_radius', 'px' ],
			'counter-margin'   => [ 'counter_margin', 'box' ],
			'counter-padding'  => [ 'counter_padding', 'box' ],
			'counter-align'    => [ 'counter_alignment', 'flex' ],
			'counter-font'     => [ 'counter_font_family', 'font' ],
			'counter-weight'   => [ 'counter_font_weight', 'number' ],
			'counter-tracking' => [ 'counter_letter_spacing', 'px' ],
		];

		$tokens = [];

		foreach ( $specs as $token => [ $key, $type ] ) {
			// Saved values only; pro's only while pro is active.
			if ( ! isset( $settings[ $key ] ) || ( ! empty( $fields[ $key ]['pro'] ) && ! $has_pro ) ) {
				continue;
			}

			$value   = $settings[ $key ];
			$default = $fields[ $key ]['default'];
			$allowed = array_keys( self::FLEX );

			if ( 'font' === $type ) {
				$value   = Helper::font_family( $value );
				$default = Helper::font_family( $default );

				// Pro's shop-loop template; the product template asks for its own.
				if ( is_shop() || is_product_taxonomy() ) {
					StorefrontFonts::request( $value );
				}
			}

			if ( 'flex' === $type ) {
				$value   = self::FLEX[ is_string( $value ) ? $value : '' ] ?? self::FLEX[ $default ];
				$default = self::FLEX[ $default ];
				$allowed = array_values( self::FLEX );
				$type    = 'keyword';
			}

			$tokens[ $token ] = [
				'value'   => $value,
				'type'    => $type,
				'default' => $default,
				'allowed' => $allowed,
			];
		}

		StorefrontStyle::attach( 'spsg-cd-timer-custom-style', 'countdown-timer', $tokens );
	}
}
