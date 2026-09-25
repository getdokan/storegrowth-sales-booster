<?php
/**
 * Settings round-trip check: saving through the new settings REST route never
 * loses or alters existing user settings.
 *
 * Run against a dev site (it restores every option it touches):
 *
 *     wp eval-file tests/compat/settings-roundtrip.php
 *
 * For every registered settings schema it seeds the option in the shape the
 * old admin stored (plus keys and values the schema doesn't know), then:
 *   1. GET, then POST every value back unchanged → option byte-identical;
 *   2. change one field per type → only that key changes, in legacy shape;
 *   3. pro inactive → pro keys are not written;
 *   4. invalid values → 400, option unchanged;
 *   5. stored option not an array → 409, option unchanged.
 *
 * Exits 1 on the first failed assertion.
 *
 * @package StorePulse\StoreGrowth
 */

use StorePulse\StoreGrowth\Settings\SettingsService;

defined( 'ABSPATH' ) || exit;

// phpcs:ignoreFile -- CLI test script (wp eval-file), prints plain text.

wp_set_current_user( 1 );

$spsg_failures = 0;

/**
 * Record one assertion.
 *
 * @param bool   $ok    Passed.
 * @param string $label What was checked.
 */
$check = static function ( bool $ok, string $label ) use ( &$spsg_failures ) {
	echo ( $ok ? '  ✓ ' : '  ✗ ' ), $label, "\n";
	if ( ! $ok ) {
		++$spsg_failures;
	}
};

/**
 * Call the settings route.
 *
 * @param string     $method HTTP method.
 * @param string     $module Module id.
 * @param array|null $values Values to POST.
 *
 * @return array{0:int,1:mixed}
 */
$call = static function ( string $method, string $module, ?array $values = null ) {
	$request = new WP_REST_Request( $method, '/sales-booster/v1/settings/' . $module );
	if ( null !== $values ) {
		$request->set_body_params( array( 'values' => $values ) );
	}
	$response = rest_do_request( $request );

	return array( $response->get_status(), $response->get_data() );
};

/**
 * Stored value in the old admin's shape (bool for toggles, string otherwise).
 *
 * @param array $field Field definition.
 *
 * @return mixed
 */
$legacy = static function ( array $field ) {
	return 'toggle' === $field['type'] ? (bool) $field['default'] : (string) $field['default'];
};

$service = storegrowth_get_container()->get( SettingsService::class );

foreach ( $service->get_schemas() as $module_id => $schema ) {
	$option   = $schema->get_option_name();
	$snapshot = get_option( $option, null );
	$fields   = $service->get_fields( $module_id );

	echo "\n{$module_id} ({$option})\n";

	try {
		// Seed: every field in legacy shape, plus values the schema can't show.
		$seed = array(
			'spsg_unknown_key'           => 'keep me',
			'product_page_countdown_enable' => true,
		);
		foreach ( $fields as $key => $field ) {
			$seed[ $key ] = $legacy( $field );
		}
		foreach ( $fields as $key => $field ) {
			if ( 'number' === $field['type'] ) {
				$seed[ $key ] = '10.5'; // Not a whole number: shown as 10.
				break;
			}
		}
		foreach ( $fields as $key => $field ) {
			if ( 'select' === $field['type'] ) {
				$seed[ $key ] = 'value_added_later'; // Not in options: shown as the default.
				break;
			}
		}
		foreach ( $fields as $key => $field ) {
			if ( 'color' === $field['type'] ) {
				$seed[ $key ] = 'rgba(0,0,0,.5)'; // Not hex: shown as-is.
				break;
			}
		}
		update_option( $option, $seed );

		// 1. Round trip.
		[ $status, $data ] = $call( 'GET', $module_id );
		$check( 200 === $status, 'GET 200' );
		[ $status ] = $call( 'POST', $module_id, (array) $data['values'] );
		$check( 200 === $status, 'POST unchanged values 200' );
		$check( get_option( $option ) === $seed, 'round trip leaves the option byte-identical' );

		// 2. One change per type is written in legacy shape; nothing else moves.
		$changes = array();
		foreach ( $fields as $key => $field ) {
			if ( ! empty( $field['pro'] ) && ! sp_store_growth()->has_pro() ) {
				continue;
			}
			switch ( $field['type'] ) {
				case 'toggle':
					$changes[ $key ] = array( ! $field['default'], ! $field['default'] );
					break;
				case 'number':
					$changes[ $key ] = array( 7, '7' );
					break;
				case 'color':
					$changes[ $key ] = array( '#123456', '#123456' );
					break;
				case 'text':
				case 'textarea':
					$changes[ $key ] = array( 'Changed text', 'Changed text' );
					break;
			}
		}
		foreach ( $changes as $key => [ $api, $stored ] ) {
			update_option( $option, $seed );
			$call( 'POST', $module_id, array( $key => $api ) );
			$expected         = $seed;
			$expected[ $key ] = $stored;
			$check( get_option( $option ) === $expected, "change {$fields[ $key ]['type']} `{$key}` → only it changes, stored as " . var_export( $stored, true ) );
		}

		// 3. Pro keys are not written while pro is inactive.
		$pro_key = null;
		foreach ( $fields as $key => $field ) {
			if ( ! empty( $field['pro'] ) && 'text' === $field['type'] ) {
				$pro_key = $key;
				break;
			}
		}
		if ( $pro_key ) {
			update_option( $option, $seed );
			add_filter( 'storegrowth_pro_is_active', '__return_false', 999 );
			$call( 'POST', $module_id, array( $pro_key => 'Pro value' ) );
			remove_filter( 'storegrowth_pro_is_active', '__return_false', 999 );
			$check( get_option( $option ) === $seed, "pro key `{$pro_key}` ignored without pro" );
		}

		// 4. Invalid values: 400 and nothing written.
		$invalid = array();
		foreach ( $fields as $key => $field ) {
			if ( 'color' === $field['type'] ) {
				$invalid[ $key ] = 'not-a-colour';
			}
		}
		if ( $invalid ) {
			update_option( $option, $seed );
			[ $status ] = $call( 'POST', $module_id, $invalid );
			$check( 400 === $status && get_option( $option ) === $seed, 'invalid values → 400, option unchanged' );
		}

		// 5. Unexpected stored format: 409 and nothing written.
		update_option( $option, 'legacy string value' );
		[ $status ] = $call( 'POST', $module_id, array( array_key_first( $fields ) => 'x' ) );
		$check( 409 === $status && 'legacy string value' === get_option( $option ), 'non-array option → 409, option unchanged' );
	} finally {
		if ( null === $snapshot ) {
			delete_option( $option );
		} else {
			update_option( $option, $snapshot );
		}
		$check( get_option( $option, null ) === $snapshot, 'option restored' );
	}
}

echo "\n", $spsg_failures ? "FAILED: {$spsg_failures}\n" : "All passed.\n";

if ( $spsg_failures ) {
	exit( 1 );
}
