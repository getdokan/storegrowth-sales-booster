/**
 * Switch field (design `.field-row` + `.switch`): label on the left, switch
 * and its "Enable"/"Disable" state on the right.
 *
 * @since SPSG_VERSION
 */
import { useId } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { ToggleSwitch } from '../toggle-switch';
import { type BaseFieldProps, FieldLabel, FieldNotes } from './field-label';

export interface SwitchFieldProps extends BaseFieldProps {
    checked: boolean;
    onChange: ( checked: boolean ) => void;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.label    Label.
 * @param props.checked  On.
 * @param props.onChange Change handler.
 * @param props.locked   Pro field without pro.
 * @param props.error    Error message.
 * @param props.help     Help line.
 * @param props.id       Switch id.
 */
export function SwitchField( {
    label,
    checked,
    onChange,
    locked,
    error,
    help,
    id,
}: SwitchFieldProps ) {
    const fallbackId = useId();
    const switchId = id ?? fallbackId;

    return (
        <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center justify-between gap-4">
                <FieldLabel htmlFor={ switchId } locked={ locked }>
                    { label }
                </FieldLabel>
                <span className="flex items-center gap-2 text-sm text-sg-text">
                    <ToggleSwitch
                        id={ switchId }
                        checked={ checked }
                        disabled={ locked }
                        onCheckedChange={ onChange }
                    />
                    { checked
                        ? __( 'Enable', 'storegrowth-sales-booster' )
                        : __( 'Disable', 'storegrowth-sales-booster' ) }
                </span>
            </div>
            <FieldNotes help={ help } error={ error } />
        </div>
    );
}
