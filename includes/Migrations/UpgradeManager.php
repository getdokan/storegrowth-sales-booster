<?php
/**
 * File for UpgradeManager class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationManager;
use Throwable;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The migration runner, recoverable after a failure.
 *
 * WP Kit's manager keeps its "upgrading" flag when a migration throws, so
 * every later run answers "already in progress" and the update can never be
 * retried. Here a failed run clears the flag, and a flag left by a run that
 * died without throwing (a fatal error, a timeout) is ignored once its log
 * shows the run failed or stopped long ago. The migrations finished before
 * the failure have stamped their version, so a retry runs only what is left.
 *
 * @since SPSG_VERSION
 */
class UpgradeManager extends MigrationManager {

	/**
	 * Seconds after which a migration still logged as running is taken as dead.
	 *
	 * @since SPSG_VERSION
	 */
	const STALE_AFTER = 10 * MINUTE_IN_SECONDS;

	/**
	 * Whether an upgrade is running now. A flag a dead run left is not one.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	public function has_ongoing_process(): bool {
		if ( ! parent::has_ongoing_process() ) {
			return false;
		}

		if ( ! $this->is_stale() ) {
			return true;
		}

		delete_option( $this->upgrading_option_key );

		return false;
	}

	/**
	 * Run the pending migrations. On failure the flag is cleared, so the
	 * update can be run again, and the error goes on to the caller.
	 *
	 * @since SPSG_VERSION
	 *
	 * @throws Throwable The migration's error.
	 *
	 * @return void
	 */
	public function do_upgrade(): void {
		try {
			parent::do_upgrade();
		} catch ( Throwable $e ) {
			delete_option( $this->upgrading_option_key );

			throw $e;
		}
	}

	/**
	 * The error of the last failed migration, if the last run failed.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return string
	 */
	public function last_error(): string {
		foreach ( (array) get_option( $this->get_log_option_key(), [] ) as $entry ) {
			if ( 'failed' === ( $entry['status'] ?? '' ) ) {
				return (string) ( $entry['error'] ?? '' );
			}
		}

		return '';
	}

	/**
	 * Whether the flag belongs to a run that ended without clearing it: its
	 * log has a failed migration, or one logged as running for too long.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return bool
	 */
	private function is_stale(): bool {
		foreach ( (array) get_option( $this->get_log_option_key(), [] ) as $entry ) {
			$status = $entry['status'] ?? '';

			if ( 'failed' === $status ) {
				return true;
			}

			if ( 'running' === $status && time() - (int) ( $entry['started_at'] ?? 0 ) > self::STALE_AFTER ) {
				return true;
			}
		}

		return false;
	}
}
