/**
 * Select field (design `.field` + `.select`): label above plugin-ui's Select.
 *
 * @since SPSG_VERSION
 */
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn,
} from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';

import {
    type BaseFieldProps,
    FIELD_CONTROL,
    FieldLabel,
    FieldNotes,
} from './field-label';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectFieldProps extends BaseFieldProps {
    value: string;
    onChange: ( value: string ) => void;
    options: SelectOption[];
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.value    Selected value.
 * @param props.onChange Change handler.
 * @param props.options  Options.
 * @param props.locked   Pro field without pro.
 * @param props.error    Error message.
 * @param props.help     Help line.
 * @param props.id       Select id.
 */
export function SelectField( {
    label,
    value,
    onChange,
    options,
    locked,
    error,
    help,
    id,
}: SelectFieldProps ) {
    const fallbackId = useId();
    const selectId = id ?? fallbackId;

    return (
        <div className="flex w-full flex-col items-start gap-2">
            <FieldLabel htmlFor={ selectId } locked={ locked }>
                { label }
            </FieldLabel>
            <Select
                // `items` lets the trigger show the label, not the value.
                items={ options }
                value={ value }
                disabled={ locked }
                onValueChange={ ( next ) => next !== null && onChange( next ) }
            >
                <SelectTrigger
                    id={ selectId }
                    aria-invalid={ !! error }
                    className={ cn(
                        FIELD_CONTROL,
                        'border ps-4 pe-4 data-[size=default]:h-10 [&>svg]:size-5 [&>svg]:text-sg-text'
                    ) }
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    { options.map( ( option ) => (
                        <SelectItem
                            key={ option.value }
                            value={ option.value }
                            className="cursor-pointer"
                        >
                            { option.label }
                        </SelectItem>
                    ) ) }
                </SelectContent>
            </Select>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
