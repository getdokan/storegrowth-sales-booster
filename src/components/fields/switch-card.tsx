/**
 * Switch card (design: bordered card with a title, a help line and a switch),
 * for display toggles such as "Shop Page Display".
 *
 * Built from the plugin-ui Field parts its own `SwitchCard` uses; that one
 * puts its classes on the switch, so the card can't take the design's padding,
 * type sizes or locked (Pro) look.
 *
 * @since SPSG_VERSION
 */
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel as PuiFieldLabel,
    FieldTitle,
} from '@wedevs/plugin-ui';
import type { ReactNode } from 'react';

import { ToggleSwitch } from '../toggle-switch';
import { ProBadge } from './field-label';

export interface SwitchCardProps {
    title: ReactNode;
    help?: ReactNode;
    checked: boolean;
    onChange: ( checked: boolean ) => void;
    /** Pro field without pro. */
    locked?: boolean;
}

/**
 * @since SPSG_VERSION
 *
 * @param props          Props.
 * @param props.title    Title.
 * @param props.help     Help line.
 * @param props.checked  On.
 * @param props.onChange Change handler.
 * @param props.locked   Pro field without pro.
 */
export function SwitchCard( {
    title,
    help,
    checked,
    onChange,
    locked,
}: SwitchCardProps ) {
    return (
        <PuiFieldLabel className="w-full rounded-[5px] border-sg-stroke bg-white has-data-checked:border-sg-stroke has-data-checked:bg-white *:data-[slot=field]:p-4">
            <Field
                orientation="horizontal"
                className="gap-4 has-[>[data-slot=field-content]]:items-center"
            >
                <FieldContent className="gap-2">
                    <FieldTitle className="font-semibold leading-[1.3] text-sg-text">
                        { title }
                        { locked && <ProBadge /> }
                    </FieldTitle>
                    { help && (
                        <FieldDescription className="text-xs leading-[1.4] text-sg-help">
                            { help }
                        </FieldDescription>
                    ) }
                </FieldContent>
                <ToggleSwitch
                    checked={ checked }
                    disabled={ locked }
                    onCheckedChange={ onChange }
                />
            </Field>
        </PuiFieldLabel>
    );
}
