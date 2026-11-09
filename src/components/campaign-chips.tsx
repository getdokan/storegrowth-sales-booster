/**
 * What offer screens say about campaigns: the timeline chip, the module page
 * banner and the editor's version header (ADR-016).
 *
 * @since SPSG_VERSION
 */
import { Alert, AlertDescription, Button } from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';
import { useNavigate } from '@storegrowth/hooks';

/** What a record route returns for a campaign's offer. */
export interface OfferTimelineData {
    chip: string;
    tooltip: string;
    banner: { campaign_id: number; text: string; button: string } | null;
}

export interface TimelineChipProps {
    timeline?: OfferTimelineData;
}

/**
 * The chip under an offer's status.
 *
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.timeline Timeline.
 */
export function TimelineChip( { timeline }: TimelineChipProps ) {
    if ( ! timeline?.chip ) {
        return null;
    }

    return (
        <span className="text-xs text-sg-help" title={ timeline.tooltip }>
            { timeline.chip }
        </span>
    );
}

export interface CampaignBannerProps {
    timeline?: OfferTimelineData;
}

/**
 * "[Campaign] is controlling [offer] until [end]."
 *
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.timeline Timeline.
 */
export function CampaignBanner( { timeline }: CampaignBannerProps ) {
    const navigate = useNavigate();

    if ( ! timeline?.banner ) {
        return null;
    }

    const { campaign_id: campaignId, text, button } = timeline.banner;

    return (
        <Alert>
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                <span>{ text }</span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={ () => {
                        navigate( `/campaigns/${ campaignId }` );
                    } }
                >
                    { button }
                </Button>
            </AlertDescription>
        </Alert>
    );
}

export interface VersionHeaderProps {
    /** Campaign name when editing a campaign version; empty for everyday. */
    campaign?: string;
    /** The offer lives only inside the campaign. */
    campaignOnly?: boolean;
}

/**
 * The editor's header: what is being edited.
 *
 * @since SPSG_VERSION
 *
 * @param props              Props.
 * @param props.campaign     Campaign name.
 * @param props.campaignOnly Campaign-only offer.
 */
export function VersionHeader( {
    campaign,
    campaignOnly,
}: VersionHeaderProps ) {
    let label: string = __( 'Everyday version', 'storegrowth-sales-booster' );

    if ( campaign && campaignOnly ) {
        label = sprintf(
            /* translators: %s: campaign name. */
            __( 'Campaign-only: %s', 'storegrowth-sales-booster' ),
            campaign
        );
    } else if ( campaign ) {
        label = sprintf(
            /* translators: %s: campaign name. */
            __( '%s version', 'storegrowth-sales-booster' ),
            campaign
        );
    }

    return (
        <span className="inline-flex rounded-[20px] bg-sg-chip px-3 py-1 text-xs font-semibold text-sg-heading">
            { label }
        </span>
    );
}
