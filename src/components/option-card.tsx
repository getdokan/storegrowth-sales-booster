/**
 * Option card (design `.opt-card`): title and help on the left, a switch on
 * the right, and the fields the switch governs underneath a rule while it's
 * on.
 *
 * @since SPSG_VERSION
 */
import { useId } from '@wordpress/element';
import type { ReactNode } from 'react';

import { FIELD_LABEL, ProBadge } from './fields/field-label';
import { ToggleSwitch } from './toggle-switch';

export interface OptionCardProps {
    title: ReactNode;
    help?: ReactNode;
    checked: boolean;
    onChange: ( checked: boolean ) => void;
    /** The switch needs pro. */
    locked?: boolean;
    /** Fields shown while the switch is on. */
    children: ReactNode;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.title    Title.
 * @param props.help     Help line.
 * @param props.checked  Switch on.
 * @param props.onChange Switch handler.
 * @param props.locked   Switch needs pro.
 * @param props.children Governed fields.
 */
export function OptionCard( {
    title,
    help,
    checked,
    onChange,
    locked,
    children,
}: OptionCardProps ) {
    const id = useId();

    return (
        <section className="flex w-full flex-col rounded-lg border border-sg-line bg-white p-4">
            <div className="flex w-full items-start justify-between gap-4">
                <span className="flex min-w-0 flex-col gap-1">
                    <label
                        htmlFor={ id }
                        className={ `${ FIELD_LABEL } flex items-center gap-2` }
                    >
                        { title }
                        { locked && <ProBadge /> }
                    </label>
                    { help && (
                        <span className="text-xs leading-[1.4] text-sg-help">
                            { help }
                        </span>
                    ) }
                </span>
                <ToggleSwitch
                    id={ id }
                    className="mt-0.5"
                    checked={ checked }
                    disabled={ locked }
                    onCheckedChange={ onChange }
                />
            </div>
            { checked && (
                <div className="mt-4 flex w-full flex-col gap-4 border-t border-sg-line pt-4">
                    { children }
                </div>
            ) }
        </section>
    );
}
