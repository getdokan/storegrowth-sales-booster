<?php
/**
 * Order bump editor: fields and page.
 *
 * @package StorePulse\StoreGrowth\Modules\UpsellOrderBump
 */

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\OrderBumpDesign;
use StorePulse\StoreGrowth\Settings\SettingsService;

defined( 'ABSPATH' ) || exit;

/**
 * The bump editor (`#/upsell-order-bump/create-bump`, `#/upsell-order-bump/<id>`),
 * defined like a settings page (ADR-009, ADR-010): the fields of a bump, with
 * where and how the editor draws them, and the page's tabs and sections. The
 * bump is a row of `{prefix}spsg_order_bumps`, read and saved by the order bump
 * REST routes (`sales-booster/v1/order-bumps`), not by `SettingsService`.
 *
 * Keys are the REST routes' (ADR-004): the stored columns (`name`,
 * `target_type`, …, `offer_discount_title`) and the keys of `design_settings`
 * (`box_border_style`, …, `offer_fixed_price_title`). The editor sends a key
 * that isn't a column inside `design_settings`, which an update merges key by
 * key. Defaults are the 2.x admin's for a new bump (`OrderBumpDesign`).
 *
 * Extend it in PHP (`spsg_order_bump_fields`, `spsg_order_bump_page`); an
 * extension's field is stored in `design_settings` (sanitized as text).
 *
 * @since SPSG_VERSION
 */
class OrderBumpFields implements SettingsPage {

