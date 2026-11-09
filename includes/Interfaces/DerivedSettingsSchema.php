<?php
/**
 * A settings schema with keys worked out from others.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Interfaces;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * A module that keeps old keys and new keys in step: a key can be worked out
 * live from the old ones until it is first saved, and a save can change what
 * it writes (for keys another version still reads).
 *
 * @since SPSG_VERSION
 */
interface DerivedSettingsSchema extends SettingsSchema {

	/**
	 * The stored option with the keys worked out live.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $stored Stored option.
	 *
	 * @return array
	 */
	public function with_derived( array $stored ): array;

	/**
	 * Adjust what a save is about to write.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param array $changes Sanitized changes, in stored shape.
	 * @param array $stored  Stored option before the save.
	 *
	 * @return array|WP_Error Changes to write, or why the save is refused.
	 */
	public function before_save( array $changes, array $stored );
}
