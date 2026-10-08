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
    'h-10 w-full rounded-[5px] border-sg-stroke bg-white px-4 text-sm leading-[1.4] text-sg-text shadow-none placeholder:text-sg-field focus-visible:border-sg-brand focus-visible:ring-[3px] focus-visible:ring-sg-brand/25 disabled:cursor-not-allowed disabled:bg-sg-chip disabled:opacity-100';

/**
 * "Pro" pill beside a locked field's label (same look as the dashboard's
 * pro pill).
 *
 * @since SPSG_VERSION
 */
export function ProBadge() {
    return (
        <span className="inline-flex items-center gap-1 rounded-[20px] bg-sg-amber-pro px-2 py-0.5 text-[12px] leading-[1.4] text-black">
            { __( 'Pro', 'storegrowth-sales-booster' ) }
            <Crown className="size-3.5" strokeWidth={ 1.5 } aria-hidden />
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
