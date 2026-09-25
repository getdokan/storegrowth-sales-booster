/**
 * Globals the PHP side localizes for the admin app (includes/Assets.php).
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

/** App data (`spsgAdmin`, PHP filter `spsg_admin_localized_data`). */
interface SpsgAdminData {
    /** Legacy admin-ajax URL, kept for back-compat (ADR-005). */
    ajax_url: string;
    /** Legacy admin-ajax nonce, kept for back-compat (ADR-005). */
    nonce: string;
    /** Kept for back-compat (ADR-005); use `spsgAdminHeader.header_info.is_pro_exists`. */
    isPro: boolean;
    restNamespace: string;
    modules: SpsgModule[];
}

/** Versions, pro flag and URLs (PHP filter `spsg_admin_header_info`). */
interface SpsgAdminHeaderInfo {
    lite_version: string;
    is_pro_exists: boolean;
    pro_version: string;
    upgrade_url: string;
    whats_new_url: string;
    support_url: string;
    docs_url: string;
    feature_request_url: string;
}

/** Header data (`spsgAdminHeader`). */
interface SpsgAdminHeaderData {
    logo_url: string;
    dashboard_url: string;
    assets_url: string;
    header_info: SpsgAdminHeaderInfo;
}

interface Window {
    spsgAdmin: SpsgAdminData;
    spsgAdminHeader: SpsgAdminHeaderData;
    /** WPKit notice feed endpoints. */
    spsgNotices?: {
        noticesUrl?: string;
        actionUrl?: string;
    };
}
