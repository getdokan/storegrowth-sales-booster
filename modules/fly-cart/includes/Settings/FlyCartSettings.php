<?php
/**
 * Fly Cart settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\FlyCart
 */

namespace StorePulse\StoreGrowth\Modules\FlyCart\Settings;

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
class FlyCartSettings implements SettingsSchema {

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
		$toggle = static function ( bool $value, bool $pro = false ): array {
			return [
				'type'    => 'toggle',
				'default' => $value,
				'pro'     => $pro,
			];
		};
		$color  = static function ( string $value ): array {
			return [
				'type'    => 'color',
				'default' => $value,
			];
		};

		return [
			// General: layout (`center` needs pro).
			'layout'                      => [
				'type'    => 'select',
				'default' => 'side',
				'options' => [ 'side', 'center' ],
			],

			// Cart contents.
			'show_product_image'          => $toggle( true ),
			'show_remove_icon'            => $toggle( true ),
			'show_quantity_picker'        => $toggle( true ),
			'show_product_price'          => $toggle( true ),
			'show_stock_status'           => $toggle( false, true ),
			'fly_cart_badge_icon'         => $toggle( true, true ),
			'show_free_shipping_message'  => $toggle( false, true ),
			'show_coupon'                 => $toggle( true, true ),
			// Opens the cart panel after an add to cart.
			'enable_add_to_cart_redirect' => $toggle( true, true ),

			// Design: `center-right` and `center-left` need pro.
			'icon_position'               => [
				'type'    => 'select',
				'default' => 'bottom-right',
				'options' => [ 'bottom-right', 'top-right', 'center-right', 'top-left', 'bottom-left', 'center-left' ],
			],
			'icon_name'                   => [
				'type'    => 'select',
				'default' => 'shopping-cart-icon-5',
				'options' => [ 'shopping-cart-icon-1', 'shopping-cart-icon-2', 'shopping-cart-icon-3', 'shopping-cart-icon-4', 'shopping-cart-icon-5' ],
			],
			'buttons_bg_color'            => $color( '#0875FF' ),
			'shopping_button_bg_color'    => $color( '#073B4C' ),
			'icon_color'                  => $color( '#FFF' ),
			'widget_bg_color'             => $color( '#FFFFFF' ),
			'product_card_bg_color'       => $color( '#FFFFFF' ),
		];
	}
}
