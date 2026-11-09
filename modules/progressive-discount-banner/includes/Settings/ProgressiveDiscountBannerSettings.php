<?php
/**
 * Free Shipping Rules (progressive discount banner) settings schema.
 *
 * @package StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner
 */

namespace StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Settings;

use StorePulse\StoreGrowth\Interfaces\DerivedSettingsSchema;
use StorePulse\StoreGrowth\Interfaces\GatedSettingsSchema;
use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\Milestones;
use StorePulse\StoreGrowth\Modules\ProgressiveDiscountBanner\ProgressiveDiscountBannerModule;
use StorePulse\StoreGrowth\Settings\DisplaySettings;
use StorePulse\StoreGrowth\Settings\SettingsService;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Fields of `spsg_progressive_discount_banner_settings`.
 *
 * - Defaults are the old admin's, so stores keep their bar.
 * - Keys and values stay as stored: `discount_amount_mode` is
 *   `fixed-amount` / `percentage`, icon slugs `shipping-bar-icon-1..3`.
 * - `milestones` holds the Cart Rewards milestones. Absent, milestone 1 is
 *   worked out live from the old keys; saved, the old keys keep holding
 *   milestone 1, because Pro 3.0's bar features read them.
 * - A store that never saved (only the three seeded texts) shows no bar and
 *   applies no reward, as today (`storefront_settings()`); its first save
 *   writes every key sent.
 *
 * @since 3.0.0
 */
class ProgressiveDiscountBannerSettings implements GatedSettingsSchema, DerivedSettingsSchema, SettingsPage {

	/**
	 * Option holding the settings as they were before the first change made
	 * for Cart Rewards.
	 *
	 * @since SPSG_VERSION
	 */
	const BACKUP_OPTION = 'spsg_progressive_discount_banner_backup';

	/**
	 * Keys the first-boot seeding writes; an option holding only these was
	 * never saved by the admin.
	 *
	 * @since 3.0.0
	 *
	 * @var string[]
	 */
	const SEEDED_KEYS = [ 'default_banner_text', 'progressive_banner_text', 'goal_completion_text' ];

