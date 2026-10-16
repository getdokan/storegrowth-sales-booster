/**
 * plugin-ui Switch in the design's 30×18 brand-blue style.
 *
 * @since 3.0.0
 */
import { Switch, cn } from '@wedevs/plugin-ui';
import type { ComponentProps } from 'react';

export type ToggleSwitchProps = ComponentProps< typeof Switch >;

/**
 * Design-styled switch.
 *
 * @since 3.0.0
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
