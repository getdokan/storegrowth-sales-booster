import { createRoot, StrictMode } from "@wordpress/element";

import AdminNotices from "./components/notices/AdminNotices";

// TODO: It will merge with in future with base tailwind styles and will be removed from here. For now, it is required to make the plugin-ui work.
import "@wedevs/plugin-ui/styles.css";

/**
 * Standalone app for the WPKit notice feed.
 *
 * It mounts above the StoreGrowth admin container in its own root, so the
 * plugin-ui bundle and its styles stay out of the settings and modules apps.
 */
const container = document.getElementById("spsg-admin-notices");

if (container) {
  createRoot(container).render(
    <StrictMode>
      <AdminNotices />
    </StrictMode>
  );
}
