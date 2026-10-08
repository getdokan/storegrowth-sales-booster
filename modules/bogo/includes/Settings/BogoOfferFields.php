<?php
/**
 * BOGO offer editor: fields and page.
 *
 * @package StorePulse\StoreGrowth\Modules\BoGo
 */

namespace StorePulse\StoreGrowth\Modules\BoGo\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Settings\SettingsService;

defined( 'ABSPATH' ) || exit;

/**
 * The offer editor (`#/bogo/create-bogo`, `#/bogo/<id>`), defined like a
 * settings page (ADR-009, ADR-010): the fields of an offer, with where and how
 * the editor draws them, and the page's tabs and sections. The offer is a row
 * of `{prefix}spsg_bogo_settings`, read and saved by the BOGO REST routes
 * (`sales-booster/v1/bogo/offers`), not by `SettingsService`.
 *
 * Keys are the REST routes' (ADR-004): the stored columns, the design keys of
 * `design_settings` and the per-offer badge keys. Defaults are the old editor's
 * for a new offer (docs/redesign/modules/bogo.md §4, §9).
 *
 * Extend it in PHP (`spsg_bogo_offer_fields`, `spsg_bogo_offer_page`); an
 * extension stores its own keys (`spsg_bogo_mapped_data`) and returns them
 * (`storegrowth_rest_prepare_bogo_offer`).
 *
 * @since SPSG_VERSION
 */
class BogoOfferFields implements SettingsPage {

