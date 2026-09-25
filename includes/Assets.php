<?php
/**
 * Enqueue class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Traits\Singleton;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add styles of scripts files inside this class.
 */
class Assets {

	use Singleton;

	/**
	 * Modules page slug.
	 *
	 * @var string
	 */
	private $modules_page_hook = 'storegrowth_page_spsg-modules';

	/**
	 * Module settings page slug.
	 *
	 * @var string
	 */
	private $settings_page_hook = 'storegrowth_page_spsg-settings';

	/**
	 * Shared admin bundles built into `build/`, keyed by script handle.
	 *
	 * Other bundles import them by bare specifier and receive the handle as a
	 * dependency through their `.asset.php` (webpack-dependency-mapping.js).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<string, string>
	 */
	private $shared_bundles = array(
		'spsg-plugin-ui'  => 'plugin-ui',
		'spsg-utilities'  => 'utilities',
		'spsg-hooks'      => 'hooks',
		'spsg-components' => 'components',
	);

	/**
	 * Constructor of Enqueue class.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_all_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'register_admin_app' ), 5 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 11 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_styles' ) );
	}

	/**
	 * Register scripts here.
	 *
	 * @return void
	 */
	public function register_all_scripts() {
		wp_register_script(
			'spsg-accounting',
			WC()->plugin_url() . '/assets/js/accounting/accounting.min.js',
			[ 'jquery' ],
			WC()->version,
			false
		);

		// Localize the accounting script shared by every admin screen.
		wp_localize_script(
			'spsg-accounting',
			'spsg',
			/**
			 * Filters the arguments localized for the shared `spsg` script object.
			 *
			 * @since 2.0.1
			 *
			 * @param array $args Localized arguments, keyed by name.
			 */
			apply_filters(
				'spsg_global_common_localized_args',
				array(
					'currency' => array(
						'precision' => wc_get_price_decimals(),
						'symbol'    => html_entity_decode( get_woocommerce_currency_symbol() ),
						'decimal'   => esc_attr( wc_get_price_decimal_separator() ),
						'thousand'  => esc_attr( wc_get_price_thousand_separator() ),
						'position'  => esc_attr( get_option( 'woocommerce_currency_pos' ) ),
						'format'    => esc_attr( str_replace( [ '%1$s', '%2$s' ], [ '%s', '%v' ], get_woocommerce_price_format() ) ), // For accounting JS.
					),
				)
			),
		);
	}

