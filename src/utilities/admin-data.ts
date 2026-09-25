/**
 * Data localized by PHP for the admin app (`spsgAdmin`).
 *
 * @since SPSG_VERSION
 */
const FALLBACK: SpsgAdminData = {
    ajax_url: '',
    nonce: '',
    isPro: false,
    version: '',
    restNamespace: 'sales-booster/v1',
    modules: [],
    urls: {
        admin: '',
        assets: '',
        upgrade: 'https://storegrowth.io/pricing',
        docs: 'https://storegrowth.io/docs/',
        support: 'https://storegrowth.io/contact-us/',
        whatsNew: 'https://storegrowth.io/changelog/',
        featureRequest: 'https://storegrowth.io/contact-us/',
    },
};

/**
 * The localized admin data, with safe defaults when it is missing.
 *
 * @since SPSG_VERSION
 *
 * @return The admin data.
 */
export function getAdminData(): SpsgAdminData {
    const data = window.spsgAdmin;

    if ( ! data ) {
        return FALLBACK;
    }

    return {
        ...FALLBACK,
        ...data,
        urls: { ...FALLBACK.urls, ...( data.urls || {} ) },
    };
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
    return `${ getAdminData().urls.assets }${ path.replace( /^\//, '' ) }`;
}