	/**
	 * Days an offer can run on (`offer_schedule`); `daily` is every day.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const SCHEDULE = [ 'daily', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ];

	/**
	 * The offer's own fields, in page order.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private function own_fields(): array {
		$color  = static function ( string $section, string $label, string $initial ): array {
			return [
				'type'    => 'color',
				'default' => $initial,
				'tab'     => 'design',
				'section' => $section,
				'label'   => $label,
			];
		};
		$pixels = static function ( string $section, string $label, int $initial, int $min, int $max ): array {
			return [
				'type'    => 'number',
				'default' => $initial,
				'min'     => $min,
				'max'     => $max,
				'suffix'  => 'px',
				'tab'     => 'design',
				'section' => $section,
				'label'   => $label,
			];
		};

		return [
			// Basic Information: Offer Setup.
			'name_of_order_bogo'             => [
				'type'        => 'text',
				'default'     => '',
				'tab'         => 'basic',
				'section'     => 'setup',
				'label'       => __( 'Name of BOGO', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Enter BOGO Name', 'storegrowth-sales-booster' ),
			],
			// Drawn by the page (product search).
			'offered_products'               => [
				'type'        => 'list',
				'item'        => 'int',
				'default'     => [],
				'tab'         => 'basic',
				'section'     => 'setup',
				'label'       => __( 'Select Target Product(s)', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Search for products', 'storegrowth-sales-booster' ),
			],
			'bogo_deal_type'                 => [
				'type'        => 'select',
				'default'     => 'different',
				'options'     => [ 'different', 'same' ],
				'pro_options' => [ 'same' ],
				'variant'     => 'radio',
				'tab'         => 'basic',
				'section'     => 'setup',
				'label'       => __( 'BOGO Deal Type', 'storegrowth-sales-booster' ),
				'labels'      => [
					'different' => __( 'Buy X Get Y', 'storegrowth-sales-booster' ),
					'same'      => __( 'Buy X Get X', 'storegrowth-sales-booster' ),
				],
			],
			// Drawn by the page (product search); Buy X Get X gives the target.
			'get_different_product_field'    => [
				'type'        => 'number',
				'default'     => 0,
				'min'         => 0,
				'tab'         => 'basic',
				'section'     => 'setup',
				'label'       => __( 'Offer Product', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Search for offer product', 'storegrowth-sales-booster' ),
				'show_when'   => [ 'bogo_deal_type' => 'different' ],
			],

			// Basic Information: Pricing. Fixed price is deferred (§9).
			'offer_type'                     => [
				'type'    => 'select',
				'default' => 'free',
				'options' => [ 'free', 'discount' ],
				'tab'     => 'basic',
				'section' => 'pricing',
				'label'   => __( 'Offer Price/Discount', 'storegrowth-sales-booster' ),
				'labels'  => [
					'free'     => __( 'Free', 'storegrowth-sales-booster' ),
					'discount' => __( 'Percentage Off', 'storegrowth-sales-booster' ),
				],
			],
			'discount_amount'                => [
				'type'      => 'number',
				'default'   => 0,
				'min'       => 0,
				'max'       => 100,
				'suffix'    => '%',
				'tab'       => 'basic',
				'section'   => 'pricing',
				'label'     => __( 'Discount', 'storegrowth-sales-booster' ),
				'show_when' => [ 'offer_type' => 'discount' ],
			],

			// Basic Information: Schedule & Conditions.
			'offer_start'                    => [
				'type'    => 'date',
				'default' => '',
				'width'   => 'half',
				'tab'     => 'basic',
				'section' => 'schedule',
				'label'   => __( 'Offer Start Date', 'storegrowth-sales-booster' ),
			],
			'offer_end'                      => [
				'type'    => 'date',
				'default' => '',
				'width'   => 'half',
				'tab'     => 'basic',
				'section' => 'schedule',
				'label'   => __( 'Offer End Date', 'storegrowth-sales-booster' ),
			],
			'minimum_quantity_required'      => [
				'type'    => 'number',
				'default' => 1,
				'min'     => 1,
				'pro'     => true,
				'tab'     => 'basic',
				'section' => 'schedule',
				'label'   => __( 'Select Min Quantity', 'storegrowth-sales-booster' ),
				'help'    => __( 'Quantity of the target product that earns one offer product.', 'storegrowth-sales-booster' ),
			],

			// Basic Information: Advanced, pro 2.2.0's field the design has no place for.
			'offer_schedule'                 => [
				'type'    => 'list',
				'default' => [ 'daily' ],
				'options' => self::SCHEDULE,
				'pro'     => true,
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

			// Content. Editing the message is pro (the old editor's rule).
			'product_page_message'           => [
				'type'        => 'textarea',
				'default'     => __( 'Free Gift', 'storegrowth-sales-booster' ),
				'pro'         => true,
				'rows'        => 2,
				'tab'         => 'content',
				'label'       => __( 'Product Page Message', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Free Gift', 'storegrowth-sales-booster' ),
			],

			// Design: Offer Badge Icon (the offer's own badge, over the global one).
			'enable_custom_badge_image'      => [
				'type'    => 'toggle',
				'default' => false,
				'tab'     => 'design',
				'section' => 'badge',
				'label'   => __( 'Offer Badge Icon', 'storegrowth-sales-booster' ),
			],
			// Drawn by the page (badge images, with the upload below).
			'default_badge_icon_name'        => [
				'type'    => 'select',
				'default' => 'bogo-icons-1',
				'options' => BogoSettings::BADGE_ICONS,
				'pro'     => true,
				'tab'     => 'design',
				'section' => 'badge',
				'label'   => __( 'Badge Icon', 'storegrowth-sales-booster' ),
			],
			// Written by the Badge Icon control's Upload.
			'default_custom_badge_icon'      => [
				'type'    => 'url',
				'default' => '',
				'pro'     => true,
				'hidden'  => true,
				'tab'     => 'design',
				'section' => 'badge',
				'label'   => __( 'Custom Badge Icon', 'storegrowth-sales-booster' ),
			],

			// Design: BOGO Offer Box. "None" is the stored `no_border`.
			'box_border_style'               => [
				'type'    => 'select',
				'default' => 'solid',
				'options' => [ 'solid', 'dashed', 'dotted', 'no_border' ],
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
			'box_border_color'               => $color( 'box', __( 'Border Color', 'storegrowth-sales-booster' ), '#32DBBE' ),
			'box_top_margin'                 => $pixels( 'box', __( 'Top Margin', 'storegrowth-sales-booster' ), 1, 0, 100 ),
			'box_bottom_margin'              => $pixels( 'box', __( 'Bottom Margin', 'storegrowth-sales-booster' ), 1, 0, 100 ),

			// Design: Message Section.
			'discount_background_color'      => $color( 'message', __( 'Background Color', 'storegrowth-sales-booster' ), '#E1FFF4' ),
			'discount_text_color'            => $color( 'message', __( 'Text Color', 'storegrowth-sales-booster' ), '#02AC6E' ),
			'discount_font_size'             => $pixels( 'message', __( 'Font Size', 'storegrowth-sales-booster' ), 13, 12, 25 ),

			// Design: Product Section.
			'product_description_text_color' => $color( 'product', __( 'Text Color', 'storegrowth-sales-booster' ), '#080814' ),
			'product_description_font_size'  => $pixels( 'product', __( 'Font Size', 'storegrowth-sales-booster' ), 18, 14, 22 ),
		];
	}

	/**
	 * The offer's fields, after extensions.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$own = $this->own_fields();

		/**
		 * Filters the BOGO offer editor's fields (ADR-010). Add a field in the
		 * settings field format with a `tab` (and `section`) of the editor;
		 * it's drawn there and sent with the offer to the BOGO REST routes.
		 * Store and return its key yourself (`spsg_bogo_mapped_data`,
		 * `storegrowth_rest_prepare_bogo_offer`).
		 *
		 * The offer's own fields can't be redefined, and a field of an unknown
		 * type is dropped.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array $fields Field definitions keyed by key.
		 */
		$fields = (array) apply_filters( 'spsg_bogo_offer_fields', $own );

