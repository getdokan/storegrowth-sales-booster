<?php
/**
 * Free Shipping Rules (progressive discount banner) settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Settings;

use StorePulse\StoreGrowth\Interfaces\GatedSettingsSchema;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule;
use StorePulse\StoreGrowth\Settings\DisplaySettings;

defined( 'ABSPATH' ) || exit;

/**
 * Fields of `spsg_progressive_discount_banner_settings`
 * (docs/redesign/modules/progressive-discount-banner.md §4).
 *
 * - Defaults are the old admin's, so stores keep their bar.
 * - Keys and values stay as stored: `discount_amount_mode` is
 *   `fixed-amount` / `percentage`, icon slugs `shipping-bar-icon-1..3`.
 * - The design's "Discount Type" (Free Shipping / Percentage / Fixed) writes
 *   `discount_type` and `discount_amount_mode`.
 * - A store that never saved (only the three seeded texts) shows no bar and
 *   applies no discount, as today (`storefront_settings()`); its first save
 *   writes every key sent.
 *
 * @since SPSG_VERSION
 */
class ProgressiveDiscountBannerSettings implements GatedSettingsSchema {

	/**
	 * Keys the first-boot seeding writes; an option holding only these was
	 * never saved by the admin.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const SEEDED_KEYS = [ 'default_banner_text', 'progressive_banner_text', 'goal_completion_text' ];

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return ProgressiveDiscountBannerModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_progressive_discount_banner_settings';
	}

	/**
	 * Field definitions keyed by option key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$text  = static function ( string $value ): array {
			return [
				'type'    => 'text',
				'default' => $value,
			];
		};
		$color = static function ( string $value ): array {
			return [
				'type'    => 'color',
				'default' => $value,
			];
		};

		$fields = [
			// Content.
			'progressive_banner_text'        => $text( __( 'Add more [amount] to get free shipping.', 'storegrowth-sales-booster' ) ),
			'goal_completion_text'           => $text( __( 'You have successfully acquired free shipping.', 'storegrowth-sales-booster' ) ),
			'progressive_banner_icon_name'   => [
				'type'    => 'select',
				'default' => 'shipping-bar-icon-1',
				'options' => [ '', 'shipping-bar-icon-1', 'shipping-bar-icon-2', 'shipping-bar-icon-3' ],
				'pro'     => true,
			],
			'progressive_banner_custom_icon' => [
				'type'    => 'url',
				'default' => '',
				'pro'     => true,
			],
			'btn_style'                      => [
				'type'    => 'toggle',
				'default' => true,
			],
			'btn_text'                       => $text( __( 'Cart', 'storegrowth-sales-booster' ) ),
			'btn_target'                     => [
				'type'    => 'url',
				'default' => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '',
			],

			// Configure.
			'discount_type'                  => [
				'type'    => 'select',
				'default' => 'free-shipping',
				'options' => [ 'free-shipping', 'discount-amount' ],
			],
			'discount_amount_mode'           => [
				'type'    => 'select',
				'default' => 'fixed-amount',
				'options' => [ 'fixed-amount', 'percentage' ],
			],
			// The old admin stored '' until an amount was typed.
			'discount_amount_value'          => [
				'type'        => 'number',
				'default'     => '',
				'min'         => 0,
				'step'        => 0.01,
				'allow_empty' => true,
			],
			'cart_minimum_amount'            => [
				'type'    => 'number',
				'default' => 10,
				'min'     => 0,
				'step'    => 0.01,
			],

			// Design.
			'btn_color'                      => $color( '#ffffff' ),
			'btn_text_color'                 => $color( '#073b4c' ),
			'bar_template'                   => [
				'type'    => 'select',
				'default' => 'shipping_bar_one',
				'options' => [ 'shipping_bar_one' ],
			],
		];

		return array_merge( $fields, DisplaySettings::bar_fields( 7 ), DisplaySettings::targeting_fields() );
	}

	/**
	 * Saved from the admin: the option holds more than the seeded texts.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return bool
	 */
	public function is_saved( $stored ): bool {
		return is_array( $stored ) && (bool) array_diff_key( $stored, array_flip( self::SEEDED_KEYS ) );
	}

	/**
	 * The stored settings with the defaults of every key not saved, for the
	 * storefront (saves write only changed keys). An option the admin never
	 * saved (empty, or only the seeded texts) is returned as it is, so the
	 * bar stays off and no discount applies, as before.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return array
	 */
	public function storefront_settings( $stored ): array {
		$stored = is_array( $stored ) ? $stored : [];

		if ( ! $this->is_saved( $stored ) ) {
			return $stored;
		}

		foreach ( $this->get_fields() as $key => $field ) {
			$empty_allowed = '' === ( $stored[ $key ] ?? null ) && ! empty( $field['allow_empty'] );

			if ( ! array_key_exists( $key, $stored ) || ( 'number' === $field['type'] && ! is_numeric( $stored[ $key ] ) && ! $empty_allowed ) ) {
				$stored[ $key ] = $field['default'];
			}
		}

		return $stored;
	}
}
