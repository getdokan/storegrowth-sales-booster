<?php
/**
 * File for Upgrader class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;
use StorePulse\StoreGrowth\Migrations\UpgradeManager;
use StorePulse\StoreGrowth\Migrations\UpgradeRESTController;
use StorePulse\StoreGrowth\Migrations\V_2_1_2;
use StorePulse\StoreGrowth\Migrations\V_3_0_0;
use StorePulse\StoreGrowth\Migrations\V_3_1_0;
use StorePulse\StoreGrowth\Notices\UpgradeNoticeProvider;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\AdminNotification\NoticeManager;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\AdminNotification\NoticeRESTController;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationHooks;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationManager;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Database upgrades and the admin notice that triggers them.
 *
 * Migrations are versioned and run on demand: the merchant is told an update is
 * pending through the REST backed notice feed, and the upgrade runs when they
 * confirm it, instead of on an arbitrary page load.
 *
 * @since 2.1.2
 */
class Upgrader implements HookRegistry {

	/**
	 * Option key holding the migrated database version.
	 *
	 * @since 2.1.2
	 */
	const DB_VERSION_KEY = 'spsg_db_version';

	/**
	 * Prefix of the hooks and options owned by the migration runner.
	 *
	 * @since 2.1.2
	 */
	const PREFIX = 'storegrowth';

	/**
	 * REST namespace serving the migration and notice routes.
	 *
	 * @since 2.1.2
	 */
	const REST_NAMESPACE = 'sales-booster/v1';

	/**
	 * Options proving the plugin ran before the database version was tracked.
	 *
	 * @since 2.1.2
	 */
	const LEGACY_INSTALL_OPTIONS = [
		'spsg_active_module_ids',
		'spsg_ini_completion',
		'spsg_user_consent_data',
	];

	/**
	 * Migration registry.
	 *
	 * @since 2.1.2
	 *
	 * @var MigrationRegistry
	 */
	protected MigrationRegistry $registry;

	/**
	 * Migration manager.
	 *
	 * @since 2.1.2
	 * @since 3.1.0 An UpgradeManager, recoverable after a failed run.
	 *
	 * @var UpgradeManager
	 */
	protected UpgradeManager $manager;

	/**
	 * Admin notice manager.
	 *
	 * @since 2.1.2
	 *
	 * @var NoticeManager
	 */
	protected NoticeManager $notices;

	/**
	 * Build the migration registry, manager and notice manager.
	 *
	 * @since 2.1.2
	 */
	public function __construct() {
		$this->registry = new MigrationRegistry( self::DB_VERSION_KEY, STOREGROWTH_VERSION );
		$this->registry->register_many(
			[
				'2.1.2' => V_2_1_2::class,
				'3.0.0' => V_3_0_0::class,
				'3.1.0' => V_3_1_0::class,
			]
		);

		$this->manager = new UpgradeManager( $this->registry, self::PREFIX );
		$this->notices = new NoticeManager( self::PREFIX );

		$this->notices->register_provider( new UpgradeNoticeProvider( $this->manager ) );
	}

