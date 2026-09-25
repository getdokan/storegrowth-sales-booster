/**
 * Data PHP localizes for the admin: `spsgAdmin` (app data: REST namespace,
 * modules) and `spsgAdminHeader` (versions, pro flag, URLs), both printed on
 * every StoreGrowth admin page by includes/Assets.php.
 *
 * @since SPSG_VERSION
 */

/**
 * App data (`spsgAdmin`).
 *
 * @since SPSG_VERSION
 */
export function getAdminData(): SpsgAdminData {
    return window.spsgAdmin;
}

/**
 * Header data (`spsgAdminHeader`): versions, pro flag and URLs.
 *
 * @since SPSG_VERSION
 */
export function getHeaderData(): SpsgAdminHeaderData {
    return window.spsgAdminHeader;
}

/**
 * URL of a file in the plugin's `assets/` directory.
 *
 * @since SPSG_VERSION
 *
 * @param path Path relative to `assets/`.
 *
 * @return Absolute URL.
 */
export function assetUrl( path: string ): string {
    return `${ getHeaderData().assets_url }${ path.replace( /^\//, '' ) }`;
}
