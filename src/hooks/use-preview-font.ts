/**
 * Load a Google font into the admin page once, when a live preview first
 * needs it (never enqueued up front).
 *
 * @since SPSG_VERSION
 */
import { useEffect } from '@wordpress/element';

/** Families the admin already has; no request needed. */
const LOCAL_FONTS = [ '', 'inherit', 'Inter' ];

/**
 * @since SPSG_VERSION
 *
 * @param family CSS font family, e.g. `Open Sans`.
 */
export function usePreviewFont( family: string ) {
    useEffect( () => {
        const id = `spsg-preview-font-${ family.replace( /\s+/g, '-' ) }`;

        if (
            LOCAL_FONTS.includes( family ) ||
            ! /^[A-Za-z0-9 -]+$/.test( family ) ||
            document.getElementById( id )
        ) {
            return;
        }

        const link = document.createElement( 'link' );
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${ family.replace(
            / /g,
            '+'
        ) }:wght@400;500;600;700&display=swap`;
        document.head.appendChild( link );
    }, [ family ] );
}
