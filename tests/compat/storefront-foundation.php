<?php
/**
 * Storefront foundation check (ADR-005, step 1d).
 *
 *     wp eval-file tests/compat/storefront-foundation.php
 *
 * Exercises StorefrontStyle, StorefrontText, DisplayRules, StorefrontFonts,
 * Helper::sanitize_css_keyword() and Helper::get_template(), and checks the
 * base assets are registered but not enqueued. Exits 1 on any failure.
 *
 * @package StorePulse\StoreGrowth
 */

use StorePulse\StoreGrowth\Helper;
use StorePulse\StoreGrowth\Storefront\DisplayRules;
use StorePulse\StoreGrowth\Storefront\StorefrontFonts;
use StorePulse\StoreGrowth\Storefront\StorefrontStyle;
use StorePulse\StoreGrowth\Storefront\StorefrontText;

defined( 'ABSPATH' ) || exit;

// phpcs:ignoreFile -- CLI test script (wp eval-file), prints plain text.

$spsg_failures = 0;

$check = static function ( bool $ok, string $label, $got = null ) use ( &$spsg_failures ) {
	echo ( $ok ? '  ✓ ' : '  ✗ ' ), $label, ( $ok || null === $got ? '' : '  got: ' . var_export( $got, true ) ), "\n";
	if ( ! $ok ) {
		++$spsg_failures;
	}
};

echo "\nStorefrontStyle\n";
$css = StorefrontStyle::render(
	'stock-bar',
	array(
		'bar-bg'      => array( 'value' => '#112233', 'type' => 'color', 'default' => '#e7efff' ),
		'bar-fg'      => array( 'value' => 'red;}body{x', 'type' => 'color', 'default' => '#0875ff' ),
		'legacy'      => array( 'value' => 'rgba(0,0,0,.5)', 'type' => 'color', 'default' => '#000000' ),
		'bar-height'  => array( 'value' => '12', 'type' => 'px', 'default' => 10 ),
		'bad-height'  => array( 'value' => '12px;', 'type' => 'px', 'default' => 10 ),
		'line-height' => array( 'value' => '1.4', 'type' => 'number', 'default' => 1 ),
		'font-family' => array( 'value' => 'Open Sans', 'type' => 'font', 'default' => 'inherit' ),
		'font-bad'    => array( 'value' => "Evil';}", 'type' => 'font', 'default' => 'inherit' ),
		'align'       => array( 'value' => 'CENTER', 'type' => 'keyword', 'allowed' => array( 'left', 'center', 'right' ), 'default' => 'left' ),
		'align-bad'   => array( 'value' => 'expression(x)', 'type' => 'keyword', 'allowed' => array( 'left', 'center' ), 'default' => 'left' ),
		'unknown'     => array( 'value' => 'x', 'type' => 'nope' ),
	)
);
$expected = '.spsg-stock-bar{--spsg-stock-bar-bar-bg:#112233;--spsg-stock-bar-bar-fg:#0875ff;--spsg-stock-bar-legacy:rgba(0,0,0,.5);--spsg-stock-bar-bar-height:12px;--spsg-stock-bar-bad-height:10px;--spsg-stock-bar-line-height:1.4;--spsg-stock-bar-font-family:\'Open Sans\';--spsg-stock-bar-font-bad:inherit;--spsg-stock-bar-align:center;--spsg-stock-bar-align-bad:left;}';
$check( $expected === $css, 'render(): sanitized variables, invalid → default, legacy rgba kept, unknown type skipped', $css );
$check( '' === StorefrontStyle::render( 'x', array() ), 'render(): no tokens → empty string' );

echo "\nHelper::sanitize_css_keyword\n";
$check( 'solid' === Helper::sanitize_css_keyword( ' Solid ', array( 'solid', 'dashed' ) ), 'allowed keyword, normalized' );
$check( 'none' === Helper::sanitize_css_keyword( 'url(x)', array( 'solid' ), 'none' ), 'not allowed → fallback' );

echo "\nStorefrontText\n";
$check( 'Only 5 left, save $3' === StorefrontText::replace( 'Only {quantity} left, save [amount]', array( 'quantity' => 5, 'amount' => '$3' ) ), '{token} and [token] both replaced' );
$html = '<span class="amount">$3</span>';
$check( "Add {$html} more" === StorefrontText::replace( 'Add [amount] more', array( 'amount' => $html ) ), 'HTML value passes through (caller escapes)' );
$check( 'Keep {unknown} and [other]' === StorefrontText::replace( 'Keep {unknown} and [other]', array( 'quantity' => 1 ) ), 'unknown tokens untouched' );
$check( '5 5' === StorefrontText::replace( '{quantity} {quantity}', array( 'quantity' => 5, 'q' => array( 1 ) ) ), 'repeated token, non-scalar value ignored' );

