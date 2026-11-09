<?php
/**
 * Campaign storage (ADR-013).
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Offers;

use DateTimeImmutable;
use Exception;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Modules\BoGo\BogoDataManager;
use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;
use StorePulse\StoreGrowth\Support\SiteTime;
use WP_Error;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Every query below reads or writes this class's own tables, named by constants.
// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

/**
 * Campaigns and their offer lists. A campaign's version of an offer lives on
 * the list, never on the offer, and so do offers that exist only inside a
 * campaign (`offer_id` 0).
 *
 * In these tables "promotion" is a real campaign: `campaign_id` elsewhere in
 * StoreGrowth means a single offer (ADR-012).
 *
 * @since SPSG_VERSION
 */
class CampaignRepository implements HookRegistry {

	/**
	 * Unprefixed name of the campaigns table.
	 *
	 * @since SPSG_VERSION
	 */
	const CAMPAIGNS = 'spsg_campaigns';

	/**
	 * Unprefixed name of the campaign offer list table.
	 *
	 * @since SPSG_VERSION
	 */
	const OFFERS = 'spsg_campaign_offers';

	/**
	 * Option holding the installed table version (not autoloaded).
	 *
	 * @since SPSG_VERSION
	 */
	const VERSION_OPTION = 'spsg_campaigns_db_version';

	/**
	 * Current table version.
	 *
	 * @since SPSG_VERSION
	 */
	const VERSION = '1';

	/**
	 * Option holding the next moment a campaign starts or ends (read on
	 * every request by #309's check, so autoloaded).
	 *
	 * @since SPSG_VERSION
	 */
	const BOUNDARY_OPTION = 'spsg_promotion_next_boundary';

	/**
	 * Stored status: being prepared.
	 *
	 * @since SPSG_VERSION
	 */
	const STATUS_DRAFT = 'draft';

	/**
	 * Stored status: published, follows its dates.
	 *
	 * @since SPSG_VERSION
	 */
	const STATUS_SCHEDULED = 'scheduled';

	/**
	 * Stored status: stopped by the merchant.
	 *
	 * @since SPSG_VERSION
	 */
	const STATUS_PAUSED = 'paused';

	/**
	 * Clock status: published and inside its window. Never stored.
	 *
	 * @since SPSG_VERSION
	 */
	const STATUS_RUNNING = 'running';

	/**
	 * Clock status: past its end. Never stored.
	 *
	 * @since SPSG_VERSION
	 */
	const STATUS_ENDED = 'ended';

