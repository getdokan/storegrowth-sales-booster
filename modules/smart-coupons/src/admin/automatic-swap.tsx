/**
 * Free has one active automatic coupon. Turning on another asks to swap it
 * with the one that's on (switched off through the status route) or to
 * upgrade. The editor and the list both ask through this.
 *
 * @since SPSG_VERSION
 */
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
} from '@wedevs/plugin-ui';
import { useCallback, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import {
    fetchRecordEditor,
    getHeaderData,
    setRecordStatus,
} from '@storegrowth/utilities';

import {
    type CouponRef,
    couponsRoute,
    type SmartCouponEditorData,
} from './api';

/**
 * The automatic coupon that's on, read fresh (null with Pro).
 *
 * @since SPSG_VERSION
 */
export async function automaticOn(): Promise< CouponRef | null > {
    const editor = await fetchRecordEditor< SmartCouponEditorData >(
        couponsRoute()
    );

    return editor.automatic_on ?? null;
}

/**
 * Switch a coupon off.
 *
 * @since SPSG_VERSION
 *
 * @param id Coupon id.
 */
export function switchOff( id: number ) {
    return setRecordStatus( couponsRoute(), id, false );
}

interface Pending {
    current: CouponRef;
    resolve: ( swap: boolean ) => void;
}

/**
 * The swap prompt: `ask( current )` opens it and resolves true when the
 * user chooses to swap; `dialog` is drawn by the caller.
 *
 * @since SPSG_VERSION
 */
export function useAutomaticSwap() {
    const [ pending, setPending ] = useState< Pending | null >( null );

    const ask = useCallback( ( current: CouponRef ) => {
        return new Promise< boolean >( ( resolve ) => {
            setPending( { current, resolve } );
        } );
    }, [] );

    const close = ( swap: boolean ) => {
        pending?.resolve( swap );
        setPending( null );
    };

    const name = decodeEntities( pending?.current.name ?? '' );

    const dialog = (
        <AlertDialog
            open={ pending !== null }
            onOpenChange={ ( open: boolean ) => {
                if ( ! open ) {
                    close( false );
                }
            } }
        >
            <AlertDialogContent className="max-w-[440px]!">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        { __(
                            'Free includes one active automatic coupon',
                            'storegrowth-sales-booster'
                        ) }
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        { sprintf(
                            /* translators: %s: the automatic coupon that's on. */
                            __(
                                '“%s” is on. Swap it for this one, or upgrade to Pro for unlimited automatic coupons. Code and link coupons are unlimited.',
                                'storegrowth-sales-booster'
                            ),
                            name
                        ) }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-wrap justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={ () => {
                            close( false );
                        } }
                    >
                        { __( 'Cancel', 'storegrowth-sales-booster' ) }
                    </Button>
                    <Button
                        variant="outline"
                        onClick={ () => {
                            window.open(
                                getHeaderData().header_info.upgrade_url,
                                '_blank',
                                'noopener,noreferrer'
                            );
                            close( false );
                        } }
                    >
                        { __( 'Upgrade to Pro', 'storegrowth-sales-booster' ) }
                    </Button>
                    <Button
                        onClick={ () => {
                            close( true );
                        } }
                    >
                        { sprintf(
                            /* translators: %s: the automatic coupon that's on. */
                            __( 'Turn off “%s”', 'storegrowth-sales-booster' ),
                            name
                        ) }
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    return { ask, dialog };
}
