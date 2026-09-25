<?php
/**
 * Module settings: read, validate and save through a module's schema.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Settings;

use StorePulse\StoreGrowth\Interfaces\SettingsSchema;
use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * One service for every module's settings, shared by the REST controller and
 * the legacy ajax handlers (which become adapters over it).
 *
 * Value shapes (docs/redesign/migration-spec.md §8):
 * - **Stored** exactly as the old admin stored them, so the storefront, pro
 *   and third parties read the same values: `toggle` as bool, every other
 *   type as string (numbers included, e.g. `'10'`), colours as hex.
 * - **API** values are typed: `toggle` bool, `number` int/float, the rest
 *   string.
 *
 * Saving merges into the stored option: keys outside the schema are kept.
 * Pro fields are saved only while pro is active; otherwise they're ignored and
 * their stored values stay.
 *
 * @since SPSG_VERSION
 */
class SettingsService {

	/**
	 * Field types the service knows.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const FIELD_TYPES = array( 'text', 'textarea', 'number', 'toggle', 'color', 'select' );

	/**
	 * Every registered schema, keyed by module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, SettingsSchema>
	 */
	public function get_schemas(): array {
		$container = storegrowth_get_container();

		if ( ! $container->has( SettingsSchema::class ) ) {
			return array();
		}

		$schemas = array();

		foreach ( (array) $container->get( SettingsSchema::class ) as $schema ) {
			if ( $schema instanceof SettingsSchema ) {
				$schemas[ $schema->get_module_id() ] = $schema;
			}
		}

		return $schemas;
	}

	/**
	 * The schema for one module.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 *
	 * @return SettingsSchema|null
	 */
	public function get_schema( string $module_id ): ?SettingsSchema {
		return $this->get_schemas()[ $module_id ] ?? null;
	}

	/**
	 * Field definitions for a module, after extensions.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_fields( string $module_id ): array {
		$schema = $this->get_schema( $module_id );

		if ( ! $schema ) {
			return array();
		}

		/**
		 * Filters a module's settings fields. Pro (or an extension) can add
		 * fields here; each must follow the SettingsSchema field format and
		 * use a key stored in the module's option.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array  $fields    Field definitions keyed by option key.
		 * @param string $module_id Module id.
		 */
		$fields = (array) apply_filters( 'spsg_settings_schema', $schema->get_fields(), $module_id );

