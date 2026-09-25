/**
 * Checkbox option row (design `.opt-row`): plugin-ui checkbox and its label.
 * Group rows in `CheckboxGroup` (design `.opt-grid`).
 *
 * @since SPSG_VERSION
 */
import { Checkbox } from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';
import type { ReactNode } from 'react';

import { ProBadge } from './field-label';

export interface CheckboxFieldProps {
    label: ReactNode;
    checked: boolean;
    onChange: ( checked: boolean ) => void;
    /** Pro field without pro. */
    locked?: boolean;
    id?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.checked  Checked.
 * @param props.onChange Change handler.
 * @param props.locked   Pro field without pro.
 * @param props.id       Checkbox id.
 */
export function CheckboxField( {
    label,
    checked,
    onChange,
    locked,
    id,
}: CheckboxFieldProps ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;

    return (
        <label
            htmlFor={ inputId }
            className="group flex w-full cursor-pointer items-center gap-3 text-sm leading-[1.3] text-sg-text"
        >
            <Checkbox
                id={ inputId }
                checked={ checked }
                disabled={ locked }
                onCheckedChange={ onChange }
                className="border-sg-stroke group-hover:border-sg-brand data-checked:border-sg-brand data-checked:bg-sg-brand"
            />
            { label }
            { locked && <ProBadge /> }
        </label>
    );
}

/**
 * Column of checkbox rows (design `.opt-grid`).
 *
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.children Rows.
 */
export function CheckboxGroup( { children }: { children: ReactNode } ) {
    return <div className="flex w-full flex-col gap-5">{ children }</div>;
}
