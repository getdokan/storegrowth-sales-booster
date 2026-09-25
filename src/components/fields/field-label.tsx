/**
 * Field label (design `.field-label`) with a "Pro" marker for fields that
 * need pro, and the field's error line.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import { __ } from '@wordpress/i18n';
import { Crown } from 'lucide-react';
import type { ReactNode } from 'react';

/** Props every field component shares. */
export interface BaseFieldProps {
    label: ReactNode;
    /** Pro field while pro is inactive: shown, not editable. */
    locked?: boolean;
    /** Validation message from the last save. */
    error?: string;
    /** Help line under the control. */
    help?: ReactNode;
    /** Input id; generated when omitted. */
    id?: string;
}

/**
 * Shared field-label classes.
 *
 * @since SPSG_VERSION
 */
export const FIELD_LABEL = 'text-sm font-medium text-sg-text';

/**
 * Shared text-control classes (design `.input` / `.select`).
 *
 * @since SPSG_VERSION
 */
export const FIELD_CONTROL =
    'flex h-10 w-full items-center rounded-[5px] border border-[#E9E9E9] bg-white px-4 text-sm leading-[1.4] text-sg-text placeholder:text-sg-field focus-visible:border-sg-brand focus-visible:shadow-[0_0_0_3px_rgba(8,117,255,.25)] focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-sg-chip';

/**
 * Amber "Pro" pill shown beside a locked field's label.
 *
 * @since SPSG_VERSION
 */
export function ProBadge() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sg-amber px-2 py-0.5 text-[11px] font-semibold leading-4 text-black">
            <Crown className="size-3" strokeWidth={ 2 } aria-hidden />
            { __( 'Pro', 'storegrowth-sales-booster' ) }
        </span>
    );
}

/**
 * @since SPSG_VERSION
 *
 * @param props           Props.
 * @param props.htmlFor   Control id.
 * @param props.locked    Show the Pro pill.
 * @param props.children  Label text.
 * @param props.className Extra classes.
 */
export function FieldLabel( {
    htmlFor,
    locked,
    children,
    className,
}: {
    htmlFor?: string;
    locked?: boolean;
    children: ReactNode;
    className?: string;
} ) {
    return (
        <label
            htmlFor={ htmlFor }
            className={ cn(
                'flex items-center gap-2',
                FIELD_LABEL,
                className
            ) }
        >
            { children }
            { locked && <ProBadge /> }
        </label>
    );
}

/**
 * Help and error lines under a control.
 *
 * @since SPSG_VERSION
 *
 * @param props       Props.
 * @param props.help  Help line.
 * @param props.error Error message.
 */
export function FieldNotes( {
    help,
    error,
}: {
    help?: ReactNode;
    error?: string;
} ) {
    return (
        <>
            { help && (
                <span className="text-xs leading-[1.4] text-sg-help">
                    { help }
                </span>
            ) }
            { error && (
                <span role="alert" className="text-xs text-red-600">
                    { error }
                </span>
            ) }
        </>
    );
}
