<?php
/**
 * Quick View settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\QuickView
 */

namespace StorePulse\StoreGrowth\Modules\QuickView\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
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
class QuickViewSettings implements SettingsSchema, SettingsPage {

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
		$toggle = static function ( bool $value, bool $pro, array $page ): array {
			return array_merge(
				[
					'type'    => 'toggle',
					'default' => $value,
					'pro'     => $pro,
				],
				$page
			);
		};
		$color  = static function ( string $value, bool $pro, string $label ): array {
			return [
				'type'    => 'color',
				'default' => $value,
				'pro'     => $pro,
				'tab'     => 'design',
				'label'   => $label,
			];
		};
		// A checkbox of the Quick View Contents section.
		$content = static function ( string $label ): array {
			return [
				'type'    => 'toggle',
				'default' => true,
				'pro'     => false,
				'tab'     => 'general',
				'section' => 'contents',
				'variant' => 'checkbox',
				'label'   => $label,
			];
		};

		// In page order: the settings page draws the fields from here.
		return [
			// General.
			'enable_in_mobile'         => $toggle(
				true,
				false,
				[
					'tab'   => 'general',
					'label' => __( 'Enable In Mobile', 'storegrowth-sales-booster' ),
				]
			),
			'enable_zoom_box'          => $toggle(
				false,
				false,
				[
					'tab'   => 'general',
					'label' => __( 'Enable Zoom Box', 'storegrowth-sales-booster' ),
				]
			),
			// The old 3D Unfold (flip) effect is retired: see modal_effect().
			'modal_animation_effect'   => [
				'type'    => 'select',
				'default' => self::EFFECTS[0],
				'options' => self::EFFECTS,
				'tab'     => 'general',
				'label'   => __( 'Modal Effects', 'storegrowth-sales-booster' ),
				'labels'  => [
					'mfp-fade'          => __( 'Fade', 'storegrowth-sales-booster' ),
					'mfp-move-from-top' => __( 'Slide', 'storegrowth-sales-booster' ),
					'mfp-zoom-out'      => __( 'Zoom', 'storegrowth-sales-booster' ),
					'mfp-none'          => __( 'None', 'storegrowth-sales-booster' ),
				],
			],
			// `add-to-cart-ajax` (Stay On Page) needs pro; the page offers it with pro.
			'cart_url_redirection'     => [
				'type'        => 'select',
				'default'     => 'legacy-cart-redirection',
				'options'     => [ 'shop-page-redirection', 'legacy-cart-redirection', 'checkout-redirection', 'add-to-cart-ajax' ],
				'pro_options' => [ 'add-to-cart-ajax' ],
				'tab'         => 'general',
				'label'       => __( 'Add To Cart Redirection', 'storegrowth-sales-booster' ),
				'labels'      => [
					'shop-page-redirection'   => __( 'Shop Page Redirect', 'storegrowth-sales-booster' ),
					'legacy-cart-redirection' => __( 'Cart Page Redirect', 'storegrowth-sales-booster' ),
					'checkout-redirection'    => __( 'Checkout Redirect', 'storegrowth-sales-booster' ),
					'add-to-cart-ajax'        => __( 'Stay On Page', 'storegrowth-sales-booster' ),
				],
			],
			// Drawn by the page: shown only while the Fly Cart module is active.
			'auto_open_fly_cart'       => $toggle(
				false,
				true,
				[
					'tab'       => 'general',
					'label'     => __( 'Auto Open Fly Cart', 'storegrowth-sales-booster' ),
					'show_when' => [ 'cart_url_redirection' => 'add-to-cart-ajax' ],
				]
			),

			// Button settings.
			'button_label'             => [
				'type'       => 'text',
				'default'    => __( 'Quick View', 'storegrowth-sales-booster' ),
				'tab'        => 'general',
				'section'    => 'button',
				'label'      => __( 'Quick View Button label', 'storegrowth-sales-booster' ),
				'max_length' => 15,
			],
			// `center_on_the_image` and `top_right_of_the_image` need pro.
			'button_position'          => [
				'type'        => 'select',
				'default'     => 'after_add_to_cart',
				'options'     => [ 'after_add_to_cart', 'before_add_to_cart', 'center_on_the_image', 'top_right_of_the_image' ],
				'pro_options' => [ 'center_on_the_image', 'top_right_of_the_image' ],
				'tab'         => 'general',
				'section'     => 'button',
				'label'       => __( 'Button Position', 'storegrowth-sales-booster' ),
				'labels'      => [
					'after_add_to_cart'      => __( 'After Add to Cart', 'storegrowth-sales-booster' ),
					'before_add_to_cart'     => __( 'Before Add to Cart', 'storegrowth-sales-booster' ),
					'center_on_the_image'    => __( 'Center On The Image', 'storegrowth-sales-booster' ),
					'top_right_of_the_image' => __( 'Top Right Of The Image', 'storegrowth-sales-booster' ),
				],
			],
			'enable_qucik_view_icon'   => $toggle(
				false,
				true,
				[
					'tab'     => 'general',
					'section' => 'button',
					'label'   => __( 'Enable Quick View Icon', 'storegrowth-sales-booster' ),
				]
			),
			// Drawn by the page (icon picker).
			'quick_view_icon'          => [
				'type'      => 'select',
				'default'   => 'quick-view-icon-1',
				'options'   => [ 'quick-view-icon-1', 'quick-view-icon-2', 'quick-view-icon-3', 'quick-view-icon-4' ],
				'pro'       => true,
				'tab'       => 'general',
				'section'   => 'button',
				'label'     => __( 'Button Icon', 'storegrowth-sales-booster' ),
				'show_when' => [ 'enable_qucik_view_icon' => true ],
			],
			'enable_close_button'      => $toggle(
				true,
				false,
				[
					'tab'     => 'general',
					'section' => 'button',
					'label'   => __( 'Enable Close Button', 'storegrowth-sales-booster' ),
				]
			),
			'show_view_details_button' => $toggle(
				false,
				true,
				[
					'tab'     => 'general',
					'section' => 'button',
					'label'   => __( 'Enable View Details Button', 'storegrowth-sales-booster' ),
				]
			),

			// Quick View contents.
			'show_title'               => $content( __( 'Show Title', 'storegrowth-sales-booster' ) ),
			'show_description'         => $content( __( 'Show Description', 'storegrowth-sales-booster' ) ),
			'show_price'               => $content( __( 'Show Price', 'storegrowth-sales-booster' ) ),
			'show_image'               => $content( __( 'Show Product Image', 'storegrowth-sales-booster' ) ),
			'show_excerpt'             => $content( __( 'Show Excerpt', 'storegrowth-sales-booster' ) ),
			'show_meta'                => $content( __( 'Show Product Meta', 'storegrowth-sales-booster' ) ),
			'show_add_to_cart'         => $content( __( 'Show Add to Cart', 'storegrowth-sales-booster' ) ),

			// Design.
			'button_border_radius'     => [
				'type'    => 'number',
				'default' => 4,
				'min'     => 0,
				'tab'     => 'design',
				'label'   => __( 'Button Border Radius', 'storegrowth-sales-booster' ),
				'suffix'  => 'px',
			],
			'button_color'             => $color( '#0875FF', false, __( 'Button Color', 'storegrowth-sales-booster' ) ),
			'button_text_color'        => $color( '#ffffff', false, __( 'Button Text Color', 'storegrowth-sales-booster' ) ),
			'modal_background_color'   => $color( '#ffffff', false, __( 'Modal Background Color', 'storegrowth-sales-booster' ) ),
			'navigation_background'    => $color( '#000000', true, __( 'Navigation Background Color', 'storegrowth-sales-booster' ) ),
		];
	}

	/**
	 * The settings page: title, tabs and sections.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		return [
			'title' => __( 'Quick View', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'general' => [
					'label'    => __( 'General Setting', 'storegrowth-sales-booster' ),
					'sections' => [
						'button'   => [
							'title' => __( 'Button Settings', 'storegrowth-sales-booster' ),
							'help'  => __( "The Quick View button and the modal's own controls", 'storegrowth-sales-booster' ),
						],
						'contents' => [
							'title' => __( 'Quick View Contents', 'storegrowth-sales-booster' ),
							'help'  => __( 'What the modal shows', 'storegrowth-sales-booster' ),
						],
					],
				],
				'design'  => [
					'label' => __( 'Design', 'storegrowth-sales-booster' ),
				],
			],
		];
	}
}
