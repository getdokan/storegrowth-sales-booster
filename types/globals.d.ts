/**
 * Globals the PHP side localizes for the admin app.
 *
 * @since SPSG_VERSION
 */

/** One module as returned by `GET sales-booster/v1/modules` and localized in `spsgAdmin.modules`. */
interface SpsgModule {
    id: string;
    name: string;
    description: string;
    icon: string;
    banner: string;
    category: string;
    status: boolean;
    doc_link: string;
}

interface SpsgAdminData {
    /** Legacy admin-ajax URL, kept for back-compat (ADR-005). */
    ajax_url: string;
    /** Legacy admin-ajax nonce, kept for back-compat (ADR-005). */
    nonce: string;
    isPro: boolean;
    version: string;
    restNamespace: string;
    modules: SpsgModule[];
    urls: {
        admin: string;
        assets: string;
        upgrade: string;
        docs: string;
        support: string;
        whatsNew: string;
        featureRequest: string;
    };
}

/** Header data (PHP filter `spsg_admin_header_info`). */
interface SpsgAdminHeaderInfo {
    lite_version: string;
    is_pro_exists: boolean;
    pro_version: string;
    upgrade_url: string;
    whats_new_url: string;
    support_url: string;
}

interface Window {
    spsgAdmin?: SpsgAdminData;
    spsgAdminHeader?: {
        logo_url: string;
        dashboard_url: string;
        header_info: SpsgAdminHeaderInfo;
    };
    /** WPKit notice feed endpoints. */
    spsgNotices?: {
        noticesUrl?: string;
        actionUrl?: string;
    };
}
