<?php
/**
 * Settings schema whose storefront stays off until the first save.
 *
 * @package StorePulse\StoreGrowth
 */

namespace StorePulse\StoreGrowth\Interfaces;

defined( 'ABSPATH' ) || exit;

/**
 * A module whose storefront output stays off until its settings are first
 * saved (the old admin's behaviour for the two bars). The settings service
 * writes every key sent on that first save, even the ones equal to their
 * defaults, so saving the page unchanged turns the output on.
 *
 * @since SPSG_VERSION
 */
interface GatedSettingsSchema extends SettingsSchema {

	/**
	 * Whether the stored option was ever saved from the admin.
	 *
	 * @since SPSG_VERSION
	 *
	 * @param mixed $stored Stored option.
	 *
	 * @return bool
	 */
	public function is_saved( $stored ): bool;
}
