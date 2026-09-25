/**
 * Number field (design `.field` + `.input`, or `.suffix-input` with a unit
 * such as `px`). Emits a `number`, the settings API type.
 *
 * @since SPSG_VERSION
 */
import { cn } from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';

import {
    type BaseFieldProps,
    FIELD_CONTROL,
    FieldLabel,
    FieldNotes,
} from './field-label';

export interface NumberFieldProps extends BaseFieldProps {
    value: number;
    onChange: ( value: number ) => void;
    /** Unit shown in a box after the input, e.g. `px`. */
    suffix?: string;
    min?: number;
    max?: number;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.value    Value.
 * @param props.onChange Change handler.
 * @param props.suffix   Unit.
 * @param props.min      Minimum.
 * @param props.max      Maximum.
 * @param props.locked   Pro field without pro.
 * @param props.error    Error message.
 * @param props.help     Help line.
 * @param props.id       Input id.
 */
export function NumberField( {
    label,
    value,
    onChange,
    suffix,
    min,
    max,
    locked,
    error,
    help,
    id,
}: NumberFieldProps ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <FieldLabel htmlFor={ inputId } locked={ locked }>
                { label }
            </FieldLabel>
            <div className="flex w-full">
                <input
                    id={ inputId }
                    type="number"
                    className={ cn(
                        FIELD_CONTROL,
                        suffix && 'rounded-r-none border-r-0'
                    ) }
                    value={ value }
                    min={ min }
                    max={ max }
                    disabled={ locked }
                    onChange={ ( event ) =>
                        onChange( Number( event.target.value ) )
                    }
                />
                { suffix && (
                    <span className="flex h-10 items-center rounded-r-[5px] border border-[#E9E9E9] bg-sg-suffix px-4 text-sm text-sg-text">
                        { suffix }
                    </span>
                ) }
            </div>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
