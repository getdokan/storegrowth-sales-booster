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
 *   1. GET, then POST every value back unchanged → option byte-identical
 *      (gated modules: a never-saved option's first save stores every key);
 *   2. change one field per type → only that key changes, in legacy shape;
 *   3. pro inactive → pro keys are not written;
 *   4. invalid values → 400, option unchanged;
 *   5. stored option not an array → 409, option unchanged.
 *
 * Exits 1 on the first failed assertion.
 *
 * @package StorePulse\StoreGrowth
 */

use StorePulse\StoreGrowth\Interfaces\GatedSettingsSchema;
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
		$request->set_body_params( [ 'values' => $values ] );
	}
	$response = rest_do_request( $request );

	return [ $response->get_status(), $response->get_data() ];
};

/**
 * Stored value in the old admin's shape (bool for toggles, string otherwise;
 * `box` keys are new and store an array of ints; a `list` with a separator
 * was a joined string, other lists arrays).
 *
 * @param array $field Field definition.
 *
 * @return mixed
 */
$legacy = static function ( array $field ) {
	if ( 'box' === $field['type'] ) {
		return array_map( 'intval', $field['default'] );
	}

	if ( 'list' === $field['type'] ) {
		return isset( $field['separator'] ) ? implode( $field['separator'], $field['default'] ) : $field['default'];
	}

	return 'toggle' === $field['type'] ? (bool) $field['default'] : (string) $field['default'];
};

$service = storegrowth_get_container()->get( SettingsService::class );

foreach ( $service->get_schemas() as $module_id => $schema ) {
	$option = $schema->get_option_name();
	$fields = $service->get_fields( $module_id );

	// Standalone schema: each key is its own option (not autoloaded).
	if ( '' === $option ) {
		echo "\n{$module_id} (standalone options)\n";
		$snapshots = [];
		foreach ( array_keys( $fields ) as $key ) {
			$snapshots[ $key ] = get_option( $key, null );
		}

		try {
			foreach ( $fields as $key => $field ) {
				delete_option( $key );
				[ , $data ] = $call( 'GET', $module_id );
				$call( 'POST', $module_id, (array) $data['values'] );
				$check( null === get_option( $key, null ), "`{$key}` never saved: round trip writes nothing" );

				if ( 'toggle' === $field['type'] ) {
					[ $status ] = $call( 'POST', $module_id, [ $key => ! $field['default'] ] );
					$check(
						200 === $status && ( ! $field['default'] ) === get_option( $key ) && ! array_key_exists( $key, wp_load_alloptions() ),
						"change `{$key}` → stored as " . var_export( ! $field['default'], true ) . ', not autoloaded'
					);
				}
			}
		} finally {
			foreach ( $snapshots as $key => $snapshot ) {
				if ( null === $snapshot ) {
					delete_option( $key );
				} else {
					update_option( $key, $snapshot, false );
				}
				$check( get_option( $key, null ) === $snapshot, "`{$key}` restored" );
			}
		}
		continue;
	}

	$snapshot = get_option( $option, null );

	echo "\n{$module_id} ({$option})\n";

	try {
		// Seed: every field in legacy shape, plus values the schema can't show.
		$seed = [
			'spsg_unknown_key'           => 'keep me',
			'product_page_countdown_enable' => true,
		];
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

		// 1b. Round trip on a sparse option: defaults sent back are not written.
		$sparse = [ 'spsg_unknown_key' => 'keep me' ];
		update_option( $option, $sparse );
		[ , $data ] = $call( 'GET', $module_id );
		$call( 'POST', $module_id, (array) $data['values'] );
		$check( get_option( $option ) === $sparse, 'round trip on a sparse option writes nothing' );

		// 1c. Gated module never saved: the first save writes every key.
		if ( $schema instanceof GatedSettingsSchema ) {
			delete_option( $option );
			[ , $data ] = $call( 'GET', $module_id );
			$check( false === $data['published'], 'never saved → published false' );
			$first = array_slice( (array) $data['values'], 0, 1, true );
			$call( 'POST', $module_id, $first );
			$stored = (array) get_option( $option, [] );
			$check(
				! array_diff_key( $fields, $stored ) && $service->is_published( $module_id ),
				'first save stores every key (' . count( $stored ) . ') and publishes'
			);
		}

		// 2. One change per type is written in legacy shape; nothing else moves.
		$changes = [];
		foreach ( $fields as $key => $field ) {
			if ( ! empty( $field['pro'] ) && ! sp_store_growth()->has_pro() ) {
				continue;
			}
			switch ( $field['type'] ) {
				case 'toggle':
					$changes[ $key ] = [ ! $field['default'], ! $field['default'] ];
					break;
				case 'number':
					// 7, moved inside the field's bounds.
					$n               = min( max( 7, $field['min'] ?? 7 ), $field['max'] ?? PHP_INT_MAX );
					$changes[ $key ] = [ $n, (string) $n ];
					break;
				case 'select':
					// The last option that isn't the default (a seeded unknown value shows as the default).
					$others = array_diff( array_map( 'strval', $field['options'] ), [ (string) $field['default'] ] );
					if ( ! $others ) {
						break; // One option only: nothing to change to.
					}
					$last            = (string) end( $others );
					$changes[ $key ] = [ $last, $last ];
					break;
				case 'box':
					$box             = [ 'top' => 1, 'right' => 2, 'bottom' => 3, 'left' => 4 ];
					$changes[ $key ] = [ $box, $box ];
					break;
				case 'list':
					if ( 'int' === ( $field['item'] ?? '' ) ) {
						$list = [ 7, 8 ];
					} elseif ( isset( $field['options'] ) ) {
						$list = array_slice( $field['options'], 0, 2 );
					} else {
						$list = [ 'First', 'Second' ];
					}
					$changes[ $key ] = [ $list, $list ];
					break;
				case 'color':
					$changes[ $key ] = [ '#123456', '#123456' ];
					break;
				case 'url':
					$changes[ $key ] = [ 'https://example.com/path', 'https://example.com/path' ];
					break;
				case 'date':
					$changes[ $key ] = [ '2026-10-27', '2026-10-27' ];
					break;
				case 'text':
				case 'textarea':
					$changes[ $key ] = [ 'Changed text', 'Changed text' ];
					break;
			}
		}
		foreach ( $changes as $key => [ $api, $stored ] ) {
			update_option( $option, $seed );
			$call( 'POST', $module_id, [ $key => $api ] );
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
			$call( 'POST', $module_id, [ $pro_key => 'Pro value' ] );
			remove_filter( 'storegrowth_pro_is_active', '__return_false', 999 );
			$check( get_option( $option ) === $seed, "pro key `{$pro_key}` ignored without pro" );
		}

		// 4. Invalid values: 400 and nothing written.
		$invalid = [];
		foreach ( $fields as $key => $field ) {
			if ( 'color' === $field['type'] ) {
				$invalid[ $key ] = 'not-a-colour';
			} elseif ( 'url' === $field['type'] ) {
				$invalid[ $key ] = 'javascript:alert(1)';
			} elseif ( 'date' === $field['type'] ) {
				$invalid[ $key ] = '2026-02-30';
			}
		}
		if ( $invalid ) {
			update_option( $option, $seed );
			[ $status ] = $call( 'POST', $module_id, $invalid );
			$check( 400 === $status && get_option( $option ) === $seed, 'invalid values → 400, option unchanged' );
		}

		// 5. Unexpected stored format: 409 and nothing written.
		update_option( $option, 'legacy string value' );
		[ $status ] = $call( 'POST', $module_id, [ array_key_first( $fields ) => 'x' ] );
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
