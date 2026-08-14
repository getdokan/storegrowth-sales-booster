<?php
/**
 * File for UpgradeNoticeProvider class.
 *
 * @package SBFW
 */

namespace StorePulse\StoreGrowth\Notices;

use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\AdminNotification\Contracts\NoticeProviderInterface;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\AdminNotification\Notice;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\AdminNotification\NotificationHelper;
use StorePulse\StoreGrowth\ThirdParty\Packages\WeDevs\WPKit\Migration\MigrationManager;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Notice asking the merchant to run the pending database migrations.
 *
 * @since SPSG_VERSION
 */
class UpgradeNoticeProvider implements NoticeProviderInterface {

	/**
	 * Key identifying the notice.
	 *
	 * @since SPSG_VERSION
	 */
	const NOTICE_KEY = 'spsg_database_upgrade_required';

	/**
	 * Migration manager.
	 *
	 * @since SPSG_VERSION
	 *
	 * @var MigrationManager
	 */
	protected MigrationManager $manager;

	/**
	 * Constructor.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param MigrationManager $manager Migration manager.
	 */
	public function __construct( MigrationManager $manager ) {
		$this->manager = $manager;
	}

	/**
	 * Return the upgrade notice while migrations are pending.
	 *
	 * @since SPSG_VERSION
	 *
	 * @return array
	 */
	public function get_notices(): array {
		if ( ! $this->manager->is_upgrade_required() ) {
			return [];
		}

		return [
			new Notice(
				NotificationHelper::warning(
					__( 'StoreGrowth database update required', 'storegrowth-sales-booster' ),
					__( 'This update removes data StoreGrowth no longer uses, including stored administrator email addresses. It runs once and takes a moment.', 'storegrowth-sales-booster' ),
					[
						'key'            => self::NOTICE_KEY,
						'scope'          => 'global',
						'priority'       => 1,
						'is_dismissible' => false,
						'actions'        => [

							/*
							 * The plugin-ui AdminNotice component posts form encoded
							 * `ajax_data` to the endpoint the app is mounted with, which
							 * is the WPKit migration upgrade route. The route takes no
							 * parameters, so the payload only marks the action as one to
							 * post rather than a link to follow.
							 */
							[
								'type'         => 'primary',
								'text'         => __( 'Run the update', 'storegrowth-sales-booster' ),
								'loading_text' => __( 'Updating…', 'storegrowth-sales-booster' ),
								'ajax_data'    => [
									'action' => 'storegrowth_run_migrations',
								],
								'reload'       => true,
							],
						],
					]
				)
			),
		];
	}
}