echo "\nDisplayRules\n";
wp_set_current_user( 0 );
$check( true === DisplayRules::should_show( array( 'banner_device_view' => array( 'banner-show-desktop' ) ), 'floating-notification-bar' ), 'guest + device chosen → show' );
$check( false === DisplayRules::should_show( array( 'banner_device_view' => array() ), 'floating-notification-bar' ), 'no device chosen → hide' );
$check( true === DisplayRules::should_show( array(), 'floating-notification-bar', array( 'banner_device_view' => array( 'banner-show-desktop' ) ) ), 'missing key → module default applies' );
$check( false === DisplayRules::should_show( array(), 'floating-notification-bar' ), 'missing key, no default → hide' );
$check( true === DisplayRules::should_show( array( 'banner_device_view' => array( 'x' ), 'banner_show_option' => 'banner-show-specific', 'slected_page_option' => array( 1 ) ), 'floating-notification-bar' ), 'pro page keys are not evaluated in lite' );
$admin = get_users( array( 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ) );
if ( $admin ) {
	wp_set_current_user( (int) $admin[0] );
	$check( false === DisplayRules::should_show( array( 'banner_device_view' => array( 'x' ) ), 'floating-notification-bar' ), 'administrator (not in promotion audience) → hide, as today' );
	wp_set_current_user( 0 );
}
$deny = static function () {
	return false;
};
add_filter( 'spsg_display_rules_should_show', $deny );
$check( false === DisplayRules::should_show( array( 'banner_device_view' => array( 'x' ) ), 'floating-notification-bar' ), 'spsg_display_rules_should_show filter applies' );
remove_filter( 'spsg_display_rules_should_show', $deny );

echo "\nStorefrontFonts\n";
$check( 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Lato:wght@400;500;600;700&display=swap' === StorefrontFonts::google_url( array( 'Open Sans', 'Lato' ) ), 'one Google URL, standard weights' );
StorefrontFonts::reset();
StorefrontFonts::request( 'Merienda' );
StorefrontFonts::request( 'Merienda' );
StorefrontFonts::request( 'Poppins' );
StorefrontFonts::request( 'inherit' );
StorefrontFonts::request( "bad';" );
StorefrontFonts::flush();
$google = array_values( array_filter( wp_styles()->queue, static fn( $h ) => 0 === strpos( $h, 'spsg-fonts-google-' ) ) );
$check( in_array( 'spsg-font-merienda', wp_styles()->queue, true ), 'Merienda loads from the bundled file' );
$check( 1 === count( $google ) && false !== strpos( wp_styles()->registered[ $google[0] ]->src, 'family=Poppins' ) && false === strpos( wp_styles()->registered[ $google[0] ]->src, 'Merienda' ), 'Poppins in one Google request, Merienda not' );
$queued = count( wp_styles()->queue );
StorefrontFonts::request( 'Merienda' );
StorefrontFonts::flush();
$check( count( wp_styles()->queue ) === $queued, 'a family already loaded is not enqueued again' );
add_filter( 'spsg_load_google_fonts', '__return_false' );
StorefrontFonts::request( 'Roboto' );
StorefrontFonts::flush();
remove_filter( 'spsg_load_google_fonts', '__return_false' );
$check( count( wp_styles()->queue ) === $queued, 'spsg_load_google_fonts false → no Google request' );
foreach ( wp_styles()->queue as $handle ) {
	if ( 0 === strpos( $handle, 'spsg-font' ) ) {
		wp_dequeue_style( $handle );
	}
}
StorefrontFonts::reset();

echo "\nHelper::get_template\n";
$dir = trailingslashit( get_temp_dir() ) . 'spsg-tpl-' . wp_generate_password( 6, false );
wp_mkdir_p( $dir );
file_put_contents( "{$dir}/probe.php", '<?php echo "probe:" . $greeting . ":" . ( isset( $this ) ? "this" : "static" );' );
$route = static function ( $path, $template ) use ( $dir ) {
	return 'stock-bar/probe.php' === $template ? "{$dir}/probe.php" : $path;
};
add_filter( 'spsg_template_path', $route, 10, 2 );
ob_start();
Helper::get_template( 'stock-bar/probe.php', array( 'greeting' => 'hi' ) );
$out = ob_get_clean();
remove_filter( 'spsg_template_path', $route, 10 );
$check( 'probe:hi:static' === $out, 'spsg_template_path filter, args extracted, no $this', $out );
ob_start();
Helper::get_template( 'stock-bar/../../wp-config.php' );
Helper::get_template( 'nomodule.php' );
Helper::get_template( 'stock-bar/missing.php' );
$check( '' === ob_get_clean(), 'path traversal, no module, missing file → nothing rendered' );
$seen = null;
$spy  = static function ( $path ) use ( &$seen ) {
	$seen = $path;
	return $path;
};
add_filter( 'spsg_template_path', $spy );
ob_start();
Helper::get_template( 'stock-bar/missing.php' );
ob_end_clean();
remove_filter( 'spsg_template_path', $spy );
$check( Helper::get_modules_path( 'stock-bar/templates/missing.php' ) === $seen, 'falls back to modules/<module>/templates/<file>', $seen );
unlink( "{$dir}/probe.php" );
rmdir( $dir );

echo "\nBase assets\n";
$check( wp_style_is( 'spsg-storefront-base', 'registered' ) && ! wp_style_is( 'spsg-storefront-base', 'enqueued' ), 'spsg-storefront-base registered, not enqueued' );
$check( wp_script_is( 'spsg-storefront-core', 'registered' ) && ! wp_script_is( 'spsg-storefront-core', 'enqueued' ), 'spsg-storefront-core registered, not enqueued' );

echo "\n", $spsg_failures ? "FAILED: {$spsg_failures}\n" : "All passed.\n";

if ( $spsg_failures ) {
	exit( 1 );
}
