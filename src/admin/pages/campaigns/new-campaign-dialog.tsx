/**
 * The New campaign dialog: a name and a template (ADR-016).
 *
 * @since SPSG_VERSION
 */
import {
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    toast,
} from '@wedevs/plugin-ui';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useModules, useNavigate } from '@storegrowth/hooks';
import { errorMessage } from '@storegrowth/utilities';

import { createCampaign, fetchTemplates, type CampaignTemplate } from './api';

/** Modules a template needs, by surface or coupon. */
const SURFACE_MODULES: Record< string, string > = {
    countdown: 'countdown-timer',
    floating_bar: 'floating-notification-bar',
    stock_bar: 'stock-bar',
    sales_pop: 'sales-pop',
    fly_cart: 'fly-cart',
    cart_rewards: 'progressive-discount-banner',
};

/**
 * @since SPSG_VERSION
 *
 * @param props         Props.
 * @param props.onClose Called to close the dialog.
 */
export function NewCampaignDialog( { onClose }: { onClose: () => void } ) {
    const navigate = useNavigate();
    const { getModule, setModuleStatus } = useModules();
    const [ templates, setTemplates ] = useState<
        Record< string, CampaignTemplate >
    >( {} );
    const [ name, setName ] = useState( '' );
    const [ busy, setBusy ] = useState( false );

    useEffect( () => {
        fetchTemplates().then( setTemplates );
    }, [] );

    const create = async ( template: string ) => {
        setBusy( true );
        try {
            const campaign = await createCampaign( template, name );

            navigate( `/campaigns/${ campaign.id }` );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The campaign could not be created.',
                        'storegrowth-sales-booster'
                    )
                )
            );
            setBusy( false );
        }
    };

    return (
        <Dialog
            open
            onOpenChange={ ( open: boolean ) => {
                if ( ! open ) {
                    onClose();
                }
            } }
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        { __( 'New campaign', 'storegrowth-sales-booster' ) }
                    </DialogTitle>
                </DialogHeader>
                <Input
                    aria-label={ __(
                        'Campaign name',
                        'storegrowth-sales-booster'
                    ) }
                    placeholder={ __(
                        'Campaign name',
                        'storegrowth-sales-booster'
                    ) }
                    value={ name }
                    onChange={ ( event ) => {
                        setName( event.target.value );
                    } }
                />
                <div className="flex flex-col gap-2">
                    { Object.entries( templates ).map( ( [ id, template ] ) => {
                        const needs = [
                            ...template.surfaces.map( ( surface ) => {
                                return SURFACE_MODULES[ surface ] ?? '';
                            } ),
                            template.coupon ? 'smart-coupons' : '',
                        ].filter( ( module ) => {
                            return module && ! getModule( module )?.status;
                        } );

                        return (
                            <div
                                key={ id }
                                className="flex items-center justify-between gap-2 rounded-lg border border-sg-stroke p-3"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sg-heading">
                                        { template.name }
                                    </span>
                                    <span className="flex flex-wrap gap-1">
                                        { needs.map( ( module ) => {
                                            return (
                                                <Button
                                                    key={ module }
                                                    variant="link"
                                                    onClick={ () => {
                                                        setModuleStatus(
                                                            module,
                                                            true
                                                        );
                                                    } }
                                                >
                                                    <Badge variant="secondary">
                                                        { __(
                                                            'Needs',
                                                            'storegrowth-sales-booster'
                                                        ) }{ ' ' }
                                                        { getModule( module )
                                                            ?.name ?? module }
                                                    </Badge>
                                                </Button>
                                            );
                                        } ) }
                                    </span>
                                </div>
                                <Button
                                    disabled={ busy }
                                    onClick={ () => {
                                        create( id );
                                    } }
                                >
                                    { __(
                                        'Use template',
                                        'storegrowth-sales-booster'
                                    ) }
                                </Button>
                            </div>
                        );
                    } ) }
                </div>
            </DialogContent>
        </Dialog>
    );
}
