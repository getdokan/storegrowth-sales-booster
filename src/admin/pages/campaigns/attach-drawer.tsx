/**
 * Add offer: attach an existing offer (Use as is / Customise), or create a
 * campaign-only offer in its module's editor (ADR-016).
 *
 * @since SPSG_VERSION
 */
import {
    Badge,
    Button,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    toast,
} from '@wedevs/plugin-ui';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useNavigate } from '@storegrowth/hooks';
import { errorMessage } from '@storegrowth/utilities';

import {
    attachOffer,
    fetchAttachable,
    type AttachableOffer,
    type CampaignDetail,
    type OfferKind,
} from './api';
import { OFFER_LABELS } from './labels';

/** Each kind's editor route. */
const EDITOR_ROUTES: Record< OfferKind, string > = {
    smart_coupon: '/smart-coupons',
    bogo: '/bogo',
    order_bump: '/upsell-order-bump',
};

/** Each kind's new-record route. */
const NEW_ROUTES: Record< OfferKind, string > = {
    smart_coupon: '/smart-coupons/new',
    bogo: '/bogo/create-bogo',
    order_bump: '/upsell-order-bump/create-bump',
};

const KINDS: OfferKind[] = [ 'smart_coupon', 'bogo', 'order_bump' ];

/**
 * @since SPSG_VERSION
 *
 * @param props           Props.
 * @param props.campaign  Campaign.
 * @param props.onClose   Close the drawer.
 * @param props.onChanged The campaign after a change.
 */
export function AttachDrawer( {
    campaign,
    onClose,
    onChanged,
}: {
    campaign: CampaignDetail;
    onClose: () => void;
    onChanged: ( next: CampaignDetail ) => void;
} ) {
    const navigate = useNavigate();
    const [ groups, setGroups ] = useState< Record<
        OfferKind,
        AttachableOffer[]
    > | null >( null );
    const [ chosen, setChosen ] = useState< {
        kind: OfferKind;
        offer: AttachableOffer;
    } | null >( null );

    useEffect( () => {
        fetchAttachable( campaign.id ).then( setGroups );
    }, [ campaign.id ] );

    const attach = async ( customise: boolean ) => {
        if ( ! chosen ) {
            return;
        }

        try {
            const next = await attachOffer(
                campaign.id,
                chosen.kind,
                chosen.offer.id
            );
            const row = next.offers.find( ( offer ) => {
                return (
                    offer.offer_id === chosen.offer.id &&
                    offer.kind === chosen.kind
                );
            } );

            onChanged( next );
            onClose();

            if ( customise && row ) {
                navigate(
                    `${ EDITOR_ROUTES[ chosen.kind ] }/${
                        chosen.offer.id
                    }?campaign=${ campaign.id }&row=${ row.row }`
                );
            }
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The offer could not be attached.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    return (
        <Sheet
            open
            onOpenChange={ ( open: boolean ) => {
                if ( ! open ) {
                    onClose();
                }
            } }
        >
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        { __( 'Add offer', 'storegrowth-sales-booster' ) }
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-5 p-4">
                    { chosen && (
                        <div className="rounded-lg border border-sg-brand p-3">
                            <p className="m-0 text-sm font-semibold text-sg-heading">
                                { chosen.offer.name }
                            </p>
                            <p className="m-0 mb-2 text-xs text-sg-muted">
                                { sprintf(
                                    /* translators: %s: campaign name. */ __(
                                        'How should %s use it?',
                                        'storegrowth-sales-booster'
                                    ),
                                    campaign.name
                                ) }
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    onClick={ () => {
                                        attach( false );
                                    } }
                                >
                                    { __(
                                        'Use as is',
                                        'storegrowth-sales-booster'
                                    ) }
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={ () => {
                                        attach( true );
                                    } }
                                >
                                    { __(
                                        'Customise for this campaign',
                                        'storegrowth-sales-booster'
                                    ) }
                                </Button>
                            </div>
                        </div>
                    ) }
                    <section className="flex flex-wrap gap-2">
                        <span className="w-full text-sm font-semibold text-sg-heading">
                            { __(
                                'Create campaign-only offer',
                                'storegrowth-sales-booster'
                            ) }
                        </span>
                        { KINDS.map( ( kind ) => {
                            return (
                                <Button
                                    key={ kind }
                                    variant="outline"
                                    size="sm"
                                    onClick={ () => {
                                        onClose();
                                        navigate(
                                            `${ NEW_ROUTES[ kind ] }?campaign=${ campaign.id }`
                                        );
                                    } }
                                >
                                    { OFFER_LABELS[ kind ] }
                                </Button>
                            );
                        } ) }
                    </section>
                    { KINDS.map( ( kind ) => {
                        return (
                            <section key={ kind }>
                                <h3 className="m-0 mb-2 text-sm font-semibold text-sg-heading">
                                    { OFFER_LABELS[ kind ] }
                                </h3>
                                <div className="flex flex-col gap-1">
                                    { ! groups?.[ kind ]?.length && (
                                        <p className="m-0 text-sm text-sg-muted">
                                            { __(
                                                'Nothing to attach.',
                                                'storegrowth-sales-booster'
                                            ) }
                                        </p>
                                    ) }
                                    { groups?.[ kind ]?.map( ( offer ) => {
                                        return (
                                            <div
                                                key={ offer.id }
                                                className="flex items-center justify-between gap-2 border-b border-sg-stroke py-1 text-sm"
                                            >
                                                <span className="flex flex-col">
                                                    { offer.name }
                                                    { offer.in && (
                                                        <span className="text-xs text-sg-muted">
                                                            { offer.in }
                                                        </span>
                                                    ) }
                                                </span>
                                                <Button
                                                    size="sm"
                                                    disabled={ offer.disabled }
                                                    title={
                                                        offer.disabled
                                                            ? __(
                                                                  "Campaign dates can't overlap for the same offer.",
                                                                  'storegrowth-sales-booster'
                                                              )
                                                            : undefined
                                                    }
                                                    onClick={ () => {
                                                        setChosen( {
                                                            kind,
                                                            offer,
                                                        } );
                                                    } }
                                                >
                                                    { __(
                                                        'Attach',
                                                        'storegrowth-sales-booster'
                                                    ) }
                                                </Button>
                                            </div>
                                        );
                                    } ) }
                                </div>
                            </section>
                        );
                    } ) }
                    <Badge variant="outline">
                        { __(
                            "Deals created by vendors can't be added to campaigns.",
                            'storegrowth-sales-booster'
                        ) }
                    </Badge>
                </div>
            </SheetContent>
        </Sheet>
    );
}
