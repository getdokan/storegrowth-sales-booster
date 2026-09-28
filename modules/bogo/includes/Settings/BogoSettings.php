<?php
/**
 * BOGO global settings schema and page.
 *
 * @package StorePulse\StoreGrowth\Modules\BoGo
 */

namespace StorePulse\StoreGrowth\Modules\BoGo\Settings;

use StorePulse\StoreGrowth\Interfaces\GatedSettingsSchema;
use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;

defined( 'ABSPATH' ) || exit;

/**
 * Fields and page of `spsg_bogo_general_settings` (docs/redesign/modules/bogo.md
 * §9, 10b): the settings every offer shares.
 *
 * - Gated: the storefront reads the option raw (`Helper::get_bogo_settings_option()`),
 *   so the first save writes every key, the badge icon included.
 * - `bogo_category_messages` (pro's category messages, 10e) and
 *   `bogo_category_page_message` stay out of the schema; saves merge, so
 *   they're kept.
 *
 * @since SPSG_VERSION
 */
class BogoSettings implements GatedSettingsSchema, SettingsPage {

	/**
	 * Badge icons the storefront draws (`templates/bogo-offer-badge.php`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const BADGE_ICONS = [ 'bogo-icons-1', 'bogo-icons-2', 'bogo-icons-3', 'bogo-icons-4' ];

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return BoGoModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_bogo_general_settings';
	}

	/**
	 * Keys another screen writes into this option (pro's category messages).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const FOREIGN_KEYS = [ 'bogo_category_messages', 'bogo_category_page_message' ];

	/**
	 * Saved once the option holds anything but the category messages.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return bool
	 */
	public function is_saved( $stored ): bool {
		return is_array( $stored ) && (bool) array_diff_key( $stored, array_flip( self::FOREIGN_KEYS ) );
	}

	/**
	 * Fields, in page order.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$switch = static function ( string $section, string $label, string $help ): array {
			return [
				'type'    => 'toggle',
				'default' => false,
				'section' => $section,
				'label'   => $label,
				'help'    => $help,
			];
		};

		return [
			'offer_remove_from_cart'        => $switch( 'cart', __( 'Allow Remove Offer Product', 'storegrowth-sales-booster' ), __( 'Shoppers can remove the offer product from the cart.', 'storegrowth-sales-booster' ) ),
			'regular_price_show'            => $switch( 'cart', __( 'Show Regular Price', 'storegrowth-sales-booster' ), __( 'Show the regular price next to the offer price.', 'storegrowth-sales-booster' ) ),
			'shop_page_bage_icon'           => $switch( 'badge', __( 'Shop Page Badge Icon', 'storegrowth-sales-booster' ), __( 'Show the offer badge on products in the shop.', 'storegrowth-sales-booster' ) ),
			'global_product_page_bage_icon' => $switch( 'badge', __( 'Product Page Badge Icon', 'storegrowth-sales-booster' ), __( 'Show the offer badge on the product page.', 'storegrowth-sales-booster' ) ),
			// Drawn by the page (badge images, with the upload below).
			'default_badge_icon_name'       => [
				'type'    => 'select',
				'default' => 'bogo-icons-1',
				'options' => self::BADGE_ICONS,
				'pro'     => true,
				'section' => 'badge',
				'label'   => __( 'Badge Icon', 'storegrowth-sales-booster' ),
			],
			// Written by the Badge Icon control's Upload.
			'default_custom_badge_icon'     => [
				'type'    => 'url',
				'default' => '',
				'pro'     => true,
				'section' => 'badge',
				'hidden'  => true,
				'label'   => __( 'Custom Badge Icon', 'storegrowth-sales-booster' ),
			],
		];
	}

	/**
	 * The settings page: one card, two sections.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		return [
			'title'    => __( 'BOGO Settings', 'storegrowth-sales-booster' ),
			'sections' => [
				'cart'  => [
					'title' => __( 'Cart', 'storegrowth-sales-booster' ),
					'help'  => __( 'How offer products behave in the cart', 'storegrowth-sales-booster' ),
				],
				'badge' => [
					'title' => __( 'Offer Badge', 'storegrowth-sales-booster' ),
					'help'  => __( 'The badge on products with an offer', 'storegrowth-sales-booster' ),
				],
			],
		];
	}
}
