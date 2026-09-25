/**
 * Frame for every feature (module) page: feature rail on the left, page area
 * capped at 1280px on the right (design `.feature-shell` / `.page-area`).
 * Stacks below 900px.
 *
 * @since SPSG_VERSION
 */
import type { ReactNode } from 'react';

import { FeatureMenu } from './feature-menu';

export interface FeatureLayoutProps {
    /** Id of the module whose page is open. */
    moduleId: string;
    children: ReactNode;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.moduleId Current module id.
 * @param props.children Page content.
 */
export function FeatureLayout( { moduleId, children }: FeatureLayoutProps ) {
    return (
        <div className="flex w-full flex-col min-[901px]:flex-row">
            <FeatureMenu activeId={ moduleId } />
            <div className="mx-auto flex min-w-0 max-w-[min(1280px,100%)] flex-1 flex-col items-center gap-6 p-4 wpsm:p-8 *:w-full">
                { children }
            </div>
        </div>
    );
}
