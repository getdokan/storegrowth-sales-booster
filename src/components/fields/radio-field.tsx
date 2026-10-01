/**
 * Radio choice field: label, then one plugin-ui radio per option, stacked
 * (design: the bars' Trigger field).
 *
 * @since SPSG_VERSION
 */
import { LabeledRadio, RadioGroup, cn } from '@wedevs/plugin-ui';
import { useId } from '@wordpress/element';

import {
    type BaseFieldProps,
    FieldNotes,
    FIELD_LABEL,
    ProBadge,
} from './field-label';
import { InfoTip } from './info-tip';
import type { SelectOption } from './select-field';

export interface RadioOption extends SelectOption {
    /** Info tip beside the option (schema `option_help`). */
    help?: string;
    /** Not selectable, e.g. it needs another module. */
    disabled?: boolean;
}

export interface RadioFieldProps extends BaseFieldProps {
    value: string;
    options: RadioOption[];
    onChange: ( value: string ) => void;
    /** Options side by side instead of stacked. */
    inline?: boolean;
    /** Hide the label (a section title already names the choice). */
    hideLabel?: boolean;
    /** Option list spacing (design `.opt-grid`, 20px) instead of 12px. */
    spacious?: boolean;
}

/**
 * @since SPSG_VERSION
 *
 * @param props           Props.
 * @param props.label     Label.
 * @param props.value     Selected value.
 * @param props.options   Choices.
 * @param props.onChange  Change handler.
 * @param props.locked    Pro field without pro.
 * @param props.error     Error message.
 * @param props.help      Help line.
 * @param props.inline    Options side by side.
 * @param props.hideLabel Label for screen readers only.
 * @param props.spacious  20px between options.
 */
export function RadioField( {
    label,
    value,
    options,
    onChange,
    locked,
    error,
    help,
    inline = false,
    hideLabel = false,
    spacious = false,
}: RadioFieldProps ) {
    const labelId = useId();

    return (
        <div className="flex w-full flex-col items-start gap-3">
            <span
                id={ labelId }
                className={ cn(
                    'flex items-center gap-2',
                    FIELD_LABEL,
                    hideLabel && ! locked && 'sr-only'
                ) }
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
                className={ cn(
                    'flex gap-3',
                    // Rows take their content's width side by side (plugin-ui's
                    // field group is a size container, which has none).
                    inline
                        ? 'flex-row flex-wrap gap-x-6 *:w-auto *:[container-type:normal]'
                        : cn( 'flex-col', spacious && 'gap-5' )
                ) }
            >
                { options.map( ( option ) => {
                    // An id links the label: it names the radio and clicks it.
                    // The tip is a button in the label: clicking it doesn't
                    // pick the option.
                    return (
                        <LabeledRadio
                            key={ option.value }
                            id={ `${ labelId }-${ option.value }` }
                            value={ option.value }
                            disabled={ option.disabled }
                            label={
                                <span className="inline-flex items-center gap-2">
                                    { option.label }
                                    { option.help && (
                                        <InfoTip
                                            text={ option.help }
                                            about={ option.label }
                                        />
                                    ) }
                                </span>
                            }
                        />
                    );
                } ) }
            </RadioGroup>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