		return array_filter(
			$fields,
			static function ( $field ) {
				return is_array( $field ) && in_array( $field['type'] ?? '', self::FIELD_TYPES, true );
			}
		);
	}

	/**
	 * Schema as the admin app consumes it: type, default, tier and limits per
	 * key.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_public_schema( string $module_id ): array {
		$public = array();

		foreach ( $this->get_fields( $module_id ) as $key => $field ) {
			$public[ $key ] = array_merge(
				array( 'pro' => false ),
				array_intersect_key( $field, array_flip( array( 'type', 'default', 'pro', 'min', 'max', 'step', 'options' ) ) )
			);

			$public[ $key ]['default'] = $this->to_api( $field, $field['default'] ?? null );
			$public[ $key ]['pro']     = ! empty( $field['pro'] );
		}

		return $public;
	}

	/**
	 * Current values for every schema key, stored value or default, in API
	 * shape.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 *
	 * @return array<string, mixed>
	 */
	public function get_values( string $module_id ): array {
		$schema = $this->get_schema( $module_id );

		if ( ! $schema ) {
			return array();
		}

		$stored = $this->get_stored( $schema );
		$values = array();

		foreach ( $this->get_fields( $module_id ) as $key => $field ) {
			$values[ $key ] = array_key_exists( $key, $stored )
				? $this->to_api( $field, $stored[ $key ] )
				: $this->to_api( $field, $field['default'] ?? null );
		}

		return $values;
	}

	/**
	 * Validate and save values for a module.
	 *
	 * Existing settings are never lost:
	 * - only keys in the request are written; every other stored key (outside
	 *   the schema, or not sent) stays exactly as it is;
	 * - pro keys are ignored while pro is inactive;
	 * - a key sent with the value `get_values()` reports for it is left alone,
	 *   so a stored value the schema can't show (e.g. `"10.5"` in a whole-number
	 *   field, or a value pro added) survives a save of the whole form, and a
	 *   key never saved isn't written just because its default was sent back;
	 * - nothing is saved when any value is invalid, or when the stored option
	 *   isn't an array (it would be overwritten).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 * @param array  $input     Values keyed by option key, in API shape.
	 *
	 * @return array<string, mixed>|WP_Error Saved values (as `get_values()`), or the validation errors.
	 */
	public function save( string $module_id, array $input ) {
		$schema = $this->get_schema( $module_id );

		if ( ! $schema ) {
			return new WP_Error( 'spsg_settings_module_not_found', __( 'This module has no settings.', 'storegrowth-sales-booster' ), array( 'status' => 404 ) );
		}

		$raw = get_option( $schema->get_option_name(), array() );

		if ( ! is_array( $raw ) && '' !== $raw && false !== $raw ) {
			return new WP_Error(
				'spsg_settings_unreadable',
				__( 'The stored settings are in an unexpected format, so they were not changed.', 'storegrowth-sales-booster' ),
				array( 'status' => 409 )
			);
		}

		$stored    = is_array( $raw ) ? $raw : array();
		$has_pro   = sp_store_growth()->has_pro();
		$sanitized = array();
		$errors    = array();

		foreach ( $this->get_fields( $module_id ) as $key => $field ) {
			if ( ! array_key_exists( $key, $input ) || ( ! empty( $field['pro'] ) && ! $has_pro ) ) {
				continue;
			}

			// Unchanged: the stored value, or the default for a key never saved.
			$current = array_key_exists( $key, $stored ) ? $stored[ $key ] : ( $field['default'] ?? null );

			if ( $this->is_unchanged( $field, $input[ $key ], $current ) ) {
				continue;
			}

			$value = $this->sanitize( $field, $input[ $key ] );

			if ( is_wp_error( $value ) ) {
				$errors[ $key ] = $value->get_error_message();
				continue;
			}

			$sanitized[ $key ] = $value;
		}

		if ( $errors ) {
			return new WP_Error(
				'spsg_settings_invalid',
				__( 'Some settings are not valid.', 'storegrowth-sales-booster' ),
				array(
					'status' => 400,
					'params' => $errors,
				)
			);
		}

		if ( ! $sanitized ) {
			return $this->get_values( $module_id );
		}

		$old_values = $stored;
		$new_values = array_merge( $old_values, $sanitized );

		// Autoload left to WordPress ('auto'): the storefront reads module
		// settings on front-end requests.
		update_option( $schema->get_option_name(), $new_values );

		/**
		 * Fires after a module's settings are saved through the settings
		 * service (REST or a legacy ajax adapter).
		 *
		 * @since SPSG_VERSION
		 *
		 * @param string $module_id  Module id.
		 * @param array  $new_values Stored option after the save.
		 * @param array  $old_values Stored option before the save.
		 */
		do_action( 'spsg_settings_saved', $module_id, $new_values, $old_values );

		return $this->get_values( $module_id );
	}

	/**
	 * The stored option as an array.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param SettingsSchema $schema Module schema.
	 *
	 * @return array
	 */
	private function get_stored( SettingsSchema $schema ): array {
		$stored = get_option( $schema->get_option_name(), array() );

		return is_array( $stored ) ? $stored : array();
	}

	/**
	 * Convert a stored (or default) value to its API shape.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $field Field definition.
	 * @param mixed $value Stored value.
	 *
	 * @return mixed
	 */
	private function to_api( array $field, $value ) {
		switch ( $field['type'] ) {
			case 'toggle':
				return rest_sanitize_boolean( $value );

			case 'number':
				if ( ! is_numeric( $value ) ) {
					$value = $field['default'] ?? 0;
				}

				return $this->is_integer_field( $field ) ? (int) $value : (float) $value;

			case 'select':
				$options = (array) ( $field['options'] ?? array() );
				$value   = is_scalar( $value ) ? (string) $value : '';

				return in_array( $value, $options, true ) ? $value : (string) ( $field['default'] ?? '' );

			default:
				return is_scalar( $value ) ? (string) $value : '';
		}
	}

	/**
	 * Validate one incoming value and convert it to its stored shape.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $field Field definition.
	 * @param mixed $value Incoming value (API shape).
	 *
	 * @return mixed|WP_Error
	 */
	private function sanitize( array $field, $value ) {
		switch ( $field['type'] ) {
			case 'toggle':
				return rest_sanitize_boolean( $value );

			case 'number':
				if ( ! is_numeric( $value ) ) {
					return new WP_Error( 'invalid', __( 'Enter a number.', 'storegrowth-sales-booster' ) );
				}

				$number = $this->is_integer_field( $field ) ? (int) $value : (float) $value;

				if ( isset( $field['min'] ) && $number < $field['min'] ) {
					/* translators: %s: smallest allowed value. */
					return new WP_Error( 'invalid', sprintf( __( 'Enter %s or more.', 'storegrowth-sales-booster' ), $field['min'] ) );
				}

				if ( isset( $field['max'] ) && $number > $field['max'] ) {
					/* translators: %s: largest allowed value. */
					return new WP_Error( 'invalid', sprintf( __( 'Enter %s or less.', 'storegrowth-sales-booster' ), $field['max'] ) );
				}

				// Stored as a string, as the old admin stored it.
				return (string) $number;

			case 'color':
				$color = is_string( $value ) ? sanitize_hex_color( $value ) : null;

				if ( ! $color ) {
					return new WP_Error( 'invalid', __( 'Enter a hex colour, e.g. #0875FF.', 'storegrowth-sales-booster' ) );
				}

				return $color;

			case 'select':
				$value = is_scalar( $value ) ? (string) $value : '';

				if ( ! in_array( $value, (array) ( $field['options'] ?? array() ), true ) ) {
					return new WP_Error( 'invalid', __( 'Choose one of the listed options.', 'storegrowth-sales-booster' ) );
				}

				return $value;

			case 'textarea':
				return is_scalar( $value ) ? sanitize_textarea_field( (string) $value ) : '';

			default:
				return is_scalar( $value ) ? sanitize_text_field( (string) $value ) : '';
		}
	}

	/**
	 * Whether an incoming value is what `get_values()` reports for the stored
	 * one, i.e. the admin didn't change it. Compared without falling back to
	 * defaults, so an invalid value is never taken for "unchanged".
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $field  Field definition.
	 * @param mixed $input  Incoming value (API shape).
	 * @param mixed $stored Stored value.
	 *
	 * @return bool
	 */
	private function is_unchanged( array $field, $input, $stored ): bool {
		// Sent back exactly as stored (e.g. a legacy `''` in a number field).
		if ( is_scalar( $input ) && is_scalar( $stored ) && (string) $input === (string) $stored ) {
			return true;
		}

		$current = $this->to_api( $field, $stored );

		switch ( $field['type'] ) {
			case 'toggle':
				return is_scalar( $input ) && rest_sanitize_boolean( $input ) === $current;

			case 'number':
				return is_numeric( $input ) && (float) $input === (float) $current;

			default:
				return is_scalar( $input ) && (string) $input === $current;
		}
	}

	/**
	 * Whether a number field holds integers (no step, or a whole-number step).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $field Field definition.
	 *
	 * @return bool
	 */
	private function is_integer_field( array $field ): bool {
		$step = $field['step'] ?? 1;

		return (float) (int) $step === (float) $step;
	}
}
