/**
 * What offer screens show from an offer's timeline (`timeline` in the record
 * routes): the list chip and the editor banner. StoreGrowth sends an empty
 * timeline; an extension (StoreGrowth Pro's campaigns) fills it through the
 * `spsg_offer_timeline` PHP filter, so both draw nothing without one.
 *
 * @since SPSG_VERSION
 */
import { Alert, AlertDescription, Button } from '@wedevs/plugin-ui';
import { useNavigate } from '@storegrowth/hooks';

/** An offer's timeline as the record routes send it. */
export interface OfferTimelineData {
    /** List chip text; empty for none. */
    chip: string;
    /** Chip tooltip. */
    tooltip: string;
    /** Editor banner, or null. `route` is the admin route its button opens. */
    banner: { text: string; button: string; route: string } | null;
}

export interface TimelineChipProps {
    /** Timeline. */
    timeline?: OfferTimelineData;
}

/**
 * An offer's timeline chip, in a record list.
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

export interface OfferBannerProps {
    /** Timeline. */
    timeline?: OfferTimelineData;
}

/**
 * An offer's timeline banner, above its editor.
 *
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.timeline Timeline.
 */
export function OfferBanner( { timeline }: OfferBannerProps ) {
    const navigate = useNavigate();

    if ( ! timeline?.banner ) {
        return null;
    }

    const { text, button, route } = timeline.banner;

    return (
        <Alert>
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                <span>{ text }</span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={ () => {
                        navigate( route );
                    } }
                >
                    { button }
                </Button>
            </AlertDescription>
        </Alert>
    );
}