	/**
	 * Module id.
	 *
	 * @since 3.0.0
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return ProgressiveDiscountBannerModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since 3.0.0
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_progressive_discount_banner_settings';
	}

	/**
	 * Field definitions keyed by option key.
	 *
	 * @since 3.0.0
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
			// Milestones.
			[
				// Drawn by the page: one row per milestone.
				'milestones'              => [
					'type'    => 'rows',
					'default' => [],
					'row'     => [ Milestones::class, 'normalize_row' ],
					'tab'     => 'milestones',
					'label'   => __( 'Milestones', 'storegrowth-sales-booster' ),
				],
				'progressive_banner_text' => $text(
					__( 'Add {remaining} more for {reward}', 'storegrowth-sales-booster' ),
					[
						'tab'     => 'milestones',
						'variant' => 'textarea',
						'rows'    => 2,
						'label'   => __( 'Bar Copy', 'storegrowth-sales-booster' ),
						'help'    => __( 'Placeholders: {remaining} and {reward}. [amount] still works.', 'storegrowth-sales-booster' ),
					]
				),
				'bar_placement'           => [
					'type'    => 'select',
					'default' => 'both',
					'options' => [ 'fly-cart', 'cart-page', 'both' ],
					'tab'     => 'milestones',
					'label'   => __( 'Placement', 'storegrowth-sales-booster' ),
					'labels'  => [
						'fly-cart'  => __( 'Fly cart', 'storegrowth-sales-booster' ),
						'cart-page' => __( 'Cart page', 'storegrowth-sales-booster' ),
						'both'      => __( 'Both', 'storegrowth-sales-booster' ),
					],
				],
			],
			// Content.
			[
				'goal_completion_text'           => $text(
					__( 'All rewards unlocked', 'storegrowth-sales-booster' ),
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
				// Milestone 1 in the keys Pro 3.0 reads; the page edits `milestones`.
				'discount_type'         => [
					'type'    => 'select',
					'default' => Milestones::FREE_SHIPPING,
					'options' => [ Milestones::FREE_SHIPPING, Milestones::DISCOUNT ],
					'tab'     => 'configure',
					'hidden'  => true,
				],
				'discount_amount_mode'  => [
					'type'    => 'select',
					'default' => 'fixed-amount',
					'options' => [ 'fixed-amount', 'percentage' ],
					'tab'     => 'configure',
					'hidden'  => true,
				],
				// The old admin stored '' until an amount was typed.
				'discount_amount_value' => [
					'type'        => 'number',
					'default'     => '',
					'min'         => 0,
					'step'        => 0.01,
					'allow_empty' => true,
					'tab'         => 'configure',
					'hidden'      => true,
				],
				'cart_minimum_amount'   => [
					'type'    => 'number',
					'default' => Milestones::DEFAULT_THRESHOLD,
					'min'     => 0,
					'step'    => 0.01,
					'tab'     => 'configure',
					'hidden'  => true,
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
	 * @since 3.0.0
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		return [
			'title' => __( 'Cart Rewards', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'milestones' => [
					'label' => __( 'Milestones', 'storegrowth-sales-booster' ),
				],
				'content'    => [
					'label' => __( 'Content', 'storegrowth-sales-booster' ),
				],
				'configure'  => [
					'label'    => __( 'Configure', 'storegrowth-sales-booster' ),
					'sections' => [
						'display' => [
							'title' => __( 'Display Rules', 'storegrowth-sales-booster' ),
							'help'  => __( 'Who sees the banner, and when', 'storegrowth-sales-booster' ),
						],
					],
				],
				'design'     => [
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
	 * @since 3.0.0
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
	 * @since 3.0.0
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return array
	 */
	public function storefront_settings( $stored ): array {
		return storegrowth_get_container()->get( SettingsService::class )->with_defaults( $this->get_module_id(), $stored );
	}

	/**
	 * Milestone 1 from the old keys, for a store with no milestones saved.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $stored Stored option.
	 *
	 * @return array
	 */
	public function with_derived( array $stored ): array {
		if ( empty( $stored['milestones'] ) ) {
			$derived = Milestones::derive( $stored );

			if ( $derived ) {
				$stored['milestones'] = $derived;
			}
		}

		return $stored;
	}

	/**
	 * Keep the milestones and the old keys in step, and back up the settings
	 * before the first change.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $changes Sanitized changes.
	 * @param array $stored  Stored option before the save.
	 *
	 * @return array|WP_Error
	 */
	public function before_save( array $changes, array $stored ) {
		$saved_rows = (array) ( $stored['milestones'] ?? [] );

		if ( array_key_exists( 'milestones', $changes ) ) {
			if ( empty( $changes['milestones'] ) ) {
				return new WP_Error( 'spsg_settings_invalid', __( 'Add at least one milestone.', 'storegrowth-sales-booster' ), [ 'status' => 400 ] );
			}

			if ( ! sp_store_growth()->has_pro() && count( $changes['milestones'] ) > max( Milestones::FREE_LIMIT, count( $saved_rows ) ) ) {
				return new WP_Error( 'spsg_settings_invalid', __( 'Upgrade to Pro to add more milestones.', 'storegrowth-sales-booster' ), [ 'status' => 400 ] );
			}

			$changes['milestones'] = Milestones::sorted_with_ids( $changes['milestones'] );
			$changes               = array_merge( $changes, Milestones::legacy_keys( $changes['milestones'][0] ) );
		} elseif ( $saved_rows && array_intersect_key( $changes, array_flip( Milestones::LEGACY_KEYS ) ) ) {
			$changes['milestones'] = Milestones::with_legacy_keys( Milestones::sorted_with_ids( $saved_rows ), array_merge( $stored, $changes ) );
		}

		if ( $this->is_saved( $stored ) ) {
			add_option( self::BACKUP_OPTION, $stored, '', false );
		}

		return $changes;
	}
}
