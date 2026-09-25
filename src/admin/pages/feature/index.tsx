/**
 * Feature page frame for a module (design: feature rail + title card).
 *
 * Serves `/:moduleId` until the module registers its own page through the
 * `storegrowth.admin.routes` filter; react-router then prefers the module's
 * exact path over this one.
 *
 * @since SPSG_VERSION
 */
import { CardHead, FeatureLayout } from '@storegrowth/components';
import { Navigate, useModules, useParams } from '@storegrowth/hooks';
import { moduleLabel } from '@storegrowth/utilities';

export default function FeaturePage() {
    const { moduleId = '' } = useParams();
    const module = useModules().getModule( moduleId );

    // Not a module (e.g. an old or mistyped hash): go to the dashboard.
    if ( ! module ) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <FeatureLayout moduleId={ module.id }>
            <CardHead title={ moduleLabel( module ) } />
        </FeatureLayout>
    );
}
