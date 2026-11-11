<?php
/**
 * File for UpgradeRESTController class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Migrations;

use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationRESTController;
use Throwable;
use WP_REST_Request;
use WP_REST_Response;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `sales-booster/v1/migration/*` (routes unchanged): a failed upgrade answers
 * with its error as JSON, not a critical error page, so the notice can show it.
 *
 * @since SPSG_VERSION
 */
class UpgradeRESTController extends MigrationRESTController {

	/**
	 * Run the upgrade.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param WP_REST_Request $request Request.
	 *
	 * @return WP_REST_Response
	 */
	public function do_upgrade( WP_REST_Request $request ): WP_REST_Response {
		try {
			return parent::do_upgrade( $request );
		} catch ( Throwable $e ) {
			return new WP_REST_Response(
				[
					'code'    => 'spsg_upgrade_failed',
					'message' => sprintf(
						/* translators: %s: the error of the failed migration. */
						__( 'The database update failed: %s', 'storegrowth-sales-booster' ),
						$e->getMessage()
					),
				],
				500
			);
		}
	}
}
