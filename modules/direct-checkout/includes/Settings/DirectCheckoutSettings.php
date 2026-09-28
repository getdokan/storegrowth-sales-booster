<?php
/**
 * Direct Checkout settings schema and page.
 *
 * @package StorePulse\StoreGrowth\Modules\DirectCheckout
 */

namespace StorePulse\StoreGrowth\Modules\DirectCheckout\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use StorePulse\StoreGrowth\Modules\DirectCheckout\DirectCheckoutModule;
use StorePulse\StoreGrowth\Settings\DisplaySettings;

defined( 'ABSPATH' ) || exit;

/**
 * Fields and page of `spsg_direct_checkout_settings`
 * (docs/redesign/modules/direct-checkout.md §4).
 *
 * - Defaults are the old admin's; the storefront and pro 2.2.0 read every key
 *   with the same fallback.
 * - Keys and values stay as stored (`paddingXaxis`, `quick-cart-checkout`).
 * - Fonts: the five pro 2.2.0 draws (the bars have two more).
 * - `generated_link` is dead: unread, kept in the option.
 *
 * @since SPSG_VERSION
 */
class DirectCheckoutSettings implements SettingsSchema, SettingsPage {

	/**
	 * Module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_module_id(): string {
		return DirectCheckoutModule::get_id();
	}

	/**
	 * Option holding the settings.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function get_option_name(): string {
		return 'spsg_direct_checkout_settings';
	}

	/**
	 * Fields, in page order.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$fonts = array_intersect_key( DisplaySettings::BAR_FONTS, array_flip( [ 'poppins', 'roboto', 'lato', 'montserrat', 'ibm_plex_sans' ] ) );

		// A Design field, shown while Custom Button Style is on.
		$style = static function ( array $field, string $section ): array {
			return array_merge(
				[
					'tab'     => 'design',
					'section' => $section,
				],
				$field
			);
		};
		$px    = static function ( string $label, int $value, int $max, bool $pro = false, int $min = 1 ): array {
			return [
				'type'    => 'number',
				'default' => $value,
				'min'     => $min,
				'max'     => $max,
				'pro'     => $pro,
				'suffix'  => 'px',
				'label'   => $label,
			];
		};

		return [
			// Checkout Setting.
			'buy_now_button_label'         => [
				'type'    => 'text',
				'default' => __( 'Buy Now', 'storegrowth-sales-booster' ),
				'pro'     => true,
				'tab'     => 'checkout',
				'section' => 'label',
				'label'   => __( 'Buy Now Button Label', 'storegrowth-sales-booster' ),
			],
			// Drawn by the page: its labels quote the button label.
			'buy_now_button_setting'       => [
				'type'        => 'select',
				'default'     => 'cart-with-buy-now',
				'options'     => [ 'cart-to-buy-now', 'cart-with-buy-now', 'specific-buy-now', 'default-add-to-cart' ],
				'pro_options' => [ 'cart-to-buy-now', 'specific-buy-now' ],
				'variant'     => 'radio',
				'tab'         => 'checkout',
				'section'     => 'layout',
				'label'       => __( 'Button Layout', 'storegrowth-sales-booster' ),
				'labels'      => [
					'cart-to-buy-now'     => __( '"Add to cart" as the Buy Now button', 'storegrowth-sales-booster' ),
					'cart-with-buy-now'   => __( 'Buy Now button with "Add to cart"', 'storegrowth-sales-booster' ),
					'specific-buy-now'    => __( 'Buy Now button for specific products', 'storegrowth-sales-booster' ),
					'default-add-to-cart' => __( 'Default Add to cart', 'storegrowth-sales-booster' ),
				],
				'option_help' => [
					'cart-to-buy-now'  => __( 'Use the add to cart button as the Buy Now button.', 'storegrowth-sales-booster' ),
					'specific-buy-now' => __( 'This setting can be directly accessed from the WooCommerce product meta page.', 'storegrowth-sales-booster' ),
				],
			],
			// Drawn by the page: Fly Cart Checkout needs the Fly Cart module.
			'checkout_redirect'            => [
				'type'        => 'select',
				'default'     => 'legacy-checkout',
				'options'     => [ 'legacy-checkout', 'quick-cart-checkout' ],
				'pro_options' => [ 'quick-cart-checkout' ],
				'variant'     => 'radio',
				'tab'         => 'checkout',
				'section'     => 'redirect',
				'label'       => __( 'Checkout Redirect', 'storegrowth-sales-booster' ),
				'labels'      => [
					'legacy-checkout'     => __( 'Checkout Page', 'storegrowth-sales-booster' ),
					'quick-cart-checkout' => __( 'Fly Cart Checkout', 'storegrowth-sales-booster' ),
				],
				'option_help' => [
					'legacy-checkout'     => __( 'Buy Now button will redirect to the default checkout page.', 'storegrowth-sales-booster' ),
					'quick-cart-checkout' => __( 'The Buy Now button will open the Fly Cart sidebar checkout.', 'storegrowth-sales-booster' ),
				],
			],
			'shop_page_checkout_enable'    => [
				'type'    => 'toggle',
				'default' => true,
				'pro'     => true,
				'variant' => 'checkbox',
				'tab'     => 'checkout',
				'section' => 'visibility',
				'label'   => __( 'Display on Shop Page', 'storegrowth-sales-booster' ),
			],
			'product_page_checkout_enable' => [
				'type'    => 'toggle',
				'default' => true,
				'variant' => 'checkbox',
				'tab'     => 'checkout',
				'section' => 'visibility',
				'label'   => __( 'Display on Product Page', 'storegrowth-sales-booster' ),
			],

			// Design: the switch that governs every section below it.
			'button_style'                 => [
				'type'    => 'toggle',
				'default' => true,
				'variant' => 'switch_card',
				'tab'     => 'design',
				'label'   => __( 'Custom Button Style', 'storegrowth-sales-booster' ),
				'help'    => __( 'Override the button’s default look.', 'storegrowth-sales-booster' ),
			],
			'button_color'                 => $style(
				[
					'type'    => 'color',
					'default' => '#008dff',
					'label'   => __( 'Button Color', 'storegrowth-sales-booster' ),
				],
				'colors'
			),
			'text_color'                   => $style(
				[
					'type'    => 'color',
					'default' => '#ffffff',
					'label'   => __( 'Text Color', 'storegrowth-sales-booster' ),
				],
				'colors'
			),
			'font_family'                  => $style(
				[
					'type'    => 'select',
					'default' => 'poppins',
					'options' => array_keys( $fonts ),
					'labels'  => $fonts,
					'pro'     => true,
					'label'   => __( 'Font Family', 'storegrowth-sales-booster' ),
				],
				'typography'
			),
			'font_size'                    => $style( $px( __( 'Font Size', 'storegrowth-sales-booster' ), 16, 100 ), 'typography' ),
			// Drawn by the page: one padding control for both keys.
			'paddingYaxis'                 => $style( $px( __( 'Vertical Padding', 'storegrowth-sales-booster' ), 10, 100, true ), 'spacing' ),
			'paddingXaxis'                 => $style( array_merge( $px( __( 'Horizontal Padding', 'storegrowth-sales-booster' ), 20, 100, true ), [ 'hidden' => true ] ), 'spacing' ),
			'button_border_style'          => $style(
				[
					'type'    => 'select',
					'default' => 'solid',
					'options' => [ 'solid', 'dashed', 'dotted', 'none' ],
					'labels'  => [
						'solid'  => __( 'Solid', 'storegrowth-sales-booster' ),
						'dashed' => __( 'Dashed', 'storegrowth-sales-booster' ),
						'dotted' => __( 'Dotted', 'storegrowth-sales-booster' ),
						'none'   => __( 'None', 'storegrowth-sales-booster' ),
					],
					'pro'     => true,
					'label'   => __( 'Border Style', 'storegrowth-sales-booster' ),
				],
				'border'
			),
			'border_width'                 => $style( $px( __( 'Border Width', 'storegrowth-sales-booster' ), 1, 20, true ), 'border' ),
			'border_color'                 => $style(
				[
					'type'    => 'color',
					'default' => '#008dff',
					'pro'     => true,
					'label'   => __( 'Border Color', 'storegrowth-sales-booster' ),
				],
				'border'
			),
			'button_border_radius'         => $style( $px( __( 'Border Radius', 'storegrowth-sales-booster' ), 5, 100, false, 0 ), 'border' ),
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
		$styled = [ 'button_style' => true ];

		return [
			'title' => __( 'Direct Checkout', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'checkout' => [
					'label'    => __( 'Checkout Setting', 'storegrowth-sales-booster' ),
					'sections' => [
						'label'      => [
							'title' => __( 'Button Label', 'storegrowth-sales-booster' ),
							'help'  => __( 'The text shown on the Direct Checkout button.', 'storegrowth-sales-booster' ),
						],
						'layout'     => [
							'title' => __( 'Button Layout', 'storegrowth-sales-booster' ),
							'help'  => __( 'How Direct Checkout sits next to Add to Cart.', 'storegrowth-sales-booster' ),
						],
						'redirect'   => [
							'title' => __( 'Checkout Redirect', 'storegrowth-sales-booster' ),
							'help'  => __( 'Where Direct Checkout sends the shopper.', 'storegrowth-sales-booster' ),
						],
						'visibility' => [
							'title' => __( 'Visibility', 'storegrowth-sales-booster' ),
							'help'  => __( 'Where the Direct Checkout button appears.', 'storegrowth-sales-booster' ),
						],
					],
				],
				'design'   => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'colors'     => [
							'title'     => __( 'Colors', 'storegrowth-sales-booster' ),
							'help'      => __( 'The button’s fill and label', 'storegrowth-sales-booster' ),
							'show_when' => $styled,
						],
						'typography' => [
							'title'     => __( 'Typography', 'storegrowth-sales-booster' ),
							'help'      => __( 'The button label’s type', 'storegrowth-sales-booster' ),
							'show_when' => $styled,
						],
						'spacing'    => [
							'title'     => __( 'Spacing', 'storegrowth-sales-booster' ),
							'help'      => __( 'Room inside the button, around the label', 'storegrowth-sales-booster' ),
							'show_when' => $styled,
						],
						'border'     => [
							'title'     => __( 'Border', 'storegrowth-sales-booster' ),
							'help'      => __( 'Style, width, colour and corner radius', 'storegrowth-sales-booster' ),
							'show_when' => $styled,
						],
					],
				],
			],
		];
	}
}