	/**
	 * The bump's own fields, in page order.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private function own_fields(): array {
		$defaults = OrderBumpDesign::get_defaults();

		$color  = static function ( string $key, string $section, string $label ) use ( $defaults ): array {
			return [
				'type'    => 'color',
				'default' => $defaults[ $key ],
				'tab'     => 'design',
				'section' => $section,
				'label'   => $label,
			];
		};
		$pixels = static function ( string $key, string $section, string $label, int $max ) use ( $defaults ): array {
			return [
				'type'    => 'number',
				'default' => (int) $defaults[ $key ],
				'min'     => 0,
				'max'     => $max,
				'suffix'  => 'px',
				'tab'     => 'design',
				'section' => $section,
				'label'   => $label,
			];
		};

		return [
			// Basic Information: Bump Setup.
			'name'                           => [
				'type'        => 'text',
				'default'     => '',
				'tab'         => 'basic',
				'section'     => 'setup',
				'label'       => __( 'Name of Order Bump', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Enter Order Bump Name', 'storegrowth-sales-booster' ),
			],
			'target_type'                    => [
				'type'    => 'select',
				'default' => 'products',
				'options' => [ 'products', 'categories' ],
				'variant' => 'radio',
				'tab'     => 'basic',
				'section' => 'setup',
				'label'   => __( 'Select Bump Type', 'storegrowth-sales-booster' ),
				'labels'  => [
					'products'   => __( 'Products', 'storegrowth-sales-booster' ),
					'categories' => __( 'Categories', 'storegrowth-sales-booster' ),
				],
			],
			// Drawn by the page (product search).
			'target_products'                => [
				'type'        => 'list',
				'item'        => 'int',
				'default'     => [],
				'tab'         => 'basic',
				'section'     => 'setup',
				'label'       => __( 'Select Target Product(s)', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Search for products', 'storegrowth-sales-booster' ),
				'show_when'   => [ 'target_type' => 'products' ],
			],
			// Drawn by the page (category picker).
			'target_categories'              => [
				'type'        => 'list',
				'item'        => 'int',
				'default'     => [],
				'tab'         => 'basic',
				'section'     => 'setup',
				'label'       => __( 'Select Target Categories', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Search for categories', 'storegrowth-sales-booster' ),
				'show_when'   => [ 'target_type' => 'categories' ],
			],

			// Basic Information: Offer Section.
			// Drawn by the page (product search, variations included).
			'offer_product_id'               => [
				'type'        => 'number',
				'default'     => 0,
				'min'         => 0,
				'tab'         => 'basic',
				'section'     => 'offer',
				'label'       => __( 'Offer Product', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Search for offer product', 'storegrowth-sales-booster' ),
			],
			'offer_type'                     => [
				'type'    => 'select',
				'default' => 'discount',
				'options' => [ 'discount', 'price', 'free' ],
				'tab'     => 'basic',
				'section' => 'offer',
				'label'   => __( 'Offer Price/Discount', 'storegrowth-sales-booster' ),
				'labels'  => [
					'discount' => __( 'Percentage Off', 'storegrowth-sales-booster' ),
					'price'    => __( 'Fixed Price', 'storegrowth-sales-booster' ),
					'free'     => __( 'Free', 'storegrowth-sales-booster' ),
				],
			],
			// Drawn by the page: "Discount" (%) or "Price" (the currency), as the type says.
			// 20% as the design: a new percentage offer is valid as it opens.
			'offer_amount'                   => [
				'type'      => 'number',
				'default'   => 20,
				'min'       => 0,
				'step'      => 0.01,
				'tab'       => 'basic',
				'section'   => 'offer',
				'label'     => __( 'Discount', 'storegrowth-sales-booster' ),
				'show_when' => [ 'offer_type' => [ 'discount', 'price' ] ],
			],

			// Basic Information: Advanced. Stored in `design_settings`; a bump without it runs every day.
			'bump_schedule'                  => [
				'type'    => 'list',
				'default' => [ 'daily' ],
				'options' => OrderBumpDesign::SCHEDULE,
				'tab'     => 'basic',
				'section' => 'advanced',
				'label'   => __( 'Offer Days', 'storegrowth-sales-booster' ),
				'help'    => __( 'Days of the week the offer runs.', 'storegrowth-sales-booster' ),
				'labels'  => [
					'daily'     => __( 'Every day', 'storegrowth-sales-booster' ),
					'monday'    => __( 'Monday', 'storegrowth-sales-booster' ),
					'tuesday'   => __( 'Tuesday', 'storegrowth-sales-booster' ),
					'wednesday' => __( 'Wednesday', 'storegrowth-sales-booster' ),
					'thursday'  => __( 'Thursday', 'storegrowth-sales-booster' ),
					'friday'    => __( 'Friday', 'storegrowth-sales-booster' ),
					'saturday'  => __( 'Saturday', 'storegrowth-sales-booster' ),
					'sunday'    => __( 'Sunday', 'storegrowth-sales-booster' ),
				],
			],

			// Design: Bump Offer Box. "None" is the stored `no_border`.
			'box_border_style'               => [
				'type'    => 'select',
				'default' => $defaults['box_border_style'],
				'options' => OrderBumpDesign::BORDER_STYLES,
				'tab'     => 'design',
				'section' => 'box',
				'label'   => __( 'Overview Border', 'storegrowth-sales-booster' ),
				'labels'  => [
					'solid'     => __( 'Solid', 'storegrowth-sales-booster' ),
					'dashed'    => __( 'Dashed', 'storegrowth-sales-booster' ),
					'dotted'    => __( 'Dotted', 'storegrowth-sales-booster' ),
					'no_border' => __( 'None', 'storegrowth-sales-booster' ),
				],
			],
			'box_border_color'               => $color( 'box_border_color', 'box', __( 'Border Color', 'storegrowth-sales-booster' ) ),
			'box_top_margin'                 => $pixels( 'box_top_margin', 'box', __( 'Top Margin', 'storegrowth-sales-booster' ), OrderBumpDesign::MAX_MARGIN ),
			'box_bottom_margin'              => $pixels( 'box_bottom_margin', 'box', __( 'Bottom Margin', 'storegrowth-sales-booster' ), OrderBumpDesign::MAX_MARGIN ),

			// Design: Discount Section.
			'discount_background_color'      => $color( 'discount_background_color', 'discount', __( 'Background Color', 'storegrowth-sales-booster' ) ),
			'discount_text_color'            => $color( 'discount_text_color', 'discount', __( 'Text Color', 'storegrowth-sales-booster' ) ),
			'discount_font_size'             => $pixels( 'discount_font_size', 'discount', __( 'Font Size', 'storegrowth-sales-booster' ), OrderBumpDesign::MAX_FONT_SIZE ),

			// Design: Product Section.
			'product_description_text_color' => $color( 'product_description_text_color', 'product', __( 'Text Color', 'storegrowth-sales-booster' ) ),
			'product_description_font_size'  => $pixels( 'product_description_font_size', 'product', __( 'Font Size', 'storegrowth-sales-booster' ), OrderBumpDesign::MAX_FONT_SIZE ),

			// Design: Content, the text after the amount in the discount strip.
			'offer_discount_title'           => [
				'type'      => 'text',
				'default'   => $defaults['offer_discount_title'],
				'tab'       => 'design',
				'section'   => 'content',
				'label'     => __( 'For Discount %', 'storegrowth-sales-booster' ),
				'show_when' => [ 'offer_type' => 'discount' ],
			],
			// Not in the design; the storefront prints it for a fixed price.
			'offer_fixed_price_title'        => [
				'type'      => 'text',
				'default'   => $defaults['offer_fixed_price_title'],
				'tab'       => 'design',
				'section'   => 'content',
				'label'     => __( 'For Fixed Price', 'storegrowth-sales-booster' ),
				'show_when' => [ 'offer_type' => 'price' ],
			],
		];
	}

	/**
	 * The bump's fields, after extensions.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$own = $this->own_fields();

		/**
		 * Filters the order bump editor's fields (ADR-010). Add a field in the
		 * settings field format with a `tab` (and `section`) of the editor;
		 * it's drawn there and saved with the bump in its `design_settings`
		 * (as plain text, or a number or boolean as it is).
		 *
		 * The bump's own fields can't be redefined, and a field of an unknown
		 * type is dropped.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array $fields Field definitions keyed by key.
		 */
		$fields = (array) apply_filters( 'spsg_order_bump_fields', $own );

