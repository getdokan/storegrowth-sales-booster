/**
 * Data PHP localizes for the admin: `spsgAdmin` (app data: REST namespace,
 * modules) and `spsgAdminHeader` (versions, pro flag, URLs), both printed on
 * every StoreGrowth admin page by includes/Assets.php.
 *
 * @since 3.0.0
 */

/**
 * App data (`spsgAdmin`).
 *
 * @since 3.0.0
 */
export function getAdminData(): SpsgAdminData {
    return window.spsgAdmin;
}

/**
 * Header data (`spsgAdminHeader`): versions, pro flag and URLs.
 *
 * @since 3.0.0
 */
export function getHeaderData(): SpsgAdminHeaderData {
    return window.spsgAdminHeader;
}

/**
 * URL of a file in the plugin's `assets/` directory.
 *
 * @since 3.0.0
 *
 * @param path Path relative to `assets/`.
 *
 * @return Absolute URL.
 */
export function assetUrl( path: string ): string {
    return `${ getHeaderData().assets_url }${ path.replace( /^\//, '' ) }`;
}
