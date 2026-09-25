/**
 * Reset + Save buttons at the end of a settings tab (design: right-aligned,
 * outlined Reset, blue Save).
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
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

const BUTTON =
    'flex shrink-0 cursor-pointer items-center rounded-md px-6 py-2.5 text-sm font-medium leading-5 transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60';

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
                <button
                    type="button"
                    className={ cn(
                        BUTTON,
                        'border border-sg-stroke bg-white text-sg-text hover:bg-sg-chip'
                    ) }
                    disabled={ saving }
                    onClick={ onReset }
                >
                    { __( 'Reset', 'storegrowth-sales-booster' ) }
                </button>
            ) }
            <button
                type="button"
                className={ cn(
                    BUTTON,
                    'border-0 bg-sg-brand text-white hover:bg-sg-brand-hover'
                ) }
                disabled={ saving || disabled }
                aria-busy={ saving }
                onClick={ onSave }
            >
                { saving
                    ? __( 'Saving…', 'storegrowth-sales-booster' )
                    : __( 'Save', 'storegrowth-sales-booster' ) }
            </button>
        </div>
    );
}
