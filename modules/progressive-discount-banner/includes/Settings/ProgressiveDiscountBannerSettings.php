<?php
/**
 * Free Shipping Rules (progressive discount banner) settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Settings;

use StorePulse\StoreGrowth\Interfaces\GatedSettingsSchema;
use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule;
use StorePulse\StoreGrowth\Settings\DisplaySettings;
use StorePulse\StoreGrowth\Settings\SettingsService;

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
class ProgressiveDiscountBannerSettings implements GatedSettingsSchema, SettingsPage {

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
		// The bar prints these with wp_kses_post, and the old admin stored markup.
		$text      = static function ( string $value, array $page ): array {
			return array_merge(
				[
					'type'    => 'text',
					'default' => $value,
					'html'    => true,
				],
				$page
			);
		};
		$color     = static function ( string $value, string $label ): array {
			return [
				'type'    => 'color',
				'default' => $value,
				'tab'     => 'design',
				'section' => 'colors',
				'label'   => $label,
			];
		};
		$bar       = DisplaySettings::bar_fields( 7 );
		$targeting = DisplaySettings::targeting_fields();

		// In page order: the settings page draws the fields from here.
		return array_merge(
			// Content.
			[
				'progressive_banner_text'        => $text(
					__( 'Add more [amount] to get free shipping.', 'storegrowth-sales-booster' ),
					[
						'tab'     => 'content',
						'variant' => 'textarea',
						'rows'    => 2,
						'label'   => __( 'Banner Text', 'storegrowth-sales-booster' ),
						'help'    => __( '[amount] is replaced with what is left to spend.', 'storegrowth-sales-booster' ),
					]
				),
				'goal_completion_text'           => $text(
					__( 'You have successfully acquired free shipping.', 'storegrowth-sales-booster' ),
					[
						'tab'     => 'content',
						'variant' => 'textarea',
						'rows'    => 2,
						'label'   => __( 'Goal Completion Text', 'storegrowth-sales-booster' ),
					]
				),
				// Drawn by the page (icon picker, with the custom icon upload).
				'progressive_banner_icon_name'   => [
					'type'    => 'select',
					'default' => 'shipping-bar-icon-1',
					'options' => [ '', 'shipping-bar-icon-1', 'shipping-bar-icon-2', 'shipping-bar-icon-3' ],
					'pro'     => true,
					'tab'     => 'content',
					'label'   => __( 'Banner Icon', 'storegrowth-sales-booster' ),
				],
				'progressive_banner_custom_icon' => [
					'type'    => 'url',
					'default' => '',
					'pro'     => true,
					'tab'     => 'content',
					'hidden'  => true,
				],
				'btn_style'                      => [
					'type'    => 'toggle',
					'default' => true,
					'tab'     => 'content',
					'label'   => __( 'Display CTA Button', 'storegrowth-sales-booster' ),
				],
				'btn_text'                       => $text(
					__( 'Cart', 'storegrowth-sales-booster' ),
					[
						'tab'       => 'content',
						'label'     => __( 'CTA Name', 'storegrowth-sales-booster' ),
						'show_when' => [ 'btn_style' => true ],
					]
				),
				'btn_target'                     => [
					'type'        => 'url',
					'default'     => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '',
					'tab'         => 'content',
					'label'       => __( 'CTA Target URI', 'storegrowth-sales-booster' ),
					'placeholder' => 'https://',
					'show_when'   => [ 'btn_style' => true ],
				],
			],
			// Configure.
			DisplaySettings::place(
				[
					'bar_position' => $bar['bar_position'],
					'bar_type'     => $bar['bar_type'],
				],
				'configure'
			),
			[
				// Drawn by the page: one Discount Type select over this key
				// and `discount_amount_mode`.
				'discount_type'         => [
					'type'    => 'select',
					'default' => 'free-shipping',
					'options' => [ 'free-shipping', 'discount-amount' ],
					'tab'     => 'configure',
					'label'   => __( 'Discount Type', 'storegrowth-sales-booster' ),
				],
				'discount_amount_mode'  => [
					'type'    => 'select',
					'default' => 'fixed-amount',
					'options' => [ 'fixed-amount', 'percentage' ],
					'tab'     => 'configure',
					'hidden'  => true,
				],
				// The old admin stored '' until an amount was typed. Drawn by
				// the page (currency or % by `discount_amount_mode`).
				'discount_amount_value' => [
					'type'        => 'number',
					'default'     => '',
					'min'         => 0,
					'step'        => 0.01,
					'allow_empty' => true,
					'tab'         => 'configure',
					'label'       => __( 'Discount Amount', 'storegrowth-sales-booster' ),
					'show_when'   => [ 'discount_type' => 'discount-amount' ],
				],
				'cart_minimum_amount'   => [
					'type'    => 'number',
					'default' => 10,
					'min'     => 0,
					'step'    => 0.01,
					'tab'     => 'configure',
					'label'   => __( 'Cart Minimum Amount', 'storegrowth-sales-booster' ),
					'prefix'  => function_exists( 'get_woocommerce_currency_symbol' ) ? html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES ) : '',
				],
			],
			DisplaySettings::place(
				array_merge(
					[
						'banner_device_view'  => array_merge( $bar['banner_device_view'], [ 'label' => __( 'Show Banner', 'storegrowth-sales-booster' ) ] ),
						'banner_trigger'      => $bar['banner_trigger'],
						'banner_delay'        => $bar['banner_delay'],
						'scroll_banner_delay' => $bar['scroll_banner_delay'],
					],
					$targeting
				),
				'configure',
				'display'
			),
			// Design.
			DisplaySettings::place(
				[
					'banner_height' => $bar['banner_height'],
					'font_family'   => $bar['font_family'],
					'font_size'     => $bar['font_size'],
				],
				'design',
				'banner'
			),
			DisplaySettings::place(
				[
					'background_color' => $bar['background_color'],
					'text_color'       => $bar['text_color'],
					'icon_color'       => $bar['icon_color'],
					'close_icon_color' => array_merge( $bar['close_icon_color'], [ 'label' => __( 'Close Button Color', 'storegrowth-sales-booster' ) ] ),
				],
				'design',
				'colors'
			),
			[
				'btn_color'      => $color( '#ffffff', __( 'CTA Background', 'storegrowth-sales-booster' ) ),
				'btn_text_color' => $color( '#073b4c', __( 'CTA Text Color', 'storegrowth-sales-booster' ) ),
				// Drawn by the page (template picker: a preset sets the colours).
				'bar_template'   => [
					'type'    => 'select',
					'default' => 'shipping_bar_one',
					'options' => [ 'shipping_bar_one' ],
					'tab'     => 'design',
					'section' => 'template',
					'label'   => __( 'Template', 'storegrowth-sales-booster' ),
				],
			]
		);
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
			'title' => __( 'Free Shipping Rules', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'content'   => [
					'label' => __( 'Content', 'storegrowth-sales-booster' ),
				],
				'configure' => [
					'label'    => __( 'Configure', 'storegrowth-sales-booster' ),
					'sections' => [
						'display' => [
							'title' => __( 'Display Rules', 'storegrowth-sales-booster' ),
							'help'  => __( 'Who sees the banner, and when', 'storegrowth-sales-booster' ),
						],
					],
				],
				'design'    => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'banner'   => [
							'title' => __( 'Banner', 'storegrowth-sales-booster' ),
							'help'  => __( 'Size and typography of the banner', 'storegrowth-sales-booster' ),
						],
						'colors'   => [
							'title' => __( 'Colors', 'storegrowth-sales-booster' ),
							'help'  => __( 'Every colour on the banner', 'storegrowth-sales-booster' ),
						],
						'template' => [
							'title' => __( 'Template', 'storegrowth-sales-booster' ),
							'help'  => __( 'Presets that fill the colour fields above', 'storegrowth-sales-booster' ),
						],
					],
				],
			],
		];
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
		return storegrowth_get_container()->get( SettingsService::class )->with_defaults( $this->get_module_id(), $stored );
	}
}
