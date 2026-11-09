/**
 * Which campaign version a record editor is editing, from `?campaign=<id>`
 * (and `&row=<row>`, `&only=1` for a campaign-only offer). The editor then
 * loads and saves through the campaign's record routes (ADR-016).
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { getAdminData } from '@storegrowth/utilities';

import { useSearchParams } from './router';

/** The campaign version an editor is on. */
export interface CampaignVersion {
    /** Campaign id; 0 when editing the everyday version. */
    campaignId: number;
    /** Offer row; 0 for a new campaign-only offer. */
    row: number;
    /** Campaign name, once loaded. */
    name: string;
    /** The record lives only inside the campaign. */
    only: boolean;
    /** The records route to use, or null for the module's own. */
    route: string | null;
}

/**
 * @since SPSG_VERSION
 *
 * @param kind Offer kind: `bogo`, `order_bump` or `smart_coupon`.
 */
export function useCampaignVersion( kind: string ): CampaignVersion {
    const [ searchParams ] = useSearchParams();
    const campaignId = Number( searchParams.get( 'campaign' ) ) || 0;
    const row = Number( searchParams.get( 'row' ) ) || 0;
    const only =
        searchParams.get( 'only' ) === '1' || ( campaignId > 0 && ! row );
    const [ name, setName ] = useState( '' );
    const namespace = getAdminData().restNamespace;

    useEffect( () => {
        if ( campaignId ) {
            apiFetch< { name: string } >( {
                path: `/${ namespace }/campaigns/${ campaignId }`,
            } ).then( ( campaign ) => {
                setName( campaign.name );
            } );
        }
    }, [ campaignId, namespace ] );

    return {
        campaignId,
        row,
        name,
        only,
        route: campaignId
            ? `/${ namespace }/campaigns/${ campaignId }/records/${ kind }`
            : null,
    };
}