	/**
	 * The published campaigns' offer rows, for this request.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array[]|null
	 */
	private static ?array $published_rows = null;

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_filter( 'wpmu_drop_tables', [ $this, 'drop_tables_with_site' ] );
	}

	/**
	 * Drop the tables with a deleted multisite site.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string[] $tables Prefixed table names to drop.
	 *
	 * @return string[]
	 */
	public function drop_tables_with_site( $tables ) {
		global $wpdb;

		$tables[] = $wpdb->prefix . self::CAMPAIGNS;
		$tables[] = $wpdb->prefix . self::OFFERS;

		return $tables;
	}

	/**
	 * Whether the tables have been created. Until then there are no campaigns.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public static function is_installed(): bool {
		return false !== get_option( self::VERSION_OPTION, false );
	}

	/**
	 * Create or upgrade the tables.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function install(): void {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$campaigns = $wpdb->prefix . self::CAMPAIGNS;
		$offers    = $wpdb->prefix . self::OFFERS;
		$collate   = $wpdb->get_charset_collate();

		// dbDelta needs two spaces before PRIMARY KEY.
		dbDelta(
			"CREATE TABLE {$campaigns} (
	id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL DEFAULT '',
	status varchar(20) NOT NULL DEFAULT 'draft',
	starts_at datetime DEFAULT NULL,
	ends_at datetime DEFAULT NULL,
	created_by bigint(20) unsigned NOT NULL DEFAULT 0,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY  (id),
	KEY status (status)
) {$collate};"
		);

		dbDelta(
			"CREATE TABLE {$offers} (
	id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	promotion_id bigint(20) unsigned NOT NULL,
	offer_kind varchar(40) NOT NULL,
	offer_id bigint(20) unsigned NOT NULL DEFAULT 0,
	overrides longtext NOT NULL,
	PRIMARY KEY  (id),
	KEY promotion_id (promotion_id),
	KEY offer (offer_kind, offer_id)
) {$collate};"
		);

		// Marked installed only once the tables are really there.
		foreach ( [ $campaigns, $offers ] as $name ) {
			if ( $name !== $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $name ) ) ) ) {
				return;
			}
		}

		update_option( self::VERSION_OPTION, self::VERSION, false );
	}

	/**
	 * Forget this request's rows and work out the next boundary again.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	private static function changed(): void {
		self::flush();
		self::recompute_boundary();
	}

	/**
	 * Forget this request's rows.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function flush(): void {
		self::$published_rows = null;
	}

	/**
	 * A campaign's status at a moment. Draft and paused are the merchant's;
	 * a published campaign is scheduled, running or ended by the clock, and
	 * a paused one ends with its date. Without a start date it never runs.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array             $campaign `status`, `starts_at` and `ends_at`.
	 * @param DateTimeImmutable $now      Moment to check.
	 *
	 * @return string
	 */
	public static function status_at( array $campaign, DateTimeImmutable $now ): string {
		if ( self::STATUS_DRAFT === $campaign['status'] ) {
			return self::STATUS_DRAFT;
		}

		$start = SiteTime::parse( $campaign['starts_at'] ?? null );
		$end   = SiteTime::parse( $campaign['ends_at'] ?? null, true );

		if ( $end && $now > $end ) {
			return self::STATUS_ENDED;
		}

		if ( self::STATUS_PAUSED === $campaign['status'] ) {
			return self::STATUS_PAUSED;
		}

		return $start && $start <= $now ? self::STATUS_RUNNING : self::STATUS_SCHEDULED;
	}

	/**
	 * The offer rows of every published campaign, read once per request.
	 * Campaign-only offers come first, so they win over attached ones.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array[]
	 */
	private static function published_rows(): array {
		if ( null !== self::$published_rows ) {
			return self::$published_rows;
		}

		self::$published_rows = [];

		if ( ! self::is_installed() ) {
			return self::$published_rows;
		}

		global $wpdb;

		$campaigns = $wpdb->prefix . self::CAMPAIGNS;
		$offers    = $wpdb->prefix . self::OFFERS;

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT o.*, c.status, c.starts_at, c.ends_at FROM {$offers} o INNER JOIN {$campaigns} c ON c.id = o.promotion_id WHERE c.status = %s ORDER BY o.offer_id ASC, c.starts_at DESC, o.id DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				self::STATUS_SCHEDULED
			),
			ARRAY_A
		);

		self::$published_rows = array_map( [ self::class, 'hydrate' ], (array) $rows );

		return self::$published_rows;
	}

	/**
	 * A stored offer row with its JSON decoded. A campaign-only offer's
	 * values get its row as `campaign_offer_id` and no `id` of its own: the
	 * row id would read as the id of a real offer in attribution.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $row Stored row.
	 *
	 * @return array
	 */
	private static function hydrate( array $row ): array {
		$overrides        = json_decode( (string) $row['overrides'], true );
		$row['overrides'] = is_array( $overrides ) ? $overrides : [];
		$row['offer_id']  = (int) $row['offer_id'];

		if ( ! $row['offer_id'] ) {
			$row['values'] = array_merge(
				$row['overrides'],
				[
					'id'                => 0,
					'campaign_offer_id' => (int) $row['id'],
				]
			);
		}

		return $row;
	}

	/**
	 * The offer rows of the campaigns running at a moment, for one kind.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string            $kind Offer kind.
	 * @param DateTimeImmutable $now  Moment to check.
	 *
	 * @return array[]
	 */
	public static function running_offers( string $kind, DateTimeImmutable $now ): array {
		if ( ! sp_store_growth()->has_pro() ) {
			return [];
		}

		return array_values(
			array_filter(
				self::published_rows(),
				static function ( array $row ) use ( $kind, $now ): bool {
					return $kind === $row['offer_kind'] && self::STATUS_RUNNING === self::status_at( $row, $now );
				}
			)
		);
	}

	/**
	 * The running campaign's row for an attached offer. The overlap rule
	 * leaves at most one; the latest start wins if stored data has more.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string            $kind     Offer kind.
	 * @param int               $offer_id Offer id.
	 * @param DateTimeImmutable $now      Moment to check.
	 *
	 * @return array|null
	 */
	public static function running_row( string $kind, int $offer_id, DateTimeImmutable $now ): ?array {
		if ( ! $offer_id ) {
			return null;
		}

		foreach ( self::running_offers( $kind, $now ) as $row ) {
			if ( $row['offer_id'] === $offer_id ) {
				return $row;
			}
		}

		return null;
	}

	/**
	 * One offer row with its campaign's status and dates, whatever the status.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $row_id Offer row id.
	 *
	 * @return array|null
	 */
	public static function find_offer_row( int $row_id ): ?array {
		foreach ( self::published_rows() as $row ) {
			if ( (int) $row['id'] === $row_id ) {
				return $row;
			}
		}

		if ( ! self::is_installed() ) {
			return null;
		}

		global $wpdb;

		$campaigns = $wpdb->prefix . self::CAMPAIGNS;
		$offers    = $wpdb->prefix . self::OFFERS;

		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT o.*, c.status, c.starts_at, c.ends_at FROM {$offers} o INNER JOIN {$campaigns} c ON c.id = o.promotion_id WHERE o.id = %d", $row_id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			ARRAY_A
		);

		return $row ? self::hydrate( $row ) : null;
	}

	/**
	 * A campaign.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return array|null
	 */
	public static function get( int $id ): ?array {
		if ( ! self::is_installed() ) {
			return null;
		}

		global $wpdb;

		$table    = $wpdb->prefix . self::CAMPAIGNS;
		$campaign = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		return $campaign ? $campaign : null;
	}

	/**
	 * A campaign's offer rows.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $promotion_id Campaign id.
	 *
	 * @return array[]
	 */
	public static function get_offers( int $promotion_id ): array {
		if ( ! self::is_installed() ) {
			return [];
		}

		global $wpdb;

		$table = $wpdb->prefix . self::OFFERS;
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} WHERE promotion_id = %d ORDER BY id ASC", $promotion_id ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		return array_map( [ self::class, 'hydrate' ], (array) $rows );
	}

	/**
	 * Create a campaign, or update one when `$id` is given. Only the keys
	 * sent change. Dates that would overlap for an attached offer are refused.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $data `name`, `status` (draft, scheduled or paused), `starts_at`, `ends_at`.
	 * @param int   $id   Campaign id; 0 to create.
	 *
	 * @return int|WP_Error Campaign id.
	 */
	public static function save( array $data, int $id = 0 ) {
		global $wpdb;

		if ( ! self::is_installed() ) {
			return new WP_Error( 'spsg_campaigns_not_installed', __( 'Run the database update first.', 'storegrowth-sales-booster' ), [ 'status' => 503 ] );
		}

		$row = array_intersect_key( $data, array_flip( [ 'name', 'status', 'starts_at', 'ends_at' ] ) );

		if ( isset( $row['name'] ) ) {
			$row['name'] = sanitize_text_field( $row['name'] );
		}

		if ( isset( $row['status'] ) && ! in_array( $row['status'], [ self::STATUS_DRAFT, self::STATUS_SCHEDULED, self::STATUS_PAUSED ], true ) ) {
			return new WP_Error( 'spsg_campaign_invalid_status', __( 'Invalid campaign status.', 'storegrowth-sales-booster' ), [ 'status' => 400 ] );
		}

		if ( array_key_exists( 'starts_at', $row ) ) {
			$row['starts_at'] = self::normalize_date( $row['starts_at'], false );
		}

		if ( array_key_exists( 'ends_at', $row ) ) {
			$row['ends_at'] = self::normalize_date( $row['ends_at'], true );
		}

		$stored = $id ? self::get( $id ) : null;

		if ( $id && ! $stored ) {
			return new WP_Error( 'spsg_campaign_not_found', __( 'Campaign not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		$window = array_merge( (array) $stored, $row );

		foreach ( $id ? self::get_offers( $id ) : [] as $offer ) {
			if ( $offer['offer_id'] && self::find_overlap( $offer['offer_kind'], $offer['offer_id'], $window['starts_at'] ?? null, $window['ends_at'] ?? null, $id ) ) {
				return self::overlap_error();
			}
		}

		if ( $id ) {
			if ( $row ) {
				$wpdb->update( $wpdb->prefix . self::CAMPAIGNS, $row, [ 'id' => $id ] );
			}
		} else {
			$wpdb->insert( $wpdb->prefix . self::CAMPAIGNS, array_merge( [ 'status' => self::STATUS_DRAFT ], $row, [ 'created_by' => get_current_user_id() ] ) );
			$id = (int) $wpdb->insert_id;
		}

		self::changed();

		return $id;
	}

	/**
	 * A date as stored: site-local, an end running through its last minute
	 * (`23:59` means up to `23:59:59`).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value  Date or date-time.
	 * @param bool  $is_end Whether it's the end of the window.
	 *
	 * @return string|null
	 */
	private static function normalize_date( $value, bool $is_end ): ?string {
		if ( $is_end && is_string( $value ) && preg_match( '/ \d{2}:\d{2}$/', trim( $value ) ) ) {
			$value = trim( $value ) . ':59';
		}

		$date = SiteTime::parse( $value, $is_end );

		return $date ? $date->format( 'Y-m-d H:i:s' ) : null;
	}

	/**
	 * The error for windows that overlap.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return WP_Error
	 */
	private static function overlap_error(): WP_Error {
		return new WP_Error( 'spsg_campaign_overlap', __( 'This offer is already in a campaign at those dates.', 'storegrowth-sales-booster' ), [ 'status' => 409 ] );
	}

	/**
	 * The campaign whose window overlaps these dates for an offer, if any.
	 * Ended campaigns and campaigns without dates never count; no end date
	 * means the window never closes.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string                 $kind         Offer kind.
	 * @param int                    $offer_id     Offer id.
	 * @param mixed                  $starts_at    Window start.
	 * @param mixed                  $ends_at      Window end.
	 * @param int                    $promotion_id Campaign to leave out.
	 * @param DateTimeImmutable|null $now          Moment to check, the current one by default.
	 *
	 * @return array|null
	 */
	public static function find_overlap( string $kind, int $offer_id, $starts_at, $ends_at, int $promotion_id = 0, ?DateTimeImmutable $now = null ): ?array {
		$start = SiteTime::parse( $starts_at );
		$end   = SiteTime::parse( $ends_at, true );

		if ( ! $start || ! self::is_installed() ) {
			return null;
		}

		global $wpdb;

		$campaigns = $wpdb->prefix . self::CAMPAIGNS;
		$offers    = $wpdb->prefix . self::OFFERS;
		$now       = $now ?? SiteTime::now();

		$others = (array) $wpdb->get_results(
			$wpdb->prepare(
				"SELECT c.* FROM {$campaigns} c INNER JOIN {$offers} o ON o.promotion_id = c.id WHERE o.offer_kind = %s AND o.offer_id = %d AND c.id != %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$kind,
				$offer_id,
				$promotion_id
			),
			ARRAY_A
		);

		foreach ( $others as $other ) {
			$other_start = SiteTime::parse( $other['starts_at'] );
			$other_end   = SiteTime::parse( $other['ends_at'], true );

			if ( ! $other_start || self::STATUS_ENDED === self::status_at( $other, $now ) ) {
				continue;
			}

			if ( ( ! $other_end || $start <= $other_end ) && ( ! $end || $other_start <= $end ) ) {
				return $other;
			}
		}

		return null;
	}

	/**
	 * Attach an everyday offer to a campaign, or change its campaign version.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int    $promotion_id Campaign id.
	 * @param string $kind         Offer kind.
	 * @param int    $offer_id     Offer id.
	 * @param array  $overrides    The values the campaign changes; empty for "Use as is".
	 *
	 * @return int|WP_Error Offer row id.
	 */
	public static function attach( int $promotion_id, string $kind, int $offer_id, array $overrides = [] ) {
		global $wpdb;

		$campaign = self::get( $promotion_id );

		if ( ! $campaign ) {
			return new WP_Error( 'spsg_campaign_not_found', __( 'Campaign not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		if ( self::find_overlap( $kind, $offer_id, $campaign['starts_at'], $campaign['ends_at'], $promotion_id ) ) {
			return self::overlap_error();
		}

		$table = $wpdb->prefix . self::OFFERS;

		$existing = (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT id FROM {$table} WHERE promotion_id = %d AND offer_kind = %s AND offer_id = %d", $promotion_id, $kind, $offer_id ) // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		);

		if ( $existing ) {
			$wpdb->update( $table, [ 'overrides' => wp_json_encode( $overrides ) ], [ 'id' => $existing ] );
			self::changed();

			return $existing;
		}

		return self::insert_offer( $promotion_id, $kind, $offer_id, $overrides );
	}

	/**
	 * Add an offer that exists only inside a campaign.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int    $promotion_id Campaign id.
	 * @param string $kind         Offer kind.
	 * @param array  $values       All the offer's values, as its module stores them.
	 *
	 * @return int|WP_Error Offer row id.
	 */
	public static function add_campaign_only( int $promotion_id, string $kind, array $values ) {
		if ( ! self::get( $promotion_id ) ) {
			return new WP_Error( 'spsg_campaign_not_found', __( 'Campaign not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		return self::insert_offer( $promotion_id, $kind, 0, $values );
	}

	/**
	 * Store one row of a campaign's offer list.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int    $promotion_id Campaign id.
	 * @param string $kind         Offer kind.
	 * @param int    $offer_id     Offer id; 0 for a campaign-only offer.
	 * @param array  $overrides    Campaign version, or a campaign-only offer's values.
	 *
	 * @return int Offer row id.
	 */
	private static function insert_offer( int $promotion_id, string $kind, int $offer_id, array $overrides ): int {
		global $wpdb;

		$wpdb->insert(
			$wpdb->prefix . self::OFFERS,
			[
				'promotion_id' => $promotion_id,
				'offer_kind'   => $kind,
				'offer_id'     => $offer_id,
				'overrides'    => wp_json_encode( $overrides ),
			]
		);

		$row_id = (int) $wpdb->insert_id;

		self::changed();

		return $row_id;
	}

	/**
	 * Take an offer off its campaign. A campaign-only offer is deleted, or
	 * with `$keep` becomes an everyday offer that starts off.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int  $row_id Offer row id.
	 * @param bool $keep   Keep a campaign-only offer as an everyday offer.
	 *
	 * @return true|WP_Error
	 */
	public static function remove_offer( int $row_id, bool $keep = false ) {
		global $wpdb;

		$row = self::find_offer_row( $row_id );

		if ( ! $row ) {
			return new WP_Error( 'spsg_campaign_offer_not_found', __( 'Offer not found in this campaign.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		if ( $keep && ! $row['offer_id'] ) {
			$kept = self::keep_as_everyday( $row['offer_kind'], $row['overrides'] );

			if ( is_wp_error( $kept ) ) {
				return $kept;
			}
		}

		$wpdb->delete( $wpdb->prefix . self::OFFERS, [ 'id' => $row_id ] );
		self::changed();

		return true;
	}

	/**
	 * Save a campaign-only offer as an everyday offer that starts off.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $kind   Offer kind.
	 * @param array  $values The offer's values.
	 *
	 * @return true|WP_Error
	 */
	private static function keep_as_everyday( string $kind, array $values ) {
		$failed = new WP_Error( 'spsg_campaign_offer_keep_failed', __( 'The offer could not be kept.', 'storegrowth-sales-booster' ), [ 'status' => 500 ] );

		if ( OfferVersions::ORDER_BUMP === $kind ) {
			return ( new OrderBumpData() )->create( array_merge( $values, [ 'status' => 'inactive' ] ) ) ? true : $failed;
		}

		if ( OfferVersions::BOGO !== $kind ) {
			return $failed;
		}

		$data = array_merge( BogoDataManager::to_request_data( $values ), [ 'status' => 'inactive' ] );

		if ( 'product' !== ( $values['type'] ?? '' ) ) {
			try {
				return BogoDataManager::create_global_offer( $data ) ? true : $failed;
			} catch ( Exception $e ) {
				return $failed;
			}
		}

		$product_id   = (int) ( $values['product_id'] ?? 0 );
		$variation_id = (int) ( $values['variation_id'] ?? 0 );

		// One everyday rule per product (`unique_product_variation`).
		$taken = BogoDataManager::get_bogo_offers(
			[
				'type'         => 'product',
				'product_id'   => $product_id,
				'variation_id' => $variation_id,
			],
			[ 'limit' => 1 ]
		);

		if ( $taken ) {
			return new WP_Error( 'spsg_campaign_offer_keep_conflict', __( 'This product already has an everyday rule.', 'storegrowth-sales-booster' ), [ 'status' => 409 ] );
		}

		return BogoDataManager::save_product_bogo_settings( $product_id, $variation_id, $data ) ? true : $failed;
	}

	/**
	 * Delete a campaign with its versions and campaign-only offers. Everyday
	 * offers are not touched.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return bool
	 */
	public static function delete( int $id ): bool {
		global $wpdb;

		if ( ! self::get( $id ) ) {
			return false;
		}

		$wpdb->delete( $wpdb->prefix . self::OFFERS, [ 'promotion_id' => $id ] );
		$wpdb->delete( $wpdb->prefix . self::CAMPAIGNS, [ 'id' => $id ] );

		self::changed();

		return true;
	}

	/**
	 * Clone or run a campaign again: a new draft with empty dates, its
	 * attached offers with their versions and copies of its campaign-only
	 * offers.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param int $id Campaign id.
	 *
	 * @return int|WP_Error New campaign id.
	 */
	public static function duplicate( int $id ) {
		$campaign = self::get( $id );

		if ( ! $campaign ) {
			return new WP_Error( 'spsg_campaign_not_found', __( 'Campaign not found.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		$new_id = self::save(
			[
				/* translators: %s: campaign name. */
				'name' => sprintf( __( '%s (copy)', 'storegrowth-sales-booster' ), $campaign['name'] ),
			]
		);

		if ( is_wp_error( $new_id ) ) {
			return $new_id;
		}

		foreach ( self::get_offers( $id ) as $offer ) {
			self::insert_offer( $new_id, $offer['offer_kind'], $offer['offer_id'], $offer['overrides'] );
		}

		return $new_id;
	}

	/**
	 * The next moment after `$now` a published campaign starts or ends.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable $now Moment to check.
	 *
	 * @return DateTimeImmutable|null
	 */
	public static function next_boundary( DateTimeImmutable $now ): ?DateTimeImmutable {
		if ( ! self::is_installed() ) {
			return null;
		}

		global $wpdb;

		$table = $wpdb->prefix . self::CAMPAIGNS;
		$rows  = (array) $wpdb->get_results( $wpdb->prepare( "SELECT starts_at, ends_at FROM {$table} WHERE status = %s", self::STATUS_SCHEDULED ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		$next = null;

		foreach ( $rows as $row ) {
			foreach ( [ SiteTime::parse( $row['starts_at'] ), SiteTime::parse( $row['ends_at'], true ) ] as $moment ) {
				if ( $moment && $moment > $now && ( ! $next || $moment < $next ) ) {
					$next = $moment;
				}
			}
		}

		return $next;
	}

	/**
	 * Save the next boundary as a timestamp. Idempotent, for #308's saves
	 * and #309's boundary job to call.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param DateTimeImmutable|null $now Moment to check, the current one by default.
	 *
	 * @return int|null The timestamp; null when no boundary is ahead.
	 */
	public static function recompute_boundary( ?DateTimeImmutable $now = null ): ?int {
		$next = self::next_boundary( $now ?? SiteTime::now() );

		if ( ! $next ) {
			delete_option( self::BOUNDARY_OPTION );

			return null;
		}

		update_option( self::BOUNDARY_OPTION, $next->getTimestamp() );

		return $next->getTimestamp();
	}
}
