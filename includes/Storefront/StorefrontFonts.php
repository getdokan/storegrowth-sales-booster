<?php
/**
 * Storefront font loader.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Storefront;

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Interfaces\HookRegistry;

defined( 'ABSPATH' ) || exit;

/**
 * One font loader for every module (ADR-005 S4).
 *
 * Modules call `StorefrontFonts::request( $family )` for the fonts they
 * actually render. The loader enqueues each family once: bundled files where
 * the plugin ships them (Merienda for now), otherwise a single Google Fonts
 * request for all the rest. Fonts requested before `wp_head` load in the
 * head; fonts requested later (from templates) load in the footer.
 *
 * @since SPSG_VERSION
 */
class StorefrontFonts implements HookRegistry {

	/**
	 * Families offered for new font settings. Stored values outside this list
	 * (e.g. older Countdown fonts) stay valid and still load.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const FAMILIES = array( 'inherit', 'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato' );

	/**
	 * Weights loaded for every family.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var int[]
	 */
	const WEIGHTS = array( 400, 500, 600, 700 );

	/**
	 * Families requested and not yet enqueued.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<string, true>
	 */
	private static $pending = array();

	/**
	 * Families already enqueued.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<string, true>
	 */
	private static $loaded = array();

	/**
	 * Register the hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( self::class, 'flush' ), 100 );
		// Before `_wp_footer_scripts` prints late styles (priority 10).
		add_action( 'wp_print_footer_scripts', array( self::class, 'flush' ), 1 );
	}

	/**
	 * Ask for a font family on this page. `inherit` and empty values are
	 * ignored; names with anything other than letters, digits, spaces and
	 * hyphens are rejected.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $family Font family, e.g. `Poppins`.
	 *
	 * @return void
	 */
	public static function request( string $family ): void {
		$family = trim( $family );

		if ( '' === $family || 'inherit' === strtolower( $family ) || ! preg_match( '/^[A-Za-z0-9 \-]+$/', $family ) ) {
			return;
		}

		if ( ! isset( self::$loaded[ $family ] ) ) {
			self::$pending[ $family ] = true;
		}
	}

	/**
	 * Enqueue the fonts requested so far.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function flush(): void {
		if ( is_admin() || ! self::$pending ) {
			return;
		}

		$local  = self::local_stylesheets();
		$google = array();

		foreach ( array_keys( self::$pending ) as $family ) {
			self::$loaded[ $family ] = true;

			if ( isset( $local[ $family ] ) ) {
				wp_enqueue_style( 'spsg-font-' . sanitize_title( $family ), $local[ $family ], array(), STOREGROWTH_VERSION );
				continue;
			}

			$google[] = $family;
		}

		self::$pending = array();

		/**
		 * Filters whether fonts that the plugin doesn't bundle load from
		 * Google Fonts on the storefront.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param bool     $load     Load them (default true, as today).
		 * @param string[] $families Families about to be requested.
		 */
		if ( ! $google || ! apply_filters( 'spsg_load_google_fonts', true, $google ) ) {
			return;
		}

		$url = self::google_url( $google );

		wp_enqueue_style(
			'spsg-fonts-google-' . substr( md5( $url ), 0, 8 ),
			$url,
			array(),
			null // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- Google Fonts versions itself.
		);
	}

	/**
	 * Google Fonts CSS2 URL for families, with the standard weights.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string[] $families Font families.
	 *
	 * @return string
	 */
	public static function google_url( array $families ): string {
		$weights = implode( ';', self::WEIGHTS );
		$query   = array();

		foreach ( $families as $family ) {
			$query[] = 'family=' . str_replace( ' ', '+', $family ) . ':wght@' . $weights;
		}

		return 'https://fonts.googleapis.com/css2?' . implode( '&', $query ) . '&display=swap';
	}

	/**
	 * Families the plugin bundles → their stylesheet URL.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, string>
	 */
	private static function local_stylesheets(): array {
		// Inter joins with its shared files when the first module that uses it
		// migrates (step 2); until then modules keep loading their own copy.
		return array(
			'Merienda' => Helper::get_modules_url( 'countdown-timer/assets/fonts/merienda/stylesheet.css' ),
		);
	}

	/**
	 * Forget requested and loaded fonts (tests).
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public static function reset(): void {
		self::$pending = array();
		self::$loaded  = array();
	}
}