		$fields = array_filter(
			$fields,
			static function ( $field ) {
				return is_array( $field ) && in_array( $field['type'] ?? '', SettingsService::FIELD_TYPES, true );
			}
		);

		// The offer's own definitions win.
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
			'title' => __( 'BOGO', 'storegrowth-sales-booster' ),
			'tabs'  => [
				'basic'   => [
					'label'    => __( 'Basic Information', 'storegrowth-sales-booster' ),
					'sections' => [
						'setup'    => [
							'title' => __( 'Offer Setup', 'storegrowth-sales-booster' ),
							'help'  => __( 'What the deal is and which products it runs on', 'storegrowth-sales-booster' ),
						],
						'pricing'  => [
							'title' => __( 'Pricing', 'storegrowth-sales-booster' ),
							'help'  => __( 'What the shopper pays for the offer product', 'storegrowth-sales-booster' ),
						],
						'schedule' => [
							'title' => __( 'Schedule & Conditions', 'storegrowth-sales-booster' ),
							'help'  => __( 'When the offer runs and the rules it follows', 'storegrowth-sales-booster' ),
						],
						'advanced' => [
							// Its fields carry their own Pro badge when locked.
							'title'     => __( 'Advanced', 'storegrowth-sales-booster' ),
							'help'      => __( 'Days of the week the offer runs', 'storegrowth-sales-booster' ),
							'collapsed' => true,
						],
					],
				],
				'content' => [
					'label' => __( 'Content', 'storegrowth-sales-booster' ),
				],
				'design'  => [
					'label'    => __( 'Design', 'storegrowth-sales-booster' ),
					'sections' => [
						'badge'   => [
							'title'  => __( 'Offer Badge Icon', 'storegrowth-sales-booster' ),
							'help'   => __( 'The offer badge will show on the product image', 'storegrowth-sales-booster' ),
							'toggle' => 'enable_custom_badge_image',
							'card'   => true,
						],
						'box'     => [
							'title' => __( 'BOGO Offer Box', 'storegrowth-sales-booster' ),
							'help'  => __( 'The container around the offer', 'storegrowth-sales-booster' ),
						],
						'message' => [
							'title' => __( 'Message Section', 'storegrowth-sales-booster' ),
							'help'  => __( 'The strip carrying the offer message', 'storegrowth-sales-booster' ),
						],
						'product' => [
							'title' => __( 'Product Section', 'storegrowth-sales-booster' ),
							'help'  => __( 'The offered product row', 'storegrowth-sales-booster' ),
						],
					],
				],
			],
		];

		/**
		 * Filters the BOGO offer editor's page: its title, tabs and sections
		 * (ADR-010). Add a tab or section here, then put fields on it through
		 * `spsg_bogo_offer_fields`. Replaces the old admin's JS slots
		 * (`spsg_bogo_tab_panels`, `spsg_after_bogo_offer_settings`, …).
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array $page Page: title, tabs, sections.
		 */
		return (array) apply_filters( 'spsg_bogo_offer_page', $page );
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
