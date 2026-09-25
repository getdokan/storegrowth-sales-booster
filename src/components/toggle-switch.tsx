/**
 * plugin-ui Switch in the design's 30×18 brand-blue style.
 *
 * @since SPSG_VERSION
 */
import { Switch, cn } from '@wedevs/plugin-ui';
import type { ComponentProps } from 'react';

export type ToggleSwitchProps = ComponentProps< typeof Switch >;

/**
 * Design-styled switch.
 *
 * @since SPSG_VERSION
 *
 * @param props           Switch props.
 * @param props.className Extra classes.
 */
export function ToggleSwitch( { className, ...props }: ToggleSwitchProps ) {
    return (
        <Switch
            className={ cn(
                'data-checked:bg-sg-brand data-unchecked:bg-[#D1D5DC] border-0 shadow-none',
                className
            ) }
            { ...props }
        />
    );
}
