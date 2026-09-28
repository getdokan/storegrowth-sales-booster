<?php
/**
 * Module settings: read, validate and save through a module's schema.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Settings;

use StorePulse\StoreGrowth\Interfaces\GatedSettingsSchema;
use StorePulse\StoreGrowth\Interfaces\SettingsPage;
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
 *   type as string (numbers included, e.g. `'10'`), colours as hex; `box` and
 *   `list` (new in the redesign) as arrays. A `list` stored by the old admin
 *   as a string (e.g. comma-separated names) reads through its `separator`.
 * - **API** values are typed: `toggle` bool, `number` int/float, `box` and
 *   `list` arrays, the rest string.
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
	const FIELD_TYPES = [ 'text', 'textarea', 'number', 'toggle', 'color', 'select', 'box', 'list', 'url', 'date' ];

	/**
	 * Sides of a `box` value (margin/padding), stored and returned as
	 * `{ top, right, bottom, left }` integers.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var string[]
	 */
	const BOX_SIDES = [ 'top', 'right', 'bottom', 'left' ];

	/**
	 * Extension fields already reported (`module.key` → true).
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array<string, bool>
	 */
	private $reported = [];

	/**
	 * Schemas and fields for this request (`get_schemas()`, `get_fields()`
	 * run on storefront requests too, and their labels are translated).
	 * Filled once `init` has run, so extensions registered earlier are in.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var array{schemas?: array<string, SettingsSchema>, fields?: array<string, array>}
	 */
	private $cache = [];

	/**
	 * Every registered schema, keyed by module id.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, SettingsSchema>
	 */
	public function get_schemas(): array {
		if ( isset( $this->cache['schemas'] ) ) {
			return $this->cache['schemas'];
		}

		$container = storegrowth_get_container();
		$schemas   = [];

		if ( $container->has( SettingsSchema::class ) ) {
			foreach ( (array) $container->get( SettingsSchema::class ) as $schema ) {
				if ( $schema instanceof SettingsSchema ) {
					$schemas[ $schema->get_module_id() ] = $schema;
				}
			}
		}

		/**
		 * Filters the registered settings schemas. Pro or another plugin adds
		 * a schema of its own here (a `SettingsSchema`, and `SettingsPage` for
		 * a generated page at `#/settings?module=<id>`): it is read, saved and
		 * drawn by the same engine. The schemas registered by StoreGrowth
		 * can't be replaced or removed.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param SettingsSchema[] $schemas Schemas keyed by id.
		 */
		$added = (array) apply_filters( 'spsg_settings_schemas', $schemas );

		foreach ( $added as $schema ) {
			if ( $schema instanceof SettingsSchema && ! isset( $schemas[ $schema->get_module_id() ] ) ) {
				$schemas[ $schema->get_module_id() ] = $schema;
			}
		}

		if ( did_action( 'init' ) ) {
			$this->cache['schemas'] = $schemas;
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
		if ( isset( $this->cache['fields'][ $module_id ] ) ) {
			return $this->cache['fields'][ $module_id ];
		}

		$schema = $this->get_schema( $module_id );

		if ( ! $schema ) {
			return [];
		}

		$own = $schema->get_fields();

		/**
		 * Filters a module's settings fields. Pro (or an extension) adds fields
		 * here as plain arrays in the SettingsSchema field format, stored in
		 * the module's option. A field with a `tab` is drawn on that tab of
		 * the module's settings page (plugin-ui field renderer; a custom
		 * `variant` renders through the JS filter
		 * `storegrowth_settings_{variant}_field`).
		 *
		 * The module's own fields can't be redefined here, and a field of an
		 * unknown type is dropped (both reported under WP_DEBUG).
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array  $fields    Field definitions keyed by option key.
		 * @param string $module_id Module id.
		 */
		$fields = (array) apply_filters( 'spsg_settings_schema', $own, $module_id );
		$slug   = str_replace( '-', '_', $module_id );

		/**
		 * Filters one module's settings fields, after `spsg_settings_schema`:
		 * `spsg_{module}_settings_schema` with the module id in snake case,
		 * e.g. `spsg_stock_bar_settings_schema`, `spsg_general_settings_schema`.
		 * Same rules: add fields, never redefine the module's own.
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array $fields Field definitions keyed by option key.
		 */
		$fields = (array) apply_filters( "spsg_{$slug}_settings_schema", $fields );

		foreach ( $fields as $key => $field ) {
			if ( isset( $own[ $key ] ) && $field !== $own[ $key ] ) {
				$this->report( $module_id, $key, 'redefines a field of the module; the module\'s definition is kept' );
			} elseif ( ! is_array( $field ) || ! in_array( $field['type'] ?? '', self::FIELD_TYPES, true ) ) {
				$this->report( $module_id, $key, 'has no known type and is ignored' );
				unset( $fields[ $key ] );
			}
		}

		// The module's own definitions win.
		$fields = array_merge( $fields, $own );

		if ( did_action( 'init' ) ) {
			$this->cache['fields'][ $module_id ] = $fields;
		}

		return $fields;
	}

	/**
	 * Report a field an extension added wrongly (once per field, WP_DEBUG).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 * @param string $key       Field key.
	 * @param string $problem   What is wrong.
	 *
	 * @return void
	 */
	private function report( string $module_id, string $key, string $problem ): void {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG || isset( $this->reported[ "{$module_id}.{$key}" ] ) ) {
			return;
		}

		$this->reported[ "{$module_id}.{$key}" ] = true;

		_doing_it_wrong(
			'spsg_settings_schema',
			esc_html( sprintf( 'Settings field "%1$s" of module "%2$s" %3$s.', $key, $module_id, $problem ) ),
			'SPSG_VERSION'
		);
	}

	/**
	 * The settings page a schema defines (`SettingsPage`: title, tabs,
	 * sections), or an empty array when it has none.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module (or page) id.
	 *
	 * @return array<string, mixed>
	 */
	public function get_page( string $module_id ): array {
		$schema = $this->get_schema( $module_id );

		if ( ! $schema instanceof SettingsPage ) {
			return [];
		}

		/**
		 * Filters a settings page: its title, tabs and sections. Pro or
		 * another plugin adds a tab or section here, then puts its fields on
		 * it through `spsg_settings_schema` (`tab` / `section`).
		 *
		 * @since SPSG_VERSION
		 *
		 * @param array  $page      Page (`SettingsPage::get_page()`).
		 * @param string $module_id Module (or page) id.
		 */
		return (array) apply_filters( 'spsg_settings_page', $schema->get_page(), $module_id );
	}

	/**
	 * Every settings page, keyed by id, with its schema and values: what the
	 * admin app draws its settings pages from, in one request.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_pages(): array {
		$pages = [];

		foreach ( $this->get_schemas() as $id => $schema ) {
			if ( $schema instanceof SettingsPage ) {
				$pages[ $id ] = $this->get_page_data( $id );
			}
		}

		return $pages;
	}

	/**
	 * `{ page, schema, values, published }` for one module (or page).
	 * `published` is false while a gated module's settings were never saved
	 * (its storefront output is off until then); `page` is empty for a
	 * schema without a page.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module (or page) id.
	 *
	 * @return array<string, mixed>
	 */
	public function get_page_data( string $module_id ): array {
		return [
			'page'      => (object) $this->get_page( $module_id ),
			'schema'    => (object) $this->get_public_schema( $module_id ),
			'values'    => (object) $this->get_values( $module_id ),
			'published' => $this->is_published( $module_id ),
		];
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
		$public = [];

		foreach ( $this->get_fields( $module_id ) as $key => $field ) {
			$public[ $key ] = array_merge(
				[ 'pro' => false ],
				array_intersect_key( $field, array_flip( [ 'type', 'default', 'pro', 'min', 'max', 'step', 'options', 'item', 'allow_empty', 'tab', 'label', 'help', 'variant', 'labels', 'placeholder', 'prefix', 'suffix', 'priority', 'section', 'pro_ui', 'show_when', 'hidden', 'width', 'pro_options', 'rows', 'max_length', 'name' ] ) )
			);

			$public[ $key ]['default'] = $this->to_api( $field, $field['default'] ?? null );
			$public[ $key ]['pro']     = ! empty( $field['pro'] );

			if ( 'list' === $field['type'] && null !== $this->max_items( $field ) ) {
				$public[ $key ]['max_items'] = $this->max_items( $field );
			}
		}

		return $public;
	}

	/**
	 * Whether a module's storefront output uses its settings: false only
	 * while a gated module (`GatedSettingsSchema`) was never saved.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 * @param mixed  $stored    Stored option (default: read it).
	 *
	 * @return bool
	 */
	public function is_published( string $module_id, $stored = null ): bool {
		$schema = $this->get_schema( $module_id );

		if ( ! $schema instanceof GatedSettingsSchema ) {
			return true;
		}

		return $schema->is_saved( null === $stored ? get_option( $schema->get_option_name(), [] ) : $stored );
	}

	/**
	 * A stored option with every key never saved (or a number that isn't
	 * one) filled from the defaults, for the storefront: saves write only
	 * changed keys. Values stay in the stored shape. A gated module that was
	 * never saved is returned as it is, so its output stays off.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $module_id Module id.
	 * @param mixed  $stored    Stored option.
	 *
	 * @return array
	 */
	public function with_defaults( string $module_id, $stored ): array {
		$stored = is_array( $stored ) ? $stored : [];

		if ( ! $this->is_published( $module_id, $stored ) ) {
			return $stored;
		}

		foreach ( $this->get_fields( $module_id ) as $key => $field ) {
			$value = $stored[ $key ] ?? null;
			$empty = '' === $value && ! empty( $field['allow_empty'] );

			if ( ! array_key_exists( $key, $stored ) || ( 'number' === $field['type'] && ! is_numeric( $value ) && ! $empty ) ) {
				$stored[ $key ] = $field['default'] ?? '';
			}
		}

		return $stored;
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
			return [];
		}

		$stored = $this->get_stored( $schema );
		$values = [];

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
			return new WP_Error( 'spsg_settings_module_not_found', __( 'This module has no settings.', 'storegrowth-sales-booster' ), [ 'status' => 404 ] );
		}

		$raw = $this->is_standalone( $schema ) ? $this->get_stored( $schema ) : get_option( $schema->get_option_name(), [] );

		if ( ! is_array( $raw ) && '' !== $raw && false !== $raw ) {
			return new WP_Error(
				'spsg_settings_unreadable',
				__( 'The stored settings are in an unexpected format, so they were not changed.', 'storegrowth-sales-booster' ),
				[ 'status' => 409 ]
			);
		}

		$stored    = is_array( $raw ) ? $raw : [];
		$has_pro   = sp_store_growth()->has_pro();
		$sanitized = [];
		$errors    = [];

		// The first save of a gated module writes every key: the ones sent
		// even when unchanged (so saving turns its storefront output on) and
		// the defaults of the rest, as the old admin's whole-form save did —
		// pro 2.2.0 reads the raw option.
		$first_save = $schema instanceof GatedSettingsSchema && ! $schema->is_saved( $stored );

		foreach ( $this->get_fields( $module_id ) as $key => $field ) {
			if ( ! array_key_exists( $key, $input ) || ( ! empty( $field['pro'] ) && ! $has_pro ) ) {
				$default = $this->sanitize( $field, $field['default'] ?? '' );

				if ( $first_save && ! array_key_exists( $key, $stored ) && ! is_wp_error( $default ) ) {
					$sanitized[ $key ] = $default;
				}

				continue;
			}

			// Unchanged: the stored value, or the default for a key never saved.
			$current = array_key_exists( $key, $stored ) ? $stored[ $key ] : ( $field['default'] ?? null );

			if ( ! $first_save && $this->is_unchanged( $field, $input[ $key ], $current ) ) {
				continue;
			}

			// A pro-only choice (`pro_options`) without pro is ignored, like a
			// pro key; a stored one stays (it was unchanged above).
			if ( ! $has_pro && in_array( $input[ $key ], (array) ( $field['pro_options'] ?? [] ), true ) ) {
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
				[
					'status' => 400,
					'params' => $errors,
				]
			);
		}

		if ( ! $sanitized ) {
			return $this->get_values( $module_id );
		}

		$old_values = $stored;
		$new_values = array_merge( $old_values, $sanitized );

		if ( $this->is_standalone( $schema ) ) {
			// One option per key, read by the admin (and the uninstaller),
			// never on an ordinary page load: not autoloaded.
			foreach ( $sanitized as $key => $value ) {
				update_option( $key, $value, false );
			}
		} else {
			// Autoload left to WordPress ('auto'): the storefront reads module
			// settings on front-end requests.
			update_option( $schema->get_option_name(), $new_values );
		}

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
		if ( $this->is_standalone( $schema ) ) {
			$stored = [];

			// Only the options that exist, so a key never saved reads as its default.
			foreach ( array_keys( $this->get_fields( $schema->get_module_id() ) ) as $key ) {
				$value = get_option( $key, null );

				if ( null !== $value ) {
					$stored[ $key ] = $value;
				}
			}

			return $stored;
		}

		$stored = get_option( $schema->get_option_name(), [] );

		return is_array( $stored ) ? $stored : [];
	}

	/**
	 * Whether each key of the schema is its own option (no option name).
	 *
	 * @since SPSG_VERSION
	 *
	 * @param SettingsSchema $schema Schema.
	 *
	 * @return bool
	 */
	private function is_standalone( SettingsSchema $schema ): bool {
		return '' === $schema->get_option_name();
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
				// `allow_empty`: the old admin stored '' for "not set".
				if ( '' === $value && ! empty( $field['allow_empty'] ) ) {
					return '';
				}

				if ( ! is_numeric( $value ) ) {
					$value = $field['default'] ?? 0;
				}

				return $this->is_integer_field( $field ) ? (int) $value : (float) $value;

			case 'select':
				$options = (array) ( $field['options'] ?? [] );
				$value   = is_scalar( $value ) ? (string) $value : '';

				return in_array( $value, $options, true ) ? $value : (string) ( $field['default'] ?? '' );

			case 'box':
				return $this->box( $value ) ?? $this->box( $field['default'] ?? [] ) ?? array_fill_keys( self::BOX_SIDES, 0 );

			case 'list':
				return $this->list_items( $field, $value );

			default:
				return is_scalar( $value ) ? (string) $value : '';
		}
	}

	/**
	 * A stored or incoming `list` value as its items: a legacy string is split
	 * on the field's `separator`; items are trimmed, empty ones dropped;
	 * `item: int` keeps positive integers, `options` keeps listed values.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $field Field definition.
	 * @param mixed $value List value.
	 *
	 * @return array<int, int|string>
	 */
	private function list_items( array $field, $value ): array {
		if ( is_string( $value ) && isset( $field['separator'] ) ) {
			$value = explode( $field['separator'], $value );
		}

		$items = [];

		foreach ( is_array( $value ) ? $value : [] as $item ) {
			if ( ! is_scalar( $item ) ) {
				continue;
			}

			if ( 'int' === ( $field['item'] ?? 'text' ) ) {
				$item = filter_var( $item, FILTER_VALIDATE_INT, [ 'options' => [ 'min_range' => 1 ] ] );
			} else {
				$item = trim( sanitize_text_field( (string) $item ) );
				$item = '' === $item || ( isset( $field['options'] ) && ! in_array( $item, (array) $field['options'], true ) ) ? false : $item;
			}

			if ( false !== $item ) {
				$items[] = $item;
			}
		}

		return $items;
	}

	/**
	 * Most items a `list` takes: `lite_max_items` without pro, else `max_items`.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $field Field definition.
	 *
	 * @return int|null
	 */
	private function max_items( array $field ): ?int {
		$max = ! sp_store_growth()->has_pro() && isset( $field['lite_max_items'] ) ? $field['lite_max_items'] : ( $field['max_items'] ?? null );

		return null === $max ? null : (int) $max;
	}

	/**
	 * A `{ top, right, bottom, left }` array of integers, or null when a side
	 * is missing or not a number.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $value Box value.
	 *
	 * @return array<string, int>|null
	 */
	private function box( $value ): ?array {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$box = [];

		foreach ( self::BOX_SIDES as $side ) {
			$number = isset( $value[ $side ] ) && is_scalar( $value[ $side ] ) ? filter_var( $value[ $side ], FILTER_VALIDATE_INT ) : false;

			if ( false === $number ) {
				return null;
			}

			$box[ $side ] = $number;
		}

		return $box;
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
				if ( '' === $value && ! empty( $field['allow_empty'] ) ) {
					return '';
				}

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

				if ( ! in_array( $value, (array) ( $field['options'] ?? [] ), true ) ) {
					return new WP_Error( 'invalid', __( 'Choose one of the listed options.', 'storegrowth-sales-booster' ) );
				}

				return $value;

			case 'box':
				$box = $this->box( $value );

				if ( null === $box || min( $box ) < ( $field['min'] ?? 0 ) ) {
					/* translators: %s: smallest allowed value. */
					return new WP_Error( 'invalid', sprintf( __( 'Enter a whole number of %s or more for each side.', 'storegrowth-sales-booster' ), $field['min'] ?? 0 ) );
				}

				if ( isset( $field['max'] ) && max( $box ) > $field['max'] ) {
					/* translators: %s: largest allowed value. */
					return new WP_Error( 'invalid', sprintf( __( 'Enter %s or less for each side.', 'storegrowth-sales-booster' ), $field['max'] ) );
				}

				// New keys, so no legacy shape: an array of integers.
				return $box;

			case 'list':
				// The old admin's string form (e.g. comma-separated names) is still accepted.
				if ( is_string( $value ) && isset( $field['separator'] ) ) {
					$value = explode( $field['separator'], $value );
				}

				if ( ! is_array( $value ) || array_filter( $value, 'is_array' ) ) {
					return new WP_Error( 'invalid', __( 'Send a list.', 'storegrowth-sales-booster' ) );
				}

				$items = $this->list_items( $field, $value );

				// Every non-empty item must be kept, or it was invalid.
				$sent = array_filter(
					$value,
					static function ( $item ) {
						return is_scalar( $item ) && '' !== trim( (string) $item );
					}
				);

				if ( count( $items ) !== count( $sent ) ) {
					return new WP_Error( 'invalid', __( 'Some items are not valid.', 'storegrowth-sales-booster' ) );
				}

				if ( null !== $this->max_items( $field ) && count( $items ) > $this->max_items( $field ) ) {
					/* translators: %d: most items allowed. */
					return new WP_Error( 'invalid', sprintf( __( 'Choose up to %d.', 'storegrowth-sales-booster' ), $this->max_items( $field ) ) );
				}

				// Stored as an array (the old admin wrote arrays too); `item: int` as integers.
				return $items;

			case 'url':
				$value = is_scalar( $value ) ? trim( (string) $value ) : '';
				$url   = '' === $value ? '' : esc_url_raw( $value );

				// esc_url_raw() empties unsafe schemes (e.g. javascript:).
				if ( '' !== $value && '' === $url ) {
					return new WP_Error( 'invalid', __( 'Enter a web address.', 'storegrowth-sales-booster' ) );
				}

				return $url;

			case 'date':
				$value = is_scalar( $value ) ? trim( (string) $value ) : '';

				if ( '' !== $value && ! $this->is_date( $value ) ) {
					return new WP_Error( 'invalid', __( 'Enter a date as YYYY-MM-DD.', 'storegrowth-sales-booster' ) );
				}

				return $value;

			case 'textarea':
				if ( ! empty( $field['html'] ) ) {
					return is_scalar( $value ) ? wp_kses_post( (string) $value ) : '';
				}

				return is_scalar( $value ) ? sanitize_textarea_field( (string) $value ) : '';

			default:
				// `html`: the storefront prints it with wp_kses_post, so keep that markup.
				if ( ! empty( $field['html'] ) ) {
					return is_scalar( $value ) ? wp_kses_post( trim( (string) $value ) ) : '';
				}

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

			case 'box':
				return $this->box( $input ) === $current;

			case 'list':
				return ( is_array( $input ) || isset( $field['separator'] ) ) && $this->list_items( $field, $input ) === $current;

			default:
				return is_scalar( $input ) && (string) $input === $current;
		}
	}

	/**
	 * Whether a string is a real `Y-m-d` date.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param string $value Date.
	 *
	 * @return bool
	 */
	private function is_date( string $value ): bool {
		return (bool) preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $value, $parts ) && checkdate( (int) $parts[2], (int) $parts[3], (int) $parts[1] );
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
