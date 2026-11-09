<?php
/**
 * REST routes of the Campaigns page (ADR-016).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\REST;

use StorePulse\StoreGrowth\Campaigns\CampaignAttribution;
use StorePulse\StoreGrowth\Campaigns\CampaignProducts;
use StorePulse\StoreGrowth\Campaigns\CampaignRecords;
use StorePulse\StoreGrowth\Campaigns\CampaignReport;
use StorePulse\StoreGrowth\Campaigns\CampaignService;
use StorePulse\StoreGrowth\Campaigns\CampaignSurfaces;
use StorePulse\StoreGrowth\Campaigns\Readiness;
use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\BoGo\BoGoModule;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponsModule;
use StorePulse\StoreGrowth\Modules\SmartCoupons\SmartCouponRepository;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\UpsellOrderBumpModule;
use StorePulse\StoreGrowth\Offers\CampaignRepository;
use StorePulse\StoreGrowth\Offers\OfferVersions;
use StorePulse\StoreGrowth\Pricing\SmartCoupon;
use StorePulse\StoreGrowth\Support\SiteTime;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reading works without Pro (an expired store sees its own campaigns); every
 * write needs an active Pro licence.
 *
 * @since SPSG_VERSION
 */
class CampaignsController extends WP_REST_Controller {

	/**
	 * Route namespace.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	protected $namespace = 'sales-booster/v1';

	/**
	 * Route base.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string
	 */
	protected $rest_base = 'campaigns';

	/**
	 * Module id of each offer kind, for the warnings when a module is off.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, string>
	 */
	private static function offer_modules(): array {
		return [
			OfferVersions::BOGO         => BoGoModule::get_id(),
			OfferVersions::ORDER_BUMP   => UpsellOrderBumpModule::get_id(),
			OfferVersions::SMART_COUPON => SmartCouponsModule::get_id(),
		];
	}