	/**
	 * Register hooks.
	 *
	 * @since 2.1.2
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		( new MigrationHooks( $this->manager, self::PREFIX ) )->register();

		add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
		add_action( 'admin_notices', [ $this, 'render_upgrade_notice' ] );
	}

	/**
	 * Print the database update notice as a core admin notice.
	 *
	 * On StoreGrowth pages it is captured with the other admin notices and
	 * shown under the header (AdminMenu); elsewhere it shows where WordPress
	 * shows notices. The button posts to the migration REST route.
	 *
	 * @since 3.0.0
	 *
	 * @return void
	 */
	public function render_upgrade_notice(): void {
		if ( ! current_user_can( 'update_plugins' ) || ! $this->manager->is_upgrade_required() ) {
			return;
		}

		wp_enqueue_script( 'wp-api-fetch' );

		// A run that failed before this page load shows its error until the update succeeds.
		$error = $this->manager->last_error();
		$retry = __( 'Try again', 'storegrowth-sales-booster' );
		?>
		<div class="notice notice-<?php echo $error ? 'error' : 'warning'; ?>" id="spsg-upgrade-notice">
			<p><strong><?php echo esc_html( UpgradeNoticeProvider::title() ); ?></strong></p>
			<p><?php echo esc_html( UpgradeNoticeProvider::message() ); ?></p>
			<p class="spsg-upgrade-error" role="alert"<?php echo $error ? '' : ' hidden'; ?>>
				<?php
				if ( $error ) {
					/* translators: %s: the error of the failed migration. */
					echo esc_html( sprintf( __( 'The database update failed: %s', 'storegrowth-sales-booster' ), $error ) );
				}
				?>
			</p>
			<p>
				<button type="button" class="button button-primary" data-loading-text="<?php esc_attr_e( 'Updating…', 'storegrowth-sales-booster' ); ?>">
					<?php echo esc_html( $error ? $retry : __( 'Run the update', 'storegrowth-sales-booster' ) ); ?>
				</button>
			</p>
		</div>
		<?php
		// The notice stays until the update succeeds: only success reloads the page.
		wp_add_inline_script(
			'wp-api-fetch',
			sprintf(
				'document.addEventListener( "click", function ( event ) {
					var button = event.target.closest( "#spsg-upgrade-notice button" );
					if ( ! button || button.disabled ) { return; }
					var notice = button.closest( "#spsg-upgrade-notice" );
					var message = notice.querySelector( ".spsg-upgrade-error" );
					button.disabled = true;
					button.textContent = button.dataset.loadingText;
					message.hidden = true;
					wp.apiFetch( { path: %s, method: "POST" } ).then( function () {
						window.location.reload();
					}, function ( error ) {
						button.disabled = false;
						button.textContent = %s;
						notice.classList.replace( "notice-warning", "notice-error" );
						message.textContent = ( error && error.code !== "invalid_json" && error.message ) || %s;
						message.hidden = false;
					} );
				} );',
				wp_json_encode( '/' . self::REST_NAMESPACE . '/migration/upgrade' ),
				wp_json_encode( $retry ),
				wp_json_encode( __( 'The database update failed. Please try again, or contact support if it keeps failing.', 'storegrowth-sales-booster' ) )
			)
		);
	}

	/**
	 * Register the migration and notice REST routes.
	 *
	 * @since 2.1.2
	 *
	 * @return void
	 */
	public function register_rest_routes(): void {
		( new UpgradeRESTController( $this->manager, self::REST_NAMESPACE ) )->register_routes();
		( new NoticeRESTController( $this->notices, self::REST_NAMESPACE ) )->register_routes();
	}

	/**
	 * Retrieve the migration manager.
	 *
	 * @since 2.1.2
	 *
	 * @return MigrationManager
	 */
	public function get_manager(): MigrationManager {
		return $this->manager;
	}

	/**
	 * Stamp the current version on a fresh install.
	 *
	 * A site installing StoreGrowth for the first time has nothing to migrate,
	 * so it starts at the current version and never sees the upgrade notice. A
	 * site that ran an older release keeps its missing version, which leaves the
	 * pending migrations to run.
	 *
	 * @since 2.1.2
	 * @since 3.0.0 Returns whether the install was fresh.
	 *
	 * @return bool True when this is a fresh install (the version was stamped).
	 */
	public static function maybe_stamp_fresh_install(): bool {
		if ( false !== get_option( self::DB_VERSION_KEY, false ) ) {
			return false;
		}

		foreach ( self::LEGACY_INSTALL_OPTIONS as $option ) {
			if ( null !== get_option( $option, null ) ) {
				return false;
			}
		}

		update_option( self::DB_VERSION_KEY, STOREGROWTH_VERSION, false );

		return true;
	}
}
