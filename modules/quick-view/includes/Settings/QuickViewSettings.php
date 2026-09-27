<?php
/**
 * Quick View settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\QuickView
 */

namespace StorePulse\StoreGrowth\Modules\QuickView\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\QuickView\QuickViewModule;

defined( 'ABSPATH' ) || exit;

/**
 * Fields of `spsg_quick_view_settings` (docs/redesign/modules/quick-view.md §4).
 *
 * - Defaults are the old admin's (except the effect, now Fade); the storefront
 *   and pro 2.2.0 read every key with the same fallback, so a partly saved
 *   option behaves as before.
 * - Keys and values stay as stored, typo included (`enable_qucik_view_icon`).
 * - New values (additive, no migration): effect `mfp-none`, redirect
 *   `checkout-redirection`, position `top_right_of_the_image` (pro).
 * - The 3D Unfold (flip) effect is retired: `mfp-3d-unfold` stays stored
 *   but reads as Fade (`modal_effect()`).
 * - Unread keys stay out of the schema and in the option:
 *   `enable_product_navigation`, `show_quick_icon`, `navigation_text_color`.
 *
 * @since SPSG_VERSION
 */
class QuickViewSettings implements SettingsSchema {

	/**
	 * The modal effects on offer (magnific-popup classes), the default first.
	 *
	 * @since SPSG_VERSION
	 */
	const EFFECTS = [ 'mfp-fade', 'mfp-move-from-top', 'mfp-zoom-out', 'mfp-none' ];

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return QuickViewModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_quick_view_settings';
	}

	/**
	 * The modal effect the storefront uses. The retired 3D Unfold (flip),
	 * the old default, shows as Fade; its stored value is left as it is.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $settings Stored settings.
	 *
	 * @return string
	 */
	public static function modal_effect( $settings ): string {
		$effect = is_array( $settings ) ? ( $settings['modal_animation_effect'] ?? '' ) : '';

		return in_array( $effect, self::EFFECTS, true ) ? $effect : self::EFFECTS[0];
	}

	/**
	 * Field definitions keyed by option key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$toggle = static function ( bool $value, bool $pro = false ): array {
			return [
				'type'    => 'toggle',
				'default' => $value,
				'pro'     => $pro,
			];
		};
		$color  = static function ( string $value, bool $pro = false ): array {
			return [
				'type'    => 'color',
				'default' => $value,
				'pro'     => $pro,
			];
		};

		return [
			// General.
			'enable_in_mobile'         => $toggle( true ),
			'enable_zoom_box'          => $toggle( false ),
			// The old 3D Unfold (flip) effect is retired: see modal_effect().
			'modal_animation_effect'   => [
				'type'    => 'select',
				'default' => self::EFFECTS[0],
				'options' => self::EFFECTS,
			],
			// `add-to-cart-ajax` (Stay On Page) needs pro; the page offers it with pro.
			'cart_url_redirection'     => [
				'type'    => 'select',
				'default' => 'legacy-cart-redirection',
				'options' => [ 'shop-page-redirection', 'legacy-cart-redirection', 'checkout-redirection', 'add-to-cart-ajax' ],
			],
			'auto_open_fly_cart'       => $toggle( false, true ),

			// Button settings.
			'button_label'             => [
				'type'    => 'text',
				'default' => __( 'Quick View', 'storegrowth-sales-booster' ),
			],
			// `center_on_the_image` and `top_right_of_the_image` need pro.
			'button_position'          => [
				'type'    => 'select',
				'default' => 'after_add_to_cart',
				'options' => [ 'after_add_to_cart', 'before_add_to_cart', 'center_on_the_image', 'top_right_of_the_image' ],
			],
			'enable_qucik_view_icon'   => $toggle( false, true ),
			'quick_view_icon'          => [
				'type'    => 'select',
				'default' => 'quick-view-icon-1',
				'options' => [ 'quick-view-icon-1', 'quick-view-icon-2', 'quick-view-icon-3', 'quick-view-icon-4' ],
				'pro'     => true,
			],
			'enable_close_button'      => $toggle( true ),
			'show_view_details_button' => $toggle( false, true ),

			// Quick View contents.
			'show_title'               => $toggle( true ),
			'show_description'         => $toggle( true ),
			'show_price'               => $toggle( true ),
			'show_image'               => $toggle( true ),
			'show_excerpt'             => $toggle( true ),
			'show_meta'                => $toggle( true ),
			'show_add_to_cart'         => $toggle( true ),

			// Design.
			'button_border_radius'     => [
				'type'    => 'number',
				'default' => 4,
				'min'     => 0,
			],
			'button_color'             => $color( '#0875FF' ),
			'button_text_color'        => $color( '#ffffff' ),
			'modal_background_color'   => $color( '#ffffff' ),
			'navigation_background'    => $color( '#000000', true ),
		];
	}
}