	/**
	 * Register the routes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_routes() {
		$read  = [ $this, 'read_permissions_check' ];
		$write = [ $this, 'write_permissions_check' ];
		$base  = '/' . $this->rest_base;

		register_rest_route(
			$this->namespace,
			$base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'permission_callback' => $read,
					'args'                => [
						'range' => [
							'type'    => 'string',
							'enum'    => [ '30', '90', 'year' ],
							'default' => '30',
						],
					],
				],
				[
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'create_item' ],
					'permission_callback' => $write,
				],
			]
		);

		register_rest_route(
			$this->namespace,
			$base . '/templates',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_templates' ],
				'permission_callback' => $read,
			]
		);

		register_rest_route(
			$this->namespace,
			$base . '/(?P<id>\d+)',
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_item' ],
					'permission_callback' => $read,
				],
				[
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_item' ],
					'permission_callback' => $write,
				],
				[
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => [ $this, 'delete_item' ],
					'permission_callback' => $write,
				],
			]
		);

		register_rest_route(
			$this->namespace,
			$base . '/(?P<id>\d+)/delete-preview',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_delete_preview' ],
				'permission_callback' => $read,
			]
		);

		register_rest_route(
			$this->namespace,
			$base . '/(?P<id>\d+)/(?P<action>publish|unpublish|pause|resume|end|clone)',
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'run_action' ],
				'permission_callback' => $write,
			]
		);

		register_rest_route(
			$this->namespace,
			$base . '/(?P<id>\d+)/attachable',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_attachable' ],
				'permission_callback' => $read,
			]
		);

		register_rest_route(
			$this->namespace,
			$base . '/(?P<id>\d+)/offers',
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'add_offer' ],
				'permission_callback' => $write,
			]
		);

		register_rest_route(
			$this->namespace,
			$base . '/(?P<id>\d+)/offers/(?P<row>\d+)',
			[
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => [ $this, 'remove_offer' ],
				'permission_callback' => $write,
			]
		);

		register_rest_route(
			$this->namespace,
			$base . '/(?P<id>\d+)/template',
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'apply_template' ],
				'permission_callback' => $write,
			]
		);

		$records = $base . '/(?P<id>\d+)/records/(?P<kind>bogo|order_bump|smart_coupon)';

		register_rest_route(
			$this->namespace,
			$records . '/editor',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_record_editor' ],
				'permission_callback' => $read,
			]
		);

		register_rest_route(
			$this->namespace,
			$records,
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'create_record' ],
				'permission_callback' => $write,
			]
		);

		register_rest_route(
			$this->namespace,
			$records . '/(?P<row>\d+)',
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_record' ],
					'permission_callback' => $read,
				],
				[
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'update_offer' ],
					'permission_callback' => $write,
				],
			]
		);
	}

	/**
	 * Shop managers and administrators can read.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public function read_permissions_check(): bool {
		return current_user_can( 'manage_woocommerce' );
	}

	/**
	 * Writing needs an active Pro licence.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool|WP_Error
	 */
	public function write_permissions_check() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return false;
		}

		return sp_store_growth()->has_pro() ? true : new WP_Error( 'spsg_campaigns_need_pro', __( 'Campaigns need an active StoreGrowth Pro licence.', 'storegrowth-sales-booster' ), [ 'status' => 403 ] );
	}

	/**
	 * The list: rows, the period's figures and the counts per status tab.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$now     = SiteTime::now();
		$range   = (string) $request['range'];
		$start   = 'year' === $range ? $now->setDate( (int) $now->format( 'Y' ), 1, 1 )->setTime( 0, 0 ) : $now->modify( '-' . (int) $range . ' days' );
		$summary = CampaignReport::summary( $start, $now );
		$rows    = [];
		$counts  = [
			CampaignRepository::STATUS_RUNNING   => 0,
			CampaignRepository::STATUS_SCHEDULED => 0,
			CampaignRepository::STATUS_ENDED     => 0,
		];

		foreach ( CampaignRepository::all() as $campaign ) {
			$row    = $this->list_row( $campaign, $summary['campaigns'][ (int) $campaign['id'] ] ?? [] );
			$rows[] = $row;

			if ( isset( $counts[ $row['status'] ] ) ) {
				++$counts[ $row['status'] ];
			}
		}

		$counts['all'] = count( $rows );

		return rest_ensure_response(
			[
				'items'        => $rows,
				'counts'       => $counts,
				'summary'      => array_diff_key( $summary, [ 'campaigns' => true ] ),
				'window'       => CampaignAttribution::window_days(),
				'expired'      => $this->is_expired(),
				'price_format' => $this->price_format(),
			]
		);
	}

	/**
	 * WooCommerce's price format, for the figures.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	private function price_format(): array {
		return [
			'symbol'             => html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES, get_bloginfo( 'charset' ) ),
			'format'             => get_woocommerce_price_format(),
			'decimals'           => wc_get_price_decimals(),
			'decimal_separator'  => wc_get_price_decimal_separator(),
			'thousand_separator' => wc_get_price_thousand_separator(),
		];
	}

	/**
	 * Whether the licence has expired (the Pro plugin reports it).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	private function is_expired(): bool {
		/**
		 * Filters the admin header data; Pro adds the licence state to it.
		 *
		 * @since 3.0.0
		 *
		 * @param array $header_info Header data.
		 */
		$info = (array) apply_filters( 'spsg_admin_header_info', [] );

		return 'expired' === ( $info['license_state'] ?? '' );
	}

	/**
	 * A campaign as the list shows it.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $campaign Campaign.
	 * @param array $figures  Its revenue and orders in the period.
	 *
	 * @return array
	 */
	private function list_row( array $campaign, array $figures ): array {
		$status = CampaignRepository::status_at( $campaign, SiteTime::now() );
		$offers = CampaignRepository::get_offers( (int) $campaign['id'] );
		$active = array_filter(
			(array) ( $campaign['settings']['surfaces'] ?? [] ),
			static function ( $surface ): bool {
				return ! empty( $surface['enabled'] );
			}
		);

		return [
			'id'              => (int) $campaign['id'],
			'name'            => (string) $campaign['name'],
			'status'          => $status,
			'starts_at'       => $campaign['starts_at'],
			'ends_at'         => $campaign['ends_at'],
			'offers'          => count( $offers ),
			'offer_modules'   => array_values( array_unique( wp_list_pluck( $offers, 'offer_kind' ) ) ),
			'surfaces'        => count( $active ),
			'revenue'         => $figures['revenue'] ?? null,
			'orders'          => $figures['orders'] ?? null,
			'aov_lift'        => CampaignRepository::STATUS_SCHEDULED === $status || CampaignRepository::STATUS_DRAFT === $status ? null : ( CampaignReport::for_campaign( $campaign )['aov_change'] ?? null ),
			'module_off'      => $this->has_module_off( $offers, array_keys( $active ) ),
			'licence_stopped' => ! sp_store_growth()->has_pro() && CampaignRepository::STATUS_ENDED !== $status && CampaignRepository::STATUS_DRAFT !== $status,
		];
	}

	/**
	 * Whether a module a campaign uses is off.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array[]  $offers   Offer rows.
	 * @param string[] $surfaces Surface ids.
	 *
	 * @return bool
	 */
	private function has_module_off( array $offers, array $surfaces ): bool {
		$modules = array_map(
			static function ( string $surface ): string {
				return CampaignSurfaces::modules()[ $surface ] ?? '';
			},
			$surfaces
		);

		foreach ( $offers as $offer ) {
			$modules[] = self::offer_modules()[ $offer['offer_kind'] ] ?? '';
		}

		foreach ( array_filter( $modules ) as $module ) {
			if ( ! Helper::is_module_active( $module ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * The template list.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return WP_REST_Response
	 */
	public function get_templates() {
		return rest_ensure_response( CampaignService::templates() );
	}

	/**
	 * Create a draft from a template or blank.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$template = (string) $request['template'];
		$name     = sanitize_text_field( (string) $request['name'] );

		$id = '' !== $template ? CampaignService::create_from_template( $template, $name ) : CampaignRepository::save( [ 'name' => $name ] );

		return is_wp_error( $id ) ? $id : $this->detail_response( (int) $id );
	}

	/**
	 * One campaign with everything its page needs.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		return $this->detail_response( (int) $request['id'] );
	}

	/**
	 * The campaign page's data.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	private function detail_response( int $id ) {
		$campaign = CampaignRepository::get( $id );

		if ( ! $campaign ) {
			return new WP_Error( 'spsg_campaign_not_found', __( 'Campaign not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		$now    = SiteTime::now();
		$status = CampaignRepository::status_at( $campaign, $now );
		$checks = CampaignRepository::STATUS_DRAFT === $status ? Readiness::check( $campaign ) : array_merge( Readiness::overlaps( $campaign ), Readiness::licence( $campaign ) );

		return rest_ensure_response(
			[
				'id'           => $id,
				'name'         => (string) $campaign['name'],
				'status'       => $status,
				'starts_at'    => $campaign['starts_at'],
				'ends_at'      => $campaign['ends_at'],
				'paused_at'    => $campaign['paused_at'],
				'slug'         => (string) $campaign['slug'],
				'settings'     => (object) $campaign['settings'],
				'offers'       => $this->offer_rows( $id ),
				'scope'        => CampaignProducts::scope( $campaign ),
				'checks'       => $checks,
				'report'       => CampaignReport::for_campaign( $campaign ),
				'can_publish'  => Readiness::can_publish( $campaign ),
				'timezone'     => wp_timezone_string(),
				'home_url'     => home_url( '/' ),
				'window'       => CampaignAttribution::window_days(),
				'read_only'    => ! sp_store_growth()->has_pro(),
				'price_format' => $this->price_format(),
			]
		);
	}

	/**
	 * A campaign's offer rows for its rail.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return array[]
	 */
	private function offer_rows( int $id ): array {
		return array_map(
			static function ( array $row ): array {
				$is_coupon = OfferVersions::SMART_COUPON === $row['offer_kind'];
				$name      = $row['offer_id'] ? CampaignRepository::offer_name( $row['offer_kind'], $row['offer_id'] ) : (string) ( $row['overrides']['name'] ?? $row['overrides']['name_of_order_bogo'] ?? '' );

				return [
					'row'        => (int) $row['id'],
					'kind'       => $row['offer_kind'],
					'offer_id'   => $row['offer_id'],
					'name'       => $name,
					'attached'   => (bool) $row['offer_id'],
					'customised' => ! empty( $row['overrides'] ) && ( ! $is_coupon || $row['offer_id'] ),
					'coupon_id'  => (int) ( $row['overrides']['coupon_id'] ?? 0 ),
				];
			},
			CampaignRepository::get_offers( $id )
		);
	}

	/**
	 * Save a campaign's name, dates, price, surfaces or product pick.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$id   = (int) $request['id'];
		$data = array_intersect_key( (array) $request->get_json_params(), array_flip( [ 'name', 'starts_at', 'ends_at', 'settings' ] ) );

		if ( isset( $data['settings'] ) ) {
			$data['settings'] = $this->clean_settings( (array) $data['settings'] );
		}

		$saved = CampaignRepository::save( $data, $id );

		return is_wp_error( $saved ) ? $saved : $this->detail_response( $id );
	}

	/**
	 * The settings a save may change, typed. The frozen baseline isn't one.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $sent Settings sent.
	 *
	 * @return array
	 */
	private function clean_settings( array $sent ): array {
		$ids      = static function ( $values ): array {
			return array_values( array_filter( array_map( 'absint', (array) $values ) ) );
		};
		$settings = [];

		foreach ( [ 'products', 'categories' ] as $key ) {
			if ( isset( $sent[ $key ] ) ) {
				$settings[ $key ] = $ids( $sent[ $key ] );
			}
		}

		if ( isset( $sent['exclude_on_sale'] ) ) {
			$settings['exclude_on_sale'] = rest_sanitize_boolean( $sent['exclude_on_sale'] );
		}

		if ( isset( $sent['decisions'] ) ) {
			$settings['decisions'] = array_map( 'rest_sanitize_boolean', (array) $sent['decisions'] );
		}

		if ( isset( $sent['campaign_price'] ) ) {
			$price = (array) $sent['campaign_price'];

			$settings['campaign_price'] = [
				'percent'    => min( 100, absint( $price['percent'] ?? 0 ) ),
				'products'   => $ids( $price['products'] ?? [] ),
				'categories' => $ids( $price['categories'] ?? [] ),
			];
		}

		if ( isset( $sent['surfaces'] ) ) {
			$settings['surfaces'] = [];

			foreach ( array_intersect_key( (array) $sent['surfaces'], CampaignSurfaces::modules() ) as $surface => $config ) {
				$settings['surfaces'][ $surface ] = [
					'enabled' => rest_sanitize_boolean( $config['enabled'] ?? false ),
					'copy'    => sanitize_text_field( (string) ( $config['copy'] ?? '' ) ),
				];
			}
		}

		return $settings;
	}

	/**
	 * Delete a campaign. Attached offers go back to everyday.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item( $request ) {
		return CampaignRepository::delete( (int) $request['id'] )
			? rest_ensure_response( [ 'deleted' => true ] )
			: new WP_Error( 'spsg_campaign_not_found', __( 'Campaign not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
	}

	/**
	 * What a delete will remove.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_delete_preview( $request ) {
		return rest_ensure_response( [ 'campaign_only' => CampaignService::campaign_only_names( (int) $request['id'] ) ] );
	}

	/**
	 * Publish, unpublish, pause, resume, end or clone.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function run_action( $request ) {
		$id      = (int) $request['id'];
		$actions = [
			'publish'   => [ CampaignService::class, 'publish' ],
			'unpublish' => [ CampaignService::class, 'unpublish' ],
			'pause'     => [ CampaignService::class, 'pause' ],
			'resume'    => [ CampaignService::class, 'resume' ],
			'end'       => [ CampaignService::class, 'end_now' ],
			'clone'     => [ CampaignRepository::class, 'duplicate' ],
		];

		$result = call_user_func( $actions[ (string) $request['action'] ], $id );

		return is_wp_error( $result ) ? $result : $this->detail_response( (int) $result );
	}

	/**
	 * The offers that can be attached, grouped by kind. Vendor deals are
	 * never listed; an overlap disables attaching and says why.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_attachable( $request ) {
		$campaign = CampaignRepository::get( (int) $request['id'] );

		if ( ! $campaign ) {
			return new WP_Error( 'spsg_campaign_not_found', __( 'Campaign not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		$groups = [];

		foreach ( $this->attachable_offers() as $kind => $offers ) {
			$groups[ $kind ] = array_map(
				static function ( array $offer ) use ( $campaign, $kind ): array {
					$overlap = CampaignRepository::find_overlap( $kind, (int) $offer['id'], $campaign['starts_at'], $campaign['ends_at'], (int) $campaign['id'] );
					$other   = $overlap ?? CampaignRepository::other_campaign_of_offer( $kind, (int) $offer['id'], (int) $campaign['id'] );

					return [
						'id'       => (int) $offer['id'],
						'name'     => (string) $offer['name'],
						'in'       => $other ? sprintf(
							/* translators: 1: campaign name, 2: its dates. */
							__( 'In %1$s, %2$s.', 'storegrowth-sales-booster' ),
							$other['name'],
							CampaignRepository::dates_label( $other )
						) : '',
						'disabled' => (bool) $overlap,
					];
				},
				$offers
			);
		}

		return rest_ensure_response( $groups );
	}

	/**
	 * Attachable offers by kind, admin-made only.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array[]>
	 */
	private function attachable_offers(): array {
		$is_vendor = static function ( array $offer ): bool {
			$author = (int) ( $offer['created_by'] ?? 0 );

			return $author && function_exists( 'dokan_is_user_seller' ) && dokan_is_user_seller( $author );
		};

		$named = static function ( array $offer, string $field ): array {
			return [
				'id'   => (int) $offer['id'],
				'name' => (string) ( $offer[ $field ] ?? '' ),
			];
		};

		$bogo = array_filter(
			(array) BogoDataManager::get_bogo_offers(),
			static function ( array $offer ) use ( $is_vendor ): bool {
				return ! $is_vendor( $offer );
			}
		);

		$bumps = array_filter(
			(array) ( new OrderBumpData() )->get_all( [ 'status' => '' ] ),
			static function ( array $bump ) use ( $is_vendor ): bool {
				return ! $is_vendor( $bump );
			}
		);

		return [
			OfferVersions::SMART_COUPON => $this->attachable_coupons(),
			OfferVersions::BOGO         => array_values(
				array_map(
					static function ( array $offer ) use ( $named ): array {
						return $named( $offer, 'name_of_order_bogo' );
					},
					$bogo
				)
			),
			OfferVersions::ORDER_BUMP   => array_values(
				array_map(
					static function ( array $bump ) use ( $named ): array {
						return $named( $bump, 'name' );
					},
					$bumps
				)
			),
		];
	}

	/**
	 * Smart Coupons that can be attached: every everyday coupon.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array[]
	 */
	private function attachable_coupons(): array {
		$coupons = [];

		foreach ( SmartCouponRepository::page( 1, 200 )['coupons'] as $coupon ) {
			if ( ! $coupon->get_meta( SmartCoupon::CAMPAIGN_OFFER ) ) {
				$coupons[] = [
					'id'   => $coupon->get_id(),
					'name' => SmartCoupon::name( $coupon ),
				];
			}
		}

		return $coupons;
	}

	/**
	 * Apply a template to a draft.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function apply_template( $request ) {
		$applied = CampaignService::apply_template( (int) $request['id'], (string) $request['template'] );

		return is_wp_error( $applied ) ? $applied : $this->detail_response( (int) $request['id'] );
	}

	/**
	 * Attach an offer.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function add_offer( $request ) {
		$id   = (int) $request['id'];
		$kind = (string) $request['kind'];

		if ( ! isset( self::offer_modules()[ $kind ] ) ) {
			return new WP_Error( 'spsg_campaign_invalid_kind', __( 'Unknown offer kind.', 'storegrowth-sales-booster' ), [ 'status' => 400 ] );
		}

		if ( $this->is_vendor_offer( $kind, (int) $request['offer_id'] ) ) {
			return new WP_Error( 'spsg_campaign_vendor_offer', __( 'Deals created by vendors can\'t be added to campaigns.', 'storegrowth-sales-booster' ), [ 'status' => 403 ] );
		}

		$result = CampaignRepository::attach( $id, $kind, (int) $request['offer_id'], [] );

		return is_wp_error( $result ) ? $result : $this->detail_response( $id );
	}

	/**
	 * Whether an offer was made by a Dokan vendor.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind     Offer kind.
	 * @param int    $offer_id Offer id.
	 *
	 * @return bool
	 */
	private function is_vendor_offer( string $kind, int $offer_id ): bool {
		$offer = [];

		if ( OfferVersions::BOGO === $kind ) {
			$offer = (array) BogoDataManager::get_bogo_offer( $offer_id );
		} elseif ( OfferVersions::ORDER_BUMP === $kind ) {
			$offer = (array) ( new OrderBumpData() )->get_by_id( $offer_id );
		}

		$author = (int) ( $offer['created_by'] ?? 0 );

		return $author && function_exists( 'dokan_is_user_seller' ) && dokan_is_user_seller( $author );
	}

	/**
	 * The offer row of a request, when it belongs to the campaign in the URL.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return array|WP_Error
	 */
	private function request_row( $request ) {
		$row = CampaignRepository::find_offer_row( (int) $request['row'] );

		if ( ! $row || (int) $row['promotion_id'] !== (int) $request['id'] ) {
			return new WP_Error( 'spsg_campaign_offer_not_found', __( 'Offer not found in this campaign.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		return $row;
	}

	/**
	 * Change a campaign version or a campaign-only offer's values.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_offer( $request ) {
		$row = $this->request_row( $request );

		if ( is_wp_error( $row ) ) {
			return $row;
		}

		$result = CampaignRecords::update( $row, wc_clean( (array) $request->get_json_params() ) );

		return is_wp_error( $result ) ? $result : $this->get_record( $request );
	}

	/**
	 * Take an offer off the campaign, or keep a campaign-only one as everyday.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function remove_offer( $request ) {
		$removed = CampaignRepository::remove_offer( (int) $request['row'], ! empty( $request['keep'] ) );

		return is_wp_error( $removed ) ? $removed : $this->detail_response( (int) $request['id'] );
	}

	/**
	 * The module route behind a record kind.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind Offer kind.
	 *
	 * @return string
	 */
	private static function record_route( string $kind ): string {
		$routes = [
			OfferVersions::BOGO         => 'bogo/offers',
			OfferVersions::ORDER_BUMP   => 'order-bumps',
			OfferVersions::SMART_COUPON => 'smart-coupons',
		];

		return '/sales-booster/v1/' . $routes[ $kind ];
	}

	/**
	 * The module's editor, for drawing a campaign version with its fields.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_record_editor( $request ) {
		$response = rest_do_request( new WP_REST_Request( 'GET', self::record_route( (string) $request['kind'] ) . '/editor' ) );

		return $response->is_error() ? $response->as_error() : rest_ensure_response( $response->get_data() );
	}

	/**
	 * A campaign version or campaign-only offer as a record.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_record( $request ) {
		$row = $this->request_row( $request );

		if ( is_wp_error( $row ) ) {
			return $row;
		}

		return rest_ensure_response( CampaignRecords::to_record( $row ) );
	}

	/**
	 * Create a campaign-only offer from its module's editor.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_record( $request ) {
		$row_id = CampaignRecords::create( (int) $request['id'], (string) $request['kind'], wc_clean( (array) $request->get_json_params() ) );

		return is_wp_error( $row_id ) ? $row_id : rest_ensure_response( CampaignRecords::to_record( CampaignRepository::find_offer_row( $row_id ) ) );
	}
}