	/**
	 * Register the admin app bundles, their shared libraries and the scoped
	 * Tailwind stylesheet.
	 *
	 * A missing build file is logged and its handle skipped: WordPress then
	 * refuses to enqueue anything that depends on it, which is visible and
	 * diagnosable, instead of a fatal `require` error.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_admin_app(): void {
		foreach ( $this->shared_bundles as $handle => $bundle ) {
			$this->register_bundle_script( $handle, $bundle );
		}

		$this->register_bundle_script( 'spsg-admin', 'admin' );
		$this->register_bundle_script( 'spsg-admin-header', 'header' );

		if ( file_exists( Helper::get_plugin_path( 'build/tailwind.css' ) ) ) {
			wp_register_style(
				'spsg-tailwind',
				Helper::get_plugin_url( 'build/tailwind.css' ),
				array( 'wp-components' ),
				filemtime( Helper::get_plugin_path( 'build/tailwind.css' ) )
			);
		}

		wp_register_style(
			'spsg-font-inter',
			'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap',
			array(),
			null // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- Google Fonts versions itself.
		);

		// Old handle names now resolve to the new app (ADR-005: handles are kept).
		foreach ( array( 'spsg-settings-script', 'spsg-modules-script', 'spsg-notices-script' ) as $legacy_handle ) {
			wp_register_script( $legacy_handle, false, array( 'spsg-admin' ), STOREGROWTH_VERSION, true );
		}
	}

	/**
	 * Register one webpack bundle from its generated `.asset.php`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $handle Script handle.
	 * @param string $bundle Bundle path inside `build/`, without extension.
	 *
	 * @return void
	 */
	private function register_bundle_script( string $handle, string $bundle ): void {
		$asset_file = Helper::get_plugin_path( "build/{$bundle}.asset.php" );

		if ( ! file_exists( $asset_file ) ) {
			wc_get_logger()->error(
				sprintf( 'StoreGrowth: missing build file %s; the "%s" script is not registered. Run npm run build.', $asset_file, $handle ),
				array( 'source' => 'storegrowth-sales-booster' )
			);

			return;
		}

		$asset = require $asset_file;

		wp_register_script(
			$handle,
			Helper::get_plugin_url( "build/{$bundle}.js" ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations( $handle, 'storegrowth-sales-booster', Helper::get_plugin_path( 'languages' ) );
	}

	/**
	 * Add JS scripts to admin.
	 *
	 * @param string $hook page slug.
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( $this->modules_page_hook !== $hook && $this->settings_page_hook !== $hook ) {
			return;
		}

		wp_enqueue_script( 'spsg-admin' );

		wp_localize_script(
			'spsg-admin',
			'spsgAdmin',
			/**
			 * Filters the data localized for the StoreGrowth admin app.
			 *
			 * @since SPSG_VERSION
			 *
			 * @param array $data Localized data.
			 */
			apply_filters(
				'spsg_admin_localized_data',
				array(
					// Kept for back-compat (ADR-005).
					'ajax_url'      => admin_url( 'admin-ajax.php' ),
					'nonce'         => wp_create_nonce( 'spsg_ajax_nonce' ),
					'isPro'         => sp_store_growth()->has_pro(),
					// New admin app.
					'version'       => STOREGROWTH_VERSION,
					'restNamespace' => 'sales-booster/v1',
					'modules'       => storegrowth_get_container()->get( ModuleManager::class )->list_all_modules(),
					'urls'          => array(
						'admin'          => admin_url( 'admin.php' ),
						'assets'         => Helper::get_plugin_url( 'assets/' ),
						'upgrade'        => 'https://storegrowth.io/pricing',
						'docs'           => 'https://storegrowth.io/docs/',
						'support'        => 'https://storegrowth.io/contact-us/',
						'whatsNew'       => 'https://storegrowth.io/changelog/',
						'featureRequest' => 'https://storegrowth.io/contact-us/',
					),
				)
			)
		);

		wp_enqueue_script( 'spsg-admin-header' );

		wp_localize_script(
			'spsg-admin-header',
			'spsgAdminHeader',
			array(
				'logo_url'      => Helper::get_plugin_url( 'assets/images/storegrowth-logo.svg' ),
				'dashboard_url' => admin_url( 'admin.php?page=spsg-settings#/dashboard' ),
				/**
				 * Filters the data shown in the StoreGrowth admin header.
				 *
				 * @since SPSG_VERSION
				 *
				 * @param array $header_info Header data.
				 */
				'header_info'   => apply_filters(
					'spsg_admin_header_info',
					array(
						'lite_version'  => STOREGROWTH_VERSION,
						'is_pro_exists' => sp_store_growth()->has_pro(),
						'pro_version'   => $this->get_pro_version(),
						'upgrade_url'   => 'https://storegrowth.io/pricing',
						'whats_new_url' => 'https://storegrowth.io/changelog/',
						'support_url'   => 'https://storegrowth.io/contact-us/',
					)
				),
			)
		);

		wp_localize_script(
			'spsg-admin',
			'spsgNotices',
			[
				'noticesUrl' => rest_url( Upgrader::REST_NAMESPACE . '/notices/admin' ),
				'actionUrl'  => rest_url( Upgrader::REST_NAMESPACE . '/migration/upgrade' ),
			]
		);
	}

	/**
	 * Installed StoreGrowth Pro version, or an empty string.
	 *
	 * Pro has no version constant, so the version is read from its plugin
	 * header.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	private function get_pro_version(): string {
		if ( ! defined( 'STOREGROWTH_PRO_FILE' ) || ! is_readable( STOREGROWTH_PRO_FILE ) ) {
			return '';
		}

		$data = get_file_data( STOREGROWTH_PRO_FILE, array( 'version' => 'Version' ) );

		return (string) ( $data['version'] ?? '' );
	}

	/**
	 * Add CSS files to admin.
	 *
	 * @param string $hook page slug.
	 */
	public function admin_enqueue_styles( $hook ) {
		if ( $this->modules_page_hook !== $hook && $this->settings_page_hook !== $hook ) {
			return;
		}

		wp_enqueue_style( 'spsg-font-inter' );
		wp_enqueue_style( 'spsg-tailwind' );
	}
}
