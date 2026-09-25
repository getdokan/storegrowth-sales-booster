/**
 * Frame for every feature (module) page: feature rail on the left, page area
 * capped at 1280px on the right (design `.feature-shell` / `.page-area`).
 * Stacks below 900px.
 *
 * Admin notices show at the top of the page area here, instead of under the
 * header as on the other pages.
 *
 * @since SPSG_VERSION
 */
import { useLayoutEffect, useRef } from '@wordpress/element';
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
    const noticeSlotRef = useRef< HTMLDivElement >( null );

    // Move the captured notice list into the page area; hand it back to the
    // holder under the header when leaving the feature page.
    useLayoutEffect( () => {
        const slot = noticeSlotRef.current;
        const list = document.getElementById( 'spsg__notice-list' );

        if ( ! slot || ! list ) {
            return;
        }

        const holder = document.getElementById( 'spsg-admin-notices' );
        slot.appendChild( list );

        return () => {
            holder?.appendChild( list );
        };
    }, [] );

    return (
        <div className="flex w-full flex-col min-[901px]:flex-row">
            <FeatureMenu activeId={ moduleId } />
            <div className="mx-auto flex min-w-0 max-w-[min(1280px,100%)] flex-1 flex-col items-center gap-6 p-4 wpsm:p-8 *:w-full">
                { /* Core styling is kept: the scoped reset stops at `.spsg-wp-notices`. */ }
                <div ref={ noticeSlotRef } className="spsg-wp-notices" />
                { children }
            </div>
        </div>
    );
}
