/**
 * What the licence means for the Campaigns screens (ADR-016).
 *
 * @since SPSG_VERSION
 */
import { __ } from '@wordpress/i18n';
import { getHeaderData } from '@storegrowth/utilities';

export type CampaignMode = 'pro' | 'expired' | 'free';

/**
 * Free stores preview sample data; expired stores keep their own, read-only.
 */
export function campaignMode(): CampaignMode {
    const info = getHeaderData().header_info;

    if ( info.is_pro_exists ) {
        return 'pro';
    }

    return info.license_state === 'expired' ? 'expired' : 'free';
}

/**
 * The banner for a non-Pro store.
 *
 * @param mode Mode.
 * @param info Header info.
 */
export function licenceAction(
    mode: CampaignMode,
    info: ReturnType< typeof getHeaderData >[ 'header_info' ]
) {
    if ( mode === 'free' ) {
        return {
            text: __(
                'Campaigns is a StoreGrowth Pro feature. This is a preview with sample data.',
                'storegrowth-sales-booster'
            ),
            action: __( 'Upgrade to Pro', 'storegrowth-sales-booster' ),
            url: info.upgrade_url,
        };
    }

    // An expired store has Pro's own notice on every StoreGrowth screen.
    return null;
}
