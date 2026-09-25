/**
 * Feature page for a module whose new settings screen hasn't been built yet.
 * Replaced route by route as each module migrates (it registers its own page
 * through the `storegrowth.admin.routes` filter).
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import { Hammer } from 'lucide-react';
import { CardHead, FeatureLayout } from '@storegrowth/components';
import { useModules } from '@storegrowth/hooks';
import { moduleLabel } from '@storegrowth/utilities';

export default function ModulePendingPage( {
    moduleId,
}: {
    moduleId: string;
} ) {
    const module = useModules().getModule( moduleId );

    if ( ! module ) {
        return null;
    }

    return (
        <FeatureLayout moduleId={ moduleId }>
            <CardHead title={ moduleLabel( module ) } />
            <div className="flex w-full flex-col items-center gap-3 rounded-[8px] border border-sg-cardline bg-white px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sg-brand-soft">
                    <Hammer
                        className="h-6 w-6 text-sg-brand"
                        strokeWidth={ 1.5 }
                        aria-hidden
                    />
                </span>
                <h2 className="text-[16px] font-bold leading-6 text-sg-heading">
                    { __(
                        'These settings are being rebuilt',
                        'storegrowth-sales-booster'
                    ) }
                </h2>
                <p className="max-w-[420px] text-[14px] leading-[1.4] text-sg-muted">
                    { __(
                        'The module keeps working on your store with its saved settings. Its new settings screen arrives in an upcoming update.',
                        'storegrowth-sales-booster'
                    ) }
                </p>
            </div>
        </FeatureLayout>
    );
}
