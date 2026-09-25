/**
 * Feature rail (design `.feature-menu`): one row per module, the current one
 * tinted, deactivated ones dimmed. Picking a deactivated module asks to
 * activate it instead of navigating.
 *
 * @since SPSG_VERSION
 */
import { cn, toast } from '@wedevs/plugin-ui';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { errorMessage, moduleLabel } from '@storegrowth/utilities';
import { navigate, useModules } from '@storegrowth/hooks';

import { DeactivatedModuleDialog } from './deactivated-module-dialog';
import { ModuleIcon } from './module-icon';

export interface FeatureMenuProps {
    /** Id of the module whose page is open. */
    activeId: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.activeId Current module id.
 */
export function FeatureMenu( { activeId }: FeatureMenuProps ) {
    const { modules, pending, setModuleStatus } = useModules();
    const [ confirmId, setConfirmId ] = useState< string | null >( null );

    const confirmModule = modules.find( ( module ) => module.id === confirmId );

    const activate = async () => {
        if ( ! confirmModule ) {
            return;
        }

        try {
            await setModuleStatus( confirmModule.id, true );
            setConfirmId( null );
            navigate( `/${ confirmModule.id }` );
        } catch ( error ) {
            toast.error(
                errorMessage(
                    error,
                    __(
                        'The module could not be activated.',
                        'storegrowth-sales-booster'
                    )
                )
            );
        }
    };

    return (
        <>
            <nav
                aria-label={ __( 'Features', 'storegrowth-sales-booster' ) }
                className="z-20 flex w-full shrink-0 flex-row gap-2 overflow-x-auto border-b border-sg-stroke bg-white px-4 py-3 min-[901px]:sticky min-[901px]:top-[var(--spsg-rail-top)] min-[901px]:h-[calc(100vh-var(--spsg-rail-top))] min-[901px]:w-[210px] min-[901px]:flex-col min-[901px]:gap-0 min-[901px]:self-start min-[901px]:overflow-y-auto min-[901px]:overflow-x-hidden min-[901px]:border-b-0 min-[901px]:px-3 min-[901px]:py-6"
            >
                { modules.map( ( module ) => {
                    const isCurrent = module.id === activeId;

                    return (
                        <a
                            key={ module.id }
                            href={ `#/${ module.id }` }
                            aria-current={ isCurrent ? 'page' : undefined }
                            onClick={ ( event ) => {
                                event.preventDefault();

                                if ( module.status ) {
                                    navigate( `/${ module.id }` );
                                } else {
                                    setConfirmId( module.id );
                                }
                            } }
                            className={ cn(
                                'group flex w-auto shrink-0 items-center gap-2 whitespace-nowrap rounded-[8px] bg-white p-3 text-[14px] font-medium leading-5 text-sg-heading no-underline hover:bg-sg-chip hover:text-sg-heading focus:shadow-none min-[901px]:w-[186px]',
                                isCurrent &&
                                    'bg-sg-brand-soft text-sg-brand hover:bg-sg-brand-soft hover:text-sg-brand',
                                ! module.status && 'opacity-55'
                            ) }
                        >
                            <ModuleIcon
                                id={ module.id }
                                className={ cn(
                                    'h-5 w-5 shrink-0',
                                    isCurrent
                                        ? 'text-current'
                                        : 'text-sg-menu-icon'
                                ) }
                            />
                            { moduleLabel( module ) }
                        </a>
                    );
                } ) }
            </nav>
            <DeactivatedModuleDialog
                moduleLabel={
                    confirmModule ? moduleLabel( confirmModule ) : null
                }
                busy={
                    !! confirmModule && pending.includes( confirmModule.id )
                }
                onCancel={ () => setConfirmId( null ) }
                onActivate={ activate }
            />
        </>
    );
}
