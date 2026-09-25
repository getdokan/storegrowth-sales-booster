/**
 * Reset + Save buttons at the end of a settings tab (design: right-aligned,
 * outlined Reset, blue Save), on plugin-ui's Button.
 *
 * @since SPSG_VERSION
 */
import { Button, cn } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';

export interface SaveBarProps {
    onSave: () => void;
    /** Put the tab's fields back to their defaults. Hidden when omitted. */
    onReset?: () => void;
    /** A save is in flight. */
    saving?: boolean;
    /** Nothing to save: Save is disabled. */
    disabled?: boolean;
    className?: string;
}

const BUTTON = 'h-10 rounded-md px-6 leading-5 disabled:opacity-60';

/**
 * @since SPSG_VERSION
 *
 * @param props           Props.
 * @param props.onSave    Save handler.
 * @param props.onReset   Reset handler.
 * @param props.saving    Save in flight.
 * @param props.disabled  Nothing to save.
 * @param props.className Extra classes.
 */
export function SaveBar( {
    onSave,
    onReset,
    saving = false,
    disabled = false,
    className,
}: SaveBarProps ) {
    return (
        <div className={ cn( 'flex w-full justify-end gap-3', className ) }>
            { onReset && (
                <Button
                    variant="outline"
                    className={ cn(
                        BUTTON,
                        'border-sg-stroke bg-white text-sg-text hover:bg-sg-chip'
                    ) }
                    disabled={ saving }
                    onClick={ onReset }
                >
                    { __( 'Reset', 'storegrowth-sales-booster' ) }
                </Button>
            ) }
            <Button
                className={ cn( BUTTON, 'hover:bg-sg-brand-hover' ) }
                disabled={ saving || disabled }
                aria-busy={ saving }
                onClick={ onSave }
            >
                { saving
                    ? __( 'Saving…', 'storegrowth-sales-booster' )
                    : __( 'Save', 'storegrowth-sales-booster' ) }
            </Button>
        </div>
    );
}
