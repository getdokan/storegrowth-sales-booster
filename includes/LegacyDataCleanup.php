<?php
/**
 * File for LegacyDataCleanup class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth;

use StorePulse\StoreGrowth\Interfaces\HookRegistry;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Remove options left behind by removed features.
 *
 * `spsg_user_consent_data` was written by the initial setup wizard consent
 * handler. Every consent appended a full request payload, including the
 * administrator email address and the site plugin list, to a single autoloaded
 * option that nothing ever read and that was never sent anywhere. The telemetry
 * it duplicated is collected by the Appsero client, see {@see Tracker}, so the
 * write path is gone and the accumulated value is dropped here.
 *
 * @since SPSG_VERSION
 */
class LegacyDataCleanup implements HookRegistry {

	/**
	 * Options of removed features, deleted on the next admin request.
	 *
	 * @since SPSG_VERSION
	 */
	const DEAD_OPTIONS = array(
		'spsg_user_consent_data',
	);

	/**
	 * Register hooks.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'admin_init', array( $this, 'delete_dead_options' ) );
	}

	/**
	 * Delete the options of removed features.
	 *
	 * Idempotent: once an option is gone `get_option()` is served from the
	 * `notoptions` cache, so repeated runs cost no extra query.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return void
	 */
	public function delete_dead_options(): void {
		foreach ( self::DEAD_OPTIONS as $option ) {
			if ( null === get_option( $option, null ) ) {
				continue;
			}

			delete_option( $option );
		}
	}
}
