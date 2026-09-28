/**
 * Every settings page the backend defines (`sales-booster/v1/admin/settings`),
 * fetched once and shared.
 *
 * @since SPSG_VERSION
 */
import { useEffect, useState } from '@wordpress/element';
import {
    fetchSettingsPages,
    type SettingsPagesResponse,
} from '@storegrowth/utilities';

export interface SettingsPages {
    /** Pages keyed by id (a module id, or `general`); empty while loading. */
    pages: SettingsPagesResponse;
    loading: boolean;
}

/**
 * @since SPSG_VERSION
 */
export function useSettingsPages(): SettingsPages {
    const [ pages, setPages ] = useState< SettingsPagesResponse >( {} );
    const [ loading, setLoading ] = useState( true );

    useEffect( () => {
        let cancelled = false;

        fetchSettingsPages()
            .then( ( response ) => {
                if ( ! cancelled ) {
                    setPages( response );
                }
            } )
            .catch( () => {
                // No pages: every module keeps its own route.
            } )
            .finally( () => {
                if ( ! cancelled ) {
                    setLoading( false );
                }
            } );

        return () => {
            cancelled = true;
        };
    }, [] );

    return { pages, loading };
}
