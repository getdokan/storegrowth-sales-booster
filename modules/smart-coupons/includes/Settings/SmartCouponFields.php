<?php
/**
 * Smart Coupon editor: fields and page.
 *
 * @package StorePulse\StoreGrowth\Modules\SmartCoupons
 */

namespace StorePulse\StoreGrowth\Modules\SmartCoupons\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsPage;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Settings\SettingsService;
use StorePulse\StoreGrowth\Support\SiteTime;

defined( 'ABSPATH' ) || exit;

/**
 * The coupon editor (`#/smart-coupons/new`, `#/smart-coupons/<id>`), defined
 * like a settings page (ADR-009, ADR-010): the fields, with where and how
 * they're drawn, and the page's sections, read and saved by the Smart Coupons
 * REST routes.
 *
 * Extend it in PHP (`spsg_smart_coupon_fields`, `spsg_smart_coupon_page`).
 *
 * @since SPSG_VERSION
 */
class SmartCouponFields implements SettingsPage {

	/**
	 * The coupon's own fields, in page order.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private function own_fields(): array {
		return [
			// Drawn by the page (segmented control with the Pro lock).
			'method'           => [
				'type'    => 'select',
				'default' => SmartCoupon::AUTOMATIC,
				'options' => [ SmartCoupon::AUTOMATIC, SmartCoupon::CODE, SmartCoupon::LINK ],
				'section' => 'method',
				'label'   => __( 'Method', 'storegrowth-sales-booster' ),
				'labels'  => [
					SmartCoupon::AUTOMATIC => __( 'Automatic', 'storegrowth-sales-booster' ),
					SmartCoupon::CODE      => __( 'Discount code', 'storegrowth-sales-booster' ),
					SmartCoupon::LINK      => __( 'Link', 'storegrowth-sales-booster' ),
				],
			],
			'code'             => [
				'type'        => 'text',
				'default'     => '',
				'section'     => 'method',
				'label'       => __( 'Discount code', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'SAVE20', 'storegrowth-sales-booster' ),
				'show_when'   => [ 'method' => SmartCoupon::CODE ],
			],
			'title'            => [
				'type'        => 'text',
				'default'     => '',
				'section'     => 'title',
				'label'       => __( 'Title', 'storegrowth-sales-booster' ),
				'help'        => __( 'Shoppers see this in their cart and at checkout.', 'storegrowth-sales-booster' ),
				'placeholder' => __( '30% off Outerwear', 'storegrowth-sales-booster' ),
			],

			// Drawn by the page (type cards, then the value control for the type).
			'discount_type'    => [
				'type'    => 'select',
				'default' => SmartCoupon::TYPE_PERCENTAGE,
				'options' => [ SmartCoupon::TYPE_PERCENTAGE, SmartCoupon::TYPE_FIXED, SmartCoupon::TYPE_TIERS, SmartCoupon::TYPE_BUY_X_GET_Y ],
				'section' => 'value',
				'label'   => __( 'Discount type', 'storegrowth-sales-booster' ),
				'labels'  => [
					SmartCoupon::TYPE_PERCENTAGE  => __( 'Percentage', 'storegrowth-sales-booster' ),
					SmartCoupon::TYPE_FIXED       => __( 'Fixed amount', 'storegrowth-sales-booster' ),
					SmartCoupon::TYPE_TIERS       => __( 'Buy more save more', 'storegrowth-sales-booster' ),
					SmartCoupon::TYPE_BUY_X_GET_Y => __( 'Buy X get Y', 'storegrowth-sales-booster' ),
				],
			],
			'amount'           => [
				'type'      => 'number',
				'default'   => 10,
				'min'       => 0,
				'step'      => 0.01,
				'section'   => 'value',
				'label'     => __( 'Percent off', 'storegrowth-sales-booster' ),
				'show_when' => [ 'discount_type' => [ SmartCoupon::TYPE_PERCENTAGE, SmartCoupon::TYPE_FIXED ] ],
			],
			'tiers'            => [
				'type'      => 'list',
				'default'   => [],
				'pro'       => true,
				'section'   => 'value',
				'label'     => __( 'Quantity tiers', 'storegrowth-sales-booster' ),
				'show_when' => [ 'discount_type' => SmartCoupon::TYPE_TIERS ],
			],
			'bogo_rule'        => [
				'type'      => 'number',
				'default'   => 0,
				'min'       => 0,
				'section'   => 'value',
				'label'     => __( 'BOGO rule', 'storegrowth-sales-booster' ),
				'show_when' => [ 'discount_type' => SmartCoupon::TYPE_BUY_X_GET_Y ],
			],

			'apply_to'         => [
				'type'    => 'select',
				'default' => 'store',
				'options' => [ 'categories', 'products', 'store' ],
				'section' => 'applies',
				'label'   => __( 'Products', 'storegrowth-sales-booster' ),
				'labels'  => [
					'categories' => __( 'Specific categories', 'storegrowth-sales-booster' ),
					'products'   => __( 'Specific products', 'storegrowth-sales-booster' ),
					'store'      => __( 'Entire store', 'storegrowth-sales-booster' ),
				],
			],
			// Drawn by the page (product search).
			'product_ids'      => [
				'type'        => 'list',
				'item'        => 'int',
				'default'     => [],
				'section'     => 'applies',
				'label'       => __( 'Products', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Search for products', 'storegrowth-sales-booster' ),
				'show_when'   => [ 'apply_to' => 'products' ],
			],
			// Drawn by the page (category picker).
			'category_ids'     => [
				'type'        => 'list',
				'item'        => 'int',
				'default'     => [],
				'section'     => 'applies',
				'label'       => __( 'Categories', 'storegrowth-sales-booster' ),
				'placeholder' => __( 'Search for categories', 'storegrowth-sales-booster' ),
				'show_when'   => [ 'apply_to' => 'categories' ],
			],

			'minimum_type'     => [
				'type'    => 'select',
				'default' => 'none',
				'options' => [ 'none', 'subtotal', 'quantity' ],
				'variant' => 'radio',
				'section' => 'minimum',
				'label'   => __( 'Minimum purchase', 'storegrowth-sales-booster' ),
				'labels'  => [
					'none'     => __( 'No minimum', 'storegrowth-sales-booster' ),
					'subtotal' => __( 'Cart subtotal of at least', 'storegrowth-sales-booster' ),
					'quantity' => __( 'Minimum quantity', 'storegrowth-sales-booster' ),
				],
			],
			'minimum_amount'   => [
				'type'      => 'number',
				'default'   => 0,
				'min'       => 0,
				'step'      => 0.01,
				'section'   => 'minimum',
				'label'     => __( 'Minimum subtotal', 'storegrowth-sales-booster' ),
				'show_when' => [ 'minimum_type' => 'subtotal' ],
			],
			'minimum_quantity' => [
				'type'      => 'number',
				'default'   => 2,
				'min'       => 1,
				'section'   => 'minimum',
				'label'     => __( 'Minimum quantity', 'storegrowth-sales-booster' ),
				'show_when' => [ 'minimum_type' => 'quantity' ],
			],

			// Drawn by the page (first-time, returning and roles are Pro).
			'eligibility'      => [
				'type'    => 'select',
				'default' => 'all',
				'options' => [ 'all', 'first_time', 'returning', 'roles' ],
				'section' => 'eligibility',
				'label'   => __( 'Customers', 'storegrowth-sales-booster' ),
				'labels'  => [
					'all'        => __( 'All customers', 'storegrowth-sales-booster' ),
					'first_time' => __( 'First-time customers', 'storegrowth-sales-booster' ),
					'returning'  => __( 'Returning customers', 'storegrowth-sales-booster' ),
					'roles'      => __( 'Specific roles', 'storegrowth-sales-booster' ),
				],
			],
			'roles'            => [
				'type'      => 'list',
				'default'   => [],
				'options'   => array_keys( wp_roles()->get_names() ),
				'labels'    => wp_roles()->get_names(),
				'pro'       => true,
				'section'   => 'eligibility',
				'label'     => __( 'Roles', 'storegrowth-sales-booster' ),
				'show_when' => [ 'eligibility' => 'roles' ],
			],
			'one_per_customer' => [
				'type'    => 'toggle',
				'default' => false,
				'variant' => 'checkbox',
				'section' => 'eligibility',
				'label'   => __( 'One use per customer', 'storegrowth-sales-booster' ),
			],
			'skip_sale'        => [
				'type'    => 'toggle',
				'default' => false,
				'variant' => 'checkbox',
				'section' => 'eligibility',
				'label'   => __( 'Skip products already on sale', 'storegrowth-sales-booster' ),
				'help'    => __( 'Countdown prices count as on sale.', 'storegrowth-sales-booster' ),
			],

			'combines'         => [
				'type'    => 'toggle',
				'default' => false,
				'variant' => 'checkbox',
				'section' => 'combinations',
				'label'   => __( 'Can combine with other StoreGrowth deals', 'storegrowth-sales-booster' ),
				'help'    => __( 'Other Smart Coupons and BOGO deals. Countdown prices always combine.', 'storegrowth-sales-booster' ),
			],
			'allow_others'     => [
				'type'    => 'toggle',
				'default' => false,
				'variant' => 'checkbox',
				'section' => 'combinations',
				'label'   => __( 'Allow with other coupons', 'storegrowth-sales-booster' ),
				'help'    => __( 'Coupons from outside StoreGrowth.', 'storegrowth-sales-booster' ),
			],

			'date_start'       => [
				'type'    => 'text',
				'default' => SiteTime::now()->format( 'Y-m-d\TH:i' ),
				'variant' => 'datetime-local',
				'width'   => 'half',
				'section' => 'dates',
				'label'   => __( 'Start', 'storegrowth-sales-booster' ),
				/* translators: %s: site timezone. */
				'help'    => sprintf( __( 'Timezone: %s', 'storegrowth-sales-booster' ), wp_timezone_string() ),
			],
			'date_end'         => [
				'type'    => 'text',
				'default' => '',
				'variant' => 'datetime-local',
				'width'   => 'half',
				'section' => 'dates',
				'label'   => __( 'End', 'storegrowth-sales-booster' ),
				'help'    => __( 'The coupon stays Inactive until dates are set.', 'storegrowth-sales-booster' ),
			],
		];
	}

	/**
	 * The coupon's fields, after extensions.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields(): array {
		$own = $this->own_fields();

		/**
		 * Filters the Smart Coupon editor's fields (ADR-010). Add a field in
		 * the settings field format with a `section`. The coupon's own fields
		 * can't be redefined, and a field of an unknown type is dropped.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array $fields Field definitions keyed by key.
		 */
		$fields = (array) apply_filters( 'spsg_smart_coupon_fields', $own );

		$fields = array_filter(
			$fields,
			static function ( $field ) {
				return is_array( $field ) && in_array( $field['type'] ?? '', SettingsService::FIELD_TYPES, true );
			}
		);

		return array_merge( $fields, $own );
	}

	/**
	 * The editor: title and sections.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, mixed>
	 */
	public function get_page(): array {
		$page = [
			'title'    => __( 'Smart Coupons', 'storegrowth-sales-booster' ),
			'sections' => [
				'method'       => [ 'title' => __( 'Method', 'storegrowth-sales-booster' ) ],
				'title'        => [ 'title' => __( 'Title', 'storegrowth-sales-booster' ) ],
				'value'        => [ 'title' => __( 'Discount value', 'storegrowth-sales-booster' ) ],
				'applies'      => [ 'title' => __( 'Applies to', 'storegrowth-sales-booster' ) ],
				'minimum'      => [ 'title' => __( 'Minimum purchase', 'storegrowth-sales-booster' ) ],
				'eligibility'  => [ 'title' => __( 'Eligibility', 'storegrowth-sales-booster' ) ],
				'combinations' => [
					'title' => __( 'Combinations', 'storegrowth-sales-booster' ),
					'help'  => __( 'When deals can\'t combine, the shopper gets the larger one.', 'storegrowth-sales-booster' ),
				],
				'dates'        => [ 'title' => __( 'Active dates', 'storegrowth-sales-booster' ) ],
			],
		];

		/**
		 * Filters the Smart Coupon editor's page: its title and sections
		 * (ADR-010). Add a section here, then put fields on it through
		 * `spsg_smart_coupon_fields`.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array $page Page: title, sections.
		 */
		return (array) apply_filters( 'spsg_smart_coupon_page', $page );
	}

	/**
	 * What the editor is drawn from.
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
