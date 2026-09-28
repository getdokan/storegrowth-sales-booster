<?php
/**
 * Fly Cart settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\FlyCart
 */

namespace StorePulse\StoreGrowth\Modules\FlyCart\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\FlyCart\FlyCartModule;

defined( 'ABSPATH' ) || exit;

/**
 * Fields of `spsg_fly_cart_settings` (docs/redesign/modules/fly-cart.md §4).
 *
 * - Defaults are the old admin's; the storefront and pro 2.2.0 read every key
 *   with the same fallback, so a partly saved option behaves as before.
 * - Pro values on lite keys: layout `center` (Centered Popup) and the icon
 *   positions `center-right` / `center-left`; the page offers them with pro.
 * - The Dokan store name / link switches are added by the Dokan integration
 *   (`spsg_settings_schema`).
 *
 * @since SPSG_VERSION
 */
class FlyCartSettings implements SettingsSchema, SettingsPage {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return FlyCartModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_fly_cart_settings';
	}

	/**
	 * Field definitions keyed by option key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		// A Cart Contents checkbox.
		$content = static function ( string $label, bool $value, bool $pro = false ): array {
			return [
				'type'    => 'toggle',
				'default' => $value,
				'pro'     => $pro,
				'tab'     => 'general',
				'section' => 'contents',
				'variant' => 'checkbox',
				'label'   => $label,
			];
		};
		// A Colors field.
		$color = static function ( string $label, string $value ): array {
			return [
				'type'    => 'color',
				'default' => $value,
				'tab'     => 'design',
				'section' => 'colors',
				'label'   => $label,
			];
		};

		// In page order: the settings page draws the fields from here.
		return [
			// General: layout (`center` needs pro). Drawn by the page (picker
			// cards with art).
			'layout'                      => [
				'type'        => 'select',
				'default'     => 'side',
				'options'     => [ 'side', 'center' ],
				'pro_options' => [ 'center' ],
				'tab'         => 'general',
				'section'     => 'layout',
				'label'       => __( 'Layout', 'storegrowth-sales-booster' ),
			],

			// Cart contents.
			'show_product_image'          => $content( __( 'Show Product Image', 'storegrowth-sales-booster' ), true ),
			'show_remove_icon'            => $content( __( 'Show Remove Icon', 'storegrowth-sales-booster' ), true ),
			'show_quantity_picker'        => $content( __( 'Show Quantity Picker', 'storegrowth-sales-booster' ), true ),
			// The storefront prints the price inside the quantity picker.
			'show_product_price'          => array_merge(
				$content( __( 'Show product price', 'storegrowth-sales-booster' ), true ),
				[ 'show_when' => [ 'show_quantity_picker' => true ] ]
			),
			'show_stock_status'           => $content( __( 'Show Stock Status', 'storegrowth-sales-booster' ), false, true ),
			'fly_cart_badge_icon'         => $content( __( 'Show BOGO Badge', 'storegrowth-sales-booster' ), true, true ),
			'show_free_shipping_message'  => $content( __( 'Show Free Shipping Message', 'storegrowth-sales-booster' ), false, true ),
			'show_coupon'                 => $content( __( 'Show coupon', 'storegrowth-sales-booster' ), true, true ),
			// Opens the cart panel after an add to cart.
			'enable_add_to_cart_redirect' => $content( __( 'Cart panel auto-opens', 'storegrowth-sales-booster' ), true, true ),

			// Design: `center-right` and `center-left` need pro. Drawn by the
			// page (picker cards with art).
			'icon_position'               => [
				'type'        => 'select',
				'default'     => 'bottom-right',
				'options'     => [ 'bottom-right', 'top-right', 'center-right', 'top-left', 'bottom-left', 'center-left' ],
				'pro_options' => [ 'center-right', 'center-left' ],
				'tab'         => 'design',
				'section'     => 'position',
				'label'       => __( 'Cart Icon Position', 'storegrowth-sales-booster' ),
			],
			// Drawn by the page (icon picker).
			'icon_name'                   => [
				'type'    => 'select',
				'default' => 'shopping-cart-icon-5',
				'options' => [ 'shopping-cart-icon-1', 'shopping-cart-icon-2', 'shopping-cart-icon-3', 'shopping-cart-icon-4', 'shopping-cart-icon-5' ],
				'tab'     => 'design',
				'section' => 'icon',
				'label'   => __( 'Cart Icon', 'storegrowth-sales-booster' ),
			],
			'buttons_bg_color'            => $color( __( 'Action Buttons Background', 'storegrowth-sales-booster' ), '#0875FF' ),
			'shopping_button_bg_color'    => $color( __( 'Shopping Button Background', 'storegrowth-sales-booster' ), '#073B4C' ),
			'icon_color'                  => $color( __( 'Cart Icon Color', 'storegrowth-sales-booster' ), '#FFF' ),
			'widget_bg_color'             => $color( __( 'Widget Background Color', 'storegrowth-sales-booster' ), '#FFFFFF' ),
			'product_card_bg_color'       => $color( __( 'Product Card Background Color', 'storegrowth-sales-booster' ), '#FFFFFF' ),
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
			'title' => __( 'Fly Cart', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'general' => [
					'label'    => __( 'General Setting', 'storegrowth-sales-booster' ),
					'sections' => [
						'layout'   => [
							'title' => __( 'Layout', 'storegrowth-sales-booster' ),
							'help'  => __( 'How the cart opens on the storefront', 'storegrowth-sales-booster' ),
						],
						'contents' => [
							'title' => __( 'Cart Contents', 'storegrowth-sales-booster' ),
							'help'  => __( 'What each line in the cart shows', 'storegrowth-sales-booster' ),
						],
					],
				],
				'design'  => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'position' => [
							'title' => __( 'Cart Icon Position', 'storegrowth-sales-booster' ),
							'help'  => __( 'Where the floating cart button sits', 'storegrowth-sales-booster' ),
						],
						'icon'     => [
							'title' => __( 'Cart Icon', 'storegrowth-sales-booster' ),
							'help'  => __( 'The glyph on the floating button', 'storegrowth-sales-booster' ),
						],
						'colors'   => [
							'title' => __( 'Colors', 'storegrowth-sales-booster' ),
							'help'  => __( 'Every colour on the cart', 'storegrowth-sales-booster' ),
						],
					],
				],
			],
		];
	}
}
