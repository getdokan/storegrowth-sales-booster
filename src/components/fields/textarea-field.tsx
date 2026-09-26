/**
 * Textarea field (design `.field` + `.textarea`): label above a full-width
 * plugin-ui textarea.
 *
 * @since SPSG_VERSION
 */
import { Textarea, cn } from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';

import {
    type BaseFieldProps,
    FIELD_CONTROL,
    FieldLabel,
    FieldNotes,
} from './field-label';

export interface TextareaFieldProps extends BaseFieldProps {
    value: string;
    onChange: ( value: string ) => void;
    placeholder?: string;
    rows?: number;
}

/**
 * @since SPSG_VERSION
 *
 * @param props             Props.
 * @param props.label       Label.
 * @param props.value       Value.
 * @param props.onChange    Change handler.
 * @param props.locked      Pro field without pro.
 * @param props.error       Error message.
 * @param props.help        Help line.
 * @param props.id          Textarea id.
 * @param props.placeholder Placeholder.
 * @param props.rows        Visible rows.
 */
export function TextareaField( {
    label,
    value,
    onChange,
    locked,
    error,
    help,
    id,
    placeholder,
    rows = 3,
}: TextareaFieldProps ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <FieldLabel htmlFor={ inputId } locked={ locked }>
                { label }
            </FieldLabel>
            <Textarea
                id={ inputId }
                className={ cn( FIELD_CONTROL, 'h-auto py-2.5' ) }
                value={ value }
                rows={ rows }
                placeholder={ placeholder }
                disabled={ locked }
                aria-invalid={ !! error }
                onChange={ ( event ) => onChange( event.target.value ) }
            />
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
