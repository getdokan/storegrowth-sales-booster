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
        <div className="flex w-full justify-center px-4 pt-6 empty:hidden sm:px-8">
            <div className="w-full max-w-[1280px]">
                <AdminNotice
                    noticesUrl={ noticesUrl }
                    actionUrl={ actionUrl }
                />
            </div>
        </div>
    );
}
