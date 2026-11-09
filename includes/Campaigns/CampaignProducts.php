<?php
/**
 * The products a campaign covers (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Campaigns;

use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use WC_Coupon;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Works out a campaign's product scope from what is attached: every offer's
 * "applies to" plus the campaign price, or the merchant's own pick when
 * nothing is attached.
 *
 * @since SPSG_VERSION
 */
class CampaignProducts {

	/**
	 * Worked-out scopes for this request, by campaign id: the shop loop asks
	 * for every product it renders.
	 *
	 * @var array<int, array>
	 */
	private static array $scopes = [];

	/**
	 * Forget this request's scopes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function flush(): void {
		self::$scopes = [];
	}

	/**
	 * A campaign's scope.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array{all: bool, products: int[], categories: int[], derived: bool}
	 */
	public static function scope( array $campaign ): array {
		$id = (int) $campaign['id'];

		if ( ! isset( self::$scopes[ $id ] ) ) {
			self::$scopes[ $id ] = self::work_out_scope( $campaign );
		}

		return self::$scopes[ $id ];
	}

	/**
	 * Work out a campaign's scope.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 *
	 * @return array{all: bool, products: int[], categories: int[], derived: bool}
	 */
	private static function work_out_scope( array $campaign ): array {
		$settings = (array) ( $campaign['settings'] ?? [] );
		$price    = (array) ( $settings['campaign_price'] ?? [] );
		$offers   = CampaignRepository::get_offers( (int) $campaign['id'] );

		$scope = [
			'all'        => false,
			'products'   => array_map( 'intval', (array) ( $price['products'] ?? [] ) ),
			'categories' => array_map( 'intval', (array) ( $price['categories'] ?? [] ) ),
		];

		foreach ( $offers as $offer ) {
			$scope = self::add_offer( $scope, $offer );
		}

		$derived = ! empty( $offers ) || ! empty( $price['percent'] );

		if ( ! $derived ) {
			$scope['products']   = array_map( 'intval', (array) ( $settings['products'] ?? [] ) );
			$scope['categories'] = array_map( 'intval', (array) ( $settings['categories'] ?? [] ) );
		}

		$scope['products']   = array_values( array_unique( $scope['products'] ) );
		$scope['categories'] = array_values( array_unique( $scope['categories'] ) );
		$scope['derived']    = $derived;

		return $scope;
	}

	/**
	 * Whether a product is in a scope.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $scope      Scope from `scope()`.
	 * @param int   $product_id Product or variation id.
	 *
	 * @return bool
	 */
	public static function contains( array $scope, int $product_id ): bool {
		if ( $scope['all'] ) {
			return true;
		}

		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			return false;
		}

		$parent = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();

		return in_array( $product->get_id(), $scope['products'], true ) || in_array( $parent, $scope['products'], true )
			|| array_intersect( $scope['categories'], wc_get_product_term_ids( $parent, 'product_cat' ) );
	}

	/**
	 * Add one attached offer's "applies to" to a scope.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $scope Scope so far.
	 * @param array $row   Offer row.
	 *
	 * @return array
	 */
	private static function add_offer( array $scope, array $row ): array {
		$kind  = $row['offer_kind'];
		$offer = $row['offer_id'] ? self::offer_of( $kind, $row['offer_id'] ) : $row['overrides'];

		if ( OfferVersions::SMART_COUPON === $kind ) {
			$coupon = new WC_Coupon( $row['offer_id'] ? $row['offer_id'] : (int) ( $row['overrides']['coupon_id'] ?? 0 ) );

			if ( ! $coupon->get_id() ) {
				return $scope;
			}

			if ( ! $coupon->get_product_ids() && ! $coupon->get_product_categories() ) {
				$scope['all'] = true;
			}

			$scope['products']   = array_merge( $scope['products'], array_map( 'intval', $coupon->get_product_ids() ) );
			$scope['categories'] = array_merge( $scope['categories'], array_map( 'intval', $coupon->get_product_categories() ) );

			return $scope;
		}

		if ( OfferVersions::BOGO === $kind ) {
			$scope['products']   = array_merge( $scope['products'], array_map( 'intval', (array) ( $offer['offered_products'] ?? [] ) ) );
			$scope['categories'] = array_merge( $scope['categories'], array_map( 'intval', (array) ( $offer['offered_categories'] ?? [] ) ) );

			return $scope;
		}

		if ( OfferVersions::ORDER_BUMP === $kind ) {
			$targets = array_map( 'intval', (array) ( $offer['target_products'] ?? [] ) );

			if ( 'categories' === ( $offer['target_type'] ?? '' ) ) {
				$scope['categories'] = array_merge( $scope['categories'], array_map( 'intval', (array) ( $offer['target_categories'] ?? [] ) ) );
			} else {
				$scope['products'] = array_merge( $scope['products'], $targets );
			}
		}

		return $scope;
	}

	/**
	 * An everyday offer's values.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind     Offer kind.
	 * @param int    $offer_id Offer id.
	 *
	 * @return array
	 */
	private static function offer_of( string $kind, int $offer_id ): array {
		if ( OfferVersions::BOGO === $kind ) {
			return (array) BogoDataManager::get_bogo_offer( $offer_id );
		}

		if ( OfferVersions::ORDER_BUMP === $kind ) {
			return (array) ( new OrderBumpData() )->get_by_id( $offer_id );
		}

		return [];
	}
}
