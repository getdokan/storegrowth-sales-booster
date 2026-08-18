import { AdminNotice, ThemeProvider } from '@wedevs/plugin-ui';

// Brand tokens so plugin-ui matches the rest of the StoreGrowth admin.
const THEME_TOKENS = {
  primary: '#0875ff',
  primaryForeground: '#ffffff',
  radius: '6px',
};

/**
 * Notices served by the WPKit notice feed, rendered with the plugin-ui
 * AdminNotice component.
 *
 * AdminNotice fetches the feed itself and posts an action back to a single
 * endpoint, so the localized `actionUrl` is the WPKit migration upgrade route
 * and every notice action carries an `ajax_data` payload. The upgrade notice is
 * the current producer; providers registered server-side show up here with no
 * change to this component.
 */
const AdminNotices = () => {
  const { noticesUrl, actionUrl } = window.spsgNotices || {};

  if (!noticesUrl) {
    return null;
  }

  return (
    // plugin-ui reads its design tokens from the provider, which scopes them to
    // a `pui-root` wrapper so they never leak into the antd admin UI.
    <ThemeProvider
      pluginId="storegrowth"
      tokens={THEME_TOKENS}
      className="spsg-admin-notices"
    >
      <AdminNotice noticesUrl={noticesUrl} actionUrl={actionUrl} />
    </ThemeProvider>
  );
};

export default AdminNotices;
