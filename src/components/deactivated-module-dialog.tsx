/**
 * "Module is currently deactivated" confirmation (design `.sg-modal`, Figma
 * node 164:7811), shown when a disabled module is picked in the feature menu.
 *
 * @since SPSG_VERSION
 */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@wedevs/plugin-ui';
import { __, sprintf } from '@wordpress/i18n';
import { CircleAlert } from 'lucide-react';

export interface DeactivatedModuleDialogProps {
    /** Label of the module to activate, or null when closed. */
    moduleLabel: string | null;
    /** Whether activation is in progress. */
    busy?: boolean;
    onCancel: () => void;
    onActivate: () => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props             Props.
 * @param props.moduleLabel Module to activate, or null when closed.
 * @param props.busy        Whether activation is in progress.
 * @param props.onCancel    Called when the dialog is dismissed.
 * @param props.onActivate  Called when "Active Now" is pressed.
 */
export function DeactivatedModuleDialog( {
    moduleLabel,
    busy = false,
    onCancel,
    onActivate,
}: DeactivatedModuleDialogProps ) {
    return (
        <AlertDialog
            open={ moduleLabel !== null }
            onOpenChange={ ( open: boolean ) => ! open && onCancel() }
        >
            <AlertDialogContent className="flex w-[calc(100%-40px)] max-w-[400px]! flex-col items-center gap-8 rounded-[16px] bg-white p-8 text-center shadow-[0_8px_12px_rgba(0,0,0,.03)] ring-0">
                <span className="flex items-center justify-center rounded-[8px] bg-[#FEFCE8] p-3 text-[#CA8A04]">
                    <CircleAlert
                        className="h-6 w-6"
                        strokeWidth={ 2 }
                        aria-hidden
                    />
                </span>
                <AlertDialogHeader className="flex! w-full flex-col items-center! gap-1 text-center!">
                    <AlertDialogTitle className="text-[24px] font-bold leading-8 tracking-[-0.24px] text-sg-ink">
                        { sprintf(
                            /* translators: %s: module name. */
                            __(
                                '%s is currently deactivated',
                                'storegrowth-sales-booster'
                            ),
                            moduleLabel ?? ''
                        ) }
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[14px] leading-[22px] text-[#4B5563]">
                        { __(
                            'Activate this module to use it on your store. You can turn it off anytime from Modules.',
                            'storegrowth-sales-booster'
                        ) }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex w-full flex-row justify-center gap-4">
                    <AlertDialogCancel
                        className="h-10 flex-1 rounded-[6px] border border-sg-stroke bg-white text-[14px] font-medium text-sg-heading hover:bg-sg-chip"
                        disabled={ busy }
                    >
                        { __( 'Cancel', 'storegrowth-sales-booster' ) }
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="h-10 flex-1 rounded-[6px] bg-sg-brand text-[14px] font-medium text-white hover:bg-sg-brand-hover"
                        disabled={ busy }
                        onClick={ onActivate }
                    >
                        { __( 'Active Now', 'storegrowth-sales-booster' ) }
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
