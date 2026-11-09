/**
 * The Free limit notice with its "Choose offers" picker, over the
 * `sales-booster/v1/offer-limits` routes (ADR-013, #304).
 *
 * @since SPSG_VERSION
 */
import apiFetch from '@wordpress/api-fetch';
import {
    Alert,
    AlertDescription,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Label,
    toast,
} from '@wedevs/plugin-ui';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { errorMessage, getAdminData } from '@storegrowth/utilities';

interface LimitOffer {
    id: number;
    name: string;
    paused: boolean;
    chip: string;
}

interface OfferLimit {
    kind: string;
    limit: number;
    over_limit: boolean;
    offers: LimitOffer[];
}

export interface OfferLimitNoticeProps {
    /** Offer kind: `order_bump`, `smart_coupon`, `cart_reward`. */
    kind: string;
    /** Called after a choice is saved, for the page to reload its list. */
    onSaved?: () => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props         Props.
 * @param props.kind    Offer kind.
 * @param props.onSaved Called after a choice is saved.
 */
export function OfferLimitNotice( { kind, onSaved }: OfferLimitNoticeProps ) {
    const route = `/${ getAdminData().restNamespace }/offer-limits`;
    const [ limit, setLimit ] = useState< OfferLimit | null >( null );
    const [ open, setOpen ] = useState( false );
    const [ picked, setPicked ] = useState< number[] >( [] );

    useEffect( () => {
        apiFetch< OfferLimit[] >( { path: route } )
            .then( ( limits ) => {
                setLimit(
                    limits.find( ( item ) => {
                        return item.kind === kind;
                    } ) ?? null
                );
            } )
            .catch( () => {
                setLimit( null );
            } );
    }, [ kind, route ] );

    if ( ! limit?.over_limit ) {
        return null;
    }

    const save = async () => {
        try {
            const limits = await apiFetch< OfferLimit[] >( {
                path: `${ route }/${ kind }`,
                method: 'POST',
                data: { keep: picked },
            } );

            setLimit(
                limits.find( ( item ) => {
                    return item.kind === kind;
                } ) ?? null
            );
            setOpen( false );
            onSaved?.();
            toast.success( __( 'Saved.', 'storegrowth-sales-booster' ) );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'Your choice could not be saved.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    return (
        <Alert>
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                <span>
                    { __(
                        'You have more offers than the Free plan allows. Choose which stay on.',
                        'storegrowth-sales-booster'
                    ) }
                </span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={ () => {
                        setPicked(
                            limit.offers
                                .filter( ( offer ) => {
                                    return ! offer.paused;
                                } )
                                .map( ( offer ) => {
                                    return offer.id;
                                } )
                        );
                        setOpen( true );
                    } }
                >
                    { __( 'Choose offers', 'storegrowth-sales-booster' ) }
                </Button>
            </AlertDescription>
            <Dialog open={ open } onOpenChange={ setOpen }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            { __(
                                'Choose which stay on',
                                'storegrowth-sales-booster'
                            ) }
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        { limit.offers.map( ( offer ) => {
                            const checked = picked.includes( offer.id );

                            return (
                                <div
                                    key={ offer.id }
                                    className="flex items-center gap-2 text-sm text-sg-text"
                                >
                                    <Checkbox
                                        id={ `spsg-limit-${ offer.id }` }
                                        checked={ checked }
                                        disabled={
                                            ! checked &&
                                            picked.length >= limit.limit
                                        }
                                        onCheckedChange={ (
                                            value: boolean
                                        ) => {
                                            setPicked(
                                                value
                                                    ? [ ...picked, offer.id ]
                                                    : picked.filter( ( id ) => {
                                                          return (
                                                              id !== offer.id
                                                          );
                                                      } )
                                            );
                                        } }
                                    />
                                    <Label
                                        htmlFor={ `spsg-limit-${ offer.id }` }
                                    >
                                        { offer.name }
                                    </Label>
                                </div>
                            );
                        } ) }
                    </div>
                    <Button onClick={ save }>
                        { __( 'Save', 'storegrowth-sales-booster' ) }
                    </Button>
                </DialogContent>
            </Dialog>
        </Alert>
    );
}
