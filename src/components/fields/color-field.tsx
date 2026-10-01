/**
 * Colour field (design `.field-row` + `.swatch`): label on the left, round
 * swatch on the right.
 *
 * @since SPSG_VERSION
 */
import { useId } from '@wordpress/element';

import { ColorPicker } from '../color-picker';
import { type BaseFieldProps, FieldLabel, FieldNotes } from './field-label';

export interface ColorFieldProps extends BaseFieldProps {
    value: string;
    onChange: ( value: string ) => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.value    Colour.
 * @param props.onChange Change handler (6-digit hex).
 * @param props.locked   Pro field without pro.
 * @param props.error    Error message.
 * @param props.help     Help line.
 * @param props.id       Label target id.
 */
export function ColorField( {
    label,
    value,
    onChange,
    locked,
    error,
    help,
    id,
}: ColorFieldProps ) {
    const fallbackId = useId();
    const labelId = id ?? fallbackId;

    return (
        <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center justify-between gap-4">
                <FieldLabel htmlFor={ labelId } locked={ locked }>
                    { label }
                </FieldLabel>
                <ColorPicker
                    id={ labelId }
                    value={ value }
                    onChange={ onChange }
                    disabled={ locked }
                />
            </div>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