		$fields = array_filter(
			$fields,
			static function ( $field ) {
				return is_array( $field ) && in_array( $field['type'] ?? '', SettingsService::FIELD_TYPES, true );
			}
		);

		// The bump's own definitions win.
		return array_merge( $fields, $own );
	}

	/**
	 * The editor: title, tabs and sections.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		$page = [
			'title' => __( 'Upsell Order Bump', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'basic'  => [
					'label'    => __( 'Basic Information', 'storegrowth-sales-booster' ),
					'sections' => [
						'setup'    => [
							'title' => __( 'Bump Setup', 'storegrowth-sales-booster' ),
							'help'  => __( 'What the bump is and which carts it appears in', 'storegrowth-sales-booster' ),
						],
						'offer'    => [
							'title' => __( 'Offer Section', 'storegrowth-sales-booster' ),
							'help'  => __( 'The product the bump offers and what it costs', 'storegrowth-sales-booster' ),
						],
						'advanced' => [
							'title'     => __( 'Advanced', 'storegrowth-sales-booster' ),
							'help'      => __( 'Days of the week the offer runs', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
					],
				],
				'design' => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'box'      => [
							'title' => __( 'Bump Offer Box', 'storegrowth-sales-booster' ),
							'help'  => __( 'The container around the bump', 'storegrowth-sales-booster' ),
						],
						'discount' => [
							'title' => __( 'Discount Section', 'storegrowth-sales-booster' ),
							'help'  => __( 'The discount line across the top of the box', 'storegrowth-sales-booster' ),
						],
						'product'  => [
							'title' => __( 'Product Section', 'storegrowth-sales-booster' ),
							'help'  => __( 'The offered product’s own row', 'storegrowth-sales-booster' ),
						],
						// A free offer's strip reads "Free": no text to edit.
						'content'  => [
							'title'     => __( 'Content', 'storegrowth-sales-booster' ),
							'help'      => __( 'The copy shown beside the discount', 'storegrowth-sales-booster' ),
							'show_when' => [ 'offer_type' => [ 'discount', 'price' ] ],
						],
					],
				],
			],
		];

		/**
		 * Filters the order bump editor's page: its title, tabs and sections
		 * (ADR-010). Add a tab or section here, then put fields on it through
		 * `spsg_order_bump_fields`. Replaces the 2.x admin's JS hooks
		 * (`spsg_upsell_order_bump_data`, …).
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array $page Page: title, tabs, sections.
		 */
		return (array) apply_filters( 'spsg_order_bump_page', $page );
	}

	/**
	 * What the editor is drawn from: the page and the fields as the admin app
	 * reads them (`SettingsService::to_public_schema()`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array{page: object, schema: object}
	 */
	public function get_editor(): array {
		return [
			'page'   => (object) $this->get_page(),
			'schema' => (object) storegrowth_get_container()->get( SettingsService::class )->to_public_schema( $this->get_fields() ),
		];
	}
}
