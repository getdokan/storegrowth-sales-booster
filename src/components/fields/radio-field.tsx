/**
 * Radio choice field: label, then one plugin-ui radio per option, stacked
 * (design: the bars' Trigger field).
 *
 * @since SPSG_VERSION
 */
import { LabeledRadio, RadioGroup } from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';

import {
    type BaseFieldProps,
    FieldNotes,
    FIELD_LABEL,
    ProBadge,
} from './field-label';
import type { SelectOption } from './select-field';

export interface RadioFieldProps extends BaseFieldProps {
    value: string;
    options: SelectOption[];
    onChange: ( value: string ) => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.value    Selected value.
 * @param props.options  Choices.
 * @param props.onChange Change handler.
 * @param props.locked   Pro field without pro.
 * @param props.error    Error message.
 * @param props.help     Help line.
 */
export function RadioField( {
    label,
    value,
    options,
    onChange,
    locked,
    error,
    help,
}: RadioFieldProps ) {
    const labelId = useId();

    return (
        <div className="flex w-full flex-col items-start gap-3">
            <span
                id={ labelId }
                className={ `flex items-center gap-2 ${ FIELD_LABEL }` }
            >
                { label }
                { locked && <ProBadge /> }
            </span>
            <RadioGroup
                aria-labelledby={ labelId }
                value={ value }
                onValueChange={ ( next ) => {
                    onChange( next as string );
                } }
                disabled={ locked }
                className="flex flex-col gap-3"
            >
                { options.map( ( option ) => {
                    // An id links the label: it names the radio and clicks it.
                    return (
                        <LabeledRadio
                            key={ option.value }
                            id={ `${ labelId }-${ option.value }` }
                            value={ option.value }
                            label={ option.label }
                        />
                    );
                } ) }
            </RadioGroup>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
