/**
 * Notices from the WPKit notice feed (migration upgrade prompt and any other
 * server-side provider), rendered with plugin-ui's AdminNotice. Replaces the
 * legacy standalone `notices` bundle.
 *
 * @since SPSG_VERSION
 */
import { AdminNotice } from '@wedevs/plugin-ui';

export default function AdminNotices() {
    const { noticesUrl, actionUrl } = window.spsgNotices ?? {};

    if ( ! noticesUrl ) {
        return null;
    }

    return (
        // One element, so `empty:hidden` removes the spacing when there is no notice.
        <div className="mx-auto w-full max-w-[1280px] px-4 pt-6 empty:hidden sm:px-8">
            <AdminNotice noticesUrl={ noticesUrl } actionUrl={ actionUrl } />
        </div>
    );
}
