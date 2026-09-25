/**
 * Colour swatch (design `.swatch`: 32px circle) that opens WordPress's colour
 * picker in a plugin-ui popover. Transparency is off: values are 6-digit hex,
 * the shape StoreGrowth stores (migration-spec §8).
 *
 * Stand-in until plugin-ui exports its own `ColorPicker` from the package root
 * (it is bundled but not exported in the pinned version). Then switch the
 * import and delete this file.
 *
 * `@wordpress/components` is WordPress's `wp.components` global at runtime
 * (dependency extraction), so this adds nothing to the bundle.
 *
 * @since SPSG_VERSION
 */
import { cn, Popover, PopoverContent, PopoverTrigger } from '@wedevs/plugin-ui';
import { ColorPicker as WpColorPicker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export interface ColorPickerProps {
    /** Hex colour, e.g. `#0875ff`. */
    value: string;
    onChange: ( value: string ) => void;
    disabled?: boolean;
    /** Accessible name, e.g. the field label. */
    'aria-label'?: string;
    className?: string;
}

/**
 * @since SPSG_VERSION
 *
 * @param props              Props.
 * @param props.value        Hex colour.
 * @param props.onChange     Change handler (6-digit hex).
 * @param props.disabled     Not editable (e.g. a locked pro field).
 * @param props.className    Extra classes for the swatch.
 * @param props.'aria-label' Accessible name.
 */
export function ColorPicker( {
    value,
    onChange,
    disabled = false,
    className,
    'aria-label': ariaLabel,
}: ColorPickerProps ) {
    return (
        <Popover>
            <PopoverTrigger
                disabled={ disabled }
                aria-label={
                    ariaLabel ??
                    __( 'Choose colour', 'storegrowth-sales-booster' )
                }
                className={ cn(
                    'size-8 shrink-0 cursor-pointer rounded-full border border-[#E9E9E9] p-0 disabled:cursor-not-allowed disabled:opacity-60',
                    className
                ) }
                style={ { backgroundColor: value } }
            />
            <PopoverContent className="w-auto border-none p-0 shadow-none">
                <WpColorPicker
                    color={ value }
                    enableAlpha={ false }
                    onChange={ ( color: string ) =>
                        onChange( color.slice( 0, 7 ).toLowerCase() )
                    }
                />
            </PopoverContent>
        </Popover>
    );
}
